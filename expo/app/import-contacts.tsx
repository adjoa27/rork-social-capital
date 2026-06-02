import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, Stack } from "expo-router";
import * as Contacts from "expo-contacts";
import * as Haptics from "expo-haptics";
import { ArrowLeft, Check, Phone, Users } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { useContacts } from "@/providers/ContactsProvider";

type PhoneContact = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  company?: string;
  title?: string;
  selected: boolean;
};

export default function ImportContactsScreen() {
  const insets = useSafeAreaInsets();
  const { addContact } = useContacts();

  const [step, setStep] = useState<"perm" | "loading" | "picker" | "importing" | "done">("perm");
  const [phoneContacts, setPhoneContacts] = useState<PhoneContact[]>([]);
  const [importedCount, setImportedCount] = useState<number>(0);

  const requestPermission = useCallback(async () => {
    if (Platform.OS === "web") {
      Alert.alert(
        "Not available",
        "Contact import is only available on iOS and Android devices.",
      );
      return;
    }

    setStep("loading");

    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission denied",
        "Social Capital needs access to your contacts to import them. You can enable this in Settings.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Try again", onPress: requestPermission },
        ],
      );
      setStep("perm");
      return;
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

    const mapped: PhoneContact[] = data
      .filter((c) => c.name && c.name.trim().length > 0)
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""))
      .map((c) => ({
        id: c.id ?? `c_${Math.random()}`,
        name: c.name ?? "Unknown",
        phone:
          c.phoneNumbers?.[0]?.number?.replace(/\s+/g, "") ?? undefined,
        email: c.emails?.[0]?.email ?? undefined,
        company: c.company ?? undefined,
        title: c.jobTitle ?? undefined,
        selected: false,
      }));

    setPhoneContacts(mapped);
    setStep("picker");
  }, []);

  const selectedCount = useMemo(
    () => phoneContacts.filter((c) => c.selected).length,
    [phoneContacts],
  );

  const toggleContact = useCallback((id: string) => {
    setPhoneContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, selected: !c.selected } : c)),
    );
  }, []);

  const selectAll = useCallback(() => {
    setPhoneContacts((prev) => prev.map((c) => ({ ...c, selected: true })));
  }, []);

  const deselectAll = useCallback(() => {
    setPhoneContacts((prev) => prev.map((c) => ({ ...c, selected: false })));
  }, []);

  const importSelected = useCallback(async () => {
    const selected = phoneContacts.filter((c) => c.selected);
    if (selected.length === 0) return;

    setStep("importing");

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
        () => {},
      );
    }

    for (const c of selected) {
      addContact({
        name: c.name,
        phone: c.phone,
        email: c.email,
        company: c.company,
        title: c.title,
        tags: [],
        notes: [],
        category: "Associate",
        warmth: "warm",
        strengthScore: 50,
        metAt: "Imported from phone contacts",
      });
    }

    setImportedCount(selected.length);
    setStep("done");
  }, [phoneContacts, addContact]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={10}
        >
          <ArrowLeft size={20} color={Colors.text} strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.title}>Import contacts</Text>
        <View style={{ width: 40 }} />
      </View>

      {step === "perm" && (
        <PermissionIntro
          insets={insets}
          onAllow={requestPermission}
        />
      )}

      {step === "loading" && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.goldDeep} />
          <Text style={styles.loadingText}>Accessing contacts…</Text>
        </View>
      )}

      {step === "picker" && (
        <PickerView
          contacts={phoneContacts}
          selectedCount={selectedCount}
          onToggle={toggleContact}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
          onImport={importSelected}
          insets={insets}
        />
      )}

      {step === "importing" && (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.goldDeep} />
          <Text style={styles.loadingText}>Importing contacts…</Text>
        </View>
      )}

      {step === "done" && (
        <DoneView count={importedCount} insets={insets} />
      )}
    </View>
  );
}

