import React, { useState, useMemo } from "react";
import {
  Alert,
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
import * as Linking from "expo-linking";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowLeft,
  Check,
  ExternalLink,
  Linkedin,
  Newspaper,
  RefreshCw,
  Sparkles,
  X,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { Colors } from "@/constants/colors";
import { useLinkedIn } from "@/providers/LinkedInProvider";
import { useContacts } from "@/providers/ContactsProvider";

export default function LinkedInConnect() {
  const insets = useSafeAreaInsets();
  const { contacts } = useContacts();
  const { connections, isConnected, connect, disconnect, syncUpdates, isSyncing } = useLinkedIn();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [profileInput, setProfileInput] = useState<string>("");
  const [activeContactId, setActiveContactId] = useState<string | null>(null);

  const connectedContacts = useMemo(
    () => contacts.filter((c) => isConnected(c.id)),
    [contacts, isConnected]
  );

  const unconnectedContacts = useMemo(
    () => contacts.filter((c) => !isConnected(c.id) && c.linkedinConnected !== true),
    [contacts, isConnected]
  );

  const handleConnect = async () => {
    if (!activeContactId || !profileInput.trim()) return;

    let url = profileInput.trim();
    if (!url.startsWith("http")) {
      url = `https://linkedin.com/in/${url.replace(/^@?linkedin\.com\/in\//, "").replace(/^\//, "")}`;
    }

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
    await connect(activeContactId, url);
    setProfileInput("");
    setActiveContactId(null);
  };

  const handleDisconnect = (contactId: string) => {
    Alert.alert(
      "Disconnect LinkedIn?",
      "Social updates will stop for this contact. Your saved profile link will be removed.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: () => disconnect(contactId),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={Colors.text} strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.headerTitle}>LinkedIn</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 60 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <LinearGradient
          colors={["#0A66C2", "#063D7A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroIcon}>
            <Linkedin size={28} color="#FFFFFF" strokeWidth={2.6} />
          </View>
          <Text style={styles.heroTitle}>LinkedIn Sync</Text>
          <Text style={styles.heroBody}>
            Connect a contact's LinkedIn profile to see their job changes, posts,
            funding news, and life moments — automatically.
          </Text>
          {connectedContacts.length > 0 ? (
            <View style={styles.heroStat}>
              <Check size={14} color="#34D399" strokeWidth={3} />
              <Text style={styles.heroStatText}>
                {connectedContacts.length} contact{connectedContacts.length > 1 ? "s" : ""} synced
              </Text>
            </View>
          ) : null}
          <View style={styles.heroOrb} />
        </LinearGradient>

        {/* Connected contacts */}
        {connectedContacts.length > 0 ? (
          <View style={{ gap: 10 }}>
            <Text style={styles.sectionTitle}>Synced contacts</Text>
            <View style={styles.card}>
              {connectedContacts.map((c) => (
                <View key={c.id}>
                  <View style={styles.contactRow}>
                    <Avatar name={c.name} photo={c.photo} size={42} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.contactName}>{c.name}</Text>
                      <Text style={styles.contactMeta}>
                        {connections[c.id]?.profileUrl ?? c.linkedin}
                      </Text>
                    </View>
                    <View style={styles.contactActions}>
                      <Pressable
                        hitSlop={8}
                        style={styles.syncBtn}
                        onPress={() => syncUpdates(c.id)}
                      >
                        <RefreshCw
                          size={14}
                          color={Colors.purple}
                          strokeWidth={2.4}
                        />
                      </Pressable>
                      <Pressable
                        hitSlop={8}
                        style={styles.disconnectBtn}
                        onPress={() => handleDisconnect(c.id)}
                      >
                        <X size={14} color={Colors.danger} strokeWidth={2.4} />
                      </Pressable>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* Connect new */}
        <View style={{ gap: 10 }}>
          <Text style={styles.sectionTitle}>
            {connectedContacts.length > 0 ? "Add more" : "Connect a contact"}
          </Text>

          {activeContactId ? (
            <View style={styles.card}>
              <View style={styles.inputRow}>
                <View style={styles.inputIcon}>
                  <Linkedin size={16} color="#0A66C2" strokeWidth={2.4} />
                </View>
                <TextInput
                  style={styles.input}
                  value={profileInput}
                  onChangeText={setProfileInput}
                  placeholder="Paste LinkedIn profile URL or username…"
                  placeholderTextColor={Colors.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onSubmitEditing={handleConnect}
                />
              </View>
              <View style={styles.inputActions}>
                <Pressable
                  style={({ pressed }) => [
                    styles.inputCancel,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => {
                    setActiveContactId(null);
                    setProfileInput("");
                  }}
                >
                  <Text style={styles.inputCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [
                    styles.inputSubmit,
                    !profileInput.trim() && { opacity: 0.5 },
                    pressed && { opacity: 0.8 },
                  ]}
                  onPress={handleConnect}
                  disabled={!profileInput.trim()}
                >
                  <Text style={styles.inputSubmitText}>Connect</Text>
                </Pressable>
              </View>
            </View>
          ) : null}

          {!activeContactId && (
            <View style={styles.card}>
              {unconnectedContacts.length === 0 ? (
                <View style={styles.emptyState}>
                  <Sparkles size={24} color={Colors.textMuted} strokeWidth={1.8} />
                  <Text style={styles.emptyText}>
                    All your contacts are synced with LinkedIn.
                  </Text>
                </View>
              ) : (
                unconnectedContacts.slice(0, 8).map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => {
                      setActiveContactId(c.id);
                      setProfileInput(
                        c.linkedin
                          ? c.linkedin.startsWith("http")
                            ? c.linkedin
                            : `https://${c.linkedin}`
                          : ""
                      );
                    }}
                    style={({ pressed }) => [
                      styles.connectRow,
                      pressed && { opacity: 0.7, backgroundColor: Colors.backgroundAlt },
                    ]}
                  >
                    <Avatar name={c.name} photo={c.photo} size={38} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.contactName}>{c.name}</Text>
                      {c.linkedin ? (
                        <Text style={styles.contactMeta}>
                          {c.linkedin.replace("https://", "").replace("linkedin.com/in/", "@")}
                        </Text>
                      ) : (
                        <Text style={styles.contactMeta}>No profile link saved</Text>
                      )}
                    </View>
                    <View style={styles.connectPill}>
                      <Linkedin size={12} color="#0A66C2" strokeWidth={2.4} />
                      <Text style={styles.connectPillText}>Connect</Text>
                    </View>
                  </Pressable>
                ))
              )}
            </View>
          )}
        </View>

        {/* Info */}
        <View style={styles.infoCard}>
          <Newspaper size={16} color={Colors.purple} strokeWidth={2.4} />
          <View style={{ flex: 1 }}>
            <Text style={styles.infoTitle}>How it works</Text>
            <Text style={styles.infoBody}>
              When you connect a contact's LinkedIn profile, Social Capital periodically
              checks for new activity and surfaces relevant updates on their
              contact card — job changes, posts, funding announcements, and more.
              Tap the refresh icon to pull the latest updates manually.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
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
    paddingBottom: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  content: {
    paddingHorizontal: 20,
    gap: 22,
  },
  hero: {
    padding: 22,
    borderRadius: 24,
    gap: 10,
    overflow: "hidden",
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  heroBody: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 14,
    lineHeight: 20,
  },
  heroStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  heroStatText: {
    color: "#34D399",
    fontSize: 13,
    fontWeight: "700",
  },
  heroOrb: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#FFFFFF",
    opacity: 0.08,
    right: -70,
    top: -70,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: -0.2,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contactName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  contactMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  contactActions: {
    flexDirection: "row",
    gap: 6,
  },
  syncBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.purpleSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  disconnectBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
  },
  connectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  connectPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#E8F3FA",
  },
  connectPillText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0A66C2",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
  },
  inputIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#E8F3FA",
    alignItems: "center",
    justifyContent: "center",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  inputActions: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  inputCancel: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.backgroundAlt,
    alignItems: "center",
  },
  inputCancelText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  inputSubmit: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#0A66C2",
    alignItems: "center",
  },
  inputSubmitText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyState: {
    alignItems: "center",
    padding: 24,
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  infoCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 18,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 4,
  },
  infoBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
});
