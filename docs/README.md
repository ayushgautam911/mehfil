# Hive — Design System

> Your scene, your rules. An invite-only platform for underground music collectives.

This design system captures the **"Terminal Reductionism / Neo-Teletech"** aesthetic of Hive: pure-black ground, phosphor-green and cyan accents, Space Grotesk set in wide-tracked uppercase, animated CRT scanlines, glitch interactions, and corner-bracket framing. It is derived directly from the Hive product docs and the working **member-app** Expo / React Native codebase.

---

## 0 · Run & deploy

Everything is **static** — no build step. Fonts load from Google Fonts, React/Babel from a CDN, and all CSS/JSX use relative paths.

- **Locally:** open `index.html` (the hub) and follow the links to the prototypes and foundations.
- **Deploy (GitHub Pages):** place these files under a `docs/` folder at the repo root, push to `main`, then in **Settings → Pages** set Source = *Deploy from a branch*, Branch = `main`, Folder = `/docs`. Site goes live at `https://<owner>.github.io/<repo>/`.

```bash
# from your local clone of the repo
mkdir -p docs && cp -R /path/to/design-system/* docs/
git add docs && git commit -m "Add Hive design system + prototypes" && git push origin main
```

Any static host (Netlify, Vercel, S3) works too — serve the folder as-is. Prototypes are mocked, in-memory, and not wired to a backend.

---


## 1 · Product context

**Hive** is an invite-only platform for underground music collectives (launching in Seattle). It is two apps on one backend:

| | **Hive** (Member App) | **Hive Console** (Organizer App) |
|---|---|---|
| Purpose | Discover events, request passes, build scene identity | Manage a collective, publish events, vet & scan passes |
| Platform | iOS + Android (React Native / Expo) | Web (Next.js), responsive |
| Built in source? | **Yes** — `hive/member-app` | **No** — described in PRD only |

The product replaces the Instagram + Google Forms + Venmo + WhatsApp stack with one connected system: **invitation chains** (every member traces back to someone trusted), **admin-approved passes** (no payments handled in-app), **audience filters**, and **timed address reveals**. Privacy-first: organizers only ever see anonymized, aggregated data.

### Sources this system was built from
- `hive/hive_pr_doc.md` — press release / positioning
- `hive/hive_requirements_mvp.md` — full PRD (personas, epics, data model)
- `hive/hive_backend_design.md` — backend technical design
- `hive/hive_mvp_storyboard.md` — flow-by-flow storyboard
- `hive/member-app/` — **the authoritative visual source**: Expo app with `constants/theme.ts`, components (`EventCard`, `GenreChip`, `GlitchButton`, `CyberBackground`, `CornerBrackets`, `TabBar`) and screens (welcome/boot, onboarding, feed, event detail, tickets, profile, invite).

---

## 2 · Content fundamentals

How Hive writes copy — this matters as much as the visuals.

- **Two registers, deliberately mixed.** Marketing/onboarding copy is **lowercase and human** ("what moves you?", "select your frequencies", "you're invited"). System chrome and data are **UPPERCASE and machine** ("HIVE / FEED", "// LINEUP", "[LOCKED — TICKET REQUIRED]", "MEMBER SINCE 2026").
- **Terminal / readout grammar.** Numbers and statuses are bracketed like sensor output: `[92% MATCH]`, `[QR]`, `[$15]`, `[87]`. Section headers are prefixed with `//`. Decorative metadata reads like a console: `NODE_POSITION: SEATTLE`, `SESSION: 0X8F71...A13`, `T-MINUS_0`, `V0.9`.
- **Terse, declarative, confident.** Short fragments over sentences. "Find the sound." "Private events. Curated access." "Your scene, your rules." Never chatty, never salesy.
- **Scene vocabulary, not generic event-speak.** "collective" not "organizer", "pass" not "ticket" (in product/PRD terms), "frequencies" for genre prefs, "the door" for entry, "the scene". Genres are lowercase: `acid`, `dub techno`, `hard techno`.
- **No emoji** in the app UI (the storyboard prose uses a 🔒 once; the built app renders locks as `[LOCKED]` text instead — follow the build). No exclamation-point hype except the glitch button's transient `! ENTER !` state.
- **Privacy as a value, stated plainly.** "The data stays yours." "No individual data exposed — ever."

---

## 3 · Visual foundations

**Color.** Pure black `#000000` ground — always. Two near-black surfaces (`#0d0d0d` panels, `#0a0a0a` floating chrome) and a single hairline border `#1a1a1a`. Saturation is reserved entirely for **two phosphor accents**: matrix green `#00ff41` (primary — active, match, CTAs, glow) and cyan `#0abdc6` (secondary — genres, labels, meta). Text is a warm-neutral grey ramp — `#e8e8e8` primary (never pure white), `#606060` secondary, `#333333` dim. Green appears as solid, as a 6% wash behind outlines, and as a 30% line for glow borders.

**Type.** One typeface — **Space Grotesk** — at three weights (400 / 500 / 700). Personality comes from **case and letter-spacing**, not font choice: body sits at 0–1px tracking; UI labels at 2px; buttons and the wordmark at 4–16px. Headers, labels, tags, stats are UPPERCASE; only marketing/onboarding copy and genre names stay lowercase. Space Mono is held in reserve for true machine readouts (QR tokens, hashes, referral codes). Sizes: 10 / 12 / 14 / 16 / 20 / 26 / 36 / 48px.

