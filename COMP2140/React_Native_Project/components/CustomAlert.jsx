import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * CustomAlert is a reusable modal component that displays customizable alert dialogs.
 * It supports various alert types (success, error, warning, confirm/info) and provides
 * customizable titles, messages, and button actions.
 *
 * Props:
 * - visible (boolean): Controls modal visibility.
 * - title (string): Title text displayed at the top.
 * - message (string): Description or detailed alert message.
 * - type (string): Determines alert style (success, error, warning, confirm).
 * - onCancel (function): Function executed when cancel is pressed (optional).
 * - onConfirm (function): Function executed when confirm/OK is pressed.
 * - cancelText (string): Label for cancel button (default: "Cancel").
 * - confirmText (string): Label for confirm button (default: "OK").
 *
 * Behavior:
 * - The component adapts its color scheme and icon dynamically based on alert type.
 * - If onCancel is not provided, only the confirm button is shown.
 * - Displays a translucent background overlay for focus.
 */
export default function CustomAlert({
  visible,
  title,
  message,
  type = 'confirm',
  onCancel,
  onConfirm,
  cancelText = 'Cancel',
  confirmText = 'OK',
}) {
  /**
   * getIconAndColor determines the alert’s icon, color, and background
   * based on the specified alert type.
   * returns {object} icon, color, bgColor properties
   */
  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: 'checkmark-circle', color: '#10B981', bgColor: '#D1FAE5' };
      case 'error':
        return { icon: 'close-circle', color: '#EF4444', bgColor: '#FEE2E2' };
      case 'warning':
        return { icon: 'alert-circle', color: '#F59E0B', bgColor: '#FEF3C7' };
      default:
        return { icon: 'help-circle', color: '#3B82F6', bgColor: '#DBEAFE' };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon */}
          <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
            <Ionicons name={icon} size={48} color={color} />
          </View>

          {/* Title */}
          <Text style={styles.title}>{title}</Text>

          {/* Message */}
          <Text style={styles.message}>{message}</Text>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {onCancel && (
              <TouchableOpacity
                style={styles.cancelButton}
                activeOpacity={0.8}
                onPress={onCancel}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.confirmButton,
                {
                  backgroundColor:
                    type === 'error'
                      ? '#EF4444'
                      : type === 'success'
                      ? '#10B981'
                      : type === 'warning'
                      ? '#F59E0B'
                      : '#3B82F6',
                  flex: onCancel ? 1 : undefined,
                  minWidth: onCancel ? 0 : '100%',
                },
              ]}
              activeOpacity={0.8}
              onPress={onConfirm}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 24,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
