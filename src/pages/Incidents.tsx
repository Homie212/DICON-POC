import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../lib/simulation';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { SeverityBadge, StatusPill } from '../components/Badges';

export default function Incidents() {
  const { incidents } = useSimulation();
  const navigate = useNavigate();

  const columns: Column<typeof incidents[number]>[] = [
    { key: 'id', header: 'Incident', render: r => <span className="font-mono text-xs font-medium text-ink">{r.id}</span> },
    { key: 'type', header: 'Type', render: r => r.type },
    { key: 'droneId', header: 'Drone', render: r => <span className="font-mono text-xs">{r.droneId}</span> },
    { key: 'severity', header: 'Severity', sortValue: r => r.severity, render: r => <SeverityBadge severity={r.severity} /> },
    { key: 'location', header: 'Location', render: r => r.location },
    { key: 'assignedTo', header: 'Assigned to', render: r => <span className="text-ink-muted">{r.assignedTo}</span> },
    { key: 'time', header: 'Opened', sortValue: r => r.time, render: r => <span className="font-mono text-xs">{new Date(r.time).toLocaleString()}</span> },
    { key: 'status', header: 'Status', sortValue: r => r.status, render: r => <StatusPill status={r.status} /> },
  ];

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">Incidents</h1>
        <p className="mt-0.5 text-sm text-ink-muted">Escalated alerts under investigation or resolved by DICON operators.</p>
      </div>
      <DataTable
        rows={incidents}
        columns={columns}
        searchPlaceholder="Search by incident, type, or drone…"
        searchKeys={r => `${r.id} ${r.type} ${r.droneId}`}
        onRowClick={r => navigate(`/incidents/${r.id}`)}
      />
    </div>
  );
}
