# Hive — Backend Technical Design

**Version:** 1.0 · **Date:** March 2026 · **Scope:** MVP Backend (Seattle Launch)

---

## Table of Contents

1. [System Architecture](#1-system-architecture)
2. [Data Model](#2-data-model)
3. [Authentication & Authorization](#3-authentication--authorization)
4. [API Surface](#4-api-surface)
5. [Core Subsystems](#5-core-subsystems)
6. [Edge Cases & System Invariants](#6-edge-cases--system-invariants)
7. [Error Handling](#7-error-handling)
8. [Infrastructure & Deployment](#8-infrastructure--deployment)
9. [Observability](#9-observability)

---

## 1. System Architecture

### 1.1 High-Level Overview

```
┌─────────────────┐     ┌──────────────────┐
│   Hive App      │     │  Hive Console    │
│  (React Native) │     │  (Next.js / RN)  │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         │    HTTPS / JWT        │
         └───────────┬───────────┘
                     ▼
            ┌─────────────────┐
            │   API Gateway   │
            │  (Rate Limit,   │
            │   CORS, TLS)    │
            └────────┬────────┘
                     ▼
            ┌─────────────────┐
            │   Hive API      │
            │  (Fastify/TS)   │
            │  Modular Mono   │
            └──┬─────┬─────┬──┘
               │     │     │
       ┌───────┘     │     └───────┐
       ▼             ▼             ▼
 ┌───────────┐ ┌───────────┐ ┌───────────┐
 │ PostgreSQL│ │   Redis   │ │    S3     │
 │  (Data)   │ │(Cache/Q)  │ │ (Assets)  │
 └───────────┘ └───────────┘ └───────────┘
                     │
                     ▼
            ┌─────────────────┐
            │  Job Workers    │
            │  (BullMQ)       │
            │  - Notifications│
            │  - Addr Reveal  │
            │  - Cleanup      │
            └────────┬────────┘
                     │
              ┌──────┴──────┐
              ▼             ▼
        ┌──────────┐  ┌──────────┐
        │   FCM    │  │   APNs   │
        │ (Android)│  │  (iOS)   │
        └──────────┘  └──────────┘
```

A **modular monolith** is the right call for MVP. The scale target (5K users, 50 events/week) is well within a single-process API server. The module boundaries are drawn cleanly enough to extract into services later if needed — but that's a problem for post-product-market-fit, not now.

### 1.2 Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Runtime** | Node.js 22 + TypeScript 5 | Type safety, shared ecosystem with RN/Next.js frontends, fast iteration |
| **Framework** | Fastify | 2–3x faster than Express, built-in schema validation via JSON Schema, first-class TypeScript |
| **Database** | PostgreSQL 16 | Relational integrity for memberships/invites/passes, JSONB for flexible fields, recursive CTEs for invitation chains |
| **Cache / Queue** | Redis 7 + BullMQ | In-memory cache for feed/session data, reliable delayed jobs for scheduled notifications |
| **ORM** | Drizzle ORM | Type-safe, SQL-close (no magic), excellent migration tooling |
| **Auth** | JWT (access + refresh) | Stateless API auth, short-lived access tokens, long-lived refresh in DB |
| **Push** | Firebase Cloud Messaging | Unified Android + iOS push delivery |
| **Object Storage** | AWS S3 | Collective images, pass assets |
| **Hosting** | AWS (ECS Fargate + RDS + ElastiCache) | Managed, autoscaling, operational simplicity |

### 1.3 Project Structure

```
src/
├── modules/
│   ├── auth/           # signup, login, OTP, SSO, token management
│   ├── user/           # profile, preferences
│   ├── collective/     # CRUD, membership management
│   ├── event/          # CRUD, audience filters, cancellation
│   ├── pass/           # request → accept → issue → scan lifecycle
│   ├── invite/         # link generation, chain tracking, revocation
│   ├── feed/           # personalized event ranking
│   └── notification/   # push delivery, scheduling, device registry
├── shared/
│   ├── middleware/      # auth, rbac, rate-limit, app-scope
│   ├── db/             # drizzle client, migrations, connection pool
│   ├── queue/          # BullMQ setup, job definitions
│   ├── errors/         # typed error classes, error handler
│   └── utils/          # crypto, time, pagination helpers
├── workers/            # BullMQ worker processes
├── server.ts           # Fastify app bootstrap
└── config.ts           # env-based configuration
```

Each module follows a consistent internal structure:

```
modules/pass/
├── pass.routes.ts      # route definitions + schema
├── pass.handler.ts     # request handling (thin — delegates to service)
├── pass.service.ts     # business logic
├── pass.repository.ts  # data access (queries)
└── pass.types.ts       # module-specific types
```

**No cross-module repository imports.** Modules communicate through service-layer calls. This keeps the dependency graph clean and makes future extraction trivial.

---

## 2. Data Model

### 2.1 Schema

```sql
-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone           VARCHAR(20) UNIQUE,
    email           VARCHAR(255) UNIQUE,
    display_name    VARCHAR(100) NOT NULL,
    avatar_url      VARCHAR(500),
    genre_prefs     TEXT[] DEFAULT '{}',
    auth_provider   VARCHAR(20) NOT NULL,  -- 'phone', 'apple', 'google'
    sso_provider_id VARCHAR(255),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- At least one identifier must exist
ALTER TABLE users ADD CONSTRAINT users_has_identifier
    CHECK (phone IS NOT NULL OR email IS NOT NULL);

-- ============================================================
-- COLLECTIVES
-- ============================================================
CREATE TABLE collectives (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                    VARCHAR(150) NOT NULL,
    description             TEXT,
    genre_tags              TEXT[] DEFAULT '{}',
    image_url               VARCHAR(500),
    default_invite_limit    INT NOT NULL DEFAULT 2,
    invites_enabled         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- MEMBERSHIPS
-- ============================================================
CREATE TYPE membership_status AS ENUM ('pending_approval', 'active', 'removed', 'left');
CREATE TYPE membership_role   AS ENUM ('admin', 'member');

CREATE TABLE memberships (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    collective_id   UUID NOT NULL REFERENCES collectives(id),
    role            membership_role NOT NULL DEFAULT 'member',
    status          membership_status NOT NULL DEFAULT 'pending_approval',
    invite_quota    INT NOT NULL DEFAULT 0,
    invites_used    INT NOT NULL DEFAULT 0,
    invited_by_id   UUID REFERENCES users(id),
    invite_id       UUID,  -- FK added after invites table created
    joined_at       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT invites_within_quota CHECK (invites_used <= invite_quota)
);

-- Only one active or pending membership per user per collective
CREATE UNIQUE INDEX idx_membership_active
    ON memberships(user_id, collective_id)
    WHERE status IN ('active', 'pending_approval');

CREATE INDEX idx_membership_collective ON memberships(collective_id, status);
CREATE INDEX idx_membership_user       ON memberships(user_id, status);

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TYPE event_status     AS ENUM ('draft', 'published', 'cancelled');
CREATE TYPE event_visibility AS ENUM ('collective', 'invite_only');
CREATE TYPE venue_type       AS ENUM ('warehouse', 'club', 'outdoor', 'loft');

CREATE TABLE events (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    collective_id           UUID NOT NULL REFERENCES collectives(id),
    name                    VARCHAR(200) NOT NULL,
    description             TEXT,
    lineup                  JSONB DEFAULT '[]',
    genre_tags              TEXT[] DEFAULT '{}',
    venue_type              venue_type,
    visibility              event_visibility NOT NULL DEFAULT 'collective',
    address                 TEXT,
    event_start             TIMESTAMPTZ NOT NULL,
    event_end               TIMESTAMPTZ,
    address_reveal_hours    INT NOT NULL DEFAULT 3,
    max_capacity            INT,
    status                  event_status NOT NULL DEFAULT 'draft',
    issued_pass_count       INT NOT NULL DEFAULT 0,

    -- audience filters (null = no filter)
    filter_min_events       INT,
    filter_genre_tags       TEXT[],

    address_revealed        BOOLEAN NOT NULL DEFAULT FALSE,
    reminder_sent           BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT valid_capacity CHECK (max_capacity IS NULL OR max_capacity > 0),
    CONSTRAINT valid_reveal   CHECK (address_reveal_hours >= 0),
    CONSTRAINT issued_within_capacity
        CHECK (max_capacity IS NULL OR issued_pass_count <= max_capacity)
);

CREATE INDEX idx_event_collective  ON events(collective_id, status, event_start);
CREATE INDEX idx_event_start       ON events(event_start) WHERE status = 'published';

-- ============================================================
-- PASSES
-- ============================================================
CREATE TYPE pass_status AS ENUM (
    'requested', 'accepted', 'declined', 'issued', 'used', 'cancelled'
);

CREATE TABLE passes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    event_id        UUID NOT NULL REFERENCES events(id),
    status          pass_status NOT NULL DEFAULT 'requested',
    qr_token        VARCHAR(64) UNIQUE,
    qr_signature    VARCHAR(128),
    requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    accepted_at     TIMESTAMPTZ,
    declined_at     TIMESTAMPTZ,
    issued_at       TIMESTAMPTZ,
    used_at         TIMESTAMPTZ,
    cancelled_at    TIMESTAMPTZ
);

-- One active pass per user per event (excludes declined/cancelled)
CREATE UNIQUE INDEX idx_pass_user_event
    ON passes(user_id, event_id)
    WHERE status NOT IN ('declined', 'cancelled');

CREATE INDEX idx_pass_event_status ON passes(event_id, status);
CREATE INDEX idx_pass_user         ON passes(user_id, status);
CREATE INDEX idx_pass_qr           ON passes(qr_token) WHERE qr_token IS NOT NULL;

-- ============================================================
-- INVITES
-- ============================================================
CREATE TYPE invite_status AS ENUM ('pending', 'accepted', 'expired', 'revoked');
CREATE TYPE invite_type   AS ENUM ('collective', 'event');

CREATE TABLE invites (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type              invite_type NOT NULL,
    token             VARCHAR(44) NOT NULL UNIQUE,  -- 32 bytes, base64url
    sender_id         UUID NOT NULL REFERENCES users(id),
    receiver_id       UUID REFERENCES users(id),    -- null for link-based, set for direct
    collective_id     UUID NOT NULL REFERENCES collectives(id),
    event_id          UUID REFERENCES events(id),   -- set for event invites
    parent_invite_id  UUID REFERENCES invites(id),  -- invitation chain
    status            invite_status NOT NULL DEFAULT 'pending',
    expires_at        TIMESTAMPTZ NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    accepted_at       TIMESTAMPTZ,

    CONSTRAINT event_invite_has_event
        CHECK (type != 'event' OR event_id IS NOT NULL)
);

CREATE INDEX idx_invite_token      ON invites(token) WHERE status = 'pending';
CREATE INDEX idx_invite_sender     ON invites(sender_id, collective_id);
CREATE INDEX idx_invite_chain      ON invites(parent_invite_id);
CREATE INDEX idx_invite_event      ON invites(event_id) WHERE event_id IS NOT NULL;
CREATE INDEX idx_invite_receiver   ON invites(receiver_id) WHERE receiver_id IS NOT NULL;
CREATE INDEX idx_invite_expiry     ON invites(expires_at) WHERE status = 'pending';

-- Back-reference from membership to invite
ALTER TABLE memberships
    ADD CONSTRAINT fk_membership_invite
    FOREIGN KEY (invite_id) REFERENCES invites(id);

-- ============================================================
-- DEVICES (push notification tokens)
-- ============================================================
CREATE TABLE devices (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id),
    platform    VARCHAR(10) NOT NULL,  -- 'ios', 'android'
    push_token  VARCHAR(500) NOT NULL,
    app_type    VARCHAR(10) NOT NULL,  -- 'hive', 'console'
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT unique_push_token UNIQUE (push_token)
);

CREATE INDEX idx_device_user ON devices(user_id);

-- ============================================================
-- REFRESH TOKENS
-- ============================================================
CREATE TABLE refresh_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id),
    token_hash  VARCHAR(128) NOT NULL UNIQUE,
    app_type    VARCHAR(10) NOT NULL,  -- 'hive', 'console'
    device_id   VARCHAR(255),
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_user ON refresh_tokens(user_id) WHERE revoked = FALSE;

-- ============================================================
-- NOTIFICATION LOG (audit trail, dedup)
-- ============================================================
CREATE TABLE notification_log (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    event_id        UUID REFERENCES events(id),
    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(200) NOT NULL,
    body            TEXT NOT NULL,
    delivered       BOOLEAN NOT NULL DEFAULT FALSE,
    read            BOOLEAN NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notif_user ON notification_log(user_id, created_at DESC);
```

### 2.2 Key Design Decisions

**Why `issued_pass_count` is denormalized on `events`:**
Counting issued passes via `SELECT COUNT(*)` under contention creates lock storms. A denormalized counter allows atomic capacity checks via `UPDATE events SET issued_pass_count = issued_pass_count + 1 WHERE id = $1 AND (max_capacity IS NULL OR issued_pass_count < max_capacity)`. If zero rows are returned, the event is full. The counter and pass insert happen in the same transaction to maintain consistency.

**Why `invite_quota` lives on `memberships`:**
Invites are per-member-per-collective. Putting the quota on the membership row avoids a join and allows atomic quota decrement: `UPDATE memberships SET invites_used = invites_used + 1 WHERE id = $1 AND invites_used < invite_quota`. The database constraint `invites_used <= invite_quota` is the hard safety net.

**Why partial unique indexes:**
A user can leave and later rejoin a collective (new membership row). The partial unique index on `(user_id, collective_id) WHERE status IN ('active', 'pending_approval')` allows historical records while preventing duplicate active memberships. Same pattern for passes — one active pass per user per event.

**Why `TEXT[]` over `JSONB` for genre tags:**
Genre tags are simple string arrays with no nested structure. `TEXT[]` supports GIN indexing, array overlap operators (`&&`), and is more ergonomic for the common queries (filter, match-count). JSONB is reserved for `lineup` where the structure is richer (artist name, set time, etc.).

---

## 3. Authentication & Authorization

### 3.1 Auth Flows

**Member Sign-Up (Hive App)**
```
1. User taps invite link → deep link opens Hive app
2. App sends invite token to API → API validates invite (not expired, not used)
3. App presents sign-up screen (phone OTP or Apple/Google SSO)
4. POST /auth/signup → creates user → returns pending invite context
5. POST /invites/:token/accept → accepts invite, creates membership
6. App routes to preference setup (US-1.2)
```

**Organizer Sign-Up (Console)**
```
1. Organizer navigates to Console sign-up
2. POST /auth/signup (phone or email+password)
3. User created → routed to collective creation flow
4. POST /collectives → creates collective, auto-assigns admin role
```

**Login**
```
1. POST /auth/login/phone → sends OTP via Twilio
2. POST /auth/verify-otp → validates OTP → returns access + refresh tokens
   OR
1. POST /auth/login/sso → validates Apple/Google ID token → returns tokens
```

### 3.2 Token Strategy

| Token | Lifetime | Storage | Purpose |
|---|---|---|---|
| **Access token** (JWT) | 15 minutes | Client memory only | API request auth |
| **Refresh token** | 30 days | Hashed in `refresh_tokens` table, secure storage on client | Silent token renewal |

**JWT Claims:**
```json
{
  "sub": "user-uuid",
  "app": "hive | console",
  "iat": 1711234567,
  "exp": 1711235467
}
```

The `app` claim scopes the token to either the member app or console. Middleware validates that console-only endpoints receive console-scoped tokens and vice versa.

**Refresh token rotation:** Each refresh grants a new access + refresh pair and invalidates the old refresh token. If a revoked refresh token is used (replay attack), all refresh tokens for that user are invalidated, forcing re-login on all devices.

### 3.3 Role-Based Access Control

Authorization is **contextual** — it depends on the user's role within a specific collective, not a global role.

```typescript
type Permission =
  | 'collective:manage'       // edit collective settings, manage members
  | 'collective:invite'       // generate invites (quota-gated for members)
  | 'event:create'
  | 'event:edit'
  | 'event:cancel'
  | 'pass:review'             // accept/decline/issue passes
  | 'pass:scan'               // scan QR at door
  | 'invite:revoke'
  | 'analytics:view';

const ROLE_PERMISSIONS: Record<MembershipRole, Permission[]> = {
  admin: [
    'collective:manage', 'collective:invite',
    'event:create', 'event:edit', 'event:cancel',
    'pass:review', 'pass:scan',
    'invite:revoke', 'analytics:view'
  ],
  member: [
    'collective:invite'  // subject to quota + invites_enabled check
  ]
};
```

**Middleware chain for protected routes:**
```
authenticate → resolveCollective → requireRole(admin) → handler
```

`resolveCollective` extracts the collective ID from the route (or from the related resource, e.g., an event's collective), loads the user's membership, and attaches the role to the request context. If no active membership exists, the request is rejected with `403`.

---

## 4. API Surface

### 4.1 Conventions

- **Base path:** `/api/v1`
- **Auth:** `Authorization: Bearer <access_token>` on all endpoints except invite resolution and public auth
- **Pagination:** Cursor-based (`?cursor=<opaque>&limit=20`). Offset pagination on admin lists where total count matters.
- **Responses:** `{ data: T }` on success, `{ error: { code: string, message: string, details?: any } }` on failure
- **Timestamps:** ISO 8601 with timezone (UTC)
- **IDs:** UUIDv4

### 4.2 Endpoints

#### Auth

| Method | Path | Auth | App | Description |
|---|---|---|---|---|
| `POST` | `/auth/signup` | None | Both | Create account (phone OTP or SSO) |
| `POST` | `/auth/send-otp` | None | Both | Send OTP to phone number |
| `POST` | `/auth/verify-otp` | None | Both | Verify OTP, return tokens |
| `POST` | `/auth/sso` | None | Both | Validate SSO token, return tokens |
| `POST` | `/auth/refresh` | Refresh token | Both | Rotate tokens |
| `POST` | `/auth/logout` | Access | Both | Revoke refresh token |

#### Collectives

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/collectives` | Console | — | Create collective (caller becomes admin) |
| `GET` | `/collectives/:id` | Both | Member+ | Get collective details |
| `PATCH` | `/collectives/:id` | Console | Admin | Update collective settings |
| `GET` | `/collectives/:id/members` | Console | Admin | List members (paginated, filterable) |
| `PATCH` | `/collectives/:cid/members/:uid` | Console | Admin | Update role, grant invite quota |
| `DELETE` | `/collectives/:cid/members/:uid` | Console | Admin | Remove member |
| `POST` | `/collectives/:cid/members/:uid/approve` | Console | Admin | Approve pending member |
| `POST` | `/collectives/:cid/members/:uid/decline` | Console | Admin | Decline pending member |
| `GET` | `/collectives/mine` | Hive | Member | List my collectives |
| `POST` | `/collectives/:id/leave` | Hive | Member | Leave collective |

#### Events

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/collectives/:id/events` | Console | Admin | Create event |
| `GET` | `/collectives/:id/events` | Console | Admin | List collective's events |
| `GET` | `/events/:id` | Both | Member+ | Get event details (address redacted until reveal) |
| `PATCH` | `/events/:id` | Console | Admin | Update event |
| `POST` | `/events/:id/publish` | Console | Admin | Publish draft event |
| `POST` | `/events/:id/cancel` | Console | Admin | Cancel event |
| `POST` | `/events/:id/preview-audience` | Console | Admin | Count members passing filters |

#### Passes

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/events/:id/passes/request` | Hive | Member | Request a pass |
| `GET` | `/events/:id/passes` | Console | Admin | List pass requests for event |
| `GET` | `/passes/mine` | Hive | — | My upcoming + past passes |
| `GET` | `/passes/:id` | Both | Owner/Admin | Pass details (includes QR when issued) |
| `POST` | `/passes/:id/accept` | Console | Admin | Accept pass request |
| `POST` | `/passes/:id/decline` | Console | Admin | Decline pass request |
| `POST` | `/passes/:id/issue` | Console | Admin | Issue pass (generates QR, sends push) |
| `POST` | `/passes/scan` | Console | Admin | Scan QR token at gate |
| `GET` | `/passes/:id/wallet` | Hive | Owner | Download Apple/Google wallet pass |

#### Invites

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `POST` | `/collectives/:id/invites` | Both | Member+ | Generate collective invite link |
| `POST` | `/events/:id/invites` | Both | Member+ | Generate event invite link |
| `GET` | `/invites/:token` | None | — | Resolve invite (public, pre-auth) |
| `POST` | `/invites/:token/accept` | Access | — | Accept invite |
| `GET` | `/collectives/:id/invite-chain` | Console | Admin | View invitation tree |
| `POST` | `/invites/:id/revoke` | Console | Admin | Revoke invite + cascade |

#### Feed

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/feed` | Hive | Personalized, ranked event feed |

#### Profile

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/profile` | Both | My profile + stats |
| `PATCH` | `/profile` | Both | Update display name, avatar |
| `PUT` | `/profile/preferences` | Hive | Set genre preferences |

#### Notifications & Devices

| Method | Path | Auth | Description |
|---|---|---|---|
| `PUT` | `/devices` | Both | Register/update push token |
| `DELETE` | `/devices/:id` | Both | Unregister push token |
| `GET` | `/notifications` | Both | Notification history |
| `POST` | `/notifications/:id/read` | Both | Mark as read |

#### Analytics (Console)

| Method | Path | Auth | Role | Description |
|---|---|---|---|---|
| `GET` | `/events/:id/analytics` | Console | Admin | Anonymized post-event data |
| `GET` | `/collectives/:id/analytics` | Console | Admin | Collective-level aggregate stats |

---

## 5. Core Subsystems

### 5.1 Invitation Engine

The invitation system is the backbone of Hive's growth model. It handles three responsibilities: link generation, chain tracking, and quota enforcement.

#### Link Generation

```typescript
async function createInvite(params: {
  senderId: string;
  collectiveId: string;
  eventId?: string;
  type: 'collective' | 'event';
  expiresInHours?: number;
}): Promise<Invite> {

  const membership = await getMembership(params.senderId, params.collectiveId);

  // Admin bypass: no quota check, no invites_enabled check
  if (membership.role !== 'admin') {
    const collective = await getCollective(params.collectiveId);
    if (!collective.invites_enabled) {
      throw new ForbiddenError('INVITES_FROZEN');
    }

    // Atomic quota decrement — fails if quota exhausted
    const updated = await db.update(memberships)
      .set({ invites_used: sql`invites_used + 1` })
      .where(and(
        eq(memberships.id, membership.id),
        lt(memberships.invites_used, memberships.invite_quota)
      ))
      .returning();

    if (updated.length === 0) {
      throw new ForbiddenError('INVITE_QUOTA_EXHAUSTED');
    }
  }

  const token = generateSecureToken(32); // 32 bytes → base64url

  return db.insert(invites).values({
    type: params.type,
    token,
    sender_id: params.senderId,
    collective_id: params.collectiveId,
    event_id: params.eventId ?? null,
    expires_at: hoursFromNow(params.expiresInHours ?? 72),
  }).returning();
}
```

**Invite link format:** `https://hive.app/i/{token}`

Deep link resolution: app installed → open directly; not installed → App Store redirect with deferred deep link state.

#### Acceptance Flow

```typescript
async function acceptInvite(token: string, userId: string): Promise<void> {
  const invite = await db.select()
    .from(invites)
    .where(and(
      eq(invites.token, token),
      eq(invites.status, 'pending'),
      gt(invites.expires_at, now())
    ))
    .forUpdate()  // lock to prevent double-accept race
    .first();

  if (!invite) throw new NotFoundError('INVITE_INVALID_OR_EXPIRED');

  await db.transaction(async (tx) => {
    // Mark invite as accepted
    await tx.update(invites)
      .set({ status: 'accepted', receiver_id: userId, accepted_at: now() })
      .where(eq(invites.id, invite.id));

    // Determine membership status based on sender's role
    const senderMembership = await getMembership(invite.sender_id, invite.collective_id);
    const autoApprove = senderMembership.role === 'admin';
    const collective = await tx.select().from(collectives)
      .where(eq(collectives.id, invite.collective_id)).first();

    await tx.insert(memberships).values({
      user_id: userId,
      collective_id: invite.collective_id,
      status: autoApprove ? 'active' : 'pending_approval',
      joined_at: autoApprove ? now() : null,
      invite_quota: collective.default_invite_limit,
      invited_by_id: invite.sender_id,
      invite_id: invite.id,
    }).onConflictDoNothing(); // partial unique index handles duplicates

    // For event invites: grant visibility (the accepted invite itself serves as proof)
    // No additional table needed — feed query checks for accepted event invites
  });
}
```

#### Chain Tracking (Recursive CTE)

```sql
-- Get full invitation tree for a collective (or event)
WITH RECURSIVE chain AS (
    -- Root invites (no parent — sent by admins or first-gen members)
    SELECT id, sender_id, receiver_id, parent_invite_id, 0 AS depth
    FROM invites
    WHERE collective_id = $1 AND parent_invite_id IS NULL

    UNION ALL

    SELECT i.id, i.sender_id, i.receiver_id, i.parent_invite_id, c.depth + 1
    FROM invites i
    JOIN chain c ON i.parent_invite_id = c.id
)
SELECT
    chain.*,
    u_sender.display_name AS sender_name,
    u_receiver.display_name AS receiver_name
FROM chain
LEFT JOIN users u_sender ON u_sender.id = chain.sender_id
LEFT JOIN users u_receiver ON u_receiver.id = chain.receiver_id
ORDER BY depth, chain.id;
```

When a member generates an invite, `parent_invite_id` is set to the invite that originally brought them into the collective (stored on their membership record). This automatically forms the tree.

#### Cascade Revocation

```sql
WITH RECURSIVE descendants AS (
    SELECT id FROM invites WHERE id = $1
    UNION ALL
    SELECT i.id FROM invites i JOIN descendants d ON i.parent_invite_id = d.id
)
UPDATE invites
SET status = 'revoked'
WHERE id IN (SELECT id FROM descendants)
  AND status = 'pending';
```

Only pending invites are revoked. Already-accepted invites (and their resulting memberships) are flagged for admin review but not automatically removed — that's a deliberate human decision.

---

### 5.2 Pass Lifecycle & Capacity Control

#### State Machine

```
                ┌──────────┐
                │ requested│
                └────┬─────┘
                     │
              ┌──────┴──────┐
              ▼              ▼
        ┌──────────┐  ┌──────────┐
        │ accepted │  │ declined │ (terminal)
        └────┬─────┘  └──────────┘
             │
             ▼
        ┌──────────┐
        │  issued  │──────────┐
        └────┬─────┘          │
             │                ▼
             ▼          ┌──────────┐
        ┌──────────┐    │cancelled │ (terminal, via event cancel)
        │   used   │    └──────────┘
        └──────────┘ (terminal)
```

**Valid transitions:**
| From | To | Trigger |
|---|---|---|
| `requested` | `accepted` | Admin accepts request |
| `requested` | `declined` | Admin declines request |
| `accepted` | `issued` | Admin issues pass (after external vetting) |
| `issued` | `used` | QR scan at door |
| `issued` | `cancelled` | Event cancelled |
| `requested`/`accepted` | `cancelled` | Event cancelled |

Any other transition is rejected.

#### Pass Request

```typescript
async function requestPass(userId: string, eventId: string): Promise<Pass> {
  const event = await getPublishedEvent(eventId);

  // Verify user can see this event (member of collective + passes audience filters)
  await assertEventAccess(userId, event);

  // Soft capacity check (informational — hard check is at issuance)
  if (event.max_capacity && event.issued_pass_count >= event.max_capacity) {
    throw new ConflictError('EVENT_AT_CAPACITY');
  }

  // Insert (unique index prevents duplicates)
  const pass = await db.insert(passes).values({
    user_id: userId,
    event_id: eventId,
    status: 'requested',
  }).returning();

  // Notify collective admins
  await notifyAdmins(event.collective_id, {
    type: 'pass_requested',
    eventId, userId,
  });

  return pass;
}
```

#### Pass Issuance (Capacity-Safe)

```typescript
async function issuePass(passId: string, adminId: string): Promise<Pass> {
  return db.transaction(async (tx) => {
    const pass = await tx.select().from(passes)
      .where(eq(passes.id, passId))
      .forUpdate()
      .first();

    if (!pass || pass.status !== 'accepted') {
      throw new ConflictError('PASS_NOT_IN_ACCEPTED_STATE');
    }

    // Atomic capacity check + increment
    const updated = await tx.update(events)
      .set({ issued_pass_count: sql`issued_pass_count + 1` })
      .where(and(
        eq(events.id, pass.event_id),
        or(
          isNull(events.max_capacity),
          lt(events.issued_pass_count, events.max_capacity)
        )
      ))
      .returning();

    if (updated.length === 0) {
      throw new ConflictError('EVENT_AT_CAPACITY');
    }

    // Generate QR credentials
    const qrToken = generateSecureToken(32);
    const qrSignature = hmacSha256(qrToken, config.QR_SECRET);

    const issuedPass = await tx.update(passes)
      .set({
        status: 'issued',
        qr_token: qrToken,
        qr_signature: qrSignature,
        issued_at: now(),
      })
      .where(eq(passes.id, passId))
      .returning();

    // Push notification to pass holder
    await pushQueue.add('pass_issued', {
      userId: pass.user_id,
      eventId: pass.event_id,
      passId: pass.id,
    });

    return issuedPass;
  });
}
```

The capacity check and counter increment are **a single atomic UPDATE**. If two admins issue the last pass simultaneously, only one succeeds — the other gets `EVENT_AT_CAPACITY`. No explicit locks needed beyond PostgreSQL's row-level update lock.

---

### 5.3 Feed Ranking & Audience Filtering

The feed serves published, upcoming events from the user's collectives, filtered by audience rules and ranked by relevance.

#### Query Structure

```sql
SELECT
    e.*,
    c.name AS collective_name,
    c.image_url AS collective_image,

    -- Genre match score: count of overlapping tags
    COALESCE(array_length(
        ARRAY(SELECT unnest(e.genre_tags) INTERSECT SELECT unnest($2::text[])),
        1
    ), 0) AS genre_match_count,

    -- Time proximity (events sooner score higher)
    EXTRACT(EPOCH FROM (e.event_start - now())) AS seconds_until

FROM events e
JOIN collectives c ON c.id = e.collective_id
JOIN memberships m ON m.collective_id = c.id
    AND m.user_id = $1
    AND m.status = 'active'

WHERE e.status = 'published'
  AND e.event_start > now()

  -- Visibility: collective events always shown; invite-only only if user has accepted invite
  AND (
      e.visibility = 'collective'
      OR EXISTS (
          SELECT 1 FROM invites i
          WHERE i.event_id = e.id
            AND i.receiver_id = $1
            AND i.status = 'accepted'
      )
  )

  -- Audience filter: minimum events attended
  AND (
      e.filter_min_events IS NULL
      OR (SELECT count(*) FROM passes p
          WHERE p.user_id = $1 AND p.status = 'used') >= e.filter_min_events
  )

  -- Audience filter: genre affinity
  AND (
      e.filter_genre_tags IS NULL
      OR e.filter_genre_tags && $2::text[]  -- overlap operator
  )

ORDER BY
    genre_match_count DESC,
    seconds_until ASC

LIMIT $3 OFFSET $4;
```

**Parameters:** `$1` = user_id, `$2` = user's genre_prefs, `$3` = limit, `$4` = offset

#### Ranking Formula (Computed Application-Side)

For MVP, the SQL ordering (genre match count descending, then chronological) is sufficient. If needed, a weighted score can be computed:

```
score = (genre_match_count / max(total_event_tags, 1)) × 0.5
      + (1 - min(hours_until / 168, 1)) × 0.3           // 168h = 1 week
      + (is_from_primary_collective ? 0.2 : 0)
```

This lives in the service layer, not the database. Keeps the query simple and the ranking tunable without migrations.

#### Preview Audience Count

For `POST /events/:id/preview-audience`, run the same WHERE clause (minus the user-specific join) and return `COUNT(DISTINCT m.user_id)` — lets the organizer see reach before publishing.

---

### 5.4 Notification Scheduler

Notifications fall into two categories: **immediate** (event-driven) and **scheduled** (time-based).

#### Immediate Notifications

Dispatched via BullMQ jobs pushed to the `notifications` queue:

| Trigger | Recipients | Message |
|---|---|---|
| Event published | Eligible collective members | `"{Collective} just dropped: {Event}"` |
| Pass requested | Collective admins | `"New pass request for {Event}"` |
| Pass issued | Pass holder | `"Your pass for {Event} is confirmed"` |
| Pass declined | Pass holder | `"Pass update for {Event}"` |
| Event cancelled | All pass holders (non-terminal) | `"{Event} has been cancelled"` |
| Membership approved | Member | `"Welcome to {Collective}"` |

#### Scheduled Notifications

Managed via **BullMQ delayed jobs**, scheduled when an event is published:

**Address Reveal:**
```typescript
async function scheduleAddressReveal(event: Event): Promise<void> {
  const revealAt = subHours(event.event_start, event.address_reveal_hours);
  const delay = Math.max(0, revealAt.getTime() - Date.now());

  await notificationQueue.add('address_reveal', {
    eventId: event.id,
  }, {
    delay,
    jobId: `addr-reveal-${event.id}`,  // dedup key
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  });
}
```

**Event Reminder (24h before):**
```typescript
await notificationQueue.add('event_reminder', {
  eventId: event.id,
}, {
  delay: event.event_start.getTime() - 24 * 60 * 60 * 1000 - Date.now(),
  jobId: `reminder-${event.id}`,
  attempts: 3,
  backoff: { type: 'exponential', delay: 5000 },
});
```

#### Reliability: Belt and Suspenders

Address reveal is the **highest-priority job** (per NFRs). BullMQ delayed jobs are reliable, but not infallible (Redis restart, clock skew). A sweep worker runs every 5 minutes as backup:

```typescript
async function sweepMissedReveals(): Promise<void> {
  const events = await db.select().from(events_table)
    .where(and(
      eq(events_table.status, 'published'),
      eq(events_table.address_revealed, false),
      lte(
        sql`event_start - (address_reveal_hours || ' hours')::interval`,
        now()
      )
    ));

  for (const event of events) {
    await processAddressReveal(event.id);
  }
}
```

The `processAddressReveal` function is **idempotent** — it checks `address_revealed` inside a transaction before sending notifications and flipping the flag. Double-execution is safe.

#### Rescheduling on Event Edit

When an organizer changes event time or reveal hours:
1. Remove existing delayed jobs by `jobId` pattern
2. Reschedule with new timing
3. If the new reveal time is already past, trigger immediately

---

### 5.5 QR Gate Scanner

#### QR Payload

```
{qr_token}:{qr_signature}
```

- `qr_token`: 32 random bytes, base64url encoded (43 chars)
- `qr_signature`: HMAC-SHA256(qr_token, server_secret), hex encoded

The signature prevents forged QR codes. Even if someone guesses a token format, they can't produce a valid signature without the server secret.

#### Scan Flow

```typescript
async function scanPass(qrPayload: string): Promise<ScanResult> {
  const [qrToken, providedSig] = qrPayload.split(':');

  // 1. Verify signature
  const expectedSig = hmacSha256(qrToken, config.QR_SECRET);
  if (!timingSafeEqual(providedSig, expectedSig)) {
    return { valid: false, reason: 'INVALID_QR' };
  }

  // 2. Look up pass
  const pass = await db.select().from(passes)
    .where(eq(passes.qr_token, qrToken))
    .first();

  if (!pass) return { valid: false, reason: 'PASS_NOT_FOUND' };

  // 3. Check status
  if (pass.status === 'used') {
    return {
      valid: false,
      reason: 'ALREADY_SCANNED',
      scanned_at: pass.used_at,
    };
  }

  if (pass.status !== 'issued') {
    return { valid: false, reason: 'PASS_NOT_VALID', status: pass.status };
  }

  // 4. Mark as used (atomic)
  const updated = await db.update(passes)
    .set({ status: 'used', used_at: now() })
    .where(and(
      eq(passes.id, pass.id),
      eq(passes.status, 'issued')  // double-check prevents race
    ))
    .returning();

  if (updated.length === 0) {
    return { valid: false, reason: 'ALREADY_SCANNED' };
  }

  const user = await db.select({ display_name: users.display_name })
    .from(users).where(eq(users.id, pass.user_id)).first();

  return {
    valid: true,
    member_name: user.display_name,
    event_id: pass.event_id,
  };
}
```

The `WHERE status = 'issued'` on the UPDATE ensures that concurrent scans (two gates, same QR) don't both succeed. Only the first scan returns `valid: true`.

#### Offline Resilience

For MVP (single-venue, reliable connectivity), real-time validation is sufficient. If offline scanning becomes a requirement post-MVP, a signed JWT embedded in the QR code can enable offline validation with a time-bounded trust window.

---

### 5.6 Wallet Pass Generation

#### Apple Wallet (PKPass)

The API generates `.pkpass` bundles on-demand:
1. Build pass JSON payload (event name, date, QR barcode, collective branding)
2. Sign with Apple WWDR certificate + pass type certificate
3. Package as `.pkpass` ZIP
4. Return as `application/vnd.apple.pkpass` response

Library: `passkit-generator` (Node.js)

#### Google Wallet

1. Create a pass class (per-collective template) via Google Wallet API
2. Create a pass object (per-issued-pass) with event details + QR barcode
3. Return a "Save to Google Wallet" JWT link

Both wallet types include the QR code and event details. Address is injected via a **push update** to the wallet pass when the address is revealed — both Apple and Google Wallet APIs support pass updates.

---

## 6. Edge Cases & System Invariants

### 6.1 Capacity Race Condition
**Scenario:** 10 admins try to issue the last pass simultaneously.
**Protection:** Atomic `UPDATE events SET issued_pass_count = issued_pass_count + 1 WHERE issued_pass_count < max_capacity`. Only one UPDATE succeeds per available slot. Others receive `EVENT_AT_CAPACITY`.

### 6.2 Double Pass Request
**Scenario:** User taps "Request Pass" twice quickly.
**Protection:** Partial unique index `(user_id, event_id) WHERE status NOT IN ('declined', 'cancelled')` rejects the duplicate insert with a unique constraint violation, caught and returned as a `409 Conflict`.

### 6.3 Double QR Scan
**Scenario:** Gate attendant scans the same QR twice (or two attendants scan the same screenshot).
**Protection:** `UPDATE passes SET status = 'used' WHERE id = $1 AND status = 'issued'` — only the first scan returns rows. Second scan returns `ALREADY_SCANNED` with the timestamp of first scan.

### 6.4 Invite Used After Expiry
**Scenario:** User clicks an invite link that expired 1 minute ago.
**Protection:** `WHERE status = 'pending' AND expires_at > now()` in the acceptance query. Expired invites fail with `INVITE_EXPIRED`. The periodic cleanup job marks stale invites as `expired`.

### 6.5 Last Admin Cannot Leave
**Scenario:** The only admin of a collective tries to leave or demote themselves.
**Protection:** Before processing admin departure or role change, count remaining admins. If this would leave zero admins, reject with `LAST_ADMIN_CANNOT_LEAVE`. The admin must first promote another member.

```typescript
async function assertNotLastAdmin(collectiveId: string, userId: string): Promise<void> {
  const adminCount = await db.select({ count: sql<number>`count(*)` })
    .from(memberships)
    .where(and(
      eq(memberships.collective_id, collectiveId),
      eq(memberships.role, 'admin'),
      eq(memberships.status, 'active'),
      ne(memberships.user_id, userId)
    ));

  if (adminCount[0].count === 0) {
    throw new ConflictError('LAST_ADMIN_CANNOT_LEAVE');
  }
}
```

### 6.6 Event Cancellation Cascade
**Scenario:** Organizer cancels an event with 200 issued passes.
**Flow:**
1. Set event status to `cancelled`
2. Bulk update all non-terminal passes (`requested`, `accepted`, `issued`) to `cancelled`
3. Reset `issued_pass_count` to 0
4. Remove scheduled notification jobs
5. Enqueue push notifications to all affected pass holders (batched)
6. All in one transaction (except push delivery, which is async via queue)

### 6.7 Member Removed — Pass Cleanup
**Scenario:** Admin removes a member who has a pending pass request for an upcoming event.
**Flow:** When a membership is set to `removed`, cancel all `requested` and `accepted` passes for that user across the collective's events. Issued passes are preserved (the member already passed vetting) but flagged for admin review.

### 6.8 Invite Quota Refund
**Scenario:** A member sends an invite, but the invite expires unused. Should the quota be refunded?
**Decision:** No refund on expiry. Invites are a scarce social resource — sending one is a deliberate act. Admins can grant more invites at any time. This keeps the system simpler and incentivizes members to send invites to people who will actually accept.

### 6.9 Concurrent Invite Acceptance
**Scenario:** A link-based invite is opened in two browsers simultaneously.
**Protection:** `SELECT ... FOR UPDATE` on the invite row during acceptance. The first transaction accepts the invite; the second finds `status != 'pending'` and fails gracefully.

### 6.10 Event Time Change — Notification Reschedule
**Scenario:** Organizer moves event from Saturday 10 PM to Sunday 2 AM.
**Flow:** On event update, if `event_start` or `address_reveal_hours` changed:
1. Cancel existing BullMQ delayed jobs by jobId
2. Recalculate reveal time and reminder time
3. If new reveal time is in the past and `address_revealed` is still false → trigger reveal immediately
4. Reschedule with new delays

### 6.11 Address Field Redaction
**Scenario:** Member queries event details before reveal time.
**Protection:** The `GET /events/:id` handler checks `address_revealed` flag. If false, the `address` field is nulled out in the response, replaced with `address_available_at: <reveal_timestamp>`. The field is only populated when the flag is true OR the requester is a collective admin.

---

## 7. Error Handling

### 7.1 Error Response Format

```json
{
  "error": {
    "code": "EVENT_AT_CAPACITY",
    "message": "This event has reached maximum capacity.",
    "details": {
      "max_capacity": 200,
      "issued": 200
    }
  }
}
```

### 7.2 Error Code Taxonomy

| HTTP | Code | When |
|---|---|---|
| `400` | `VALIDATION_ERROR` | Request body/params fail schema validation |
| `401` | `TOKEN_EXPIRED` | Access token expired — client should refresh |
| `401` | `TOKEN_INVALID` | Token malformed or signature invalid |
| `403` | `INSUFFICIENT_ROLE` | User lacks required role for this action |
| `403` | `INVITES_FROZEN` | Collective has disabled invites |
| `403` | `INVITE_QUOTA_EXHAUSTED` | Member has no remaining invites |
| `403` | `EVENT_NOT_VISIBLE` | User doesn't meet audience filters |
| `404` | `NOT_FOUND` | Resource doesn't exist or user can't access it |
| `409` | `DUPLICATE_PASS_REQUEST` | User already has an active pass for this event |
| `409` | `EVENT_AT_CAPACITY` | No more passes can be issued |
| `409` | `LAST_ADMIN_CANNOT_LEAVE` | Would leave collective with no admin |
| `409` | `INVALID_STATE_TRANSITION` | Pass/invite not in expected state |
| `410` | `INVITE_EXPIRED` | Invite link has expired |
| `429` | `RATE_LIMITED` | Too many requests |

### 7.3 Global Error Handler

```typescript
app.setErrorHandler((error: AppError | Error, request, reply) => {
  if (error instanceof AppError) {
    return reply.status(error.httpStatus).send({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  }

  // Unexpected errors — log full stack, return generic message
  request.log.error(error);
  return reply.status(500).send({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred.',
    },
  });
});
```

---

## 8. Infrastructure & Deployment

### 8.1 AWS Architecture

```
                    ┌─────────────┐
                    │ CloudFront  │  (CDN for S3 assets)
                    └──────┬──────┘
                           │
┌──────────────┐    ┌──────┴──────┐
│    Route53   │───▶│     ALB     │  (TLS termination, routing)
└──────────────┘    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
    ┌──────────────────┐    ┌──────────────────┐
    │  ECS Fargate     │    │  ECS Fargate     │
    │  (API Service)   │    │  (Worker Service) │
    │  2 tasks min     │    │  1 task min       │
    └────────┬─────────┘    └────────┬─────────┘
             │                       │
     ┌───────┴───────┐       ┌──────┴──────┐
     ▼               ▼       ▼             │
┌─────────┐  ┌───────────┐  │             │
│ RDS PG  │  │ElastiCache│◀─┘             │
│(Primary │  │  (Redis)  │                │
│+Read Rep│  └───────────┘                │
│ licable)│                               │
└─────────┘               ┌───────────────┘
                          ▼
                    ┌───────────┐
                    │    S3     │
                    │ (Assets)  │
                    └───────────┘
```

### 8.2 Environment Configuration

| Config | Dev | Staging | Production |
|---|---|---|---|
| API replicas | 1 | 2 | 2 (auto-scale to 4) |
| Worker replicas | 1 | 1 | 1 (auto-scale to 2) |
| PostgreSQL | db.t4g.medium | db.t4g.medium | db.r6g.large (Multi-AZ) |
| Redis | cache.t4g.micro | cache.t4g.small | cache.r6g.large |
| Auto-scaling trigger | — | — | CPU > 70% for 3 min |

### 8.3 Database Strategy

**Migrations:** Managed via Drizzle Kit. Run as a pre-deployment step in the CI/CD pipeline (not at app startup). Migrations are forward-only; rollbacks are new migrations.

**Connection pooling:** Drizzle over `pg` with a pool of 20 connections per API instance. Workers get a separate pool of 5.

**Read replica:** Available for analytics queries and feed generation if the primary shows read contention. For MVP, primary handles everything.

### 8.4 Rate Limiting

Implemented via Redis sliding window:

| Endpoint Pattern | Limit | Window |
|---|---|---|
| `/auth/send-otp` | 5 | 15 min |
| `/auth/verify-otp` | 10 | 15 min |
| `POST /*/passes/request` | 10 | 1 hour |
| `POST /*/invites` | 20 | 1 hour |
| General API | 200 | 1 min |

### 8.5 Security Checklist

- [ ] TLS everywhere (ALB terminates, internal traffic within VPC)
- [ ] JWT secret rotated quarterly, old tokens honored until expiry
- [ ] QR HMAC secret stored in AWS Secrets Manager, never in code
- [ ] Phone numbers and emails hashed at rest for analytics (raw only in `users` table)
- [ ] No PII in logs — request logging redacts auth headers and phone numbers
- [ ] SQL injection prevention via parameterized queries (Drizzle enforces this)
- [ ] CORS restricted to Hive app domains and Console origin
- [ ] Helmet.js headers (CSP, HSTS, X-Frame-Options)
- [ ] Dependency audit via `npm audit` in CI

---

## 9. Observability

### 9.1 Structured Logging

Every request logs:
```json
{
  "level": "info",
  "timestamp": "2026-03-23T19:45:00.000Z",
  "request_id": "req-abc123",
  "method": "POST",
  "path": "/api/v1/passes/scan",
  "user_id": "usr-xyz",
  "app_type": "console",
  "status": 200,
  "latency_ms": 45
}
```

Business-critical operations log additional context:
- Pass issuance: `event_id`, `issued_count`, `max_capacity`
- Address reveal: `event_id`, `pass_holders_notified`
- Invite acceptance: `invite_id`, `chain_depth`

### 9.2 Key Metrics (CloudWatch + Prometheus)

| Metric | Type | Alert Threshold |
|---|---|---|
| `api.request.latency_p99` | Histogram | > 2000ms for 5 min |
| `api.request.error_rate` | Counter | > 5% of requests for 5 min |
| `pass.issued.total` | Counter | — (dashboard) |
| `pass.scan.success_rate` | Gauge | < 95% (indicates QR issues) |
| `notification.address_reveal.delay_ms` | Histogram | > 60000ms (reveal >1 min late) |
| `notification.delivery.failure_rate` | Counter | > 10% for 10 min |
| `queue.depth` | Gauge | > 1000 jobs for 5 min |
| `db.connection_pool.waiting` | Gauge | > 5 for 1 min |

### 9.3 Health Checks

**`GET /health`** (no auth): Returns 200 if the API process is running.

**`GET /health/ready`** (no auth): Returns 200 only if:
- PostgreSQL connection pool has available connections
- Redis is reachable
- Returns 503 otherwise (ALB drains traffic)

### 9.4 Tracing

Distributed tracing via OpenTelemetry. Each request gets a `trace_id` propagated through service calls and queue jobs. Critical for debugging notification delivery chains:

```
API Request → Queue Job → FCM Call → Delivery Receipt
```

All linked by the same trace ID.

---

## Appendix A: Glossary

| Term | Definition |
|---|---|
| **Collective** | An organizer-managed community (music crew, promoter group) |
| **Membership** | The relationship between a user and a collective, including their role |
| **Pass** | A digital ticket-like object for an event, following the request → issue → scan lifecycle |
| **Invitation chain** | The tree of invites tracing how each member/attendee discovered the collective or event |
| **Address reveal** | The timed release of an event's venue address to pass holders |
| **Audience filter** | Organizer-defined criteria that restrict which members can see an event |

## Appendix B: Future Considerations (Post-MVP)

These are explicitly out of scope but the design accommodates them without rearchitecture:

- **Recurring events:** Add `event_series` table; events reference a series. No schema breaks.
- **In-app payments:** Add `payment` table linked to passes. The `accepted → issued` gap was designed for exactly this handoff.
- **Multi-city:** Add `city` to collectives and events. Feed query adds a city filter.
- **Algorithmic trust scoring:** The invitation chain data and attendance history already provide the inputs. Add a computed `trust_score` column to memberships.
- **Real-time features (chat, live updates):** Add WebSocket gateway (separate service). The modular monolith doesn't need to change.
