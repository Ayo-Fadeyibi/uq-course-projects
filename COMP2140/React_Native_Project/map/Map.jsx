import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import MapView, { Marker } from 'react-native-maps';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest } from '../app';
import MapModal from './MapModal';

/**
* Map component displays form-based location data on an interactive map.
* Users can select a form, view its location-enabled records, and tap on markers
* to view details. Duplicate markers are intelligently offset to improve visibility.
*
* Features:
* - Fetches available forms and displays them in a Picker.
* - Retrieves and parses location records from the selected form.
* - Automatically fits map to markers.
* - Handles duplicate coordinates with slight offsets.
* - Opens MapModal when a marker is pressed to display record details.
*
* Hooks:
* - useFocusEffect: Refreshes forms whenever the screen is focused.
* - useEffect: Fetches records whenever a form is selected.
*/
export default function Map() {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const mapRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      fetchForms();
    }, [])
  );

  useEffect(() => {
    if (selectedFormId) fetchRecords(selectedFormId);
  }, [selectedFormId]);

  /**
  * Fetches all forms (id + name) from the API.
  */
  const fetchForms = async () => {
    try {
      const data = await apiRequest('/form?select=id,name');
      setForms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
  * Fetches records for a given form ID, filters those with valid location data,
  * and adjusts markers with duplicate coordinates slightly apart for better display.
  */
  const fetchRecords = async (formId) => {
    setLoadingRecords(true);
    try {
      const data = await apiRequest(`/record?form_id=eq.${formId}`);
      const safeRecords = (Array.isArray(data) ? data : []).filter((rec) => {
        const values = parseValues(rec.values);
        return Object.values(values).some(
          (v) => v && typeof v === 'object' && v.latitude && v.longitude
        );
      });

      // Slightly offset duplicate coordinates
      const uniqueMarkers = [];
      const adjustedRecords = safeRecords.map((rec) => {
        const values = parseValues(rec.values);
        const loc = Object.values(values).find(
          (v) => v && v.latitude && v.longitude
        );
        if (!loc) return null;

        let lat = Number(loc.latitude);
        let lon = Number(loc.longitude);

        // Detect duplicates and offset them
        const duplicates = uniqueMarkers.filter(
          (p) =>
            Math.abs(p.lat - lat) < 0.00001 &&
            Math.abs(p.lon - lon) < 0.00001
        );
        const duplicateCount = duplicates.length;

        if (duplicateCount > 0) {
          // Offset about 10–20 meters
          const offset = duplicateCount * 0.0001;
          lat += offset;
          lon += offset;
        }

        uniqueMarkers.push({ lat, lon });
        return { ...rec, adjustedLat: lat, adjustedLon: lon };
      }).filter(Boolean);

      setRecords(adjustedRecords);

      // Fit map to all markers
      if (adjustedRecords.length > 0 && mapRef.current) {
        const coords = adjustedRecords.map((r) => ({
          latitude: r.adjustedLat,
          longitude: r.adjustedLon,
        }));

        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 80, right: 80, bottom: 80, left: 80 },
          animated: true,
        });
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoadingRecords(false);
    }
  };

  /**
  * Safely parses JSON-like values that may have been stringified multiple times.
  */
  const parseValues = (values) => {
    try {
      const parsed =
        typeof values === 'string' ? JSON.parse(values) : values;
      return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
    } catch {
      return {};
    }
  };

  /**
  * Handles when a marker is tapped: sets the selected record and opens MapModal.
  */
  const handleMarkerPress = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#137547" />
        <Text style={styles.loadingText}>Loading forms...</Text>
      </View>
    );
  }

  /**
  * Default map region (Brisbane)
  */
  const getInitialRegion = () => ({
    latitude: -27.4698, // Default Brisbane
    longitude: 153.0251,
    latitudeDelta: 1,
    longitudeDelta: 1,
  });

  return (
    <View style={styles.container}>
      {/* Form Picker */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedFormId}
          onValueChange={(value) => setSelectedFormId(value)}
          style={styles.picker}
        >
          <Picker.Item label="Select a form..." value={null} />
          {forms.map((form) => (
            <Picker.Item key={form.id} label={form.name} value={form.id} />
          ))}
        </Picker>
      </View>

      {/* Map */}
      {loadingRecords ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#137547" />
          <Text style={styles.loadingText}>Loading records...</Text>
        </View>
      ) : records.length === 0 ? (
        <View style={styles.noData}>
          <Ionicons name="map-outline" size={26} color="#9CA3AF" />
          <Text style={styles.noDataText}>No location data available.</Text>
        </View>
      ) : (
        <MapView ref={mapRef} style={styles.map} initialRegion={getInitialRegion()}>
          {records.map((record) => (
            <Marker
              key={`${record.id}-${record.adjustedLat}-${record.adjustedLon}`} // unique key
              coordinate={{
                latitude: record.adjustedLat,
                longitude: record.adjustedLon,
              }}
              title={`Record ${record.id}`}
              description={record.username || 'No username'}
              pinColor="red"
              onPress={() => handleMarkerPress(record)}
            />
          ))}
        </MapView>
      )}

      {/* Modal */}
      <MapModal
        visible={showModal}
        record={selectedRecord}
        onClose={() => setShowModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    margin: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  picker: { height: 50 },
  map: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#6B7280', marginTop: 6 },
  noData: { alignItems: 'center', justifyContent: 'center', flex: 1 },
  noDataText: { color: '#6B7280', fontSize: 15, marginTop: 8 },
});
