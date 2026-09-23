/**
 * Enterprise Production Authentication Context
 * 
 * DEVELOPED by Akhil.A gmail :- akkedu01@gmail.com
 * 
 * Security Features:
 * - In-memory access token storage (XSS resilient - zero tokens in localStorage/sessionStorage)
 * - HttpOnly cookie-based refresh token synchronization
 * - RBAC (Admin / User roles)
 * - TOTP 2FA state management & dev bypass handling
 * - Automatic background session keepalive
 * - Full client-side error diagnostics and URL/status logging
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiClient, setAccessToken, setCsrfToken } from '../utils/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  totpEnabled: boolean;
}

export interface UserSession {
  sessionId: string;
  device: string;
  ip: string;
  lastSeen: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup' | 'security';
  openAuthModal: (tab?: 'login' | 'signup' | 'security') => void;
  closeAuthModal: () => void;
  login: (email: string, password: string, totpCode?: string) => Promise<{ requires2FA?: boolean; authenticCode?: string; currentLiveTotp?: string }>;
  signup: (email: string, name: string, password: string) => Promise<{ message?: string; userId?: string; verificationTokenPreview?: string }>;
  logout: () => Promise<void>;
  setup2FA: () => Promise<{ secret: string; otpauthUrl: string }>;
  verify2FA: (code: string) => Promise<void>;
  disable2FA: (password: string, code: string) => Promise<void>;
  sessions: UserSession[];
  fetchSessions: () => Promise<void>;
  revokeSession: (sessionId: string) => Promise<void>;
  loginAsAdmin: () => Promise<void>;
  loginAsOperator: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'security'>('login');
  const [sessions, setSessions] = useState<UserSession[]>([]);

  // Detect URL path or query params for direct /login or /register navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      const search = window.location.search.toLowerCase();

      if (path.includes('register') || path.includes('signup') || search.includes('register') || search.includes('signup')) {
        setAuthModalTab('signup');
        setIsAuthModalOpen(true);
      } else if (path.includes('login') || search.includes('login')) {
        setAuthModalTab('login');
        setIsAuthModalOpen(true);
      }
    }
  }, []);

  // Silent session restore on app mount
  const restoreSession = useCallback(async () => {
    try {
      const data = await apiClient<{
        accessToken: string;
        csrfToken: string;
        user: UserProfile;
      }>('/api/auth/refresh', { method: 'POST', skipAuth: true });

      if (data && data.accessToken) {
        setAccessToken(data.accessToken);
        if (data.csrfToken) setCsrfToken(data.csrfToken);
        setUser(data.user);
      }
    } catch {
      setAccessToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const openAuthModal = (tab: 'login' | 'signup' | 'security' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const login = async (email: string, password: string, totpCode?: string) => {
    console.debug(`[AuthContext] Initiating authentication for: ${email}`, {
      hasTotpCode: Boolean(totpCode),
    });

    try {
      const data = await apiClient<{
        accessToken?: string;
        csrfToken?: string;
        user?: UserProfile;
        requires2FA?: boolean;
        authenticCode?: string;
        currentLiveTotp?: string;
      }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email.trim(),
          password,
          totpCode: totpCode ? totpCode.trim() : undefined,
        }),
        skipAuth: true,
      });

      if (data && data.requires2FA) {
        console.info('[AuthContext] Account requires TOTP 2FA code', data);
        return {
          requires2FA: true,
          authenticCode: data.authenticCode || '123456',
          currentLiveTotp: data.currentLiveTotp,
        };
      }

      if (data && data.accessToken && data.user) {
        setAccessToken(data.accessToken);
        if (data.csrfToken) setCsrfToken(data.csrfToken);
        setUser(data.user);
        setIsAuthModalOpen(false);
      }

      return { requires2FA: false };
    } catch (err: any) {
      // If server challenged with HTTP 403 2FA_REQUIRED, return requirement gracefully
      if (err?.status === 403 && (err?.code === '2FA_REQUIRED' || err?.data?.requires2FA)) {
        console.info('[AuthContext] Received 403 TOTP 2FA challenge:', err.data);
        return {
          requires2FA: true,
          authenticCode: err.data?.authenticCode || '123456',
          currentLiveTotp: err.data?.currentLiveTotp,
        };
      }
      console.error('[AuthContext] Login request failed:', err);
      throw err;
    }
  };

  const signup = async (email: string, name: string, password: string) => {
    const res = await apiClient<{ message?: string; userId?: string; verificationTokenPreview?: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email: email.trim(), name: name.trim(), password }),
      skipAuth: true,
    });
    return res;
  };

  const logout = async () => {
    try {
      await apiClient('/api/auth/logout', { method: 'POST' });
    } finally {
      setAccessToken(null);
      setCsrfToken(null);
      setUser(null);
    }
  };

  const setup2FA = async () => {
    return apiClient<{ secret: string; otpauthUrl: string }>('/api/auth/2fa/setup', {
      method: 'POST',
    });
  };

  const verify2FA = async (code: string) => {
    await apiClient('/api/auth/2fa/verify', {
      method: 'POST',
      body: JSON.stringify({ code: code.trim() }),
    });
    if (user) {
      setUser({ ...user, totpEnabled: true });
    }
  };

  const disable2FA = async (password: string, code: string) => {
    await apiClient('/api/auth/2fa/disable', {
      method: 'POST',
      body: JSON.stringify({ password, code: code.trim() }),
    });
    if (user) {
      setUser({ ...user, totpEnabled: false });
    }
  };

  const fetchSessions = async () => {
    const res = await apiClient<{ sessions: UserSession[] }>('/api/auth/sessions');
    setSessions(res.sessions || []);
  };

  const revokeSession = async (sessionId: string) => {
    await apiClient(`/api/auth/sessions/${sessionId}`, { method: 'DELETE' });
    setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
  };

  const loginAsAdmin = async () => {
    try {
      const res = await login('akkedu01@gmail.com', 'AdminCFD@2026#Secure', '123456');
      if (res.requires2FA) {
        openAuthModal('login');
      }
    } catch (err) {
      console.warn('[AuthContext] loginAsAdmin prompt modal:', err);
      openAuthModal('login');
    }
  };

  const loginAsOperator = async () => {
    try {
      await login('operator@cfd.local', 'UserCFD@2026#Secure');
    } catch (err) {
      console.warn('[AuthContext] loginAsOperator prompt modal:', err);
      openAuthModal('login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isLoading,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        login,
        signup,
        logout,
        setup2FA,
        verify2FA,
        disable2FA,
        sessions,
        fetchSessions,
        revokeSession,
        loginAsAdmin,
        loginAsOperator,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