function PermissionIntro({
  insets,
  onAllow,
}: {
  insets: { bottom: number };
  onAllow: () => void;
}) {
  return (
    <View style={[styles.permContainer, { paddingBottom: insets.bottom + 40 }]}>
      <View style={styles.permIllustration}>
        <View style={styles.permOrb}>
          <Users size={40} color={Colors.goldDeep} strokeWidth={2} />
        </View>
        <View style={[styles.permOrbSmall, styles.permOrb2]}>
          <Phone size={20} color={Colors.goldDeep} strokeWidth={2} />
        </View>
        <View style={[styles.permOrbSmall, styles.permOrb3]}>
          <Check size={20} color={Colors.goldDeep} strokeWidth={2.6} />
        </View>
      </View>

      <Text style={styles.permTitle}>Import your contacts</Text>
      <Text style={styles.permBody}>
        Social Capital works best when your network is here. Give access to your
        phone contacts so you can pick who to add — you'll stay in control of
        which contacts are imported.
      </Text>

      <View style={styles.permBullets}>
        <Bullet text="You choose which contacts to import" />
        <Bullet text="Data stays private — nothing is shared" />
        <Bullet text="Contacts are stored securely in your account" />
      </View>

      <Pressable style={styles.permBtn} onPress={onAllow}>
        <Text style={styles.permBtnText}>Allow contact access</Text>
      </Pressable>

      <Pressable
        style={styles.permSkip}
        onPress={() => router.back()}
      >
        <Text style={styles.permSkipText}>Not now</Text>
      </Pressable>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bullet}>
      <Check size={14} color={Colors.goldDeep} strokeWidth={2.6} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

function PickerView({
  contacts,
  selectedCount,
  onToggle,
  onSelectAll,
  onDeselectAll,
  onImport,
  insets,
}: {
  contacts: PhoneContact[];
  selectedCount: number;
  onToggle: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onImport: () => void;
  insets: { bottom: number };
}) {
  return (
    <View style={{ flex: 1 }}>
      {/* Toolbar */}
      <View style={styles.toolbar}>
        <Text style={styles.toolbarCount}>
          {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
        </Text>
        <Pressable
          onPress={selectedCount === contacts.length ? onDeselectAll : onSelectAll}
        >
          <Text style={styles.toolbarAction}>
            {selectedCount === contacts.length ? "Deselect all" : "Select all"}
          </Text>
        </Pressable>
      </View>

      <FlatList
        data={contacts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 100,
        }}
        renderItem={({ item }) => (
          <Pressable
            style={styles.contactRow}
            onPress={() => onToggle(item.id)}
          >
            <View
              style={[
                styles.checkbox,
                item.selected && styles.checkboxActive,
              ]}
            >
              {item.selected && (
                <Check size={14} color="#FFFFFF" strokeWidth={3} />
              )}
            </View>
            <View style={styles.contactAvatar}>
              <Text style={styles.contactInitials}>
                {item.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName} numberOfLines={1}>
                {item.name}
              </Text>
              {(item.company || item.title) && (
                <Text style={styles.contactDetail} numberOfLines={1}>
                  {[item.title, item.company].filter(Boolean).join(" · ")}
                </Text>
              )}
              {item.phone && (
                <Text style={styles.contactDetail} numberOfLines={1}>
                  {item.phone}
                </Text>
              )}
            </View>
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
      />

      {selectedCount > 0 && (
        <View
          style={[styles.importBar, { paddingBottom: insets.bottom + 12 }]}
        >
          <Pressable style={styles.importBtn} onPress={onImport}>
            <Text style={styles.importBtnText}>
              Import {selectedCount} contact{selectedCount !== 1 ? "s" : ""}
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function DoneView({
  count,
  insets,
}: {
  count: number;
  insets: { bottom: number };
}) {
  return (
    <View style={[styles.doneContainer, { paddingBottom: insets.bottom + 40 }]}>
      <View style={styles.doneOrb}>
        <Check size={48} color={Colors.goldDeep} strokeWidth={2.6} />
      </View>
      <Text style={styles.doneTitle}>All set!</Text>
      <Text style={styles.doneBody}>
        {count} contact{count !== 1 ? "s" : ""} added to your network. You can
        find them in the People tab.
      </Text>
      <Pressable
        style={styles.doneBtn}
        onPress={() => router.back()}
      >
        <Text style={styles.doneBtnText}>Back to profile</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },

  // Permission intro
  permContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  permIllustration: {
    width: 160,
    height: 160,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  permOrb: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.goldSoft,
    alignItems: "center",
    justifyContent: "center",
  },
  permOrbSmall: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.card,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  permOrb2: {
    top: -8,
    right: 0,
  },
  permOrb3: {
    bottom: -4,
    left: 4,
  },
  permTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
    textAlign: "center",
  },
  permBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
  permBullets: {
    alignSelf: "stretch",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  bullet: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bulletText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "500",
  },
  permBtn: {
    backgroundColor: Colors.text,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 4,
    width: "100%",
    alignItems: "center",
  },
  permBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  permSkip: {
    paddingVertical: 10,
  },
  permSkipText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },

  // Picker
  toolbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  toolbarCount: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  toolbarAction: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.goldDeep,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
  },
  checkboxActive: {
    backgroundColor: Colors.goldDeep,
    borderColor: Colors.goldDeep,
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  contactInitials: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
  },
  contactInfo: {
    flex: 1,
    gap: 2,
  },
  contactName: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.text,
  },
  contactDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  importBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  importBtn: {
    backgroundColor: Colors.text,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  importBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },

  // Done
  doneContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 12,
  },
  doneOrb: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.goldSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  doneTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
  },
  doneBody: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 8,
  },
  doneBtn: {
    backgroundColor: Colors.text,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
});
