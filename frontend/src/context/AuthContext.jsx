import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("bloodBankUser");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem("bloodBankToken");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
        localStorage.setItem("bloodBankUser", JSON.stringify(data.user));
      } catch (error) {
        localStorage.removeItem("bloodBankToken");
        localStorage.removeItem("bloodBankUser");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (formData) => {
    const { data } = await api.post("/auth/login", formData);
    localStorage.setItem("bloodBankToken", data.token);
    localStorage.setItem("bloodBankUser", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const register = async (formData) => {
    const { data } = await api.post("/auth/register", formData);
    localStorage.setItem("bloodBankToken", data.token);
    localStorage.setItem("bloodBankUser", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const updateLocalUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("bloodBankUser", JSON.stringify(updatedUser));
  };

  const logout = () => {
    localStorage.removeItem("bloodBankToken");
    localStorage.removeItem("bloodBankUser");
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateLocalUser }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
