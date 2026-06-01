import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import {
  ArrowRight,
  Heart,
  Sparkles,
  Users,
  Bell,
} from "lucide-react-native";
import { useAuth } from "@/providers/AuthProvider";
import { Colors } from "@/constants/colors";

const { width } = Dimensions.get("window");

interface Slide {
  key: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  gradient: readonly [string, string];
}

const SLIDES: Slide[] = [
  {
    key: "welcome",
    title: "Never let an important\nrelationship go cold.",
    body:
      "Warmly is your AI relationship assistant — for the founders, investors and friends you'd hate to lose touch with.",
    icon: <Heart size={42} color="#FFFFFF" strokeWidth={2.4} />,
    gradient: ["#1A2740", "#0F1B2D"],
  },
  {
    key: "people",
    title: "Your network,\nbeautifully organized.",
    body:
      "One place for every contact. Tag them, score the relationship, and remember the details that matter.",
    icon: <Users size={42} color="#FFFFFF" strokeWidth={2.4} />,
    gradient: ["#C8A05A", "#A4823F"],
  },
  {
    key: "ai",
    title: "AI that writes the\nmessage for you.",
    body:
      "Personalized reconnects, intros and follow-ups — written in your voice, grounded in your notes.",
    icon: <Sparkles size={42} color="#FFFFFF" strokeWidth={2.4} />,
    gradient: ["#8B7CC8", "#5E51A1"],
  },
  {
    key: "reminders",
    title: "Be the friend who\nremembers.",
    body:
      "Smart reminders surface the right people at the right time. Birthdays, funding, follow-ups — handled.",
    icon: <Bell size={42} color="#FFFFFF" strokeWidth={2.4} />,
    gradient: ["#E0876A", "#B05A3F"],
  },
];

export default function Onboarding() {
  const [index, setIndex] = useState<number>(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const listRef = useRef<FlatList<Slide>>(null);
  const { completeOnboarding } = useAuth();

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    setIndex(i);
  };

  const next = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      completeOnboarding();
      router.replace("/login");
    }
  };

  const skip = () => {
    completeOnboarding();
    router.replace("/login");
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>Warmly</Text>
        <Pressable onPress={skip} hitSlop={10}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <Animated.FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(item) => item.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        onMomentumScrollEnd={onMomentumEnd}
        renderItem={({ item }) => <SlideView slide={item} />}
      />

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => {
            const inputRange = [
              (i - 1) * width,
              i * width,
              (i + 1) * width,
            ];
            const w = scrollX.interpolate({
              inputRange,
              outputRange: [8, 24, 8],
              extrapolate: "clamp",
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={[styles.dot, { width: w, opacity }]}
              />
            );
          })}
        </View>

        <Pressable
          onPress={next}
          style={({ pressed }) => [
            styles.cta,
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
        >
          <LinearGradient
            colors={["#1A2740", "#0F1B2D"]}
            style={styles.ctaInner}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.ctaText}>
              {index === SLIDES.length - 1 ? "Get started" : "Continue"}
            </Text>
            <ArrowRight size={18} color="#FFFFFF" strokeWidth={2.6} />
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function SlideView({ slide }: { slide: Slide }) {
  return (
    <View style={[styles.slide, { width }]}>
      <View style={styles.illustrationWrap}>
        <View style={styles.glow} />
        <LinearGradient
          colors={slide.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconBubble}
        >
          {slide.icon}
        </LinearGradient>
        <View style={[styles.orb, styles.orbA]} />
        <View style={[styles.orb, styles.orbB]} />
        <View style={[styles.orb, styles.orbC]} />
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.body}>{slide.body}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
  },
  topBar: {
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    fontSize: 18,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  skip: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  slide: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
  },
  illustrationWrap: {
    height: 320,
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: Colors.goldSoft,
    opacity: 0.35,
  },
  iconBubble: {
    width: 120,
    height: 120,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F1B2D",
    shadowOpacity: 0.25,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    transform: [{ rotate: "-6deg" }],
  },
  orb: {
    position: "absolute",
    borderRadius: 999,
    backgroundColor: Colors.card,
  },
  orbA: {
    width: 28,
    height: 28,
    top: 60,
    right: 30,
    backgroundColor: Colors.purpleSoft,
  },
  orbB: {
    width: 18,
    height: 18,
    bottom: 80,
    left: 20,
    backgroundColor: Colors.goldSoft,
  },
  orbC: {
    width: 12,
    height: 12,
    top: 110,
    left: 50,
    backgroundColor: Colors.gold,
  },
  copy: {
    marginTop: 24,
    gap: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  body: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    gap: 24,
  },
  dots: {
    flexDirection: "row",
    gap: 6,
    alignSelf: "center",
  },
  dot: {
    height: 8,
    borderRadius: 999,
    backgroundColor: Colors.text,
  },
  cta: {
    borderRadius: 18,
    overflow: "hidden",
  },
  ctaInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 10,
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
});
