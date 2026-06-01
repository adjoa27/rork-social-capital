/**
 * Warmly design system colors.
 * Cream backgrounds, deep navy text, warm gold + soft purple accents.
 */

export const Colors = {
  // Surfaces
  background: "#FAF6EF",
  backgroundAlt: "#F3ECE0",
  card: "#FFFFFF",
  cardAlt: "#FBF7F0",
  overlay: "rgba(15, 27, 45, 0.45)",

  // Text
  text: "#0F1B2D",
  textSecondary: "#5C6473",
  textMuted: "#94A0B0",
  textInverse: "#FFFFFF",

  // Accents
  gold: "#C8A05A",
  goldSoft: "#E8D4A8",
  goldDeep: "#A4823F",
  purple: "#8B7CC8",
  purpleSoft: "#D6CEEC",

  // Warmth scale
  strong: "#10B981",
  warm: "#D4A85A",
  cooling: "#F2994A",
  cold: "#94A3B8",

  // Utility
  border: "#EDE5D6",
  borderStrong: "#D9CFB8",
  danger: "#E5484D",
  success: "#10B981",
  shadow: "rgba(15, 27, 45, 0.08)",
} as const;

export const Gradients = {
  cream: ["#FBF7F0", "#F3E9D5"] as const,
  gold: ["#E8C988", "#C8A05A"] as const,
  purple: ["#B9ADE0", "#8B7CC8"] as const,
  warmth: ["#FCE9C7", "#F2BB7A"] as const,
  hero: ["#0F1B2D", "#1E2D45"] as const,
  card: ["#FFFFFF", "#FBF6EC"] as const,
};

export const Radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Typography = {
  display: { fontSize: 34, fontWeight: "700" as const, letterSpacing: -0.8 },
  title: { fontSize: 26, fontWeight: "700" as const, letterSpacing: -0.5 },
  h2: { fontSize: 20, fontWeight: "700" as const, letterSpacing: -0.3 },
  h3: { fontSize: 17, fontWeight: "600" as const, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: "400" as const },
  caption: { fontSize: 13, fontWeight: "500" as const },
  small: { fontSize: 11, fontWeight: "600" as const, letterSpacing: 0.4 },
};

export default Colors;
