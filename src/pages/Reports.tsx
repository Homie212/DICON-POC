import { FileDown } from 'lucide-react';
import { useSimulation } from '../lib/simulation';

const REPORTS = [
  { id: 'flight-log', name: 'Flight log', desc: 'All recorded flights with operator, duration, and status.' },
  { id: 'alert-summary', name: 'Alert summary', desc: 'All alerts raised during this session.' },
  { id: 'incident-summary', name: 'Incident summary', desc: 'All incidents, severity, and current status.' },
  { id: 'zone-activity', name: 'Zone activity', desc: 'Monitored and restricted zone definitions.' },
];

function toCsv(rows: Record<string, any>[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  rows.forEach(r => lines.push(headers.map(h => JSON.stringify(r[h] ?? '')).join(',')));
  return lines.join('\n');
}

export default function Reports() {
  const { flights, alerts, incidents, zones } = useSimulation();

  function rowsFor(id: string) {
    switch (id) {
      case 'flight-log': return flights;
      case 'alert-summary': return alerts;
      case 'incident-summary': return incidents.map(i => ({ id: i.id, type: i.type, severity: i.severity, status: i.status, droneId: i.droneId }));
      case 'zone-activity': return zones.map(z => ({ id: z.id, name: z.name, type: z.type, radiusM: z.radiusM }));
      default: return [];
    }
  }

  function download(id: string) {
    const csv = toCsv(rowsFor(id));
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${id}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">Reports</h1>
        <p className="mt-0.5 text-sm text-ink-muted">Export operational summaries from this session as CSV.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {REPORTS.map(r => (
          <div key={r.id} className="flex items-center justify-between rounded-lg border border-line bg-surface p-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">{r.name}</h2>
              <p className="mt-1 text-xs text-ink-muted">{r.desc}</p>
            </div>
            <button onClick={() => download(r.id)} className="focus-ring flex items-center gap-1.5 rounded-md bg-accent px-2.5 py-1.5 text-xs font-semibold text-[#1A1204] hover:brightness-95">
              <FileDown size={13} /> Export
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
