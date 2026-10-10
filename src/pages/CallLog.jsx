import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Calendar, User, RefreshCw, PhoneCall, AlertTriangle, ChevronDown, LogOut } from 'lucide-react';
import api from '../api';
import { useAuth } from '../AuthContext';

const CALL_STYLES = {
  booked: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  emergency: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  'wrong-number': 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  callback: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  incomplete: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  abandoned: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  duplicate: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'in-progress': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
};

function statusFromLogs(log) {
  const last = log.turns?.[log.turns.length - 1];
  return (last?.bot_action || 'in-progress').replace(/^asked:.*$/, 'in-progress');
}

export default function CallLog({ darkMode, setDarkMode }) {
  const { user, logout } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  function load() {
    setLoading(true);
    setError('');
    api.get('/api/calls')
      .then(({ data }) => setLogs(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.response?.data?.error || 'Cannot reach the API'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-white">
      <div className="hidden md:flex w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6 flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-500 p-2 rounded-lg"><Activity size={24} /></div>
          <h1 className="text-xl font-bold tracking-wide">MediBot</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <Link to="/" className="p-3 rounded-lg flex items-center gap-3 hover:bg-slate-700 transition-colors">
            <Calendar size={20} /> Dashboard
          </Link>
          <div className="bg-blue-600 text-white p-3 rounded-lg flex items-center gap-3 cursor-pointer">
            <PhoneCall size={20} /> Call Log
          </div>
          <div className="p-3 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-slate-700 transition-colors">
            <User size={20} /> Patients
          </div>
        </nav>
        <div className="border-t border-slate-700 pt-4 mt-4">
          <div className="text-xs text-slate-400 mb-2 truncate">{user?.email}</div>
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-100 py-2 rounded-lg transition-colors">
            <LogOut size={16} /> Log out
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex justify-between items-center">
          <h2 className="text-lg font-semibold">Call Log</h2>
          <button onClick={load} title="Refresh"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="p-6 md:p-8 overflow-y-auto space-y-3">
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300">
              <AlertTriangle size={18} /><span className="flex-1">{error}</span>
              <button onClick={load} className="font-semibold underline">Retry</button>
            </div>
          )}

          {loading && logs.length === 0 && <p className="text-gray-400">Loading calls...</p>}
          {!loading && logs.length === 0 && !error && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-10 text-center text-gray-400">
              No calls yet. Every phone call will appear here with its full transcript.
            </div>
          )}

          {logs.map((log) => {
            const status = statusFromLogs(log);
            const open = openId === log._id;
            return (
              <div key={log._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenId(open ? null : log._id)}
                  className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                      <PhoneCall size={16} />
                    </div>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{log.phone || 'Unknown number'}</div>
                      <div className="text-xs text-gray-400 font-mono truncate">{log.call_sid}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-400 hidden sm:block">{log.turns?.length || 0} turns</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${CALL_STYLES[status] || CALL_STYLES['in-progress']}`}>
                      {status}
                    </span>
                    <ChevronDown size={18} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {open && (
                  <div className="border-t dark:border-gray-700 p-4 space-y-3">
                    {(log.turns || []).map((turn, i) => (
                      <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-2">
                        <span className="text-xs text-gray-400 w-24 shrink-0">
                          {turn.at ? new Date(turn.at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : `turn ${i + 1}`}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm">{turn.transcript || <em className="text-gray-400">(no speech)</em>}</p>
                          {turn.bot_action && (
                            <span className="inline-block mt-1 text-[11px] px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300">
                              bot: {turn.bot_action}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!log.turns || log.turns.length === 0) && <p className="text-sm text-gray-400">No turns recorded.</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
