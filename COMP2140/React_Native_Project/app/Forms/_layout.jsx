import React from "react";
import { Drawer } from "expo-router/drawer";
import { Ionicons } from "@expo/vector-icons";

/**
 * DrawerLayout sets up the main drawer navigation structure for the app.
 * It defines three screens—Form, Record, and Map—each accessible through the drawer menu.
 */
export default function DrawerLayout() {
  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: "#054A29" },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
        drawerActiveTintColor: "#137547",
        drawerInactiveTintColor: "#555",
      }}
    >
      <Drawer.Screen
        name="Form"
        options={{
          title: "My Forms",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Record"
        options={{
          title: "Records",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Map"
        options={{
          title: "Map",
          drawerIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer>
  );
}
