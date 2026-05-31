import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { Tabs } from "expo-router";
import { BlurView } from "expo-blur";
import {
  Home,
  Users,
  Sparkles,
  Calendar,
  User,
} from "lucide-react-native";
import { Colors } from "@/constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.text,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 0.1,
          marginTop: 2,
        },
        tabBarStyle: {
          position: "absolute",
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === "ios" ? 84 : 68,
          paddingTop: 8,
          backgroundColor: Platform.OS === "ios" ? "transparent" : Colors.card,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={80}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[StyleSheet.absoluteFill, { backgroundColor: Colors.card }]}
            />
          ),
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <Home
              size={22}
              color={color}
              strokeWidth={focused ? 2.6 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="contacts"
        options={{
          title: "People",
          tabBarIcon: ({ color, focused }) => (
            <Users size={22} color={color} strokeWidth={focused ? 2.6 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="ai"
        options={{
          title: "Assistant",
          tabBarIcon: ({ color, focused }) => (
            <Sparkles
              size={22}
              color={color}
              strokeWidth={focused ? 2.6 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="event"
        options={{
          title: "Event",
          tabBarIcon: ({ color, focused }) => (
            <Calendar
              size={22}
              color={color}
              strokeWidth={focused ? 2.6 : 2}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <User size={22} color={color} strokeWidth={focused ? 2.6 : 2} />
          ),
        }}
      />
    </Tabs>
  );
}
