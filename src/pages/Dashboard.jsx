import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Moon, Sun, Bell, Calendar, User, Activity, Eye, X, RefreshCw, Check, Phone, AlertTriangle, LogOut, PhoneCall } from 'lucide-react';
import api from '../api';
import { useAuth } from '../AuthContext';

const STATUS_STYLES = {
  Confirmed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Completed: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Incomplete: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Abandoned: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200',
  Emergency: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
  Cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  Duplicate: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

// Older API responses only have { name, date, reason, time_slot }.
const statusOf = (apt) => apt.status || (apt.date ? 'Confirmed' : 'Incomplete');
const firstLetter = (name) => (name || '?').trim().charAt(0).toUpperCase() || '?';

export default function Dashboard({ darkMode, setDarkMode }) {
  const { user, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  function loadAppointments() {
    setLoading(true);
    setError('');
    api.get('/api/appointments')
      .then(({ data }) => setAppointments(Array.isArray(data) ? data : (data?.data || [])))
      .catch((err) => setError(err.response?.data?.error || 'Cannot reach the API'))
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadAppointments(); }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  const filteredAppointments = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return appointments.filter((apt) => {
      const matchesSearch = !q ||
        (apt.name || '').toLowerCase().includes(q) ||
        (apt.phone || '').includes(q) ||
        (apt.reason || '').toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'All' || statusOf(apt) === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  const counts = useMemo(() => ({
    total: appointments.length,
    confirmed: appointments.filter((a) => statusOf(a) === 'Confirmed').length,
    incomplete: appointments.filter((a) => ['Incomplete', 'Abandoned'].includes(statusOf(a))).length,
    emergency: appointments.filter((a) => statusOf(a) === 'Emergency').length,
  }), [appointments]);

  async function updateStatus(apt, status) {
    if (!apt?._id) { setSelectedPatient(null); return; }
    setSaving(true);
    try {
      const { data } = await api.patch(`/api/appointments/${apt._id}`, { status });
      setAppointments((rows) => rows.map((r) => (r._id === apt._id ? { ...r, ...data } : r)));
      setSelectedPatient((p) => (p && p._id === apt._id ? { ...p, ...data } : p));
    } catch (err) {
      setError(err.response?.data?.error || `Could not mark this appointment as ${status}`);
    } finally {
      setSaving(false);
    }
  }

  const cards = [
    { label: 'Total Patients', value: counts.total, gradient: 'from-blue-500 to-blue-600', ring: 'text-blue-100' },
    { label: 'Confirmed', value: counts.confirmed, gradient: 'from-emerald-500 to-emerald-600', ring: 'text-emerald-100' },
    { label: 'Need Follow-up', value: counts.incomplete, gradient: 'from-orange-500 to-orange-600', ring: 'text-orange-100' },
    { label: 'Emergency', value: counts.emergency, gradient: 'from-red-500 to-red-600', ring: 'text-red-100' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-white">

      {/* --- SIDEBAR --- */}
      <div className="hidden md:flex w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6 flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-500 p-2 rounded-lg"><Activity size={24} /></div>
          <h1 className="text-xl font-bold tracking-wide">MediBot</h1>
        </div>
        <nav className="flex-1 space-y-2">
          <div className="bg-blue-600 text-white p-3 rounded-lg flex items-center gap-3 cursor-pointer">
            <Calendar size={20} /> Dashboard
          </div>
          <Link to="/calls" className="p-3 rounded-lg flex items-center gap-3 hover:bg-slate-700 transition-colors">
            <PhoneCall size={20} /> Call Log
          </Link>
          <div className="p-3 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-slate-700 transition-colors">
            <User size={20} /> Patients
          </div>
        </nav>
        <div className="border-t border-slate-700 pt-4 mt-4">
          <div className="text-xs text-slate-400 mb-2 truncate" title={user?.email}>{user?.email}</div>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 text-slate-100 py-2 rounded-lg transition-colors"
          >
            <LogOut size={16} /> Log out
          </button>
          <div className="text-xs text-slate-500 text-center mt-3">© 2024 Tanish Saini</div>
        </div>
      </div>

      {/* --- MAIN --- */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* TOP BAR */}
        <div className="bg-white dark:bg-gray-800 p-4 shadow-sm flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search name, phone or reason..."
              className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadAppointments} title="Refresh"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
            <button onClick={() => setDarkMode(!darkMode)} title="Toggle theme"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
            </button>
            <div className="relative">
              <Bell size={20} className="text-gray-500 cursor-pointer" />
              {counts.emergency > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {counts.emergency}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* BODY */}
        <div className="p-6 md:p-8 overflow-y-auto">

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-900 dark:bg-red-900/30 dark:text-red-300">
              <AlertTriangle size={18} />
              <span className="flex-1">{error}</span>
              <button onClick={loadAppointments} className="font-semibold underline">Retry</button>
            </div>
          )}

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {cards.map((card) => (
              <div key={card.label} className={`bg-gradient-to-r ${card.gradient} p-6 rounded-2xl text-white shadow-lg`}>
                <p className={card.ring}>{card.label}</p>
                <h2 className="text-3xl font-bold mt-2">{card.value}</h2>
              </div>
            ))}
          </div>

          {/* FILTER CHIPS */}
          <div className="flex flex-wrap gap-2 mb-4">
            {['All', 'Confirmed', 'Incomplete', 'Emergency', 'Cancelled'].map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  statusFilter === s
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-400'
                }`}>
                {s}
              </button>
            ))}
          </div>

          {/* TABLE */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Recent Appointments</h3>
              <span className="text-sm text-gray-400">{filteredAppointments.length} shown</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm">
                    <th className="p-4 font-medium">Patient</th>
                    <th className="p-4 font-medium">Date</th>
                    <th className="p-4 font-medium">Time</th>
                    <th className="p-4 font-medium">Reason</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && appointments.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-400">Loading appointments...</td></tr>
                  ) : filteredAppointments.length === 0 ? (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-400">No patients found.</td></tr>
                  ) : (
                    filteredAppointments.map((apt, index) => {
                      const status = statusOf(apt);
                      return (
                        <tr key={apt._id || index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm">
                                {firstLetter(apt.name)}
                              </div>
                              <div>
                                <div className="font-medium">{apt.name || 'Unknown'}</div>
                                {apt.phone && <div className="text-xs text-gray-400">{apt.phone}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-gray-500 dark:text-gray-300">{apt.date || 'Pending'}</td>
                          <td className="p-4 text-gray-500 dark:text-gray-300">{apt.time_slot_display || apt.time_slot || 'Pending'}</td>
                          <td className="p-4 text-gray-500 dark:text-gray-300">{apt.reason || 'Pending'}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[status] || STATUS_STYLES.Incomplete}`}>
                              {status}
                            </span>
                          </td>
                          <td className="p-4">
                            <button onClick={() => setSelectedPatient(apt)}
                              className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm font-medium">
                              <Eye size={16} /> View
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* --- MODAL --- */}
      {selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedPatient(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setSelectedPatient(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 dark:hover:text-white">
              <X size={24} />
            </button>
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl mx-auto mb-4">
                {firstLetter(selectedPatient.name)}
              </div>
              <h2 className="text-2xl font-bold dark:text-white">{selectedPatient.name || 'Unknown'}</h2>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[statusOf(selectedPatient)] || STATUS_STYLES.Incomplete}`}>
                {statusOf(selectedPatient)}
              </span>
            </div>
            <div className="space-y-4 text-gray-600 dark:text-gray-300">
              {selectedPatient.phone && (
                <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                  <span className="font-medium flex items-center gap-2"><Phone size={14} /> Phone:</span>
                  <span>{selectedPatient.phone}</span>
                </div>
              )}
              <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                <span className="font-medium">Date:</span> <span>{selectedPatient.date || 'Pending'}</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                <span className="font-medium">Time:</span> <span>{selectedPatient.time_slot_display || selectedPatient.time_slot || 'Pending'}</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                <span className="font-medium">Reason:</span> <span>{selectedPatient.reason || 'Pending'}</span>
              </div>
              <div className="flex justify-between border-b pb-2 dark:border-gray-700">
                <span className="font-medium">Booking For:</span> <span>{selectedPatient.booking_for || 'Self'}</span>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button disabled={saving} onClick={() => updateStatus(selectedPatient, 'Completed')}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                <Check size={16} /> Done
              </button>
              <button disabled={saving} onClick={() => updateStatus(selectedPatient, 'Cancelled')}
                className="flex-1 bg-rose-600 text-white py-2 rounded-lg hover:bg-rose-700 transition-colors disabled:opacity-50">
                Cancel
              </button>
            </div>
            <button onClick={() => setSelectedPatient(null)}
              className="w-full mt-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
