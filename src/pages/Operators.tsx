import { useSimulation } from '../lib/simulation';
import DataTable from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { StatusPill } from '../components/Badges';

export default function Operators() {
  const { operators, drones, flights } = useSimulation();

  const rows = operators.map(o => ({
    ...o,
    associatedDrones: drones.filter(d => d.operatorName === o.name).length,
    flightCount: flights.filter(f => f.operatorName === o.name).length,
  }));

  const columns: Column<typeof rows[number]>[] = [
    { key: 'name', header: 'Operator', sortValue: r => r.name, render: r => <span className="font-medium text-ink">{r.name}</span> },
    { key: 'organization', header: 'Organization', render: r => r.organization ?? '—' },
    { key: 'verification', header: 'Verification', sortValue: r => r.verification, render: r => <StatusPill status={r.verification} /> },
    { key: 'associatedDrones', header: 'Associated drones', align: 'right', sortValue: r => r.associatedDrones, render: r => r.associatedDrones },
    { key: 'flightCount', header: 'Flight count', align: 'right', sortValue: r => r.flightCount, render: r => r.flightCount },
  ];

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">Operator directory</h1>
        <p className="mt-0.5 text-sm text-ink-muted">Individuals associated with operating drones observed by DICON.</p>
      </div>
      <DataTable rows={rows} columns={columns} searchPlaceholder="Search operators…" searchKeys={r => `${r.name} ${r.organization ?? ''}`} />
    </div>
  );
}
