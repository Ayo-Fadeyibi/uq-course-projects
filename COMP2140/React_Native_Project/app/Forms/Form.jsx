import React, { useState, useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { apiRequest, deleteForm } from '../../app';
import CustomAlert from '../../components/CustomAlert';
import ViewFormModal from '../../FormPages/ViewForm';
import EditFormModal from '../../FormPages/EditForm';
import NewFormModal from '../../FormPages/NewForm';

/**
 * Form component serves as the main page for managing user-created forms.
 * It allows users to view, edit, delete, and create new forms.
 *
 * Functionality:
 * - Fetches all forms from the database using `apiRequest('/form')`
 * - Displays the forms in a scrollable FlatList with name and description
 * - Allows users to:
 *    • View form details in a modal (`ViewFormModal`)
 *    • Edit form information (`EditFormModal`)
 *    • Delete forms with confirmation (`CustomAlert`)
 *    • Add a new form (`NewFormModal`)
 * - Updates the list instantly after edits or deletions for better UX
 */
export default function Form() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState(null);
  const [viewVisible, setViewVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [newFormVisible, setNewFormVisible] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    type: 'confirm',
    onConfirm: () => {},
  });

  // ------------------- FETCH FORMS -------------------
  useFocusEffect(
    useCallback(() => {
      fetchForms();
    }, [])
  );

  const fetchForms = async () => {
    try {
      const data = await apiRequest('/form');
      if (Array.isArray(data)) {
        setForms(data);
      } else if (data && typeof data === 'object' && Object.keys(data).length > 0) {
        setForms([data]);
      } else {
        setForms([]);
      }
    } catch (error) {
      console.error('Error fetching forms:', error);
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  // ------------------- DELETE FORM -------------------
  const handleDelete = (item) => {
    setAlertConfig({
      title: 'Delete Form',
      message: `Are you sure you want to delete "${item.name}"?`,
      type: 'warning',
      onConfirm: async () => {
        setAlertVisible(false);
        try {
          await deleteForm(Number(item.id));
          setForms((prev) => prev.filter((f) => f.id !== item.id));

          setAlertConfig({
            title: 'Success',
            message: 'Form deleted successfully',
            type: 'success',
            onConfirm: () => setAlertVisible(false),
          });
          setAlertVisible(true);
        } catch (error) {
          console.error('Error deleting form:', error);
          setAlertConfig({
            title: 'Error',
            message: 'Failed to delete form',
            type: 'error',
            onConfirm: () => setAlertVisible(false),
          });
          setAlertVisible(true);
        }
      },
    });
    setAlertVisible(true);
  };

  // ------------------- EDIT & VIEW -------------------
  const handleView = (item) => {
    setSelectedForm(item);
    setViewVisible(true);
  };

  const handleEdit = (item) => {
    setSelectedForm(item);
    setEditVisible(true);
  };

  // ------------------- INSTANT UI UPDATE AFTER EDIT -------------------
  const handleFormUpdated = (updatedForm) => {
    if (!updatedForm || !updatedForm.id) return; 
    setForms((prevForms) =>
      prevForms.map((form) =>
        form.id === updatedForm.id ? { ...form, ...updatedForm } : form
      )
    );
  };

  // ------------------- RENDER -------------------
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading forms...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={forms}
        keyExtractor={(item) => item.id?.toString() || item.name}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item }) => (
          <View style={styles.formCard}>
            <View style={styles.formDetails}>
              <Text style={styles.formTitle}>{item.name}</Text>
              <Text style={styles.formDescription}>
                {item.description || 'No description'}
              </Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                activeOpacity={0.8}
                onPress={() => handleEdit(item)}
              >
                <Ionicons name="create-outline" size={18} color="white" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.viewButton]}
                activeOpacity={0.8}
                onPress={() => handleView(item)}
              >
                <Ionicons name="eye-outline" size={18} color="white" />
                <Text style={styles.actionText}>View</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                activeOpacity={0.8}
                onPress={() => handleDelete(item)}
              >
                <Ionicons name="trash-outline" size={18} color="white" />
                <Text style={styles.actionText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No forms available.</Text>}
      />

      {/* Floating Add Button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.9}
        onPress={() => setNewFormVisible(true)}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* ---------- Modals ---------- */}
      <ViewFormModal
        visible={viewVisible}
        onClose={() => setViewVisible(false)}
        form={selectedForm}
      />
      <EditFormModal
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        form={selectedForm}
        onFormUpdated={handleFormUpdated} 
      />
      <NewFormModal
        visible={newFormVisible}
        onClose={() => setNewFormVisible(false)}
        onFormCreated={fetchForms}
      />

      {/* ---------- Custom Alert ---------- */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onCancel={
          alertConfig.type === 'confirm' || alertConfig.type === 'warning'
            ? () => setAlertVisible(false)
            : undefined
        }
        onConfirm={alertConfig.onConfirm}
        confirmText={alertConfig.type === 'warning' ? 'Delete' : 'OK'}
      />
    </View>
  );
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 16,
  },
  listContainer: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#555',
  },
  formCard: {
    backgroundColor: '#f3f4f6',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    elevation: 8,
    borderWidth: 0.8,
    borderColor: 'black',
  },
  formDetails: {
    marginBottom: 12,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#137547',
    marginBottom: 4,
  },
  formDescription: {
    fontSize: 14,
    color: '#555',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editButton: {
    backgroundColor: 'blue',
  },
  viewButton: {
    backgroundColor: '#137547',
  },
  deleteButton: {
    backgroundColor: '#DC2626',
  },
  actionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 40,
    fontSize: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 28,
    right: 24,
    backgroundColor: '#137547',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
  },
});
