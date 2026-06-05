import React, { useMemo } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  Bell,
  Cake,
  Plus,
  Sparkles,
  TrendingUp,
  ThermometerSun,
  Snowflake,
  Thermometer,
  Star,
  ScanLine,
  Wand2,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { ContactRow } from "@/components/ContactRow";
import { SectionHeader } from "@/components/SectionHeader";
import { Colors } from "@/constants/colors";
import { WarmthLevel } from "@/constants/mockData";
import { useAuth } from "@/hooks/useAuth";
import {
  useContacts,
  useReconnectSuggestions,
  useUpcomingBirthdays,
} from "@/providers/ContactsProvider";
import { daysSince, relativeTime } from "@/utils/format";

const WARMTH_GRADIENTS: Record<WarmthLevel, readonly [string, string]> = {
  strong: ["#10B981", "#059669"],
  warm: ["#D4A85A", "#C8A05A"],
  cooling: ["#F2994A", "#E07A3D"],
  cold: ["#94A3B8", "#6E7C92"],
};

const WARMTH_ICONS: Record<WarmthLevel, React.FC<{ size: number; color: string; strokeWidth: number }>> = {
  strong: TrendingUp as React.FC<{ size: number; color: string; strokeWidth: number }>,
  warm: ThermometerSun as React.FC<{ size: number; color: string; strokeWidth: number }>,
  cooling: Snowflake as React.FC<{ size: number; color: string; strokeWidth: number }>,
  cold: Thermometer as React.FC<{ size: number; color: string; strokeWidth: number }>,
};

const WARMTH_LABELS: Record<WarmthLevel, string> = {
  strong: "Strong",
  warm: "Warm",
  cooling: "Cooling",
  cold: "Cold",
};

const WARMTH_ORDER: WarmthLevel[] = ["strong", "warm", "cooling", "cold"];

