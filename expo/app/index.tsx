import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { Colors } from "@/constants/colors";

export default function IndexRedirect() {
  const { isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/onboarding");
    } else {
      router.replace("/(tabs)/home");
    }
  }, [isLoading, user]);

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
