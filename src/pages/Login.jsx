import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Activity, LogIn, AlertTriangle } from 'lucide-react';
import { useAuth } from '../AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const from = location.state?.from?.pathname || '/app';

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email.trim(), password);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.error || `Cannot reach the API (${err.message})`;
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-blue-500 p-2.5 rounded-xl"><Activity size={26} className="text-white" /></div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-wide">MediBot</h1>
            <p className="text-slate-400 text-sm">Clinic dashboard</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-5">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Sign in</h2>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="admin@medibot.local"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            <LogIn size={18} />
            {busy ? 'Signing in...' : 'Sign in'}
          </button>

          <p className="text-xs text-gray-400 text-center leading-relaxed">
            Set <span className="font-mono">ADMIN_EMAIL</span> and{' '}
            <span className="font-mono">ADMIN_PASSWORD</span> in the backend{' '}
            <span className="font-mono">.env</span> to use your own account.
          </p>
        </form>
      </div>
    </div>
  );
}
