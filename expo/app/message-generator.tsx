import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import * as MailComposer from "expo-mail-composer";
import * as SMS from "expo-sms";
import * as Speech from "expo-speech";
import {
  Copy,
  Mail,
  MessageSquare,
  RefreshCw,
  Sparkles,
  Volume2,
  Wand2,
  X,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { Colors } from "@/constants/colors";
import {
  CHANNELS,
  ChannelId,
  Contact,
  TONE_OPTIONS,
  ToneId,
} from "@/constants/mockData";
import { useContacts } from "@/providers/ContactsProvider";
import { daysSince } from "@/utils/format";

export default function MessageGenerator() {
  const insets = useSafeAreaInsets();
  const { contactId } = useLocalSearchParams<{ contactId?: string }>();
  const { contacts, addInteraction } = useContacts();

  const [selectedId, setSelectedId] = useState<string | undefined>(contactId);
  const [tone, setTone] = useState<ToneId>("reconnect");
  const [channel, setChannel] = useState<ChannelId>("text");
  const [draft, setDraft] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);

  const contact = useMemo(
    () => contacts.find((c) => c.id === selectedId),
    [contacts, selectedId]
  );

  const generate = () => {
    if (!contact) return;
    setGenerating(true);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    }
    setTimeout(() => {
      setDraft(composeDraft(contact, tone, channel));
      setGenerating(false);
    }, 700);
  };

  const copyToClipboard = async () => {
    if (!draft) return;
    await Clipboard.setStringAsync(draft);
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
    }
    Alert.alert("Copied", "Draft copied to clipboard.");
  };

  const readDraft = () => {
    if (!draft) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    Speech.speak(draft, { rate: 0.9 });
  };

  const sendAndLog = async () => {
    if (!contact || !draft) return;

    const typeLabel =
      channel === "linkedin"
        ? "LinkedIn message"
        : channel === "email"
        ? "Email"
        : "Text";

    if (channel === "email") {
      const isAvailable = await MailComposer.isAvailableAsync();
      if (!isAvailable) {
        await Clipboard.setStringAsync(draft);
        Alert.alert(
          "No mail account",
          "Mail composer is not available on this device. The draft has been copied to your clipboard."
        );
        return;
      }
      const lines = draft.split("\n");
      const subjectLine = lines.find((l) => l.startsWith("Subject:"));
      const subject = subjectLine ? subjectLine.replace("Subject:", "").trim() : "";
      const body = lines
        .filter((l) => !l.startsWith("Subject:"))
        .join("\n")
        .trim();
      await MailComposer.composeAsync({
        recipients: contact.email ? [contact.email] : [],
        subject,
        body,
      });
    } else if (channel === "text") {
      const isAvailable = await SMS.isAvailableAsync();
      if (!isAvailable || !contact.phone) {
        if (!contact.phone) {
          Alert.alert(
            "No phone number",
            "This contact doesn't have a phone number saved."
          );
        } else {
          await Clipboard.setStringAsync(draft);
          Alert.alert(
            "SMS unavailable",
            "SMS is not available on this device. Draft copied to clipboard."
          );
        }
        return;
      }
      await SMS.sendSMSAsync([contact.phone], draft);
    } else {
      // LinkedIn — copy and confirm
      await Clipboard.setStringAsync(draft);
      Alert.alert(
        "Copied for LinkedIn",
        "The message has been copied to your clipboard. Open LinkedIn to paste and send."
      );
    }

    addInteraction(contact.id, {
      type: channel === "email" ? "email" : "message",
      title: `${typeLabel} sent`,
      detail: draft.slice(0, 140),
      date: new Date().toISOString(),
    });
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
    }
    router.back();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 140,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            style={styles.iconBtn}
            hitSlop={10}
          >
            <X size={20} color={Colors.text} strokeWidth={2.4} />
          </Pressable>
          <View>
            <Text style={styles.eyebrow}>AI message</Text>
            <Text style={styles.title}>Draft a note</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Recipient picker */}
        {contact ? (
          <View style={styles.recipient}>
            <Avatar
              name={contact.name}
              photo={contact.photo}
              size={48}
              ring
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.recipName}>{contact.name}</Text>
              <Text style={styles.recipMeta}>
                {contact.company
                  ? `${contact.company} · `
                  : ""}
                {daysSince(contact.lastInteraction)}d since contact
              </Text>
            </View>
            <Pressable
              onPress={() => setSelectedId(undefined)}
              style={styles.changeBtn}
            >
              <Text style={styles.changeText}>Change</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              gap: 10,
            }}
          >
            {contacts.slice(0, 12).map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setSelectedId(c.id)}
                style={styles.pickerCard}
              >
                <Avatar name={c.name} photo={c.photo} size={48} />
                <Text style={styles.pickerName} numberOfLines={1}>
                  {c.name.split(" ")[0]}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Channel */}
        <Text style={styles.sectionLabel}>Channel</Text>
        <View style={styles.channelRow}>
          {CHANNELS.map((c) => {
            const active = channel === c.id;
            const Icon =
              c.id === "email"
                ? Mail
                : c.id === "linkedin"
                ? Linkedin
                : MessageSquare;
            return (
              <Pressable
                key={c.id}
                onPress={() => setChannel(c.id)}
                style={[styles.channelBtn, active && styles.channelActive]}
              >
                <Icon
                  size={16}
                  color={active ? "#FFFFFF" : Colors.text}
                  strokeWidth={2.4}
                />
                <Text
                  style={[
                    styles.channelText,
                    active && { color: "#FFFFFF" },
                  ]}
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Tone */}
        <Text style={styles.sectionLabel}>Tone</Text>
        <View style={styles.toneGrid}>
          {TONE_OPTIONS.map((t) => {
            const active = tone === t.id;
            return (
              <Pressable
                key={t.id}
                onPress={() => setTone(t.id)}
                style={[styles.toneCard, active && styles.toneActive]}
              >
                <Text style={styles.toneEmoji}>{t.emoji}</Text>
                <Text
                  style={[
                    styles.toneLabel,
                    active && { color: "#FFFFFF" },
                  ]}
                >
                  {t.label}
                </Text>
                <Text
                  style={[
                    styles.toneDesc,
                    active && { color: "rgba(255,255,255,0.78)" },
                  ]}
                >
                  {t.description}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Generate */}
        <Pressable
          onPress={generate}
          disabled={!contact || generating}
          style={({ pressed }) => [
            styles.generate,
            (!contact || generating) && { opacity: 0.7 },
            pressed && { opacity: 0.9 },
          ]}
        >
          <LinearGradient
            colors={["#C8A05A", "#A4823F"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.generateInner}
          >
            {generating ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Wand2 size={18} color="#FFFFFF" strokeWidth={2.6} />
            )}
            <Text style={styles.generateText}>
              {generating
                ? "Crafting your draft…"
                : draft
                ? "Regenerate draft"
                : "Generate draft"}
            </Text>
          </LinearGradient>
        </Pressable>

        {/* Memory */}
        {contact ? (
          <View style={styles.memory}>
            <View style={styles.memoryHead}>
              <Sparkles size={12} color={Colors.goldDeep} strokeWidth={2.6} />
              <Text style={styles.memoryHeadText}>AI memory used</Text>
            </View>
            <View style={{ gap: 6, marginTop: 8 }}>
              {contact.metAt ? (
                <MemoryBullet
                  label="Where you met"
                  value={contact.metAt}
                />
              ) : null}
              <MemoryBullet
                label="Last interaction"
                value={`${daysSince(contact.lastInteraction)}d ago`}
              />
              {contact.notes.slice(0, 2).map((n, i) => (
                <MemoryBullet key={i} label="Note" value={n} />
              ))}
            </View>
          </View>
        ) : null}

        {/* Draft output */}
        {draft ? (
          <View style={styles.draftCard}>
            <View style={styles.draftHead}>
              <Text style={styles.draftTitle}>Draft</Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Pressable style={styles.iconChip} onPress={copyToClipboard}>
                  <Copy size={14} color={Colors.text} strokeWidth={2.4} />
                </Pressable>
                <Pressable style={styles.iconChip} onPress={readDraft}>
                  <Volume2 size={14} color={Colors.text} strokeWidth={2.4} />
                </Pressable>
                <Pressable style={styles.iconChip} onPress={generate}>
                  <RefreshCw size={14} color={Colors.text} strokeWidth={2.4} />
                </Pressable>
              </View>
            </View>
            <Text style={styles.draftText}>{draft}</Text>
            <Pressable
              onPress={sendAndLog}
              style={({ pressed }) => [
                styles.send,
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={styles.sendText}>Looks good — log as sent</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function Linkedin(props: { size: number; color: string; strokeWidth: number }) {
  const { Linkedin: Icon } =
    require("lucide-react-native") as typeof import("lucide-react-native");
  return <Icon {...props} />;
}

function MemoryBullet({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.memBullet}>
      <View style={styles.memDot} />
      <Text style={styles.memLabel}>{label}: </Text>
      <Text style={styles.memValue}>{value}</Text>
    </View>
  );
}

function composeDraft(
  contact: Contact,
  tone: ToneId,
  channel: ChannelId
): string {
  const first = contact.name.split(" ")[0];
  const days = daysSince(contact.lastInteraction);
  const noteLine =
    contact.notes[0] && contact.notes[0].length < 120
      ? contact.notes[0]
      : undefined;
  const sharedHook = noteLine
    ? ` I keep thinking about what you mentioned — "${noteLine.toLowerCase()}".`
    : "";

  const intro: Record<ToneId, string> = {
    casual: `Hey ${first} 👋`,
    professional: `Hi ${first},`,
    friendly: `Hi ${first} — hope you're doing well!`,
    founder: `Hey ${first},`,
    investor: `Hi ${first},`,
    reconnect: `Hey ${first} — long time!`,
  };

  const body: Record<ToneId, string> = {
    casual: `It's been a minute (${days} days, but who's counting). Wanted to check in and see how things are going.${sharedHook}`,
    professional: `It has been ${days} days since we last connected and I wanted to reach back out.${sharedHook} I'd love to find time to catch up if your schedule allows.`,
    friendly: `Was just thinking about you and figured I'd send a quick note.${sharedHook} Would love to grab coffee or hop on a quick call soon.`,
    founder: `Quick founder-to-founder ping. Things are moving fast on our end and I'd love to compare notes.${sharedHook} Open to a 20-min call this week?`,
    investor: `Wanted to share a quick update.${sharedHook} We've been making strong progress on KPIs and I'd love your perspective on what's next. Happy to share a short deck.`,
    reconnect: `It's been ${days} days and I didn't want to let our connection go cold.${sharedHook} Genuinely curious how you're doing — and whether there's anything I can help with on my side.`,
  };

  const close: Record<ToneId, string> = {
    casual: `Talk soon!`,
    professional: `Best,\n`,
    friendly: `Talk soon,\n`,
    founder: `Cheers,\n`,
    investor: `Thanks,\n`,
    reconnect: `Looking forward,\n`,
  };

  if (channel === "email") {
    const subject =
      tone === "investor"
        ? "Quick update from our side"
        : tone === "reconnect"
        ? `Long overdue catch-up`
        : `Hey, it's been a while`;
    return `Subject: ${subject}\n\n${intro[tone]}\n\n${body[tone]}\n\n${close[tone]}`;
  }

  if (channel === "linkedin") {
    return `${intro[tone]} ${body[tone]} ${close[tone]}`;
  }

  // text — shorter
  return `${intro[tone]} ${body[tone].split(". ").slice(0, 2).join(". ")}.`;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.goldDeep,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    textAlign: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  recipient: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  recipName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  recipMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  changeBtn: {
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  changeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
  },
  pickerCard: {
    width: 80,
    backgroundColor: Colors.card,
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    gap: 6,
  },
  pickerName: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.text,
  },
  sectionLabel: {
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 8,
    fontSize: 11,
    fontWeight: "800",
    color: Colors.textSecondary,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  channelRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 20,
  },
  channelBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: Colors.card,
    paddingVertical: 12,
    borderRadius: 12,
  },
  channelActive: {
    backgroundColor: Colors.text,
  },
  channelText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.text,
  },
  toneGrid: {
    paddingHorizontal: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  toneCard: {
    width: "47.5%",
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 16,
    gap: 4,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  toneActive: {
    backgroundColor: Colors.text,
  },
  toneEmoji: {
    fontSize: 22,
  },
  toneLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  toneDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  generate: {
    marginHorizontal: 20,
    marginTop: 18,
    borderRadius: 16,
    overflow: "hidden",
  },
  generateInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
  },
  generateText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  memory: {
    marginHorizontal: 20,
    marginTop: 14,
    backgroundColor: Colors.cardAlt,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  memoryHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  memoryHeadText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.goldDeep,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  memBullet: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
  },
  memDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.goldDeep,
    marginTop: 7,
  },
  memLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
  },
  memValue: {
    flex: 1,
    fontSize: 12,
    color: Colors.textSecondary,
    flexShrink: 1,
  },
  draftCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  draftHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  draftTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  iconChip: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: Colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  draftText: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 21,
  },
  send: {
    marginTop: 14,
    backgroundColor: Colors.text,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  sendText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
});
