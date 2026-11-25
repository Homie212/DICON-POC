import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../lib/simulation';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { StatusPill } from '../components/Badges';

export default function DroneRegistry() {
  const { drones, liveDrones } = useSimulation();
  const navigate = useNavigate();

  const rows = drones.map(d => ({
    ...d,
    liveNow: liveDrones.some(l => l.id === d.id),
  }));

  const columns: Column<typeof rows[number]>[] = [
    { key: 'id', header: 'Drone ID', sortValue: r => r.id, render: r => <span className="font-mono text-xs font-medium text-ink">{r.id}</span> },
    { key: 'model', header: 'Manufacturer / model', sortValue: r => r.model, render: r => `${r.manufacturer} · ${r.model}` },
    { key: 'serialNumber', header: 'Serial', render: r => <span className="font-mono text-xs">{r.serialNumber}</span> },
    { key: 'ownerName', header: 'Owner', sortValue: r => r.ownerName, render: r => r.ownerName },
    { key: 'operatorName', header: 'Operator', render: r => r.operatorName },
    { key: 'status', header: 'Status', sortValue: r => r.status, render: r => <StatusPill status={r.status} /> },
    { key: 'liveNow', header: 'On map now', render: r => r.liveNow ? <span className="font-mono text-xs text-safe">LIVE</span> : <span className="font-mono text-xs text-ink-muted">—</span> },
  ];

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">Drone registry</h1>
        <p className="mt-0.5 text-sm text-ink-muted">Operational identity records received through the MITDrone integration contract.</p>
      </div>
      <DataTable
        rows={rows}
        columns={columns}
        searchPlaceholder="Search by serial, owner, or drone ID…"
        searchKeys={r => `${r.serialNumber} ${r.ownerName} ${r.id} ${r.model}`}
        onRowClick={r => navigate(`/drones/${r.id}`)}
      />
    </div>
  );
}
