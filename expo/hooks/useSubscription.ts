import { useQuery } from "@tanstack/react-query";
import {
  checkProEntitlement,
  Purchases,
} from "@/lib/revenuecat";

export interface PackageItem {
  id: string;
  price: string;
  period: string;
  raw: unknown;
}

export function useSubscription() {
  const proQuery = useQuery<boolean>({
    queryKey: ["subscription", "pro"],
    queryFn: checkProEntitlement,
    staleTime: 60_000,
  });

  const offeringsQuery = useQuery<PackageItem[]>({
    queryKey: ["subscription", "offerings"],
    queryFn: async () => {
      const offerings = await Purchases.getOfferings();
      const current = offerings.current;
      if (!current) return [];
      return (
        current.availablePackages.map((pkg) => ({
          id: pkg.identifier,
          price: pkg.product.priceString,
          period: pkg.product.normalPeriod ?? "",
          raw: pkg,
        })) as PackageItem[]
      );
    },
    staleTime: 300_000,
  });

  const purchasePackage = async (pkgId: string) => {
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
      return { success: isPro, error: null };
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Purchase failed";
      if (
        msg.includes("cancelled") ||
        msg.includes("Cancel") ||
        msg.includes("cancel")
      ) {
        return { success: false, error: null }; // user cancelled
      }
      return { success: false, error: msg };
    }
  };

  const restorePurchases = async () => {
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
    packages: offeringsQuery.data ?? [],
    purchasePackage,
    restorePurchases,
  };
}
