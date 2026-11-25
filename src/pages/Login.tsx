import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Radar, Loader2, ShieldAlert } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('j.reyes@dicon.gov-demo');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!password) {
      setError('Access denied — password required.');
      return;
    }
    setLoading(true);
    setTimeout(() => { setLoading(false); navigate('/'); }, 700);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 font-sans">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-accent-dim text-accent">
            <Radar size={18} strokeWidth={2} />
          </div>
          <div>
            <div className="text-base font-semibold leading-none text-ink">DICON</div>
            <div className="text-xs leading-none text-ink-muted mt-0.5">Drone Situational Awareness</div>
          </div>
        </div>

        <div className="rounded-lg border border-line bg-surface p-6">
          <div className="mb-1 flex items-center justify-between">
            <h1 className="text-lg font-semibold text-ink">Secure access</h1>
            <span className="rounded bg-warn-dim px-1.5 py-0.5 font-mono text-[10px] text-warn">DEMO ENVIRONMENT</span>
          </div>
          <p className="text-sm text-ink-muted">Authorized operational personnel only. All access is logged.</p>

          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-muted">Username / email</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="focus-ring w-full rounded-md border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-ink-muted">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="focus-ring w-full rounded-md border border-line bg-canvas px-3 py-2 pr-9 text-sm text-ink placeholder:text-ink-muted focus:outline-none"
                  placeholder="••••••••••"
                />
                <button type="button" onClick={() => setShowPw(s => !s)} className="focus-ring absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink">
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && <div className="flex items-center gap-1.5 rounded-md bg-critical-dim px-3 py-2 text-xs text-critical"><ShieldAlert size={13} /> {error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="focus-ring flex w-full items-center justify-center gap-2 rounded-md bg-accent py-2.5 text-sm font-medium text-[#1A1204] transition-colors hover:brightness-95 disabled:opacity-70"
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              {loading ? 'Authenticating…' : 'Sign in'}
            </button>
          </form>
        </div>

        <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-ink-muted">
          <span>SYSTEM STATUS: NOMINAL</span>
          <span>SIM ENGINE: READY</span>
        </div>
      </div>
    </div>
  );
}
