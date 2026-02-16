import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Layout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#137547',
        tabBarInactiveTintColor: '#555',
        tabBarStyle: { height: 70, paddingBottom: 10 },
        tabBarIcon: ({ color, size }) => {
          let iconName;

          // Match the file names below
          if (route.name === 'Home') iconName = 'home-outline';
          else if (route.name === 'About') iconName = 'information-circle-outline';
          else iconName = 'document-text-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Home" options={{ title: 'Home' }} />
      <Tabs.Screen name="About" options={{ title: 'About' }} />
    </Tabs>
  );
}


