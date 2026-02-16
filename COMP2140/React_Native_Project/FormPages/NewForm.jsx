import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createNewForm } from '../app';
import CustomAlert from '../components/CustomAlert';

/**
* NewFormModal is a modal component that allows users to create a new form.
* It provides validation for inputs, displays feedback via alerts, and calls an API
* to persist the new form to the backend.
* 
* Props:
* - visible (boolean): Controls the visibility of the modal.
* - onClose (function): Callback to close the modal.
* - onFormCreated (function): Callback triggered when a new form is successfully created.
*
* Features:
* - Validates both form name and description before saving.
* - Shows a loading indicator during API requests.
* - Uses CustomAlert for error, success, and warning messages.
* - Automatically resets form inputs after successful creation.
*/
export default function NewFormModal({ visible, onClose, onFormCreated }) {
  const [formName, setFormName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  // Custom alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'confirm',
    onConfirm: () => setAlertVisible(false),
  });

  /**
  * resetForm clears the form input fields back to their default states.
  */
  const resetForm = () => {
    setFormName('');
    setDescription('');
  };

  /**
  * handleSave validates input fields, triggers API call to create a new form,
  * and shows alerts for success or failure.
  */
  const handleSave = async () => {
    if (!formName.trim()) {
      setAlertConfig({
        title: 'Validation Error',
        message: 'Form name is required.',
        type: 'warning',
        onConfirm: () => setAlertVisible(false),
      });
      setAlertVisible(true);
      return;
    }

    if (!description.trim()) {
      setAlertConfig({
        title: 'Validation Error',
        message: 'Description is required.',
        type: 'warning',
        onConfirm: () => setAlertVisible(false),
      });
      setAlertVisible(true);
      return;
    }

    setLoading(true);

    try {
      const result = await createNewForm(formName.trim(), description.trim());
     
      setAlertConfig({
        title: 'Success',
        message: 'Form created successfully!',
        type: 'success',
        onConfirm: () => {
          setAlertVisible(false);
          resetForm();
          onClose();
          if (onFormCreated) onFormCreated(result);
        },
      });
      setAlertVisible(true);
    } catch (error) {
      console.error('Error creating form:', error);
      setAlertConfig({
        title: 'Error',
        message: 'Failed to create form. Please try again.',
        type: 'error',
        onConfirm: () => setAlertVisible(false),
      });
      setAlertVisible(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
      transparent={false}
    >
      <View style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={26} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Form</Text>
        </View>

        {/* Form Body */}
        <View style={styles.body}>
          <TextInput
            style={styles.input}
            placeholder="Form name"
            placeholderTextColor="#9CA3AF"
            value={formName}
            onChangeText={setFormName}
            editable={!loading}
          />

          <TextInput
            style={[styles.input, { height: 100 }]}
            placeholder="Description"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            editable={!loading}
            multiline
          />

          <TouchableOpacity
            style={[styles.saveButton, loading && { backgroundColor: '#9CA3AF' }]}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? (
              <>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.savingText}>Saving...</Text>
              </>
            ) : (
              <>
                <Text style={styles.saveText}>Save Form</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Custom Alert */}
        <CustomAlert
          visible={alertVisible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onConfirm={alertConfig.onConfirm}
          onCancel={
            alertConfig.type === 'confirm' || alertConfig.type === 'warning'
              ? () => setAlertVisible(false)
              : undefined
          }
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: '#fff', padding: 16 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginLeft: 10,
  },
  body: { flex: 1, justifyContent: 'center' },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
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
  },
  saveText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  savingText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
});
