import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi } from '../api/client';
import type { AuthContextValue, LoginCredentials } from '../types/auth';
import { AuthContext } from './AuthContextValue';

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    const { data, error } = await authApi.checkSession();

    if (error) {
      setIsAuthenticated(false);
    } else {
      setIsAuthenticated(data?.authenticated ?? false);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setError(null);
    setIsLoading(true);

    const { data, error } = await authApi.login(credentials.password);

    if (error) {
      setError(error);
      setIsLoading(false);
      return false;
    }

    if (data?.success) {
      setIsAuthenticated(true);
      setIsLoading(false);
      return true;
    }

    setError('Login failed');
    setIsLoading(false);
    return false;
  }, []);

  const logout = useCallback(async () => {
    await authApi.logout();
    setIsAuthenticated(false);
    setError(null);
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      const { data, error } = await authApi.checkSession();

      if (!mounted) return;

      if (error) {
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(data?.authenticated ?? false);
      }
      setIsLoading(false);
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      setIsAuthenticated(false);
      setError('Session expired. Please login again.');
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const value: AuthContextValue = {
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    checkAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
