import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Picker } from '@react-native-picker/picker';
import { apiRequest, insertRecord } from '../app';
import CustomAlert from '../components/CustomAlert';
import Field from './Field';

/**
* ViewFormModal is a modal component that displays an existing form, 
* allows users to view and manage its fields, and add new records dynamically. 
* It integrates field management, data entry, image upload, and location capture 
* in one interface.
*
* Props:
* - visible (boolean): Controls modal visibility.
* - onClose (function): Callback to close the modal.
* - form (object): The form object containing id, name, and description.
*
* Features:
* - Fetches all fields belonging to the selected form.
* - Dynamically renders form inputs based on field types.
* - Supports adding images, locations, dropdowns, and multiline text.
* - Validates user input before saving new records.
* - Integrates with Field component to add new fields.
* - Displays success or error alerts via CustomAlert.
*/
export default function ViewFormModal({ visible, onClose, form }) {
  const { id, name, description } = form || {};

  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]);
  const [formValues, setFormValues] = useState({});
  const [fieldModalVisible, setFieldModalVisible] = useState(false);

  // Alert state
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => setAlertVisible(false),
  });

  /**
  * showAlert displays a CustomAlert with a specified title, message, and type.
  */
  const showAlert = (title, message, type = 'info', onConfirm) => {
    setAlertConfig({
      title,
      message,
      type,
      onConfirm: onConfirm || (() => setAlertVisible(false)),
    });
    setAlertVisible(true);
  };

  /**
  * useEffect runs whenever modal visibility or form ID changes.
  * Fetches form fields from the API when modal is opened.
  */
  useEffect(() => {
    if (visible && id) fetchFields();
  }, [visible, id]);

  /**
  * fetchFields retrieves all fields for the current form from the backend,
  * ordered by `order_index`.
  */
  const fetchFields = async () => {
    try {
      const data = await apiRequest(`/field?form_id=eq.${id}&order=order_index.asc`);
      setFields(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching fields:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
  * handleChange updates the local formValues object as users fill out the fields.
  */
  const handleChange = (key, value) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  }

  /**
  * handleImagePick opens the image picker for image-type fields
  * and saves the selected image URI into formValues.
  */
  const handleImagePick = async (fieldName) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission Denied', 'Media permission is required.', 'error');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      handleChange(fieldName, result.assets[0].uri);
    }
  };

  /**
  * handleGetLocation requests the user’s location and stores 
  * latitude and longitude coordinates for location-type fields.
  */
  const handleGetLocation = async (fieldName) => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission Denied', 'Location permission is required.', 'error');
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    handleChange(fieldName, {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    });
  };

  /**
   * handleAddRecord validates the user’s inputs and inserts a new record 
   * linked to the current form.
   */
  const handleAddRecord = async () => {
    for (const field of fields) {
      const value = formValues[field.name];

      if (field.required && (value === undefined || value === '')) {
        showAlert('Validation Error', `${field.name} is required.`, 'warning');
        return;
      }

      if (field.is_num && isNaN(value)) {
        showAlert('Validation Error', `${field.name} must be numeric.`, 'warning');
        return;
      }
    }

    const newRecord = { form_id: id, values: formValues };

    try {
      await insertRecord(id, newRecord);
      showAlert('Success', 'Record saved successfully!', 'success', () => {
        setFormValues({});
        setAlertVisible(false);
      });
    } catch (error) {
      console.error('Error adding record:', error);
      showAlert('Error', 'Failed to save record.', 'error');
    }
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={26} color="#333" />
        </TouchableOpacity>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#137547" />
            <Text style={styles.loadingText}>Loading form...</Text>
          </View>
        ) : (
          <ScrollView style={styles.container}>
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.headerCard}>
                <Text style={styles.formTitle}>Form - {name || 'Untitled Form'}</Text>
                <Text style={styles.formDescription}>
                  {description || 'No description provided'}
                </Text>
              </View>

              {/* Manage Fields */}
              <View style={styles.manageCard}>
                <View style={styles.manageHeader}>
                  <View style={styles.iconContainer}>
                    <Ionicons name="construct-outline" size={22} color="#137547" />
                  </View>
                  <View>
                    <Text style={styles.manageTitle}>Manage Fields</Text>
                    <Text style={styles.manageSubtitle}>
                      Customize how your form collects data
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.addFieldButton}
                  onPress={() => setFieldModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="add-circle-outline" size={22} color="white" />
                  <Text style={styles.addFieldButtonText}>Add New Field</Text>
                </TouchableOpacity>
              </View>

              {/* Add Record */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Add Record</Text>

                {fields.length === 0 ? (
                  <Text style={styles.noFieldText}>No fields added yet.</Text>
                ) : (
                  fields.map((field) => (
                    <View key={field.id} style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>
                        {field.name}
                        {field.required && <Text style={styles.required}> *</Text>}
                      </Text>

                      {/* Text / Number */}
                      {field.field_type === 'text' || field.field_type === 'number' ? (
                        <TextInput
                          style={[styles.input, { minHeight: 60 }]}
                          placeholder={`Enter ${field.name}`}
                          keyboardType={field.is_num ? 'numeric' : 'default'}
                          value={formValues[field.name] || ''}
                          onChangeText={(text) => handleChange(field.name, text)}
                          multiline
                          textAlignVertical="top"
                        />
                      ) : field.field_type === 'textarea' ? (
                        <TextInput
                          style={[styles.input, { height: 120 }]}
                          multiline
                          textAlignVertical="top"
                          placeholder={`Enter ${field.name}`}
                          value={formValues[field.name] || ''}
                          onChangeText={(text) => handleChange(field.name, text)}
                        />
                      ) : field.field_type === 'dropdown' ? (
                        <View style={styles.pickerContainer}>
                          <Picker
                            selectedValue={formValues[field.name] || ''}
                            onValueChange={(value) => handleChange(field.name, value)}
                            style={styles.picker}
                          >
                            <Picker.Item label={`Select ${field.name}...`} value="" />
                            {Array.isArray(field.options) &&
                              field.options.map((option, idx) => (
                                <Picker.Item key={idx} label={option} value={option} />
                              ))}
                          </Picker>
                        </View>
                      ) : field.field_type === 'location' ? (
                        <>
                          <TouchableOpacity
                            style={styles.locationButton}
                            onPress={() => handleGetLocation(field.name)}
                          >
                            <Ionicons name="location-outline" size={18} color="#137547" />
                            <Text style={styles.locationText}>Get Location</Text>
                          </TouchableOpacity>
                          {formValues[field.name] && (
                            <Text style={styles.locationCoords}>
                              📍 Lat: {formValues[field.name].latitude.toFixed(4)} | Lon:{' '}
                              {formValues[field.name].longitude.toFixed(4)}
                            </Text>
                          )}
                        </>
                      ) : field.field_type === 'image' ? (
                        <>
                          <TouchableOpacity
                            style={styles.imageButton}
                            onPress={() => handleImagePick(field.name)}
                          >
                            <Ionicons name="image-outline" size={18} color="#137547" />
                            <Text style={styles.locationText}>Pick Image</Text>
                          </TouchableOpacity>
                          {formValues[field.name] && (
                            <Image
                              source={{ uri: formValues[field.name] }}
                              style={styles.imagePreview}
                            />
                          )}
                        </>
                      ) : null}
                    </View>
                  ))
                )}
              </View>

              {/* Save Record */}
              <TouchableOpacity
                style={styles.addRecordButton}
                onPress={handleAddRecord}
                activeOpacity={0.8}
              >
                <Text style={styles.addRecordText}>Save Record</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>

      {/* Field Modal */}
      <Field
        visible={fieldModalVisible}
        onClose={() => setFieldModalVisible(false)}
        formId={id}
        onFieldAdded={fetchFields}
      />

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={alertConfig.onConfirm}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#F3F4F6', padding: 10 },
  closeButton: { alignSelf: 'flex-end', padding: 8 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#6B7280', marginTop: 8 },
  content: { padding: 10 },
  headerCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  formTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 6 },
  formDescription: { fontSize: 15, color: '#6B7280' },
  manageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  manageHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  iconContainer: { backgroundColor: '#E6F7EF', padding: 10, borderRadius: 10, marginRight: 10 },
  manageTitle: { fontSize: 17, fontWeight: '700', color: '#111827' },
  manageSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  addFieldButton: {
    backgroundColor: '#137547',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
  },
  addFieldButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 6 },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#111827', marginBottom: 12 },
  inputGroup: { marginBottom: 18 },
  inputLabel: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 6 },
  required: { color: '#DC2626' },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: { height: 50, color: '#111827' },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#137547',
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    backgroundColor: '#E6F7EF',
  },
  locationText: { color: '#137547', fontWeight: '600', marginLeft: 6 },
  locationCoords: { marginTop: 8, fontSize: 13, color: '#374151' },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#137547',
    borderRadius: 8,
    paddingVertical: 10,
    justifyContent: 'center',
    backgroundColor: '#E6F7EF',
  },
  imagePreview: { width: '100%', height: 150, marginTop: 10, borderRadius: 8 },
  addRecordButton: {
    backgroundColor: '#137547',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  addRecordText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF', marginLeft: 8 },
  noFieldText: { textAlign: 'center', color: '#6B7280', marginTop: 20, fontSize: 15 },
});
