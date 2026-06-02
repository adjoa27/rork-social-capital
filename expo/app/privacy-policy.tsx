import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, Stack } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

const LAST_UPDATED = "June 2, 2026";

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

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

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 60,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.updated}>Last updated: {LAST_UPDATED}</Text>

        <Section title="1. Introduction">
          <P>
            Social Capital ("we," "our," or "us") is committed to protecting your
            privacy. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information when you use our mobile application
            (the "App"). Please read this privacy policy carefully. If you do not
            agree with the terms of this privacy policy, please do not access the
            App.
          </P>
        </Section>

        <Section title="2. Information We Collect">
          <Subtitle>Personal Data</Subtitle>
          <P>
            We collect information that you voluntarily provide when you register
            with the App, including your name, email address, profile picture,
            and authentication credentials (via Google or Apple sign-in).
          </P>

          <Subtitle>Contact Data</Subtitle>
          <P>
            When you import contacts from your phone or manually add them, we
            store the information you provide: names, companies, job titles,
            emails, phone numbers, LinkedIn URLs, tags, notes, and relationship
            details. We only access your phone contacts with your explicit
            permission.
          </P>

          <Subtitle>LinkedIn Data</Subtitle>
          <P>
            If you choose to connect your LinkedIn profile, we store your
            LinkedIn profile URL. We may display publicly available social
            updates (such as job changes, posts, and funding announcements) for
            contacts who are also connected to LinkedIn.
          </P>

          <Subtitle>Usage Data</Subtitle>
          <P>
            We automatically collect certain information when you use the App,
            including app interactions, feature usage, and device information.
            This data helps us improve the App experience.
          </P>
        </Section>

        <Section title="3. How We Use Your Information">
          <P>
            We use the information we collect to:
          </P>
          <List>
            <LI>Provide, maintain, and improve the App</LI>
            <LI>
              Generate AI-powered relationship insights and message drafts
            </LI>
            <LI>
              Send notifications about relationship reminders and social updates
            </LI>
            <LI>
              Sync your data across devices via secure cloud storage
            </LI>
            <LI>
              Respond to your comments, questions, and support requests
            </LI>
            <LI>Monitor and analyze usage patterns and trends</LI>
            <LI>
              Detect, prevent, and address technical issues or abuse
            </LI>
          </List>
        </Section>

        <Section title="4. Data Storage and Security">
          <P>
            Your data is stored securely using industry-standard encryption both
            in transit and at rest. We use Supabase for database storage with
            row-level security policies to ensure that you can only access your
            own data. Authentication is handled through secure OAuth providers
            (Google and Apple).
          </P>
          <P>
            We implement appropriate technical and organizational measures to
            protect your personal data against unauthorized access, alteration,
            disclosure, or destruction. However, no method of electronic storage
            or transmission is 100% secure.
          </P>
        </Section>

        <Section title="5. Data Sharing and Disclosure">
          <P>
            We do NOT sell your personal data to third parties. We do not share
            your contact network data with anyone. Your relationship information
            is private to you.
          </P>
          <P>We may share information in the following limited circumstances:</P>
          <List>
            <LI>
              With service providers who perform services on our behalf (cloud
              hosting, authentication)
            </LI>
            <LI>If required by law or to protect rights and safety</LI>
            <LI>
              In connection with a business transfer (merger, acquisition, or
              asset sale)
            </LI>
            <LI>With your consent or at your direction</LI>
          </List>
        </Section>

        <Section title="6. Your Data Rights">
          <P>You have the right to:</P>
          <List>
            <LI>
              Access, update, or delete your personal information at any time
              through the App
            </LI>
            <LI>Export your data in a machine-readable format</LI>
            <LI>
              Withdraw consent for contact access or LinkedIn integration
            </LI>
            <LI>
              Delete your account and all associated data by contacting support
            </LI>
          </List>
          <P>
            To exercise these rights, use the in-app settings, export, and
            delete features, or contact us at the email address below.
          </P>
        </Section>

        <Section title="7. AI and Machine Learning">
          <P>
            The App uses AI to generate relationship insights and message drafts
            based on data you provide (contact notes, interaction history). AI
            processing occurs on secure servers. Your contact data is not used
            to train AI models. AI-generated content is provided as a suggestion
            only — you are in full control of what messages are sent.
          </P>
        </Section>

        <Section title="8. Third-Party Services">
          <P>
            The App integrates with LinkedIn. If you connect your LinkedIn
            account, you are subject to LinkedIn's privacy policy for data
            accessed through their platform. We only access publicly available
            profile information and activity for contacts you've added to the
            App.
          </P>
        </Section>

        <Section title="9. Children's Privacy">
          <P>
            The App is not intended for use by children under the age of 13. We
            do not knowingly collect personal information from children under 13.
            If you believe we have collected such information, please contact us
            immediately.
          </P>
        </Section>

        <Section title="10. Changes to This Policy">
          <P>
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy within the App
            and updating the "Last updated" date. You are advised to review this
            Privacy Policy periodically for any changes.
          </P>
        </Section>

        <Section title="11. Contact Us">
          <P>
            If you have questions or concerns about this Privacy Policy, please
            contact us at:
          </P>
          <P style={{ fontWeight: "600" }}>
            hello@socialcapital.app
          </P>
        </Section>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2026 Social Capital. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
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
    <View style={{ gap: 10 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Subtitle({ children }: { children: string }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

function P({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <Text style={[styles.paragraph, style]}>{children}</Text>;
}

function List({ children }: { children: React.ReactNode }) {
  return <View style={{ gap: 6, paddingLeft: 4 }}>{children}</View>;
}

function LI({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.listItem}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.listText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  updated: {
    fontSize: 12,
    color: Colors.textMuted,
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 0.2,
    textTransform: "uppercase",
  },
  paragraph: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 21,
  },
  listItem: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  bullet: {
    fontSize: 14,
    color: Colors.goldDeep,
    fontWeight: "700",
    lineHeight: 21,
    width: 10,
  },
  listText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 21,
    flex: 1,
  },
  footer: {
    alignItems: "center",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
});
