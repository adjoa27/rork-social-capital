import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { Platform } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { Avatar } from "@/components/Avatar";
import { WarmthBadge } from "@/components/WarmthIndicator";
import { Colors } from "@/constants/colors";
import { Contact } from "@/constants/mockData";
import { daysSince } from "@/utils/format";

interface Props {
  contact: Contact;
  onPress?: () => void;
}

export function ContactRow({ contact, onPress }: Props) {
  const days = daysSince(contact.lastInteraction);
  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.selectionAsync().catch(() => {});
        }
        if (onPress) onPress();
        else router.push(`/contact/${contact.id}`);
      }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <Avatar name={contact.name} photo={contact.photo} size={52} />
      <View style={styles.center}>
        <Text style={styles.name} numberOfLines={1}>
          {contact.name}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {contact.title ? `${contact.title}` : ""}
          {contact.title && contact.company ? " · " : ""}
          {contact.company ?? ""}
        </Text>
        <View style={styles.metaRow}>
          <WarmthBadge warmth={contact.warmth} compact />
          <Text style={styles.metaText}>
            {days === 0 ? "today" : `${days}d ago`}
          </Text>
        </View>
      </View>
      <ChevronRight size={18} color={Colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 18,
    gap: 14,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  center: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  sub: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  metaRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: "500",
  },
});
