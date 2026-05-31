import React from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { initials } from "@/utils/format";

interface Props {
  name: string;
  photo?: string;
  size?: number;
  style?: ViewStyle;
  ring?: boolean;
}

const GRADIENT_PAIRS: readonly [string, string][] = [
  ["#D4A85A", "#A4823F"],
  ["#8B7CC8", "#5E51A1"],
  ["#5BA9C7", "#2F7D9A"],
  ["#E0876A", "#B05A3F"],
  ["#6FAE7C", "#3F8B58"],
  ["#C97090", "#9A4567"],
];

function pickGradient(name: string): readonly [string, string] {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return GRADIENT_PAIRS[h % GRADIENT_PAIRS.length];
}

export function Avatar({ name, photo, size = 48, style, ring = false }: Props) {
  const radius = size / 2;
  const gradient = pickGradient(name);
  const fontSize = Math.max(11, size * 0.38);

  return (
    <View
      style={[
        { width: size, height: size, borderRadius: radius },
        ring && {
          padding: 2,
          backgroundColor: Colors.card,
          shadowColor: Colors.shadow,
          shadowOpacity: 1,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
        },
        style,
      ]}
    >
      <View
        style={{
          width: ring ? size - 4 : size,
          height: ring ? size - 4 : size,
          borderRadius: radius,
          overflow: "hidden",
        }}
      >
        {photo ? (
          <Image
            source={{ uri: photo }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.fallback}
          >
            <Text style={[styles.initials, { fontSize }]}>
              {initials(name)}
            </Text>
          </LinearGradient>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "#FFFFFF",
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
