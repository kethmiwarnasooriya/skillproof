import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { setUnauthorizedHandler } from "../services/apiClient";
import { clearSession, loadSession, saveSession } from "../services/session";

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(loadSession);

  /** Stores the AuthResponse returned by /auth/login or /auth/register. */
  const signIn = useCallback((authResponse) => {
    saveSession(authResponse);
    setSession(authResponse);
  }, []);

  const signOut = useCallback(() => {
    clearSession();
    setSession(null);
  }, []);

  useEffect(() => setUnauthorizedHandler(signOut), [signOut]);

  const value = useMemo(() => ({
    user: session ? { id: session.id, fullName: session.fullName, email: session.email, role: session.role } : null,
    isAuthenticated: Boolean(session),
    signIn,
    signOut,
  }), [session, signIn, signOut]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
