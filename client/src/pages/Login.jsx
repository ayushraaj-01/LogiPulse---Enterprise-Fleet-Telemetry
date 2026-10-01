import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Eye,
  EyeOff,
  User,
  Building,
  AlertCircle,
  Truck,
  Sparkles,
  Sun,
  Moon,
  Search,
  Package,
  MapPin,
  Globe,
  ChevronRight,
  Phone,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { getDefaultPathForRole } from "../utils/rolePermissions";
import { LogiPulseLogo } from "../components/LogiPulseLogo";

export const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@logipulse.com");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [selectedRole, setSelectedRole] = useState("CUSTOMER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Footer Working State: City selection and Modal dialogs
  const [selectedCity, setSelectedCity] = useState("Delhi NCR");
  const [activeModal, setActiveModal] = useState(null); // 'about' | 'offerings' | 'careers' | 'safety' | 'sustainability' | 'privacy' | 'terms' | 'accessibility' | 'app' | 'city'

  const { login, register, demoRoles, loginAsRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        const user = await register({
          name,
          email,
          password,
          role: selectedRole,
          company,
        });
        navigate(getDefaultPathForRole(user.role));
      } else {
        const user = await login(email, password);
        navigate(getDefaultPathForRole(user.role));
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(
        err.response?.data?.message ||
        "Sign-in failed. Please verify credentials or pick a demo role below."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setError("");
    setLoading(true);
    try {
      const user = await loginAsRole(role);
      navigate(getDefaultPathForRole(user.role));
    } catch (err) {
      console.error("Quick login failed:", err);
      setError("Failed to auto-sign in. Please use standard email and password.");
    } finally {
      setLoading(false);
    }
  };

  // Modal Content Generator
  const getModalContent = () => {
    switch (activeModal) {
      case "about":
        return {
          title: "About LogiPulse",
          body: (
            <div className="space-y-3">
              <p>
                LogiPulse is an enterprise logistics and fleet telemetry platform designed to make commercial goods transport simple, transparent, and ultra-reliable.
              </p>
              <p>
                Founded in 2026, our platform bridges drivers, dispatchers, and customers with real-time GPS telemetry, dynamic route optimization, and digital electronic proof of delivery (EPOD).
              </p>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs font-mono space-y-1">
                <div>• Active Fleet: 2,500+ commercial vehicles</div>
                <div>• Average GPS Ping: &lt; 250 milliseconds</div>
                <div>• On-Time Rate: 99.8% across nationwide corridors</div>
              </div>
            </div>
          ),
        };
      case "offerings":
        return {
          title: "Our Offerings",
          body: (
            <div className="space-y-3">
              <p>We provide end-to-end transportation solutions for businesses of all sizes:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong>City Express:</strong> 2-wheelers and mini trucks for quick local deliveries.</li>
                <li><strong>Intercity Freight:</strong> Heavy container trucks with real-time satellite tracking.</li>
                <li><strong>Pharma Cold-Chain:</strong> Temperature-monitored refrigerated reefers.</li>
                <li><strong>Fleet Management API:</strong> Real-time webhooks, telemetry stream, and TMS integration.</li>
              </ul>
            </div>
          ),
        };
      case "careers":
        return {
          title: "Careers at LogiPulse",
          body: (
            <div className="space-y-3">
              <p>We are actively hiring engineering, operations, and dispatch leaders:</p>
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold">Senior Fullstack Telemetry Engineer</div>
                    <div className="text-slate-500">React · Node.js · Socket.IO · Remote / Delhi</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">APPLY</span>
                </div>
                <div className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold">Dispatch Operations Lead</div>
                    <div className="text-slate-500">Fleet Operations · Seattle / Redmond</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">APPLY</span>
                </div>
              </div>
            </div>
          ),
        };
      case "safety":
        return {
          title: "Safety & Driver Trust",
          body: (
            <div className="space-y-3">
              <p>Safety is built into every layer of our logistics network:</p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs">
                <li><strong>100% Background-Checked Drivers:</strong> Comprehensive license and criminal background checks.</li>
                <li><strong>4-Digit Delivery OTP:</strong> Drivers can only complete drop-offs after customer inspection.</li>
                <li><strong>24/7 Roadside Assistance:</strong> On-call mechanical support along major highway transit corridors.</li>
                <li><strong>Driver Fatigue & Telemetry Alerts:</strong> Automated rest-stop reminders for long-haul drivers.</li>
              </ul>
            </div>
          ),
        };
      case "sustainability":
        return {
          title: "Sustainability & EV Fleet",
          body: (
            <div className="space-y-3">
              <p>We are committed to reducing transport emissions through smart logistics:</p>
              <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">40%</div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-300 mt-1">EV Fleet Target by 2027</div>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="text-lg font-black text-emerald-600 dark:text-emerald-400">18.4%</div>
                  <div className="text-[10px] text-slate-600 dark:text-slate-300 mt-1">Fuel Saved via Route AI</div>
                </div>
              </div>
            </div>
          ),
        };
      case "privacy":
        return {
          title: "Privacy Policy",
          body: (
            <div className="space-y-3 text-xs">
              <p>Last updated: October 2026</p>
              <p>LogiPulse values your privacy. We collect shipment origin and destination data, vehicle telemetry, and contact numbers solely to facilitate commercial freight dispatch and safe delivery verification.</p>
              <p>We never sell your data to third-party advertisers. All location traces are encrypted in transit via TLS 1.3 and at rest with AES-256 encryption.</p>
            </div>
          ),
        };
      case "terms":
        return {
          title: "Terms of Service",
          body: (
            <div className="space-y-3 text-xs">
              <p>Last updated: October 2026</p>
              <p>By accessing or using the LogiPulse platform, you agree to comply with our commercial carriage policies, timely bill settlement terms, and prohibited freight regulations.</p>
              <p>Hazardous, illegal, or undeclared perishable materials are strictly prohibited without prior written authorization.</p>
            </div>
          ),
        };
      case "accessibility":
        return {
          title: "Accessibility Commitment",
          body: (
            <div className="space-y-3 text-xs">
              <p>LogiPulse is committed to providing an accessible web and mobile experience in compliance with WCAG 2.1 AA guidelines.</p>
              <p>Our platform includes high-contrast color modes, bilingual screen-reader semantic landmarks (English & Hindi), keyboard-friendly navigation, and scalable typography.</p>
            </div>
          ),
        };
      case "city":
        return {
          title: "Select Service Hub / Region",
          body: (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 mb-2">Choose your primary operational territory:</p>
              {[
                { city: "Delhi NCR", region: "North India Corridor (Delhi, Noida, Gurgaon)", active: true },
                { city: "Mumbai", region: "West India Port Corridor (JNPT, Navi Mumbai)", active: true },
                { city: "Bengaluru", region: "South Tech Corridor (Whitefield, Peenya)", active: true },
                { city: "Hyderabad", region: "Pharma & Airport Cargo Hub", active: true },
                { city: "Seattle & Pacific NW", region: "I-5 Corridor (Seattle, Tacoma, Portland)", active: true },
              ].map((item) => (
                <button
                  key={item.city}
                  type="button"
                  onClick={() => {
                    setSelectedCity(item.city);
                    setActiveModal(null);
                  }}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                    selectedCity === item.city
                      ? "border-[#2F80ED] bg-sky-50 dark:bg-sky-950/40 text-[#2F80ED]"
                      : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold">{item.city}</div>
                    <div className="text-[11px] text-slate-500">{item.region}</div>
                  </div>
                  {selectedCity === item.city && <Check className="h-4 w-4 text-[#2F80ED]" />}
                </button>
              ))}
            </div>
          ),
        };
      default:
        return null;
    }
  };

  const modalContent = getModalContent();

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#FAF9F5] dark:bg-[#090E17] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* ========================================================= */}
      {/* MAIN TOP SECTION: Left Hero + Right Auth Panel            */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* LEFT SIDE: Clean Vibrant Sky Blue (MERN removed, Simple Words) */}
        <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-[#2F80ED] text-white overflow-hidden border-r-2 border-dashed border-sky-200/50 bg-tech-grid-blue">
          {/* Subtle lighting sweeps */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-300/15 rounded-full blur-3xl pointer-events-none" />

          {/* Top Logo (No MERN badge) */}
          <div className="relative z-10 flex items-center justify-between">
            <LogiPulseLogo
              size="lg"
              variant="on-blue"
              subtitle="Fleet Telemetry & Dispatch"
            />
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-semibold text-white">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live GPS Active</span>
            </div>
          </div>

          {/* Middle Hero Content: Clean, Simple, Uncluttered */}
          <div className="relative z-10 space-y-6 max-w-lg my-auto py-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
              <Sparkles className="h-3.5 w-3.5 text-white" />
              <span>Simple, Reliable Goods Transportation</span>
            </div>

            <h1 className="font-heading text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-xs">
              <span>Track<span className="text-sky-200">.</span></span>{" "}
              <span>Optimize<span className="text-sky-200">.</span></span>{" "}
              <span>Deliver<span className="text-sky-200">.</span></span>
            </h1>

            <p className="text-sky-100 text-sm xl:text-base leading-relaxed font-normal">
              Move goods faster and easier. Real-time GPS tracking, smart routes, and reliable delivery with instant digital receipts.
            </p>

            {/* 3 Simple Metric Cards */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-center">
                <div className="text-xl xl:text-2xl font-black font-mono text-white">99.8%</div>
                <div className="text-[11px] font-bold text-white mt-0.5">On-Time Delivery</div>
                <div className="text-[9px] text-sky-100 font-medium">Always on schedule</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-center">
                <div className="text-xl xl:text-2xl font-black font-mono text-white">&lt; 1s</div>
                <div className="text-[11px] font-bold text-white mt-0.5">Live GPS Updates</div>
                <div className="text-[9px] text-sky-100 font-medium">Real-time truck map</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-center">
                <div className="text-xl xl:text-2xl font-black font-mono text-white">100%</div>
                <div className="text-[11px] font-bold text-white mt-0.5">Digital Receipts</div>
                <div className="text-[9px] text-sky-100 font-medium">No paperwork</div>
              </div>
            </div>

            {/* Clean Security Card */}
            <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center gap-3 text-xs text-white">
              <Shield className="h-5 w-5 text-sky-200 shrink-0" />
              <span>
                100% Safe & Secure. Verified drivers, delivery confirmation OTP, and 24/7 customer support.
              </span>
            </div>
          </div>

          {/* Bottom Public Tracking Link */}
          <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/20 text-xs text-sky-100">
            <span>Customer tracking a consignment?</span>
            <Link
              to="/track/TRK-2026-98124"
              className="text-white hover:underline font-bold flex items-center gap-1.5 transition-colors"
            >
              <span>Public Live Tracking Portal</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* RIGHT SIDE: Authentication Form & 1-Click Role Switcher */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 py-10 overflow-y-auto relative bg-[#FAF9F5] dark:bg-[#090E17] text-slate-800 dark:text-slate-100 transition-colors duration-200 bg-tech-dots">
          {/* Top-Right Language & Theme Toggles */}
          <div className="flex justify-end items-center gap-2 mb-4">
            {/* Bilingual Switcher */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center p-0.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-xs text-xs font-semibold transition-all hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              title={language === "en" ? "हिंदी में बदलें (Switch to Hindi)" : "Switch to English"}
            >
              <span
                className={`px-2.5 py-1 rounded-full transition-all text-[11px] font-bold ${
                  language === "en"
                    ? "bg-[#2F80ED] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                EN
              </span>
              <span
                className={`px-2.5 py-1 rounded-full transition-all text-[11px] font-bold ${
                  language === "hi"
                    ? "bg-[#2F80ED] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                हिंदी
              </span>
            </button>

            {/* Theme Switcher */}
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 p-1 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-xs text-xs font-semibold transition-all hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              title={`Currently in ${theme} mode. Click to switch.`}
            >
              <span
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${
                  theme === "light"
                    ? "bg-[#2F80ED] text-white font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Sun className="h-3.5 w-3.5" />
                <span className="text-[11px]">Light</span>
              </span>
              <span
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${
                  theme === "dark"
                    ? "bg-[#2F80ED] text-white font-bold shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Moon className="h-3.5 w-3.5" />
                <span className="text-[11px]">Dark</span>
              </span>
            </button>
          </div>

          <div className="max-w-md w-full mx-auto space-y-6">
            {/* Mobile Header */}
            <div className="lg:hidden mb-2">
              <LogiPulseLogo size="md" />
            </div>

            {/* Title & Subtitle */}
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {isRegister ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                {isRegister
                  ? "Create an account to book trucks and manage shipments."
                  : "Sign in with your email or pick a demo role below."}
              </p>
            </div>

            {/* 1-CLICK DEMO ROLE SWITCHER */}
            <div className="p-4 rounded-2xl border border-[#2F80ED]/30 dark:border-[#2F80ED]/40 bg-white/95 dark:bg-[#0E1626]/90 backdrop-blur-md shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#2F80ED] flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#2F80ED]" />
                  <span>1-Click Demo Sign-In</span>
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">5 Active Roles</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {demoRoles.map((r) => (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => handleQuickLogin(r.role)}
                    disabled={loading}
                    className="hover-lift group flex flex-col items-center p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C31] hover:border-[#2F80ED] dark:hover:border-[#2F80ED] hover:bg-sky-50/50 dark:hover:bg-sky-950/40 shadow-xs transition-all text-center disabled:opacity-50 cursor-pointer"
                  >
                    <img
                      src={r.avatar}
                      alt={r.name}
                      className="h-8 w-8 rounded-full object-cover border border-[#2F80ED]/30 group-hover:scale-110 group-hover:rotate-3 transition-transform"
                    />
                    <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 mt-1 truncate w-full">
                      {r.role === "ADMIN"
                        ? "Admin"
                        : r.role === "DISPATCHER"
                        ? "Dispatcher"
                        : r.role === "DRIVER"
                        ? "Driver"
                        : r.role === "FINANCE"
                        ? "Finance"
                        : "Customer"}
                    </span>
                    <span className="text-[9px] text-[#2F80ED] font-semibold uppercase tracking-wider">
                      {r.role === "ADMIN"
                        ? "Full Command"
                        : r.role === "DISPATCHER"
                        ? "Live Routes"
                        : r.role === "DRIVER"
                        ? "Cab App"
                        : r.role === "FINANCE"
                        ? "Billing"
                        : "Track & Book"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Form Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
              <span className="bg-[#FAF9F5] dark:bg-[#090E17] px-3 text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold transition-colors duration-200">
                Or sign in with email
              </span>
              <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login / Register Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ayush Raj"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#2F80ED] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        Organization
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                        <input
                          type="text"
                          placeholder="Company Name"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#2F80ED] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                        Account Type
                      </label>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2F80ED] focus:outline-none"
                      >
                        <option value="CUSTOMER">Customer (Book & Track)</option>
                        <option value="DISPATCHER">Dispatcher (Routes & Fleets)</option>
                        <option value="DRIVER">Driver (Delivery App)</option>
                        <option value="FINANCE">Finance (Invoices)</option>
                        <option value="ADMIN">System Admin</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="admin@logipulse.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#2F80ED] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Password
                  </label>
                  {!isRegister && (
                    <button
                      type="button"
                      onClick={() => {
                        setEmail("admin@logipulse.com");
                        setPassword("password123");
                      }}
                      className="text-[11px] text-[#2F80ED] font-semibold hover:underline cursor-pointer"
                    >
                      Reset demo credentials
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-9 pl-9 pr-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-[#2F80ED] focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 mt-3 text-xs tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg text-white font-extrabold uppercase rounded-xl bg-[#2F80ED] hover:bg-[#256fd1] transition-all"
              >
                {loading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                ) : (
                  <>
                    <span className="font-extrabold">
                      {isRegister ? "Create Account & Sign In" : "Sign In to Platform"}
                    </span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Direct Track Option without login */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                <Package className="h-4 w-4 text-[#2F80ED]" />
                <span>Tracking an order?</span>
              </span>
              <Link
                to="/track/TRK-2026-98124"
                className="text-[#2F80ED] font-bold hover:underline flex items-center gap-1"
              >
                <span>Track live without login</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            {/* Switch between Login and Register */}
            <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-1">
              {isRegister ? (
                <span>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsRegister(false)}
                    className="text-[#2F80ED] font-bold hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </span>
              ) : (
                <span>
                  Don't have an enterprise account?{" "}
                  <button
                    type="button"
                    onClick={() => setIsRegister(true)}
                    className="text-[#2F80ED] font-bold hover:underline cursor-pointer"
                  >
                    Register Free
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 100% WORKING UBER-STYLE FOOTER (EXACTLY MATCHING USER'S SCREENSHOT)       */}
      {/* ========================================================================= */}
      <footer className="w-full bg-[#000000] text-white pt-14 pb-12 px-6 sm:px-12 lg:px-20 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Top Row: Brand & Working Top Nav (Ride, Drive, Business, About ▾) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4">
            <div className="flex flex-wrap items-center gap-8">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="text-2xl font-bold tracking-tight text-white font-heading cursor-pointer hover:opacity-90"
              >
                LogiPulse
              </button>
              <nav className="flex flex-wrap items-center gap-6 text-sm text-neutral-200 font-medium">
                <button
                  type="button"
                  onClick={() => navigate("/track/TRK-2026-98124")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Ride
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("DRIVER")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Drive
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("DISPATCHER")}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Business
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModal("about")}
                  className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>About</span>
                  <span className="text-xs">▾</span>
                </button>
              </nav>
            </div>

            {/* Working Direct Live Tracking Button */}
            <div>
              <Link
                to="/track/TRK-2026-98124"
                className="px-4 py-2 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>Track a Shipment</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* 4 Columns (Company, Products, Global citizenship, Travel) - ALL WORKING! */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {/* Column 1: Company */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Company</h3>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("about")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    About us
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("offerings")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Our offerings
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("about")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Newsroom
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("about")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Investors
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("about")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Blog
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("careers")}
                    className="hover:text-white transition-colors cursor-pointer text-left flex items-center gap-1.5"
                  >
                    <span>Careers</span>
                    <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-400 font-mono rounded-sm">HIRING</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("CUSTOMER")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    LogiPulse One
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Products */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Products</h3>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/track/TRK-2026-98124")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Ride
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("DRIVER")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Drive
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/track/TRK-2026-98119")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Eat & Express
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("DISPATCHER")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Uber for Business
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleQuickLogin("CUSTOMER")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    LogiPulse Freight
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("offerings")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Gift cards
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/track/TRK-2026-98075")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    LogiPulse Health (Cold Chain)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("offerings")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    LogiPulse Advertising
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Global citizenship */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Global citizenship</h3>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("safety")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Safety
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("sustainability")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Sustainability
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Travel & Corridors */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-white">Travel</h3>
              <ul className="space-y-3 text-sm text-neutral-400">
                <li>
                  <Link
                    to="/track/TRK-2026-98124"
                    className="hover:text-white transition-colors text-left flex items-center gap-1 text-emerald-400 font-semibold"
                  >
                    <span>Reserve / Track</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/track/TRK-2026-98150")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Airports
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => navigate("/track/TRK-2026-98075")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Hotels & Hubs
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActiveModal("city")}
                    className="hover:text-white transition-colors cursor-pointer text-left"
                  >
                    Cities
                  </button>
                </li>
              </ul>
            </div>
          </div>


          {/* Bottom Row: Working Language Switcher, Working City Selector, & Legal Modals */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-6 border-t border-neutral-900 text-xs text-neutral-400">
            <div>
              © 2026 LogiPulse Technologies Inc.
            </div>
            <div className="flex flex-wrap items-center gap-6 text-neutral-400">
              {/* Working Language Toggle */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors"
                title="Click to toggle English / हिंदी"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>{language === "en" ? "English" : "हिंदी"}</span>
              </button>

              {/* Working City Selector */}
              <button
                type="button"
                onClick={() => setActiveModal("city")}
                className="flex items-center gap-1.5 hover:text-white cursor-pointer transition-colors"
                title="Click to change operating region"
              >
                <MapPin className="h-3.5 w-3.5 text-white" />
                <span>{selectedCity}</span>
              </button>

              {/* Working Privacy, Accessibility, Terms modals */}
              <button
                type="button"
                onClick={() => setActiveModal("privacy")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacy
              </button>
              <button
                type="button"
                onClick={() => setActiveModal("accessibility")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Accessibility
              </button>
              <button
                type="button"
                onClick={() => setActiveModal("terms")}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Terms
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* INTERACTIVE MODAL DIALOG (Powers all working footer items) */}
      {/* ========================================================= */}
      {activeModal && modalContent && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="bg-white dark:bg-[#0E1626] rounded-2xl max-w-lg w-full p-6 text-slate-900 dark:text-white shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-heading text-base font-bold flex items-center gap-2">
                <span>{modalContent.title}</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-h-96 overflow-y-auto pr-1">
              {modalContent.body}
            </div>
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold hover:opacity-90 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
