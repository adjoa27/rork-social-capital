import React, { useMemo, useState, useEffect } from "react";
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Plus, Search, SlidersHorizontal, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ContactRow } from "@/components/ContactRow";
import { Colors } from "@/constants/colors";
import {
  RelationshipCategory,
  WarmthLevel,
} from "@/constants/mockData";
import { useContacts } from "@/providers/ContactsProvider";

type FilterKey = "all" | RelationshipCategory | WarmthLevel;

const CATEGORIES: FilterKey[] = [
  "all",
  "Founder",
  "Investor",
  "Mentor",
  "Client",
  "Friend",
  "Recruiter",
  "Press",
];
const WARMTH: FilterKey[] = ["strong", "warm", "cooling", "cold"];

export default function ContactsScreen() {
  const insets = useSafeAreaInsets();
  const { contacts } = useContacts();
  const params = useLocalSearchParams<{ warmthFilter?: string }>();
  const [query, setQuery] = useState<string>("");
  const [filter, setFilter] = useState<FilterKey>("all");

  useEffect(() => {
    if (params.warmthFilter) {
      const w = params.warmthFilter as WarmthLevel;
      if (WARMTH.includes(w)) {
        setFilter(w);
      }
    }
  }, [params.warmthFilter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return contacts.filter((c) => {
      if (filter !== "all") {
        if (
          c.category !== filter &&
          c.warmth !== (filter as WarmthLevel)
        ) {
          return false;
        }
      }
      if (!q) return true;
      const hay = [
        c.name,
        c.company,
        c.title,
        c.tags.join(" "),
        c.notes.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [contacts, query, filter]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Your network</Text>
          <Text style={styles.title}>People</Text>
        </View>
        <Pressable
          onPress={() => router.push("/add-contact")}
          style={styles.addBtn}
        >
          <Plus size={20} color="#FFFFFF" strokeWidth={2.6} />
        </Pressable>
      </View>

      <View style={styles.searchBox}>
        <Search size={18} color={Colors.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name, company, tag…"
          placeholderTextColor={Colors.textMuted}
          style={styles.searchInput}
        />
        {query ? (
          <Pressable onPress={() => setQuery("")} hitSlop={8}>
            <X size={16} color={Colors.textMuted} />
          </Pressable>
        ) : (
          <SlidersHorizontal size={16} color={Colors.textMuted} />
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
      >
        {[...CATEGORIES, ...WARMTH].map((k) => (
          <Chip
            key={k}
            active={filter === k}
            label={chipLabel(k)}
            onPress={() => setFilter(k)}
            tone={WARMTH.includes(k) ? (k as WarmthLevel) : undefined}
          />
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 120,
          gap: 10,
        }}
        renderItem={({ item }) => <ContactRow contact={item} showStar />}
        ListEmptyComponent={<EmptyState query={query} />}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

function chipLabel(k: FilterKey): string {
  if (k === "all") return "All";
  return k.charAt(0).toUpperCase() + k.slice(1);
}

function Chip({
  label,
  active,
  onPress,
  tone,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  tone?: WarmthLevel;
}) {
  const activeBg =
    tone === "strong"
      ? "#10B981"
      : tone === "warm"
      ? "#C8A05A"
      : tone === "cooling"
      ? "#E07A3D"
      : tone === "cold"
      ? "#6E7C92"
      : Colors.text;
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && { backgroundColor: activeBg, borderColor: activeBg },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          active && { color: "#FFFFFF" },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyOrb} />
      <Text style={styles.emptyTitle}>
        {query ? "No matches" : "Your network starts here"}
      </Text>
      <Text style={styles.emptyBody}>
        {query
          ? "Try a different name, tag, or company."
          : "Add a contact, scan a card, or import your phone contacts."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.goldDeep,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.8,
    marginTop: 2,
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: Colors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBox: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.card,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    paddingVertical: 0,
  },
  chipsRow: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 14,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
  },
  empty: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 8,
  },
  emptyOrb: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.goldSoft,
    opacity: 0.6,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.text,
  },
  emptyBody: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 18,
  },
});
