import { createContext } from "react";

/**
 * @typedef {{ id: number, fullName: string, email: string, role: string }} AuthUser
 * @typedef {{ user: AuthUser | null, isAuthenticated: boolean,
 *   signIn: (authResponse: AuthUser & { token: string }) => void, signOut: () => void }} AuthContextValue
 */

/** Provided by AuthProvider; read it with the useAuth hook. */
export const AuthContext = createContext(/** @type {AuthContextValue | null} */ (null));
