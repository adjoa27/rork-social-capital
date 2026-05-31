import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  Check,
  Crown,
  Infinity,
  Mic,
  Sparkles,
  X,
  Zap,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Gradients, Radii } from "@/constants/colors";
import {
  usePurchases,
  ENTITLEMENT_SOCIAL_CAPITAL_PRO,
  PACKAGE_YEARLY,
  PACKAGE_MONTHLY,
} from "@/providers/PurchasesProvider";
import type { PurchasesPackage } from "react-native-purchases";

const PERKS = [
  { icon: Infinity, label: "Unlimited AI message drafts" },
  { icon: Mic, label: "Voice notes & recordings" },
  { icon: Sparkles, label: "Smart calendar sync" },
  { icon: Zap, label: "LinkedIn contact sync" },
  { icon: Crown, label: "Priority support" },
] as const;

type PlanId = typeof PACKAGE_YEARLY | typeof PACKAGE_MONTHLY;

interface PlanOption {
  id: PlanId;
  label: string;
  sublabel: string;
  badge?: string;
}

const PLANS: PlanOption[] = [
  { id: PACKAGE_YEARLY, label: "Yearly", sublabel: "Save 40%", badge: "Best value" },
  { id: PACKAGE_MONTHLY, label: "Monthly", sublabel: "Flexible" },
];

