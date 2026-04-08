import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "../api/authApi.js";
import { getAccessToken } from "../api/tokens.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bootError, setBootError] = useState(null);

  const loadUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await authApi.fetchMe();
      setUser(me);
      setBootError(null);
    } catch (e) {
      if (e.status === 401) {
        const ok = await authApi.refreshSession();
        if (ok) {
          try {
            const me = await authApi.fetchMe();
            setUser(me);
            setBootError(null);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
        setBootError(e.message || "加载用户信息失败");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (phone, code) => {
    await authApi.smsLogin(phone, code);
    const me = await authApi.fetchMe();
    setUser(me);
    setBootError(null);
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const me = await authApi.updateMe(payload);
    setUser(me);
    return me;
  }, []);

  const sendSms = useCallback(async (phone) => {
    return authApi.sendSms(phone);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      bootError,
      isAuthenticated: !!user,
      login,
      logout,
      sendSms,
      refreshUser: loadUser,
      updateProfile,
    }),
    [user, loading, bootError, login, logout, sendSms, loadUser, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
