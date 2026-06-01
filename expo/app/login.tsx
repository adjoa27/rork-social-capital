import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { Apple, ArrowRight, Heart } from "lucide-react-native";
import { useAuth } from "@/providers/AuthProvider";
import { Colors } from "@/constants/colors";

export default function Login() {
  const { user, isLoading, isSigningIn, error, signIn, clearError } = useAuth();

  /* Once the user is signed in, navigate to the main app */
  useEffect(() => {
    if (user) {
      router.replace("/(tabs)/home");
    }
  }, [user]);

  const enter = (provider: "google" | "apple") => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    signIn(provider);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors.goldDeep} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FAF6EF", "#F3E9D5"]} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <LinearGradient
            colors={["#C8A05A", "#A4823F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}
          >
            <Heart size={28} color="#FFFFFF" strokeWidth={2.6} />
          </LinearGradient>
          <Text style={styles.title}>Welcome to Warmly</Text>
          <Text style={styles.subtitle}>Your network, beautifully tended.</Text>
        </View>

        <View style={styles.card}>
          {error ? (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={clearError} style={styles.errorDismiss}>
                <Text style={styles.errorDismissText}>Dismiss</Text>
              </Pressable>
            </View>
          ) : null}

          {isSigningIn ? (
            <View style={styles.signingInRow}>
              <ActivityIndicator color={Colors.goldDeep} />
              <Text style={styles.signingInText}>Signing in…</Text>
            </View>
          ) : (
            <>
              <Pressable
                onPress={() => enter("apple")}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  pressed && { opacity: 0.9 },
                ]}
              >
                <LinearGradient
                  colors={["#1A2740", "#0F1B2D"]}
                  style={styles.primaryInner}
                >
                  <Apple size={18} color="#FFFFFF" strokeWidth={2.4} />
                  <Text style={styles.primaryText}>Continue with Apple</Text>
                  <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.4} />
                </LinearGradient>
              </Pressable>

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>or</Text>
                <View style={styles.line} />
              </View>

              <Pressable
                onPress={() => enter("google")}
                style={({ pressed }) => [
                  styles.socialBtn,
                  styles.socialOutline,
                  pressed && { opacity: 0.85 },
                ]}
              >
                <GoogleGlyph />
                <Text style={[styles.socialText, { color: Colors.text }]}>
                  Continue with Google
                </Text>
              </Pressable>
            </>
          )}
        </View>

        <Text style={styles.fineprint}>
          By continuing you agree to our Terms and acknowledge our Privacy Policy.
        </Text>
      </ScrollView>
    </View>
  );
}

function GoogleGlyph() {
  return (
    <View style={styles.gWrap}>
      <Text style={styles.gText}>G</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 90, paddingBottom: 40, gap: 28 },
  hero: { alignItems: "center", gap: 14 },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  title: { fontSize: 28, fontWeight: "800", color: Colors.text, letterSpacing: -0.6 },
  subtitle: { fontSize: 15, color: Colors.textSecondary },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 22,
    gap: 12,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  errorCard: {
    backgroundColor: "#FEE2E2",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: { color: "#DC2626", fontSize: 13, flex: 1, marginRight: 8 },
  errorDismiss: { paddingHorizontal: 8, paddingVertical: 4 },
  errorDismissText: { color: "#DC2626", fontWeight: "700", fontSize: 13 },
  signingInRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 24,
  },
  signingInText: { fontSize: 15, color: Colors.goldDeep, fontWeight: "600" },
  primaryBtn: { borderRadius: 14, overflow: "hidden" },
  primaryInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  primaryText: { color: "#FFFFFF", fontWeight: "700", fontSize: 15 },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 6,
  },
  line: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textMuted,
    letterSpacing: 0.4,
  },
  socialBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 10,
  },
  socialOutline: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  socialText: { fontWeight: "700", fontSize: 15 },
  gWrap: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  gText: { color: "#4285F4", fontWeight: "800", fontSize: 14 },
  fineprint: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
});
