import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../services/api";

const AuthContext = createContext();

const DEFAULT_DEMO_ROLES = [
  {
    role: "ADMIN",
    title: "Admin",
    email: "admin@logipulse.com",
    name: "Arthur Pendelton",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    badge: "Full Access",
    description: "Complete system control, settings, and user management.",
  },
  {
    role: "DISPATCHER",
    title: "Dispatcher",
    email: "dispatcher@logipulse.com",
    name: "Alex Vance",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    badge: "Live Routes",
    description: "Live map tracking, dispatch board, and driver route assignments.",
  },
  {
    role: "DRIVER",
    title: "Driver",
    email: "driver@logipulse.com",
    name: "Marcus Ray",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    badge: "Driver App",
    description: "Mobile driver dashboard, delivery stops, and e-signature proof.",
  },
  {
    role: "CUSTOMER",
    title: "Customer",
    email: "customer@logipulse.com",
    name: "Elena Rostova",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    badge: "Track & Book",
    description: "Book new deliveries and track live shipment progress in real time.",
  },
  {
    role: "FINANCE",
    title: "Finance",
    email: "finance@logipulse.com",
    name: "Julian Sterling",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
    badge: "Invoices",
    description: "Invoices, fuel & toll expense auditing, and billing settlements.",
  },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("logipulse_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("logipulse_token") || null
  );

  // Initialize loading as false so UI renders instantly without waiting for network
  const [loading, setLoading] = useState(false);
  const [demoRoles, setDemoRoles] = useState(DEFAULT_DEMO_ROLES);

  // Background sync for demo roles without blocking initial render
  useEffect(() => {
    const fetchDemoRoles = async () => {
      try {
        const res = await API.get("/auth/demo-users");
        if (res.data.success && res.data.roles?.length > 0) {
          setDemoRoles(res.data.roles);
        }
      } catch (err) {
        // Fallback to DEFAULT_DEMO_ROLES silently
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