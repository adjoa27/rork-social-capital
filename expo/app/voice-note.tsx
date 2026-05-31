import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import {
  Check,
  Mic,
  MicOff,
  Play,
  Square,
  Trash2,
  X,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";

interface RecordingItem {
  id: string;
  uri: string;
  durationMs: number;
  timestamp: string;
}

export default function VoiceNoteScreen() {
  const insets = useSafeAreaInsets();
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [durationMs, setDurationMs] = useState(0);
  const [permission, requestPermission] = Audio.usePermissions();
  const [recordings, setRecordings] = useState<RecordingItem[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [playbackSound, setPlaybackSound] = useState<Audio.Sound | null>(null);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);

  const startPulse = () => {
    pulseAnim.setValue(1);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseLoop.current = loop;
    loop.start();
  };

  const stopPulse = () => {
    pulseLoop.current?.stop();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const formatMs = (ms: number) => {
    const totalSec = Math.floor(ms / 1000);
    const min = Math.floor(totalSec / 60);
    const sec = totalSec % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  /** ── Start recording ──────────────────────────────── */

  const startRecording = async () => {
    if (permission?.status !== "granted") {
      const { status } = await requestPermission();
      if (status !== "granted") return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording && status.durationMillis > 0) {
            setDurationMs(status.durationMillis);
          }
        },
        200
      );

      setRecording(rec);
      setIsRecording(true);
      setDurationMs(0);
      startPulse();

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});
      }
    } catch (err: unknown) {
      console.error("[Social Capital] record start failed:", err);
    }
  };

  /** ── Stop recording ───────────────────────────────── */

  const stopRecording = async () => {
    if (!recording) return;
    stopPulse();

    try {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });

      const uri = recording.getURI();
      const finalMs = durationMs;

      if (uri && finalMs > 0) {
        const item: RecordingItem = {
          id: `vn_${Date.now()}`,
          uri,
          durationMs: finalMs,
          timestamp: new Date().toISOString(),
        };
        setRecordings((prev) => [item, ...prev]);
      }

      if (Platform.OS !== "web") {
        Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        ).catch(() => {});
      }
    } catch (err: unknown) {
      console.error("[Social Capital] record stop failed:", err);
    }

    setRecording(null);
    setIsRecording(false);
    setDurationMs(0);
  };

  /** ── Playback ─────────────────────────────────────── */

  const play = async (item: RecordingItem) => {
    try {
      if (playbackSound) {
        await playbackSound.unloadAsync();
        setPlaybackSound(null);
      }

      if (playingId === item.id) {
        setPlayingId(null);
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const { sound } = await Audio.Sound.createAsync(
        { uri: item.uri },
        { shouldPlay: true }
      );

      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setPlayingId(null);
          sound.unloadAsync();
        }
      });

      setPlaybackSound(sound);
      setPlayingId(item.id);
    } catch (err: unknown) {
      console.error("[Social Capital] playback failed:", err);
    }
  };

  const deleteRecording = async (item: RecordingItem) => {
    if (playingId === item.id && playbackSound) {
      await playbackSound.unloadAsync();
      setPlaybackSound(null);
      setPlayingId(null);
    }
    setRecordings((prev) => prev.filter((r) => r.id !== item.id));
  };

  /** ── Save last recording as note ──────────────────── */

  const saveAsNote = () => {
    if (recordings.length === 0) return;
    const latest = recordings[0];
    const noteText = `🎙 Voice note · ${formatMs(latest.durationMs)} · ${new Date(latest.timestamp).toLocaleString()}`;
    router.back();
    // Pass back via returnTo param for event mode to handle
  };

  /** ── Cleanup ──────────────────────────────────────── */

  useEffect(() => {
    return () => {
      pulseLoop.current?.stop();
      if (recording) {
        recording.stopAndUnloadAsync().catch(() => {});
      }
      if (playbackSound) {
        playbackSound.unloadAsync().catch(() => {});
      }
    };
  }, []);

  /** ── Permission gate ──────────────────────────────── */

  if (!permission) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.center]}>
        <MicOff size={44} color={Colors.textMuted} strokeWidth={1.8} />
        <Text style={styles.permTitle}>Microphone access needed</Text>
        <Text style={styles.permBody}>
          Social Capital uses your microphone to record voice notes after meeting
          someone, so the AI can remember key context.
        </Text>
        <Pressable onPress={requestPermission} style={styles.permBtn}>
          <Mic size={18} color="#0F1B2D" strokeWidth={2.4} />
          <Text style={styles.permBtnText}>Grant permission</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={styles.closeBtn}
          hitSlop={10}
        >
          <X size={20} color={Colors.text} strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.topTitle}>Voice note</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 40,
          gap: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Recording circle */}
        <View style={styles.recorderArea}>
          <Animated.View
            style={[
              styles.micOuter,
              isRecording && { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <View
              style={[
                styles.micInner,
                isRecording && styles.micInnerActive,
              ]}
            >
              {isRecording ? (
                <Square size={28} color="#FFFFFF" strokeWidth={3} />
              ) : (
                <Mic size={30} color={Colors.text} strokeWidth={2.4} />
              )}
            </View>
          </Animated.View>

          {isRecording ? (
            <>
              <Text style={styles.timer}>{formatMs(durationMs)}</Text>
              <Text style={styles.recLabel}>Recording… tap to stop</Text>
            </>
          ) : (
            <Text style={styles.idleLabel}>Tap to record a voice memo</Text>
          )}
        </View>

        {/* Record / Stop button */}
        <Pressable
          onPress={isRecording ? stopRecording : startRecording}
          style={({ pressed }) => [
            styles.recordBtn,
            isRecording && styles.recordBtnActive,
            pressed && { opacity: 0.9 },
          ]}
        >
          {isRecording ? (
            <>
              <Square size={18} color="#FFFFFF" strokeWidth={2.8} />
              <Text style={styles.recordBtnText}>Stop recording</Text>
            </>
          ) : (
            <>
              <Mic size={18} color="#0F1B2D" strokeWidth={2.4} />
              <Text style={[styles.recordBtnText, { color: "#0F1B2D" }]}>
                Start recording
              </Text>
            </>
          )}
        </Pressable>

        {/* Recordings list */}
        {recordings.length > 0 ? (
          <View style={{ gap: 8 }}>
            <Text style={styles.sectionTitle}>
              Recordings ({recordings.length})
            </Text>
            {recordings.map((item) => (
              <View key={item.id} style={styles.recordingRow}>
                <Pressable
                  onPress={() => play(item)}
                  style={styles.playBtn}
                >
                  <Play
                    size={16}
                    color={
                      playingId === item.id ? Colors.goldDeep : Colors.text
                    }
                    strokeWidth={2.6}
                    fill={
                      playingId === item.id ? Colors.goldDeep : "transparent"
                    }
                  />
                </Pressable>
                <View style={{ flex: 1 }}>
                  <Text style={styles.recordingTitle}>
                    Voice note · {formatMs(item.durationMs)}
                  </Text>
                  <Text style={styles.recordingMeta}>
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                </View>
                <Pressable
                  onPress={() => deleteRecording(item)}
                  style={styles.deleteBtn}
                  hitSlop={8}
                >
                  <Trash2 size={14} color={Colors.textMuted} strokeWidth={2} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Mic size={28} color={Colors.textMuted} strokeWidth={1.8} />
            <Text style={styles.emptyText}>No recordings yet</Text>
            <Text style={styles.emptySub}>
              Record quick voice memos after every conversation to remember key
              details.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 32,
  },
  loadingText: { color: Colors.textSecondary, fontSize: 15 },

  /* ── Permission ──────────────────────────────────── */
  permTitle: {
    color: Colors.text,
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

  /* ── Top bar ──────────────────────────────────────── */
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: "800",
    letterSpacing: -0.3,
  },

  /* ── Recorder circle ─────────────────────────────── */
  recorderArea: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 14,
  },
  micOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(232,201,136,0.3)",
  },
  micInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  micInnerActive: {
    backgroundColor: "#EF4444",
    shadowColor: "#EF4444",
    shadowRadius: 20,
    shadowOpacity: 0.5,
  },
  timer: {
    fontSize: 36,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.8,
    fontVariant: ["tabular-nums"] as const,
  },
  recLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#EF4444",
  },
  idleLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },

  /* ── Record button ────────────────────────────────── */
  recordBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#E8C988",
    paddingVertical: 15,
    borderRadius: 14,
  },
  recordBtnActive: {
    backgroundColor: "#EF4444",
  },
  recordBtnText: {
    fontWeight: "800",
    fontSize: 15,
    color: "#FFFFFF",
  },

  /* ── Recording list ───────────────────────────────── */
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  recordingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 14,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  recordingTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.text,
  },
  recordingMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  deleteBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Empty state ──────────────────────────────────── */
  emptyState: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  emptySub: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
});
