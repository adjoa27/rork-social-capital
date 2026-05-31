import { useEffect, useCallback } from "react";
import { Platform } from "react-native";
import Purchases, {
  type CustomerInfo,
  type PurchasesOffering,
  type PurchasesPackage,
  type PurchasesError,
  type PackageType,
  LOG_LEVEL,
} from "react-native-purchases";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import createContextHook from "@nkzw/create-context-hook";

/** ─── Entitlement & Product Constants ────────────────────── */

/** RevenueCat entitlement identifier for Social Capital Pro access. */
export const ENTITLEMENT_SOCIAL_CAPITAL_PRO = "social_capital_pro";

/** Package identifiers expected in the current offering. */
export const PACKAGE_YEARLY = "yearly";
export const PACKAGE_MONTHLY = "monthly";

/** ─── API Key Resolution ─────────────────────────────────── */

/** The user's Test Store API key — used in dev / web preview. */
const USER_TEST_KEY = "test_eVhdHgWITdXuFvghfuDozPKaikA";

function getRCToken(): string | null {
  const testKey =
    process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY ?? USER_TEST_KEY;
  const iosKey = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
  const androidKey = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

  if (__DEV__ || Platform.OS === "web") {
    // Prefer test key in dev; fall back to platform key if test looks invalid
    return (
      (testKey && testKey.startsWith("sk_") ? testKey : null) ??
      (testKey && testKey.startsWith("test_") ? testKey : null) ??
      Platform.select({ ios: iosKey, android: androidKey, default: null }) ??
      null
    );
  }
  return (
    Platform.select({
      ios: iosKey,
      android: androidKey,
      default: null,
    }) ?? null
  );
}

/** ─── Configure Once at Module Scope ─────────────────────── */

let rcReady = false;
try {
  const apiKey = getRCToken();
  if (apiKey) {
    Purchases.configure({ apiKey });
    // Enable debug logs in development
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }
    rcReady = true;
  }
} catch {
  // RevenueCat stays unconfigured; the provider handles the error state gracefully
}

/** ─── Context Type ───────────────────────────────────────── */

export interface PurchasesContextType {
  /** Whether RevenueCat was successfully configured */
  isConfigured: boolean;
  /** Current customer info (entitlements, active subscriptions) */
  customerInfo: CustomerInfo | null;
  /** True while initial customer info is loading */
  isLoadingCustomerInfo: boolean;
  /** Error from fetching customer info */
  customerInfoError: string | null;
  /** Current offering with all packages */
  offering: PurchasesOffering | null;
  /** True while offering is loading */
  isLoadingOffering: boolean;
  /** Whether user has the "Social Capital Pro" entitlement */
  isPro: boolean;
  /** Which package type the user has (if any) */
  activeProductType: PackageType | null;
  /** Purchase a specific package */
  purchasePackage: (pkg: PurchasesPackage) => Promise<{
    success: boolean;
    error?: string;
  }>;
  /** True while a purchase is in progress */
  isPurchasing: boolean;
  /** Restore previous purchases */
  restorePurchases: () => Promise<CustomerInfo>;
  /** True while restoring */
  isRestoring: boolean;
  /** Refetch customer info */
  refetchCustomerInfo: () => void;
  /** Convenience: get the yearly package from the offering */
  yearlyPackage: PurchasesPackage | null;
  /** Convenience: get the monthly package from the offering */
  monthlyPackage: PurchasesPackage | null;
}

/** ─── Helpers ────────────────────────────────────────────── */

function findPackage(
  offering: PurchasesOffering | null,
  identifier: string
): PurchasesPackage | null {
  return offering?.availablePackages?.find((p) => p.identifier === identifier) ?? null;
}

function getActiveProductType(
  customerInfo: CustomerInfo | null
): PackageType | null {
  if (!customerInfo) return null;
  const ent = customerInfo.entitlements.active[ENTITLEMENT_SOCIAL_CAPITAL_PRO];
  if (!ent) return null;
  // The product identifier usually contains the package type
  const pid = ent.productIdentifier.toLowerCase();
  if (pid.includes("yearly") || pid.includes("annual")) return "ANNUAL" as PackageType;
  if (pid.includes("monthly")) return "MONTHLY" as PackageType;
  return null;
}

/** ─── Provider ───────────────────────────────────────────── */

