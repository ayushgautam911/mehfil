---
name: hive-design
description: Use this skill to generate well-branded interfaces and assets for Hive, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping. Hive is an invite-only platform for underground music collectives — a dark "Terminal Reductionism / Neo-Teletech" aesthetic (pure black, matrix-green + cyan phosphor accents, Space Grotesk, scanlines, glitch, corner brackets).
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

Key files:
- `README.md` — full design guide (product context, content + visual foundations, iconography, manifest, open questions).
- `styles.css` — link this; it `@import`s all tokens (`tokens/*.css`). Use the CSS custom properties (`--accent-primary`, `--surface-page`, `--font-sans`, `--ls-extra-wide`, `--glow-green-md`, `.hive-scanlines`, …) — do not hard-code brand hex/px.
- `components/**` — React primitives (GlitchButton, GenreChip, Input, Tag, Badge, MatchScore, FreqBar, StatBlock, CornerFrame, SectionLabel, EventRow, Avatar, StatusBadge, ChatBubble, QRPass), each with a `.prompt.md` usage note.
- `ui_kits/hive-member-app/` — interactive recreation of the member app (5 tabs: feed, collectives, passes, chat, profile + onboarding, history, preferences); the reference for mobile screen-level composition.
- `ui_kits/hive-console/` — the organizer web app (dashboard, events, membership/screening, passes + door scanner, chat, settings, create-collective onboarding); the reference for desktop composition.
- `guidelines/**` — foundation specimen cards.

Non-negotiables: pure black ground, radius 0 everywhere (except the pill tab bar), UPPERCASE + wide tracking for chrome/labels and lowercase for marketing/genre copy, glow over shadow, bracketed readouts (`[92% MATCH]`) and `//` section labels, no emoji, no decorative SVG icons. Honor `prefers-reduced-motion`.
