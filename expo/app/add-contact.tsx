import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { Check, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import {
  RelationshipCategory,
  WarmthLevel,
} from "@/constants/mockData";
import { useContacts } from "@/providers/ContactsProvider";

const CATEGORIES: RelationshipCategory[] = [
  "Founder",
  "Investor",
  "Mentor",
  "Client",
  "Friend",
  "Recruiter",
  "Press",
  "Associate",
];

const WARMTHS: WarmthLevel[] = ["strong", "warm", "cooling", "cold"];

export default function AddContact() {
  const insets = useSafeAreaInsets();
  const { addContact } = useContacts();
  const [name, setName] = useState<string>("");
  const [company, setCompany] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [tags, setTags] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [cat, setCat] = useState<RelationshipCategory>("Associate");
  const [warmth, setWarmth] = useState<WarmthLevel>("warm");

  const canSave = name.trim().length > 0;

  const save = () => {
    if (!canSave) return;
    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {}
      );
    }
    addContact({
      name: name.trim(),
      company: company.trim() || undefined,
      title: title.trim() || undefined,
      email: email.trim() || undefined,
      tags: tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      notes: note.trim() ? [note.trim()] : [],
      category: cat,
      warmth,
      strengthScore:
        warmth === "strong"
          ? 85
          : warmth === "warm"
          ? 65
          : warmth === "cooling"
          ? 45
          : 25,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 12,
          paddingBottom: insets.bottom + 80,
        }}
        keyboardShouldPersistTaps="handled"
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
          <Text style={styles.title}>New contact</Text>
          <Pressable
            onPress={save}
            disabled={!canSave}
            style={[
              styles.iconBtn,
              styles.saveBtn,
              !canSave && { opacity: 0.4 },
            ]}
          >
            <Check size={20} color="#FFFFFF" strokeWidth={2.6} />
          </Pressable>
        </View>

        <View style={styles.card}>
          <Field
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            required
          />
          <Field
            label="Company"
            value={company}
            onChangeText={setCompany}
            placeholder="Where they work"
          />
          <Field
            label="Job title"
            value={title}
            onChangeText={setTitle}
            placeholder="Their role"
          />
          <Field
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="name@company.com"
            keyboardType="email-address"
          />
          <Field
            label="Tags"
            value={tags}
            onChangeText={setTags}
            placeholder="AI, Seed, B2B SaaS"
            hint="Comma separated"
          />
        </View>

        <Text style={styles.sectionLabel}>Relationship</Text>
        <View style={styles.card}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.chips}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c}
                onPress={() => setCat(c)}
                style={[
                  styles.chip,
                  cat === c && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    cat === c && { color: "#FFFFFF" },
                  ]}
                >
                  {c}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={[styles.fieldLabel, { marginTop: 14 }]}>Warmth</Text>
          <View style={styles.chips}>
            {WARMTHS.map((w) => (
              <Pressable
                key={w}
                onPress={() => setWarmth(w)}
                style={[
                  styles.chip,
                  warmth === w && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    warmth === w && { color: "#FFFFFF" },
                  ]}
                >
                  {w}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.sectionLabel}>First note</Text>
        <View style={styles.card}>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Met at … Interested in … Loves …"
            placeholderTextColor={Colors.textMuted}
            multiline
            style={styles.noteInput}
          />
          <Text style={styles.hint}>
            AI uses these notes to draft personalized messages.
          </Text>
        </View>

        <Pressable
          onPress={save}
          disabled={!canSave}
          style={({ pressed }) => [
            styles.cta,
            !canSave && { opacity: 0.5 },
            pressed && { opacity: 0.9 },
          ]}
        >
          <LinearGradient
            colors={["#1A2740", "#0F1B2D"]}
            style={styles.ctaInner}
          >
            <Text style={styles.ctaText}>Save contact</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  hint,
  required,
  keyboardType,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  hint?: string;
  required?: boolean;
  keyboardType?: "default" | "email-address";
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.fieldLabel}>
        {label}
        {required ? <Text style={{ color: Colors.danger }}> *</Text> : null}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType}
        autoCapitalize={keyboardType === "email-address" ? "none" : "words"}
        style={styles.input}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtn: {
    backgroundColor: Colors.text,
  },
  sectionLabel: {
    marginTop: 18,
    marginHorizontal: 20,
    marginBottom: 8,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    color: Colors.textSecondary,
  },
  card: {
    marginHorizontal: 20,
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 18,
    gap: 12,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 12,
    fontSize: 15,
    color: Colors.text,
  },
  hint: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: -2,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.backgroundAlt,
    borderRadius: 999,
  },
  chipActive: {
    backgroundColor: Colors.text,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
  },
  noteInput: {
    backgroundColor: Colors.backgroundAlt,
    padding: 14,
    borderRadius: 12,
    fontSize: 15,
    color: Colors.text,
    height: 110,
    textAlignVertical: "top",
  },
  cta: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  ctaInner: {
    paddingVertical: 16,
    alignItems: "center",
  },
  ctaText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
});
