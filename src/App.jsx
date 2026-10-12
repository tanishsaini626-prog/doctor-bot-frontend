import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Layout from './pages/Layout';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import CallLog from './pages/CallLog';
import Patients from './pages/Patients';
import DoctorManager from './pages/DoctorManager';
import Analytics from './pages/Analytics';
import ClinicSettings from './pages/ClinicSettings';
import Login from './pages/Login';
import Landing from './pages/Landing';

function RequireAuth({ children }) {
  const { isLoggedIn, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">
        Checking your session...
      </div>
    );
  }
  if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

function useTheme() {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('medibot-theme') === 'dark');
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('medibot-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);
  return [darkMode, setDarkMode];
}

function AppRoutes() {
  const [darkMode, setDarkMode] = useTheme();

  return (
    <Routes>
      <Route path="/landing" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <Layout title="Appointments Dashboard" darkMode={darkMode} setDarkMode={setDarkMode}>
              <Dashboard />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/calendar"
        element={
          <RequireAuth>
            <Layout title="Calendar Schedule" darkMode={darkMode} setDarkMode={setDarkMode}>
              <Calendar />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/calls"
        element={
          <RequireAuth>
            <Layout title="Voice Call History" darkMode={darkMode} setDarkMode={setDarkMode}>
              <CallLog darkMode={darkMode} setDarkMode={setDarkMode} />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/patients"
        element={
          <RequireAuth>
            <Layout title="Patients Directory" darkMode={darkMode} setDarkMode={setDarkMode}>
              <Patients />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/doctors"
        element={
          <RequireAuth>
            <Layout title="Doctor Management" darkMode={darkMode} setDarkMode={setDarkMode}>
              <DoctorManager />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/analytics"
        element={
          <RequireAuth>
            <Layout title="Analytics & Reports" darkMode={darkMode} setDarkMode={setDarkMode}>
              <Analytics />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/settings"
        element={
          <RequireAuth>
            <Layout title="Clinic Settings" darkMode={darkMode} setDarkMode={setDarkMode}>
              <ClinicSettings />
            </Layout>
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
