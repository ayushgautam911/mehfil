import { useState, useEffect } from 'react';
import { Sidebar } from './components/primitives';
import Dashboard from './screens/Dashboard';
import Events, { type ConsoleEvent } from './screens/Events';
import Membership from './screens/Membership';
import Settings from './screens/Settings';
import Onboarding from './screens/Onboarding';
import EmailTemplates from './screens/EmailTemplates';
import ScanPass from './screens/ScanPass';
import { api, getToken, getStoredCollective, logout as apiLogout } from './api';
import { type EmailTemplate } from './templates';

const NAV = ['DASHBOARD', 'EVENTS', 'MEMBERS', 'SCAN PASS', 'EMAIL TEMPLATES', 'SETTINGS'];

export default function App() {
  const [token, setToken] = useState<string | null>(getToken());
  const [collective, setCollective] = useState<any>(getStoredCollective());
  const [eventsList, setEventsList] = useState<ConsoleEvent[]>([]);
  const [membersList, setMembersList] = useState<any[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [active, setActive] = useState('DASHBOARD');

  // Trigger data reloading
  const [reloadCounter, setReloadCounter] = useState(0);
  const triggerReload = () => setReloadCounter((prev) => prev + 1);

  useEffect(() => {
    if (!token || !collective) return;

    const loadData = async () => {
      try {
        // Fetch real-time data from Fastify backend
        const rawEvents = await api.events.list(collective.id);
        const rawMembers = await api.collectives.getMembers(collective.id);
        const rawTemplates = await api.templates.list(collective.id);

        // Map backend events to ConsoleEvent format
        const mappedEvents: ConsoleEvent[] = rawEvents.map((e: any) => ({
          id: e.id,
          name: e.name,
          date: e.date,
          time: e.time,
          endTime: e.endTime ?? null,
          venue: e.venue,
          venueAddress: e.venueAddress ?? null,
          status: e.status as 'published' | 'draft',
          capacity: e.capacity,
          passesIssued: e.passesIssued,
          requests: 0, // requested state is deprecated in MVP pass flow
          description: e.description ?? null,
          imageUrl: e.imageUrl ?? null,
          addressRevealAt: e.addressRevealAt ?? null,
          lineup: e.lineup ?? null,
          genres: e.genres ?? null,
          passHolders: e.passHolders || [],
          passes: e.passes || [],
        }));

        // Map backend users to Member format expected by UI
        const mappedMembers = rawMembers.map((m: any) => ({
          id: m.id,
          handle: m.displayName, // Map displayName to handle for frontend UI
          joined: new Date(m.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toLowerCase(),
          events: 0, // Mock count or calculated from passes
          rating: 100, // Rating columns were removed, but property is kept for models
          invites: '0 / 5',
          status: m.status as 'active' | 'blocked',
          role: m.role as 'admin' | 'member',
          email: m.email,
          phone: m.phone,
        }));

        setEventsList(mappedEvents);
        setMembersList(mappedMembers);
        setTemplates(rawTemplates);
      } catch (err) {
        console.error('Failed to fetch data from backend:', err);
        // If unauthorized, log out
        if (err instanceof Error && err.message.includes('Unauthorized')) {
          handleLogout();
        }
      }
    };

    loadData();
  }, [token, collective, reloadCounter]);

  const handleLogout = () => {
    apiLogout();
    setToken(null);
    setCollective(null);
    setEventsList([]);
    setMembersList([]);
  };

  const handleOnboardDone = (newCollective: any) => {
    setToken(getToken());
    setCollective(newCollective);
    triggerReload();
  };

  // If not authenticated, force onboarding / login
  if (!token || !collective) {
    return (
      <div style={{ height: '100%', minWidth: 980, background: 'var(--surface-page)', position: 'relative', overflow: 'hidden' }}>
        <Onboarding onDone={handleOnboardDone} />
      </div>
    );
  }

  let screen;
  if (active === 'DASHBOARD') {
    screen = (
      <Dashboard
        onNav={setActive}
        collective={collective}
        membersCount={membersList.length}
        eventsCount={eventsList.length}
        passesIssuedCount={eventsList.reduce((acc, curr) => acc + (curr.passesIssued || 0), 0)}
      />
    );
  } else if (active === 'EVENTS') {
    screen = (
      <Events
        events={eventsList}
        members={membersList}
        collectiveId={collective.id}
        collectiveName={collective.name}
        templates={templates}
        triggerReload={triggerReload}
      />
    );
  } else if (active === 'EMAIL TEMPLATES') {
    screen = <EmailTemplates templates={templates} collectiveId={collective.id} onReload={triggerReload} />;
  } else if (active === 'MEMBERS') {
    screen = (
      <Membership
        members={membersList}
        setMembers={(newList) => {
          setMembersList(newList);
          triggerReload();
        }}
        collectiveId={collective.id}
      />
    );
  } else if (active === 'SCAN PASS') {
    screen = <ScanPass />;
  } else {
    screen = <Settings onLogout={handleLogout} />;
  }

  return (
    <div style={{ height: '100%', minWidth: 980, display: 'flex', background: 'var(--surface-page)', position: 'relative', overflow: 'hidden' }}>
      <Sidebar active={active} onNav={setActive} nav={NAV} badges={{}} collective={collective} membersCount={membersList.length} />
      <div key={active} className="hive-fade" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {screen}
      </div>
    </div>
  );
}
