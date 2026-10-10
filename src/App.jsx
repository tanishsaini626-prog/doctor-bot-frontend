import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Dashboard from './pages/Dashboard';
import CallLog from './pages/CallLog';
import Login from './pages/Login';

/** Sends anyone without a token to the login page (and remembers where they were going). */
function RequireAuth({ children }) {
  const { isLoggedIn, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-400">
        Checking your session...
      </div>
    );
  }
  if (!isLoggedIn) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

/** Keeps the theme preference for the whole app (login page included). */
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
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<RequireAuth><Dashboard darkMode={darkMode} setDarkMode={setDarkMode} /></RequireAuth>} />
      <Route path="/calls" element={<RequireAuth><CallLog darkMode={darkMode} setDarkMode={setDarkMode} /></RequireAuth>} />
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
