import { Platform } from "react-native";
import Purchases from "react-native-purchases";

const TEST_KEY = process.env.EXPO_PUBLIC_REVENUECAT_TEST_API_KEY;
const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

function getRCToken(): string {
  if (__DEV__ || Platform.OS === "web") {
    return TEST_KEY ?? "";
  }
  return (
    Platform.select({
      ios: IOS_KEY,
      android: ANDROID_KEY,
      default: TEST_KEY,
    }) ?? ""
  );
}

const apiKey = getRCToken();

if (apiKey) {
  Purchases.configure({ apiKey });
}

export { Purchases };

/** Check if the user has an active pro entitlement. */
export async function checkProEntitlement(): Promise<boolean> {
  try {
    const info = await Purchases.getCustomerInfo();
    return info.entitlements.active["pro"] !== undefined;
  } catch {
    return false;
  }
}
