import React from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Contacts from "expo-contacts";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Haptics from "expo-haptics";
import * as Sharing from "expo-sharing";
import {
  Bell,
  ChevronRight,
  Cloud,
  Crown,
  Download,
  FileText,
  HeartHandshake,
  Linkedin,
  LogOut,
  Mail,
  Phone,
  Shield,
  Sparkles,
  Upload,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/providers/AuthProvider";
import { useContacts } from "@/providers/ContactsProvider";
import { usePurchases } from "@/providers/PurchasesProvider";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { contacts, stats } = useContacts();
  const { isPro, customerInfo } = usePurchases();
  const [pushOn, setPushOn] = React.useState<boolean>(true);
  const [smartOn, setSmartOn] = React.useState<boolean>(true);

  const handleImportContacts = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Not available", "Import phone contacts is only available on mobile.");
      return;
    }

    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Allow Social Capital to access your contacts in Settings to import them."
      );
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.Name, Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
    });

    if (data.length === 0) {
      Alert.alert("No contacts", "Your phone address book appears to be empty.");
      return;
    }

    Alert.alert(
      "Contacts found",
      `Found ${data.length} contacts in your phone. Import them into Social Capital? (This will create basic profiles you can enrich later.)`,
      [
        { text: "Not now", style: "cancel" },
        {
          text: "Import all",
          onPress: () => Alert.alert(
            "Coming soon",
            `Full phone contact import will be available in the next update. Found ${data.length} contacts ready to import.`
          ),
        },
      ]
    );
  };

  const handleUploadCSV = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Not available", "CSV upload is only available on mobile.");
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["text/csv", "text/comma-separated-values", "application/vnd.ms-excel"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      Alert.alert(
        "CSV detected",
        `"${result.assets[0].name}" is ready. Full CSV import with field mapping will be available in the next update.`
      );
    } catch {
      Alert.alert("Error", "Could not pick the file. Please try again.");
    }
  };

  const handleBackup = () => {
    Alert.alert(
      "iCloud backup",
      "Your contacts sync automatically to your account. For an additional iCloud backup, you can enable it in your device Settings > iCloud > Social Capital.",
      [
        { text: "OK" },
        {
          text: "Open Settings",
          onPress: () => Linking.openURL("app-settings:").catch(() => {}),
        },
      ]
    );
  };

  const handleExport = async () => {
    if (Platform.OS === "web") {
      Alert.alert("Not available", "Export is only available on mobile.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});

    const header = "name,company,title,email,phone,linkedin,category,warmth,notes,lastInteraction\n";
    const rows = contacts
      .map(
        (c) =>
          `"${c.name}","${c.company ?? ""}","${c.title ?? ""}","${c.email ?? ""}","${c.phone ?? ""}","${c.linkedin ?? ""}","${c.category}","${c.warmth}","${c.notes.join("; ")}","${c.lastInteraction}"`
      )
      .join("\n");

    const csv = header + rows;
    const fileUri = `${FileSystem.cacheDirectory}socialcapital_contacts_export.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "text/csv",
        dialogTitle: "Export Social Capital contacts",
      });
    } else {
      Alert.alert("Export ready", `CSV saved to ${fileUri}.`);
    }
  };

  const handleTerms = () => {
    router.push("/terms");
  };

  const handlePrivacy = () => {
    router.push("/privacy");
  };

  const handleSupport = () => {
    Linking.openURL("mailto:hello@warmly.app").catch(() => {
      Alert.alert("Support", "Email us at hello@warmly.app");
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 120 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View>
        <Text style={styles.eyebrow}>Your account</Text>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* Profile card */}
      <View style={styles.profile}>
        <Avatar
          name={user?.name ?? "You"}
          photo={user?.picture}
          size={64}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{user?.name ?? "Alex Morgan"}</Text>
          <Text style={styles.profileMeta}>
            {user?.email ?? "alex@warmly.app"}
          </Text>
          <View style={styles.profileStats}>
            <View style={styles.pill}>
              <HeartHandshake size={12} color={Colors.goldDeep} strokeWidth={2.6} />
              <Text style={styles.pillText}>{stats.total} contacts</Text>
            </View>
            <View style={styles.pill}>
              <Sparkles size={12} color={Colors.goldDeep} strokeWidth={2.6} />
              <Text style={styles.pillText}>avg {stats.avgScore}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Pro card */}
      {isPro ? (
        <LinearGradient
          colors={["#E8C988", "#C8A05A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.pro}
        >
          <View style={styles.proIconPro}>
            <Crown size={20} color="#FFFFFF" strokeWidth={2.6} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.proTitlePro}>Social Capital Pro</Text>
            <Text style={styles.proBodyPro}>
              You're on the Pro plan. All features unlocked.
            </Text>
          </View>
          <Pressable
            style={styles.proCtaManage}
            onPress={() => router.push("/subscription")}
          >
            <Text style={styles.proCtaManageText}>Manage</Text>
          </Pressable>
          <View style={styles.proOrbPro} />
        </LinearGradient>
      ) : (
        <LinearGradient
          colors={["#8B7CC8", "#5E51A1"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.pro}
        >
          <View style={styles.proIcon}>
            <Crown size={20} color="#FFFFFF" strokeWidth={2.6} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.proTitle}>Social Capital Pro</Text>
            <Text style={styles.proBody}>
              Unlimited AI drafts, voice notes & calendar sync.
            </Text>
          </View>
          <Pressable
            style={styles.proCta}
            onPress={() => router.push("/paywall")}
          >
            <Text style={styles.proCtaText}>Upgrade</Text>
          </Pressable>
          <View style={styles.proOrb} />
        </LinearGradient>
      )}

      {/* Import */}
      <Section title="Grow your network">
        <Row
          icon={<Phone size={18} color={Colors.text} strokeWidth={2.4} />}
          label="Import phone contacts"
          onPress={handleImportContacts}
        />
        <Row
          icon={<Upload size={18} color={Colors.text} strokeWidth={2.4} />}
          label="Upload CSV"
          onPress={handleUploadCSV}
        />
        <Row
          icon={<Linkedin size={18} color={Colors.text} strokeWidth={2.4} />}
          label="Connect LinkedIn"
          onPress={() => router.push("/linkedin-connect")}
        />
      </Section>

      {/* Notifications */}
      <Section title="Reminders">
        <ToggleRow
          icon={<Bell size={18} color={Colors.text} strokeWidth={2.4} />}
          label="Push notifications"
          value={pushOn}
          onValueChange={setPushOn}
        />
        <ToggleRow
          icon={<Sparkles size={18} color={Colors.text} strokeWidth={2.4} />}
          label="AI-suggested reminders"
          value={smartOn}
          onValueChange={setSmartOn}
        />
      </Section>

      {/* Privacy */}
      <Section title="Privacy & data">
        {isPro ? (
          <Row
            icon={<Crown size={18} color={Colors.gold} strokeWidth={2.4} />}
            label="Manage subscription"
            onPress={() => router.push("/subscription")}
          />
        ) : null}
        <Row
          icon={<Cloud size={18} color={Colors.text} strokeWidth={2.4} />}
          label="iCloud backup"
          onPress={handleBackup}
        />
        <Row
          icon={<Download size={18} color={Colors.text} strokeWidth={2.4} />}
          label="Export my data"
          onPress={handleExport}
        />
        <Row
          icon={<FileText size={18} color={Colors.text} strokeWidth={2.4} />}
          label="Terms of Service"
          onPress={handleTerms}
        />
        <Row
          icon={<Shield size={18} color={Colors.text} strokeWidth={2.4} />}
          label="Privacy policy"
          onPress={handlePrivacy}
        />
        <Row
          icon={<Mail size={18} color={Colors.text} strokeWidth={2.4} />}
          label="Support"
          accessory="hello@warmly.app"
          onPress={handleSupport}
        />
      </Section>

      <Pressable
        style={styles.signOut}
        onPress={() => {
          signOut();
          router.replace("/login");
        }}
      >
        <LogOut size={16} color={Colors.danger} strokeWidth={2.4} />
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>

      <Text style={styles.version}>Social Capital · v1.0.0</Text>
    </ScrollView>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ gap: 10 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  accessory,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  accessory?: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && { opacity: 0.7, backgroundColor: Colors.backgroundAlt },
      ]}
      onPress={() => {
        if (Platform.OS !== "web") {
          Haptics.selectionAsync().catch(() => {});
        }
        onPress?.();
      }}
    >
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={{ flex: 1 }} />
      {accessory ? <Text style={styles.rowAcc}>{accessory}</Text> : null}
      <ChevronRight size={16} color={Colors.textMuted} />
    </Pressable>
  );
}

function ToggleRow({
  icon,
  label,
  value,
  onValueChange,
}: {
  icon: React.ReactNode;
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowIcon}>{icon}</View>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={{ flex: 1 }} />
      <Switch
        value={value}
        onValueChange={(v) => {
          if (Platform.OS !== "web") {
            Haptics.selectionAsync().catch(() => {});
          }
          onValueChange(v);
        }}
        trackColor={{ false: Colors.border, true: Colors.gold }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingHorizontal: 20, gap: 22 },
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
  profile: {
    backgroundColor: Colors.card,
    padding: 18,
    borderRadius: 22,
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  profileName: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  profileMeta: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  profileStats: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.goldSoft,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "700",
    color: Colors.goldDeep,
  },
  pro: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  proIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  proTitle: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: -0.2,
  },
  proBody: {
    color: "rgba(255,255,255,0.84)",
    fontSize: 12,
    marginTop: 2,
  },
  proCta: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  proCtaText: {
    color: "#5E51A1",
    fontWeight: "800",
    fontSize: 13,
  },
  proOrb: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFFFFF",
    opacity: 0.12,
    right: -50,
    top: -50,
  },
  // Pro (active) variant styles
  proIconPro: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  proTitlePro: {
    color: "#0F1B2D",
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: -0.2,
  },
  proBodyPro: {
    color: "rgba(15,27,45,0.7)",
    fontSize: 12,
    marginTop: 2,
  },
  proCtaManage: {
    backgroundColor: "#0F1B2D",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  proCtaManageText: {
    color: Colors.gold,
    fontWeight: "800",
    fontSize: 13,
  },
  proOrbPro: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#FFFFFF",
    opacity: 0.18,
    right: -50,
    top: -50,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textSecondary,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: Colors.shadow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
  },
  rowAcc: {
    fontSize: 12,
    color: Colors.textMuted,
    marginRight: 6,
  },
  signOut: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 14,
    backgroundColor: Colors.card,
    borderRadius: 14,
  },
  signOutText: {
    color: Colors.danger,
    fontWeight: "700",
    fontSize: 14,
  },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: -4,
  },
});
