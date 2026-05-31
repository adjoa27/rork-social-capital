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
import { ArrowLeft, Scale } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Gradients, Radii, Typography } from "@/constants/colors";

export default function TermsScreen(): React.ReactNode {
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
        <Text style={styles.headerTitle}>Terms of Service</Text>
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
              <Scale size={22} color={Colors.gold} strokeWidth={2.2} />
            </View>
            <Text style={styles.lastUpdated}>Last updated: May 30, 2026</Text>
          </View>

          <Section title="1. Acceptance of Terms">
            By downloading, accessing, or using the Social Capital app (&ldquo;the Service&rdquo;),
            you agree to be bound by these Terms of Service. If you do not agree to
            these terms, please do not use the Service.
          </Section>

          <Section title="2. Description of Service">
            Social Capital helps you maintain meaningful personal and professional relationships
            by tracking contact interactions, generating personalized message suggestions,
            and organizing your network. The Service is provided on an &ldquo;as is&rdquo; basis
            and features may change over time.
          </Section>

          <Section title="3. Subscriptions & Billing">
            <Text style={styles.para}>
              Social Capital offers the following subscription plans:
            </Text>
            <View style={styles.bulletList}>
              <Bullet>Monthly — $5/month, billed monthly</Bullet>
              <Bullet>Yearly — $35/year, billed annually</Bullet>
            </View>
            <Text style={styles.para}>
              Subscriptions are processed through RevenueCat and the respective app
              store (Apple App Store or Google Play Store). Payments are charged to
              your app store account upon confirmation of purchase.
            </Text>
            <Text style={styles.para}>
              Subscriptions auto-renew unless canceled at least 24 hours before the
              end of the current billing period. You can manage and cancel your
              subscription in your device&rsquo;s account settings.
            </Text>
          </Section>

          <Section title="4. Refund Policy">
            Refund requests are handled by the respective app store. Social Capital does
            not process refunds directly. For Apple users, visit
            reportaproblem.apple.com. For Google Play users, visit the Google Play
            order history.
          </Section>

          <Section title="5. User Conduct">
            You agree not to misuse the Service, including but not limited to:
            uploading malicious content, attempting to gain unauthorized access,
            reverse-engineering the app, or violating any applicable laws.
          </Section>

          <Section title="6. Intellectual Property">
            All content, design, code, and materials within Social Capital are the property
            of Social Capital and are protected by intellectual property laws. You may not
            reproduce, distribute, or create derivative works without express
            permission.
          </Section>

          <Section title="7. Limitation of Liability">
            Social Capital is provided without warranties of any kind. We are not liable
            for any damages arising from your use of the Service, including loss
            of data, profits, or business interruption.
          </Section>

          <Section title="8. Termination">
            We reserve the right to suspend or terminate your access to the Service
            at any time, with or without cause. Upon termination, your right to use
            the Service ceases immediately.
          </Section>

          <Section title="9. Changes to Terms">
            We may update these Terms from time to time. We will notify you of
            material changes by posting the new Terms within the app. Continued
            use after changes constitutes acceptance.
          </Section>

          <Section title="10. Contact">
            If you have questions about these Terms, contact us at{" "}
            <Text style={styles.link}>hello@warmly.app</Text>.
          </Section>

          <Text style={styles.endNote}>
            Thank you for using Social Capital.
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
