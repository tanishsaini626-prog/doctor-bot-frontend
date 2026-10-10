import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { setSession, clearSession, getToken, getUser } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());
  const [token, setToken] = useState(() => getToken());
  const [checking, setChecking] = useState(() => !!getToken());

  // Confirm the stored token is still valid when the app opens.
  useEffect(() => {
    let cancelled = false;
    if (!token) { setChecking(false); return; }
    api.get('/api/me')
      .then(({ data }) => { if (!cancelled) setUser(data); })
      .catch(() => { if (!cancelled) { clearSession(); setUser(null); setToken(null); } })
      .finally(() => { if (!cancelled) setChecking(false); });
    return () => { cancelled = true; };
  }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    setSession(data.token, data.user);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, checking, login, logout, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
