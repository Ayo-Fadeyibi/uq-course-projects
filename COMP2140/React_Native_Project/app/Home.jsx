import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import NewFormModal from '../FormPages/NewForm';

/**
 * Home component serves as the app’s landing screen.
 * It uses smooth animations to introduce the FormBase logo, title, and subtitle.
 * The page provides a “Create New Form” button that opens a modal for creating forms.
 */
export default function Home() {
  const [newFormVisible, setNewFormVisible] = useState(false);

  // Animation values
  const logoScale = useSharedValue(0);
  const titleTranslateY = useSharedValue(50);
  const subtitleTranslateY = useSharedValue(50);

   /**
   * useEffect triggers entrance animations sequentially when the screen mounts.
   * The logo expands first, followed by title and subtitle sliding upward with delays.
   */
  useEffect(() => {
    logoScale.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.exp) });
    titleTranslateY.value = withDelay(
      400,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.exp) })
    );
    subtitleTranslateY.value = withDelay(
      600,
      withTiming(0, { duration: 600, easing: Easing.out(Easing.exp) })
    );
  }, []);

  /**
  * Animated styles:
  * - logoStyle: handles scale and opacity for the logo.
  * - titleStyle: fades in and moves up the title.
  * - subtitleStyle: fades in and moves up the subtitle slightly later.
  */  
  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoScale.value,
  }));

  const titleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: titleTranslateY.value }],
    opacity: interpolate(titleTranslateY.value, [50, 0], [0, 1]),
  }));

  const subtitleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: subtitleTranslateY.value }],
    opacity: interpolate(subtitleTranslateY.value, [50, 0], [0, 1]),
  }));

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Logo */}
        <Animated.Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3208/3208726.png' }}
          style={[styles.logo, logoStyle]}
          resizeMode="contain"
        />

        {/* Title */}
        <Animated.Text style={[styles.title, titleStyle]}>Welcome To FormBase</Animated.Text>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, subtitleStyle]}>
          Create, collect, and explore structured data with ease using your custom forms.
        </Animated.Text>

        {/* Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={() => setNewFormVisible(true)} 
          >
            <Ionicons name="add-circle-outline" size={22} color="white" style={styles.icon} />
            <Text style={styles.buttonText}>Create New Form</Text>
          </TouchableOpacity>
        </View>

        {/* New Form Modal */}
        <NewFormModal
          visible={newFormVisible}
          onClose={() => setNewFormVisible(false)}
          onFormCreated={() => {
            setNewFormVisible(false);
            // Optionally refresh forms here if needed
          }}
        />
      </View>
    </SafeAreaView>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#ffffff',
  },
  logo: {
    width: 112,
    height: 112,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#137547', // brand green
    marginBottom: 10,
    
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#137547',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  icon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
