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

export default function PrivacyPolicyScreen() {
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
        <Text style={styles.title}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.lastUpdated}>Last updated: June 2, 2026</Text>

      <Section title="1. Information We Collect">
        <Para>
          When you use Social Capital, we collect information you provide directly,
          such as your name, email address, and contact list data when you choose
          to import contacts. We also collect information about your usage of the
          app, including features you interact with and contacts you manage.
        </Para>
      </Section>

      <Section title="2. How We Use Your Information">
        <Para>
          We use your information to provide and improve the Social Capital
          service. This includes managing your contact relationships, generating
          AI-powered message drafts, sending reminders, and personalizing your
          experience. We do not sell your personal data.
        </Para>
      </Section>

      <Section title="3. Data Storage & Security">
        <Para>
          Your contacts and profile data are stored securely using Supabase and
          encrypted in transit. We use industry-standard security measures to
          protect your information. You can request deletion of your data at
          any time by contacting support.
        </Para>
      </Section>

      <Section title="4. Third-Party Services">
        <Para>
          Social Capital integrates with third-party services including Supabase
          (database), RevenueCat (subscriptions), and optionally LinkedIn
          (profile connection). These services have their own privacy policies,
          and we encourage you to review them.
        </Para>
      </Section>

      <Section title="5. Your Rights">
        <Para>
          You have the right to access, correct, or delete your personal
          information. You can export your data from the Settings screen or
          contact us at hello@socialcapital.app to exercise these rights.
        </Para>
      </Section>

      <Section title="6. Contact Us">
        <Para>
          If you have questions about this Privacy Policy, please reach out to
          us at hello@socialcapital.app.
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
