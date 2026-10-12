import { useState, useEffect } from 'react';
import api from '../api';
import { Users, Search, Phone, Calendar, Clock, Eye, AlertCircle, X, CheckCircle } from 'lucide-react';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/patients');
      setPatients(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load patient records');
    } finally {
      setLoading(false);
    }
  }

  const filteredPatients = patients.filter(p => {
    const query = search.toLowerCase();
    return (p.name || '').toLowerCase().includes(query) || (p.phone || '').includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white">Patient Directory</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{patients.length} unique patients registered</p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading patients...</div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700/60 text-slate-400">
          No patients found.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-300 text-xs font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4">Patient</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Total Visits</th>
                  <th className="p-4">Last Visit</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-sm">
                {filteredPatients.map(p => (
                  <tr key={p.phone} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-sm">
                          {(p.name || 'P')[0]}
                        </div>
                        <span className="font-semibold text-slate-800 dark:text-white">{p.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Phone size={14} className="text-slate-400" />
                        <span>{p.phone}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50">
                        {p.visits} {p.visits === 1 ? 'visit' : 'visits'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-xs">
                      {p.lastVisit ? new Date(p.lastVisit).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelectedPatient(p)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        <Eye size={14} /> History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedPatient && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setSelectedPatient(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-700/60 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-blue-500/20">
                {(selectedPatient.name || 'P')[0]}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">{selectedPatient.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Phone size={12} /> {selectedPatient.phone}
                </p>
              </div>
            </div>

            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Visit History ({selectedPatient.history.length})</h4>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {selectedPatient.history.map((h, i) => (
                <div key={h._id || i} className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-800 dark:text-white flex items-center gap-1.5">
                      <Calendar size={13} className="text-blue-500" />
                      {h.date || 'Pending'} {h.time_slot_display ? `(${h.time_slot_display})` : ''}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300">
                      {h.status || 'Confirmed'}
                    </span>
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    <strong>Reason:</strong> {h.reason || 'General Checkup'}
                  </div>
                  {h.doctor && (
                    <div className="text-slate-500 dark:text-slate-400">
                      <strong>Doctor:</strong> {h.doctor}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedPatient(null)}
              className="mt-4 w-full py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
