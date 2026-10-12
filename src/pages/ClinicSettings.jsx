import { useState, useEffect } from 'react';
import api from '../api';
import { Settings, Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function ClinicSettings() {
  const [form, setForm] = useState({
    name: 'Dr. Sharma Clinic',
    phone: '',
    whatsapp_to: '',
    greeting_text: 'नमस्ते! मैं डॉ. शर्मा क्लिनिक से बोल रही हूँ। अपॉइंटमेंट बुक करने के लिए कृपया अपना पूरा नाम बताइए।',
    timezone: 'Asia/Kolkata',
    languages: ['hi-IN']
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const res = await api.get('/api/clinic');
      if (res.data) setForm(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      await api.patch('/api/clinic', form);
      setMessage({ type: 'success', text: 'Clinic settings updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to save clinic settings' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
        <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
          <Settings size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-white">Clinic Configuration</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Configure clinic info, WhatsApp receiver number, and voice bot prompt</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm border ${
          message.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-600 dark:text-emerald-400'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-600 dark:text-rose-400'
        }`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading settings...</div>
      ) : (
        <form onSubmit={handleSave} className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Clinic Name</label>
            <input
              type="text"
              required
              value={form.name || ''}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Clinic Phone</label>
              <input
                type="text"
                placeholder="+919876543210"
                value={form.phone || ''}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">WhatsApp Notification Number</label>
              <input
                type="text"
                placeholder="whatsapp:+919760849372"
                value={form.whatsapp_to || ''}
                onChange={e => setForm({ ...form, whatsapp_to: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Hindi Voice Bot Greeting Prompt
            </label>
            <textarea
              rows={3}
              required
              value={form.greeting_text || ''}
              onChange={e => setForm({ ...form, greeting_text: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
            />
            <p className="text-[11px] text-slate-400 mt-1">This text is spoken by Twilio Voice when a patient calls the clinic.</p>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              <Save size={16} />
              <span>{saving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
