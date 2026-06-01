# Fix RLS violations for profiles and contacts tables


## Problem

Two errors appear at runtime:

1. `Failed to sync profile: new row violates row-level security policy for table "profiles"`
2. `Seed insert failed: new row violates row-level security policy for table "contacts"`

These happen because the app tries to write to Supabase even when the user doesn't have a real JWT token (e.g., email sign-in in preview mode). Without a valid JWT, Supabase treats the request as anonymous, and the RLS policies block it.

## Fix

### Code changes (2 files)

- **`expo/lib/supabase.ts`** — Update `syncProfile` to skip the Supabase upsert when no valid JWT access token is available (email/anonymous users). Silently return instead of hitting Supabase and triggering the RLS error.

- **`expo/providers/ContactsProvider.tsx`** — Update `loadContacts` to skip Supabase seed inserts when no valid JWT access token is available. The local cache and seed data already work correctly for unauthenticated users — the Supabase write should only be attempted when the user is fully authenticated with a real token.

### What stays the same

- Authenticated users with real JWT tokens (Google/Apple OAuth) continue to sync their profile and contacts to Supabase as before
- Local AsyncStorage cache and seed data still work for email/anonymous users
- No visual changes — the errors just stop appearing in logs
