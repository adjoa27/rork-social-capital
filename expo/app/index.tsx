import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "@/providers/AuthProvider";
import { Colors } from "@/constants/colors";

const ONBOARDED_KEY = "socialcapital:has_onboarded";

export default function IndexRedirect() {
  const { isLoading, user } = useAuth();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync(ONBOARDED_KEY).then((v) => {
      setHasOnboarded(v === "true");
    });
  }, []);

  useEffect(() => {
    if (isLoading || hasOnboarded === null) return;
    if (!hasOnboarded) {
      router.replace("/onboarding");
    } else if (!user) {
      router.replace("/login");
    } else {
      router.replace("/(tabs)/home");
    }
  }, [isLoading, hasOnboarded, user]);

  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={Colors.goldDeep} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
});
