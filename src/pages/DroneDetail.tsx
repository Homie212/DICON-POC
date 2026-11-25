import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSimulation } from '../lib/simulation';
import { StatusPill } from '../components/Badges';

export default function DroneDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { drones, flights, alerts, liveDrones } = useSimulation();
  const drone = drones.find(d => d.id === id);
  if (!drone) return <div className="p-6 text-sm text-ink-muted">Drone record not found.</div>;

  const isLive = liveDrones.some(l => l.id === drone.id);
  const droneFlights = flights.filter(f => f.droneId === drone.id);
  const droneAlerts = alerts.filter(a => a.droneId === drone.id);

  return (
    <div className="space-y-6 p-6">
      <button onClick={() => navigate('/drones')} className="focus-ring flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={14} /> Back to registry
      </button>

      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="font-mono text-lg font-semibold text-ink">{drone.manufacturer} {drone.model}</h1>
          <StatusPill status={drone.status} />
          {isLive && <span className="rounded bg-safe-dim px-1.5 py-0.5 font-mono text-[10px] text-safe">LIVE ON MAP</span>}
        </div>
        <p className="mt-0.5 text-sm text-ink-muted">{drone.id} · Serial {drone.serialNumber}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink">Identity</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-ink-muted">Owner</dt><dd className="text-ink">{drone.ownerName}{drone.ownerOrg ? ` (${drone.ownerOrg})` : ''}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">Operator</dt><dd className="text-ink">{drone.operatorName}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">Declared purpose</dt><dd className="text-ink">{drone.declaredPurpose}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">Registration state</dt><dd className="text-ink">{drone.registrationState}</dd></div>
          </dl>
        </div>
        <div className="rounded-lg border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink">Data provenance</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-ink-muted">Source</dt><dd className="text-ink">{drone.source}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">Commercial reference</dt><dd className="text-ink">{drone.commercialReference.purchaseId}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">Sold by</dt><dd className="text-ink">{drone.commercialReference.vendorName ?? '—'}</dd></div>
          </dl>
          <p className="mt-3 rounded-md bg-warn-dim px-2.5 py-1.5 text-xs text-warn">Operational subset only — full commercial record lives in MITDrone Admin.</p>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold text-ink">Flight history ({droneFlights.length})</h2>
        <ul className="mt-3 divide-y divide-line">
          {droneFlights.map(f => (
            <li key={f.id} className="flex items-center justify-between py-2 text-sm">
              <span className="font-mono text-xs text-ink-muted">{f.id}</span>
              <span className="text-ink">{new Date(f.start).toLocaleDateString()} · {f.durationMin}min</span>
              <span className="text-ink-muted">{f.location}</span>
              <StatusPill status={f.status} />
            </li>
          ))}
          {droneFlights.length === 0 && <li className="py-2 text-sm text-ink-muted">No flight history on record.</li>}
        </ul>
      </div>

      <div className="rounded-lg border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold text-ink">Alerts ({droneAlerts.length})</h2>
        <ul className="mt-3 divide-y divide-line">
          {droneAlerts.map(a => (
            <li key={a.id} className="flex items-center justify-between py-2 text-sm">
              <span className="text-ink">{a.type}</span>
              <StatusPill status={a.status} />
            </li>
          ))}
          {droneAlerts.length === 0 && <li className="py-2 text-sm text-ink-muted">No alerts on record.</li>}
        </ul>
      </div>
    </div>
  );
}
