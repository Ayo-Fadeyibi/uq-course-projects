import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiRequest, updateForm } from '../app';
import CustomAlert from '../components/CustomAlert';

/**
 * EditFormModal is a modal component that allows users to edit an existing form's
 * name and description. It provides functionality for fetching form details,
 * updating form data via the API, and displaying success or error alerts.
 *
 * Props:
 * - visible (boolean): Controls the visibility of the modal.
 * - onClose (function): Callback to close the modal.
 * - form (object): The form object containing id, name, and description.
 * - onFormUpdated (function): Callback to notify the parent component after a successful update.
 *
 * Features:
 * - Fetches current form data when the modal opens.
 * - Validates input fields before saving.
 * - Updates the form using the RESTful API endpoint.
 * - Displays loading indicators and alert messages for success or error.
 * - Passes updated form details back to the parent for UI refresh.
 */
export default function EditFormModal({ visible, onClose, form, onFormUpdated }) {
  const { id, name: initialName, description: initialDesc } = form || {};

  const [formData, setFormData] = useState({
    name: initialName || '',
    description: initialDesc || '',
  });

  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'info',
    onConfirm: () => setAlertVisible(false),
  });

  /**
   * showAlert displays a reusable alert with customizable title, message, and type.
   * @param {string} title - The alert title.
   * @param {string} message - The alert message body.
   * @param {string} type - The alert type (info, success, error, warning).
   * @param {function} onConfirm - Optional callback for confirmation action.
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

  // Fetch the selected form's details whenever the modal opens or the form changes
  useEffect(() => {
    if (visible && id) {
      fetchFormDetails();
    } else if (!visible) {
      // Reset form when modal closes
      setFormData({ name: '', description: '' });
    }
  }, [visible, id]);

  /**
  * fetchFormDetails retrieves the form data from the API by its ID
  * and populates the input fields with current values.
  */
  const fetchFormDetails = async () => {
    setLoading(true);
    try {
      const [formRes] = await apiRequest(`/form?id=eq.${id}&select=*`);
      if (formRes) {
        setFormData({
          name: formRes.name,
          description: formRes.description || '',
        });
      }
    } catch (error) {
      console.error('Error fetching form details:', error);
      showAlert('Error', 'Failed to load form details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  /**
  * handleSave validates and updates the form data using the API.
  * - Validates that the form name is not empty.
  * - Sends update request via updateForm().
  * - Displays alerts for success or failure.
  * - Passes updated form data back to parent via onFormUpdated().
  */
  const handleSave = async () => {
    if (!formData.name?.trim()) {
      showAlert('Validation Error', 'Form name is required.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await updateForm(id, {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
      });

      // Always pass a safe updated form object
      showAlert('Success', 'Form updated successfully!', 'success', () => {
        setAlertVisible(false);

        if (typeof onFormUpdated === 'function') {
          onFormUpdated({
            id: id || form?.id, // ensure ID fallback
            name: formData.name?.trim() || '',
            description: formData.description?.trim() || '',
          });
        }

        onClose?.();
      });
    } catch (error) {
      console.error('Error updating form:', error);
      showAlert('Error', 'Failed to update form.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal animationType="slide" visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={26} color="#333" />
        </TouchableOpacity>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#137547" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.title}>Edit Form</Text>

            <Text style={styles.label}>Form Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter form name"
              placeholderTextColor="#9CA3AF"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 90 }]}
              multiline
              textAlignVertical="top"
              placeholder="Enter description"
              placeholderTextColor="#9CA3AF"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
            />

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>

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
  modalContainer: { flex: 1, backgroundColor: '#F9FAFB', padding: 16 },
  closeButton: { alignSelf: 'flex-end' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { paddingBottom: 30 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 16 },
  label: { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    marginBottom: 14,
  },
  saveButton: {
    backgroundColor: '#137547',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    shadowColor: '#137547',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  saveText: { color: '#fff', fontWeight: '600', fontSize: 16, marginLeft: 6 },
});
