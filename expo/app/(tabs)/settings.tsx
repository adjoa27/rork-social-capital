import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  ChevronRight,
  Cloud,
  Crown,
  Download,
  HeartHandshake,
  Linkedin,
  LogOut,
  Mail,
  Phone,
  Shield,
  Sparkles,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/Avatar";
import { Colors } from "@/constants/colors";
import { useAuth } from "@/hooks/useAuth";
import { useContacts } from "@/providers/ContactsProvider";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();
  const { stats } = useContacts();
  const [pushOn, setPushOn] = React.useState<boolean>(true);
  const [smartOn, setSmartOn] = React.useState<boolean>(true);

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
          photo={user?.photo}
          size={64}
        />
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{user?.name ?? "Alex Morgan"}</Text>
          <Text style={styles.profileMeta}>
            {user?.email ?? "alex@socialcapital.app"} · via {user?.provider}
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

      {/* Import */}
      <Section title="Grow your network">
        <Row
          icon={<Phone size={18} color={Colors.text} strokeWidth={2.4} />}
          label="Import phone contacts"
          onPress={() => router.push("/import-contacts")}
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
        <Row
          icon={<Cloud size={18} color={Colors.text} strokeWidth={2.4} />}
          label="iCloud backup"
        />
        <Row
          icon={<Download size={18} color={Colors.text} strokeWidth={2.4} />}
          label="Export my data"
        />
        <Row
          icon={<Shield size={18} color={Colors.text} strokeWidth={2.4} />}
          label="Privacy policy"
          onPress={() => router.push("/privacy-policy")}
        />
        <Row
          icon={<Mail size={18} color={Colors.text} strokeWidth={2.4} />}
          label="Support"
          accessory="hello@socialcapital.app"
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
    <Pressable style={styles.row} onPress={onPress}>
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
        onValueChange={onValueChange}
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
