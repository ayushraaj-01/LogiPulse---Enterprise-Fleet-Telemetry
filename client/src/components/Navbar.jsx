import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sun,
  Moon,
  Radio,
  User,
  LogOut,
  ChevronDown,
  Shield,
  Sparkles,
  Smartphone,
  Search,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { getDefaultPathForRole } from "../utils/rolePermissions";
import { LogiPulseLogo } from "./LogiPulseLogo";

export const Navbar = ({ onToggleSidebar }) => {
  const { user, logout, demoRoles, loginAsRole } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage, t } = useLanguage();
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border bg-card/85 px-4 md:px-6 backdrop-blur-md">
      {/* Left: Brand Logo & Mobile Trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-muted-foreground hover:bg-muted md:hidden"
          aria-label="Toggle Navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link to="/overview" className="flex items-center">
          <LogiPulseLogo
            size="md"
            subtitle={t("brandSubtitle")}
          />
        </Link>
      </div>

      {/* Middle: Quick 1-Click Role Switcher */}
      <div className="hidden lg:flex items-center gap-3">

        {/* 1-Click Role Switcher Selector */}
        <div className="relative">
          <button
            onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/15 text-primary text-xs font-semibold transition-all shadow-xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>{t("switchPersona")}:</span>
            <span className="px-1.5 py-0.5 rounded bg-primary text-primary-foreground font-mono uppercase text-[10px]">
              {user?.role || "GUEST"}
            </span>
            <ChevronDown className="h-3.5 w-3.5" />
          </button>

          {roleDropdownOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-xl border border-border bg-popover/95 backdrop-blur-xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
              <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2 py-1 border-b border-border mb-1">
                Instant 1-Click Role Switcher
              </div>
              {demoRoles.map((r) => (
                <button
                  key={r.role}
                  onClick={async () => {
                    await loginAsRole(r.role);
                    setRoleDropdownOpen(false);
                    navigate(getDefaultPathForRole(r.role));
                  }}
                  className={`w-full flex items-start gap-2.5 p-2 rounded-lg text-left text-xs transition-colors ${user?.role === r.role
                    ? "bg-primary/15 text-primary font-semibold border border-primary/20"
                    : "hover:bg-muted text-foreground"
                    }`}
                >
                  <img src={r.avatar} alt={r.name} className="h-7 w-7 rounded-full object-cover shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-foreground">{r.title}</span>
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-muted text-muted-foreground">
                        {r.badge}
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground truncate">{r.name}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right: Language Toggle, Theme Toggle & User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Bilingual Hindi/English Switcher */}
        <button
          onClick={toggleLanguage}
          className="flex items-center p-0.5 rounded-full border border-border bg-muted/80 hover:bg-muted text-xs font-semibold transition-all shadow-xs"
          title={language === "en" ? "हिंदी में बदलें (Switch to Hindi)" : "Switch to English"}
          aria-label="Toggle Language"
        >
          <span
            className={`px-2 py-1 rounded-full transition-all text-[11px] font-bold ${language === "en"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            EN
          </span>
          <span
            className={`px-2 py-1 rounded-full transition-all text-[11px] font-bold ${language === "hi"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            हिंदी
          </span>
        </button>
        {/* Theme Light/Dark Mode Switcher Pill */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 p-1 rounded-full border border-border bg-muted/80 hover:bg-muted text-xs font-semibold transition-all shadow-xs"
          title={`Currently ${theme} mode. Click to toggle light/dark`}
          aria-label="Toggle Light and Dark Mode"
        >
          <span
            className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all ${theme === "light"
              ? "bg-primary text-primary-foreground font-bold shadow-xs"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Sun className="h-3.5 w-3.5" />
            <span className="text-[11px] hidden sm:inline">Light</span>
          </span>
          <span
            className={`flex items-center gap-1 px-2 py-1 rounded-full transition-all ${theme === "dark"
              ? "bg-primary text-primary-foreground font-bold shadow-xs"
              : "text-muted-foreground hover:text-foreground"
              }`}
          >
            <Moon className="h-3.5 w-3.5" />
            <span className="text-[11px] hidden sm:inline">Dark</span>
          </span>
        </button>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(!userDropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-muted transition-colors"
          >
            <img
              src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
              alt={user?.name || "User"}
              className="h-8 w-8 rounded-full object-cover border border-primary/30"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold leading-tight text-foreground truncate max-w-[120px]">
                {user?.name || "Guest User"}
              </span>
              <span className="text-[10px] text-muted-foreground font-mono">
                {user?.role || "VISITOR"}
              </span>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground hidden sm:block" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-popover/95 backdrop-blur-xl p-2 shadow-2xl z-50">
              <div className="px-3 py-2 border-b border-border/80 mb-1">
                <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary border border-primary/20">
                  {user?.role}
                </span>
              </div>

              <Link
                to="/driver-portal"
                onClick={() => setUserDropdownOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted rounded-lg transition-colors"
              >
                <Smartphone className="h-3.5 w-3.5 text-accent" />
                <span>Mobile Driver PWA View</span>
              </Link>

              <button
                onClick={() => {
                  setUserDropdownOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors font-medium mt-1"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>{t("logout")}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
