import { useCallback, useState } from "react";
import { Platform, Alert } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";

const LINKEDIN_STORAGE_KEY = "socialcapital:linkedin:v1";

const LINKEDIN_CLIENT_ID =
  process.env.EXPO_PUBLIC_LINKEDIN_CLIENT_ID ?? "";

/** The user's LinkedIn profile data that we pull after OAuth. */
export interface LinkedInProfile {
  sub: string;
  name: string;
  picture?: string;
  headline?: string;
  company?: string;
  linkedInUrl?: string;
}

/**
 * Hook that provides a `connectLinkedIn` function for LinkedIn OAuth 2.0
 * with PKCE. Stores the resulting profile in SecureStore so it survives
 * app restarts. Returns the currently stored LinkedIn profile if any.
 */
export function useLinkedIn() {
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /** Load the stored LinkedIn profile on mount. */
  const loadStored = useCallback(async () => {
    try {
      const raw = await SecureStore.getItemAsync(LINKEDIN_STORAGE_KEY);
      if (raw) {
        setProfile(JSON.parse(raw) as LinkedInProfile);
      }
    } catch {
      // no stored profile
    }
  }, []);

  // Load once on first render
  if (!profile) {
    loadStored().catch(() => {});
  }

  const connectLinkedIn = useCallback(async (): Promise<LinkedInProfile | null> => {
    setLoading(true);
    setError(null);

    try {
      if (!LINKEDIN_CLIENT_ID) {
        throw new Error(
          "LinkedIn client ID not configured. Add EXPO_PUBLIC_LINKEDIN_CLIENT_ID to your environment.",
        );
      }

      const redirectUri = AuthSession.makeRedirectUri({
        scheme: "socialcapital",
      });

      const discovery = {
        authorizationEndpoint: "https://www.linkedin.com/oauth/v2/authorization",
        tokenEndpoint: "https://www.linkedin.com/oauth/v2/accessToken",
      };

      const request = new AuthSession.AuthRequest({
        clientId: LINKEDIN_CLIENT_ID,
        redirectUri,
        scopes: ["openid", "profile", "email"],
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
      });

      const result = await request.promptAsync(discovery, {
        presentationStyle: AuthSession.PresentationStyle.FullScreen,
      });

      if (result.type !== "success") {
        if (result.type === "cancel" || result.type === "dismiss") {
          return null;
        }
        throw new Error(
          `LinkedIn auth failed: ${JSON.stringify(result)}`,
        );
      }

      const { code } = result.params;
      if (!code) {
        throw new Error("No authorization code received from LinkedIn.");
      }

      // Exchange code for token
      const codeVerifier = request.codeVerifier;
      if (!codeVerifier) {
        throw new Error("Missing PKCE code verifier.");
      }

      const tokenResponse = await fetch(discovery.tokenEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code as string,
          redirect_uri: redirectUri,
          client_id: LINKEDIN_CLIENT_ID,
          code_verifier: codeVerifier,
        }).toString(),
      });

      if (!tokenResponse.ok) {
        const errBody = await tokenResponse.text().catch(() => "");
        throw new Error(`Token exchange failed: ${tokenResponse.status} ${errBody}`);
      }

      const tokens = await tokenResponse.json() as {
        access_token: string;
        id_token?: string;
      };

      if (!tokens.access_token) {
        throw new Error("No access token in LinkedIn response.");
      }

      // Fetch user profile from LinkedIn
      const userResponse = await fetch(
        "https://api.linkedin.com/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${tokens.access_token}`,
          },
        },
      );

      if (!userResponse.ok) {
        throw new Error(
          `Failed to fetch LinkedIn profile: ${userResponse.status}`,
        );
      }

      const linkedInUser = await userResponse.json() as {
        sub: string;
        name: string;
        picture?: string;
        email?: string;
      };

      const userProfile: LinkedInProfile = {
        sub: linkedInUser.sub,
        name: linkedInUser.name,
        picture: linkedInUser.picture,
      };

      // Persist to SecureStore
      await SecureStore.setItemAsync(
        LINKEDIN_STORAGE_KEY,
        JSON.stringify(userProfile),
      );

      setProfile(userProfile);
      return userProfile;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "LinkedIn connection failed";
      setError(message);

      if (Platform.OS !== "web") {
        Alert.alert(
          "LinkedIn Connection",
          message.includes("client ID")
            ? "LinkedIn integration needs to be configured. Please add your LinkedIn app credentials."
            : message,
        );
      }

      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { profile, loading, error, connectLinkedIn };
}
