import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Platform } from "react-native";
import {
  ArrowLeft,
  Check,
  Crown,
  Infinity,
  Sparkles,
  Zap,
  X,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors, Radii } from "@/constants/colors";
import {
  useSubscription,
  type PackageItem,
} from "@/hooks/useSubscription";

type Plan = "monthly" | "annual";

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const { packages, isLoading, purchasePackage, restorePurchases } =
    useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<Plan>("annual");
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = useCallback(async () => {
    setError(null);
    setPurchasing(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
    }

    const targetPkg = packages.find((p) => {
      const pd = (p.period ?? "").toUpperCase();
      if (!pd) return false;
      const isAnnual = pd.includes("Y") && !pd.includes("M");
      const isMonthly = pd.includes("M") && !pd.includes("Y");
      return selectedPlan === "annual" ? isAnnual : isMonthly;
    });

    if (!targetPkg) {
      setPurchasing(false);
      if (packages.length === 0) {
        setError(
          "No subscription plans are available right now. " +
            "RevenueCat products may not be configured yet.",
        );
      } else {
        setError(
          `No ${selectedPlan} plan found. Available: ${packages.map((p) => p.period || "non-subscription").join(", ")}`,
        );
      }
      return;
    }

    const result = await purchasePackage(targetPkg.id);
    setPurchasing(false);

    if (result.success) {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});
      router.back();
    } else if (result.error) {
      setError(result.error);
    }
  }, [selectedPlan, packages, purchasePackage]);

  const handleRestore = async () => {
    setError(null);
    setRestoring(true);
    const result = await restorePurchases();
    setRestoring(false);
    if (result.success) {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});
      router.back();
    } else if (result.error) {
      setError(result.error);
    }
  };

  return (
    <View style={styles.screen}>
      <LinearGradient
        colors={["#0D1421", "#141E33", "#0D1421"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.topBar, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeBtn}
          hitSlop={12}
        >
          <X size={20} color="#8895AA" strokeWidth={2.6} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* ── Hero ── */}
        <View style={styles.hero}>
          <View style={styles.iconShell}>
            <LinearGradient
              colors={["#C8A05A", "#E8C988"]}
              style={styles.iconGradient}
            >
              <Crown size={26} color="#0D1421" strokeWidth={2.4} />
            </LinearGradient>
          </View>

          <Text style={styles.heroTitle}>Social Capital Pro</Text>
          <Text style={styles.heroSub}>
            Unlimited AI-powered relationship management.{"\n"}
            Build deeper connections, effortlessly.
          </Text>
        </View>

        {/* ── Feature grid ── */}
        <View style={styles.featureList}>
          <FeatureItem
            icon={<Sparkles size={18} color={Colors.gold} />}
            label="Unlimited AI message generation"
          />
          <FeatureItem
            icon={<Infinity size={18} color={Colors.gold} />}
            label="Custom reminder cadences"
          />
          <FeatureItem
            icon={<Zap size={18} color={Colors.gold} />}
            label="Advanced relationship analytics"
          />
          <FeatureItem
            icon={<Crown size={18} color={Colors.gold} />}
            label="Priority AI suggestions & insights"
          />
        </View>

        {/* ── Plan selectors ── */}
        <Text style={styles.sectionLabel}>Choose your plan</Text>

        <View style={styles.planRow}>
          {/* Monthly */}
          <Pressable
            onPress={() => setSelectedPlan("monthly")}
            style={[
              styles.planCard,
              selectedPlan === "monthly" && styles.planCardSelected,
            ]}
          >
            {selectedPlan === "monthly" ? (
              <LinearGradient
                colors={["#1A2740", "#162032"]}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <View style={styles.planCardInner}>
              <Text style={styles.planLabel}>Monthly</Text>
              <Text style={styles.planPrice}>
                <Text style={styles.planDollar}>$</Text>
                4.99
              </Text>
              <Text style={styles.planUnit}>/ month</Text>
            </View>
          </Pressable>

          {/* Annual */}
          <Pressable
            onPress={() => setSelectedPlan("annual")}
            style={[
              styles.planCard,
              styles.planCardHero,
              selectedPlan === "annual" && styles.planCardSelected,
            ]}
          >
            {selectedPlan === "annual" ? (
              <LinearGradient
                colors={["#1E2D45", "#18273C"]}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            <View style={styles.bestValueBadge}>
              <LinearGradient
                colors={["#E8C988", "#C8A05A"]}
                style={styles.bestValueGradient}
              >
                <Text style={styles.bestValueLabel}>Best value</Text>
              </LinearGradient>
            </View>
            <View style={styles.planCardInner}>
              <Text style={styles.planLabel}>Annual</Text>
              <Text style={styles.planPrice}>
                <Text style={styles.planDollar}>$</Text>
                39.99
              </Text>
              <Text style={styles.planUnit}>/ year</Text>
              <View style={styles.savingsPill}>
                <Text style={styles.savingsText}>
                  $3.33 / mo — save 33%
                </Text>
              </View>
            </View>
          </Pressable>
        </View>

        {/* ── CTA ── */}
        {isLoading ? (
          <ActivityIndicator
            color={Colors.gold}
            style={{ marginTop: 12, alignSelf: "center" }}
          />
        ) : (
          <Pressable
            onPress={handlePurchase}
            disabled={purchasing}
            style={({ pressed }) => [
              styles.cta,
              pressed && { opacity: 0.88, transform: [{ scale: 0.985 }] },
            ]}
          >
            <LinearGradient
              colors={["#E8C988", "#C8A05A", "#A4823F"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ctaGradient}
            >
              {purchasing ? (
                <ActivityIndicator color="#0D1421" />
              ) : (
                <>
                  <Text style={styles.ctaText}>
                    {selectedPlan === "annual"
                      ? "Try 7 days free, then $39.99/year"
                      : "Subscribe for $4.99/month"}
                  </Text>
                  <ArrowLeft
                    size={16}
                    color="#0D1421"
                    strokeWidth={3}
                    style={{ transform: [{ rotate: "180deg" }] }}
                  />
                </>
              )}
            </LinearGradient>
          </Pressable>
        )}

        {/* ── Error ── */}
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Pressable
            onPress={handleRestore}
            disabled={restoring}
            style={styles.restoreBtn}
          >
            {restoring ? (
              <ActivityIndicator size="small" color="#5C6473" />
            ) : (
              <Text style={styles.restoreText}>Restore purchases</Text>
            )}
          </Pressable>

          <Text style={styles.termsText}>
            Payment will be charged to your Apple ID or Google account.
            Subscription auto-renews unless cancelled at least 24 hours before
            the end of the current period. Manage or cancel anytime in account
            settings.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

/* ── Feature row ── */
function FeatureItem({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <View style={styles.featureRow}>
      <View style={styles.featureIcon}>{icon}</View>
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

/* ── Styles ── */
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0D1421",
  },

  /* Top bar */
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    alignItems: "flex-end",
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* Scroll */
  scrollContent: {
    paddingHorizontal: 24,
    gap: 28,
  },

  /* Hero */
  hero: {
    alignItems: "center",
    gap: 14,
    paddingTop: 4,
  },
  iconShell: {
    width: 80,
    height: 80,
    borderRadius: 28,
    overflow: "hidden",
    shadowColor: "#E8C988",
    shadowOpacity: 0.35,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 6 },
  },
  iconGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.8,
  },
  heroSub: {
    fontSize: 15,
    color: "#8895AA",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 8,
  },

  /* Features */
  featureList: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: Radii.lg,
    padding: 18,
    gap: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(200,160,90,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  featureLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#D1D7E2",
    flex: 1,
  },

  /* Section label */
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#8895AA",
    textTransform: "uppercase",
    letterSpacing: 1.2,
    alignSelf: "center",
  },

  /* Plans */
  planRow: {
    flexDirection: "row",
    gap: 12,
  },
  planCard: {
    flex: 1,
    borderRadius: Radii.lg,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.06)",
    overflow: "hidden",
    position: "relative",
  },
  planCardHero: {
    borderColor: "rgba(200,160,90,0.35)",
    backgroundColor: "rgba(200,160,90,0.04)",
  },
  planCardSelected: {
    borderColor: "rgba(200,160,90,0.65)",
    shadowColor: "#C8A05A",
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  planCardInner: {
    padding: 18,
    alignItems: "center",
    gap: 4,
    zIndex: 1,
  },
  planLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#8895AA",
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -1.2,
  },
  planDollar: {
    fontSize: 20,
    fontWeight: "700",
    color: "#8895AA",
    marginRight: 2,
  },
  planUnit: {
    fontSize: 13,
    fontWeight: "600",
    color: "#5C6473",
    marginTop: -2,
  },

  /* Best value badge */
  bestValueBadge: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
  },
  bestValueGradient: {
    alignItems: "center",
    paddingVertical: 6,
    borderTopLeftRadius: Radii.lg,
    borderTopRightRadius: Radii.lg,
  },
  bestValueLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0D1421",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },

  /* Savings pill */
  savingsPill: {
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radii.pill,
    backgroundColor: "rgba(200,160,90,0.15)",
  },
  savingsText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#E8C988",
  },

  /* CTA */
  cta: {
    borderRadius: Radii.lg,
    overflow: "hidden",
    shadowColor: "#E8C988",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 6 },
  },
  ctaGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  ctaText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0D1421",
    letterSpacing: -0.3,
  },

  /* Error */
  errorBox: {
    backgroundColor: "rgba(229,72,77,0.12)",
    borderRadius: Radii.md,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(229,72,77,0.25)",
  },
  errorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#F87171",
    textAlign: "center",
  },

  /* Footer */
  footer: {
    alignItems: "center",
    gap: 16,
  },
  restoreBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#5C6473",
  },
  termsText: {
    fontSize: 12,
    color: "#3E4A5C",
    textAlign: "center",
    lineHeight: 18,
    paddingHorizontal: 8,
  },
});
