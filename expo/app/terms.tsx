import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

export default function TermsOfServiceScreen() {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + 12,
        paddingBottom: insets.bottom + 40,
        paddingHorizontal: 20,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={10}
        >
          <ArrowLeft size={20} color={Colors.text} strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.title}>Terms of Service</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.lastUpdated}>Last updated: June 2, 2026</Text>

      <Section title="1. Acceptance of Terms">
        <Para>
          By using Social Capital, you agree to these Terms of Service. If you
          do not agree, please do not use the app. We may update these terms
          from time to time, and continued use constitutes acceptance of any
          changes.
        </Para>
      </Section>

      <Section title="2. Description of Service">
        <Para>
          Social Capital is a relationship management tool that helps you track,
          nurture, and strengthen your professional and personal connections.
          Features include contact management, AI-powered message drafting, voice
          notes, calendar sync, and networking insights.
        </Para>
      </Section>

      <Section title="3. User Accounts">
        <Para>
          You are responsible for maintaining the confidentiality of your account
          credentials and for all activities under your account. You must provide
          accurate information and keep it up to date.
        </Para>
      </Section>

      <Section title="4. Subscriptions & Billing">
        <Para>
          Social Capital offers both free and premium (Social Capital Pro)
          subscription tiers. Premium features require an active subscription
          managed through the App Store. Subscriptions auto-renew unless canceled
          at least 24 hours before the end of the current period. Refunds are
          handled by Apple per their policies.
        </Para>
      </Section>

      <Section title="5. Acceptable Use">
        <Para>
          You agree not to misuse the app, including but not limited to:
          uploading malicious content, attempting to access other users' data,
          using the app for spam or harassment, or violating any applicable laws.
        </Para>
      </Section>

      <Section title="6. Limitation of Liability">
        <Para>
          Social Capital is provided &ldquo;as is&rdquo; without warranties of
          any kind. We are not liable for any damages arising from your use of
          the app, including data loss, service interruptions, or inaccuracies
          in AI-generated content.
        </Para>
      </Section>

      <Section title="7. Termination">
        <Para>
          We reserve the right to suspend or terminate accounts that violate
          these terms. You may delete your account at any time through the app
          settings or by contacting support.
        </Para>
      </Section>

      <Section title="8. Contact">
        <Para>
          For questions about these Terms, contact us at
          hello@socialcapital.app.
        </Para>
      </Section>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Para({ children }: { children: React.ReactNode }) {
  return <Text style={styles.para}>{children}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  lastUpdated: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 24,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 8,
    letterSpacing: -0.2,
  },
  para: {
    fontSize: 14,
    lineHeight: 22,
    color: Colors.textSecondary,
  },
});
