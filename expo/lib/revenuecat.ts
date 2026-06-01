import { Platform } from "react-native";
import Purchases from "react-native-purchases";

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;
const WEB_KEY = process.env.EXPO_PUBLIC_REVENUECAT_WEB_API_KEY;

let hasConfiguredRevenueCat = false;
let configurationError: string | null = null;

function getRCToken(): string {
  return (
    Platform.select({
      ios: IOS_KEY,
      android: ANDROID_KEY,
      web: WEB_KEY,
      default: undefined,
    }) ?? ""
  );
}

function configureRevenueCat(): void {
  const apiKey = getRCToken();

  if (!apiKey) {
    configurationError =
      Platform.OS === "web"
        ? "RevenueCat Web Billing is not configured for preview."
        : "RevenueCat API key is missing for this platform.";
    return;
  }

  try {
    Purchases.configure({ apiKey });
    hasConfiguredRevenueCat = true;
    configurationError = null;
  } catch (error: unknown) {
    hasConfiguredRevenueCat = false;
    configurationError =
      error instanceof Error
        ? error.message
        : "RevenueCat could not be configured.";
  }
}

configureRevenueCat();

export { Purchases };

/** Returns whether RevenueCat is configured for the current platform. */
export function isRevenueCatConfigured(): boolean {
  return hasConfiguredRevenueCat;
}

/** Returns the current RevenueCat configuration issue, if any. */
export function getRevenueCatConfigurationError(): string | null {
  return configurationError;
}

/** Check if the user has an active pro entitlement. */
export async function checkProEntitlement(): Promise<boolean> {
  if (!hasConfiguredRevenueCat) {
    return false;
  }

  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active["pro"] !== undefined;
  } catch {
    return false;
  }
}
