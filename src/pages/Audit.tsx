import { useMemo } from 'react';
import { useSimulation } from '../lib/simulation';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';

export default function Audit() {
  const { incidents, alerts } = useSimulation();

  const rows = useMemo(() => {
    const entries: { id: string; event: string; actor: string; time: string }[] = [];
    incidents.forEach(i => i.timeline.forEach((t, idx) => entries.push({ id: `${i.id}-${idx}`, event: `${t.event} (${i.id})`, actor: t.actor, time: t.time })));
    alerts.forEach(a => entries.push({ id: `${a.id}-raised`, event: `Alert raised: ${a.type} (${a.id})`, actor: 'System', time: a.timestamp }));
    return entries.sort((a, b) => b.time.localeCompare(a.time));
  }, [incidents, alerts]);

  const columns: Column<typeof rows[number]>[] = [
    { key: 'event', header: 'Event', render: r => r.event },
    { key: 'actor', header: 'Actor', render: r => r.actor },
    { key: 'time', header: 'Timestamp', sortValue: r => r.time, render: r => <span className="font-mono text-xs">{new Date(r.time).toLocaleString()}</span> },
  ];

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">Audit</h1>
        <p className="mt-0.5 text-sm text-ink-muted">A trail of alert and incident activity for this session.</p>
      </div>
      <DataTable rows={rows} columns={columns} searchPlaceholder="Search audit events…" searchKeys={r => `${r.event} ${r.actor}`} />
    </div>
  );
}
