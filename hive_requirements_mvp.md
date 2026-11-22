Hive — Product Requirements Document (Revised)

**Version:** 1.3 · **Date:** March 2026 · **Scope:** MVP (Seattle Launch)

1. Product Summary

Hive is an invite-only platform for underground music collectives, delivered as **two separate applications**:

* **Hive** (Member App) — A minimal mobile app where members discover events from collectives, request event passes, and build their scene identity. Invite-only access.  
* **Hive Console** (Organizer App) — A management tool (mobile or web) where collective **Admins** publish events, control membership, set **invitation** chains, filter their audience, and manage event passes. **Crucially, Hive does not facilitate event payments or handle financial transactions for passes.**

Both apps share a common backend. Members never see organizer tools; organizers get a purpose-built management experience.

1. Personas

**Event-Goer (“Member”)**

* 21–35 years old, active in the underground music scene  
* Attends 2-6 events per month  
* Currently discovers events through Instagram DMs, group chats, and word-of-mouth  
* Belongs to multiple social circles with different music tastes  
* Values authenticity, exclusivity, and scene credibility

**Collective Owner (“Organizer”)/Admin**

* Runs or co-runs a music collective, promotion crew, or event series  
* Manages 50–500+ community members  
* Currently uses Instagram, Google Forms, Venmo, and WhatsApp to run events  
* Wants to grow the community without losing control of the crowd  
* Needs data on attendance and audience composition  
* Needs privacy controls over event details  
1. Epics & User Stories

Epic 1 — Authentication & Onboarding

*US-1.1: Sign Up via Invitation (Hive)*

**As a** new user, **I want to** sign up using an **invitation** link from an existing member, **so that** I can join the platform and the collective that invited me.

**Acceptance Criteria:**

* User taps an invitation link → Hive app opens (or App Store if not installed)  
* Sign up with phone number (SMS verification) or Apple/Google SSO  
* After auth, user is automatically added to Hive (subject to approval rules in US-2.2)  
* Cannot sign up without a valid invitation link

*US-1.2: Quick Preference Setup (Hive)*

**As a** new member, **I want to** select my genre preferences in 2-3 taps during onboarding, **so that** my event feed is personalized from the start.

**Acceptance Criteria:**

* Screen shows genre chips (Acid, Minimal, Hard Techno, Industrial, Dub Techno, etc.)  
* User selects 1-5 genres → optional artist search/select → done  
* Preferences are saved to profile and used for feed ranking  
* Entire flow can be skipped — feed still works (shows all collective events unranked)

*US-1.3: Organizer Sign-Up (Hive Console)*

**As an** organizer, **I want to** sign up on Hive Console and create my collective, **so that** I can start managing my community and events.

**Acceptance Criteria:**

* Organizer downloads Hive Console (separate app or web app)  
* Sign up with phone number or email \+ password  
* Immediately routed to collective creation flow  
* Creator is automatically granted the **Admin** role for the new collective.  
* Console access is independent from the member app

Epic 2 — Collectives

*US-2.1: Create a Collective*

**As an** organizer, **I want to** create a collective with a name, description, and genre tags, **so that** I have a space to manage my community and events.

**Acceptance Criteria:**

* Form: name, description (optional), genre tags, profile image (optional)  
* Creator is automatically granted the **Admin** role for the collective.  
* Collective is private by default — only visible to members  
* Generates a unique invitation link for the collective

*US-2.2: Manage Membership*

**As a** Collective **Admin**, **I want to** manage the membership, including approving new join requests and removing existing members, **so that** I control who is in my community.

**Acceptance Criteria:**

* Member list with name, join date, events attended, inviter, and **role (Admin/Member)**.  
* Ability to assign the **Admin** role to other members.  
* Ability to remove a member (they lose access to the collective’s events).  
* **Approval Logic:**  
  * Users joining via an **Admin-sent invitation** are auto-approved.  
  * Users joining via a **Member-sent invitation** or a **direct application** require an Admin's approval.

*US-2.3: Set Invitation Permissions*

**As an** organizer, **I want to** control how many **invitations** a particular member can send out, **so that** growth is organic and controlled.

**Acceptance Criteria:**

* Setting: max invitations per member (e.g., 2, 5, unlimited)  
* Members see their remaining invitation count  
* Admin can adjust the limit at any time  
* Admin can disable invitations entirely (freeze growth). Admins can give out a specific number of invitations to a member of choice on demand.

