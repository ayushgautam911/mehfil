// Hive member-app — mock data + domain model.
// In-memory today; these interfaces are also the contract for the real API
// (cross-check against hive_backend_design.md).

export const genres = [
  'acid', 'minimal', 'hard techno', 'dub techno',
  'industrial', 'detroit', 'dark techno', 'melodic',
  'ambient', 'trance', 'breakbeat', 'electro',
];

export const artists = [
  { name: 'oscar mulero', genres: 'acid · techno' },
  { name: 'dasha rush', genres: 'industrial · dark ambient' },
  { name: 'charlotte de witte', genres: 'acid techno' },
  { name: 'kobosil', genres: 'industrial · hard techno' },
  { name: 'vtss', genres: 'electro · industrial' },
];

// ── Collectives (invite-only — no public directory) ──────────
export interface Collective {
  id: string;
  name: string;
  handle: string;
  members: number;
  location: string;
  genres: string[];
  status: 'member' | 'invited' | 'applied';
  invitedBy?: string;
  appliedDate?: string;
  about: string;
  since?: string;
  role?: string;
}

export const myCollectives: Collective[] = [
  { id: 'c1', name: 'VOID', handle: '@void.collective', members: 240, location: 'seattle', genres: ['hard techno', 'industrial'], status: 'member', since: '2026', role: 'member', about: 'warehouse techno. no phones on the floor. the address finds you.' },
  { id: 'c2', name: 'SUBSTRATE', handle: '@substrate', members: 88, location: 'seattle', genres: ['dub techno', 'minimal'], status: 'member', since: '2026', role: 'member', about: 'slow, deep, hypnotic. monthly basement sessions.' },
];

export const pendingInvitations: Collective[] = [
  { id: 'c3', name: 'NULL SECTOR', handle: '@nullsector', invitedBy: '@dj_kira', members: 54, location: 'tacoma', genres: ['acid', 'ebm'], status: 'invited', about: 'industrial / ebm cell. invite traces back to a trusted node.' },
];

export const pendingApplications: Collective[] = [
  { id: 'c4', name: 'DEEP STATE', handle: '@deepstate', members: 310, location: 'seattle', genres: ['melodic', 'progressive'], status: 'applied', appliedDate: 'mar 30', about: '' },
];

export const allCollectives: Collective[] = [
  ...myCollectives,
  ...pendingInvitations,
  ...pendingApplications,
];

// ── Events (now tagged with their collective; pass model) ─────
export interface Event {
  id: string;
  name: string;
  collective: string;
  date: string;
  time: string;
  venue: string;
  genres: string[];
  matchScore: number;
  isPrivate: boolean;
  lineup: string[];
  locationRevealed: boolean;
  address: string;
  passStatus: null | 'pending' | 'approved';
}

export const events: Event[] = [
  { id: '1', name: 'void: warehouse session', collective: 'VOID', date: 'sat mar 22', time: '23:00', venue: 'warehouse', genres: ['hard techno', 'industrial'], matchScore: 92, isPrivate: false, lineup: ['charlotte de witte', 'kobosil', 'vtss'], locationRevealed: false, address: 'address revealed 3hrs before', passStatus: null },
  { id: '2', name: 'monolith', collective: 'VOID', date: 'fri apr 04', time: '00:00', venue: 'undisclosed location', genres: ['experimental', 'dark ambient'], matchScore: 85, isPrivate: true, lineup: ['dasha rush', 'oscar mulero'], locationRevealed: false, address: 'address revealed 3hrs before', passStatus: 'pending' },
  { id: '3', name: 'substrate: dub session', collective: 'SUBSTRATE', date: 'sat apr 12', time: '22:00', venue: 'basement club', genres: ['dub techno', 'minimal'], matchScore: 78, isPrivate: false, lineup: ['vtss', 'ancient methods'], locationRevealed: true, address: '1421 railroad ave, seattle', passStatus: 'approved' },
  { id: '4', name: 'signal interrupt', collective: 'VOID', date: 'sat apr 05', time: '22:00', venue: 'factory unit 4', genres: ['ebm', 'acid techno'], matchScore: 67, isPrivate: false, lineup: ['phase fatale', 'schwefelgelb'], locationRevealed: false, address: 'address revealed 3hrs before', passStatus: null },
];

// ── Passes (request → admin approves → QR; no payment) ───────
export interface Pass {
  id: string;
  eventName: string;
  collective: string;
  date: string;
  time: string;
  status: 'approved' | 'pending' | 'declined' | 'used';
  code: string | null;
  entry: string;
  isPast: boolean;
}

