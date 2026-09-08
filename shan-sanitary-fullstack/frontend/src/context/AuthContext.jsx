import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (userData) => setUser(userData);

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
  };

  // Convenience helpers — used constantly by role-aware UI from this
  // phase onward (nav links, admin dashboard access, etc.)
  const isAdmin = user?.role === "admin" || user?.role === "root_admin";
  const isRootAdmin = user?.role === "root_admin";

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isRootAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);