import { Scale } from "lucide-react";
import LegalLayout from "@/components/LegalLayout";
import { Bullets, LegalSection, Mail } from "@/components/LegalSection";

const Terms = () => {
  return (
    <LegalLayout
      icon={<Scale size={28} strokeWidth={2.2} />}
      title="Terms of Service"
      lastUpdated="Last updated: May 30, 2026"
    >
      <LegalSection title="1. Acceptance of Terms">
        By downloading, accessing, or using the Social Capital app (&ldquo;the Service&rdquo;), you
        agree to be bound by these Terms of Service. If you do not agree to these terms,
        please do not use the Service.
      </LegalSection>

      <LegalSection title="2. Description of Service">
        Social Capital helps you maintain meaningful personal and professional relationships by
        tracking contact interactions, generating personalized message suggestions, and
        organizing your network. The Service is provided on an &ldquo;as is&rdquo; basis and
        features may change over time.
      </LegalSection>

      <LegalSection title="3. Subscriptions & Billing">
        <p>Social Capital offers the following subscription plans:</p>
        <Bullets
          items={[
            "Monthly — $5/month, billed monthly",
            "Yearly — $35/year, billed annually",
            "Lifetime — $79 one-time payment",
          ]}
        />
        <p>
          Subscriptions are processed through RevenueCat and the respective app store
          (Apple App Store or Google Play Store). Payments are charged to your app store
          account upon confirmation of purchase.
        </p>
        <p>
          Subscriptions auto-renew unless canceled at least 24 hours before the end of the
          current billing period. You can manage and cancel your subscription in your
          device&rsquo;s account settings.
        </p>
      </LegalSection>

      <LegalSection title="4. Refund Policy">
        Refund requests are handled by the respective app store. Social Capital does not process
        refunds directly. For Apple users, visit reportaproblem.apple.com. For Google Play
        users, visit the Google Play order history.
      </LegalSection>

      <LegalSection title="5. User Conduct">
        You agree not to misuse the Service, including but not limited to: uploading
        malicious content, attempting to gain unauthorized access, reverse-engineering the
        app, or violating any applicable laws.
      </LegalSection>

      <LegalSection title="6. Intellectual Property">
        All content, design, code, and materials within Social Capital are the property of Social Capital
        and are protected by intellectual property laws. You may not reproduce, distribute,
        or create derivative works without express permission.
      </LegalSection>

      <LegalSection title="7. Limitation of Liability">
        Social Capital is provided without warranties of any kind. We are not liable for any damages
        arising from your use of the Service, including loss of data, profits, or business
        interruption.
      </LegalSection>

      <LegalSection title="8. Termination">
        We reserve the right to suspend or terminate your access to the Service at any time,
        with or without cause. Upon termination, your right to use the Service ceases
        immediately.
      </LegalSection>

      <LegalSection title="9. Changes to Terms">
        We may update these Terms from time to time. We will notify you of material changes
        by posting the new Terms within the app. Continued use after changes constitutes
        acceptance.
      </LegalSection>

      <LegalSection title="10. Contact">
        If you have questions about these Terms, contact us at <Mail>hello@warmly.app</Mail>.
      </LegalSection>
    </LegalLayout>
  );
};

export default Terms;
