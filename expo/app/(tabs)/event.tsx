import React, { useState } from "react";
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
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import {
  Mic,
  ScanLine,
  Sparkles,
  UserPlus,
  Calendar,
  Check,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { Colors } from "@/constants/colors";
import { useContacts } from "@/providers/ContactsProvider";
import { relativeTime } from "@/utils/format";

export default function EventScreen() {
  const insets = useSafeAreaInsets();
  const { contacts, addContact } = useContacts();
  const [eventName, setEventName] = useState<string>("");
  const [quickName, setQuickName] = useState<string>("");
  const [quickNote, setQuickNote] = useState<string>("");
  const [active, setActive] = useState<boolean>(false);
  const [added, setAdded] = useState<string[]>([]);

  const startEvent = () => {
    if (!eventName.trim()) return;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
    }
    setActive(true);
  };

  const quickAdd = () => {
    if (!quickName.trim()) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    const c = addContact({
      name: quickName.trim(),
      notes: [
        `Met at ${eventName}`,
        ...(quickNote.trim() ? [quickNote.trim()] : []),
      ],
      metAt: eventName,
      tags: [eventName],
      category: "Associate",
      warmth: "warm",
      strengthScore: 55,
      reminderCadenceDays: 7,
      interactions: [
        {
          id: `i_${Date.now()}`,
          type: "event",
          title: `Met at ${eventName}`,
          detail: quickNote || undefined,
          date: new Date().toISOString(),
        },
      ],
    });
    setAdded([c.id, ...added]);
    setQuickName("");
    setQuickNote("");
  };

  const addedContacts = contacts.filter((c) => added.includes(c.id));

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 140,
          gap: 22,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View>
          <Text style={styles.eyebrow}>Conference mode</Text>
          <Text style={styles.title}>Capture every connection</Text>
          <Text style={styles.subtitle}>
            Built for fast networking. Scan, tap, or speak — Social Capital remembers
            the rest.
          </Text>
        </View>

        {!active ? (
          <LinearGradient
            colors={["#1A2740", "#0F1B2D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.startCard}
          >
            <View style={styles.startIcon}>
              <Calendar size={22} color="#FFFFFF" strokeWidth={2.6} />
            </View>
            <Text style={styles.startTitle}>Start an event session</Text>
            <Text style={styles.startBody}>
              Everyone you add will be tagged and auto-scheduled for a 7-day
              follow-up.
            </Text>
            <TextInput
              value={eventName}
              onChangeText={setEventName}
              placeholder="e.g. SaaStr Annual 2026"
              placeholderTextColor="rgba(255,255,255,0.45)"
              style={styles.startInput}
            />
            <Pressable
              onPress={startEvent}
              style={({ pressed }) => [
                styles.startBtn,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.startBtnText}>Begin networking</Text>
            </Pressable>
            <View style={styles.startOrb} />
          </LinearGradient>
        ) : (
          <>
            <View style={styles.activeBadge}>
              <View style={styles.pulse} />
              <Text style={styles.activeText}>
                Live · {eventName}
              </Text>
              <Pressable
                onPress={() => setActive(false)}
                style={styles.endBtn}
              >
                <Text style={styles.endText}>End</Text>
              </Pressable>
            </View>

            <View style={styles.quickActions}>
              <QuickTile
                label="Scan card"
                icon={<ScanLine size={22} color={Colors.text} strokeWidth={2.4} />}
                onPress={() => router.push("/scan-card")}
              />
              <QuickTile
                label="Voice note"
                icon={<Mic size={22} color={Colors.text} strokeWidth={2.4} />}
                onPress={async () => {
                  if (Platform.OS !== "web") {
                    try {
                      const perm = await Audio.requestPermissionsAsync();
                      if (!perm.granted) {
                        Alert.alert("Microphone needed", "Please allow microphone access to record voice notes.");
                        return;
                      }
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
                      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
                      const { recording } = await Audio.Recording.createAsync(
                        Audio.RecordingOptionsPresets.HIGH_QUALITY,
                      );
                      // Record for up to 30s then auto-stop
                      setTimeout(async () => {
                        try {
                          await recording.stopAndUnloadAsync();
                          await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
                          const uri = recording.getURI();
                          if (uri) {
                            setQuickNote((prev) =>
                              prev
                                ? `${prev} [Voice note attached: ${uri}]`
                                : `[Voice note: ${uri}]`,
                            );
                          }
                        } catch { /* stop silently */ }
                      }, 30000);
                      Alert.alert("Recording", "Voice note will be captured for 30 seconds. It will be attached to your next quick capture.", [{ text: "Stop early", style: "destructive", onPress: async () => {
                        await recording.stopAndUnloadAsync().catch(() => {});
                        await Audio.setAudioModeAsync({ allowsRecordingIOS: false }).catch(() => {});
                        const uri = recording.getURI();
                        if (uri) {
                          setQuickNote((prev) => prev ? `${prev} [Voice note: ${uri}]` : `[Voice note: ${uri}]`);
                        }
                      }}]);
                    } catch (err) {
                      Alert.alert("Error", "Could not start recording. Try again.");
                    }
                  } else {
                    Alert.alert(
                      "Install on device",
                      "Voice notes are available when you install Social Capital on your device via the Rork App."
                    );
                  }
                }}
              />
              <QuickTile
                label="Manual add"
                icon={<UserPlus size={22} color={Colors.text} strokeWidth={2.4} />}
                onPress={() => router.push("/add-contact")}
              />
            </View>

            <View style={styles.quickCard}>
              <Text style={styles.quickLabel}>Quick capture</Text>
              <TextInput
                value={quickName}
                onChangeText={setQuickName}
                placeholder="Name (e.g. Jamie Park)"
                placeholderTextColor={Colors.textMuted}
                style={styles.quickInput}
              />
              <TextInput
                value={quickNote}
                onChangeText={setQuickNote}
                placeholder="One thing to remember about them…"
                placeholderTextColor={Colors.textMuted}
                style={[styles.quickInput, { height: 70 }]}
                multiline
              />
              <Pressable
                onPress={quickAdd}
                style={({ pressed }) => [
                  styles.addNow,
                  pressed && { opacity: 0.9 },
                ]}
              >
                <Sparkles size={16} color="#FFFFFF" strokeWidth={2.6} />
                <Text style={styles.addNowText}>Add & schedule follow-up</Text>
              </Pressable>
            </View>

            {addedContacts.length > 0 ? (
              <View style={{ gap: 10 }}>
                <Text style={styles.sectionTitle}>
                  Captured ({addedContacts.length})
                </Text>
                {addedContacts.map((c) => (
                  <Pressable
                    key={c.id}
                    onPress={() => router.push(`/contact/${c.id}`)}
                    style={styles.row}
                  >
                    <Avatar name={c.name} photo={c.photo} size={40} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowName}>{c.name}</Text>
                      <Text style={styles.rowMeta}>
                        {relativeTime(c.lastInteraction)} · follow-up in 7d
                      </Text>
                    </View>
                    <View style={styles.check}>
                      <Check size={14} color={Colors.success} strokeWidth={3} />
                    </View>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function QuickTile({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
      ]}
    >
      <View style={styles.tileIcon}>{icon}</View>
      <Text style={styles.tileLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.goldDeep,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.8,
    marginTop: 2,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  startCard: {
    padding: 22,
    borderRadius: 24,
    gap: 12,
    overflow: "hidden",
  },
  startIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  startTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  startBody: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    lineHeight: 20,
  },
  startInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderColor: "rgba(255,255,255,0.18)",
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 12,
    color: "#FFFFFF",
    fontSize: 15,
    marginTop: 8,
  },
  startBtn: {
    backgroundColor: "#E8C988",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 4,
  },
  startBtnText: {
    color: "#0F1B2D",
    fontWeight: "800",
    fontSize: 15,
  },
  startOrb: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#C8A05A",
    opacity: 0.18,
    right: -80,
    top: -60,
  },
  activeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#0F1B2D",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  pulse: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#34D399",
  },
  activeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
    flex: 1,
  },
  endBtn: {
    backgroundColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  endText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
  },
  tile: {
    flex: 1,
    backgroundColor: Colors.card,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  tileIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: Colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  tileLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  quickCard: {
    backgroundColor: Colors.card,
    padding: 16,
    borderRadius: 18,
    gap: 10,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  quickInput: {
    backgroundColor: Colors.backgroundAlt,
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
    color: Colors.text,
  },
  addNow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.text,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addNowText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.card,
    padding: 12,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  rowName: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  rowMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  check: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#D1FAE5",
    alignItems: "center",
    justifyContent: "center",
  },
});
