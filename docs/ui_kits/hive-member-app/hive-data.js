// Hive member-app — mock data (mirrors constants/mockData.ts + new feature domains)
window.HIVE = (function () {
  const genres = [
    "acid", "minimal", "hard techno", "dub techno",
    "industrial", "detroit", "dark techno", "melodic",
    "ambient", "trance", "breakbeat", "electro",
  ];

  const artists = [
    { name: "oscar mulero", genres: "acid · techno" },
    { name: "dasha rush", genres: "industrial · dark ambient" },
    { name: "charlotte de witte", genres: "acid techno" },
    { name: "kobosil", genres: "industrial · hard techno" },
    { name: "vtss", genres: "electro · industrial" },
  ];

  // ── Collectives (invite-only — no public directory) ──────────
  // You only ever see a collective once you've been invited or joined.
  const myCollectives = [
    { id: "c1", name: "VOID", handle: "@void.collective", members: 240, location: "seattle", genres: ["hard techno", "industrial"], status: "member", since: "2026", role: "member", about: "warehouse techno. no phones on the floor. the address finds you." },
    { id: "c2", name: "SUBSTRATE", handle: "@substrate", members: 88, location: "seattle", genres: ["dub techno", "minimal"], status: "member", since: "2026", role: "member", about: "slow, deep, hypnotic. monthly basement sessions." },
  ];
  const pendingInvitations = [
    { id: "c3", name: "NULL SECTOR", handle: "@nullsector", invitedBy: "@dj_kira", members: 54, location: "tacoma", genres: ["acid", "ebm"], status: "invited", about: "industrial / ebm cell. invite traces back to a trusted node." },
  ];
  const pendingApplications = [
    { id: "c4", name: "DEEP STATE", handle: "@deepstate", members: 310, location: "seattle", genres: ["melodic", "progressive"], status: "applied", appliedDate: "mar 30", about: "" },
  ];

  // ── Events (now tagged with their collective) ────────────────
  const events = [
    { id: "1", name: "void: warehouse session", collective: "VOID", date: "sat mar 22", time: "23:00", venue: "warehouse", genres: ["hard techno", "industrial"], matchScore: 92, isPrivate: false, lineup: ["charlotte de witte", "kobosil", "vtss"], locationRevealed: false, address: "address revealed 3hrs before", passStatus: null },
    { id: "2", name: "monolith", collective: "VOID", date: "fri apr 04", time: "00:00", venue: "undisclosed location", genres: ["experimental", "dark ambient"], matchScore: 85, isPrivate: true, lineup: ["dasha rush", "oscar mulero"], locationRevealed: false, address: "address revealed 3hrs before", passStatus: "pending" },
    { id: "3", name: "substrate: dub session", collective: "SUBSTRATE", date: "sat apr 12", time: "22:00", venue: "basement club", genres: ["dub techno", "minimal"], matchScore: 78, isPrivate: false, lineup: ["vtss", "ancient methods"], locationRevealed: true, address: "1421 railroad ave, seattle", passStatus: "approved" },
    { id: "4", name: "signal interrupt", collective: "VOID", date: "sat apr 05", time: "22:00", venue: "factory unit 4", genres: ["ebm", "acid techno"], matchScore: 67, isPrivate: false, lineup: ["phase fatale", "schwefelgelb"], locationRevealed: false, address: "address revealed 3hrs before", passStatus: null },
  ];

  // ── Passes (request → admin approves → QR; no payment) ───────
  const passes = [
    { id: "p1", eventName: "substrate: dub session", collective: "SUBSTRATE", date: "sat apr 12", time: "22:00", status: "approved", code: "HIVE-2K7-X9F4", entry: "1 entry · non-transferable", isPast: false },
    { id: "p2", eventName: "monolith", collective: "VOID", date: "fri apr 04", time: "00:00", status: "pending", code: null, entry: "awaiting collective approval", isPast: false },
    { id: "p3", eventName: "signal interrupt", collective: "VOID", date: "sat apr 05", time: "22:00", status: "declined", code: null, entry: "capacity reached", isPast: false },
    { id: "p4", eventName: "resonance series", collective: "VOID", date: "sat mar 15", time: "23:00", status: "used", code: "HIVE-9A2-LM31", entry: "checked in 23:41", isPast: true },
  ];

  // ── Chat (1:1 between a member and a collective) ──────────────
  const chats = [
    {
      id: "ch1", collective: "VOID", handle: "@void.collective", unread: 1, lastTime: "21:04",
      lastMessage: "your pass for substrate is approved. address drops 3hrs before.",
      messages: [
        { from: "them", text: "welcome to void. read the floor rules pinned in your profile.", time: "mar 18 · 19:22" },
        { from: "me", text: "got it. can i bring a +1 to the warehouse session?", time: "mar 18 · 19:40" },
        { from: "them", text: "not this one — capacity is tight. next month opens up.", time: "mar 18 · 19:51" },
        { from: "them", text: "your pass for substrate is approved. address drops 3hrs before.", time: "21:04" },
      ],
    },
    {
      id: "ch2", collective: "SUBSTRATE", handle: "@substrate", unread: 0, lastTime: "mar 30",
      lastMessage: "see you saturday. door closes at 00:30 sharp.",
      messages: [
        { from: "me", text: "first time at substrate — what's the vibe?", time: "mar 29 · 14:10" },
        { from: "them", text: "slow and deep. come early, stay late. no photos.", time: "mar 29 · 14:33" },
        { from: "them", text: "see you saturday. door closes at 00:30 sharp.", time: "mar 30" },
      ],
    },
  ];

  // ── History (synced past attendance) ─────────────────────────
  const history = {
    synced: true,
    sources: [
      { name: "resident advisor", status: "synced", count: 24 },
      { name: "instagram", status: "not connected", count: 0 },
      { name: "shazam", status: "synced", count: 51 },
    ],
    items: [
      { name: "void: warehouse session", collective: "VOID", date: "mar 22", genre: "hard techno" },
      { name: "resonance series", collective: "VOID", date: "mar 15", genre: "acid" },
      { name: "hypnosis nye", collective: "SUBSTRATE", date: "dec 31", genre: "industrial" },
      { name: "blackout vol. 4", collective: "external", date: "nov 18", genre: "ebm" },
      { name: "deep tissue", collective: "external", date: "oct 02", genre: "dub techno" },
    ],
  };

  // ── Preferences ──────────────────────────────────────────────
  const preferences = {
    genres: ["hard techno", "acid", "industrial", "dub techno"],
    artists: ["oscar mulero", "dasha rush"],
    notify: { newEvents: true, passUpdates: true, chat: true, recommendations: false },
    privacy: { discoverable: false, shareHistory: true },
  };

  const profile = {
    username: "@cybernaut", memberSince: "2026", eventsAttended: 12, referrals: 3, score: 87,
    frequencies: [
      { genre: "hard techno", percent: 45 },
      { genre: "acid", percent: 30 },
      { genre: "minimal", percent: 25 },
    ],
  };

  const invite = { eventName: "substrate", from: "@dj_kira", spotsRemaining: 2, referralCode: "hive-7x9k", maxInvites: 2 };

  return {
    genres, artists, events, passes, chats, history, preferences, profile, invite,
    myCollectives, pendingInvitations, pendingApplications,
  };
})();
