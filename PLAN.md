# Install missing expo-secure-store package


**Problem:** `expo-secure-store` is imported in `onboarding.tsx` and `index.tsx` but isn't listed as a dependency in `package.json`, causing the build to fail.

**Fix:** Install the `expo-secure-store` package, which is an Expo SDK module available in Expo Go. The API used (`setItemAsync`/`getItemAsync`) is standard and will work immediately after installation. No code changes needed.
