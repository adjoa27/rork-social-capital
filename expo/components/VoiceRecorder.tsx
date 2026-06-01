import React, { useState, useRef, useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
  Platform,
} from "react-native";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { Mic, Play, Square, Trash2, Volume2 } from "lucide-react-native";
import { Colors } from "@/constants/colors";

interface VoiceNote {
  id: string;
  uri: string;
  duration: number;
  createdAt: string;
  transcript?: string;
}

interface Props {
  contactId: string;
  notes: VoiceNote[];
  onAdd: (note: VoiceNote) => void;
  onDelete: (id: string) => void;
}

export function VoiceRecorder({
  contactId: _contactId,
  notes,
  onAdd,
  onDelete,
}: Props) {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState<string | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const recordingStartRef = useRef<number>(0);

  const startRecording = useCallback(async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(
          "Microphone needed",
          "Please allow microphone access to record voice notes.",
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(
          () => {},
        );
      }

      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      setRecording(rec);
      setIsRecording(true);
      recordingStartRef.current = Date.now();
    } catch (err) {
      console.error("[SocialCapital] Recording failed:", err);
      Alert.alert("Error", "Could not start recording.");
    }
  }, []);

  const stopRecording = useCallback(async () => {
    if (!recording) return;

    try {
      if (Platform.OS !== "web") {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(
          () => {},
        );
      }

      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recording.getURI();
      const duration = (Date.now() - recordingStartRef.current) / 1000;

      if (!uri || duration < 0.5) {
        setRecording(null);
        setIsRecording(false);
        return;
      }

      const note: VoiceNote = {
        id: `vn_${Date.now()}`,
        uri,
        duration: Math.round(duration),
        createdAt: new Date().toISOString(),
      };

      onAdd(note);
      setRecording(null);
      setIsRecording(false);

      // Auto-transcribe
      setTranscribing(note.id);
      try {
        const transcript = await transcribeAudio(uri);
        note.transcript = transcript;
        onAdd(note);
      } catch {
        // transcription is optional
      } finally {
        setTranscribing(null);
      }
    } catch (err) {
      console.error("[SocialCapital] Stop recording failed:", err);
      setRecording(null);
      setIsRecording(false);
    }
  }, [recording, onAdd]);

  const playNote = useCallback(
    async (note: VoiceNote) => {
      try {
        if (playingId === note.id && soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
          setPlayingId(null);
          return;
        }

        if (soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        }

        const { sound } = await Audio.Sound.createAsync(
          { uri: note.uri },
          { shouldPlay: true },
        );
        soundRef.current = sound;
        setPlayingId(note.id);

        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            setPlayingId(null);
            sound.unloadAsync();
            soundRef.current = null;
          }
        });
      } catch (err) {
        console.error("[SocialCapital] Playback failed:", err);
      }
    },
    [playingId],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Volume2 size={16} color={Colors.text} strokeWidth={2.4} />
          <Text style={styles.title}>Voice notes</Text>
        </View>
        <Pressable
          onPress={isRecording ? stopRecording : startRecording}
          style={({ pressed }) => [
            styles.recordBtn,
            isRecording && styles.recordingBtn,
            pressed && { opacity: 0.85 },
          ]}
        >
          {isRecording ? (
            <>
              <Square size={16} color="#FFFFFF" strokeWidth={2.8} />
              <Text style={styles.recordText}>Stop</Text>
            </>
          ) : (
            <>
              <Mic size={16} color={Colors.text} strokeWidth={2.4} />
              <Text style={styles.recordLabel}>Record</Text>
            </>
          )}
        </Pressable>
      </View>

      {isRecording ? (
        <View style={styles.recordingIndicator}>
          <View style={styles.pulse} />
          <Text style={styles.recordingLabel}>Recording…</Text>
        </View>
      ) : null}

      {notes.map((note) => (
        <View key={note.id} style={styles.noteRow}>
          <Pressable
            onPress={() => playNote(note)}
            style={styles.playBtn}
          >
            <Play
              size={14}
              color={
                playingId === note.id
                  ? Colors.goldDeep
                  : Colors.textSecondary
              }
              strokeWidth={2.6}
            />
          </Pressable>
          <View style={styles.noteInfo}>
            <Text style={styles.noteDuration}>
              {note.duration}s ·{" "}
              {new Date(note.createdAt).toLocaleDateString()}
            </Text>
            {note.transcript ? (
              <Text style={styles.noteTranscript} numberOfLines={2}>
                {note.transcript}
              </Text>
            ) : transcribing === note.id ? (
              <View style={styles.transcribingRow}>
                <ActivityIndicator size="small" color={Colors.goldDeep} />
                <Text style={styles.transcribingText}>
                  Transcribing…
                </Text>
              </View>
            ) : null}
          </View>
          <Pressable
            onPress={() => onDelete(note.id)}
            hitSlop={8}
          >
            <Trash2
              size={14}
              color={Colors.textMuted}
              strokeWidth={2}
            />
          </Pressable>
        </View>
      ))}

      {notes.length === 0 && !isRecording ? (
        <Text style={styles.empty}>
          Tap "Record" to capture a quick voice note about this
          contact. AI will transcribe it.
        </Text>
      ) : null}
    </View>
  );
}

/** Send audio to the Rork proxy for transcription via OpenAI Whisper. */
async function transcribeAudio(uri: string): Promise<string> {
  const TOOLKIT_URL = process.env.EXPO_PUBLIC_TOOLKIT_URL!;
  const SECRET_KEY = process.env.EXPO_PUBLIC_RORK_TOOLKIT_SECRET_KEY!;

  const formData = new FormData();
  formData.append("file", {
    uri,
    type: "audio/m4a",
    name: "voice_note.m4a",
  } as unknown as Blob);
  formData.append("model", "whisper-1");

  const response = await fetch(
    `${TOOLKIT_URL}/v2/openai/v1/audio/transcriptions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SECRET_KEY}`,
      },
      body: formData,
    },
  );

  if (!response.ok) {
    throw new Error(`Transcription failed (${response.status})`);
  }

  const data = (await response.json()) as { text: string };
  return data.text?.trim() ?? "";
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  recordBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  recordingBtn: {
    backgroundColor: "#DC2626",
  },
  recordText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  recordLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
  },
  pulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DC2626",
  },
  recordingLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#DC2626",
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: Colors.backgroundAlt,
    padding: 10,
    borderRadius: 12,
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  noteInfo: {
    flex: 1,
    gap: 3,
  },
  noteDuration: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  noteTranscript: {
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  transcribingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  transcribingText: {
    fontSize: 12,
    color: Colors.goldDeep,
    fontWeight: "500",
  },
  empty: {
    fontSize: 13,
    color: Colors.textMuted,
    lineHeight: 18,
  },
});
