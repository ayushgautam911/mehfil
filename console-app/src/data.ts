// Hive Console — organizer mock data (you administer the VOID collective).
// In-memory today; mirrors the API contract in hive_backend_design.md.

export interface ConsoleCollective {
  name: string;
  handle: string;
  members: number;
  location: string;
  founded: string;
}

export interface Metrics {
  members: number;
  pendingApplications: number;
  upcomingEvents: number;
  passRequests: number;
  returningRate: number;
  newThisMonth: number;
}

export interface Application {
  id: string;
  handle: string;
  invitedBy: string;
  sharedTaste: number;
  mutuals: number;
  genres: string[];
  appliedDate: string;
  note: string;
}

export type MemberStatus = 'active' | 'blocked';
export interface Member {
  id: string;
  handle: string;
  joined: string;
  events: number;
  rating: number;
  invites: string;
  status: MemberStatus;
}

export type EventStatus = 'published' | 'draft';
export interface ConsoleEvent {
  id: string;
  name: string;
  date: string;
  time: string;
  endTime?: string | null;
  venue: string;
  venueAddress?: string | null;
  imageUrl?: string | null;
  status: EventStatus;
  capacity: number;
  passesIssued: number;
  requests: number;
}

export interface PassRequest {
  id: string;
  member: string;
  event: string;
  requestedAt: string;
  rating: number;
  status: 'pending';
}

export interface ConsoleChatMessage {
  from: 'me' | 'them';
  text: string;
  time: string;
}
export interface ConsoleChat {
  id: string;
  member: string;
  unread: number;
  lastTime: string;
  lastMessage: string;
  messages: ConsoleChatMessage[];
}

export interface ActivityItem {
  kind: 'application' | 'pass' | 'member' | 'event' | 'block';
  text: string;
  time: string;
}

export interface InvitationSettings {
  invitationsEnabled: boolean;
  autoApprove: boolean;
  perMemberPerEvent: number;
}

export const collective: ConsoleCollective = {
  name: 'VOID',
  handle: '@void.collective',
  members: 240,
  location: 'seattle',
  founded: '2026',
};

export const otherCollectives = [{ name: 'SUBSTRATE', handle: '@substrate', members: 88 }];

export const metrics: Metrics = {
  members: 240,
  pendingApplications: 6,
  upcomingEvents: 3,
  passRequests: 14,
  returningRate: 68,
  newThisMonth: 22,
};

export const applications: Application[] = [
  { id: 'a1', handle: '@nightform', invitedBy: '@dj_kira', sharedTaste: 91, mutuals: 4, genres: ['hard techno', 'industrial'], appliedDate: 'apr 01', note: 'found us through the substrate b2b' },
  { id: 'a2', handle: '@gridlock', invitedBy: '@cybernaut', sharedTaste: 84, mutuals: 2, genres: ['acid', 'ebm'], appliedDate: 'apr 01', note: '' },
  { id: 'a3', handle: '@m.aurelius', invitedBy: '@void.core', sharedTaste: 77, mutuals: 1, genres: ['dub techno'], appliedDate: 'mar 31', note: '' },
];

export const members: Member[] = [
  { id: 'm1', handle: '@cybernaut', joined: 'jan 2026', events: 12, rating: 92, invites: '3 / 5', status: 'active' },
  { id: 'm2', handle: '@dj_kira', joined: 'jan 2026', events: 18, rating: 96, invites: '5 / 5', status: 'active' },
  { id: 'm3', handle: '@void.core', joined: 'feb 2026', events: 9, rating: 88, invites: '2 / 5', status: 'active' },
  { id: 'm4', handle: '@feedback.loop', joined: 'feb 2026', events: 4, rating: 61, invites: '0 / 5', status: 'active' },
  { id: 'm5', handle: '@ghost_node', joined: 'mar 2026', events: 1, rating: 34, invites: '0 / 5', status: 'blocked' },
];

export const events: ConsoleEvent[] = [
  { id: 'e1', name: 'void: warehouse session', date: 'sat mar 22', time: '23:00', venue: 'warehouse', status: 'published', capacity: 200, passesIssued: 186, requests: 14 },
  { id: 'e2', name: 'monolith', date: 'fri apr 04', time: '00:00', venue: 'undisclosed', status: 'published', capacity: 120, passesIssued: 64, requests: 31 },
  { id: 'e3', name: 'signal interrupt', date: 'sat apr 05', time: '22:00', venue: 'factory unit 4', status: 'draft', capacity: 150, passesIssued: 0, requests: 0 },
];

export const passRequests: PassRequest[] = [
  { id: 'pr1', member: '@cybernaut', event: 'monolith', requestedAt: '2h ago', rating: 92, status: 'pending' },
  { id: 'pr2', member: '@gridlock', event: 'monolith', requestedAt: '3h ago', rating: 84, status: 'pending' },
  { id: 'pr3', member: '@nightform', event: 'monolith', requestedAt: '5h ago', rating: 91, status: 'pending' },
  { id: 'pr4', member: '@feedback.loop', event: 'void: warehouse session', requestedAt: '1d ago', rating: 61, status: 'pending' },
];

export const chats: ConsoleChat[] = [
  {
    id: 'cc1', member: '@cybernaut', unread: 1, lastTime: '21:04',
    lastMessage: 'can i bring a +1 to the warehouse session?',
    messages: [{ from: 'them', text: 'can i bring a +1 to the warehouse session?', time: '21:04' }],
  },
  {
    id: 'cc2', member: '@dj_kira', unread: 0, lastTime: 'mar 30',
    lastMessage: 'lineup confirmed for monolith. sending art tonight.',
    messages: [
      { from: 'me', text: 'need the final b2b order by friday.', time: 'mar 29' },
      { from: 'them', text: 'lineup confirmed for monolith. sending art tonight.', time: 'mar 30' },
    ],
  },
];

export const activity: ActivityItem[] = [
  { kind: 'application', text: '@nightform applied · invited by @dj_kira', time: '2h ago' },
  { kind: 'pass', text: 'pass approved · @cybernaut · monolith', time: '3h ago' },
  { kind: 'member', text: '@gridlock joined the collective', time: '5h ago' },
  { kind: 'event', text: 'monolith published · 120 capacity', time: '1d ago' },
  { kind: 'block', text: '@ghost_node blocked · low rating', time: '2d ago' },
];

export const invitationSettings: InvitationSettings = {
  invitationsEnabled: true,
  autoApprove: false,
  perMemberPerEvent: 2,
};
