import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/** Current user and signIn/signOut. Must be used inside AuthProvider. */
export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error("useAuth must be used inside <AuthProvider>");
  return auth;
}
