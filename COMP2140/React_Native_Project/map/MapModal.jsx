import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
* MapModal is a bottom-sheet modal that displays the full details of a selected map record.  
* It presents all stored key-value pairs, including images and geolocation coordinates.
*
* Props:
* - visible (boolean): Controls whether the modal is shown.
* - record (object): The record object containing an ID and its stored values.
* - onClose (function): Callback to close the modal.
*
* Features:
* - Dynamically parses JSON-encoded record values for display.
* - Automatically renders images, text, and coordinates in a structured layout.
* - Uses graceful fallbacks for invalid or non-parsable values.
*/
export default function MapModal({ visible, record, onClose }) {
  
  /**
  * Parses the record’s `values` property safely.
  * Supports both plain objects and stringified JSON.
  */
  if (!record) return null;

  const parsedValues =
    typeof record.values === 'object'
      ? record.values
      : (() => {
          try {
            return JSON.parse(record.values || '{}');
          } catch {
            return {};
          }
        })();

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <ScrollView>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#DC2626" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Record {record.id}</Text>

            {Object.entries(parsedValues).map(([key, value], i) => (
              <View key={i} style={styles.fieldBox}>
                <Text style={styles.fieldKey}>{key}</Text>

                {typeof value === 'string' && value.startsWith('file:///') ? (
                  <Image
                    source={{ uri: value }}
                    style={styles.recordImage}
                    resizeMode="cover"
                    onError={() => console.warn('Invalid image URI', value)}
                  />
                ) : typeof value === 'object' && value.latitude ? (
                  <Text style={styles.fieldValue}>
                    📍 Lat: {value.latitude.toFixed(4)}, Lon:{' '}
                    {value.longitude.toFixed(4)}
                  </Text>
                ) : (
                  <Text style={styles.fieldValue}>{String(value)}</Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '75%',
  },
  closeButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#FEE2E2',
    padding: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  fieldBox: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
  },
  fieldKey: {
    fontWeight: '700',
    color: '#137547',
    marginBottom: 4,
  },
  fieldValue: {
    color: '#374151',
  },
  recordImage: {
    width: '100%',
    height: 160,
    borderRadius: 10,
    marginTop: 6,
  },
});