*US-2.4: Join Multiple Collectives*

**As a** member, **I want to** belong to multiple collectives, **so that** I see events from different communities I’m part of.

**Acceptance Criteria:**

* User can accept invitations to multiple collectives  
* Feed aggregates events from all collectives, ranked by match score  
* Profile shows which collectives the user belongs to (visible only to the user)

*US-2.5: Leave a Collective*

**As a** member, **I want to** leave a collective, **so that** I no longer see their events or count toward their membership.

**Acceptance Criteria:**

* “Leave” option in collective settings  
* User is removed immediately, events disappear from feed  
* Past attendance history is retained on the user’s profile

Epic 3 — Event Management (Organizer)

*US-3.1: Create an Event*

**As an** organizer, **I want to** create an event with lineup, date, genre tags, and venue type, **so that** my community can discover and attend it.

**Acceptance Criteria:**

* Fields: name, date/time, lineup (add artists by name), genre tags, venue type (Warehouse / Club / Outdoor / Loft), description  
* Event is visible only to members of the organizer’s collective  
* Published event appears in members’ feeds immediately

*US-3.2: Set Event Visibility*

**As an** organizer, **I want to** set an event as public (all hive members) or invite-only (**invitation-gated**, and collective members only), **so that** I can control who can discover it.

**Acceptance Criteria:**

* Toggle: “All Members” or “Invite Only”  
* Invite-only events are hidden from the feed — accessible only via direct **invitation** link  
* Organizer can send initial invitations to specific members

*US-3.3: Set Audience Filters*

**As an** organizer, **I want to** filter which hive members see my event based on their event history, **so that** I reach the right crowd.

**Acceptance Criteria:**

* Filter options: minimum events attended (e.g., 3+), genre affinity match  
* Members who don’t meet the filter don’t see the event in their feed unless you’re already part of the collective  
* Organizer sees how many members pass the filter before publishing

*US-3.4: Control Location Reveal*

**As an** organizer, **I want to** set when and how the event address is revealed, **so that** the venue stays private until it matters.

**Acceptance Criteria:**

* Setting: reveal address X hours before event (default: 3 hours)  
* Before reveal: members see “Location revealed \[X\]hrs before event 🔒”  
* At reveal time: push notification sent to **all pass holders** with the address  
* Address visible in the **Passes** tab and event detail

*US-3.5: Edit or Cancel an Event*

**As an** organizer, **I want to** edit event details or cancel an event, **so that** I can handle changes and communicate them to attendees.

**Acceptance Criteria:**

* All fields editable until event starts  
* Cancel triggers push notification to **all pass holders**  
* Cancelled event shows “Cancelled” badge; **passes cancelled**

Epic 4 — Event Pass & Gate Management

*US-4.1: Define Event Capacity*

**As an** organizer, **I want to** set the maximum capacity for an event, **so that** I can control the crowd size.

**Acceptance Criteria:**

* Field for `max_capacity` (integer).  
* The total number of passes issued for the event cannot exceed this capacity.

*US-4.2: Request an Event Pass & Vetting Flow*

**As a** member, **I want to** request a pass for an event, **so that** I can initiate the process to secure my spot without a payment transaction.

**Acceptance Criteria:**

