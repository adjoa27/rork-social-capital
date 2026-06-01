import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import type { Database } from "@/src/integrations/supabase/types";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

/** Supabase only accepts JWT access tokens. Rork preview/email sessions can be local JSON or opaque tokens. */
function isJwt(token: string | null): token is string {
  if (!token) return false;
  return token.split(".").length === 3;
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
  },
  accessToken: async () => {
    const token = await SecureStore.getItemAsync("access_token");
    return isJwt(token) ? token : undefined;
  },
});

export async function syncProfile(user: {
  id: string;
  email?: string;
  name?: string;
}) {
  const { error } = await supabase.from("profiles").upsert(
    { id: user.id, email: user.email, name: user.name },
    { onConflict: "id" },
  );
  if (error) {
    console.error("[SocialCapital] Failed to sync profile:", error.message);
  }
}
