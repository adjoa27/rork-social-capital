import React, { useState } from "react";
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
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import {
  useSubscription,
  type PackageItem,
} from "@/hooks/useSubscription";

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const { packages, isLoading, purchasePackage, restorePurchases } =
    useSubscription();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [restoring, setRestoring] = useState(false);

  const handlePurchase = async (pkg: PackageItem) => {
    setError(null);
    setPurchasing(pkg.id);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
        () => {},
      );
    }
    const result = await purchasePackage(pkg.id);
    setPurchasing(null);
    if (result.success) {
      Haptics.notificationAsync(
        Haptics.NotificationFeedbackType.Success,
      ).catch(() => {});
      router.back();
    } else if (result.error) {
      setError(result.error);
    }
  };

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
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={10}
        >
          <ArrowLeft size={20} color={Colors.text} strokeWidth={2.4} />
        </Pressable>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <LinearGradient
            colors={["#1A2740", "#0F1B2D"]}
            style={styles.crownWrap}
          >
            <Crown size={32} color="#E8C988" strokeWidth={2.2} />
          </LinearGradient>
          <Text style={styles.heroTitle}>Social Capital Pro</Text>
          <Text style={styles.heroSub}>
            Upgrade for unlimited AI-powered relationship management.
          </Text>
        </View>

        <View style={styles.features}>
          <FeatureRow
            icon={<Sparkles size={18} color={Colors.goldDeep} />}
            label="Unlimited AI message generation"
          />
          <FeatureRow
            icon={<Infinity size={18} color={Colors.goldDeep} />}
            label="Custom reminder cadences"
          />
          <FeatureRow
            icon={<Crown size={18} color={Colors.goldDeep} />}
            label="Advanced relationship analytics"
          />
          <FeatureRow
            icon={<Check size={18} color={Colors.goldDeep} />}
            label="Priority AI suggestions & insights"
          />
        </View>

        {isLoading ? (
          <ActivityIndicator
            color={Colors.goldDeep}
            style={{ marginTop: 24 }}
          />
        ) : (
          <View style={styles.plans}>
            {packages.map((pkg) => (
              <Pressable
                key={pkg.id}
                onPress={() => handlePurchase(pkg)}
                disabled={purchasing !== null}
                style={({ pressed }) => [
                  styles.planCard,
                  pressed && { opacity: 0.9 },
                ]}
              >
                <View style={styles.planMain}>
                  <Text style={styles.planPeriod}>{pkg.period}</Text>
                  <Text style={styles.planPrice}>{pkg.price}</Text>
                </View>
                {purchasing === pkg.id ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <LinearGradient
                    colors={["#C8A05A", "#A4823F"]}
                    style={styles.planBtn}
                  >
                    <Text style={styles.planBtnText}>Subscribe</Text>
                  </LinearGradient>
                )}
              </Pressable>
            ))}
          </View>
        )}

        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        <Pressable
          onPress={handleRestore}
          disabled={restoring}
          style={styles.restoreBtn}
        >
          {restoring ? (
            <ActivityIndicator size="small" color={Colors.textSecondary} />
          ) : (
            <Text style={styles.restoreText}>Restore purchases</Text>
          )}
        </Pressable>

        <Text style={styles.termsText}>
          Payment will be charged to your Apple ID or Google account.
          Subscription auto-renews unless cancelled at least 24 hours before
          the end of the period. Manage in account settings.
        </Text>
      </ScrollView>
    </View>
  );
}

function FeatureRow({
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  scroll: {
    paddingHorizontal: 24,
    gap: 28,
  },
  hero: {
    alignItems: "center",
    gap: 12,
    paddingTop: 12,
  },
  crownWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.25,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.6,
  },
  heroSub: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  features: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
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
    backgroundColor: Colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  featureLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
  },
  plans: {
    gap: 12,
  },
  planCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  planMain: {
    gap: 2,
  },
  planPeriod: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    textTransform: "capitalize",
  },
  planPrice: {
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.4,
  },
  planBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  planBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  errorText: {
    color: "#DC2626",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  restoreBtn: {
    alignSelf: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  termsText: {
    fontSize: 12,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});
