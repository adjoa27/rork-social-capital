import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase, hasValidJwt } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import {
  Contact,
  Interaction,
  RelationshipCategory,
  SEED_CONTACTS,
  WarmthLevel,
} from "@/constants/mockData";

const STORAGE_KEY = "warmly:contacts:v1";

/** Normalize a raw DB row into the Contact type, filling in defaults. */
function normalizeContact(
  raw: Partial<Contact> & { id: string; name: string },
): Contact {
  return {
    ...raw,
    tags: raw.tags ?? [],
    notes: raw.notes ?? [],
    interactions: raw.interactions ?? [],
    socialUpdates: raw.socialUpdates ?? [],
    warmth: raw.warmth ?? "warm",
    strengthScore: raw.strengthScore ?? 60,
    lastInteraction: raw.lastInteraction ?? new Date().toISOString(),
    category: raw.category ?? "Associate",
    linkedinConnected: raw.linkedinConnected ?? false,
    starred: raw.starred ?? false,
  };
}

async function loadFromCache(): Promise<Contact[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return (JSON.parse(raw) as Partial<Contact>[])
      .map((c) =>
        normalizeContact(
          c as Partial<Contact> & { id: string; name: string },
        ),
      );
  } catch {
    return [];
  }
}

async function saveToCache(contacts: Contact[]) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  } catch (e) {
    console.error("[SocialCapital] Failed to save cache:", e);
  }
}

async function loadLocalContacts(): Promise<Contact[]> {
  const cached = await loadFromCache();
  if (cached.length > 0) return cached;
  await saveToCache(SEED_CONTACTS);
  return SEED_CONTACTS;
}

function createEntityId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function contactToDbRow(contact: Contact, userId: string): Record<string, unknown> {
  return {
    id: contact.id,
    user_id: userId,
    name: contact.name,
    photo: contact.photo,
    company: contact.company,
    title: contact.title,
    email: contact.email,
    phone: contact.phone,
    linkedin: contact.linkedin,
    tags: contact.tags,
    category: contact.category,
    warmth: contact.warmth,
    strength_score: contact.strengthScore,
    notes: contact.notes,
    met_at: contact.metAt,
    last_interaction: contact.lastInteraction,
    birthday: contact.birthday,
    reminder_cadence_days: contact.reminderCadenceDays,
    linkedin_connected: contact.linkedinConnected,
    starred: contact.starred,
    social_updates: contact.socialUpdates,
    interactions: contact.interactions,
  };
}

function contactPatchToDbPatch(patch: Partial<Contact>): Record<string, unknown> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.photo !== undefined) dbPatch.photo = patch.photo;
  if (patch.company !== undefined) dbPatch.company = patch.company;
  if (patch.title !== undefined) dbPatch.title = patch.title;
  if (patch.email !== undefined) dbPatch.email = patch.email;
  if (patch.phone !== undefined) dbPatch.phone = patch.phone;
  if (patch.linkedin !== undefined) dbPatch.linkedin = patch.linkedin;
  if (patch.tags !== undefined) dbPatch.tags = patch.tags;
  if (patch.category !== undefined) dbPatch.category = patch.category;
  if (patch.warmth !== undefined) dbPatch.warmth = patch.warmth;
  if (patch.strengthScore !== undefined) dbPatch.strength_score = patch.strengthScore;
  if (patch.notes !== undefined) dbPatch.notes = patch.notes;
  if (patch.metAt !== undefined) dbPatch.met_at = patch.metAt;
  if (patch.lastInteraction !== undefined) dbPatch.last_interaction = patch.lastInteraction;
  if (patch.birthday !== undefined) dbPatch.birthday = patch.birthday;
  if (patch.reminderCadenceDays !== undefined) {
    dbPatch.reminder_cadence_days = patch.reminderCadenceDays;
  }
  if (patch.linkedinConnected !== undefined) {
    dbPatch.linkedin_connected = patch.linkedinConnected;
  }
  if (patch.starred !== undefined) {
    dbPatch.starred = patch.starred;
  }
  if (patch.socialUpdates !== undefined) dbPatch.social_updates = patch.socialUpdates;
  if (patch.interactions !== undefined) dbPatch.interactions = patch.interactions;
  return dbPatch;
}

