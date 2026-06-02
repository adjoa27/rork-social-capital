import * as Contacts from "expo-contacts";
import type { Contact } from "@/constants/mockData";
import type { RelationshipCategory, WarmthLevel } from "@/constants/mockData";

export interface ImportResult {
  imported: number;
  skipped: number;
  permissionDenied: boolean;
}

/**
 * Bulk-import phone contacts into the app's contact list.
 * Requests permission, reads all device contacts, and maps them
 * into the app Contact model, deduplicating by name.
 */
export async function importPhoneContacts(
  existingNames: Set<string>,
  addContact: (input: Partial<Contact> & { name: string }) => Contact,
): Promise<ImportResult> {
  const { status } = await Contacts.requestPermissionsAsync();
  if (status !== "granted") {
    return { imported: 0, skipped: 0, permissionDenied: true };
  }

  const { data } = await Contacts.getContactsAsync({
    fields: [
      Contacts.Fields.Name,
      Contacts.Fields.PhoneNumbers,
      Contacts.Fields.Emails,
      Contacts.Fields.Company,
      Contacts.Fields.JobTitle,
    ],
  });

  if (!data || data.length === 0) {
    return { imported: 0, skipped: 0, permissionDenied: false };
  }

  const now = new Date().toISOString();
  let imported = 0;
  let skipped = 0;

  for (const deviceContact of data) {
    const name = deviceContact.name?.trim();
    if (!name) {
      skipped++;
      continue;
    }

    const normalized = name.toLowerCase();
    if (existingNames.has(normalized)) {
      skipped++;
      continue;
    }

    const phone =
      deviceContact.phoneNumbers?.[0]?.number?.trim() || undefined;
    const email = deviceContact.emails?.[0]?.email?.trim() || undefined;
    const company = deviceContact.company?.trim() || undefined;
    const title = deviceContact.jobTitle?.trim() || undefined;

    const category: RelationshipCategory = company ? "Associate" : "Friend";
    const warmth: WarmthLevel = "warm";

    addContact({
      name,
      phone,
      email,
      company,
      title,
      category,
      warmth,
      strengthScore: 60,
      notes: phone
        ? [`Phone: ${phone}`]
        : email
          ? [`Email: ${email}`]
          : [],
      lastInteraction: now,
      tags: company ? [company] : [],
    });

    imported++;
  }

  return { imported, skipped, permissionDenied: false };
}
