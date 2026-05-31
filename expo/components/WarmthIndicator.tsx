import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { WarmthLevel } from "@/constants/mockData";

const LABEL: Record<WarmthLevel, string> = {
  strong: "Strong",
  warm: "Warm",
  cooling: "Cooling",
  cold: "Cold",
};

const GRAD: Record<WarmthLevel, readonly [string, string]> = {
  strong: ["#34D399", "#059669"],
  warm: ["#F4C77B", "#C8A05A"],
  cooling: ["#F8B27C", "#E07A3D"],
  cold: ["#B6C2D2", "#6E7C92"],
};

interface BadgeProps {
  warmth: WarmthLevel;
  style?: ViewStyle;
  compact?: boolean;
}

export function WarmthBadge({ warmth, style, compact = false }: BadgeProps) {
  const [a, b] = GRAD[warmth];
  return (
    <LinearGradient
      colors={[a, b]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.badge,
        compact && styles.badgeCompact,
        style,
      ]}
    >
      <View style={styles.dot} />
      <Text style={[styles.label, compact && styles.labelCompact]}>
        {LABEL[warmth]}
      </Text>
    </LinearGradient>
  );
}

interface MeterProps {
  score: number; // 0-100
  warmth: WarmthLevel;
  showLabel?: boolean;
}

export function WarmthMeter({ score, warmth, showLabel = true }: MeterProps) {
  const pct = Math.max(4, Math.min(100, score));
  const [a, b] = GRAD[warmth];
  return (
    <View>
      <View style={styles.meterTrack}>
        <LinearGradient
          colors={[a, b]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.meterFill, { width: `${pct}%` }]}
        />
      </View>
      {showLabel && (
        <View style={styles.meterLabel}>
          <Text style={styles.meterText}>{LABEL[warmth]} relationship</Text>
          <Text style={styles.meterScore}>{Math.round(score)}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    gap: 6,
    alignSelf: "flex-start",
  },
  badgeCompact: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  label: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.3,
  },
  labelCompact: {
    fontSize: 11,
  },
  meterTrack: {
    height: 10,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 999,
    overflow: "hidden",
  },
  meterFill: {
    height: "100%",
    borderRadius: 999,
  },
  meterLabel: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  meterText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: "500",
  },
  meterScore: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
});
