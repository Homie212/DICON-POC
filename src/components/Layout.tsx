import { NavLink, useNavigate } from 'react-router-dom';
import {
  Radar, PlaneTakeoff, Users, ListTree, TriangleAlert, FileWarning,
  BarChart3, ScrollText, SlidersHorizontal, LogOut,
} from 'lucide-react';
import { useSimulation } from '../lib/simulation';

const NAV = [
  { to: '/', label: 'Command Center', icon: Radar, end: true },
  { to: '/drones', label: 'Drone Registry', icon: PlaneTakeoff },
  { to: '/operators', label: 'Operators', icon: Users },
  { to: '/flights', label: 'Flight History', icon: ListTree },
  { to: '/alerts', label: 'Alerts', icon: TriangleAlert },
  { to: '/incidents', label: 'Incidents', icon: FileWarning },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/audit', label: 'Audit', icon: ScrollText },
  { to: '/demo-controls', label: 'Demo Controls', icon: SlidersHorizontal },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { alerts } = useSimulation();
  const openAlerts = alerts.filter(a => a.status === 'Open').length;

  return (
    <div className="flex h-full bg-canvas">
      <aside className="flex w-56 shrink-0 flex-col border-r border-line bg-surface">
        <div className="flex items-center gap-2 px-4 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded bg-accent-dim text-accent">
            <Radar size={16} strokeWidth={2} />
          </div>
          <div>
            <div className="text-sm font-semibold leading-none text-ink">DICON</div>
            <div className="text-[10.5px] leading-none text-ink-muted mt-0.5">Drone Situational Awareness</div>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5 pt-2">
          {NAV.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `focus-ring flex items-center justify-between rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors ${
                  isActive ? 'bg-accent-dim text-accent' : 'text-ink-muted hover:bg-surface-raised hover:text-ink'
                }`
              }
            >
              <span className="flex items-center gap-2.5">
                <item.icon size={16} strokeWidth={1.75} />
                {item.label}
              </span>
              {item.to === '/alerts' && openAlerts > 0 && (
                <span className="rounded-full bg-critical-dim px-1.5 py-0.5 font-mono text-[10px] font-semibold text-critical">{openAlerts}</span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-line px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-raised text-xs font-medium text-ink">JR</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-ink">j.reyes@dicon.gov-demo</div>
              <div className="text-[10.5px] text-ink-muted">DICON_COMMAND_OPERATOR</div>
            </div>
            <button onClick={() => navigate('/login')} className="focus-ring rounded p-1 text-ink-muted hover:bg-surface-raised hover:text-ink" aria-label="Sign out">
              <LogOut size={14} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-line bg-surface px-5">
          <div className="flex items-center gap-2 font-mono text-xs text-ink-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-safe" />
            SYSTEM NOMINAL
            <span className="mx-2 text-line-strong">|</span>
            <span className="rounded bg-warn-dim px-1.5 py-0.5 text-warn">DEMO ENVIRONMENT — SIMULATED TELEMETRY</span>
          </div>
          <div className="font-mono text-xs text-ink-muted">{new Date().toUTCString().slice(0, 22)} UTC</div>
        </header>
        <main className="min-w-0 flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