function logSupabaseIssue(action: string, message: string): void {
  const lower = message.toLowerCase();
  const safeMessage =
    lower.includes("row-level security") || lower.includes("permission denied")
      ? "Supabase access policy rejected the request; local copy retained."
      : message;
  console.warn(`[SocialCapital] ${action}: ${safeMessage}`);
}

async function canSyncToSupabase(userId: string | null | undefined): Promise<boolean> {
  return Boolean(userId) && (await hasValidJwt());
}

async function saveContactToSupabase(
  userId: string | null | undefined,
  contact: Contact,
): Promise<void> {
  if (!(await canSyncToSupabase(userId)) || !userId) return;

  const { error } = await supabase
    .from("contacts")
    .upsert(contactToDbRow(contact, userId), { onConflict: "id" });

  if (error) logSupabaseIssue("Contact sync failed", error.message);
}

async function updateContactInSupabase(
  userId: string | null | undefined,
  id: string,
  patch: Record<string, unknown>,
  action: string,
): Promise<void> {
  if (Object.keys(patch).length === 0) return;
  if (!(await canSyncToSupabase(userId)) || !userId) return;

  const { error } = await supabase
    .from("contacts")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) logSupabaseIssue(action, error.message);
}

async function deleteContactFromSupabase(
  userId: string | null | undefined,
  id: string,
): Promise<void> {
  if (!(await canSyncToSupabase(userId)) || !userId) return;

  const { error } = await supabase
    .from("contacts")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) logSupabaseIssue("Contact delete sync failed", error.message);
}

/**
 * Seed contacts from the Supabase database. Falls back to local cache
 * or static seed data when the user is not authenticated.
 */
async function loadContacts(userId: string | null): Promise<Contact[]> {
  if (!userId || !(await hasValidJwt())) {
    return loadLocalContacts();
  }

  // Fetch from Supabase
  const { data, error } = await supabase
    .from("contacts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[SocialCapital] Supabase load failed:", error.message);
    return loadFromCache();
  }

  if (!data || data.length === 0) {
    // No contacts yet — seed with defaults
    const seeded = SEED_CONTACTS.map((c) => ({
      ...c,
      user_id: userId,
      id: `${userId}_${c.id}`,
    }));

    const inserts = seeded.map((contact) => contactToDbRow(contact, userId));

    const { error: insertErr } = await supabase.from("contacts").insert(inserts);

    if (insertErr) {
      logSupabaseIssue("Seed contact sync failed", insertErr.message);
    }

    await saveToCache(seeded);
    return seeded;
  }

  // Map DB rows to Contact type
  const mapped: Contact[] = data.map((row: Record<string, unknown>) =>
    normalizeContact({
      id: row.id as string,
      name: row.name as string,
      photo: row.photo as string | undefined,
      company: row.company as string | undefined,
      title: row.title as string | undefined,
      email: row.email as string | undefined,
      phone: row.phone as string | undefined,
      linkedin: row.linkedin as string | undefined,
      tags: row.tags as string[] | undefined,
      category: row.category as RelationshipCategory | undefined,
      warmth: row.warmth as WarmthLevel | undefined,
      strengthScore: row.strength_score as number | undefined,
      notes: row.notes as string[] | undefined,
      metAt: row.met_at as string | undefined,
      lastInteraction: row.last_interaction as string,
      birthday: row.birthday as string | undefined,
      reminderCadenceDays: row.reminder_cadence_days as
        | number
        | undefined,
      linkedinConnected: row.linkedin_connected as boolean | undefined,
      starred: row.starred as boolean | undefined,
      socialUpdates: row.social_updates as
        | Contact["socialUpdates"]
        | undefined,
      interactions: row.interactions as Contact["interactions"] | undefined,
    }),
  );

  await saveToCache(mapped);
  return mapped;
}