export const passes: Pass[] = [
  { id: 'p1', eventName: 'substrate: dub session', collective: 'SUBSTRATE', date: 'sat apr 12', time: '22:00', status: 'approved', code: 'HIVE-2K7-X9F4', entry: '1 entry · non-transferable', isPast: false },
  { id: 'p2', eventName: 'monolith', collective: 'VOID', date: 'fri apr 04', time: '00:00', status: 'pending', code: null, entry: 'awaiting collective approval', isPast: false },
  { id: 'p3', eventName: 'signal interrupt', collective: 'VOID', date: 'sat apr 05', time: '22:00', status: 'declined', code: null, entry: 'capacity reached', isPast: false },
  { id: 'p4', eventName: 'resonance series', collective: 'VOID', date: 'sat mar 15', time: '23:00', status: 'used', code: 'HIVE-9A2-LM31', entry: 'checked in 23:41', isPast: true },
];

// ── Chat (1:1 between a member and a collective) ──────────────
export interface ChatMessage {
  from: 'me' | 'them';
  text: string;
  time: string;
}

export interface ChatThread {
  id: string;
  collective: string;
  handle: string;
  unread: number;
  lastTime: string;
  lastMessage: string;
  messages: ChatMessage[];
}

export const chats: ChatThread[] = [
  {
    id: 'ch1', collective: 'VOID', handle: '@void.collective', unread: 1, lastTime: '21:04',
    lastMessage: 'your pass for substrate is approved. address drops 3hrs before.',
    messages: [
      { from: 'them', text: 'welcome to void. read the floor rules pinned in your profile.', time: 'mar 18 · 19:22' },
      { from: 'me', text: 'got it. can i bring a +1 to the warehouse session?', time: 'mar 18 · 19:40' },
      { from: 'them', text: 'not this one — capacity is tight. next month opens up.', time: 'mar 18 · 19:51' },
      { from: 'them', text: 'your pass for substrate is approved. address drops 3hrs before.', time: '21:04' },
    ],
  },
  {
    id: 'ch2', collective: 'SUBSTRATE', handle: '@substrate', unread: 0, lastTime: 'mar 30',
    lastMessage: 'see you saturday. door closes at 00:30 sharp.',
    messages: [
      { from: 'me', text: "first time at substrate — what's the vibe?", time: 'mar 29 · 14:10' },
      { from: 'them', text: 'slow and deep. come early, stay late. no photos.', time: 'mar 29 · 14:33' },
      { from: 'them', text: 'see you saturday. door closes at 00:30 sharp.', time: 'mar 30' },
    ],
  },
];

// ── History (synced past attendance) ─────────────────────────
export interface HistorySource {
  name: string;
  status: 'synced' | 'not connected';
  count: number;
}

export interface HistoryItem {
  name: string;
  collective: string;
  date: string;
  genre: string;
}

export interface History {
  synced: boolean;
  sources: HistorySource[];
  items: HistoryItem[];
}

export const history: History = {
  synced: true,
  sources: [
    { name: 'resident advisor', status: 'synced', count: 24 },
    { name: 'instagram', status: 'not connected', count: 0 },
    { name: 'shazam', status: 'synced', count: 51 },
  ],
  items: [
    { name: 'void: warehouse session', collective: 'VOID', date: 'mar 22', genre: 'hard techno' },
    { name: 'resonance series', collective: 'VOID', date: 'mar 15', genre: 'acid' },
    { name: 'hypnosis nye', collective: 'SUBSTRATE', date: 'dec 31', genre: 'industrial' },
    { name: 'blackout vol. 4', collective: 'external', date: 'nov 18', genre: 'ebm' },
    { name: 'deep tissue', collective: 'external', date: 'oct 02', genre: 'dub techno' },
  ],
};

// ── Preferences ──────────────────────────────────────────────
export interface Preferences {
  genres: string[];
  artists: string[];
  notify: {
    newEvents: boolean;
    passUpdates: boolean;
    chat: boolean;
    recommendations: boolean;
  };
  privacy: {
    discoverable: boolean;
    shareHistory: boolean;
  };
}

export const preferences: Preferences = {
  genres: ['hard techno', 'acid', 'industrial', 'dub techno'],
  artists: ['oscar mulero', 'dasha rush'],
  notify: { newEvents: true, passUpdates: true, chat: true, recommendations: false },
  privacy: { discoverable: false, shareHistory: true },
};

export const userProfile = {
  username: '@cybernaut',
  memberSince: '2026',
  eventsAttended: 12,
  referrals: 3,
  score: 87,
  frequencies: [
    { genre: 'hard techno', percent: 45 },
    { genre: 'acid', percent: 30 },
    { genre: 'minimal', percent: 25 },
  ],
};

export const invite = {
  eventName: 'substrate',
  from: '@dj_kira',
  spotsRemaining: 2,
  referralCode: 'hive-7x9k',
  maxInvites: 2,
};
