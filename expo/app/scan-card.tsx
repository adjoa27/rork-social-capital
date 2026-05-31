import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
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
import {
  CameraView,
  useCameraPermissions,
  type CameraCapturedPicture,
} from "expo-camera";
import { generateObject } from "ai";
import { z } from "zod";
import {
  Camera,
  CameraOff,
  Check,
  RefreshCw,
  ScanLine,
  Sparkles,
  X,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useContacts } from "@/providers/ContactsProvider";
import { gateway } from "@/lib/ai-gateway";

const cardSchema = z.object({
  name: z.string().describe("Full name of the person"),
  title: z.string().optional().describe("Job title or role"),
  company: z.string().optional().describe("Company or organization name"),
  email: z.string().optional().describe("Email address"),
  phone: z.string().optional().describe("Phone number"),
  tags: z
    .array(z.string())
    .optional()
    .describe("Relevant industry/role tags (e.g. BD, AI, Founder)"),
});

type CardResult = z.infer<typeof cardSchema>;

const MOCK_RESULTS: CardResult[] = [
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
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [result, setResult] = useState<CardResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sweep = useRef(new Animated.Value(0)).current;
  const sweepAnim = useRef<Animated.CompositeAnimation | null>(null);

  const hasCamera = permission?.granted === true;

  const startSweep = () => {
    sweep.setValue(0);
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
    sweepAnim.current = loop;
    loop.start();
  };

  React.useEffect(() => {
    if (hasCamera && !result && !processing) {
      startSweep();
    }
    return () => {
      sweepAnim.current?.stop();
    };
  }, [hasCamera, result, processing]);

  const translateY = sweep.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  const captureAndExtract = async () => {
    if (!cameraRef.current || processing) return;
    sweepAnim.current?.stop();
    setProcessing(true);
    setError(null);

    try {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      }

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
        skipProcessing: true,
      });

      if (!photo?.base64) {
        throw new Error("Failed to capture photo");
      }

      const { object } = await generateObject({
        model: gateway("anthropic/claude-sonnet-4.6"),
        schema: cardSchema,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Extract contact information from this business card image. Return ONLY the fields you can clearly read. Leave missing fields undefined.

Instructions:
- name: Full name as printed
- title: Job title or role
- company: Company or organization
- email: Email address (look for @ symbol)
- phone: Phone number in any format
- tags: 2-3 short industry/role keywords (e.g. "AI", "Founder", "BD", "Investor", "Climate", "SaaS")

Respond with valid JSON matching the schema.`,
              },
              {
                type: "image",
                image: `data:image/jpeg;base64,${photo.base64}`,
              },
            ],
          },
        ],
        temperature: 0.1,
      });

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
      }

      setResult(object);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Could not read the card";
      console.error("[Social Capital] scan failed:", msg);
      setError(msg);

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Error
        ).catch(() => {});
      }
    } finally {
      setProcessing(false);
    }
  };

  const save = () => {
    if (!result) return;
    addContact({
      name: result.name,
      title: result.title,
      company: result.company,
      email: result.email,
      phone: result.phone,
      tags: result.tags ?? [],
      category: "Associate",
      warmth: "warm",
      strengthScore: 55,
      notes: [`Scanned business card on ${new Date().toLocaleDateString()}`],
    });
    router.back();
  };

  /** ── Permission gate ──────────────────────────────────── */

  if (!permission) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color="#E8C988" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <CameraOff size={44} color={Colors.textMuted} strokeWidth={1.8} />
        <Text style={styles.permTitle}>Camera access needed</Text>
        <Text style={styles.permBody}>
          Social Capital uses your camera to scan business cards and extract contact
          info automatically.
        </Text>
        <Pressable
          onPress={requestPermission}
          style={styles.permBtn}
        >
          <Camera size={18} color="#0F1B2D" strokeWidth={2.4} />
          <Text style={styles.permBtnText}>Grant permission</Text>
        </Pressable>
      </View>
    );
  }

  /** ── Main UI ──────────────────────────────────────────── */

  return (
    <View style={styles.container}>
      {/* Camera viewfinder */}
      <View style={styles.viewfinder}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          onCameraReady={() => {
            if (!result && !processing) startSweep();
          }}
        />

        {/* Card-shaped overlay guides */}
        <View style={styles.frameWrap}>
          <LinearGradient
            colors={["rgba(15,27,45,0.82)", "rgba(15,27,45,0.78)"]}
            style={styles.cardOverlay}
          >
            {/* Corner brackets */}
            {(["TL", "TR", "BL", "BR"] as const).map((p) => (
              <View key={p} style={[styles.bracket, bracketStyle(p)]} />
            ))}

            {!result && !processing ? (
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
      </View>

      {/* Top bar */}
      <View style={[styles.topBar, { top: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeBtn}
          hitSlop={10}
        >
          <X size={20} color="#FFFFFF" strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.topTitle}>
          {processing ? "Reading…" : "Scan business card"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Bottom controls / results */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {processing ? (
          <View style={styles.statusRow}>
            <ScanLine size={16} color={Colors.goldDeep} strokeWidth={2.4} />
            <Text style={styles.statusText}>AI extracting contact info…</Text>
          </View>
        ) : result ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHead}>
              <Sparkles size={14} color={Colors.goldDeep} strokeWidth={2.4} />
              <Text style={styles.resultHeadText}>AI extracted</Text>
            </View>
            <Text style={styles.resultName}>{result.name}</Text>
            {(result.title ?? result.company) ? (
              <Text style={styles.resultMeta}>
                {[result.title, result.company].filter(Boolean).join(" · ")}
              </Text>
            ) : null}
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
                  setError(null);
                }}
                style={[styles.btn, styles.btnGhost]}
              >
                <RefreshCw
                  size={15}
                  color={Colors.text}
                  strokeWidth={2.4}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.btnText, { color: Colors.text }]}>
                  Rescan
                </Text>
              </Pressable>
              <Pressable
                onPress={save}
                style={[styles.btn, styles.btnPrimary]}
              >
                <Check
                  size={15}
                  color="#FFFFFF"
                  strokeWidth={2.8}
                  style={{ marginRight: 4 }}
                />
                <Text style={[styles.btnText, { color: "#FFFFFF" }]}>
                  Add contact
                </Text>
              </Pressable>
            </View>
          </View>
        ) : error ? (
          <View style={styles.resultCard}>
            <Text style={styles.errorTitle}>Couldn't read the card</Text>
            <Text style={styles.errorBody}>{error}</Text>
            <View style={styles.btnRow}>
              <Pressable
                onPress={() => {
                  setError(null);
                  setResult(null);
                }}
                style={[styles.btn, styles.btnGhost]}
              >
                <Text style={[styles.btnText, { color: Colors.text }]}>
                  Try again
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const pick =
                    MOCK_RESULTS[
                      Math.floor(Math.random() * MOCK_RESULTS.length)
                    ];
                  setResult(pick);
                  setError(null);
                }}
                style={[styles.btn, styles.btnPrimary]}
              >
                <Text style={[styles.btnText, { color: "#FFFFFF" }]}>
                  Use demo
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={captureAndExtract}
            style={({ pressed }) => [
              styles.captureBtn,
              pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] },
            ]}
          >
            <View style={styles.captureOuter}>
              <View style={styles.captureInner} />
            </View>
            <Text style={styles.captureLabel}>Tap to capture</Text>
          </Pressable>
        )}
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
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },

  /* ── Permission screen ──────────────────────────── */
  permTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.4,
    marginTop: 12,
  },
  permBody: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  permBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E8C988",
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: 14,
    marginTop: 8,
  },
  permBtnText: {
    color: "#0F1B2D",
    fontWeight: "800",
    fontSize: 15,
  },

  /* ── Camera ─────────────────────────────────────── */
  viewfinder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#0F1B2D",
  },
  topBar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    zIndex: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: -0.2,
  },

  /* ── Card frame overlay ─────────────────────────── */
  frameWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
  },
  cardOverlay: {
    width: 310,
    height: 210,
    borderRadius: 24,
    overflow: "hidden",
  },
  scanLine: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 16,
    height: 28,
    borderRadius: 4,
  },
  bracket: {
    position: "absolute",
    width: 22,
    height: 22,
    borderColor: "#E8C988",
    borderRadius: 4,
  },

  /* ── Footer ─────────────────────────────────────── */
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  captureBtn: {
    alignItems: "center",
    gap: 10,
  },
  captureOuter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    borderWidth: 3,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#FFFFFF",
  },
  captureLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  /* ── Processing / Status ────────────────────────── */
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: "100%",
  },
  statusText: {
    color: "#E8C988",
    fontSize: 15,
    fontWeight: "700",
  },

  /* ── Result card ────────────────────────────────── */
  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: 22,
    padding: 20,
    gap: 4,
    width: "100%",
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
    fontSize: 22,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.4,
  },
  resultMeta: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  resultEmail: {
    fontSize: 13,
    color: Colors.text,
    marginTop: 4,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#EF4444",
  },
  errorBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  btnRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  btn: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
