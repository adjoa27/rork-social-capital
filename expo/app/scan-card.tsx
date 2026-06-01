import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import * as ImagePicker from "expo-image-picker";
import { Camera, ScanLine, Sparkles, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useContacts } from "@/providers/ContactsProvider";

interface ParsedCard {
  name: string;
  title: string;
  company: string;
  email: string;
  phone: string;
}

export default function ScanCard() {
  const insets = useSafeAreaInsets();
  const { addContact } = useContacts();
  const [scanning, setScanning] = useState<boolean>(true);
  const [processing, setProcessing] = useState<boolean>(false);
  const [result, setResult] = useState<ParsedCard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sweep = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
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
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [sweep]);

  const captureCard = async () => {
    setError(null);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setError("Camera permission is needed to scan business cards.");
      return;
    }

    const pickerResult = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (pickerResult.canceled || !pickerResult.assets[0]?.base64) return;

    setScanning(false);
    setProcessing(true);

    try {
      const base64Image = pickerResult.assets[0].base64;
      const parsed = await runVisionOCR(base64Image);
      setResult(parsed);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
      }
    } catch (err) {
      console.error("[SocialCapital] OCR failed:", err);
      setError("Couldn't read the card. Try again with better lighting.");
      setScanning(true);
    } finally {
      setProcessing(false);
    }
  };

  const save = () => {
    if (!result) return;
    addContact({
      name: result.name,
      title: result.title || undefined,
      company: result.company || undefined,
      email: result.email || undefined,
      phone: result.phone || undefined,
      tags: [],
      category: "Associate",
      warmth: "warm",
      strengthScore: 55,
      notes: [
        `Scanned business card on ${new Date().toLocaleDateString()}`,
      ],
    });
    router.back();
  };

  const translateY = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

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
          {result ? (
            <View style={styles.cardSurface}>
              <Text style={styles.cardName}>{result.name}</Text>
              <Text style={styles.cardTitle}>
                {result.title || "—"}
              </Text>
              <Text style={styles.cardCompany}>
                {result.company || "—"}
              </Text>
              {result.email ? (
                <Text style={styles.cardEmail}>{result.email}</Text>
              ) : null}
              {result.phone ? (
                <Text style={styles.cardEmail}>{result.phone}</Text>
              ) : null}
            </View>
          ) : (
            <View style={styles.cardSurface}>
              <Camera size={28} color="#0F1B2D" strokeWidth={2.2} />
              <Text style={styles.cardName}>Point camera at card</Text>
              <Text style={styles.cardTitle}>
                AI will extract the details
              </Text>
            </View>
          )}

          {(["TL", "TR", "BL", "BR"] as const).map((p) => (
            <View key={p} style={[styles.bracket, bracketStyle(p)]} />
          ))}

          {scanning ? (
            <Animated.View
              style={[
                styles.scanLine,
                { transform: [{ translateY }] },
              ]}
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
        {processing ? (
          <View style={styles.statusRow}>
            <ActivityIndicator color="#E8C988" />
            <Text style={styles.statusText}>AI reading card…</Text>
          </View>
        ) : error ? (
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: "#FCA5A5" }]}>
              {error}
            </Text>
          </View>
        ) : result ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHead}>
              <Sparkles
                size={14}
                color={Colors.goldDeep}
                strokeWidth={2.4}
              />
              <Text style={styles.resultHeadText}>AI extracted</Text>
            </View>
            <Text style={styles.resultName}>{result.name}</Text>
            <Text style={styles.resultMeta}>
              {result.title || ""}
              {result.title && result.company ? " · " : ""}
              {result.company || ""}
            </Text>
            {result.email ? (
              <Text style={styles.resultEmail}>{result.email}</Text>
            ) : null}
            {result.phone ? (
              <Text style={styles.resultEmail}>{result.phone}</Text>
            ) : null}
            <View style={styles.btnRow}>
              <Pressable
                onPress={() => {
                  setResult(null);
                  setScanning(true);
                }}
                style={[styles.btn, styles.btnGhost]}
              >
                <Text
                  style={[styles.btnText, { color: Colors.text }]}
                >
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
        ) : scanning ? (
          <Pressable
            onPress={captureCard}
            style={({ pressed }) => [
              styles.captureBtn,
              pressed && { opacity: 0.85 },
            ]}
          >
            <LinearGradient
              colors={["#C8A05A", "#A4823F"]}
              style={styles.captureInner}
            >
              <Camera size={22} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.captureText}>Capture card</Text>
            </LinearGradient>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

/**
 * Send the business card image to an AI vision model through the Rork proxy
 * for OCR extraction. Returns structured contact info.
 */
async function runVisionOCR(base64: string): Promise<ParsedCard> {
  const TOOLKIT_URL = process.env.EXPO_PUBLIC_TOOLKIT_URL!;
  const SECRET_KEY = process.env.EXPO_PUBLIC_RORK_TOOLKIT_SECRET_KEY!;

  const response = await fetch(
    `${TOOLKIT_URL}/v2/vercel/v1/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: 'Extract the contact details from this business card image. Return ONLY valid JSON with these fields (leave missing ones as empty string): {"name":"","title":"","company":"","email":"","phone":""}',
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Vision API error (${response.status})`);
  }

  const data = (await response.json()) as {
    choices: Array<{ message: { content: string } }>;
  };

  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Empty response");

  // Parse the JSON from the response
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in response");

  const parsed = JSON.parse(jsonMatch[0]) as ParsedCard;
  return parsed;
}

function bracketStyle(p: "TL" | "TR" | "BL" | "BR") {
  switch (p) {
    case "TL":
      return {
        top: -2,
        left: -2,
        borderTopWidth: 3,
        borderLeftWidth: 3,
      };
    case "TR":
      return {
        top: -2,
        right: -2,
        borderTopWidth: 3,
        borderRightWidth: 3,
      };
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
    paddingHorizontal: 16,
  },
  statusText: {
    color: "#E8C988",
    fontSize: 14,
    fontWeight: "700",
  },
  captureBtn: {
    borderRadius: 16,
    overflow: "hidden",
  },
  captureInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 18,
  },
  captureText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
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