export const [ContactsProvider, useContacts] = createContextHook(() => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [hydrated, setHydrated] = useState<boolean>(false);

  const query = useQuery<Contact[]>({
    queryKey: ["contacts", user?.id],
    queryFn: () => loadContacts(user?.id ?? null),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (query.data) {
      setContacts(query.data);
      setHydrated(true);
    }
  }, [query.data]);

  const persist = useCallback(
    async (next: Contact[]) => {
      setContacts(next);
      await saveToCache(next);
    },
    [],
  );

  const addContact = useCallback(
    (input: Partial<Contact> & { name: string }) => {
      const now = new Date().toISOString();
      const newContact: Contact = {
        id: createEntityId("c"),
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
          {
            id: createEntityId("i"),
            type: "note",
            title: "Added to Social Capital",
            date: now,
          },
        ],
      };

      setContacts((previous) => {
        const next = [newContact, ...previous];
        void saveToCache(next);
        return next;
      });
      void saveContactToSupabase(user?.id, newContact);
      return newContact;
    },
    [user?.id],
  );

  const updateContact = useCallback(
    (id: string, patch: Partial<Contact>) => {
      const next = contacts.map((c) => (c.id === id ? { ...c, ...patch } : c));
      void persist(next);
      void updateContactInSupabase(
        user?.id,
        id,
        contactPatchToDbPatch(patch),
        "Contact update sync failed",
      );
    },
    [contacts, persist, user?.id],
  );

  const deleteContact = useCallback(
    (id: string) => {
      void persist(contacts.filter((c) => c.id !== id));
      void deleteContactFromSupabase(user?.id, id);
    },
    [contacts, persist, user?.id],
  );

  const addInteraction = useCallback(
    (id: string, interaction: Omit<Interaction, "id">) => {
      const next = contacts.map((c) => {
        if (c.id !== id) return c;
        const full: Interaction = {
          id: createEntityId("i"),
          ...interaction,
        };
        return {
          ...c,
          lastInteraction: interaction.date,
          interactions: [full, ...c.interactions],
        };
      });
      void persist(next);

      const target = next.find((c) => c.id === id);
      if (target) {
        void updateContactInSupabase(
          user?.id,
          id,
          {
            last_interaction: interaction.date,
            interactions: target.interactions,
          },
          "Contact interaction sync failed",
        );
      }
    },
    [contacts, persist, user?.id],
  );

  const addNote = useCallback(
    (id: string, note: string) => {
      const next = contacts.map((c) =>
        c.id === id ? { ...c, notes: [note, ...c.notes] } : c,
      );
      void persist(next);

      const target = next.find((c) => c.id === id);
      if (target) {
        void updateContactInSupabase(
          user?.id,
          id,
          { notes: target.notes },
          "Contact note sync failed",
        );
      }
    },
    [contacts, persist, user?.id],
  );

  const toggleStarred = useCallback(
    (id: string) => {
      const target = contacts.find((c) => c.id === id);
      if (!target) return;
      const next = contacts.map((c) =>
        c.id === id ? { ...c, starred: !c.starred } : c,
      );
      void persist(next);
      void updateContactInSupabase(
        user?.id,
        id,
        { starred: !target.starred },
        "Contact star sync failed",
      );
    },
    [contacts, persist, user?.id],
  );

  const stats = useMemo(() => {
    const total = contacts.length;
    const strong = contacts.filter((c) => c.warmth === "strong").length;
    const warm = contacts.filter((c) => c.warmth === "warm").length;
    const cooling = contacts.filter((c) => c.warmth === "cooling").length;
    const cold = contacts.filter((c) => c.warmth === "cold").length;
    const avgScore =
      total === 0
        ? 0
        : Math.round(
            contacts.reduce((s, c) => s + c.strengthScore, 0) / total,
          );
    const starred = contacts.filter((c) => c.starred).length;
    return { total, strong, warm, cooling, cold, avgScore, starred };
  }, [contacts]);

  return {
    contacts,
    isLoading: query.isLoading || !hydrated,
    addContact,
    updateContact,
    deleteContact,
    addInteraction,
    addNote,
    toggleStarred,
    stats,
  };
});

/** Convenience hooks built on top of the contacts context. */
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
        return (
          new Date(a.lastInteraction).getTime() -
          new Date(b.lastInteraction).getTime()
        );
      })
      .filter((c) => c.warmth !== "strong")
      .slice(0, limit);
  }, [contacts, limit]);
}

export function useUpcomingBirthdays(daysAhead: number = 30) {
  const { contacts } = useContacts();
  return useMemo(() => {
    const now = new Date();
    const result: { contact: Contact; date: Date; daysUntil: number }[] =
      [];
    for (const c of contacts) {
      if (!c.birthday) continue;
      const b = new Date(c.birthday);
      const next = new Date(now.getFullYear(), b.getMonth(), b.getDate());
      if (next < now) next.setFullYear(now.getFullYear() + 1);
      const diffDays = Math.ceil(
        (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      if (diffDays <= daysAhead) {
        result.push({ contact: c, date: next, daysUntil: diffDays });
      }
    }
    return result.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [contacts, daysAhead]);
}
