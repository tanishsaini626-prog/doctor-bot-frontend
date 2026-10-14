import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Activity,
  Calendar as CalendarIcon,
  PhoneCall,
  Users,
  Settings,
  BarChart3,
  LogOut,
  X,
  Menu,
  Stethoscope,
  Sun,
  Moon,
  Clock
} from 'lucide-react';
import { useAuth } from '../AuthContext';

const NAV_ITEMS = [
  { to: '/app', label: 'Appointments', icon: CalendarIcon },
  { to: '/app/calendar', label: 'Calendar View', icon: Clock },
  { to: '/app/calls', label: 'Call Log', icon: PhoneCall },
  { to: '/app/patients', label: 'Patients Directory', icon: Users },
  { to: '/app/doctors', label: 'Doctors', icon: Stethoscope },
  { to: '/app/analytics', label: 'Analytics & Reports', icon: BarChart3 },
  { to: '/app/settings', label: 'Clinic Settings', icon: Settings },
];

export default function Layout({ children, darkMode, setDarkMode, title, actions }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const renderNavLinks = () => (
    <nav className="flex-1 space-y-1 py-4">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={() => setMobileOpen(false)}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              isActive
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <Icon size={18} />
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );

  const renderFooter = () => (
    <div className="border-t border-slate-700/60 pt-4 mt-auto">
      <div className="flex items-center gap-3 px-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs uppercase border border-blue-500/30">
          {(user?.email || 'A')[0]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-semibold text-white truncate">{user?.name || 'Clinic Admin'}</div>
          <div className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@medibot.test'}</div>
        </div>
      </div>
      <button
        onClick={handleLogout}
        className="w-full flex items-center justify-center gap-2 text-xs font-medium bg-slate-800/80 hover:bg-rose-900/30 hover:text-rose-400 text-slate-300 py-2.5 rounded-xl border border-slate-700/50 transition-colors"
      >
        <LogOut size={14} /> Log Out
      </button>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white p-5 border-r border-slate-800 shadow-xl z-20">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2.5 rounded-xl text-white shadow-lg shadow-blue-500/30">
            <Activity size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-tight">MediBot</h1>
            <p className="text-[11px] text-slate-400 font-medium">AI Clinic Assistant</p>
          </div>
        </div>
        {renderNavLinks()}
        {renderFooter()}
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700/60 px-4 md:px-8 py-3.5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-lg md:text-xl font-bold tracking-tight text-slate-800 dark:text-white truncate">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {actions}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-indigo-600" />}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-slate-900">
          {children}
        </main>
      </div>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-1 max-w-xs w-full bg-slate-900 text-white p-5 flex flex-col z-10 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-xl text-white">
                  <Activity size={20} />
                </div>
                <span className="font-bold text-lg">MediBot</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            {renderNavLinks()}
            {renderFooter()}
          </div>
        </div>
      )}
    </div>
  );
}
