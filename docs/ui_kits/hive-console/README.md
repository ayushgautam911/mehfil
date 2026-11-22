# Hive — Console (Organizer) UI Kit

The **organizer-facing** web app, where a collective runs membership, events, passes, and member chat. Built on the same Hive design system (Terminal Reductionism / Neo-Teletech) and presented in a desktop browser-window frame. This kit is **net-new** — the Console exists in the PRD and the Work Breakdown Structure but not in the original source codebase, so it's an extrapolation of that system onto the organizer surface.

## Run it
Open `index.html`. You're administering the **VOID** collective. A left sidebar (with a collective switcher) navigates the sections; the whole console is scaled to fit your viewport.

To see the **create-collective onboarding** (signup → collective → import history), set `onboarded` to `false` in `console-app.jsx`.

## Sections (sidebar nav)
- **Dashboard** — metrics (members, pending applications, pass requests, upcoming events), recent activity, and an **aggregated · anonymized** audience panel (the privacy guarantee — never individual data).
- **Events** — table of events (published / draft, capacity, passes issued, requests) + **New Event** form (details, access & visibility, address-reveal timing).
- **Membership** — three tabs:
  - *Applications* — screening queue; each applicant shows their invite chain, shared-taste %, mutuals → ADMIT / DECLINE.
  - *Members* — roster table with rating, invite usage, status → MESSAGE / BLOCK / UNBLOCK.
  - *Invitations* — controls (enable invitations, auto-approve, per-member/event invite limit) + direct **invite member (auto-approve)**.
- **Passes** — *Queue* (approve/decline pass requests, bulk "approve ≥ 70%") and *Scanner* (door check-in with a bracketed camera target and ADMIT result).
- **Chat** — 1:1 threads with members (list + thread + composer).
- **Settings** — collective profile, **history data import** (.csv), and a danger zone (disable invitations / archive).

## Files
- `index.html` — entry point; loads React + Babel + the scripts below.
- `console-data.js` — organizer mock data (collective, members, applications, events, pass requests, chats, activity).
- `browser-window.jsx` — desktop window chrome (starter component).
- `console-ui.jsx` — shared primitives (Sidebar, CHeader, Body, Panel, Metric, Table/Row, CBtn, CStatus, CAvatar, CLabel, Scanlines).
- `console-screens.jsx` — Dashboard, Membership, Events (+ Create Event).
- `console-screens2.jsx` — Passes (queue + scanner), Chat, Onboarding (create collective).
- `console-app.jsx` — Settings screen, app shell, nav, viewport scaler.

## Notes
- Tokens come from `../../styles.css`. Desktop density (smaller paddings, data tables) but the same black ground, phosphor accents, hard edges, glow-over-shadow, bracketed readouts, and `//` labels as the member app.
- Recreation only — all actions are cosmetic and data is mocked.
- **Open question:** the member app uses pass/QR language already, and per your direction the model is *request → admin approves → QR pass (no payment)* — reflected here. The breakdown's P2 items (per-event invite limit, member rating by invite-acceptance) are shown as UI but not modeled deeply.
