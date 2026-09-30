const express = require("express");
const router = express.Router();
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const { generateToken, protect } = require("../middleware/auth");

// @route   POST /api/auth/login
// @desc    Authenticate user & return token
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please provide both email and password" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Log login action
    await AuditLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action: "USER_LOGIN",
      entity: "User",
      entityId: user._id.toString(),
      details: `User logged in from ${req.ip || "127.0.0.1"}`,
      ipAddress: req.ip || "127.0.0.1",
    });

    const token = generateToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        company: user.company,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, company, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please enter all required fields" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email is already registered" });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: role || "CUSTOMER",
      company: company || "Independent Freight Co.",
      phone: phone || "",
    });

    await AuditLog.create({
      user: user._id,
      userName: user.name,
      userRole: user.role,
      action: "USER_REGISTERED",
      entity: "User",
      entityId: user._id.toString(),
      details: `New account created with role ${user.role}`,
      ipAddress: req.ip || "127.0.0.1",
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        company: user.company,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ success: false, message: "Registration failed: " + error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get currently logged in user
router.get("/me", protect, async (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      avatar: req.user.avatar,
      phone: req.user.phone,
      company: req.user.company,
    },
  });
});

// @route   GET /api/auth/demo-users
// @desc    Get preconfigured demo users for 1-click role switcher
router.get("/demo-users", async (req, res) => {
  res.json({
    success: true,
    roles: [
      {
        role: "ADMIN",
        title: "Admin",
        email: "admin@logipulse.com",
        password: "password123",
        name: "Arthur Pendelton",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        badge: "Full Access",
        description: "Complete system control, settings, and user management.",
      },
      {
        role: "DISPATCHER",
        title: "Dispatcher",
        email: "dispatcher@logipulse.com",
        password: "password123",
        name: "Alex Vance",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        badge: "Live Routes",
        description: "Live map tracking, dispatch board, and driver route assignments.",
      },
      {
        role: "DRIVER",
        title: "Driver",
        email: "driver@logipulse.com",
        password: "password123",
        name: "Marcus Ray",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        badge: "Driver App",
        description: "Mobile driver dashboard, delivery stops, and e-signature proof.",
      },
      {
        role: "CUSTOMER",
        title: "Customer",
        email: "customer@logipulse.com",
        password: "password123",
        name: "Elena Rostova",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        badge: "Track & Book",
        description: "Book new deliveries and track live shipment progress in real time.",
      },
      {
        role: "FINANCE",
        title: "Finance",
        email: "finance@logipulse.com",
        password: "password123",
        name: "Julian Sterling",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
        badge: "Invoices",
        description: "Invoices, fuel & toll expense auditing, and billing settlements.",
      },
    ],
  });
});

module.exports = router;
