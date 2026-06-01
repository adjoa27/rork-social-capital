/**
 * Seed data for Social Capital. Used to populate the app with realistic relationships
 * so the experience feels alive on first launch.
 */

export type WarmthLevel = "strong" | "warm" | "cooling" | "cold";

export type RelationshipCategory =
  | "Founder"
  | "Investor"
  | "Mentor"
  | "Client"
  | "Friend"
  | "Recruiter"
  | "Press"
  | "Associate";

export type InteractionType =
  | "meeting"
  | "message"
  | "call"
  | "email"
  | "note"
  | "milestone"
  | "event";

export interface Interaction {
  id: string;
  type: InteractionType;
  title: string;
  detail?: string;
  date: string; // ISO
}

export type SocialUpdateType =
  | "linkedin_post"
  | "job_change"
  | "funding_news"
  | "press_mention"
  | "life_moment";

export interface SocialUpdate {
  id: string;
  type: SocialUpdateType;
  title: string;
  detail?: string;
  date: string; // ISO
  link?: string;
}

export interface Contact {
  id: string;
  name: string;
  photo?: string;
  company?: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedin?: string;
  tags: string[];
  category: RelationshipCategory;
  warmth: WarmthLevel;
  strengthScore: number; // 0-100
  notes: string[];
  metAt?: string;
  lastInteraction: string; // ISO
  birthday?: string; // ISO (year ignored)
  reminderCadenceDays?: number;
  interactions: Interaction[];
  socialUpdates: SocialUpdate[];
  linkedinConnected?: boolean;
}

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
};

const daysAhead = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
};

