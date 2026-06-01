import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Camera, ScanLine, Sparkles, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useContacts } from "@/providers/ContactsProvider";

const MOCK_RESULTS = [
  {
    name: "Jordan Reyes",
    title: "Director of Partnerships",
    company: "Ridgeline Labs",
    email: "jordan@ridgeline.com",
    tags: ["BD", "Climate"],
  },
  {
    name: "Maya Singh",
    title: "Founder",
    company: "Foldcraft",
    email: "maya@foldcraft.io",
    tags: ["AI", "Founder"],
  },
  {
    name: "Theo Kim",
    title: "Investor",
    company: "Northbound Capital",
    email: "theo@northbound.vc",
    tags: ["Seed", "Investor"],
  },
];

export default function ScanCard() {
  const insets = useSafeAreaInsets();
  const { addContact } = useContacts();
  const [scanning, setScanning] = useState<boolean>(true);
  const [result, setResult] = useState<(typeof MOCK_RESULTS)[number] | null>(
    null
  );
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!scanning) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sweep, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(sweep, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    const t = setTimeout(() => {
      const pick = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)];
      setResult(pick);
      setScanning(false);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
      }
    }, 2400);
    return () => {
      loop.stop();
      clearTimeout(t);
    };
  }, [scanning, sweep]);

  const translateY = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  const save = () => {
    if (!result) return;
    addContact({
      name: result.name,
      title: result.title,
      company: result.company,
      email: result.email,
      tags: result.tags,
      category: "Associate",
      warmth: "warm",
      strengthScore: 55,
      notes: [`Scanned business card on ${new Date().toLocaleDateString()}`],
    });
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeBtn}
          hitSlop={10}
        >
          <X size={20} color="#FFFFFF" strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.topTitle}>Scan business card</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.frameWrap}>
        <LinearGradient
          colors={["#1A2740", "#0F1B2D"]}
          style={styles.cardArea}
        >
          <View style={styles.cardSurface}>
            <Camera size={28} color="#0F1B2D" strokeWidth={2.2} />
            <Text style={styles.cardName}>
              {result?.name ?? "JANE DOE"}
            </Text>
            <Text style={styles.cardTitle}>
              {result?.title ?? "Senior Product Manager"}
            </Text>
            <Text style={styles.cardCompany}>
              {result?.company ?? "Helix Studio"}
            </Text>
            <Text style={styles.cardEmail}>
              {result?.email ?? "jane@helix.studio"}
            </Text>
          </View>

          {/* Corner brackets */}
          {(["TL", "TR", "BL", "BR"] as const).map((p) => (
            <View key={p} style={[styles.bracket, bracketStyle(p)]} />
          ))}

          {scanning ? (
            <Animated.View
              style={[styles.scanLine, { transform: [{ translateY }] }]}
            >
              <LinearGradient
                colors={[
                  "rgba(232,201,136,0)",
                  "rgba(232,201,136,0.9)",
                  "rgba(232,201,136,0)",
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ height: "100%" }}
              />
            </Animated.View>
          ) : null}
        </LinearGradient>
      </View>

      <View style={styles.footer}>
        {scanning ? (
          <View style={styles.statusRow}>
            <ScanLine size={16} color={Colors.goldDeep} strokeWidth={2.4} />
            <Text style={styles.statusText}>Reading card with OCR…</Text>
          </View>
        ) : result ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHead}>
              <Sparkles size={14} color={Colors.goldDeep} strokeWidth={2.4} />
              <Text style={styles.resultHeadText}>AI extracted</Text>
            </View>
            <Text style={styles.resultName}>{result.name}</Text>
            <Text style={styles.resultMeta}>
              {result.title} · {result.company}
            </Text>
            <Text style={styles.resultEmail}>{result.email}</Text>
            <View style={styles.btnRow}>
              <Pressable
                onPress={() => {
                  setResult(null);
                  setScanning(true);
                }}
                style={[styles.btn, styles.btnGhost]}
              >
                <Text style={[styles.btnText, { color: Colors.text }]}>
                  Rescan
                </Text>
              </Pressable>
              <Pressable
                onPress={save}
                style={[styles.btn, styles.btnPrimary]}
              >
                <Text style={[styles.btnText, { color: "#FFFFFF" }]}>
                  Add contact
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function bracketStyle(p: "TL" | "TR" | "BL" | "BR") {
  switch (p) {
    case "TL":
      return { top: -2, left: -2, borderTopWidth: 3, borderLeftWidth: 3 };
    case "TR":
      return { top: -2, right: -2, borderTopWidth: 3, borderRightWidth: 3 };
    case "BL":
      return {
        bottom: -2,
        left: -2,
        borderBottomWidth: 3,
        borderLeftWidth: 3,
      };
    case "BR":
      return {
        bottom: -2,
        right: -2,
        borderBottomWidth: 3,
        borderRightWidth: 3,
      };
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F1B2D" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  frameWrap: {
    alignItems: "center",
    marginTop: 40,
  },
  cardArea: {
    width: 320,
    height: 220,
    borderRadius: 24,
    padding: 22,
    overflow: "hidden",
  },
  cardSurface: {
    flex: 1,
    backgroundColor: "#FBF7F0",
    borderRadius: 16,
    padding: 18,
    justifyContent: "center",
    gap: 4,
  },
  cardName: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "800",
    color: "#0F1B2D",
    letterSpacing: -0.3,
  },
  cardTitle: {
    fontSize: 13,
    color: "#5C6473",
  },
  cardCompany: {
    fontSize: 13,
    color: "#0F1B2D",
    fontWeight: "700",
  },
  cardEmail: {
    marginTop: 6,
    fontSize: 12,
    color: "#5C6473",
  },
  bracket: {
    position: "absolute",
    width: 20,
    height: 20,
    borderColor: "#E8C988",
    borderRadius: 4,
  },
  scanLine: {
    position: "absolute",
    left: 22,
    right: 22,
    top: 22,
    height: 28,
    borderRadius: 4,
  },
  footer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 14,
    borderRadius: 14,
  },
  statusText: {
    color: "#E8C988",
    fontSize: 14,
    fontWeight: "700",
  },
  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 18,
    gap: 4,
  },
  resultHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  resultHeadText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.goldDeep,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  resultName: {
    fontSize: 20,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.4,
  },
  resultMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  resultEmail: {
    fontSize: 13,
    color: Colors.text,
    marginTop: 4,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
  },
  btnGhost: {
    backgroundColor: Colors.backgroundAlt,
  },
  btnPrimary: {
    backgroundColor: Colors.text,
  },
  btnText: {
    fontWeight: "800",
    fontSize: 14,
  },
});
