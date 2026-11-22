# Test Agent — Guidance & Policy

Notes for the automated testing agent (and humans) working on the Hive repo.

> ## ⚠️ Hard rule
> **make sure not MR goes through without proper test cases and coverage**
>
> Every merge request / pull request must add or update tests that cover the
> behavior it changes. An MR with new or changed logic and no corresponding
> tests must be flagged and blocked from merging.

---

## What "proper test cases and coverage" means here

- **New logic ⇒ new tests.** Any new function, route, branch, or bug fix needs
  tests that exercise it — including the failure/edge paths, not just the happy path.
- **Cover the edges.** Invalid input, auth/permission failures, blocked members,
  capacity limits, duplicate/already-used states, tampered/garbage QR payloads,
  empty lists, and token-substitution misses.
- **Security-critical code is non-negotiable.** Pass issuance, QR signing/verification,
  blocked-member enforcement, and check-in (single-use) must always have tests.
- **Keep tests deterministic and isolated.** Unit tests must not require network,
  real SMTP, or a live database. Use the dev/no-send and pure-function seams.
- **Tests must pass before merge.** A red suite blocks the MR.

## How to run the suites

| App | Command | Framework | Needs DB/server? |
|---|---|---|---|
| `backend/` | `npm test` | Node test runner (via `tsx`) | No (unit) |
| `backend/` | `npm run test:integration` | script (`src/test.ts`) | Yes — live server + DB |
| `console-app/` | `npm test` | Vitest | No |

Before approving an MR, run the relevant unit suites and confirm they pass.

## Where the seams are (write tests against these)

- **`backend/src/qr.ts`** — `generateQrToken`, `signQrToken`, `verifyQrPayload`.
  Pure crypto; test sign determinism, valid round-trip, tampered/foreign signatures,
  malformed payloads. (`backend/src/qr.test.ts`)
- **`backend/src/email.ts`** — `renderPassEmail` (HTML/text/QR/escaping) and
  `sendPassEmail` (dev no-send mode returns `{configured:false, sent:false}` and never
  throws). (`backend/src/email.test.ts`)
- **`console-app/src/templates.ts`** — `applyTemplate` token substitution,
  `DEFAULT_TEMPLATES` integrity, only-known-tokens. (`console-app/src/templates.test.ts`)

## Reviewing a change — checklist

1. Does the diff add/change behavior? If yes, are there tests for it? **If not, block the MR.**
2. Do tests cover failure + edge cases, not only the happy path?
3. For pass/QR/auth/blocked/scan changes: are the security invariants tested?
4. Do **all** unit suites pass locally/CI?
5. Is coverage maintained or improved (no silently dropped tests)?

## Adding tests

- Backend: create `src/<area>.test.ts` using `node:test` + `node:assert/strict`.
  Keep them DB-free; extract pure helpers (like `qr.ts`) when a route is hard to test.
- Console: create `src/<area>.test.ts` using Vitest (`describe/it/expect`).
- Prefer testing extracted pure functions over HTTP/DOM where possible; add an
  integration test only when the interaction itself is the thing under test.

## Reminder

**make sure not MR goes through without proper test cases and coverage.**
