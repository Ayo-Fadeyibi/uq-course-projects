import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

/**
 * About component displays an informational page describing the purpose and technology behind FormBase.
 * It highlights the app’s key features and the technologies powering it through reusable card components.
*/
export default function About() {
  return (
    <ScrollView style={styles.container}>
      {/* Why FormBase Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Why FormBase?</Text>
        <View style={styles.cardGroup}>
          <HighlightCard
            icon="rocket-outline"
            title="Fast & Easy"
            text="Create and manage forms effortlessly with intuitive tools."
          />
          <HighlightCard
            icon="shield-checkmark-outline"
            title="Secure"
            text="Your data is safe with encryption and robust backend architecture."
          />
          <HighlightCard
            icon="globe-outline"
            title="Accessible Anywhere"
            text="Collect and view data on your phone or tablet, offline or online."
          />
        </View>
      </View>

      {/* Powered By / Tech Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Powered By</Text>
        <View style={styles.cardGroup}>
          <TechCard icon="logo-react" text="React Native + Expo" />
          <TechCard icon="server-outline" text="PostgREST API Backend" />
          <TechCard icon="map-outline" text="React Native Maps & Animations" />
          <TechCard icon="color-palette-outline" text="Modern UI Design" />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          FormBase v0.5 — Made with ❤️ by FormBase Team
        </Text>
      </View>
    </ScrollView>
  );
}

/**
 * HighlightCard component displays a feature highlight with an icon, title, and descriptive text.
 * @param {string} icon - Ionicon name for the feature icon.
 * @param {string} title - Title text describing the feature.
 * @param {string} text - Supporting description explaining the benefit.
 */
function HighlightCard({ icon, title, text }) {
  return (
    <View style={styles.highlightCard}>
      <Ionicons name={icon} size={28} color="#137547" style={styles.icon} />
      <View style={styles.textContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardText}>{text}</Text>
      </View>
    </View>
  );
}

/**
 * TechCard component displays a single technology used in the app with an icon and label.
 * @param {string} icon - Ionicon name representing the technology.
 * @param {string} text - Name or description of the technology/tool.
 */
function TechCard({ icon, text }) {
  return (
    <View style={styles.techCard}>
      <Ionicons name={icon} size={22} color="#137547" style={styles.icon} />
      <Text style={styles.techText}>{text}</Text>
    </View>
  );
}

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    marginTop: 40,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#137547',
    marginBottom: 16,
  },
  cardGroup: {
    gap: 16,
  },
  highlightCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
  },
  icon: {
    marginRight: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#137547',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  techCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  techText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  footer: {
    marginTop: 30,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
  },
});
