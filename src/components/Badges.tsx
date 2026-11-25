const SEVERITY_TONE: Record<string, string> = {
  Low: 'bg-surface-raised text-ink-muted',
  Medium: 'bg-warn-dim text-warn',
  High: 'bg-critical-dim text-critical',
  Critical: 'bg-critical-dim text-critical',
};

const IDENTITY_TONE: Record<string, string> = {
  MATCHED: 'bg-safe-dim text-safe',
  'PARTIAL MATCH': 'bg-warn-dim text-warn',
  UNRESOLVED: 'bg-critical-dim text-critical',
  CONFLICT: 'bg-critical-dim text-critical',
  SIMULATED: 'bg-surface-raised text-ink-muted',
};

const STATUS_TONE: Record<string, string> = {
  Open: 'bg-critical-dim text-critical',
  Acknowledged: 'bg-warn-dim text-warn',
  Investigating: 'bg-warn-dim text-warn',
  Resolved: 'bg-safe-dim text-safe',
  Closed: 'bg-surface-raised text-ink-muted',
};

export function SeverityBadge({ severity }: { severity: string }) {
  return <span className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-wide ${SEVERITY_TONE[severity] ?? 'bg-surface-raised text-ink-muted'}`}>{severity}</span>;
}

export function IdentityBadge({ status }: { status: string }) {
  return <span className={`inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[11px] font-medium tracking-wide ${IDENTITY_TONE[status] ?? 'bg-surface-raised text-ink-muted'}`}>{status}</span>;
}

export function StatusPill({ status }: { status: string }) {
  return <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${STATUS_TONE[status] ?? 'bg-surface-raised text-ink-muted'}`}>{status}</span>;
}
