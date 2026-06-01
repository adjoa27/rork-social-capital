import createContextHook from "@nkzw/create-context-hook";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Contact,
  Interaction,
  RelationshipCategory,
  SEED_CONTACTS,
  WarmthLevel,
} from "@/constants/mockData";

const STORAGE_KEY = "warmly:contacts:v1";

function normalizeContact(raw: Partial<Contact> & { id: string; name: string }): Contact {
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
  };
}

async function loadContacts(): Promise<Contact[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_CONTACTS));
      return SEED_CONTACTS;
    }
    const parsed = JSON.parse(raw) as Partial<Contact>[];
    const migrated = parsed.map((c) => normalizeContact(c as Partial<Contact> & { id: string; name: string }));
    return migrated;
  } catch (e) {
    console.log("[Warmly] failed to load contacts", e);
    return SEED_CONTACTS;
  }
}

export const [ContactsProvider, useContacts] = createContextHook(() => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [hydrated, setHydrated] = useState<boolean>(false);

  const query = useQuery<Contact[]>({
    queryKey: ["contacts"],
    queryFn: loadContacts,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (query.data && !hydrated) {
      setContacts(query.data);
      setHydrated(true);
    }
  }, [query.data, hydrated]);

  const persist = useCallback(async (next: Contact[]) => {
    setContacts(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
      console.log("[Warmly] failed to persist contacts", e);
    }
  }, []);

  const addContact = useCallback(
    (input: Partial<Contact> & { name: string }) => {
      const now = new Date().toISOString();
      const newContact: Contact = {
        id: `c_${Date.now()}`,
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
            id: `i_${Date.now()}`,
            type: "note",
            title: "Added to Warmly",
            date: now,
          },
        ],
      };
      void persist([newContact, ...contacts]);
      return newContact;
    },
    [contacts, persist]
  );

  const updateContact = useCallback(
    (id: string, patch: Partial<Contact>) => {
      const next = contacts.map((c) => (c.id === id ? { ...c, ...patch } : c));
      void persist(next);
    },
    [contacts, persist]
  );

  const deleteContact = useCallback(
    (id: string) => {
      void persist(contacts.filter((c) => c.id !== id));
    },
    [contacts, persist]
  );

  const addInteraction = useCallback(
    (id: string, interaction: Omit<Interaction, "id">) => {
      const next = contacts.map((c) => {
        if (c.id !== id) return c;
        const full: Interaction = {
          id: `i_${Date.now()}`,
          ...interaction,
        };
        return {
          ...c,
          lastInteraction: interaction.date,
          interactions: [full, ...c.interactions],
        };
      });
      void persist(next);
    },
    [contacts, persist]
  );

  const addNote = useCallback(
    (id: string, note: string) => {
      const next = contacts.map((c) =>
        c.id === id ? { ...c, notes: [note, ...c.notes] } : c
      );
      void persist(next);
    },
    [contacts, persist]
  );

  const stats = useMemo(() => {
    const total = contacts.length;
    const strong = contacts.filter((c) => c.warmth === "strong").length;
    const cooling = contacts.filter(
      (c) => c.warmth === "cooling" || c.warmth === "cold"
    ).length;
    const avgScore =
      total === 0
        ? 0
        : Math.round(
            contacts.reduce((s, c) => s + c.strengthScore, 0) / total
          );
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
    const result: { contact: Contact; date: Date; daysUntil: number }[] = [];
    for (const c of contacts) {
      if (!c.birthday) continue;
      const b = new Date(c.birthday);
      const next = new Date(now.getFullYear(), b.getMonth(), b.getDate());
      if (next < now) next.setFullYear(now.getFullYear() + 1);
      const diffDays = Math.ceil(
        (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays <= daysAhead) {
        result.push({ contact: c, date: next, daysUntil: diffDays });
      }
    }
    return result.sort((a, b) => a.daysUntil - b.daysUntil);
  }, [contacts, daysAhead]);
}
