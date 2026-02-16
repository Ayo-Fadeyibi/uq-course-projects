import React, { useState, useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Picker } from '@react-native-picker/picker';
import { apiRequest, deleteRecord } from '../../app';
import CustomAlert from '../../components/CustomAlert';
import FilterBuilder from '../../record/Filter'; 

/**
 * Record component displays and manages records associated with different forms.
 * Users can select a form, view its records, apply filters, copy record data,
 * and delete records. It integrates with a dynamic FilterBuilder modal for advanced filtering.
 *
 * Features:
 * - Fetches all available forms and their corresponding records.
 * - Displays record data with type-specific rendering (text, image, or location).
 * - Supports JSON copying to clipboard and record deletion with confirmation.
 * - Allows real-time filtering of records using AND/OR logic through FilterBuilder.
 * - Provides user feedback through alerts and loading indicators.
 */
export default function Record() {
  const [forms, setForms] = useState([]);
  const [selectedFormId, setSelectedFormId] = useState(null);
  const [records, setRecords] = useState([]);
  const [originalRecords, setOriginalRecords] = useState([]);
  const [loadingForms, setLoadingForms] = useState(true);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => setAlertVisible(false),
  });

  const showAlert = (title, message, type = 'info', onConfirm) => {
    setAlertConfig({
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setAlertVisible(false)),
    });
    setAlertVisible(true);
  };

  useFocusEffect(
    useCallback(() => {
      fetchForms();
      if (selectedFormId) fetchRecords(selectedFormId);
    }, [selectedFormId])
  );

  /**
   * fetchForms retrieves all available forms from the database.
   * It sets the forms into local state and updates loading status.
   */
  const fetchForms = async () => {
    try {
      const data = await apiRequest(`/form?select=id,name&order=id.asc`);
      setForms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching forms:', error);
    } finally {
      setLoadingForms(false);
    }
  };

   /**
   * fetchRecords retrieves all records linked to a specific form.
   * @param {number} formId - The ID of the selected form.
   * Updates both `records` and `originalRecords` state arrays for filtering reference.
   */
  const fetchRecords = async (formId) => {
    setLoadingRecords(true);
    try {
      const data = await apiRequest(`/record?form_id=eq.${formId}&order=id.desc`);
      setRecords(Array.isArray(data) ? data : []);
      setOriginalRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching records:', error);
      showAlert('Error', 'Failed to load records.', 'error');
    } finally {
      setLoadingRecords(false);
    }
  };

   /**
   * handleCopy copies a record’s data to the clipboard as formatted JSON.
   * @param {object} record - The record object containing field values.
   * Displays a success alert when copied successfully or an error alert on failure.
   */
  const handleCopy = async (record) => {
    try {
      await Clipboard.setStringAsync(JSON.stringify(record.values, null, 2));
      showAlert('Copied!', 'Record copied to clipboard as JSON.', 'success');
    } catch (error) {
      console.error('Clipboard error:', error);
      showAlert('Error', 'Failed to copy to clipboard.', 'error');
    }
  };

  /**
   * handleDelete prompts the user to confirm record deletion.
   * If confirmed, the record is deleted from the database and removed from the UI.
   * @param {number} recordId - The ID of the record to delete.
   */
  const handleDelete = (recordId) => {
    Alert.alert('Confirm Delete', 'Are you sure you want to delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteRecord(recordId);
            setRecords((prev) => prev.filter((r) => r.id !== recordId));
            setOriginalRecords((prev) => prev.filter((r) => r.id !== recordId));
            showAlert('Deleted', 'Record removed successfully.', 'success');
          } catch (error) {
            console.error('Error deleting record:', error);
            showAlert('Error', 'Failed to delete record.', 'error');
          }
        },
      },
    ]);
  };

   /**
   * parseValues safely parses a record’s stored JSON values.
   * Returns an object if parsing succeeds or an empty object otherwise.
   * @param {string|object} val - JSON string or already parsed object.
   */
  const parseValues = (val) => {
    if (typeof val === 'object') return val;
    try {
      return JSON.parse(val);
    } catch {
      return {};
    }
  };

   /**
   * applyFilter filters the record list based on user-defined criteria and logic.
   * @param {Array} criteria - List of filter conditions (field, operator, value).
   * @param {string} logic - Logical operator ("AND" or "OR") connecting filters.
   * Filters are applied on `originalRecords` and results stored in `records`.
   */
  const applyFilter = (criteria, logic) => {
    if (!criteria.length) {
      setRecords(originalRecords);
      return;
    }

    const filtered = originalRecords.filter((record) => {
      return criteria[logic === 'AND' ? 'every' : 'some']((c) => {
        const val = record.values[c.field];
        if (val == null) return false;

        const strVal = String(val).toLowerCase();
        const input = String(c.value).toLowerCase();

        if (!isNaN(val) && !isNaN(c.value)) {
          const numVal = parseFloat(val);
          const numInput = parseFloat(c.value);
          switch (c.operator) {
            case 'equals': return numVal === numInput;
            case 'greater': return numVal > numInput;
            case 'less': return numVal < numInput;
            case 'greaterOrEqual': return numVal >= numInput;
            case 'lessOrEqual': return numVal <= numInput;
            default: return false;
          }
        }

        switch (c.operator) {
          case 'equals': return strVal === input;
          case 'contains': return strVal.includes(input);
          case 'startswith': return strVal.startsWith(input);
          default: return false;
        }
      });
    });
    setRecords(filtered);
  };

  if (loadingForms) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#137547" />
        <Text style={styles.loadingText}>Loading forms...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>View Records</Text>
        <Text style={styles.subtitle}>Select a form to view its records</Text>

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

        {/* Filter Button */}
        {records.length > 0 && (
          <TouchableOpacity
            onPress={() => setFilterVisible(true)}
            style={styles.filterButton}
          >
            <Ionicons name="search-outline" size={20} color="#137547" />
            <Text style={styles.filterText}>Open Filter Builder</Text>
          </TouchableOpacity>
        )}

        {/* Records Display */}
        {selectedFormId && (
          <>
            {loadingRecords ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#137547" />
                <Text style={styles.loadingText}>Loading records...</Text>
              </View>
            ) : records.length === 0 ? (
              <View style={styles.noRecordBox}>
                <Ionicons name="document-outline" size={28} color="#9CA3AF" />
                <Text style={styles.noRecordText}>No records found for this form.</Text>
              </View>
            ) : (
              records.map((record) => {
                const safeValues = parseValues(record.values);
                return (
                  <View key={record.id} style={styles.recordCard}>
                    <View style={styles.recordHeader}>
                      <Ionicons name="document-text-outline" size={22} color="#137547" />
                      <Text style={styles.recordId}>Record {record.id}</Text>
                    </View>

                    {Object.entries(safeValues).map(([key, value], index) => (
                      <View key={index} style={styles.fieldRow}>
                        <Text style={styles.fieldKey}>{key}:</Text>
                        {typeof value === 'string' && value.startsWith('file:///') ? (
                          <Image source={{ uri: value }} style={styles.imagePreview} />
                        ) : typeof value === 'object' && value?.latitude ? (
                          <Text style={styles.fieldValue}>
                            📍 Lat: {value.latitude.toFixed(4)} | Lon: {value.longitude.toFixed(4)}
                          </Text>
                        ) : (
                          <Text style={styles.fieldValue}>
                            {typeof value === 'object'
                              ? JSON.stringify(value, null, 2)
                              : String(value)}
                          </Text>
                        )}
                      </View>
                    ))}

                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#E0F2FE' }]}
                        onPress={() => handleCopy(record)}
                      >
                        <Ionicons name="copy-outline" size={18} color="#0284C7" />
                        <Text style={[styles.actionText, { color: '#0284C7' }]}>Copy JSON</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: '#FEE2E2' }]}
                        onPress={() => handleDelete(record.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color="#DC2626" />
                        <Text style={[styles.actionText, { color: '#DC2626' }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </View>

      {/* Filter Modal */}
      <FilterBuilder
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        fields={
          records.length > 0
            ? Object.keys(records[0].values).map((k) => ({
                name: k,
                type: isNaN(records[0].values[k]) ? 'text' : 'number',
              }))
            : []
        }
        onApply={applyFilter}
      />

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  content: { padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6B7280', marginTop: 4, marginBottom: 14 },
  pickerContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 20,
  },
  picker: { height: 50 },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7EF',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  filterText: { marginLeft: 6, color: '#137547', fontWeight: '600' },
  recordCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recordHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  recordId: { fontSize: 16, fontWeight: '600', color: '#111827', marginLeft: 8 },
  fieldRow: { marginVertical: 4 },
  fieldKey: { fontWeight: '600', color: '#374151' },
  fieldValue: {
    backgroundColor: '#F9FAFB',
    padding: 6,
    borderRadius: 6,
    marginTop: 2,
    color: '#111827',
  },
  imagePreview: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginTop: 8,
    backgroundColor: '#E5E7EB',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  actionText: { fontSize: 14, fontWeight: '600', marginLeft: 6 },
  noRecordBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  noRecordText: { color: '#6B7280', fontSize: 15, marginTop: 8 },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30 },
  loadingText: { color: '#6B7280', marginTop: 6 },
});