export const SEED_CONTACTS: Contact[] = [
  {
    id: "c1",
    name: "Sarah Chen",
    photo:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80&auto=format&fit=crop",
    company: "Sequoia Capital",
    title: "Partner",
    email: "sarah@sequoiacap.com",
    linkedin: "linkedin.com/in/sarahchen",
    tags: ["AI", "Seed", "B2B SaaS"],
    category: "Investor",
    warmth: "cooling",
    strengthScore: 58,
    notes: [
      "Met at Techstars Demo Day 2024",
      "Interested in AI infrastructure plays",
      "Loves trail running on weekends",
      "Invests $500K – $3M at seed",
    ],
    metAt: "Techstars Demo Day",
    lastInteraction: daysAgo(45),
    birthday: "1986-04-12",
    reminderCadenceDays: 30,
    linkedinConnected: true,
    socialUpdates: [
      {
        id: "su1",
        type: "funding_news",
        title: "Sequoia announces $2B AI-focused fund",
        detail: "Sarah's firm just closed one of the largest AI-focused funds this year.",
        date: daysAgo(7),
      },
      {
        id: "su2",
        type: "linkedin_post",
        title: "Posted about AI infrastructure trends",
        detail: "Shared insights on why AI infra is the next big wave — aligns with your space.",
        date: daysAgo(12),
      },
    ],
    interactions: [
      {
        id: "i1",
        type: "meeting",
        title: "Coffee at Blue Bottle",
        detail: "Talked about AI infra fund thesis, she asked for a follow-up deck.",
        date: daysAgo(45),
      },
      {
        id: "i2",
        type: "message",
        title: "Sent intro email",
        detail: "Shared our v2 product roadmap and recent metrics.",
        date: daysAgo(60),
      },
      {
        id: "i3",
        type: "event",
        title: "Met at Techstars Demo Day",
        date: daysAgo(120),
      },
    ],
  },
  {
    id: "c2",
    name: "Marcus Whitfield",
    photo:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80&auto=format&fit=crop",
    company: "Lumen Health",
    title: "Co-founder & CEO",
    email: "marcus@lumen.health",
    linkedin: "linkedin.com/in/marcuswhit",
    tags: ["YC W23", "Healthtech", "Founder friend"],
    category: "Founder",
    warmth: "strong",
    strengthScore: 88,
    notes: [
      "YC batchmate, helped us with our first hire",
      "Recently raised $12M Series A",
      "Wife just had a baby — Olivia",
      "Loves obscure jazz records",
    ],
    metAt: "Y Combinator W23",
    lastInteraction: daysAgo(6),
    birthday: "1990-09-22",
    reminderCadenceDays: 14,
    linkedinConnected: true,
    socialUpdates: [
      {
        id: "su3",
        type: "funding_news",
        title: "Lumen Health raised $12M Series A",
        detail: "Marcus closed his round led by a16z — great time to congratulate.",
        date: daysAgo(11),
      },
      {
        id: "su4",
        type: "life_moment",
        title: "Welcome baby Olivia!",
        detail: "Marcus and his wife welcomed their daughter last month.",
        date: daysAgo(30),
      },
      {
        id: "su5",
        type: "linkedin_post",
        title: "Shared lessons from scaling to 50 people",
        detail: "Wrote a thoughtful thread on hiring and culture at seed stage.",
        date: daysAgo(5),
      },
    ],
    interactions: [
      {
        id: "i4",
        type: "call",
        title: "Quick catch-up call",
        detail: "Talked hiring, he made an intro to a great staff eng.",
        date: daysAgo(6),
      },
      {
        id: "i5",
        type: "milestone",
        title: "Lumen Health announced $12M Series A",
        date: daysAgo(11),
      },
    ],
  },
  {
    id: "c3",
    name: "Priya Raghavan",
    photo:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80&auto=format&fit=crop",
    company: "Stripe",
    title: "Engineering Manager",
    email: "priya@stripe.com",
    tags: ["Engineering", "Mentor", "Payments"],
    category: "Mentor",
    warmth: "warm",
    strengthScore: 74,
    notes: [
      "Mentored me through my first eng leadership role",
      "Loves matcha and pottery",
      "Speaks at QCon every year",
    ],
    metAt: "QCon SF 2022",
    lastInteraction: daysAgo(21),
    reminderCadenceDays: 30,
    linkedinConnected: true,
    socialUpdates: [
      {
        id: "su6",
        type: "job_change",
        title: "Promoted to Senior EM at Stripe",
        detail: "Priya now leads the Payments Platform org — bigger team, bigger scope.",
        date: daysAgo(14),
      },
    ],
    interactions: [
      {
        id: "i6",
        type: "message",
        title: "Sent her my talk feedback",
        date: daysAgo(21),
      },
    ],
  },
  {
    id: "c4",
    name: "Jonas Lindqvist",
    photo:
      "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&q=80&auto=format&fit=crop",
    company: "North Star Ventures",
    title: "Principal",
    email: "jonas@northstar.vc",
    tags: ["Series A", "Climate", "European"],
    category: "Investor",
    warmth: "cold",
    strengthScore: 32,
    notes: [
      "Met at Slush Helsinki",
      "Bullish on climate + AI",
      "Said 'reach out when you're raising A'",
    ],
    metAt: "Slush 2024",
    lastInteraction: daysAgo(98),
    reminderCadenceDays: 45,
    linkedinConnected: false,
    socialUpdates: [],
    interactions: [
      {
        id: "i7",
        type: "event",
        title: "Met at Slush 2024",
        detail: "30 min coffee chat at the founder lounge.",
        date: daysAgo(98),
      },
    ],
  },
  {
    id: "c5",
    name: "Ava Thompson",
    photo:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80&auto=format&fit=crop",
    company: "Notion",
    title: "Head of Design",
    tags: ["Design", "Hiring", "Friend"],
    category: "Friend",
    warmth: "warm",
    strengthScore: 69,
    notes: [
      "Loves basketball, Warriors fan",
      "Looking for senior product designers",
      "We grab dinner every quarter",
    ],
    lastInteraction: daysAgo(33),
    birthday: "1992-11-30",
    reminderCadenceDays: 30,
    linkedinConnected: false,
    socialUpdates: [],
    interactions: [
      {
        id: "i8",
        type: "meeting",
        title: "Dinner at Nopa",
        date: daysAgo(33),
      },
    ],
  },
  {
    id: "c6",
    name: "David Okafor",
    photo:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&q=80&auto=format&fit=crop",
    company: "Acme Inc.",
    title: "VP Sales",
    tags: ["Customer", "Enterprise"],
    category: "Client",
    warmth: "strong",
    strengthScore: 91,
    notes: [
      "Customer since 2023",
      "Loves sailing — has a boat in Annapolis",
      "Renewal coming up in March",
    ],
    lastInteraction: daysAgo(3),
    reminderCadenceDays: 21,
    linkedinConnected: true,
    socialUpdates: [
      {
        id: "su7",
        type: "press_mention",
        title: "Acme Inc. named in Gartner Magic Quadrant",
        detail: "Recognized as a Leader in Enterprise SaaS — great conversation starter.",
        date: daysAgo(5),
      },
    ],
    interactions: [
      {
        id: "i9",
        type: "call",
        title: "QBR call",
        detail: "Reviewed product roadmap, very positive on Q1.",
        date: daysAgo(3),
      },
    ],
  },
  {
    id: "c7",
    name: "Elena Rossi",
    photo:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&q=80&auto=format&fit=crop",
    company: "TechCrunch",
    title: "Senior Reporter",
    tags: ["Press", "AI beat"],
    category: "Press",
    warmth: "cooling",
    strengthScore: 49,
    notes: [
      "Covers enterprise AI",
      "Prefers Signal over email",
      "Open to exclusives if pitched 2 weeks ahead",
    ],
    lastInteraction: daysAgo(72),
    reminderCadenceDays: 60,
    linkedinConnected: false,
    socialUpdates: [],
    interactions: [],
  },
  {
    id: "c8",
    name: "Kenji Watanabe",
    photo:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=400&q=80&auto=format&fit=crop",
    company: "Independent",
    title: "Recruiter",
    tags: ["Hiring", "Engineering"],
    category: "Recruiter",
    warmth: "warm",
    strengthScore: 66,
    notes: [
      "Specializes in staff+ engineers",
      "Helped close 3 hires last year",
      "Lives in Tokyo, calls early PT",
    ],
    lastInteraction: daysAgo(18),
    reminderCadenceDays: 45,
    linkedinConnected: false,
    socialUpdates: [],
    interactions: [],
  },
];

export const TONE_OPTIONS = [
  { id: "casual", label: "Casual", emoji: "👋", description: "Friendly, low-key" },
  { id: "professional", label: "Professional", emoji: "💼", description: "Polished, respectful" },
  { id: "friendly", label: "Friendly", emoji: "🤝", description: "Warm and personal" },
  {
    id: "founder",
    label: "Founder-to-founder",
    emoji: "🚀",
    description: "Direct, peer-to-peer",
  },
  {
    id: "investor",
    label: "Investor update",
    emoji: "📈",
    description: "Confident, metric-driven",
  },
  {
    id: "reconnect",
    label: "Networking reconnect",
    emoji: "✨",
    description: "Warm re-engagement",
  },
] as const;

export type ToneId = (typeof TONE_OPTIONS)[number]["id"];

export const CHANNELS = [
  { id: "text", label: "Text", icon: "MessageSquare" },
  { id: "email", label: "Email", icon: "Mail" },
  { id: "linkedin", label: "LinkedIn", icon: "Linkedin" },
] as const;

export type ChannelId = (typeof CHANNELS)[number]["id"];
