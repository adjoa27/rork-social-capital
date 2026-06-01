# Rename app from "Warmly" to "Social Capital"

Rename the app across the entire codebase from "Warmly" to "Social Capital".

**What changes:**
- App name in `app.json`
- All user-facing text (login screen, onboarding, dashboard, AI tab, event mode, settings)
- Placeholder email addresses (`alex@warmly.app`, `hello@warmly.app`)
- Code comments and doc strings

**What stays the same:**
- AsyncStorage keys (`warmly:auth:v1`, `warmly:contacts:v1`) — changing these would wipe existing user data

**8 files affected**, all text-only changes with no logic or layout modifications.