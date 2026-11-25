import { useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSimulation } from '../lib/simulation';
import MetricsStrip from '../components/MetricsStrip';
import MapView from '../components/MapView';
import IntelDrawer from '../components/IntelDrawer';

export default function CommandCenter() {
  const { running, speed, start, pause, reset, setSpeed, resolveIdentity, alerts, createIncidentFromAlert } = useSimulation();
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();

  function handleCreateIncident(droneId: string) {
    const alert = alerts.find(a => a.droneId === droneId);
    if (alert) {
      createIncidentFromAlert(alert.id);
      navigate('/incidents');
    }
  }

  return (
    <div className="flex h-full flex-col">
      <MetricsStrip />
      <div className="flex flex-1 overflow-hidden">
        <div className="relative flex-1">
          <MapView onSelect={setSelected} />
          <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center pt-3">
            <div className="pointer-events-auto flex items-center gap-1.5 rounded-md border border-line bg-surface/90 px-2 py-1.5 backdrop-blur">
              <button onClick={running ? pause : start} className="focus-ring flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-ink hover:bg-surface-raised">
                {running ? <Pause size={13} /> : <Play size={13} />} {running ? 'Pause' : 'Start'}
              </button>
              <button onClick={reset} className="focus-ring flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-ink hover:bg-surface-raised">
                <RotateCcw size={13} /> Reset
              </button>
              <div className="mx-1 h-4 w-px bg-line-strong" />
              <span className="font-mono text-[11px] text-ink-muted">SPEED</span>
              {[1, 2, 4].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`focus-ring rounded px-2 py-1 font-mono text-xs ${speed === s ? 'bg-accent-dim text-accent' : 'text-ink-muted hover:bg-surface-raised'}`}
                >{s}×</button>
              ))}
            </div>
          </div>
          <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-line bg-surface/90 px-2.5 py-1.5 font-mono text-[10.5px] text-ink-muted backdrop-blur">
            All positions are simulated demonstration telemetry, not live detections.
          </div>
        </div>
        {selected && (
          <IntelDrawer
            droneId={selected}
            onClose={() => setSelected(null)}
            onResolve={resolveIdentity}
            onCreateIncident={handleCreateIncident}
          />
        )}
      </div>
    </div>
  );
}
