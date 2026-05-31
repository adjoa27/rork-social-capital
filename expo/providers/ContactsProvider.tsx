import createContextHook from "@nkzw/create-context-hook";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { supabase } from "@/lib/supabase";
import { useAuth, type AuthUser } from "@/providers/AuthProvider";
import {
  type Contact,
  type Interaction,
  type RelationshipCategory,
  type SocialUpdate,
  type WarmthLevel,
  SEED_CONTACTS,
} from "@/constants/mockData";

/** ─── Types for Supabase row shape ────────────────────────── */

interface ContactRow {
  id: string;
  user_id: string;
  name: string;
  photo: string | null;
  company: string | null;
  title: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  tags: string[];
  category: string;
  warmth: string;
  strength_score: number;
  notes: string[];
  met_at: string | null;
  last_interaction: string;
  birthday: string | null;
  reminder_cadence_days: number;
  linkedin_connected: boolean;
  social_updates: SocialUpdate[];
  interactions: Interaction[];
}

/** Map Supabase row → Contact */
function rowToContact(row: ContactRow): Contact {
  return {
    id: row.id,
    name: row.name,
    photo: row.photo ?? undefined,
    company: row.company ?? undefined,
    title: row.title ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    linkedin: row.linkedin ?? undefined,
    tags: row.tags ?? [],
    category: (row.category as RelationshipCategory) ?? "Associate",
    warmth: (row.warmth as WarmthLevel) ?? "warm",
    strengthScore: row.strength_score ?? 60,
    notes: row.notes ?? [],
    metAt: row.met_at ?? undefined,
    lastInteraction: row.last_interaction ?? new Date().toISOString(),
    birthday: row.birthday ?? undefined,
    reminderCadenceDays: row.reminder_cadence_days ?? 30,
    linkedinConnected: row.linkedin_connected ?? false,
    socialUpdates: row.social_updates ?? [],
    interactions: row.interactions ?? [],
  };
}

/** Map Contact → Supabase row */
function contactToRow(contact: Contact, userId: string): ContactRow {
  return {
    id: contact.id,
    user_id: userId,
    name: contact.name,
    photo: contact.photo ?? null,
    company: contact.company ?? null,
    title: contact.title ?? null,
    email: contact.email ?? null,
    phone: contact.phone ?? null,
    linkedin: contact.linkedin ?? null,
    tags: contact.tags ?? [],
    category: contact.category,
    warmth: contact.warmth,
    strength_score: contact.strengthScore,
    notes: contact.notes ?? [],
    met_at: contact.metAt ?? null,
    last_interaction: contact.lastInteraction,
    birthday: contact.birthday ?? null,
    reminder_cadence_days: contact.reminderCadenceDays ?? 30,
    linkedin_connected: contact.linkedinConnected ?? false,
    social_updates: contact.socialUpdates ?? [],
    interactions: contact.interactions ?? [],
  };
}

/** ─── Seed contacts for first-time users ──────────────────── */

async function seedContacts(userId: string): Promise<Contact[]> {
  const now = new Date().toISOString();
  const rows = SEED_CONTACTS.map((c) => ({
    ...contactToRow(c, userId),
    id: `${userId}_${c.id}`,
  }));

  const { error } = await supabase.from("contacts").insert(rows);
  if (error) {
    console.error("[Social Capital] seed failed:", error.message);
    return [];
  }

  const { data } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data as ContactRow[] | null)?.map(rowToContact) ?? [];
}

/** ─── Fetch contacts from Supabase ────────────────────────── */

async function fetchContacts(user: AuthUser | null): Promise<Contact[]> {
  if (!user) return [];

  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Social Capital] fetch failed:", error.message);
    return [];
  }

  if (!data || data.length === 0) {
    return seedContacts(user.id);
  }

  return (data as ContactRow[]).map(rowToContact);
}

/** ─── Provider ────────────────────────────────────────────── */

async function syncProfile(user: AuthUser) {
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      avatar_url: user.picture ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );
  if (error) console.error("[Social Capital] profile sync failed:", error.message);
}

