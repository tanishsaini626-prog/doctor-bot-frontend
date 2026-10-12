import { useState, useEffect } from 'react';
import api from '../api';
import { Calendar as CalendarIcon, Clock, User, Filter, RefreshCw, AlertCircle } from 'lucide-react';

export default function Calendar() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const [apptsRes, docsRes] = await Promise.all([
        api.get('/api/appointments'),
        api.get('/api/doctors').catch(() => ({ data: [] })),
      ]);
      setAppointments(apptsRes.data || []);
      setDoctors(docsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch schedule data');
    } finally {
      setLoading(false);
    }
  }

  const filteredAppts = appointments.filter(a => {
    if (selectedDoctor !== 'All' && a.doctor !== selectedDoctor) return false;
    return true;
  });

  const slots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
    '05:00 PM', '06:00 PM', '07:00 PM', '08:00 PM'
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white">Appointments Schedule</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{filteredAppts.length} appointments scheduled</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-slate-400" />
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm rounded-xl px-3 py-2 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Doctors</option>
              {doctors.map(d => (
                <option key={d._id} value={d.name}>{d.name} ({d.specialty})</option>
              ))}
            </select>
          </div>
          <button
            onClick={loadData}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
            title="Refresh schedule"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading schedule...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slots.map(slot => {
            const inSlot = filteredAppts.filter(a => {
              const time = a.time_slot_display || a.time_slot || '';
              return time.toLowerCase().includes(slot.toLowerCase().replace(':00', ''));
            });

            return (
              <div key={slot} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-3 mb-3">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-sm">
                    <Clock size={16} className="text-blue-500" />
                    <span>{slot}</span>
                  </div>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium">
                    {inSlot.length} booked
                  </span>
                </div>

                <div className="space-y-2.5">
                  {inSlot.length === 0 ? (
                    <div className="text-xs text-slate-400 italic py-2">No bookings for this slot</div>
                  ) : (
                    inSlot.map(appt => (
                      <div key={appt._id} className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-slate-800 dark:text-white truncate">{appt.name || 'Unknown Patient'}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300">
                            {appt.status || 'Confirmed'}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                          <User size={12} />
                          <span>{appt.reason || 'General Checkup'}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
