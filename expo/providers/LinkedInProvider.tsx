import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useMemo, useState } from "react";
import { useContacts } from "@/providers/ContactsProvider";
import type { SocialUpdate, SocialUpdateType } from "@/constants/mockData";

export interface LinkedInConnection {
  profileUrl: string;
  connectedAt: string;
  headline?: string;
  autoSync: boolean;
}

function generateRecentUpdate(contactName: string): SocialUpdate {
  const first = contactName.split(" ")[0];
  const types: SocialUpdateType[] = [
    "linkedin_post",
    "job_change",
    "funding_news",
    "press_mention",
    "life_moment",
  ];
  const type = types[Math.floor(Math.random() * types.length)];

  const templates: Record<SocialUpdateType, { title: string; detail: string }> = {
    linkedin_post: {
      title: `${first} shared insights on industry trends`,
      detail: `Posted about emerging opportunities in the space — worth engaging with.`,
    },
    job_change: {
      title: `${first} started a new role`,
      detail: `Updated position on LinkedIn — great time to reach out with congratulations.`,
    },
    funding_news: {
      title: `${first}'s company in the news`,
      detail: `Recent coverage highlights growth and momentum — good conversation starter.`,
    },
    press_mention: {
      title: `${first} featured in industry press`,
      detail: `Recognized for recent work — perfect reason to reconnect.`,
    },
    life_moment: {
      title: `${first} celebrating a milestone`,
      detail: `Shared a recent accomplishment on LinkedIn — a warm note would land well.`,
    },
  };

  return {
    id: `linkedin_${Date.now()}`,
    type,
    title: templates[type].title,
    detail: templates[type].detail,
    date: new Date().toISOString(),
  };
}

export const [LinkedInProvider, useLinkedIn] = createContextHook(() => {
  const { contacts, updateContact } = useContacts();
  const [connections, setConnections] = useState<Record<string, LinkedInConnection>>({});
  const [syncingIds, setSyncingIds] = useState<Set<string>>(new Set());

  const isConnected = useCallback(
    (contactId: string): boolean => {
      return !!connections[contactId]?.autoSync;
    },
    [connections]
  );

  const connect = useCallback(
    async (contactId: string, profileUrl: string) => {
      const conn: LinkedInConnection = {
        profileUrl,
        connectedAt: new Date().toISOString(),
        autoSync: true,
      };

      setConnections((prev) => ({ ...prev, [contactId]: conn }));

      // Mark contact as LinkedIn-connected and generate a first update
      const contact = contacts.find((c) => c.id === contactId);
      const freshUpdate = generateRecentUpdate(contact?.name ?? "Contact");

      await updateContact(contactId, {
        linkedin: profileUrl.replace("https://linkedin.com/in/", "linkedin.com/in/"),
        linkedinConnected: true,
        socialUpdates: [
          freshUpdate,
          ...(contact?.socialUpdates ?? []),
        ],
      });
    },
    [contacts, updateContact]
  );

  const disconnect = useCallback(
    async (contactId: string) => {
      setConnections((prev) => {
        const next = { ...prev };
        delete next[contactId];
        return next;
      });

      await updateContact(contactId, {
        linkedinConnected: false,
      });
    },
    [updateContact]
  );

  const syncUpdates = useCallback(
    async (contactId: string) => {
      if (syncingIds.has(contactId)) return;
      setSyncingIds((prev) => new Set(prev).add(contactId));

      const contact = contacts.find((c) => c.id === contactId);
      if (!contact) {
        setSyncingIds((prev) => {
          const next = new Set(prev);
          next.delete(contactId);
          return next;
        });
        return;
      }

      const freshUpdate = generateRecentUpdate(contact.name);

      await updateContact(contactId, {
        socialUpdates: [freshUpdate, ...contact.socialUpdates],
      });

      setSyncingIds((prev) => {
        const next = new Set(prev);
        next.delete(contactId);
        return next;
      });
    },
    [contacts, updateContact, syncingIds]
  );

  const syncAll = useCallback(async () => {
    for (const [id, conn] of Object.entries(connections)) {
      if (conn.autoSync) {
        await syncUpdates(id);
      }
    }
  }, [connections, syncUpdates]);

  const connectedCount = useMemo(
    () => Object.keys(connections).length,
    [connections]
  );

  return {
    connections,
    isConnected,
    connect,
    disconnect,
    syncUpdates,
    syncAll,
    connectedCount,
    isSyncing: syncingIds.size > 0,
  };
});
