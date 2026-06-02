# Phone contact import, LinkedIn connection & privacy policy

**Features**
- Import contacts from the phone's address book — permission screen explains why, then a picker lets users choose which contacts to add
- Connect LinkedIn profile — users link their LinkedIn account so the app can pull in social updates (job changes, posts, funding news) for contacts who are also connected on LinkedIn
- In-app privacy policy — a dedicated screen with a clear, readable privacy policy that explains what data the app collects and how it's used
- Remove the "Upload CSV" option from settings since phone import replaces it

**Design**
- Phone contact import screen: clean modal with a centered illustration area at top explaining the permission, a prominent "Allow Access" button, then a scrollable contact list with avatar initials, name, and checkboxes for selection. Confirmation shows count of contacts added
- LinkedIn connection screen: modal with the LinkedIn brand blue (#0A66C2) as the accent, a brief explanation of the benefits (seeing contacts' job changes, posts, etc.), and a "Connect LinkedIn" button. After connecting, shows a connected state with profile preview
- Privacy policy screen: simple scrollable text page with the app's brand styling, clear section headings, last-updated date, and a back button. Uses the existing card/background color palette
- All three screens use the app's existing design language — cream background, dark navy text, gold accents for highlights

**Screens**
- Settings screen: updated with working "Import phone contacts" (navigates to import modal), working "Connect LinkedIn" (navigates to LinkedIn connection modal), working "Privacy policy" (navigates to privacy screen), CSV upload row removed
- Import Contacts modal: permission intro → contact picker → import confirmation
- LinkedIn Connect modal: explanation → connect button → connected state with profile info
- Privacy Policy screen: full-screen scrollable page with privacy policy text