function getPrice(pkg: PurchasesPackage | null): string {
  return pkg?.product?.priceString ?? "—";
}

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const {
    offering,
    isLoadingOffering,
    purchasePackage,
    isPurchasing,
    restorePurchases,
    isRestoring,
    yearlyPackage,
    monthlyPackage,
  } = usePurchases();

  const [selectedPlan, setSelectedPlan] = useState<PlanId>(PACKAGE_YEARLY);

  const packageMap = useMemo(
    () => ({
      [PACKAGE_YEARLY]: yearlyPackage,
      [PACKAGE_MONTHLY]: monthlyPackage,
    }),
    [yearlyPackage, monthlyPackage]
  );

  const selectedPkg = packageMap[selectedPlan];

  const handlePurchase = useCallback(async () => {
    if (!selectedPkg) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});

    const result = await purchasePackage(selectedPkg);
    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
      Alert.alert(
        "Welcome to Social Capital Pro!",
        "You now have unlimited access to all features.",
        [{ text: "Let's go", onPress: () => router.back() }]
      );
    } else if (result.error === "cancelled") {
      return; // User cancelled — silently return
    } else if (result.error?.includes("pending")) {
      Alert.alert(
        "Payment Pending",
        "Your payment is being processed. You'll get access as soon as it's approved."
      );
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(
        () => {}
      );
      Alert.alert(
        "Something went wrong",
        result.error ?? "Please try again later."
      );
    }
  }, [selectedPkg, purchasePackage]);

  const handleRestore = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const info = await restorePurchases();
    if (info.entitlements.active[ENTITLEMENT_SOCIAL_CAPITAL_PRO]) {
      Alert.alert("Restored!", "Your Social Capital Pro access has been restored.");
      router.back();
    } else {
      Alert.alert(
        "No subscription found",
        "We couldn't find an active Social Capital Pro subscription on your account."
      );
    }
  }, [restorePurchases]);

  const isLoading = isLoadingOffering || isPurchasing || isRestoring;
  const hasOfferings = yearlyPackage || monthlyPackage;

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={["#0F1B2D", "#1A2A40", "#0F1B2D"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative orbs */}
      <View style={styles.orbTop} />
      <View style={styles.orbBottom} />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            style={({ pressed }) => [
              styles.closeBtn,
              pressed && styles.closeBtnPressed,
            ]}
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityLabel="Close"
            accessibilityRole="button"
          >
            <X size={20} color="rgba(255,255,255,0.7)" strokeWidth={2.2} />
          </Pressable>
          <Text style={styles.eyebrow}>Social Capital Pro</Text>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <LinearGradient
            colors={["#E8C988", "#C8A05A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.crownBadge}
          >
            <Crown size={24} color="#FFFFFF" strokeWidth={2} />
          </LinearGradient>
          <Text style={styles.heroTitle}>Stay meaningfully{"\n"}connected.</Text>
          <Text style={styles.heroBody}>
            Unlimited AI-crafted messages, voice notes, and smart reminders — so
            every relationship stays warm.
          </Text>
        </View>

        {/* Perks */}
        <View style={styles.perks}>
          {PERKS.map((perk) => (
            <View key={perk.label} style={styles.perkRow}>
              <View style={styles.perkIcon}>
                <perk.icon size={16} color={Colors.gold} strokeWidth={2.4} />
              </View>
              <Text style={styles.perkLabel}>{perk.label}</Text>
              <Check
                size={14}
                color={Colors.goldDeep}
                strokeWidth={2.6}
                style={{ marginLeft: "auto" }}
              />
            </View>
          ))}
        </View>

        {/* Plan Selector */}
        {hasOfferings ? (
          <View style={styles.plansSection}>
            <Text style={styles.plansLabel}>Choose your plan</Text>
            <View style={styles.plansGrid}>
              {PLANS.map((plan) => {
                const pkg = packageMap[plan.id];
                const isSelected = selectedPlan === plan.id;
                return (
                  <Pressable
                    key={plan.id}
                    style={({ pressed }) => [
                      styles.planCard,
                      isSelected && styles.planCardSelected,
                      pressed && styles.planCardPressed,
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light
                      ).catch(() => {});
                      setSelectedPlan(plan.id);
                    }}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                  >
                    {plan.badge ? (
                      <View style={styles.planBadge}>
                        <Text style={styles.planBadgeText}>{plan.badge}</Text>
                      </View>
                    ) : null}
                    <Text
                      style={[
                        styles.planLabel,
                        isSelected && styles.planLabelSelected,
                      ]}
                    >
                      {plan.label}
                    </Text>
                    <Text style={styles.planSublabel}>{plan.sublabel}</Text>
                    <Text
                      style={[
                        styles.planPrice,
                        isSelected && styles.planPriceSelected,
                      ]}
                    >
                      {getPrice(pkg)}
                    </Text>
                    {/* Selection indicator */}
                    {isSelected ? (
                      <View style={styles.planCheck}>
                        <Check size={12} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    ) : (
                      <View style={styles.planCircle} />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* CTA */}
        <View style={styles.ctaSection}>
          {isLoadingOffering && !hasOfferings ? (
            <View style={styles.ctaLoading}>
              <ActivityIndicator color="rgba(255,255,255,0.6)" />
              <Text style={styles.ctaLoadingText}>Loading plans…</Text>
            </View>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.ctaBtn,
                pressed && styles.ctaBtnPressed,
                (!selectedPkg || isPurchasing) && styles.ctaBtnDisabled,
              ]}
              onPress={handlePurchase}
              disabled={!selectedPkg || isPurchasing}
              accessibilityLabel={`Continue with ${selectedPlan} plan`}
              accessibilityRole="button"
            >
              <LinearGradient
                colors={
                  selectedPkg
                    ? ["#E8C988", "#C8A05A"]
                    : ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.08)"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={StyleSheet.absoluteFill}
              />
              {isPurchasing ? (
                <ActivityIndicator color="#0F1B2D" />
              ) : (
                <>
                  <Text
                    style={[
                      styles.ctaText,
                      !selectedPkg && styles.ctaTextDisabled,
                    ]}
                  >
                    Continue
                  </Text>
                  {selectedPkg?.product?.priceString ? (
                    <Text
                      style={[
                        styles.ctaPrice,
                        !selectedPkg && styles.ctaTextDisabled,
                      ]}
                    >
                      {selectedPkg.product.priceString}
                      {selectedPlan === PACKAGE_MONTHLY ? (
                        <Text style={styles.ctaPeriod}> /month</Text>
                      ) : (
                        <Text style={styles.ctaPeriod}> /year</Text>
                      )}
                    </Text>
                  ) : null}
                </>
              )}
            </Pressable>
          )}

          <Text style={styles.ctaFootnote}>
            Cancel anytime.{" "}
            {selectedPlan === PACKAGE_YEARLY
              ? "Billed annually."
              : "Billed monthly."}{" "}
            Payment will be charged to your{" "}
            {Platform.OS === "ios" ? "Apple ID" : "Google Play"} account.
          </Text>

          {/* Restore */}
          <Pressable
            style={({ pressed }) => [
              styles.restoreBtn,
              pressed && styles.restoreBtnPressed,
            ]}
            onPress={handleRestore}
            disabled={isRestoring}
            accessibilityLabel="Restore purchases"
            accessibilityRole="button"
          >
            {isRestoring ? (
              <ActivityIndicator size="small" color="rgba(255,255,255,0.5)" />
            ) : (
              <Text style={styles.restoreText}>Restore purchases</Text>
            )}
          </Pressable>
        </View>

        {/* Legal footer */}
        <View style={styles.legalRow}>
          <Pressable
            onPress={() => router.push("/terms")}
            style={styles.legalLink}
            accessibilityLabel="Terms of Service"
            accessibilityRole="link"
          >
            <Text style={styles.legalLinkText}>Terms of Service</Text>
          </Pressable>
          <Text style={styles.legalDot}>·</Text>
          <Pressable
            onPress={() => router.push("/privacy")}
            style={styles.legalLink}
            accessibilityLabel="Privacy Policy"
            accessibilityRole="link"
          >
            <Text style={styles.legalLinkText}>Privacy Policy</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1B2D",
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 24,
  },
  orbTop: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(200,160,90,0.10)",
    top: -80,
    right: -60,
  },
  orbBottom: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(139,124,200,0.08)",
    bottom: 100,
    left: -70,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    position: "absolute",
    left: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnPressed: {
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.gold,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  hero: {
    alignItems: "center",
    gap: 14,
    paddingTop: 8,
  },
  crownBadge: {
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#E8C988",
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.8,
    lineHeight: 40,
  },
  heroBody: {
    fontSize: 15,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    lineHeight: 22,
    maxWidth: 300,
  },
  perks: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: Radii.lg,
    padding: 6,
    gap: 2,
  },
  perkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  perkIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(200,160,90,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  perkLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  plansSection: {
    gap: 12,
  },
  plansLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    textAlign: "center",
  },
  plansGrid: {
    flexDirection: "row",
    gap: 10,
  },
  planCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: Radii.md,
    padding: 16,
    alignItems: "center",
    gap: 6,
    borderWidth: 1.5,
    borderColor: "transparent",
    position: "relative",
    overflow: "hidden",
  },
  planCardSelected: {
    backgroundColor: "rgba(200,160,90,0.12)",
    borderColor: Colors.gold,
  },
  planCardPressed: {
    opacity: 0.85,
  },
  planBadge: {
    position: "absolute",
    top: 0,
    right: 0,
    backgroundColor: Colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderBottomLeftRadius: 8,
  },
  planBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#0F1B2D",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  planLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
  },
  planLabelSelected: {
    color: Colors.gold,
  },
  planSublabel: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.4)",
  },
  planPrice: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    marginTop: 2,
  },
  planPriceSelected: {
    color: Colors.gold,
  },
  planCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.gold,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  planCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.2)",
    marginTop: 4,
  },
  ctaSection: {
    gap: 10,
    alignItems: "center",
  },
  ctaLoading: {
    height: 58,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: Radii.lg,
  },
  ctaLoadingText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.4)",
  },
  ctaBtn: {
    width: "100%",
    height: 58,
    borderRadius: Radii.lg,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  ctaBtnPressed: {
    opacity: 0.9,
  },
  ctaBtnDisabled: {
    opacity: 0.6,
  },
  ctaText: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F1B2D",
    letterSpacing: -0.3,
  },
  ctaTextDisabled: {
    color: "rgba(255,255,255,0.4)",
  },
  ctaPrice: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F1B2D",
    letterSpacing: -0.3,
  },
  ctaPeriod: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(15,27,45,0.6)",
  },
  ctaFootnote: {
    fontSize: 12,
    color: "rgba(255,255,255,0.3)",
    textAlign: "center",
    lineHeight: 18,
  },
  restoreBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: Radii.pill,
  },
  restoreBtnPressed: {
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  restoreText: {
    fontSize: 13,
    fontWeight: "600",
    color: "rgba(255,255,255,0.45)",
  },
  legalRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: -4,
  },
  legalLink: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  legalLinkText: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(255,255,255,0.25)",
  },
  legalDot: {
    fontSize: 11,
    color: "rgba(255,255,255,0.15)",
  },
});
