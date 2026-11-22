# M3HFIL Console

The organizer-facing web app for M3hfil — where a collective runs membership, events, passes, and member chat. Built with **React + Vite + TypeScript** on the shared M3hfil design system (Terminal Reductionism / Neo-Teletech).

This is the production port of the design reference at `../docs/ui_kits/hive-console/`. The prototype's in-browser Babel/CDN setup is replaced with normal modules; the viewport scaler is dropped in favor of a responsive layout with a sensible `min-width`.

## Run

```bash
npm install
npm run dev        # start the dev server
npm run build      # typecheck + production build
npm run typecheck  # tsc --noEmit
npm test           # run unit tests (Vitest)
npm run test:watch # watch mode
```

## Testing

Unit tests use **Vitest** (`*.test.ts` next to the code). Current coverage
includes the email-template token engine (`src/templates.ts` — `applyTemplate`,
defaults, token validation). Add tests alongside any new logic.

> See [`../test_agent.md`](../test_agent.md) for the testing policy. **No MR/PR
> should merge without proper test cases and coverage.**

## Structure

- `src/tokens.css` — design tokens as CSS custom properties (mirrors `member-app/constants/theme.ts`).
- `src/styles.css` — fonts, global resets, scanlines, animations, hover states, reduced-motion.
- `src/data.ts` — typed mock data (collective, members, applications, events, pass requests, chats, activity, metrics, invitation settings).
- `src/components/primitives.tsx` — `CAvatar`, `CStatus`, `CBtn`, `CLabel`, `Panel`, `Metric`, `Table`/`Row`, `cellText`, `Sidebar`, `CHeader`, `Body`, `Scanlines`.
- `src/screens/*` — Dashboard, Membership (applications / members / invitations), Events (+ create), Passes (queue + scanner), Chat, Settings, Onboarding.
- `src/App.tsx` — sidebar + content shell, nav, badges. Set `onboarded = false` to view the create-collective flow.

## Notes

- Data is mocked/in-memory; actions are cosmetic. Swap the mock store for the real API per `../hive_backend_design.md`.
- The door **Scanner** simulates a scan; for production wire it to a browser camera + barcode reader (e.g. `@zxing/browser` or `html5-qrcode` via `getUserMedia`).
- Decorative loops (scanlines, scan line) honor `prefers-reduced-motion`.
- **Email Templates** are persisted **client-side in `localStorage`** (key `hive_email_templates`). This means they are scoped to a single browser/device and are **not shared across users, devices, or admins** of the same collective, and are lost if site data is cleared. This is surfaced to the user as a notice on the Email Templates tab. See the roadmap item below.

## Roadmap

### Should have — server-side, per-collective email templates
Move email templates from browser `localStorage` to the backend so they are **shared across every admin and device** of a collective (and survive cache clears). Suggested implementation:

- **DB:** add a `templates` table (`id`, `collective_id` → collectives, `name`, `subject`, `body`, `created_at`, `updated_at`).
- **API:** `GET/POST/PUT/DELETE /api/v1/collectives/:id/templates` (admin-auth, scoped to the collective), mirroring the existing Fastify + Drizzle patterns in `../backend/`.
- **Client:** swap `loadTemplates`/`saveTemplates` in `src/templates.ts` to call the API (keyed by the active collective) instead of `localStorage`; keep the same `EmailTemplate` shape and `{event}/{date}/{time}/{venue}/{collective}` token substitution so the Email Templates screen and event "Manage Communications" preview work unchanged.

Until then, templates remain a single-browser convenience (see note above).
