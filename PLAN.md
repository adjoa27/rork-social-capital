# Social Capital — Make everything real

## Audit: What's real vs. fake right now

**Currently real:**
- [x] SMS sending (expo-sms)
- [x] Email composer (expo-mail-composer)
- [x] Clipboard copy
- [x] Text-to-speech (expo-speech)
- [x] Local notifications (expo-notifications)
- [x] Haptics feedback

**Previously fake — now real:**
- [x] Authentication — Rork Auth with Google/Apple OAuth + email fallback
- [x] Database — Supabase contacts table with RLS, AsyncStorage offline cache
- [x] AI message generation — Rork proxy calling Claude Sonnet 4
- [x] Business card scanner — expo-image-picker camera + GPT-4o vision OCR
- [x] Voice notes — expo-av recording/playback + Whisper transcription
- [x] LinkedIn — opens profile URLs via Linking API
- [x] RevenueCat — SDK installed, paywall screen built, subscription hook ready
- [x] Social/news feed — seed data in Supabase

---

## What we built

### 1. Real Database with Supabase
- Created `contacts` table in Supabase with all fields (name, company, notes, tags, warmth, interactions, social updates, etc.)
- Replaced AsyncStorage reads/writes with Supabase queries
- Users sign in → their contacts sync from the cloud
- Kept AsyncStorage as offline cache, Supabase as source of truth

### 2. Real AI Message Generation
- Wired up the Rork proxy to call Claude Sonnet 4 via Vercel AI Gateway
- Replaced the `composeDraft()` template function with actual AI API calls
- AI receives: contact notes, last interaction date, where they met, shared interests, selected tone and channel
- AI returns: personalized, natural-sounding message
- Falls back to template if AI unavailable

### 3. Real Authentication
- Replaced the fake AsyncStorage auth with Rork Auth (Google/Apple OAuth)
- Added email login fallback for preview/testing
- Links contacts to authenticated user IDs via `user_id()` in RLS
- Token management via SecureStore with auto-refresh

### 4. RevenueCat Paywall + Premium
- Installed RevenueCat Expo SDK (`react-native-purchases`)
- Created `useSubscription` hook with react-query
- Built a beautiful paywall screen matching the app's warm, premium aesthetic
- Added "Restore Purchases" button
- Ready-to-gate premium features via `isPro` flag

### 5. Business Card Scanner (Real OCR)
- Uses expo-image-picker to capture a photo of a business card
- Sends the image to GPT-4o vision via the Rork proxy for OCR extraction
- Parses name, title, company, email, phone from the OCR result
- Shows extracted fields for review before saving the contact

### 6. Real Voice Notes
- Installed expo-av for audio recording and playback
- Added VoiceRecorder component on contact profiles
- Updated event mode with real recording flow
- Auto-transcribes voice notes using OpenAI Whisper via Rork proxy

### 7. LinkedIn Integration
- Uses Linking API to open LinkedIn profile URLs
- Added "View LinkedIn profile" button on contact profiles
- Shows LinkedIn icon with external link indicator

---

## Files created/modified

**New files:**
- `expo/lib/supabase.ts` — Supabase client with Rork Auth token
- `expo/lib/revenuecat.ts` — RevenueCat configuration
- `expo/hooks/useAuth.ts` — Rork Auth provider + hook
- `expo/hooks/useSubscription.ts` — RevenueCat subscription hook
- `expo/app/paywall.tsx` — Premium subscription paywall screen
- `expo/components/VoiceRecorder.tsx` — Audio recording/playback component

**Modified files:**
- `expo/app/_layout.tsx` — Switched to new AuthProvider
- `expo/providers/ContactsProvider.tsx` — Supabase as source of truth
- `expo/app/login.tsx` — Real auth with error/loading states
- `expo/app/index.tsx` — Uses new auth hook
- `expo/app/onboarding.tsx` — Removed fake auth dependency
- `expo/app/message-generator.tsx` — Real AI via Rork proxy
- `expo/app/scan-card.tsx` — Real camera + AI OCR
- `expo/app/contact/[id].tsx` — LinkedIn + voice notes integration
- `expo/app/(tabs)/event.tsx` — Real voice recording
- `expo/app/(tabs)/home.tsx` — Updated auth import
- `expo/app/(tabs)/settings.tsx` — Updated auth import
- `expo/app.json` — Correct deep link scheme
- `expo/package.json` — New dependencies