export const [ContactsProvider, useContacts] = createContextHook(() => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const query = useQuery<Contact[]>({
    queryKey: ["contacts", user?.id],
    queryFn: () => fetchContacts(user),
    staleTime: 30_000,
    enabled: !!user,
  });

  useEffect(() => {
    if (user) syncProfile(user);
  }, [user]);

  useEffect(() => {
    if (query.data && !hydrated) {
      setContacts(query.data);
      setHydrated(true);
    }
  }, [query.data, hydrated]);

  /** ── Helpers ──────────────────────────────────────────── */

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["contacts", user?.id] });
  }, [queryClient, user?.id]);

  /** ── CRUD ─────────────────────────────────────────────── */

  const addContact = useCallback(
    async (input: Partial<Contact> & { name: string }) => {
      if (!user) return null;
      const now = new Date().toISOString();
      const newContact: Contact = {
        id: `${user.id}_c_${Date.now()}`,
        name: input.name,
        photo: input.photo,
        company: input.company,
        title: input.title,
        email: input.email,
        phone: input.phone,
        linkedin: input.linkedin,
        tags: input.tags ?? [],
        category: input.category ?? ("Associate" as RelationshipCategory),
        warmth: input.warmth ?? ("warm" as WarmthLevel),
        strengthScore: input.strengthScore ?? 60,
        notes: input.notes ?? [],
        metAt: input.metAt,
        lastInteraction: input.lastInteraction ?? now,
        birthday: input.birthday,
        reminderCadenceDays: input.reminderCadenceDays ?? 30,
        socialUpdates: input.socialUpdates ?? [],
        linkedinConnected: input.linkedinConnected ?? false,
        interactions: input.interactions ?? [
          { id: `i_${Date.now()}`, type: "note", title: "Added to Social Capital", date: now },
        ],
      };

      const { error } = await supabase.from("contacts").insert(contactToRow(newContact, user.id));
      if (error) {
        Alert.alert("Error", "Could not save contact. Please try again.");
        console.error("[Social Capital] insert failed:", error.message);
        return null;
      }
      invalidate();
      setContacts((prev) => [newContact, ...prev]);
      return newContact;
    },
    [user, invalidate]
  );

  const updateContact = useCallback(
    async (id: string, patch: Partial<Contact>) => {
      if (!user) return;
      const existing = contacts.find((c) => c.id === id);
      if (!existing) return;
      const merged = { ...existing, ...patch };
      const { error } = await supabase
        .from("contacts")
        .update(contactToRow(merged, user.id))
        .eq("id", id);
      if (error) {
        console.error("[Social Capital] update failed:", error.message);
        return;
      }
      invalidate();
      setContacts((prev) => prev.map((c) => (c.id === id ? merged : c)));
    },
    [user, contacts, invalidate]
  );

  const deleteContact = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("contacts").delete().eq("id", id);
      if (error) {
        console.error("[Social Capital] delete failed:", error.message);
        return;
      }
      invalidate();
      setContacts((prev) => prev.filter((c) => c.id !== id));
    },
    [invalidate]
  );

  const addInteraction = useCallback(
    async (id: string, interaction: Omit<Interaction, "id">) => {
      if (!user) return;
      const full: Interaction = { id: `i_${Date.now()}`, ...interaction };
      const existing = contacts.find((c) => c.id === id);
      if (!existing) return;
      const updated: Contact = {
        ...existing,
        lastInteraction: interaction.date,
        interactions: [full, ...existing.interactions],
      };
      setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)));
      const { error } = await supabase
        .from("contacts")
        .update({
          last_interaction: interaction.date,
          interactions: [full, ...existing.interactions],
        })
        .eq("id", id);
      if (error) console.error("[Social Capital] addInteraction failed:", error.message);
    },
    [user, contacts]
  );

  const addNote = useCallback(
    async (id: string, note: string) => {
      if (!user) return;
      const existing = contacts.find((c) => c.id === id);
      if (!existing) return;
      const updated = { ...existing, notes: [note, ...existing.notes] };
      setContacts((prev) => prev.map((c) => (c.id === id ? updated : c)));
      const { error } = await supabase
        .from("contacts")
        .update({ notes: [note, ...existing.notes] })
        .eq("id", id);
      if (error) console.error("[Social Capital] addNote failed:", error.message);
    },
    [user, contacts]
  );

  /** ── Stats ────────────────────────────────────────────── */

  const stats = useMemo(() => {
    const total = contacts.length;
    const strong = contacts.filter((c) => c.warmth === "strong").length;
    const cooling = contacts.filter((c) => c.warmth === "cooling" || c.warmth === "cold").length;
    const avgScore =
      total === 0 ? 0 : Math.round(contacts.reduce((s, c) => s + c.strengthScore, 0) / total);
    return { total, strong, cooling, avgScore };
  }, [contacts]);

  return {
    contacts,
    isLoading: query.isLoading || !hydrated,
    addContact,
    updateContact,
    deleteContact,
    addInteraction,
    addNote,
    stats,
  };
});

/** ── Convenience hooks ───────────────────────────────────── */

export function useContactById(id: string | undefined) {
  const { contacts } = useContacts();
  return useMemo(() => contacts.find((c) => c.id === id), [contacts, id]);
}

export function useReconnectSuggestions(limit: number = 5) {
  const { contacts } = useContacts();
  return useMemo(() => {
    return [...contacts]
      .sort((a, b) => {
        const order = (w: WarmthLevel) =>
          w === "cold" ? 0 : w === "cooling" ? 1 : w === "warm" ? 2 : 3;
        const orderDiff = order(a.warmth) - order(b.warmth);
        if (orderDiff !== 0) return orderDiff;
        return new Date(a.lastInteraction).getTime() - new Date(b.lastInteraction).getTime();
      })
      .filter((c) => c.warmth !== "strong")
      .slice(0, limit);
  }, [contacts, limit]);
}

export function useUpcomingBirthdays(daysAhead: number = 30) {
  const { contacts } = useContacts();
  return useMemo(() => {
    const now = new Date();
    const result: { contact: Contact; date: Date; daysUntil: number }[] = [];
    for (const c of contacts) {
      if (!c.birthday) continue;
      const b = new Date(c.birthday);
      const next = new Date(now.getFullYear(), b.getMonth(), b.getDate());
      if (next < now) next.setFullYear(now.getFullYear() + 1);
      const diffDays = Math.ceil((next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= daysAhead) {
        result.push({ contact: c, date: next, daysUntil: diffDays });
      }
    }
    return result.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [contacts, daysAhead]);
}
