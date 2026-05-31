import React, { useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { ArrowLeft, ShieldCheck } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Gradients, Radii, Typography } from "@/constants/colors";

export default function PrivacyScreen(): React.ReactNode {
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 350,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <View style={styles.root}>
      <LinearGradient colors={Gradients.hero} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Pressable
          style={({ pressed }) => [
            styles.backBtn,
            pressed && styles.backBtnPressed,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
            router.back();
          }}
          accessibilityLabel="Close"
          accessibilityRole="button"
        >
          <ArrowLeft size={22} color="rgba(255,255,255,0.7)" strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.headerSpacer} />
      </View>

      <Animated.View style={[styles.body, { opacity: fadeAnim }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero icon */}
          <View style={styles.iconRow}>
            <View style={styles.iconCircle}>
              <ShieldCheck size={22} color={Colors.gold} strokeWidth={2.2} />
            </View>
            <Text style={styles.lastUpdated}>Last updated: May 30, 2026</Text>
          </View>

          <Section title="1. Data We Collect">
            <Text style={styles.para}>
              Social Capital stores your contacts and interaction data securely in your
              personal Supabase database. We collect:
            </Text>
            <View style={styles.bulletList}>
              <Bullet>Contact information you provide (names, phone numbers, email addresses)</Bullet>
              <Bullet>Interaction history you log (notes, call records, meetings)</Bullet>
              <Bullet>Account information from your sign-in provider (Google or Apple)</Bullet>
              <Bullet>Subscription and purchase history via RevenueCat</Bullet>
            </View>
          </Section>

          <Section title="2. How We Use Your Data">
            <Text style={styles.para}>
              Your data is used exclusively to provide and improve the Social Capital
              Service:
            </Text>
            <View style={styles.bulletList}>
              <Bullet>To display your contacts and interaction history</Bullet>
              <Bullet>To generate personalized message suggestions</Bullet>
              <Bullet>To sync data across your devices</Bullet>
              <Bullet>To manage your subscription and account</Bullet>
            </View>
          </Section>

          <Section title="3. Data Sharing">
            <Text style={styles.para}>
              We never share your personal data with third parties. Your contacts,
              messages, and interaction history remain private to you. The only
              third-party services involved are infrastructure providers:
            </Text>
            <View style={styles.bulletList}>
              <Bullet>Supabase — database hosting (your data is stored in your personal project)</Bullet>
              <Bullet>RevenueCat — subscription management (purchase tokens only)</Bullet>
              <Bullet>Google / Apple — authentication (name, email, profile photo)</Bullet>
            </View>
            <Text style={styles.para}>
              None of these providers have access to your Social Capital data for their own
              purposes. We do not sell, rent, or trade your information.
            </Text>
          </Section>

          <Section title="4. Data Security">
            <Text style={styles.para}>
              Your data is encrypted in transit (TLS 1.3) and at rest. Supabase
              provides enterprise-grade security including row-level security
              policies that ensure only you can access your data. Your database
              credentials are stored securely and never logged or exposed.
            </Text>
          </Section>

          <Section title="5. Data Retention">
            <Text style={styles.para}>
              Your data is retained as long as your account is active. If you delete
              your account, your data is permanently removed from Supabase within 30
              days. You may also export your data at any time from the Settings
              screen in the app.
            </Text>
          </Section>

          <Section title="6. Your Rights">
            <Text style={styles.para}>
              Depending on your jurisdiction, you may have the right to:
            </Text>
            <View style={styles.bulletList}>
              <Bullet>Access the personal data we hold about you</Bullet>
              <Bullet>Request correction of inaccurate data</Bullet>
              <Bullet>Request deletion of your data</Bullet>
              <Bullet>Export your data in a portable format</Bullet>
              <Bullet>Withdraw consent at any time</Bullet>
            </View>
            <Text style={styles.para}>
              To exercise any of these rights, contact us at{" "}
              <Text style={styles.link}>hello@warmly.app</Text>.
            </Text>
          </Section>

          <Section title="7. Children&rsquo;s Privacy">
            Social Capital is not intended for children under 13 years of age. We do not
            knowingly collect personal information from children under 13.
          </Section>

          <Section title="8. Changes to This Policy">
            We may update this Privacy Policy from time to time. Material changes
            will be communicated within the app. Continued use after changes
            constitutes acceptance of the updated policy.
          </Section>

          <Section title="9. Contact">
            For privacy-related inquiries, contact us at{" "}
            <Text style={styles.link}>hello@warmly.app</Text>.
          </Section>

          <Text style={styles.endNote}>
            Your trust matters. We take privacy seriously.
          </Text>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

/** ─── Sub-components ─────────────────────────────────────── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.ReactNode {
  return (
    <View style={sectionStyles.card}>
      <Text style={sectionStyles.title}>{title}</Text>
      <View style={sectionStyles.body}>{children}</View>
    </View>
  );
}

function Bullet({ children }: { children: React.ReactNode }): React.ReactNode {
  return (
    <View style={sectionStyles.bulletRow}>
      <Text style={sectionStyles.bulletDot}>•</Text>
      <Text style={sectionStyles.bulletText}>{children}</Text>
    </View>
  );
}

/** ─── Styles ─────────────────────────────────────────── */

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0F1B2D",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnPressed: {
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.2,
  },
  headerSpacer: {
    width: 40,
  },
  body: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 14,
  },
  iconRow: {
    alignItems: "center",
    gap: 10,
    paddingTop: 4,
    paddingBottom: 6,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(200,160,90,0.12)",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(200,160,90,0.2)",
  },
  lastUpdated: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.3)",
  },
  para: {
    fontSize: 14,
    fontWeight: "400",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 22,
  },
  bulletList: {
    gap: 8,
    paddingLeft: 4,
    marginVertical: 4,
  },
  link: {
    color: Colors.gold,
    fontWeight: "600",
  },
  endNote: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.goldSoft,
    textAlign: "center",
    paddingTop: 12,
  },
});

const sectionStyles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: Radii.md,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  title: {
    ...Typography.h3,
    color: Colors.gold,
  },
  body: {
    gap: 10,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  bulletDot: {
    fontSize: 14,
    color: Colors.goldSoft,
    lineHeight: 22,
  },
  bulletText: {
    fontSize: 14,
    fontWeight: "400",
    color: "rgba(255,255,255,0.65)",
    lineHeight: 22,
    flex: 1,
  },
});
