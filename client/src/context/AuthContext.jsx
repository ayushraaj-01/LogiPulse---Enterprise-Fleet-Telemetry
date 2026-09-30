import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("logipulse_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("logipulse_token") || null);
  const [loading, setLoading] = useState(true);
  const [demoRoles, setDemoRoles] = useState([]);

  // Fetch demo roles for 1-click switcher on load
  useEffect(() => {
    const fetchDemoRoles = async () => {
      try {
        const res = await API.get("/auth/demo-users");
        if (res.data.success) {
          setDemoRoles(res.data.roles);
        }
      } catch (err) {
        console.error("Failed to load demo roles", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDemoRoles();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", { email, password });
      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem("logipulse_token", token);
        localStorage.setItem("logipulse_user", JSON.stringify(user));
        setToken(token);
        setUser(user);
        return { success: true, user };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Invalid credentials",
      };
    }
  };

  const loginAsRole = async (roleKey) => {
    const target = demoRoles.find((r) => r.role === roleKey);
    if (!target) return { success: false, message: "Role not found" };
    return await login(target.email, target.password);
  };

  const register = async (userData) => {
    try {
      const res = await API.post("/auth/register", userData);
      if (res.data.success) {
        const { token, user } = res.data;
        localStorage.setItem("logipulse_token", token);
        localStorage.setItem("logipulse_user", JSON.stringify(user));
        setToken(token);
        setUser(user);
        return { success: true, user };
      }
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("logipulse_token");
    localStorage.removeItem("logipulse_user");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        demoRoles,
        login,
        loginAsRole,
        register,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