export const [PurchasesProvider, usePurchases] =
  createContextHook((): PurchasesContextType => {
    const queryClient = useQueryClient();

    /** ── Customer Info ──────────────────────────────────── */

    const {
      data: customerInfo = null,
      isLoading: isLoadingCustomerInfo,
      error: customerInfoErrorRaw,
      refetch: refetchCustomerInfo,
    } = useQuery<CustomerInfo | null>({
      queryKey: ["purchases", "customerInfo"],
      queryFn: async () => {
        if (!rcReady) return null;
        const info = await Purchases.getCustomerInfo();
        return info;
      },
      staleTime: 1000 * 60 * 2, // 2 min cache
      enabled: rcReady,
    });

    /** ── Offerings ──────────────────────────────────────── */

    const { data: offeringsData, isLoading: isLoadingOffering } = useQuery<{
      current: PurchasesOffering | null;
    }>({
      queryKey: ["purchases", "offerings"],
      queryFn: async () => {
        if (!rcReady) return { current: null };
        const offerings = await Purchases.getOfferings();
        return { current: offerings.current ?? null };
      },
      staleTime: 1000 * 60 * 5,
      enabled: rcReady,
    });

    const offering = offeringsData?.current ?? null;

    /** ── Derived State ──────────────────────────────────── */

    const isPro =
      customerInfo?.entitlements?.active?.[ENTITLEMENT_SOCIAL_CAPITAL_PRO] !==
      undefined;

    const activeProductType = getActiveProductType(customerInfo);

    const yearlyPackage = findPackage(offering, PACKAGE_YEARLY);
    const monthlyPackage = findPackage(offering, PACKAGE_MONTHLY);

    /** ── Purchase Mutation ──────────────────────────────── */

    const { mutateAsync: purchasePackageMutate, isPending: isPurchasing } =
      useMutation({
        mutationFn: async (pkg: PurchasesPackage) => {
          const result = await Purchases.purchasePackage(pkg);
          return result;
        },
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ["purchases", "customerInfo"],
          });
        },
      });

    const purchasePackage = useCallback(
      async (
        pkg: PurchasesPackage
      ): Promise<{ success: boolean; error?: string }> => {
        try {
          const result = await purchasePackageMutate(pkg);
          if (
            result.customerInfo.entitlements.active[ENTITLEMENT_SOCIAL_CAPITAL_PRO]
          ) {
            return { success: true };
          }
          return {
            success: false,
            error:
              "Purchase completed but Social Capital Pro entitlement was not granted.",
          };
        } catch (err) {
          const rcErr = err as PurchasesError;
          // User cancelled — not an error
          if (rcErr.userCancelled) {
            return { success: false, error: "cancelled" };
          }
          // Payment pending (e.g. SCA, parental approval) — still may succeed later
          if (
            rcErr.code ===
            (Purchases as unknown as Record<string, number>)
              .PURCHASES_ERROR_CODE?.PAYMENT_PENDING_ERROR
          ) {
            return {
              success: true,
              error: "Payment is pending approval.",
            };
          }
          return {
            success: false,
            error: rcErr.message ?? "Purchase failed. Please try again.",
          };
        }
      },
      [purchasePackageMutate]
    );

    /** ── Restore Mutation ───────────────────────────────── */

    const { mutateAsync: restoreMutate, isPending: isRestoring } = useMutation({
      mutationFn: async () => {
        const info = await Purchases.restorePurchases();
        return info;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["purchases", "customerInfo"],
        });
      },
    });

    const restorePurchases = useCallback(async (): Promise<CustomerInfo> => {
      return await restoreMutate();
    }, [restoreMutate]);

    /** ── Real-time Customer Info Listener ───────────────── */

    useEffect(() => {
      if (!rcReady) return;
      const unsub = Purchases.addCustomerInfoUpdateListener((info) => {
        queryClient.setQueryData(["purchases", "customerInfo"], info);
      });
      return () => {
        // The listener returns a function that removes itself
        unsub.remove?.();
      };
    }, [queryClient]);

    /** ── Error ──────────────────────────────────────────── */

    const customerInfoError = customerInfoErrorRaw
      ? (customerInfoErrorRaw as Error).message
      : null;

    return {
      isConfigured: rcReady,
      customerInfo,
      isLoadingCustomerInfo,
      customerInfoError,
      offering,
      isLoadingOffering,
      isPro,
      activeProductType,
      purchasePackage,
      isPurchasing,
      restorePurchases,
      isRestoring,
      refetchCustomerInfo,
      yearlyPackage,
      monthlyPackage,
    };
  });
