import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { insertField } from '../app';
import CustomAlert from '../components/CustomAlert';

/**
 * Field component allows users to add a new field to a form dynamically.
 * It supports multiple field types (text, textarea, number, dropdown, image, location)
 * and includes validation, user feedback, and API integration for saving fields.
 *
 * Props:
 * - visible (boolean): Controls visibility of the modal.
 * - onClose (function): Callback to close the modal.
 * - formId (number): ID of the form to which the field will be added.
 * - onFieldAdded (function): Callback executed after successfully adding a field.
 *
 * Features:
 * - Validates user input before saving.
 * - Supports dropdown options via comma-separated input.
 * - Displays a spinner during save operations.
 * - Uses CustomAlert for success, warning, and error messages.
 */
export default function Field({ visible, onClose, formId, onFieldAdded }) {
  if (typeof onClose !== 'function') onClose = () => {};

  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [isRequired, setIsRequired] = useState(false);
  const [isNumeric, setIsNumeric] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState('');
  const [saving, setSaving] = useState(false);

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => setAlertVisible(false),
  });

  /**
   * showAlert displays a CustomAlert with the given configuration.
   * @param {string} title - Alert title
   * @param {string} message - Message body
   * @param {string} type - Type of alert (info, success, error, warning)
   * @param {function} onConfirm - Optional confirm callback
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
  * handleSaveField validates inputs and saves a new field to the backend.
  */
  const handleSaveField = async () => {
    if (!fieldName.trim()) {
      showAlert('Validation Error', 'Field name is required.', 'warning');
      return;
    }

    const newField = {
      form_id: formId,
      name: fieldName.trim(),
      field_type: fieldType,
      required: isRequired,
      is_num: isNumeric,
      order_index: 0,
      options: {},
    };

    // Handle dropdown-specific validation and parsing
    if (fieldType === 'dropdown') {
      if (!dropdownOptions.trim()) {
        showAlert('Missing Options', 'Please enter dropdown options.', 'warning');
        return;
      }

      const optionArray = dropdownOptions
        .split(',')
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      newField.options = optionArray;
    }

    // Save to API
    setSaving(true);
    try {
      await insertField(formId, newField);
      showAlert('Success', 'Field added successfully.', 'success', () => {
        setAlertVisible(false);
        resetForm();
        onClose?.();
        onFieldAdded?.();
      });
    } catch (error) {
      console.error('Error adding field:', error);
      showAlert('Error', 'Failed to save field.', 'error');
    } finally {
      setSaving(false);
    }
  };

  /**
  * resetForm resets all form inputs to their default values.
  */
  const resetForm = () => {
    setFieldName('');
    setFieldType('text');
    setIsRequired(false);
    setIsNumeric(false);
    setDropdownOptions('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <Text style={styles.title}>Add a Field</Text>

            <TextInput
              style={styles.input}
              placeholder="Field name"
              placeholderTextColor="#9CA3AF"
              value={fieldName}
              onChangeText={setFieldName}
            />

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={fieldType}
                onValueChange={setFieldType}
                style={styles.picker}
              >
                <Picker.Item label="Single Line Text" value="text" />
                <Picker.Item label="Multi Line Text" value="textarea" />
                <Picker.Item label="Number" value="number" />
                <Picker.Item label="Dropdown" value="dropdown" />
                <Picker.Item label="Location" value="location" />
                <Picker.Item label="Image" value="image" />
              </Picker>
            </View>

            {fieldType === 'dropdown' && (
              <TextInput
                style={styles.input}
                placeholder="Comma-separated options (e.g. Red, Blue, Green)"
                placeholderTextColor="#9CA3AF"
                value={dropdownOptions}
                onChangeText={setDropdownOptions}
              />
            )}

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Required</Text>
              <Switch
                value={isRequired}
                onValueChange={setIsRequired}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={isRequired ? '#3B82F6' : '#F3F4F6'}
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Is Numeric</Text>
              <Switch
                value={isNumeric}
                onValueChange={setIsNumeric}
                trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
                thumbColor={isNumeric ? '#3B82F6' : '#F3F4F6'}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.disabled]}
              onPress={handleSaveField}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Ionicons name="bookmark-outline" size={20} color="white" />
              )}
              <Text style={styles.saveText}>
                {saving ? 'Saving...' : 'Save Field'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>

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
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '88%',
  },
  cancelButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  cancelText: { color: '#DC2626', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 16 },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 16,
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginBottom: 16,
  },
  picker: { height: 50 },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  switchLabel: { fontSize: 16, color: '#374151' },
  saveButton: {
    backgroundColor: '#137547',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
  },
  disabled: { backgroundColor: '#9CA3AF' },
  saveText: { color: '#fff', fontWeight: '600', fontSize: 16, marginLeft: 8 },
});
