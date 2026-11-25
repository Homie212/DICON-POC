import { Play, Pause, RotateCcw, PlusCircle, ScanSearch, MapPinned, TriangleAlert, RadioTower, FileWarning } from 'lucide-react';
import { useSimulation } from '../lib/simulation';

function ControlButton({ icon: Icon, label, onClick, tone = 'default' }: { icon: any; label: string; onClick: () => void; tone?: 'default' | 'critical' }) {
  return (
    <button
      onClick={onClick}
      className={`focus-ring flex items-center gap-2 rounded-md border px-3 py-2.5 text-sm font-medium transition-colors ${
        tone === 'critical'
          ? 'border-critical-dim bg-critical-dim text-critical hover:brightness-110'
          : 'border-line-strong bg-surface-raised text-ink hover:border-accent'
      }`}
    >
      <Icon size={15} strokeWidth={1.75} /> {label}
    </button>
  );
}

export default function DemoControls() {
  const {
    running, speed, start, pause, reset, setSpeed, liveDrones,
    addUnknownDrone, resolveIdentity, triggerRestrictedZoneEntry, triggerAlert, triggerLostTelemetry,
  } = useSimulation();

  const firstUnresolved = liveDrones.find(d => d.identityStatus !== 'MATCHED');

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-lg font-semibold text-ink">Demo control center</h1>
        <p className="mt-0.5 text-sm text-ink-muted">Restricted to DEMO_ADMIN. Use these controls to drive a live presentation of the DICON workflow.</p>
      </div>

      <div className="rounded-lg border border-line bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-ink">Simulation</h2>
        <div className="flex flex-wrap gap-2">
          <ControlButton icon={running ? Pause : Play} label={running ? 'Pause simulation' : 'Start simulation'} onClick={running ? pause : start} />
          <ControlButton icon={RotateCcw} label="Reset simulation" onClick={reset} />
          {[1, 2, 4].map(s => (
            <button key={s} onClick={() => setSpeed(s)} className={`focus-ring rounded-md border px-3 py-2.5 font-mono text-sm ${speed === s ? 'border-accent bg-accent-dim text-accent' : 'border-line-strong text-ink-muted hover:bg-surface-raised'}`}>
              {s}× speed
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-line bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-ink">Scenario injection</h2>
        <div className="flex flex-wrap gap-2">
          <ControlButton icon={PlusCircle} label="Add unknown drone" onClick={addUnknownDrone} />
          <ControlButton icon={ScanSearch} label="Resolve identity" onClick={() => firstUnresolved && resolveIdentity(firstUnresolved.id)} />
          <ControlButton icon={MapPinned} label="Trigger restricted-zone entry" onClick={triggerRestrictedZoneEntry} />
          <ControlButton icon={TriangleAlert} label="Trigger alert" tone="critical" onClick={() => triggerAlert('System Alert')} />
          <ControlButton icon={RadioTower} label="Trigger lost telemetry" onClick={triggerLostTelemetry} />
          <ControlButton icon={FileWarning} label="Trigger authorization mismatch" tone="critical" onClick={() => triggerAlert('Authorization Mismatch')} />
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-line-strong p-4 text-sm text-ink-muted">
        Every action here writes to the alerts/incidents feed exactly as it would from real detections, so the rest of the platform (Command Center, Alerts, Incidents) updates live. This mirrors how the simulator is designed to be swapped for an approved telemetry feed later.
      </div>
    </div>
  );
}
