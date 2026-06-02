# Settings: phone contacts import, LinkedIn connect, legal screens

## Features

- [x] **Import phone contacts**: Tapping the row asks for permission, then bulk-imports every contact from the phone's address book into the app — name, phone, email, and company get mapped into contacts. A brief summary shows how many were imported.
- [x] **Connect LinkedIn**: Tapping the row opens a secure LinkedIn sign-in page. After authorizing, the user's own profile (photo, headline, company) is pulled from LinkedIn and displayed in their app profile card. No longer marked "Coming soon."
- [x] **Upload CSV removed**: The Upload CSV option disappears from the settings screen.
- [x] **Privacy Policy**: A clean local screen with standard privacy policy text, accessible from the settings row.
- [x] **Terms of Service**: Same pattern — a local screen with standard terms text, added as a new row under Privacy & Data.

## Design

- The settings screen keeps its existing dark, gold-accented card style. No layout changes beyond the rows being added/removed.
- Phone import shows a brief permission prompt and a subtle loading indicator while contacts are being imported, then a small confirmation.
- LinkedIn connect opens the system browser for OAuth — after returning to the app, the profile card updates with the LinkedIn photo and headline.
- Privacy Policy and Terms screens are simple scrollable text views with the app's dark background, a back button, and clean typography — matching the app's existing screen style.

## Screens

- [x] **Settings (updated)**: CSV row removed. Import Contacts and LinkedIn rows become functional. Privacy policy row navigates to new screen. New Terms of Service row added.
- [x] **Privacy Policy screen (new)**: Scrollable page with standard privacy policy text.
- [x] **Terms of Service screen (new)**: Scrollable page with standard terms of service text.
