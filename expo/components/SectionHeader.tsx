import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Colors } from "@/constants/colors";

interface Props {
  title: string;
  caption?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function SectionHeader({ title, caption, actionLabel, onAction, icon }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}>
        {icon}
        <View>
          <Text style={styles.title}>{title}</Text>
          {caption ? <Text style={styles.caption}>{caption}</Text> : null}
        </View>
      </View>
      {actionLabel ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={styles.action}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: -0.4,
  },
  caption: {
    marginTop: 2,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  action: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.goldDeep,
  },
});
