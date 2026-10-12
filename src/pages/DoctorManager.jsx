import { useState, useEffect } from 'react';
import api from '../api';
import { Stethoscope, Plus, Trash2, Edit2, CheckCircle, Clock, AlertCircle, X } from 'lucide-react';

export default function DoctorManager() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [form, setForm] = useState({ name: '', specialty: 'General Physician', slot_minutes: 15, active: true });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  async function loadDoctors() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/doctors');
      setDoctors(res.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load doctors');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingDoc(null);
    setForm({ name: '', specialty: 'General Physician', slot_minutes: 15, active: true });
    setShowModal(true);
  }

  function openEdit(doc) {
    setEditingDoc(doc);
    setForm({ name: doc.name, specialty: doc.specialty, slot_minutes: doc.slot_minutes || 15, active: doc.active !== false });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    try {
      setSaving(true);
      if (editingDoc) {
        await api.patch('/api/doctors/' + editingDoc._id, form);
      } else {
        await api.post('/api/doctors', form);
      }
      setShowModal(false);
      loadDoctors();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to save doctor');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to remove this doctor?')) return;
    try {
      await api.delete('/api/doctors/' + id);
      loadDoctors();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete doctor');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
            <Stethoscope size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 dark:text-white">Doctor Roster</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Manage clinic doctors, working hours, and slot durations</p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-md shadow-blue-500/20"
        >
          <Plus size={18} /> Add Doctor
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl flex items-center gap-3 text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400">Loading doctors...</div>
      ) : doctors.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-700/60">
          <Stethoscope size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
          <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300">No doctors added yet</h4>
          <p className="text-xs text-slate-400 mt-1 mb-4">Click "Add Doctor" to configure your first clinic physician.</p>
          <button onClick={openCreate} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium">
            <Plus size={16} /> Add Doctor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {doctors.map(doc => (
            <div key={doc._id} className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700/60 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-blue-500/20">
                    {doc.name.replace('Dr. ', '')[0]}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                    doc.active !== false
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500'
                  }`}>
                    {doc.active !== false ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <h4 className="text-base font-bold text-slate-800 dark:text-white">{doc.name}</h4>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-3">{doc.specialty}</p>

                <div className="space-y-2 border-t border-slate-100 dark:border-slate-700/60 pt-3 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-slate-400" />
                    <span>Slot Duration: <strong>{doc.slot_minutes || 15} minutes</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle size={14} className="text-slate-400" />
                    <span>Schedule: <strong>Mon - Sat (09:00 - 21:00)</strong></span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 border-t border-slate-100 dark:border-slate-700/60 pt-4 mt-5">
                <button
                  onClick={() => openEdit(doc)}
                  className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2 rounded-xl text-xs font-medium transition-colors"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(doc._id)}
                  className="flex items-center justify-center p-2 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-400 rounded-xl text-xs transition-colors"
                  title="Remove doctor"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
              {editingDoc ? 'Edit Doctor Profile' : 'Add New Doctor'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Doctor Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Meera Verma"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Specialty</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dentist, General Physician"
                  value={form.specialty}
                  onChange={e => setForm({ ...form, specialty: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">Appointment Slot Duration (mins)</label>
                <select
                  value={form.slot_minutes}
                  onChange={e => setForm({ ...form, slot_minutes: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                >
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={20}>20 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>60 minutes</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="doc-active"
                  checked={form.active}
                  onChange={e => setForm({ ...form, active: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="doc-active" className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  Active (Receiving appointments)
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-medium shadow-md shadow-blue-500/20 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
