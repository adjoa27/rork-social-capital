import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  CheckCircle,
  Circle,
  CreditCard,
  Crown,
  ExternalLink,
  HelpCircle,
  MessageCircle,
  Receipt,
  RefreshCw,
  Shield,
  XCircle,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Gradients, Radii } from "@/constants/colors";
import { usePurchases, ENTITLEMENT_SOCIAL_CAPITAL_PRO } from "@/providers/PurchasesProvider";
import Purchases from "react-native-purchases";
import type { EntitlementInfo } from "react-native-purchases";

function formatDate(iso: string | undefined | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function getPeriodLabel(periodType: string | undefined): string {
  switch (periodType) {
    case "NORMAL":
      return "renews";
    case "INTRO":
      return "introductory";
    case "TRIAL":
      return "trial";
    default:
      return periodType ?? "active";
  }
}

function ActiveBadge({ label }: { label: string }) {
  return (
    <View style={styles.activeBadge}>
      <Text style={styles.activeBadgeText}>{label}</Text>
    </View>
  );
}

export default function SubscriptionScreen() {
  const insets = useSafeAreaInsets();
  const {
    customerInfo,
    isLoadingCustomerInfo,
    isPro,
    activeProductType,
    restorePurchases,
    isRestoring,
    refetchCustomerInfo,
  } = usePurchases();

  const handleRestore = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const info = await restorePurchases();
    if (info.entitlements.active[ENTITLEMENT_SOCIAL_CAPITAL_PRO]) {
      Alert.alert("Restored!", "Your Social Capital Pro access has been restored.");
    } else {
      Alert.alert(
        "No subscription found",
        "We couldn't find an active Social Capital Pro subscription on your account."
      );
    }
  }, [restorePurchases]);

  const handleRefresh = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    refetchCustomerInfo();
  }, [refetchCustomerInfo]);

  const handleManageSubscription = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    try {
      // iOS: RevenueCat's in-app subscription management modal (iOS 15+)
      if (Platform.OS === "ios") {
        await Purchases.showManageSubscriptions();
        return;
      }
      // Android: open Google Play subscriptions page
      if (Platform.OS === "android") {
        await Linking.openURL(
          "https://play.google.com/store/account/subscriptions"
        );
        return;
      }
    } catch {
      // Fallback: open platform-specific URL
      try {
        const url =
          Platform.OS === "ios"
            ? "https://apps.apple.com/account/subscriptions"
            : "https://play.google.com/store/account/subscriptions";
        await Linking.openURL(url);
      } catch {
        Alert.alert(
          "Can't open",
          Platform.OS === "ios"
            ? "Please go to Settings > Apple ID > Subscriptions to manage."
            : "Please go to Google Play Store > Subscriptions to manage."
        );
      }
    }
  }, []);

  const handleContactSupport = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    // Opens the RevenueCat-managed Customer Center web fallback
    // Replace this URL with your own support/contact page
    Alert.alert(
      "Contact Support",
      "Need help with your subscription? Reach out and we'll get back to you within 24 hours.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Email Support",
          onPress: () => {
            Linking.openURL(
              "mailto:support@socialcapital.app?subject=Subscription%20Help"
            ).catch(() => {});
          },
        },
      ]
    );
  }, []);

  const proEntitlement: EntitlementInfo | undefined =
    customerInfo?.entitlements?.active?.[ENTITLEMENT_SOCIAL_CAPITAL_PRO];

  const activeProductLabel =
    activeProductType === "ANNUAL"
      ? "Yearly"
      : activeProductType === "MONTHLY"
        ? "Monthly"
        : null;

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0F1B2D", "#1A2A40", "#0F1B2D"]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.backBtn,
              pressed && styles.backBtnPressed,
            ]}
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityLabel="Go back"
          >
            <ArrowLeft
              size={20}
              color="rgba(255,255,255,0.7)"
              strokeWidth={2.2}
            />
          </Pressable>
          <Text style={styles.title}>Subscription</Text>
        </View>

        {isLoadingCustomerInfo ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="rgba(255,255,255,0.6)" size="large" />
            <Text style={styles.loadingText}>Loading subscription info…</Text>
          </View>
        ) : (
          <>
            {/* Status Card */}
            <View
              style={[
                styles.statusCard,
                isPro && styles.statusCardPro,
              ]}
            >
              {isPro ? (
                <LinearGradient
                  colors={["#E8C988", "#C8A05A"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.statusBadge}
                >
                  <Crown size={24} color="#FFFFFF" strokeWidth={2} />
                </LinearGradient>
              ) : (
                <View style={styles.statusBadgeFree}>
                  <Crown
                    size={24}
                    color="rgba(255,255,255,0.4)"
                    strokeWidth={2}
                  />
                </View>
              )}
              <Text style={styles.statusTitle}>
                {isPro ? "Social Capital Pro" : "Free Plan"}
              </Text>
              <Text style={styles.statusBody}>
                {isPro
                  ? "You have full access to all Social Capital features."
                  : "Upgrade to unlock unlimited AI drafts, voice notes, and more."}
              </Text>

              {isPro && activeProductLabel ? (
                <View style={styles.planPillRow}>
                  <ActiveBadge label={activeProductLabel} />
                  {proEntitlement ? (
                    <ActiveBadge
                      label={getPeriodLabel(proEntitlement.periodType)}
                    />
                  ) : null}
                </View>
              ) : null}
            </View>

            {/* Details Section */}
            {isPro && proEntitlement ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Plan Details</Text>
                <View style={styles.detailsCard}>
                  <DetailRow
                    icon={
                      <Crown size={16} color={Colors.gold} strokeWidth={2.2} />
                    }
                    label="Plan"
                    value={activeProductLabel ?? "Pro"}
                  />
                  <DetailRow
                    icon={
                      <CreditCard
                        size={16}
                        color={Colors.gold}
                        strokeWidth={2.2}
                      />
                    }
                    label="Product ID"
                    value={proEntitlement.productIdentifier}
                  />
                  <DetailRow
                    icon={
                      <Shield
                        size={16}
                        color={Colors.gold}
                        strokeWidth={2.2}
                      />
                    }
                    label="Renewal"
                    value={
                      proEntitlement.willRenew === false
                        ? "Will not renew"
                        : "Auto-renews"
                    }
                  />
                  <DetailRow
                    icon={
                      <Receipt
                        size={16}
                        color={Colors.gold}
                        strokeWidth={2.2}
                      />
                    }
                    label="Purchased"
                    value={formatDate(proEntitlement.purchaseDate)}
                  />
                  {proEntitlement.expirationDate ? (
                    <DetailRow
                      icon={
                        proEntitlement.willRenew === false ? (
                          <XCircle
                            size={16}
                            color={Colors.danger}
                            strokeWidth={2}
                          />
                        ) : (
                          <RefreshCw
                            size={16}
                            color={Colors.gold}
                            strokeWidth={2.2}
                          />
                        )
                      }
                      label={
                        proEntitlement.willRenew === false
                          ? "Expires"
                          : "Next renewal"
                      }
                      value={formatDate(proEntitlement.expirationDate)}
                    />
                  ) : null}
                </View>
              </View>
            ) : null}

            {/* All Entitlements Overview */}
            {customerInfo?.entitlements?.all ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Entitlements</Text>
                <View style={styles.entitlementsCard}>
                  {Object.entries(customerInfo.entitlements.all).map(
                    ([key, ent]) => {
                      const isActive = !!customerInfo.entitlements.active[key];
                      return (
                        <View key={key} style={styles.entitlementRow}>
                          {isActive ? (
                            <CheckCircle
                              size={18}
                              color={Colors.success}
                              strokeWidth={2.2}
                            />
                          ) : (
                            <Circle
                              size={18}
                              color="rgba(255,255,255,0.2)"
                              strokeWidth={2}
                            />
                          )}
                          <View style={{ flex: 1 }}>
                            <Text
                              style={[
                                styles.entitlementLabel,
                                isActive && styles.entitlementLabelActive,
                              ]}
                            >
                              {key
                                .split("_")
                                .map(
                                  (w) =>
                                    w.charAt(0).toUpperCase() + w.slice(1)
                                )
                                .join(" ")}
                            </Text>
                            {isActive ? (
                              <Text style={styles.entitlementMeta}>
                                Active ·{" "}
                                {ent?.productIdentifier ?? "Subscribed"}
                              </Text>
                            ) : (
                              <Text style={styles.entitlementMeta}>
                                Not subscribed
                              </Text>
                            )}
                          </View>
                        </View>
                      );
                    }
                  )}
                </View>
              </View>
            ) : null}

            {/* Actions */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions</Text>
              <View style={styles.actionsCard}>
                {!isPro ? (
                  <ActionRow
                    icon={
                      <Crown size={18} color={Colors.gold} strokeWidth={2.2} />
                    }
                    label="Upgrade to Pro"
                    onPress={() => router.push("/paywall")}
                    highlight
                  />
                ) : null}
                <ActionRow
                  icon={
                    <RefreshCw
                      size={18}
                      color="rgba(255,255,255,0.7)"
                      strokeWidth={2.2}
                    />
                  }
                  label={isRestoring ? "Restoring…" : "Restore purchases"}
                  onPress={handleRestore}
                  disabled={isRestoring}
                />
                <ActionRow
                  icon={
                    <HelpCircle
                      size={18}
                      color="rgba(255,255,255,0.7)"
                      strokeWidth={2.2}
                    />
                  }
                  label="Refresh subscription status"
                  onPress={handleRefresh}
                />
                {isPro ? (
                  <ActionRow
                    icon={
                      <ExternalLink
                        size={18}
                        color="rgba(255,255,255,0.7)"
                        strokeWidth={2.2}
                      />
                    }
                    label="Manage subscription"
                    onPress={handleManageSubscription}
                  />
                ) : null}
                <ActionRow
                  icon={
                    <MessageCircle
                      size={18}
                      color="rgba(255,255,255,0.7)"
                      strokeWidth={2.2}
                    />
                  }
                  label="Contact support"
                  onPress={handleContactSupport}
                />
              </View>
            </View>
          </>
        )}

        {/* Footer */}
        <View style={styles.footerRow}>
          <Pressable
            onPress={() => router.push("/terms")}
            style={styles.footerLink}
            accessibilityLabel="Terms of Service"
            accessibilityRole="link"
          >
            <Text style={styles.footerLinkText}>Terms of Service</Text>
          </Pressable>
          <Text style={styles.footerDot}>·</Text>
          <Pressable
            onPress={() => router.push("/privacy")}
            style={styles.footerLink}
            accessibilityLabel="Privacy Policy"
            accessibilityRole="link"
          >
            <Text style={styles.footerLinkText}>Privacy Policy</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

