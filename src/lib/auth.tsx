import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EDGE_FN_BASE } from './supabase';

interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('aura_session');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.expires > Date.now()) {
          setUser(parsed.user);
          setToken(parsed.token);
        } else {
          localStorage.removeItem('aura_session');
        }
      } catch {
        localStorage.removeItem('aura_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${EDGE_FN_BASE}/site-verify-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return { error: data.error || 'Login failed' };
      }
      const session = {
        user: data.user,
        token: data.token,
        expires: Date.now() + 12 * 60 * 60 * 1000,
      };
      localStorage.setItem('aura_session', JSON.stringify(session));
      setUser(data.user);
      setToken(data.token);
      return {};
    } catch {
      return { error: 'Network error — please try again' };
    }
  };

  const logout = () => {
    localStorage.removeItem('aura_session');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
