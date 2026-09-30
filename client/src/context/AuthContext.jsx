import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("logipulse_user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("logipulse_token") || null
  );

  const [loading, setLoading] = useState(true);
  const [demoRoles, setDemoRoles] = useState([]);

  // Fetch demo roles when the application loads
  useEffect(() => {
    const fetchDemoRoles = async () => {
      try {
        const res = await API.get("/auth/demo-users");

        if (res.data.success) {
          setDemoRoles(res.data.roles || []);
        } else {
          console.error("Demo roles API returned success:false");
          setDemoRoles([]);
        }
      } catch (err) {
        console.error(
          "Failed to load demo roles:",
          err.response?.data || err.message
        );

        setDemoRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDemoRoles();
  }, []);

  // Normal login
  const login = async (email, password) => {
    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      if (res.data.success) {
        const { token, user } = res.data;

        localStorage.setItem("logipulse_token", token);
        localStorage.setItem("logipulse_user", JSON.stringify(user));

        setToken(token);
        setUser(user);

        return {
          success: true,
          user,
        };
      }

      return {
        success: false,
        message: res.data.message || "Login failed",
      };
    } catch (err) {
      console.error(
        "Login error:",
        err.response?.data || err.message
      );

      return {
        success: false,
        message:
          err.response?.data?.message || "Invalid credentials",
      };
    }
  };

  // Login using one of the demo roles
  const loginAsRole = async (roleKey) => {
    try {
      const target = demoRoles.find(
        (r) =>
          r.role === roleKey ||
          r.role?.toLowerCase() === roleKey?.toLowerCase()
      );

      if (!target) {
        console.error("Demo role not found:", roleKey);
        console.log("Available demo roles:", demoRoles);

        return {
          success: false,
          message: "Role not found",
        };
      }

      return await login(target.email, target.password);
    } catch (err) {
      console.error("Demo login error:", err);

      return {
        success: false,
        message: "Demo login failed",
      };
    }
  };

  // Register new user
  const register = async (userData) => {
    try {
      const res = await API.post("/auth/register", userData);

      if (res.data.success) {
        const { token, user } = res.data;

        localStorage.setItem("logipulse_token", token);
        localStorage.setItem("logipulse_user", JSON.stringify(user));

        setToken(token);
        setUser(user);

        return {
          success: true,
          user,
        };
      }

      return {
        success: false,
        message: res.data.message || "Registration failed",
      };
    } catch (err) {
      console.error(
        "Registration error:",
        err.response?.data || err.message
      );

      return {
        success: false,
        message:
          err.response?.data?.message || "Registration failed",
      };
    }
  };

  // Logout
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