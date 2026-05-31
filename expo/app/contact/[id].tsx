import React, { useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams, Stack } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import * as Notifications from "expo-notifications";
import * as Speech from "expo-speech";
import * as Haptics from "expo-haptics";
import {
  ArrowLeft,
  Bell,
  Briefcase,
  Calendar,
  CalendarClock,
  Check,
  ChevronRight,
  Copy,
  ExternalLink,
  Linkedin,
  Mail,
  MessageCircle,
  MoreHorizontal,
  Newspaper,
  Phone,
  Plus,
  Sparkles,
  StickyNote,
  Trophy,
  UserPlus,
  Volume2,
  X,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { WarmthMeter } from "@/components/WarmthIndicator";
import { Colors } from "@/constants/colors";
import { useContactById, useContacts } from "@/providers/ContactsProvider";
import { useLinkedIn } from "@/providers/LinkedInProvider";
import {
  Interaction,
  InteractionType,
  SocialUpdate,
  SocialUpdateType,
} from "@/constants/mockData";
import { daysSince, relativeTime } from "@/utils/format";

export default function ContactDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const contact = useContactById(id);
  const { deleteContact, addNote } = useContacts();
  const { isConnected } = useLinkedIn();
  const [showNoteInput, setShowNoteInput] = useState<boolean>(false);
  const [newNote, setNewNote] = useState<string>("");

  if (!contact) {
    return (
      <View style={styles.missing}>
        <Text style={styles.missingText}>Contact not found.</Text>
      </View>
    );
  }

  const days = daysSince(contact.lastInteraction);
  const connected = isConnected(contact.id);

  const handleCall = () => {
    if (!contact.phone) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    Linking.openURL(`tel:${contact.phone}`).catch(() => {
      Alert.alert("Error", "Unable to make a call on this device.");
    });
  };

  const handleAddNote = () => {
    if (!newNote.trim()) {
      setShowNoteInput(false);
      return;
    }
    addNote(contact.id, newNote.trim());
    setNewNote("");
    setShowNoteInput(false);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    }
  };

  return (
    <View style={[styles.container]}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={["#FBF7F0", "#F3E9D5"]}
          style={[styles.headerBg, { paddingTop: insets.top + 12 }]}
        >
          <View style={styles.headerNav}>
            <Pressable onPress={() => router.back()} style={styles.iconBtn}>
              <ArrowLeft size={20} color={Colors.text} strokeWidth={2.4} />
            </Pressable>
            <Pressable
              onPress={() => {
                deleteContact(contact.id);
                router.back();
              }}
              style={styles.iconBtn}
            >
              <MoreHorizontal size={20} color={Colors.text} strokeWidth={2.4} />
            </Pressable>
          </View>

          <View style={styles.identity}>
            <Avatar
              name={contact.name}
              photo={contact.photo}
              size={92}
              ring
            />
            <Text style={styles.name}>{contact.name}</Text>
            <Text style={styles.role}>
              {contact.title ? contact.title : ""}
              {contact.title && contact.company ? " · " : ""}
              {contact.company ?? ""}
            </Text>

            <View style={styles.tagRow}>
              <View style={styles.categoryPill}>
                <Text style={styles.categoryText}>{contact.category}</Text>
              </View>
              {contact.tags.slice(0, 3).map((t) => (
                <View key={t} style={styles.tagPill}>
                  <Text style={styles.tagText}>{t}</Text>
                </View>
              ))}
            </View>
          </View>
        </LinearGradient>

        {/* Warmth */}
        <View style={[styles.card, { marginTop: -28 }]}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Relationship warmth</Text>
            <Text style={styles.cardMeta}>
              {days === 0 ? "Active today" : `${days}d since contact`}
            </Text>
          </View>
          <WarmthMeter
            score={contact.strengthScore}
            warmth={contact.warmth}
          />
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <ActionBtn
            label="Draft"
            icon={
              <Sparkles size={18} color="#FFFFFF" strokeWidth={2.6} />
            }
            primary
            onPress={() =>
              router.push({
                pathname: "/message-generator",
                params: { contactId: contact.id },
              })
            }
          />
          {contact.phone ? (
            <ActionBtn
              label="Call"
              icon={<Phone size={18} color={Colors.text} strokeWidth={2.4} />}
              onPress={handleCall}
            />
          ) : null}
          <RemindBtn contactId={contact.id} />
        </View>

        {/* AI memory summary */}
        <View style={styles.card}>
          <View style={styles.aiHead}>
            <Sparkles size={14} color={Colors.goldDeep} strokeWidth={2.6} />
            <Text style={styles.aiHeadText}>AI memory</Text>
            <View style={{ flex: 1 }} />
            <Pressable
              onPress={() => {
                const text = summarizeMemory(
                  contact.name,
                  contact.metAt,
                  contact.notes
                );
                Speech.speak(text, { rate: 0.85 });
              }}
              hitSlop={8}
              style={styles.memSpeak}
            >
              <Volume2 size={14} color={Colors.textMuted} strokeWidth={2.2} />
            </Pressable>
          </View>
          <Text style={styles.aiSummary}>
            {summarizeMemory(contact.name, contact.metAt, contact.notes)}
          </Text>
        </View>

        {/* Contact info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact</Text>
          <View style={{ gap: 4, marginTop: 8 }}>
            {contact.email ? (
              <View style={styles.infoRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                  <Mail size={16} color={Colors.textSecondary} />
                  <Text style={styles.infoText} numberOfLines={1}>
                    {contact.email}
                  </Text>
                </View>
                <Pressable
                  hitSlop={8}
                  onPress={async () => {
                    await Clipboard.setStringAsync(contact.email!);
                    Alert.alert("Copied", "Email copied to clipboard.");
                  }}
                >
                  <Copy size={14} color={Colors.textMuted} strokeWidth={2} />
                </Pressable>
              </View>
            ) : null}
            {contact.phone ? (
              <View style={styles.infoRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
                  <Phone size={16} color={Colors.textSecondary} />
                  <Text style={styles.infoText} numberOfLines={1}>
                    {contact.phone}
                  </Text>
                </View>
                <Pressable
                  hitSlop={8}
                  onPress={async () => {
                    await Clipboard.setStringAsync(contact.phone!);
                    Alert.alert("Copied", "Phone number copied to clipboard.");
                  }}
                >
                  <Copy size={14} color={Colors.textMuted} strokeWidth={2} />
                </Pressable>
              </View>
            ) : null}
            {contact.linkedin ? (
              <InfoRow
                icon={<Linkedin size={16} color={Colors.textSecondary} />}
                label={contact.linkedin}
              />
            ) : null}
            {contact.company ? (
              <InfoRow
                icon={<Briefcase size={16} color={Colors.textSecondary} />}
                label={`${contact.title ?? "—"} @ ${contact.company}`}
              />
            ) : null}
            {contact.reminderCadenceDays ? (
              <InfoRow
                icon={
                  <CalendarClock size={16} color={Colors.textSecondary} />
                }
                label={`Reminder every ${contact.reminderCadenceDays} days`}
              />
            ) : null}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Pressable
              hitSlop={8}
              onPress={() => setShowNoteInput(true)}
            >
              <Plus size={18} color={Colors.text} strokeWidth={2.4} />
            </Pressable>
          </View>
          {showNoteInput ? (
            <View style={styles.noteInputWrap}>
              <TextInput
                style={styles.noteInput}
                value={newNote}
                onChangeText={setNewNote}
                placeholder="Add a note about this contact…"
                placeholderTextColor={Colors.textMuted}
                multiline
                autoFocus
                onSubmitEditing={handleAddNote}
              />
              <View style={styles.noteInputActions}>
                <Pressable
                  onPress={() => {
                    setShowNoteInput(false);
                    setNewNote("");
                  }}
                  style={styles.noteCancel}
                >
                  <Text style={styles.noteCancelText}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleAddNote}
                  style={({ pressed }) => [
                    styles.noteSave,
                    !newNote.trim() && { opacity: 0.5 },
                    pressed && { opacity: 0.8 },
                  ]}
                  disabled={!newNote.trim()}
                >
                  <Text style={styles.noteSaveText}>Save</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
          <View style={{ gap: 8, marginTop: showNoteInput ? 0 : 8 }}>
            {contact.notes.map((n, i) => (
              <View key={`${i}`} style={styles.note}>
                <StickyNote size={14} color={Colors.goldDeep} strokeWidth={2.4} />
                <Text style={styles.noteText}>{n}</Text>
              </View>
            ))}
            {contact.notes.length === 0 && !showNoteInput ? (
              <Text style={styles.empty}>No notes yet.</Text>
            ) : null}
          </View>
        </View>

        {/* Social & News */}
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={styles.aiHead}>
              <Newspaper size={14} color={Colors.purple} strokeWidth={2.6} />
              <Text style={[styles.aiHeadText, { color: Colors.purple }]}>
                Social & News
              </Text>
            </View>
          </View>
          {contact.socialUpdates.length > 0 ? (
            <View style={{ marginTop: 10, gap: 10 }}>
              {contact.socialUpdates.map((update) => (
                <SocialUpdateRow key={update.id} update={update} />
              ))}
            </View>
          ) : (
            <EmptySocialState contactId={contact.id} />
          )}
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Timeline</Text>
          <View style={{ marginTop: 12, gap: 0 }}>
            {contact.interactions.map((i, idx) => (
              <TimelineRow
                key={i.id}
                interaction={i}
                last={idx === contact.interactions.length - 1}
              />
            ))}
            {contact.interactions.length === 0 ? (
              <Text style={styles.empty}>
                Log your first meeting or message.
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function summarizeMemory(
  name: string,
  metAt: string | undefined,
  notes: string[]
): string {
  const first = name.split(" ")[0];
  const parts: string[] = [];
  if (metAt) parts.push(`You met ${first} at ${metAt}.`);
  if (notes.length > 0) {
    parts.push(`Key context: ${notes.slice(0, 3).join("; ")}.`);
  }
  if (parts.length === 0) {
    parts.push(
      `Add a few notes about ${first} to unlock smarter AI-generated messages.`
    );
  }
  return parts.join(" ");
}

function ActionBtn({
  label,
  icon,
  primary,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  primary?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionBtn,
        primary ? styles.actionPrimary : styles.actionGhost,
        pressed && { opacity: 0.9, transform: [{ scale: 0.97 }] },
      ]}
    >
      {icon}
      <Text
        style={[
          styles.actionLabel,
          primary && { color: "#FFFFFF" },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function InfoRow({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <View style={styles.infoRow}>
      {icon}
      <Text style={styles.infoText} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const TYPE_LABEL: Record<InteractionType, string> = {
  meeting: "Meeting",
  message: "Message",
  call: "Call",
  email: "Email",
  note: "Note",
  milestone: "Milestone",
  event: "Event",
};

// ─── Reminder presets ────────────────────────────────────────────────────────

const REMINDER_PRESETS: { label: string; days: number }[] = [
  { label: "Tomorrow", days: 1 },
  { label: "In 3 days", days: 3 },
  { label: "In 1 week", days: 7 },
  { label: "In 2 weeks", days: 14 },
  { label: "In 1 month", days: 30 },
  { label: "In 3 months", days: 90 },
];

function addDaysToDate(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function scheduleReminderNotification(
  contactName: string,
  days: number
): void {
  if (Platform.OS === "web") return;
  const triggerDate = new Date();
  triggerDate.setDate(triggerDate.getDate() + days);
  triggerDate.setHours(9, 0, 0, 0);

  Notifications.scheduleNotificationAsync({
    content: {
      title: `Time to reconnect with ${contactName.split(" ")[0]}`,
      body: `Your ${days}-day reminder to reach out to ${contactName}. Don't let the relationship go cold.`,
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  }).catch(() => {});
}

function RemindBtn({ contactId }: { contactId: string }) {
  const [visible, setVisible] = useState<boolean>(false);
  const { updateContact, contacts } = useContacts();
  const contact = contacts.find((c) => c.id === contactId);

  const handleSetReminder = (days: number) => {
    updateContact(contactId, { reminderCadenceDays: days });
    if (contact) {
      scheduleReminderNotification(contact.name, days);
    }
    setVisible(false);
  };

  return (
    <>
      <ActionBtn
        label="Remind"
        icon={<Bell size={18} color={Colors.text} strokeWidth={2.4} />}
        onPress={() => setVisible(true)}
      />

      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={() => setVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setVisible(false)}
        >
          <Pressable style={styles.modalSheet} onPress={() => {}}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Set reminder</Text>
            <Text style={styles.modalSubtitle}>
              {contact
                ? `Get notified to reach out to ${contact.name.split(" ")[0]}`
                : "Get notified to reach out"}
            </Text>

            {/* Preset chips */}
            <View style={styles.presetGrid}>
              {REMINDER_PRESETS.map((preset) => {
                const date = addDaysToDate(preset.days);
                const isActive =
                  contact?.reminderCadenceDays === preset.days;
                return (
                  <Pressable
                    key={preset.days}
                    style={({ pressed }) => [
                      styles.presetChip,
                      isActive && styles.presetChipActive,
                      pressed && { opacity: 0.85 },
                    ]}
                    onPress={() => handleSetReminder(preset.days)}
                  >
                    <Text
                      style={[
                        styles.presetLabel,
                        isActive && styles.presetLabelActive,
                      ]}
                    >
                      {preset.label}
                    </Text>
                    <Text
                      style={[
                        styles.presetDate,
                        isActive && { color: Colors.gold },
                      ]}
                    >
                      {formatDate(date)}
                    </Text>
                    {isActive ? (
                      <Check size={14} color={Colors.gold} strokeWidth={3} />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            {/* Custom date picker */}
            <CustomDatePicker
              contactId={contactId}
              contactName={contact?.name}
              onSet={() => setVisible(false)}
            />

            {/* Clear */}
            {contact?.reminderCadenceDays ? (
              <Pressable
                style={styles.clearReminder}
                onPress={() => {
                  updateContact(contactId, {
                    reminderCadenceDays: undefined,
                  });
                  setVisible(false);
                }}
              >
                <Text style={styles.clearReminderText}>Remove reminder</Text>
              </Pressable>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

function CustomDatePicker({
  contactId,
  contactName,
  onSet,
}: {
  contactId: string;
  contactName?: string;
  onSet: () => void;
}) {
  const [showCustom, setShowCustom] = useState<boolean>(false);
  const [month, setMonth] = useState<string>("");
  const [day, setDay] = useState<string>("");
  const [year, setYear] = useState<string>(
    String(new Date().getFullYear())
  );
  const { updateContact } = useContacts();

  const handleSetCustom = () => {
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);
    const y = parseInt(year, 10);
    if (isNaN(m) || isNaN(d) || isNaN(y)) return;
    const target = new Date(y, m - 1, d);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil(
      (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays < 1) return;
    updateContact(contactId, { reminderCadenceDays: diffDays });
    if (contactName) {
      scheduleReminderNotification(contactName, diffDays);
    }
    onSet();
  };

  return (
    <View style={{ marginTop: 8 }}>
      {!showCustom ? (
        <Pressable
          style={({ pressed }) => [
            styles.customBtn,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => setShowCustom(true)}
        >
          <Calendar size={16} color={Colors.textSecondary} strokeWidth={2} />
          <Text style={styles.customBtnText}>Custom date</Text>
        </Pressable>
      ) : (
        <View style={styles.customRow}>
          <TextInput
            style={styles.dateInput}
            placeholder="MM"
            placeholderTextColor={Colors.textMuted}
            value={month}
            onChangeText={setMonth}
            keyboardType="number-pad"
            maxLength={2}
          />
          <Text style={styles.dateSep}>/</Text>
          <TextInput
            style={styles.dateInput}
            placeholder="DD"
            placeholderTextColor={Colors.textMuted}
            value={day}
            onChangeText={setDay}
            keyboardType="number-pad"
            maxLength={2}
          />
          <Text style={styles.dateSep}>/</Text>
          <TextInput
            style={[styles.dateInput, { width: 52 }]}
            placeholder="YYYY"
            placeholderTextColor={Colors.textMuted}
            value={year}
            onChangeText={setYear}
            keyboardType="number-pad"
            maxLength={4}
          />
          <Pressable
            style={({ pressed }) => [
              styles.dateSetBtn,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleSetCustom}
          >
            <Text style={styles.dateSetBtnText}>Set</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ─── Social & News ───────────────────────────────────────────────────────────

const SOCIAL_CONFIG: Record<
  SocialUpdateType,
  { icon: React.ReactNode; color: string; bg: string }
> = {
  linkedin_post: {
    icon: <Linkedin size={14} color="#0A66C2" strokeWidth={2.4} />,
    color: "#0A66C2",
    bg: "#E8F3FA",
  },
  job_change: {
    icon: <Briefcase size={14} color="#7C3AED" strokeWidth={2.4} />,
    color: "#7C3AED",
    bg: "#F3EDFF",
  },
  funding_news: {
    icon: <Trophy size={14} color="#D97706" strokeWidth={2.4} />,
    color: "#D97706",
    bg: "#FFF7ED",
  },
  press_mention: {
    icon: <Newspaper size={14} color="#059669" strokeWidth={2.4} />,
    color: "#059669",
    bg: "#ECFDF5",
  },
  life_moment: {
    icon: <Sparkles size={14} color="#DB2777" strokeWidth={2.4} />,
    color: "#DB2777",
    bg: "#FDF2F8",
  },
};

function SocialUpdateRow({ update }: { update: SocialUpdate }) {
  const config = SOCIAL_CONFIG[update.type];
  return (
    <View style={styles.socialRow}>
      <View style={[styles.socialIcon, { backgroundColor: config.bg }]}>
        {config.icon}
      </View>
      <View style={styles.socialBody}>
        <Text style={styles.socialTitle}>{update.title}</Text>
        {update.detail ? (
          <Text style={styles.socialDetail} numberOfLines={2}>
            {update.detail}
          </Text>
        ) : null}
        <Text style={styles.socialDate}>{relativeTime(update.date)}</Text>
      </View>
      {update.link ? (
        <ExternalLink size={14} color={Colors.textMuted} strokeWidth={2} />
      ) : null}
    </View>
  );
}

function EmptySocialState({ contactId }: { contactId: string }) {
  return (
    <View style={styles.emptySocial}>
      <View style={styles.emptySocialIcon}>
        <Linkedin size={24} color={Colors.textMuted} strokeWidth={1.8} />
      </View>
      <Text style={styles.emptySocialTitle}>
        No social updates yet
      </Text>
      <Text style={styles.emptySocialBody}>
        Connect LinkedIn to see job changes, funding news, posts, and life
        moments for this contact — automatically.
      </Text>
      <Pressable
        style={({ pressed }) => [
          styles.emptySocialBtn,
          pressed && { opacity: 0.8 },
        ]}
        onPress={() =>
          router.push({
            pathname: "/linkedin-connect",
            params: { contactId },
          })
        }
      >
        <Linkedin size={16} color="#FFFFFF" strokeWidth={2.4} />
        <Text style={styles.emptySocialBtnText}>Connect LinkedIn</Text>
      </Pressable>
    </View>
  );
}

// ─── Timeline ────────────────────────────────────────────────────────────────

function TimelineRow({
  interaction,
  last,
}: {
  interaction: Interaction;
  last: boolean;
}) {
  return (
    <View style={styles.tlRow}>
      <View style={styles.tlGutter}>
        <View style={styles.tlDot} />
        {!last ? <View style={styles.tlLine} /> : null}
      </View>
      <View style={styles.tlBody}>
        <Text style={styles.tlType}>{TYPE_LABEL[interaction.type]}</Text>
        <Text style={styles.tlTitle}>{interaction.title}</Text>
        {interaction.detail ? (
          <Text style={styles.tlDetail}>{interaction.detail}</Text>
        ) : null}
        <Text style={styles.tlDate}>{relativeTime(interaction.date)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // ─── Modal ──────────────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === "ios" ? 42 : 24,
    paddingTop: 12,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.borderStrong,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  presetGrid: {
    gap: 10,
  },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: Colors.backgroundAlt,
    gap: 10,
  },
  presetChipActive: {
    backgroundColor: Colors.text,
  },
  presetLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  presetLabelActive: {
    color: "#FFFFFF",
  },
  presetDate: {
    fontSize: 13,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  customBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    borderStyle: "dashed",
  },
  customBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  customRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dateInput: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.card,
    textAlign: "center",
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  dateSep: {
    fontSize: 16,
    color: Colors.textMuted,
    fontWeight: "500",
  },
  dateSetBtn: {
    marginLeft: "auto",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.text,
  },
  dateSetBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  clearReminder: {
    marginTop: 18,
    paddingVertical: 12,
    alignItems: "center",
  },
  clearReminderText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.danger,
  },

  // ─── Social & News ────────────────────────────────────────────────────────
  socialRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  socialIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  socialBody: {
    flex: 1,
  },
  socialTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  socialDetail: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginTop: 3,
  },
  socialDate: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: "500",
    marginTop: 4,
  },
  emptySocial: {
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 8,
    gap: 10,
  },
  emptySocialIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: Colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  emptySocialTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  emptySocialBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 4,
  },
  emptySocialBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#0A66C2",
    marginTop: 6,
  },
  emptySocialBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // ─── Base ──────────────────────────────────────────────────────────────────
  missing: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  missingText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  headerBg: {
    paddingHorizontal: 20,
    paddingBottom: 48,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  headerNav: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  iconBtn: {
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
  identity: {
    alignItems: "center",
    marginTop: 20,
    gap: 8,
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
    marginTop: 10,
  },
  role: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    marginTop: 8,
  },
  categoryPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: Colors.text,
  },
  categoryText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tagText: {
    color: Colors.text,
    fontSize: 11,
    fontWeight: "600",
  },
  card: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 18,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  cardMeta: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 20,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionPrimary: {
    backgroundColor: Colors.text,
  },
  actionGhost: {
    backgroundColor: Colors.card,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  aiHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  aiHeadText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.goldDeep,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  aiSummary: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 21,
  },
  memSpeak: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
  },
  note: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.backgroundAlt,
    padding: 12,
    borderRadius: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  empty: {
    color: Colors.textMuted,
    fontSize: 13,
    paddingVertical: 8,
  },
  noteInputWrap: {
    marginTop: 10,
    gap: 8,
  },
  noteInput: {
    backgroundColor: Colors.backgroundAlt,
    padding: 14,
    borderRadius: 14,
    fontSize: 14,
    color: Colors.text,
    minHeight: 70,
    textAlignVertical: "top",
  },
  noteInputActions: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  noteCancel: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.backgroundAlt,
  },
  noteCancelText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  noteSave: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.text,
  },
  noteSaveText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  tlRow: {
    flexDirection: "row",
    gap: 12,
  },
  tlGutter: {
    width: 14,
    alignItems: "center",
  },
  tlDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.goldDeep,
    marginTop: 4,
  },
  tlLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: 4,
  },
  tlBody: {
    flex: 1,
    paddingBottom: 16,
  },
  tlType: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.textMuted,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  tlTitle: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  tlDetail: {
    marginTop: 4,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  tlDate: {
    marginTop: 4,
    fontSize: 12,
    color: Colors.textMuted,
  },
});
