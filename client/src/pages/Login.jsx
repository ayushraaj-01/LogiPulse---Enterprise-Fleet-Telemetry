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
  Activity,
  Layers,
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
          "Authentication failed. Please verify credentials or choose 1-Click Role demo login."
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
      setError("Failed to auto-authenticate role. Try manual credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#FAF9F5] dark:bg-[#090E17] text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* LEFT SIDE: Whole Vibrant Sky Blue technical hero with pure white brand identity */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-[#2F80ED] text-white overflow-hidden border-r-2 border-dashed border-sky-200/50 bg-tech-grid-blue">
        {/* Subtle lighting sweeps */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-sky-300/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo - White Mark on Blue */}
        <div className="relative z-10 flex items-center justify-between">
          <LogiPulseLogo
            size="lg"
            variant="on-blue"
            subtitle="Enterprise Fleet Telemetry"
          />
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/25 text-xs font-mono font-bold tracking-wider text-white">
            <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
            <span>MERN v2.6 ACTIVE</span>
          </div>
        </div>

        {/* Middle Hero Content */}
        <div className="relative z-10 space-y-6 max-w-lg my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
            <Sparkles className="h-3.5 w-3.5 text-white" />
            <span>Next-Generation Logistics Infrastructure</span>
          </div>

          <h1 className="font-heading text-4xl xl:text-5xl font-extrabold tracking-tight leading-tight text-white drop-shadow-xs">
            <span>Track<span className="text-sky-200">.</span></span>{" "}
            <span>Optimize<span className="text-sky-200">.</span></span>{" "}
            <span>Deliver<span className="text-sky-200">.</span></span>
          </h1>

          <p className="text-sky-100 text-sm xl:text-base leading-relaxed font-normal">
            Autonomous route optimization, real-time GPS telemetry, and role-based logistics intelligence across Pacific Northwest distribution corridors.
          </p>

          {/* DevFest Inspired High-Contrast Telemetry Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-center">
              <div className="text-xl xl:text-2xl font-black font-mono text-white">99.8%</div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-sky-100 mt-0.5">SLA On-Time</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-center">
              <div className="text-xl xl:text-2xl font-black font-mono text-white">&lt;250ms</div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-sky-100 mt-0.5">GPS Latency</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 text-center">
              <div className="text-xl xl:text-2xl font-black font-mono text-white">100%</div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-sky-100 mt-0.5">Automated EPOD</div>
            </div>
          </div>

          {/* Security & Reliability Callout */}
          <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center gap-3 text-xs text-white">
            <Shield className="h-5 w-5 text-sky-200 shrink-0" />
            <span>
              {t("loginHeroSecurityNote")}
            </span>
          </div>
        </div>

        {/* Bottom Public Tracking Link */}
        <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/20 text-xs text-sky-100">
          <span>{t("loginHeroConsigneePrompt")}</span>
          <Link
            to="/track/TRK-2026-98124"
            className="text-white hover:underline font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>{t("loginHeroPublicPortalLink")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form & Quick Role Switcher - Adaptive Light & Dark Mode */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-6 sm:px-12 md:px-16 py-10 overflow-y-auto relative bg-[#FAF9F5] dark:bg-[#090E17] text-slate-800 dark:text-slate-100 transition-colors duration-200 bg-tech-dots">
        {/* Top-Right Language & Theme Toggles */}
        <div className="flex justify-end items-center gap-2 mb-4">
          {/* Bilingual Switcher */}
          <button
            type="button"
            onClick={toggleLanguage}
            className="flex items-center p-0.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] shadow-xs text-xs font-semibold transition-all hover:bg-slate-50 dark:hover:bg-slate-800"
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
            <LogiPulseLogo
              size="md"
            />
          </div>

          {/* Title & Subtitle */}
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {isRegister ? t("loginCreateAccount") : t("loginWelcomeBack")}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {isRegister
                ? t("loginSubtitleNew")
                : t("loginSubtitleExisting")}
            </p>
          </div>

          {/* 1-CLICK DEMO ROLE SWITCHER (Highlighted Feature) */}
          <div className="p-4 rounded-2xl border border-[#2F80ED]/30 dark:border-[#2F80ED]/40 bg-white/95 dark:bg-[#0E1626]/90 backdrop-blur-md shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2F80ED] flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#2F80ED]" />
                {t("login1ClickSwitcher")}
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
                  className="hover-lift group flex flex-col items-center p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131C31] hover:border-[#2F80ED] dark:hover:border-[#2F80ED] hover:bg-sky-50/50 dark:hover:bg-sky-950/40 shadow-xs transition-all text-center disabled:opacity-50"
                >
                  <img
                    src={r.avatar}
                    alt={r.name}
                    className="h-8 w-8 rounded-full object-cover border border-[#2F80ED]/30 group-hover:scale-110 group-hover:rotate-3 transition-transform"
                  />
                  <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 mt-1 truncate w-full">
                    {r.role === "ADMIN"
                      ? t("roleAdmin")
                      : r.role === "DISPATCHER"
                        ? t("roleDispatcher")
                        : r.role === "DRIVER"
                          ? t("roleDriver")
                          : r.role === "FINANCE"
                            ? t("roleFinance")
                            : t("roleCustomer")}
                  </span>
                  <span className="text-[9px] text-[#2F80ED] font-semibold uppercase tracking-wider">
                    {r.role === "ADMIN"
                      ? t("roleBadgeAdmin")
                      : r.role === "DISPATCHER"
                        ? t("roleBadgeDispatcher")
                        : r.role === "DRIVER"
                          ? t("roleBadgeDriver")
                          : r.role === "FINANCE"
                            ? t("roleBadgeFinance")
                            : t("roleBadgeCustomer")}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Form Divider */}
          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-[#FAF9F5] dark:bg-[#090E17] px-3 text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold transition-colors duration-200">
              {t("loginOrSignInWithEmail")}
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
                    {t("loginFullName")}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Elena Rostova"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-[#2F80ED] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      {t("loginOrganization")}
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-[#2F80ED] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                      {t("loginRoleSelection")}
                    </label>
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full h-9 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#2F80ED] focus:outline-none"
                    >
                      <option value="CUSTOMER">{t("roleCustomer")}</option>
                      <option value="DISPATCHER">{t("roleDispatcher")}</option>
                      <option value="DRIVER">{t("roleDriver")}</option>
                      <option value="FINANCE">{t("roleFinance")}</option>
                      <option value="ADMIN">{t("roleAdmin")}</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200 mb-1">
                {t("loginEmailAddress")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-9 pl-9 pr-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-[#2F80ED] focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {t("loginPassword")}
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("admin@logipulse.com");
                      setPassword("password123");
                    }}
                    className="text-[11px] text-[#2F80ED] font-semibold hover:underline"
                  >
                    {t("loginResetDefault")}
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
                  className="w-full h-9 pl-9 pr-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0E1626] text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-[#2F80ED] focus:outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-blue w-full h-11 mt-3 text-xs tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg text-white font-extrabold uppercase"
            >
              {loading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>
                  <span className="font-extrabold">{isRegister ? t("loginBtnCreate") : t("loginBtnSignIn")}</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.5] transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login and Register */}
          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
            {isRegister ? (
              <span>
                {t("loginAlreadyHaveAccount")}{" "}
                <button
                  onClick={() => setIsRegister(false)}
                  className="text-[#2F80ED] font-semibold hover:underline"
                >
                  {t("loginSignInLink")}
                </button>
              </span>
            ) : (
              <span>
                {t("loginDontHaveAccount")}{" "}
                <button
                  onClick={() => setIsRegister(true)}
                  className="text-[#2F80ED] font-semibold hover:underline"
                >
                  {t("loginRegisterLink")}
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
