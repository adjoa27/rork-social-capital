import { useQuery } from "@tanstack/react-query";
import {
  checkProEntitlement,
  getRevenueCatConfigurationError,
  isRevenueCatConfigured,
  Purchases,
} from "@/lib/revenuecat";

export interface PackageItem {
  id: string;
  price: string;
  period: string;
  raw: unknown;
}

export interface PurchaseResult {
  success: boolean;
  error: string | null;
}

export interface SubscriptionState {
  isPro: boolean;
  isLoading: boolean;
  isConfigured: boolean;
  configurationError: string | null;
  packages: PackageItem[];
  purchasePackage: (pkgId: string) => Promise<PurchaseResult>;
  restorePurchases: () => Promise<PurchaseResult>;
}

export function useSubscription(): SubscriptionState {
  const isConfigured = isRevenueCatConfigured();
  const configurationError = getRevenueCatConfigurationError();

  const proQuery = useQuery<boolean>({
    queryKey: ["subscription", "pro"],
    queryFn: checkProEntitlement,
    staleTime: 60_000,
  });

  const offeringsQuery = useQuery<PackageItem[]>({
    queryKey: ["subscription", "offerings"],
    queryFn: async (): Promise<PackageItem[]> => {
      if (!isConfigured) {
        return [];
      }

      try {
        const offerings = await Purchases.getOfferings();
        const current = offerings.current;
        if (!current) return [];
        return current.availablePackages.map((pkg) => ({
          id: pkg.identifier,
          price: pkg.product.priceString,
          period: (pkg.product as { subscriptionPeriod?: string }).subscriptionPeriod ?? "",
          raw: pkg,
        })) as PackageItem[];
      } catch {
        return [];
      }
    },
    staleTime: 300_000,
  });

  const purchasePackage = async (pkgId: string): Promise<PurchaseResult> => {
    if (!isConfigured) {
      return {
        success: false,
        error:
          configurationError ??
          "Purchases are not configured for this platform yet.",
      };
    }

    if (!offeringsQuery.data) return { success: false, error: "No packages" };
    const found = offeringsQuery.data.find((p) => p.id === pkgId);
    if (!found) return { success: false, error: "Package not found" };

    try {
      const { customerInfo } = await Purchases.purchasePackage(
        found.raw as never,
      );
      const isPro =
        customerInfo.entitlements.active["pro"] !== undefined;
      await proQuery.refetch();
      return { success: isPro, error: isPro ? null : "Purchase completed but pro entitlement not found." };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Purchase failed";
      const lower = msg.toLowerCase();
      if (lower.includes("cancel")) {
        return { success: false, error: null };
      }
      return { success: false, error: msg };
    }
  };

  const restorePurchases = async (): Promise<PurchaseResult> => {
    if (!isConfigured) {
      return {
        success: false,
        error:
          configurationError ??
          "Purchases are not configured for this platform yet.",
      };
    }

    try {
      const info = await Purchases.restorePurchases();
      const isPro = info.entitlements.active["pro"] !== undefined;
      await proQuery.refetch();
      return { success: isPro, error: null };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Restore failed";
      return { success: false, error: msg };
    }
  };

  return {
    isPro: proQuery.data ?? false,
    isLoading: proQuery.isLoading || offeringsQuery.isLoading,
    isConfigured,
    configurationError,
    packages: offeringsQuery.data ?? [],
    purchasePackage,
    restorePurchases,
  };
}