* Event detail → tap “Request Pass” → **Pass Request is created for Admin review.**  
* **Admin is immediately notified** of the request via Hive Console.  
* **Admin Vetting/Payment Flow:** The Admin can manually accept or decline the request. If accepted, the Admin is responsible for sending an **external email** (from the collective's account) to the member for any required vetting or payment collection.  
* **Pass Issuance:** Once the Admin is satisfied (e.g., payment verified outside of Hive), they must update the request status in Hive Console to **Issue Pass**. Only upon this action is the digital **PASS** issued to the member's app and a confirmation push notification sent.  
* Pass can be added to the digital wallet.

*US-4.3: View My Event Passes*

**As a** member, **I want to** see all my upcoming passes in one place, **so that** I can manage my plans and access my QR code at the door.

**Acceptance Criteria:**

* **Passes tab** shows upcoming events with date, time, and pass status.  
* Each **issued pass** has a QR code for door scanning.  
* After the event, the pass moves to the “Past” section.  
* Address appears on the pass once revealed.

*US-4.4: Scan Pass for Attendance (Admin)*

**As an** organizer/gate attendant, **I want to** scan a member's pass QR code at the door, **so that** I can verify entry and record attendance.

**Acceptance Criteria:**

* **Hive Console** (or a dedicated 'Scanner' mode within it) has a camera function to scan the unique pass QR code from the member app.  
* Successful scan marks the `PASS` as `used` (attended) in the database.  
* Scanner view shows a clear confirmation/denial message (e.g., "Pass Valid" or "Pass Used").

Epic 5 — Invitation System

*US-5.1: Send an Invitation to a Collective*

**As a** member or **Admin**, **I want to** generate an invitation link for my collective, **so that** I can bring trusted friends into the community. **Admins** should have the option to send invitations that are collective-only or tied to a specific event.

**Acceptance Criteria:**

* “Invite” button in collective view → generates a unique, shareable link  
* Link tracks who invited whom (**invitation chain**)  
* Member's invitation count decrements against their limit (set by organizer). Admin invitations do not count against this limit.  
* **Admin-set custom expiration** for the invitation link from the time of creation.  
* Link expires on use or upon the custom expiration time, whichever comes first.

*US-5.2: Send an Invitation to a Private Event*

**As a** member with access to an invite-only event invitation, **I want to** send an invitation to a friend, **so that** they can also attend.

**Acceptance Criteria:**

* “Invite a friend” on event detail → generates a one time invitation link  
* Invitation limit can be set by organizer (e.g., each person can refer up to 2\)  
* Invited friend must be a Hive member (or sign up via the link)  
* Organizer sees the full **invitation chain** in their dashboard

*US-5.3: View Invitation Chain (Admin)*

**As an** organizer **Admin**, **I want to** see the **invitation chain** for my event, **so that** I can trace how attendees discovered the event and identify key connectors.

**Acceptance Criteria:**

* Tree/list view showing: inviter → invitees, depth of chain  
* Shows total attendees acquired through each branch  
* Ability to revoke an invitation (and cascade to downstream invitees)

Epic 6 — User Profile & Event History

*US-6.1: View My Profile*

**As a** member, **I want to** see my event history, collective invitations and pending applications and genre breakdown **so that** I can track my activity in the scene.

**Acceptance Criteria:**

* Stats: events attended, invitations made.  
* Event history: chronological list with event name, date, genre tags  
* Genre breakdown: horizontal bars showing % by genre (based on attendance)  
* Profile is private — only visible to the user themselves

*US-6.3: View Anonymized Audience Data (Organizer)*

**As an** organizer, **I want to** see anonymized audience data for my events, **so that** I understand my community without violating member privacy.

**Acceptance Criteria:**

* Dashboard shows: **total passes issued**, genre distribution of attendees, new vs. returning attendees  
* No individual user data exposed — all aggregated  
* Available after event concludes

Epic 7 — Notifications

*US-7.1: Address Reveal Notification*

**As a pass holder**, **I want to** receive a push notification with the event address at the reveal time, **so that** I know where to go.

**Acceptance Criteria:**

* Push notification fires at the organizer-configured reveal time  
* Contains: event name, address, and a “Get Directions” deep link  
* Address also appears on the pass in-app

*US-7.2: Event Reminder*

**As a pass holder**, **I want to** receive a reminder before the event, **so that** I don’t forget.

**Acceptance Criteria:**

* Push notification 24 hours before event: “Tomorrow night: \[event name\]”  
* Tapping the notification opens the event detail

*US-7.3: New Event from My Collective*

**As a** member, **I want to** get notified when a collective I belong to posts a new event, **so that** I don’t miss it.

**Acceptance Criteria:**

* Push notification when a new event is published: “\[Collective\] just dropped: \[Event Name\]”  
* Notification only for collectives where the user has notifications enabled  
* Tapping opens the event detail  
1. Data Model (Conceptual)

erDiagram  
    USER ||--o{ MEMBERSHIP : "has role in"  
    USER ||--o{ PASS : "is issued"  
    USER ||--o{ INVITE : "sends"  
    COLLECTIVE ||--o{ MEMBERSHIP : "has"  
    COLLECTIVE ||--o{ EVENT : "hosts"  
    EVENT ||--o{ PASS : "issued as"  
    EVENT ||--o{ INVITE : "spread via"  
    INVITE ||--o{ INVITE : "chains to"  
      
    USER {  
        uuid id  
        string phone  
        string display\_name  
        json genre\_preferences  
        timestamp created\_at  
    }  
      
    MEMBERSHIP {  
        uuid id  
        uuid user\_id  
        uuid collective\_id  
        enum role "admin, member"  
        timestamp joined\_at  
    }  
      
    COLLECTIVE {  
        uuid id  
        string name  
        string description  
        json genre\_tags  
        int invite\_per\_member\_per\_event  
    }  
      
    EVENT {  
        uuid id  
        uuid collective\_id  
        string name  
        string description  
        json lineup  
        json genre\_tags  
        enum venue\_type  
        enum visibility  
        string address  
        timestamp event\_start  
        timestamp event\_end  
        int address\_reveal\_hours  
        int max\_capacity  
    }  
      
    PASS {  
        uuid id  
        uuid user\_id  
        uuid event\_id  
        string qr\_code  
        enum status "requested, issued, used, cancelled"  
        timestamp requested\_at  
        timestamp issued\_at  
        timestamp used\_at  
    }  
      
    INVITE {  
        uuid id  
        uuid sender\_id  
        uuid receiver\_id  
        uuid event\_id  
        uuid collective\_id  
        timestamp created\_at  
        timestamp expires\_at  
        timestamp sent\_at  
        timestamp accepted\_at  
        Enum status "created, sent, accepted, expired"  
    } 

1. Application Architecture

|  | Hive (Member App) | Hive Console (Organizer App) |
| ----- | ----- | ----- |
| **Purpose** | Event discovery, event passes, profile | Collective & event management, **Pass Scanning** |
| **Platform** | iOS \+ Android (React Native / Expo) | iOS \+ Android (React Native / Expo) / Web app (Responsive) |
| **Users** | Event-goers / members | Collective **Admins** / promoters |
| **Access** | Invite-only via invitation link | Invite-only sign-up (create a collective) |
| **Key screens** | Feed, Event Detail, Passes, Profile | Dashboard, Create Event, Members, Invitations, **Scan** |

Both apps share a **single backend API** and database. Authentication tokens are scoped by app.

1. Non-Functional Requirements

| Area | Requirement |
| ----- | ----- |
| **Hive Platform** | iOS and Android (React Native / Expo) |
| **Console Platform** | Web app (Next.js or similar), responsive for mobile use |
| **Performance** | Event feed loads in \< 2 seconds on 4G |
| **Security** | All data encrypted in transit (TLS) and at rest. No PII exposed to organizers. |
| **Privacy** | Organizers see only anonymized, aggregated audience data. No data selling, ever. |
| **Availability** | 99.5% uptime target. Address reveal notifications are the highest-priority job. |
| **Scalability** | Support 5,000 users and 50 events/week for Seattle launch. |

1. MVP Scope Boundary

| ✅ In | ❌ Out |
| ----- | ----- |
| **Hive** (member mobile app) \+ **Hive Console** (organizer mobile app) | Single combined app |
| Invitation-only sign up | Public registration |
| **Admin-level** invitation/vetting logic (see US-2.2) | Full Organizer verification / approval flow |
| Collective creation & **multi-admin** management (see US-2.2) | Recurring / series events |
| Event creation with audience filters | **External payment options/transaction handling** |
| In-app digital pass/QR code **(Issued upon Admin approval)** | Algorithmic trust scoring |
| **Pass scanning and attendance tracking** | Social features (follows, DMs, comments) |
| **Invitation** chains (collective \+ event level) | In-app chat or messaging |
| User profile with event history | Multi-city / city switching |
| Push notifications (address reveal, reminders, new events) | Spotify/SoundCloud import |
| Single city (Seattle) | Full analytics dashboard |
| Genre preference onboarding |  |
| Anonymized audience data for organizers |  |

1. Success Metrics (Seattle Launch)

| Metric | Target (Month 3\) |
| ----- | ----- |
| Founding collectives | 10 |
| Active members | 500 |
| Events hosted | 30+ |
| **Passes issued** | 1,000+ |
| Avg. events per user | 2+ |
| Invitation conversion rate | 40%+ |
| Member retention (monthly active) | 60%+ |