/** ─── Sub-components ─────────────────────────────────────── */

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailIcon}>{icon}</View>
      <Text style={styles.detailLabel}>{label}</Text>
      <View style={{ flex: 1 }} />
      <Text style={styles.detailValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function ActionRow({
  icon,
  label,
  onPress,
  highlight,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  highlight?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionRow,
        highlight && styles.actionRowHighlight,
        pressed && styles.actionRowPressed,
        disabled && styles.actionRowDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <View style={styles.detailIcon}>{icon}</View>
      <Text
        style={[
          styles.actionLabel,
          highlight && styles.actionLabelHighlight,
          disabled && styles.actionLabelDisabled,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** ─── Styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F1B2D" },
  scrollContent: { paddingHorizontal: 24, gap: 20 },
  orbTop: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(200,160,90,0.08)",
    top: -60,
    right: -40,
  },
  orbBottom: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(139,124,200,0.06)",
    bottom: 80,
    left: -50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtn: {
    position: "absolute",
    left: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  backBtnPressed: {
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: -0.3,
  },
  loadingContainer: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
  },
  statusCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: Radii.lg,
    padding: 24,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  statusCardPro: {
    borderColor: "rgba(200,160,90,0.25)",
    backgroundColor: "rgba(200,160,90,0.08)",
  },
  statusBadge: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E8C988",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
  },
  statusBadgeFree: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  statusBody: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    lineHeight: 20,
    maxWidth: 280,
  },
  planPillRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  activeBadge: {
    backgroundColor: "rgba(200,160,90,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.gold,
    textTransform: "capitalize",
  },
  section: { gap: 10 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  detailsCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: Radii.md,
    overflow: "hidden",
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  detailIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.6)",
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.85)",
    maxWidth: 160,
  },
  entitlementsCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: Radii.md,
    overflow: "hidden",
  },
  entitlementRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  entitlementLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.45)",
  },
  entitlementLabelActive: {
    color: "#FFFFFF",
  },
  entitlementMeta: {
    fontSize: 11,
    color: "rgba(255,255,255,0.35)",
    marginTop: 2,
  },
  actionsCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: Radii.md,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  actionRowHighlight: {
    backgroundColor: "rgba(200,160,90,0.12)",
  },
  actionRowPressed: {
    opacity: 0.7,
  },
  actionRowDisabled: {
    opacity: 0.4,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.8)",
  },
  actionLabelHighlight: {
    color: Colors.gold,
  },
  actionLabelDisabled: {
    color: "rgba(255,255,255,0.3)",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  footerLink: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  footerLinkText: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.25)",
  },
  footerDot: {
    fontSize: 11,
    color: "rgba(255,255,255,0.15)",
  },
});