export default function HomeScreen() {
  const { user } = useAuth();
  const { contacts, stats, toggleStarred } = useContacts();
  const reconnects = useReconnectSuggestions(4);
  const birthdays = useUpcomingBirthdays(60);
  const insets = useSafeAreaInsets();

  const recentActivity = useMemo(() => {
    const all = contacts
      .flatMap((c) =>
        c.interactions.map((i) => ({ contact: c, interaction: i }))
      )
      .sort(
        (a, b) =>
          new Date(b.interaction.date).getTime() -
          new Date(a.interaction.date).getTime()
      )
      .slice(0, 3);
    return all;
  }, [contacts]);

  const starredContacts = useMemo(
    () => contacts.filter((c) => c.starred),
    [contacts],
  );

  const aiSuggestion = useMemo(() => {
    const top = reconnects[0];
    if (!top) return null;
    return {
      contact: top,
      reason:
        top.warmth === "cold"
          ? `You haven't connected with ${top.name.split(" ")[0]} in ${daysSince(top.lastInteraction)} days. A short check-in could thaw things out.`
          : `${top.name.split(" ")[0]} is due for a touchpoint. We've drafted a warm note based on your notes.`,
    };
  }, [reconnects]);

  const handleWarmthPress = (level: WarmthLevel) => {
    if (Platform.OS !== "web") {
      Haptics.selectionAsync().catch(() => {});
    }
    router.push({
      pathname: "/(tabs)/contacts",
      params: { warmthFilter: level },
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Greeting */}
      <View style={styles.greetRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greetHello}>
            {greetingPrefix()}, {user?.name?.split(" ")[0] ?? "there"}
          </Text>
          <Text style={styles.greetTitle}>
            Let's warm up your network.
          </Text>
        </View>
        <Pressable
          onPress={() => router.push("/(tabs)/settings")}
          hitSlop={8}
        >
          <Avatar name={user?.name ?? "You"} photo={user?.photo} size={44} />
        </Pressable>
      </View>

      {/* Warmth grid — 2x2 */}
      <View style={styles.warmthGrid}>
        {WARMTH_ORDER.map((level) => {
          const [top, bottom] = WARMTH_GRADIENTS[level];
          const Icon = WARMTH_ICONS[level];
          const count = stats[level];
          return (
            <Pressable
              key={level}
              onPress={() => handleWarmthPress(level)}
              style={({ pressed }) => [
                styles.warmthCard,
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
            >
              <LinearGradient
                colors={[top, bottom]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.warmthCardInner}
              >
                <View style={styles.warmthIconCircle}>
                  <Icon size={18} color={top} strokeWidth={2.4} />
                </View>
                <Text style={styles.warmthCount}>{count}</Text>
                <Text style={styles.warmthLabel}>{WARMTH_LABELS[level]}</Text>
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>

      {/* Starred contacts */}
      {starredContacts.length > 0 ? (
        <View style={{ gap: 12 }}>
          <SectionHeader
            title="Starred"
            caption="Your most important contacts"
            icon={<Star size={16} color={Colors.goldDeep} strokeWidth={2.4} />}
          />
          <View style={{ gap: 10 }}>
            {starredContacts.slice(0, 5).map((c) => (
              <ContactRow key={c.id} contact={c} showStar />
            ))}
          </View>
          {starredContacts.length > 5 ? (
            <Pressable
              onPress={() => router.push("/(tabs)/contacts")}
              style={styles.seeAllBtn}
            >
              <Text style={styles.seeAllText}>
                See all {starredContacts.length} starred
              </Text>
              <ArrowRight size={14} color={Colors.goldDeep} strokeWidth={2.4} />
            </Pressable>
          ) : null}
        </View>
      ) : null}

      {/* AI suggestion hero */}
      {aiSuggestion ? (
        <Pressable
          onPress={() =>
            router.push({
              pathname: "/message-generator",
              params: { contactId: aiSuggestion.contact.id },
            })
          }
          style={({ pressed }) => [
            styles.aiCardWrap,
            pressed && { transform: [{ scale: 0.995 }] },
          ]}
        >
          <LinearGradient
            colors={["#1A2740", "#0F1B2D"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiCard}
          >
            <View style={styles.aiHeader}>
              <View style={styles.aiBadge}>
                <Sparkles size={12} color="#0F1B2D" strokeWidth={2.6} />
                <Text style={styles.aiBadgeText}>AI suggestion</Text>
              </View>
              <ArrowRight size={18} color="#FFFFFF" />
            </View>
            <View style={styles.aiBody}>
              <Avatar
                name={aiSuggestion.contact.name}
                photo={aiSuggestion.contact.photo}
                size={56}
                ring
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.aiName}>
                  Reconnect with {aiSuggestion.contact.name}
                </Text>
                <Text style={styles.aiReason}>{aiSuggestion.reason}</Text>
              </View>
            </View>
            <View style={styles.aiCta}>
              <Wand2 size={16} color="#0F1B2D" strokeWidth={2.4} />
              <Text style={styles.aiCtaText}>Draft a message</Text>
            </View>
            <View style={styles.aiOrb} />
          </LinearGradient>
        </Pressable>
      ) : null}

      {/* Quick actions */}
      <View style={styles.actionsRow}>
        <QuickAction
          label="Add"
          icon={<Plus size={20} color={Colors.text} strokeWidth={2.4} />}
          onPress={() => router.push("/add-contact")}
        />
        <QuickAction
          label="Scan card"
          icon={<ScanLine size={20} color={Colors.text} strokeWidth={2.4} />}
          onPress={() => router.push("/scan-card")}
        />
        <QuickAction
          label="Event mode"
          icon={<Calendar20 />}
          onPress={() => router.push("/(tabs)/event")}
        />
        <QuickAction
          label="Reminders"
          icon={<Bell size={20} color={Colors.text} strokeWidth={2.4} />}
          onPress={() => router.push("/(tabs)/ai")}
        />
      </View>

      {/* Reconnect list */}
      <View style={{ gap: 12, marginTop: 4 }}>
        <SectionHeader
          title="People to reconnect with"
          caption="Sorted by relationship cooldown"
          actionLabel="See all"
          onAction={() => router.push("/(tabs)/contacts")}
        />
        <View style={{ gap: 10 }}>
          {reconnects.map((c) => (
            <ContactRow key={c.id} contact={c} />
          ))}
        </View>
      </View>

      {/* Birthdays */}
      {birthdays.length > 0 ? (
        <View style={{ gap: 12, marginTop: 8 }}>
          <SectionHeader title="Upcoming birthdays" />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingRight: 8 }}
          >
            {birthdays.map(({ contact, date, daysUntil }) => (
              <Pressable
                key={contact.id}
                onPress={() => router.push(`/contact/${contact.id}`)}
                style={styles.birthdayCard}
              >
                <View style={styles.birthdayIcon}>
                  <Cake size={16} color={Colors.goldDeep} strokeWidth={2.4} />
                </View>
                <Avatar name={contact.name} photo={contact.photo} size={44} />
                <Text style={styles.birthdayName} numberOfLines={1}>
                  {contact.name.split(" ")[0]}
                </Text>
                <Text style={styles.birthdayDate}>
                  {daysUntil === 0
                    ? "Today"
                    : daysUntil === 1
                    ? "Tomorrow"
                    : `${date.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}`}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Recent activity */}
      <View style={{ gap: 12, marginTop: 8 }}>
        <SectionHeader title="Recent activity" />
        <View style={styles.activityCard}>
          {recentActivity.map(({ contact, interaction }, i) => (
            <View key={interaction.id}>
              <Pressable
                onPress={() => router.push(`/contact/${contact.id}`)}
                style={styles.activityRow}
              >
                <Avatar name={contact.name} photo={contact.photo} size={36} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.activityTitle}>
                    {interaction.title}
                  </Text>
                  <Text style={styles.activityMeta}>
                    {contact.name} · {relativeTime(interaction.date)}
                  </Text>
                </View>
              </Pressable>
              {i < recentActivity.length - 1 ? (
                <View style={styles.activityDivider} />
              ) : null}
            </View>
          ))}
          {recentActivity.length === 0 ? (
            <Text style={styles.empty}>
              No activity yet — start by adding a contact.
            </Text>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}

function greetingPrefix(): string {
  const h = new Date().getHours();
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Calendar20() {
  const { Calendar } = require("lucide-react-native") as typeof import("lucide-react-native");
  return <Calendar size={20} color={Colors.text} strokeWidth={2.4} />;
}

function QuickAction({
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
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.selectionAsync().catch(() => {});
        }
        onPress();
      }}
      style={({ pressed }) => [
        styles.action,
        pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
      ]}
    >
      <View style={styles.actionIcon}>{icon}</View>
      <Text style={styles.actionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: 20,
    gap: 22,
  },
  greetRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  greetHello: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  greetTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.6,
    marginTop: 2,
  },
  warmthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  warmthCard: {
    width: "47.5%",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  warmthCardInner: {
    padding: 18,
    borderRadius: 20,
    gap: 6,
  },
  warmthIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.95)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  warmthCount: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.4,
  },
  warmthLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  aiCardWrap: {
    borderRadius: 24,
    overflow: "hidden",
  },
  aiCard: {
    padding: 20,
    gap: 14,
    borderRadius: 24,
    overflow: "hidden",
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#E8C988",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  aiBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#0F1B2D",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  aiBody: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
  },
  aiName: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  aiReason: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  aiCta: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    backgroundColor: "#E8C988",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  aiCtaText: {
    color: "#0F1B2D",
    fontWeight: "700",
    fontSize: 13,
  },
  aiOrb: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#8B7CC8",
    opacity: 0.18,
    right: -60,
    top: -60,
  },
  actionsRow: {
    flexDirection: "row",
    gap: 10,
  },
  action: {
    flex: 1,
    backgroundColor: Colors.card,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    gap: 8,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: Colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },
  seeAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 6,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.goldDeep,
  },
  birthdayCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 12,
    width: 120,
    alignItems: "center",
    gap: 6,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  birthdayIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: Colors.goldSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  birthdayName: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  birthdayDate: {
    fontSize: 12,
    color: Colors.goldDeep,
    fontWeight: "600",
  },
  activityCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 4,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  activityMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  activityDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: 16,
  },
  empty: {
    padding: 24,
    textAlign: "center",
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