**Spacing.** A tight 4px ramp (4 / 8 / 12 / 16 / 24 / 36 / 56). Screen gutter is 16px. Sections are separated by **vertical rhythm + hairline rules**, not boxes — the UI is mostly borderless.

**Shape & radius.** Everything is **hard-edged, radius 0** — chips, buttons, inputs, cards, badges. The *single* exception is the floating pill tab bar (`28px`). Inputs are underline-only (a hairline that turns green on focus), not boxed.

**Depth.** Conveyed by **phosphor glow**, almost never by drop shadows. Active text and the wordmark get a green `text-shadow`; the primary button and accents get a green box glow on hover. The one soft shadow in the system is the tab bar's faint green float.

**Texture.** Animated **CRT scanlines** (`.hive-scanlines`) overlay full-bleed screens — a 1.5px line every 2.5px, drifting on an 0.8s loop with an erratic ~4s flicker. Welcome screens add rigid corner metadata (`N-SEA`, `0X-88`, `T-MINUS_0`, `V0.9`).

**Framing.** **Corner brackets** mark focal blocks — the wordmark, an event title block, a hero readout. Brackets suggest a frame without enclosing; green for active focus, dim grey when the framed content already glows.

**Motion.** Mechanical and abrupt, not smooth-organic. Boot bars tick in irregular jumps. The glitch button flashes and jitters one frame. The tab indicator springs (`cubic-bezier(0.2,0.9,0.2,1)`). Scanlines drift linearly. Screen entrances nudge in via transform only (never fade from invisible — keeps content visible when motion is reduced). Honor `prefers-reduced-motion`.

**Imagery.** The built app uses **no photography** — type, color, scanlines and brackets carry everything (avatars are plain dark squares). If real imagery is ever introduced, treat it high-contrast and cool/desaturated; never bright or warm.

---

## 4 · Iconography

Hive is **near-iconless by design** — this is core to the aesthetic, not a gap.

- **No icon font, no SVG icon set, no emoji** in the built app. The Expo project ships only default Expo launcher art (a placeholder chevron) — **not a real logo**, so it was excluded.
- Iconography is done with **text glyphs and readouts**: `›` (button affordance), `←` (back), `//` (section prefix), `[QR]` / `[LOCKED]` / `[$15]` (bracketed status), corner brackets (focal frames), the underline as the only field chrome.
- The **logo is typographic**: the `H I V E` wordmark in Space Grotesk Bold, letter-spacing 16px, with a green glow, framed by corner brackets. See `guidelines/brand-wordmark.html`.
- **If you need true icons** (e.g. building Hive Console's scanner or nav), reach for a thin, monoline set — **Lucide** at ~1.5px stroke in `--accent-secondary` or `--text-secondary` is the closest match. Use sparingly and never filled. *(This would be a substitution — flagged, since the source has no icon set.)*

---

## 5 · Index / manifest

**Root**
- `styles.css` — global entry point (link this). `@import`s everything below.
- `tokens/` — `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `effects.css`.
- `README.md` — this file. · `SKILL.md` — Agent-Skills wrapper.

**Foundation cards** (`guidelines/`, shown in the Design System tab)
- Type: `type-display`, `type-body`, `type-labels`, `type-tracking`
- Colors: `colors-ground`, `colors-accents`, `colors-text`
- Spacing: `spacing-scale`, `spacing-rhythm`
- Brand: `brand-wordmark`, `brand-scanlines`, `brand-glow`

**Components** (`components/`, React + sibling `.d.ts` / `.prompt.md` / card HTML)
- `actions/` — **GlitchButton**
- `forms/` — **GenreChip**, **Input**
- `data-display/` — **Tag**, **Badge**, **MatchScore**, **FreqBar**, **StatBlock**, **Avatar**, **StatusBadge**
- `structure/` — **CornerFrame**, **SectionLabel**
- `content/` — **EventRow**, **ChatBubble**, **QRPass**

**UI kits** (`ui_kits/`)
- `hive-member-app/` — interactive recreation of the member app, now **5 tabs** (Feed · Collectives · Passes · Chat · Profile) covering the roadmap features: collectives & membership (invite-only), pass request → approval → QR, 1:1 collective chat, synced history, preferences. See its README.
- `hive-console/` — the **organizer web app** (net-new): Dashboard, Events (+ create), Membership (screening / roster / invitation controls), Passes (approval queue + door scanner), Chat, Settings, and a create-collective onboarding. See its README.

---

## 6 · Open questions / next steps

- **Roadmap features added (from the Work Breakdown Structure):** collectives + membership (apply / invite / pending / multi-collective), 1:1 chat, history sync + import, the pass model, and the organizer Console. Built per your direction: **invite-only** (no public collective directory), **1:1 member↔collective** chat, and **passes** (request → admin approves → QR, no payment).
- **Logo:** confirm the typographic `H I V E` wordmark is the intended mark, or supply a dedicated logo to replace the Expo placeholder.
- **Fonts:** Space Grotesk + Space Mono are loaded from Google Fonts. If you need fully-offline binaries, supply `.woff2` files and we'll swap the `@import` for self-hosted `@font-face`.
- **P2 / not deeply modeled:** per-member-per-event invite limits and member rating-by-invite-acceptance appear as Console UI but aren't simulated. Console data is mocked and actions are cosmetic.

> **Share setting:** to let your org view this as a design system, set the file type to **Design System** in the Share menu.
