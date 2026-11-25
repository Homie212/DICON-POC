import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSimulation } from '../lib/simulation';
import { SeverityBadge, StatusPill } from '../components/Badges';

const NEXT_STATUS: Record<string, string> = { Open: 'Investigating', Investigating: 'Resolved', Resolved: 'Closed' };

export default function IncidentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { incidents, updateIncidentStatus, drones } = useSimulation();
  const incident = incidents.find(i => i.id === id);
  if (!incident) return <div className="p-6 text-sm text-ink-muted">Incident not found.</div>;

  const drone = drones.find(d => d.id === incident.droneId);
  const next = NEXT_STATUS[incident.status];

  return (
    <div className="space-y-6 p-6">
      <button onClick={() => navigate('/incidents')} className="focus-ring flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink">
        <ArrowLeft size={14} /> Back to incidents
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-mono text-lg font-semibold text-ink">{incident.id}</h1>
            <SeverityBadge severity={incident.severity} />
            <StatusPill status={incident.status} />
          </div>
          <p className="mt-0.5 text-sm text-ink-muted">{incident.type} · Drone {incident.droneId} · {incident.location}</p>
        </div>
        {next && (
          <button onClick={() => updateIncidentStatus(incident.id, next)} className="focus-ring rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-[#1A1204] hover:brightness-95">
            Advance to {next}
          </button>
        )}
      </div>

      <div className="rounded-lg border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold text-ink">Description</h2>
        <p className="mt-2 text-sm text-ink-muted">{incident.description}</p>
      </div>

      {drone && (
        <div className="rounded-lg border border-line bg-surface p-4">
          <h2 className="text-sm font-semibold text-ink">Drone identity</h2>
          <dl className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <div><dt className="text-xs text-ink-muted">Model</dt><dd className="text-ink">{drone.manufacturer} {drone.model}</dd></div>
            <div><dt className="text-xs text-ink-muted">Serial</dt><dd className="font-mono text-ink">{drone.serialNumber}</dd></div>
            <div><dt className="text-xs text-ink-muted">Owner</dt><dd className="text-ink">{drone.ownerName}</dd></div>
            <div><dt className="text-xs text-ink-muted">Operator</dt><dd className="text-ink">{drone.operatorName}</dd></div>
          </dl>
        </div>
      )}

      <div className="rounded-lg border border-line bg-surface p-4">
        <h2 className="text-sm font-semibold text-ink">Timeline</h2>
        <ul className="mt-3 space-y-3 border-l border-line-strong pl-4">
          {incident.timeline.map((t, i) => (
            <li key={i} className="relative text-sm">
              <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-accent" />
              <div className="text-ink">{t.event}</div>
              <div className="font-mono text-xs text-ink-muted">{new Date(t.time).toLocaleString()} · {t.actor}</div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
