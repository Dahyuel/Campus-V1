import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { User } from '../types';
import { setAccessToken } from '../api/auth';
import {
  loginRequest,
  logoutRequest,
  refreshRequest,
  getMeRequest,
} from '../lib/auth';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isRehydrating: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

interface AuthContextValue extends AuthState {
  login: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRehydrating, setIsRehydrating] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Rehydrate session on mount using refresh token cookie
  useEffect(() => {
    let cancelled = false;

    async function rehydrate() {
      try {
        await refreshRequest();
        const me = await getMeRequest();
        if (!cancelled) {
          setUser(me);
        }
      } catch {
        // No valid refresh token; stay logged out
        setAccessToken(null);
      } finally {
        if (!cancelled) {
          setIsRehydrating(false);
        }
      }
    }

    void rehydrate();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (identifier: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await loginRequest(identifier, password);
      setUser(result.user);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await logoutRequest();
    } catch {
      // Ignore network errors during logout; still clear local state
    } finally {
      setAccessToken(null);
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const me = await getMeRequest();
      setUser(me);
    } catch {
      // Ignore refresh failures; keep the current user state
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isRehydrating,
        isAuthenticated: user !== null,
        error,
        login,
        logout,
        clearError,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
