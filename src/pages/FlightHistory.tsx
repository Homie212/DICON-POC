import { useSimulation } from '../lib/simulation';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { StatusPill } from '../components/Badges';

export default function FlightHistory() {
  const { flights } = useSimulation();

  const columns: Column<typeof flights[number]>[] = [
    { key: 'id', header: 'Flight', render: r => <span className="font-mono text-xs font-medium text-ink">{r.id}</span> },
    { key: 'droneId', header: 'Drone', render: r => <span className="font-mono text-xs">{r.droneId}</span> },
    { key: 'operatorName', header: 'Operator', render: r => r.operatorName },
    { key: 'start', header: 'Start', sortValue: r => r.start, render: r => new Date(r.start).toLocaleString() },
    { key: 'durationMin', header: 'Duration', align: 'right', sortValue: r => r.durationMin, render: r => `${r.durationMin} min` },
    { key: 'location', header: 'Location', render: r => r.location },
    { key: 'purpose', header: 'Purpose', render: r => r.purpose },
    { key: 'alertCount', header: 'Alerts', align: 'right', sortValue: r => r.alertCount, render: r => r.alertCount },
    { key: 'status', header: 'Status', sortValue: r => r.status, render: r => <StatusPill status={r.status} /> },
  ];

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">Flight history</h1>
        <p className="mt-0.5 text-sm text-ink-muted">Completed and flagged flights recorded by the simulated sensor network.</p>
      </div>
      <DataTable rows={flights} columns={columns} searchPlaceholder="Search by drone, operator, or location…" searchKeys={r => `${r.droneId} ${r.operatorName} ${r.location}`} />
    </div>
  );
}
