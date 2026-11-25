import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import { useSimulation } from '../lib/simulation';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { SeverityBadge, StatusPill } from '../components/Badges';

export default function Alerts() {
  const { alerts, acknowledgeAlert, createIncidentFromAlert } = useSimulation();
  const navigate = useNavigate();

  const rows = useMemo(() => [...alerts].sort((a, b) => b.timestamp.localeCompare(a.timestamp)), [alerts]);

  const columns: Column<typeof rows[number]>[] = [
    { key: 'type', header: 'Type', sortValue: r => r.type, render: r => <span className="font-medium text-ink">{r.type}</span> },
    { key: 'severity', header: 'Severity', sortValue: r => r.severity, render: r => <SeverityBadge severity={r.severity} /> },
    { key: 'droneId', header: 'Drone', render: r => <span className="font-mono text-xs">{r.droneId}</span> },
    { key: 'timestamp', header: 'Timestamp', sortValue: r => r.timestamp, render: r => <span className="font-mono text-xs">{new Date(r.timestamp).toLocaleTimeString()}</span> },
    { key: 'status', header: 'Status', sortValue: r => r.status, render: r => <StatusPill status={r.status} /> },
    { key: 'actions', header: '', render: r => (
      <div className="flex justify-end gap-1.5">
        {r.status === 'Open' && (
          <button onClick={(e) => { e.stopPropagation(); acknowledgeAlert(r.id); }} className="focus-ring rounded border border-line-strong px-2 py-1 text-xs text-ink hover:bg-surface-raised">Acknowledge</button>
        )}
        <button onClick={(e) => { e.stopPropagation(); createIncidentFromAlert(r.id); navigate('/incidents'); }} className="focus-ring rounded bg-accent-dim px-2 py-1 text-xs text-accent hover:brightness-110">Create incident</button>
      </div>
    ), align: 'right' },
  ];

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">Alerts</h1>
        <p className="mt-0.5 text-sm text-ink-muted">Unknown drones, restricted zone entries, and telemetry anomalies from the simulated sensor network.</p>
      </div>
      <DataTable
        rows={rows}
        columns={columns}
        searchPlaceholder="Search by type or drone ID…"
        searchKeys={r => `${r.type} ${r.droneId}`}
      />
    </div>
  );
}
