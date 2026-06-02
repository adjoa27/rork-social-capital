import React, { useCallback, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, Stack } from "expo-router";
import * as Haptics from "expo-haptics";
import * as SecureStore from "expo-secure-store";
import {
  ArrowLeft,
  Briefcase,
  Building,
  ExternalLink,
  Linkedin,
  Newspaper,
  Sparkles,
  TrendingUp,
  Unlink,
  UserPlus,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { useContacts } from "@/providers/ContactsProvider";

const LINKEDIN_PROFILE_KEY = "socialcapital:linkedin_profile:v1";

interface LinkedInProfile {
  profileUrl: string;
  name?: string;
  headline?: string;
  connectedAt: string;
}

export default function LinkedInConnectScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { contacts, updateContact } = useContacts();

  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [url, setUrl] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState<boolean>(false);

  // Load stored LinkedIn profile on mount
  React.useEffect(() => {
    SecureStore.getItemAsync(LINKEDIN_PROFILE_KEY).then((raw) => {
      if (raw) {
        try {
          setProfile(JSON.parse(raw));
        } catch {}
      }
      setHydrated(true);
    });
  }, []);

  const handleConnect = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) {
      Alert.alert("Enter your LinkedIn URL", "Paste your LinkedIn profile link to connect.");
      return;
    }

    // Basic validation — accept linkedin.com/in/ URLs
    if (!trimmed.includes("linkedin.com/in/")) {
      Alert.alert(
        "Invalid LinkedIn URL",
        "Please enter a valid LinkedIn profile URL, like:\nlinkedin.com/in/yourname",
      );
      return;
    }

    setIsConnecting(true);

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    }

    // Extract name from URL slug
    const slug = trimmed.split("/in/")[1]?.split(/[/?#]/)[0] ?? "user";
    const displayName =
      slug
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()) ?? "LinkedIn User";

    const newProfile: LinkedInProfile = {
      profileUrl: trimmed,
      name: displayName,
      connectedAt: new Date().toISOString(),
    };

    await SecureStore.setItemAsync(
      LINKEDIN_PROFILE_KEY,
      JSON.stringify(newProfile),
    );
    setProfile(newProfile);

    // Link LinkedIn for contacts that have a LinkedIn URL
    let linkedCount = 0;
    for (const contact of contacts) {
      if (contact.linkedin && !contact.linkedinConnected) {
        updateContact(contact.id, { linkedinConnected: true });
        linkedCount++;
      }
    }

    if (linkedCount > 0) {
      Alert.alert(
        "LinkedIn connected!",
        `We found ${linkedCount} contact${linkedCount !== 1 ? "s" : ""} in your network with LinkedIn profiles. Their social updates will now appear in their profiles.`,
      );
    }

    setIsConnecting(false);
  }, [url, contacts, updateContact]);

  const handleDisconnect = useCallback(() => {
    Alert.alert(
      "Disconnect LinkedIn",
      "Your LinkedIn profile link will be removed. Social updates from LinkedIn-connected contacts will no longer appear.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: async () => {
            await SecureStore.deleteItemAsync(LINKEDIN_PROFILE_KEY);
            setProfile(null);
            setUrl("");

            // Unlink contacts
            for (const contact of contacts) {
              if (contact.linkedinConnected) {
                updateContact(contact.id, { linkedinConnected: false });
              }
            }

            if (Platform.OS !== "web") {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Warning,
              ).catch(() => {});
            }
          },
        },
      ],
    );
  }, [contacts, updateContact]);

  if (!hydrated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={10}
          >
            <ArrowLeft size={20} color={Colors.text} strokeWidth={2.4} />
          </Pressable>
          <Text style={styles.title}>LinkedIn</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={10}
        >
          <ArrowLeft size={20} color={Colors.text} strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.title}>LinkedIn</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 40,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {profile ? (
          /* Connected state */
          <View style={{ gap: 24 }}>
            {/* Connected card */}
            <View style={styles.connectedCard}>
              <View style={styles.linkedinBadge}>
                <Linkedin size={20} color="#FFFFFF" />
              </View>
              <Text style={styles.connectedTitle}>LinkedIn connected</Text>
              <View style={styles.profilePreview}>
                <View style={styles.profileAvatar}>
                  <Text style={styles.profileInitials}>
                    {profile.name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2) ?? "LI"}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>{profile.name}</Text>
                  <Text style={styles.profileUrl} numberOfLines={1}>
                    {profile.profileUrl}
                  </Text>
                  <Text style={styles.profileDate}>
                    Connected{" "}
                    {new Date(profile.connectedAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              <Pressable style={styles.disconnectBtn} onPress={handleDisconnect}>
                <Unlink size={16} color={Colors.danger} strokeWidth={2.4} />
                <Text style={styles.disconnectText}>Disconnect</Text>
              </Pressable>
            </View>

            {/* Benefits */}
            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>What you get</Text>
              <View style={styles.benefitRow}>
                <Newspaper size={18} color="#0A66C2" strokeWidth={2} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.benefitLabel}>Social updates</Text>
                  <Text style={styles.benefitDesc}>
                    See posts, job changes, and funding news from your contacts
                  </Text>
                </View>
              </View>
              <View style={styles.benefitRow}>
                <TrendingUp size={18} color="#0A66C2" strokeWidth={2} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.benefitLabel}>Career tracking</Text>
                  <Text style={styles.benefitDesc}>
                    Get notified when contacts change jobs or get promoted
                  </Text>
                </View>
              </View>
              <View style={styles.benefitRow}>
                <Sparkles size={18} color="#0A66C2" strokeWidth={2} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.benefitLabel}>AI-powered insights</Text>
                  <Text style={styles.benefitDesc}>
                    Smart conversation starters based on their latest activity
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          /* Disconnected state */
          <View style={{ gap: 24 }}>
            {/* Explanation card */}
            <View style={styles.explainCard}>
              <View style={styles.linkedinIconCircle}>
                <Linkedin size={32} color="#0A66C2" />
              </View>
              <Text style={styles.explainTitle}>Connect your LinkedIn</Text>
              <Text style={styles.explainBody}>
                Link your LinkedIn profile to unlock social updates from your
                contacts. See when they post, change jobs, raise funding, or
                share industry insights — all inside Social Capital.
              </Text>
            </View>

            {/* Benefits preview */}
            <View style={styles.benefitsCard}>
              <Text style={styles.benefitsTitle}>You'll be able to see</Text>
              <View style={styles.benefitRow}>
                <Newspaper size={18} color="#0A66C2" strokeWidth={2} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.benefitLabel}>LinkedIn posts & articles</Text>
                  <Text style={styles.benefitDesc}>
                    Never miss what your contacts are sharing
                  </Text>
                </View>
              </View>
              <View style={styles.benefitRow}>
                <Briefcase size={18} color="#0A66C2" strokeWidth={2} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.benefitLabel}>Job changes & promotions</Text>
                  <Text style={styles.benefitDesc}>
                    Perfect timing for a congratulatory message
                  </Text>
                </View>
              </View>
              <View style={styles.benefitRow}>
                <Building size={18} color="#0A66C2" strokeWidth={2} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.benefitLabel}>Funding & company news</Text>
                  <Text style={styles.benefitDesc}>
                    Know when your investors and peers make moves
                  </Text>
                </View>
              </View>
              <View style={styles.benefitRow}>
                <UserPlus size={18} color="#0A66C2" strokeWidth={2} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.benefitLabel}>New connections</Text>
                  <Text style={styles.benefitDesc}>
                    Discover who in your network just connected with each other
                  </Text>
                </View>
              </View>
            </View>

            {/* URL input */}
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Your LinkedIn profile URL</Text>
              <TextInput
                value={url}
                onChangeText={setUrl}
                placeholder="linkedin.com/in/yourname"
                placeholderTextColor={Colors.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                style={styles.urlInput}
                onSubmitEditing={handleConnect}
                returnKeyType="go"
              />
              <Pressable
                style={[
                  styles.connectBtn,
                  !url.trim() && { opacity: 0.5 },
                ]}
                onPress={handleConnect}
                disabled={isConnecting || !url.trim()}
              >
                <Linkedin size={18} color="#FFFFFF" />
                <Text style={styles.connectBtnText}>
                  {isConnecting ? "Connecting…" : "Connect LinkedIn"}
                </Text>
              </Pressable>
              <Text style={styles.inputHint}>
                We use this to match your contacts' LinkedIn profiles and surface
                their public activity. Your data is never shared.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.3,
  },

  // Explain card
  explainCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    gap: 12,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  linkedinIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#E8F3FF",
    alignItems: "center",
    justifyContent: "center",
  },
  explainTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  explainBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },

  // Input card
  inputCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    gap: 12,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  urlInput: {
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 12,
    fontSize: 15,
    color: Colors.text,
  },
  connectBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#0A66C2",
    paddingVertical: 14,
    borderRadius: 14,
  },
  connectBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  inputHint: {
    fontSize: 11,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 16,
  },

  // Connected card
  connectedCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    gap: 14,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  linkedinBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#0A66C2",
    alignItems: "center",
    justifyContent: "center",
  },
  connectedTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  profilePreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.backgroundAlt,
    padding: 14,
    borderRadius: 14,
    alignSelf: "stretch",
  },
  profileAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0A66C2",
    alignItems: "center",
    justifyContent: "center",
  },
  profileInitials: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  profileName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  profileUrl: {
    fontSize: 12,
    color: "#0A66C2",
    marginTop: 2,
  },
  profileDate: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  disconnectBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
  },
  disconnectText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.danger,
  },

  // Benefits
  benefitsCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    gap: 14,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  benefitsTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  benefitRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  benefitLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  benefitDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
});
