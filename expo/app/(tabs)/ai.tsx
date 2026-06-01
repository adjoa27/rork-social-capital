import React, { useMemo } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  Cake,
  CalendarClock,
  Snowflake,
  Sparkles,
  TrendingUp,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { Colors } from "@/constants/colors";
import { Contact } from "@/constants/mockData";
import {
  useContacts,
  useReconnectSuggestions,
  useUpcomingBirthdays,
} from "@/providers/ContactsProvider";
import { daysSince } from "@/utils/format";

interface SmartReminder {
  id: string;
  contact: Contact;
  type: "reconnect" | "birthday" | "milestone" | "cadence";
  title: string;
  body: string;
}

export default function AIScreen() {
  const insets = useSafeAreaInsets();
  const { contacts } = useContacts();
  const reconnects = useReconnectSuggestions(6);
  const birthdays = useUpcomingBirthdays(45);

  const reminders: SmartReminder[] = useMemo(() => {
    const list: SmartReminder[] = [];

    for (const c of reconnects) {
      const days = daysSince(c.lastInteraction);
      list.push({
        id: `r-${c.id}`,
        contact: c,
        type: "reconnect",
        title: `Check in with ${c.name.split(" ")[0]}`,
        body: `${days} days since your last interaction. A short note keeps the relationship warm.`,
      });
    }

    for (const b of birthdays) {
      list.push({
        id: `b-${b.contact.id}`,
        contact: b.contact,
        type: "birthday",
        title: `${b.contact.name}'s birthday`,
        body:
          b.daysUntil === 0
            ? "Today — send a quick happy birthday note."
            : b.daysUntil === 1
            ? "Tomorrow — plan a thoughtful message tonight."
            : `In ${b.daysUntil} days. Set aside time to reach out.`,
      });
    }

    const milestoneCandidate = contacts.find(
      (c) =>
        c.warmth !== "cold" &&
        c.interactions.some((i) => i.type === "milestone")
    );
    if (milestoneCandidate) {
      list.push({
        id: `m-${milestoneCandidate.id}`,
        contact: milestoneCandidate,
        type: "milestone",
        title: `Celebrate ${milestoneCandidate.name.split(" ")[0]}'s news`,
        body: `${milestoneCandidate.name.split(" ")[0]} recently hit a milestone. A genuine note now goes a long way.`,
      });
    }

    return list.slice(0, 8);
  }, [contacts, reconnects, birthdays]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text style={styles.eyebrow}>Social Capital Assistant</Text>
        <Text style={styles.title}>Your daily nudges</Text>
        <Text style={styles.subtitle}>
          AI-curated reminders so the right relationships stay warm.
        </Text>
      </View>

      {/* Hero generator card */}
      <Pressable
        onPress={() => router.push("/message-generator")}
        style={({ pressed }) => [
          styles.heroWrap,
          pressed && { transform: [{ scale: 0.995 }] },
        ]}
      >
        <LinearGradient
          colors={["#C8A05A", "#A4823F"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroIcon}>
            <Sparkles size={22} color="#FFFFFF" strokeWidth={2.6} />
          </View>
          <Text style={styles.heroTitle}>Generate a message</Text>
          <Text style={styles.heroBody}>
            Pick a person, a tone, and a channel. Social Capital drafts a personalized
            note based on what you know.
          </Text>
          <View style={styles.heroOrbA} />
          <View style={styles.heroOrbB} />
        </LinearGradient>
      </Pressable>

      {/* Smart reminders feed */}
      <View style={{ gap: 12 }}>
        <View style={styles.sectionHeader}>
          <Bell size={18} color={Colors.text} strokeWidth={2.4} />
          <Text style={styles.sectionTitle}>Smart reminders</Text>
        </View>

        {reminders.map((r) => (
          <ReminderCard key={r.id} reminder={r} />
        ))}
      </View>
    </ScrollView>
  );
}

function ReminderCard({ reminder }: { reminder: SmartReminder }) {
  const accent =
    reminder.type === "birthday"
      ? Colors.purple
      : reminder.type === "milestone"
      ? Colors.success
      : reminder.type === "cadence"
      ? Colors.cooling
      : Colors.goldDeep;

  const Icon =
    reminder.type === "birthday"
      ? Cake
      : reminder.type === "milestone"
      ? TrendingUp
      : reminder.type === "cadence"
      ? CalendarClock
      : Snowflake;

  return (
    <Pressable
      onPress={() => router.push(`/contact/${reminder.contact.id}`)}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.95, transform: [{ scale: 0.995 }] },
      ]}
    >
      <View style={[styles.cardIcon, { backgroundColor: `${accent}1A` }]}>
        <Icon size={18} color={accent} strokeWidth={2.4} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{reminder.title}</Text>
        <Text style={styles.cardBody}>{reminder.body}</Text>
        <View style={styles.cardFoot}>
          <Avatar
            name={reminder.contact.name}
            photo={reminder.contact.photo}
            size={20}
          />
          <Text style={styles.cardFootText}>{reminder.contact.name}</Text>
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/message-generator",
                params: { contactId: reminder.contact.id },
              })
            }
            style={styles.draftBtn}
          >
            <Sparkles size={12} color={Colors.text} strokeWidth={2.6} />
            <Text style={styles.draftText}>Draft</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: {
    paddingHorizontal: 20,
    gap: 24,
  },
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
  heroWrap: {
    borderRadius: 24,
    overflow: "hidden",
  },
  hero: {
    padding: 22,
    gap: 8,
    borderRadius: 24,
    overflow: "hidden",
  },
  heroIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  heroBody: {
    color: "rgba(255,255,255,0.92)",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: "92%",
  },
  heroOrbA: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.18)",
    right: -40,
    top: -40,
  },
  heroOrbB: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(15,27,45,0.18)",
    right: 40,
    bottom: -30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    gap: 12,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  cardBody: {
    marginTop: 3,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  cardFoot: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardFootText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "600",
  },
  draftBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  draftText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
  },
});
