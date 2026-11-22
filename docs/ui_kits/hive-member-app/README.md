# Hive — Member App UI Kit

An interactive, click-through recreation of the **Hive** member app (the event-goer's app), rebuilt for the web from the Expo / React Native source (`hive/member-app`) and extended with the roadmap features from the Work Breakdown Structure. Wrapped in a dark iOS device frame.

## Run it
Open `index.html`. Boot sequence → ENTER → onboarding → main app. A **Tweaks** panel (toolbar) exposes accent, glow, scanlines, tracking, and match-score controls.

## Navigation
Floating pill **tab bar**: **FEED · COLLECTIVES · PASSES · CHAT · PROFILE** (sliding green indicator; unread/invite dots). Detail screens open as full-screen overlays over the active tab.

## Screens
**Original**
- **Welcome / boot** — glitchy boot bar, then the `H I V E` wordmark + ENTER.
- **Onboarding** — "what moves you?" genre chips + artist search.
- **Feed** — events from all joined collectives (`HIVE / FEED`), each row tagged with its collective; tap → detail.
- **Event detail** — corner-bracket title block, `[% MATCH]`, lineup, locked location, **ACCESS** (request a free pass), REFER A FRIEND → invite. CTA reflects pass state (REQUEST PASS / PASS REQUESTED / VIEW PASS).
- **Invite** — "you're invited" lockup, ACCEPT, referral code.
- **Profile** — identity, stats, `// FREQUENCIES`, **MY COLLECTIVES**, settings links (preferences / history / invite), terminal metadata.

**New feature screens**
- **Collectives** — invite-only: `PENDING INVITATIONS` (accept/decline), `YOUR COLLECTIVES`, `PENDING APPLICATIONS`. No public directory (by design).
- **Collective detail** — profile, about, genres, member-only MESSAGE + upcoming events + leave; invited state shows ACCEPT/DECLINE; applied state shows APPLICATION PENDING.
- **Passes** — `ACTIVE` (approved + `[QR]`), `AWAITING APPROVAL`, `ARCHIVE` (declined/used). Tap an active pass → **Pass detail** (corner-bracketed QR, rotating code, entry terms).
- **Chat** — 1:1 threads, one per collective (member ↔ collective). List + thread with bubbles and composer.
- **History** — sync sources (RA / Instagram / Shazam), "upload historic data", and a synced attendance timeline (feeds the taste graph).
- **Preferences** — editable frequencies, notification toggles, privacy toggles.

## Files
- `index.html` — entry point; loads React + Babel + the scripts below.
- `hive-data.js` — mock data (events, collectives, passes, chats, history, preferences).
- `hive-ui.jsx` — shared primitives (Scanlines, SectionLabel, ScreenHeader, GlitchButton, GenreChip, Tag, CornerFrame, **TabBar**, Screen, **Avatar, StatusBadge, ListRow, BackButton, QRBlock, ChatBubble**).
- `hive-screens.jsx` — welcome, onboarding, feed, event detail, profile, invite.
- `hive-screens2.jsx` — passes, pass detail, collectives, collective detail, chat list, chat thread, history, preferences.
- `hive-app.jsx` — navigation shell + Tweaks + mounts into the iOS frame.
- `ios-frame.jsx`, `tweaks-panel.jsx` — starter components.

## Notes
- Styling is driven entirely by the design-system tokens in `../../styles.css` — no hard-coded hex/px for brand values.
- This is a **recreation**, not production code: navigation is in-memory; actions like REQUEST PASS / ACCEPT / SEND / copy are cosmetic.
- The organizer side lives in `../hive-console/`.
