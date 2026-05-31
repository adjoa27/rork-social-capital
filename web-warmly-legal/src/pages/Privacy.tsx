import { ShieldCheck } from "lucide-react";
import LegalLayout from "@/components/LegalLayout";
import { Bullets, LegalSection, Mail } from "@/components/LegalSection";

const Privacy = () => {
  return (
    <LegalLayout
      icon={<ShieldCheck size={28} strokeWidth={2.2} />}
      title="Privacy Policy"
      lastUpdated="Last updated: May 30, 2026"
    >
      <LegalSection title="1. Data We Collect">
        <p>
          Social Capital stores your contacts and interaction data securely in your personal
          Supabase database. We collect:
        </p>
        <Bullets
          items={[
            "Contact information you provide (names, phone numbers, email addresses)",
            "Interaction history you log (notes, call records, meetings)",
            "Account information from your sign-in provider (Google or Apple)",
            "Subscription and purchase history via RevenueCat",
          ]}
        />
      </LegalSection>

      <LegalSection title="2. How We Use Your Data">
        <p>Your data is used exclusively to provide and improve the Social Capital Service:</p>
        <Bullets
          items={[
            "To display your contacts and interaction history",
            "To generate personalized message suggestions",
            "To sync data across your devices",
            "To manage your subscription and account",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Data Sharing">
        <p>
          We never share your personal data with third parties. Your contacts, messages,
          and interaction history remain private to you. The only third-party services
          involved are infrastructure providers:
        </p>
        <Bullets
          items={[
            "Supabase — database hosting (your data is stored in your personal project)",
            "RevenueCat — subscription management (purchase tokens only)",
            "Google / Apple — authentication (name, email, profile photo)",
          ]}
        />
        <p>
          None of these providers have access to your Social Capital data for their own purposes. We
          do not sell, rent, or trade your information.
        </p>
      </LegalSection>

      <LegalSection title="4. Data Security">
        Your data is encrypted in transit (TLS 1.3) and at rest. Supabase provides
        enterprise-grade security including row-level security policies that ensure only you
        can access your data. Your database credentials are stored securely and never logged
        or exposed.
      </LegalSection>

      <LegalSection title="5. Data Retention">
        Your data is retained as long as your account is active. If you delete your account,
        your data is permanently removed from Supabase within 30 days. You may also export
        your data at any time from the Settings screen in the app.
      </LegalSection>

      <LegalSection title="6. Your Rights">
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <Bullets
          items={[
            "Access the personal data we hold about you",
            "Request correction of inaccurate data",
            "Request deletion of your data",
            "Export your data in a portable format",
            "Withdraw consent at any time",
          ]}
        />
        <p>
          To exercise any of these rights, contact us at <Mail>hello@warmly.app</Mail>.
        </p>
      </LegalSection>

      <LegalSection title="7. Children's Privacy">
        Social Capital is not intended for children under 13 years of age. We do not knowingly
        collect personal information from children under 13.
      </LegalSection>

      <LegalSection title="8. Changes to This Policy">
        We may update this Privacy Policy from time to time. Material changes will be
        communicated within the app. Continued use after changes constitutes acceptance of
        the updated policy.
      </LegalSection>

      <LegalSection title="9. Contact">
        For privacy-related inquiries, contact us at <Mail>hello@warmly.app</Mail>.
      </LegalSection>
    </LegalLayout>
  );
};

export default Privacy;
