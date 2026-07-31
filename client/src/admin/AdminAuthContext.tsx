import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { adminFetch, apiUrl, buildAdminHeaders, getAdminToken, setAdminToken } from '../lib/api';

type AdminAuthContextValue = {
  token: string;
  email: string;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  loginError: string;
  login: (email: string, password: string) => Promise<void>;
  logout: (message?: string) => void;
  /** Clears the session when any admin request returns 401. */
  handleUnauthorized: () => void;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [loginError, setLoginError] = useState('');

  const logout = useCallback((message = '') => {
    setAdminToken('');
    setToken('');
    setEmail('');
    setIsAuthenticated(false);
    setLoginError(message);
  }, []);

  const handleUnauthorized = useCallback(() => {
    logout('Your session expired. Please log in again.');
  }, [logout]);

  useEffect(() => {
    const storedToken = getAdminToken();
    if (!storedToken) {
      setIsBootstrapping(false);
      return;
    }

    let isMounted = true;

    const validateSession = async () => {
      try {
        const response = await fetch(apiUrl('/api/admin/session'), {
          headers: buildAdminHeaders(storedToken)
        });
        if (!response.ok) {
          throw new Error('Session invalid');
        }

        const data = await response.json().catch(() => ({}));
        if (!isMounted) {
          return;
        }

        setToken(storedToken);
        setEmail(data.admin?.email || '');
        setIsAuthenticated(true);
      } catch {
        if (!isMounted) {
          return;
        }
        setAdminToken('');
      } finally {
        if (isMounted) {
          setIsBootstrapping(false);
        }
      }
    };

    validateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (nextEmail: string, password: string) => {
    setLoginError('');

    const data = await adminFetch<{ token: string; admin: { email: string } }>('/api/admin/login', {
      method: 'POST',
      body: { email: nextEmail, password }
    });

    setAdminToken(data.token);
    setToken(data.token);
    setEmail(data.admin.email);
    setIsAuthenticated(true);
    setLoginError('');
  }, []);

  const value = useMemo(
    () => ({
      token,
      email,
      isAuthenticated,
      isBootstrapping,
      loginError,
      login,
      logout,
      handleUnauthorized
    }),
    [token, email, isAuthenticated, isBootstrapping, loginError, login, logout, handleUnauthorized]
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used inside AdminAuthProvider.');
  }
  return context;
}
