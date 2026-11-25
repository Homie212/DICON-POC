import { X, PlaneTakeoff, User, UserCog, Target, Radio, Gauge, Compass, Layers, Database } from 'lucide-react';
import { useSimulation } from '../lib/simulation';
import { IdentityBadge } from './Badges';

function Row({ icon: Icon, label, children }: { icon: any; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-line py-2.5 text-sm">
      <span className="flex items-center gap-1.5 text-ink-muted"><Icon size={13} strokeWidth={1.75} /> {label}</span>
      <span className="text-right font-mono text-ink">{children}</span>
    </div>
  );
}

export default function IntelDrawer({ droneId, onClose, onResolve, onCreateIncident }: {
  droneId: string;
  onClose: () => void;
  onResolve: (id: string) => void;
  onCreateIncident: (droneId: string) => void;
}) {
  const { liveDrones, alerts, flights, drones } = useSimulation();
  const drone = liveDrones.find(d => d.id === droneId);
  if (!drone) return null;

  const commercial = drones.find(d => d.id === drone.id);
  const relatedAlerts = alerts.filter(a => a.droneId === drone.id);
  const relatedFlights = flights.filter(f => f.droneId === drone.id).slice(0, 4);

  return (
    <div className="flex h-full w-[340px] shrink-0 flex-col border-l border-line bg-surface">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex items-center gap-2">
          <PlaneTakeoff size={15} className="text-accent" strokeWidth={1.75} />
          <span className="font-mono text-sm font-semibold text-ink">{drone.id}</span>
        </div>
        <button onClick={onClose} className="focus-ring rounded p-1 text-ink-muted hover:bg-surface-raised hover:text-ink"><X size={15} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <div className="flex items-center justify-between py-3">
          <span className="text-sm font-medium text-ink">{drone.manufacturer} {drone.model}</span>
          <IdentityBadge status={drone.identityStatus} />
        </div>

        <Row icon={Radio} label="Serial">{drone.serialNumber ?? '—'}</Row>
        <Row icon={User} label="Owner">{commercial?.ownerName ?? drone.ownerRef ?? 'Unresolved'}</Row>
        <Row icon={UserCog} label="Operator">{drone.operatorName ?? 'Unresolved'}</Row>
        <Row icon={Target} label="Declared purpose">{drone.purpose ?? '—'}</Row>
        <Row icon={Compass} label="Position">{drone.lat.toFixed(4)}, {drone.lng.toFixed(4)}</Row>
        <Row icon={Layers} label="Altitude">{drone.altitude} m</Row>
        <Row icon={Gauge} label="Speed / heading">{drone.speedKph} kph · {drone.heading}°</Row>
        <Row icon={Radio} label="Signal">{drone.signal}%</Row>
        <Row icon={Database} label="Detection source">{drone.detectionSource}</Row>

        {commercial && (
          <div className="mt-3 rounded-md border border-line-strong bg-canvas p-2.5 text-xs text-ink-muted">
            <div className="mb-1 font-mono text-[10.5px] uppercase tracking-wide text-ink-muted">Provenance</div>
            Commercial reference: purchase {commercial.commercialReference.purchaseId} via {commercial.commercialReference.vendorName ?? 'unknown vendor'}.
            Source: {commercial.source}.
          </div>
        )}

        {drone.identityStatus !== 'MATCHED' && (
          <button onClick={() => onResolve(drone.id)} className="focus-ring mt-3 w-full rounded-md bg-accent py-2 text-xs font-semibold text-[#1A1204] hover:brightness-95">
            Attempt identity resolution
          </button>
        )}

        <div className="mt-4">
          <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-wide text-ink-muted">Related alerts ({relatedAlerts.length})</div>
          <div className="space-y-1.5">
            {relatedAlerts.slice(0, 3).map(a => (
              <div key={a.id} className="rounded border border-line bg-canvas px-2 py-1.5 text-xs text-ink-muted">{a.type} — {a.status}</div>
            ))}
            {relatedAlerts.length === 0 && <div className="text-xs text-ink-muted">No alerts for this drone.</div>}
          </div>
        </div>

        <div className="my-4">
          <div className="mb-1.5 font-mono text-[10.5px] uppercase tracking-wide text-ink-muted">Flight history ({relatedFlights.length})</div>
          <div className="space-y-1.5">
            {relatedFlights.map(f => (
              <div key={f.id} className="rounded border border-line bg-canvas px-2 py-1.5 text-xs text-ink-muted">
                {new Date(f.start).toLocaleDateString()} · {f.durationMin}min · {f.location}
              </div>
            ))}
            {relatedFlights.length === 0 && <div className="text-xs text-ink-muted">No prior flights on record.</div>}
          </div>
        </div>

        <button onClick={() => onCreateIncident(drone.id)} className="focus-ring mb-4 w-full rounded-md border border-line-strong py-2 text-xs font-medium text-ink hover:bg-surface-raised">
          Create incident from this drone
        </button>
      </div>
    </div>
  );
}
