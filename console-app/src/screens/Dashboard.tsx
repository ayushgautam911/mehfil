import { CHeader, Body, Metric, Panel, CBtn } from '../components/primitives';

interface DashboardProps {
  onNav: (n: string) => void;
  collective: { name: string; handle: string; location?: string } | null;
  membersCount: number;
  eventsCount: number;
  passesIssuedCount: number;
}

function EmptyState({ text }: { text: string }) {
  return (
    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--fs-sm)', color: 'var(--text-dim)', letterSpacing: 'var(--ls-normal)', lineHeight: 'var(--lh-body)', margin: '8px 0', textAlign: 'center' }}>
      {text}
    </p>
  );
}

export default function Dashboard({ onNav, collective, membersCount, eventsCount, passesIssuedCount }: DashboardProps) {
  // Header subtitle from the real logged-in collective — handle, plus location
  // only when it was actually provided at signup (city is optional).
  const sub = [collective?.handle, collective?.location]
    .filter((s) => s && s.trim())
    .join(' · ');

  return (
    <>
      <CHeader
        title="DASHBOARD"
        sub={sub}
        action={<CBtn variant="solid" onClick={() => onNav('EVENTS')}>+ NEW EVENT</CBtn>}
      />
      <Body>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--sp-md)', marginBottom: 'var(--sp-xl)' }}>
          <Metric value={membersCount} label="Members" sub="active registered members" accent />
          <Metric value={eventsCount} label="Upcoming events" sub="published & draft" />
          <Metric value={passesIssuedCount} label="Passes issued" sub="sent across all events" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 'var(--sp-lg)' }}>
          <Panel title="Recent activity">
            <EmptyState text="No activity yet. Create an event or add members to get started." />
          </Panel>

          {/* Audience panel hidden for now — no real audience analytics yet.
          <Panel
            title="Audience"
            action={<span style={{ fontFamily: 'var(--font-sans)', fontSize: '9px', letterSpacing: 'var(--ls-wide)', color: 'var(--text-dim)' }}>AGGREGATED · ANONYMIZED</span>}
          >
            <EmptyState text="No audience data yet. Insights appear once members attend events." />
          </Panel>
          */}
        </div>
      </Body>
    </>
  );
}
