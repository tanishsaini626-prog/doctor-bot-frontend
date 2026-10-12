import { useState, useEffect } from 'react';
import api from '../api';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { BarChart3, TrendingUp, PhoneCall, CheckCircle, AlertTriangle, RefreshCw, AlertCircle } from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/analytics');
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not build analytics report');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-12 text-center text-slate-400">Building clinic analytics...</div>;
  if (error) return (
    <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-3 text-sm">
      <AlertCircle size={18} /> <span>{error}</span>
    </div>
  );

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <BarChart3 size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white">Clinic Performance Analytics</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Real-time stats, conversion metrics & call patterns</p>
          </div>
        </div>
        <button
          onClick={loadAnalytics}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Total Calls</p>
            <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{data.totals?.calls || 0}</h4>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl"><PhoneCall size={22} /></div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Bookings Made</p>
            <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{data.totals?.appointments || 0}</h4>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-xl"><CheckCircle size={22} /></div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Conversion Rate</p>
            <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{data.totals?.conversion || 0}%</h4>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 rounded-xl"><TrendingUp size={22} /></div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Emergency Calls</p>
            <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{data.totals?.emergency || 0}</h4>
          </div>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 rounded-xl"><AlertTriangle size={22} /></div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Volume */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4">14-Day Call & Booking Trend</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.perDay || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="calls" fill="#3B82F6" name="Calls" radius={[4, 4, 0, 0]} />
                <Bar dataKey="bookings" fill="#10B981" name="Bookings" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Hourly Call Distribution</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.hours || []}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.2} name="Calls" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Top reasons + status breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Top Reasons for Visit</h4>
          {(data.reasons || []).length === 0 ? (
            <p className="text-sm text-slate-400">No reasons recorded yet.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.reasons} dataKey="count" nameKey="reason" cx="50%" cy="50%" outerRadius={85} label={({ reason }) => reason}>
                    {(data.reasons || []).map((entry, i) => (
                      <Cell key={entry.reason} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Booking Status Breakdown</h4>
          <div className="space-y-2.5">
            {(data.statuses || []).map((row, i) => (
              <div key={row.status} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {row.status}
                </span>
                <span className="font-semibold text-slate-800 dark:text-white">{row.count}</span>
              </div>
            ))}
            {(data.statuses || []).length === 0 && <p className="text-sm text-slate-400">No bookings yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
