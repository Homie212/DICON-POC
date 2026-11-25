import { Radar, CheckCircle2, HelpCircle, TriangleAlert, MapPinned } from 'lucide-react';
import { useSimulation } from '../lib/simulation';

function Metric({ icon: Icon, label, value, tone }: { icon: any; label: string; value: string | number; tone?: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <Icon size={14} className={tone ?? 'text-ink-muted'} strokeWidth={1.75} />
      <div>
        <div className="font-mono text-sm font-semibold leading-none text-ink">{value}</div>
        <div className="mt-0.5 text-[10.5px] uppercase tracking-wide text-ink-muted">{label}</div>
      </div>
    </div>
  );
}

export default function MetricsStrip() {
  const { liveDrones, alerts, zones } = useSimulation();
  const identified = liveDrones.filter(d => d.identityStatus === 'MATCHED').length;
  const unknown = liveDrones.filter(d => d.identityStatus === 'UNRESOLVED' || d.identityStatus === 'PARTIAL MATCH').length;
  const openAlerts = alerts.filter(a => a.status === 'Open').length;

  return (
    <div className="flex divide-x divide-line border-b border-line bg-surface">
      <Metric icon={Radar} label="Active detections" value={liveDrones.length} tone="text-accent" />
      <Metric icon={CheckCircle2} label="Identified" value={identified} tone="text-safe" />
      <Metric icon={HelpCircle} label="Unknown" value={unknown} tone="text-critical" />
      <Metric icon={TriangleAlert} label="Active alerts" value={openAlerts} tone={openAlerts > 0 ? 'text-critical' : 'text-ink-muted'} />
      <Metric icon={MapPinned} label="Monitored zones" value={zones.length} />
    </div>
  );
}
