import "@/lib/polyfills"; // must be imported before any AI SDK import

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as Notifications from "expo-notifications";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/providers/AuthProvider";
import { ContactsProvider } from "@/providers/ContactsProvider";
import { PurchasesProvider } from "@/providers/PurchasesProvider";
import { LinkedInProvider } from "@/providers/LinkedInProvider";

SplashScreen.preventAutoHideAsync().catch(() => {});

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, refetchOnWindowFocus: false },
  },
});

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#FAF6EF" },
        animation: "fade",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="contact/[id]" options={{ animation: "slide_from_right" }} />
      <Stack.Screen name="add-contact" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      <Stack.Screen name="message-generator" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      <Stack.Screen name="scan-card" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      <Stack.Screen name="paywall" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      <Stack.Screen name="subscription" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      <Stack.Screen name="linkedin-connect" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
      <Stack.Screen name="voice-note" options={{ presentation: "modal", animation: "slide_from_bottom" }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
    if (Platform.OS !== "web") {
      Notifications.requestPermissionsAsync().catch(() => {});
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PurchasesProvider>
          <ContactsProvider>
            <LinkedInProvider>
              <SafeAreaProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <StatusBar style="dark" />
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </SafeAreaProvider>
            </LinkedInProvider>
          </ContactsProvider>
        </PurchasesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
