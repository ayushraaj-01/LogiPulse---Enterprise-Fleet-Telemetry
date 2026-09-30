import React from "react";
import { NavLink } from "react-router-dom";
import {
  Smartphone,
  ExternalLink,
  Shield,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { getNavItemsForRole, ROLE_CONFIG } from "../utils/rolePermissions";

const PATH_TITLE_MAP = {
  "/overview": "navOverview",
  "/map": "navLiveMap",
  "/shipments": "navShipments",
  "/dispatch-board": "navDispatchBoard",
  "/fleet": "navFleet",
  "/drivers": "navDrivers",
  "/routes": "navRoutes",
  "/maintenance": "navMaintenance",
  "/fuel-expenses": "navFuelExpenses",
  "/billing": "navBilling",
  "/analytics": "navAnalytics",
  "/audit-logs": "navAuditLogs",
  "/driver-portal": "navDriverPortal",
  "/track-order": "navCustomerTrack",
  "/book-shipment": "navCustomerBook",
  "/support": "navCustomerSupport",
};

export const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const userRole = (user?.role || "CUSTOMER").toUpperCase();
  const navItems = getNavItemsForRole(userRole);
  const roleMeta = ROLE_CONFIG[userRole] || ROLE_CONFIG.CUSTOMER;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-border bg-card/95 backdrop-blur-md transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col justify-between`}
      >
        {/* Nav Items */}
        <div className="overflow-y-auto py-4 px-3 space-y-1">
          {/* Current Role Indicator */}
          <div className="mb-3 px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Role Persona
              </span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">
                {userRole === "ADMIN"
                  ? t("roleBadgeAdmin")
                  : userRole === "DISPATCHER"
                  ? t("roleBadgeDispatcher")
                  : userRole === "DRIVER"
                  ? t("roleBadgeDriver")
                  : userRole === "FINANCE"
                  ? t("roleBadgeFinance")
                  : t("roleBadgeCustomer")}
              </span>
            </div>
            <div className="text-xs font-bold text-foreground mt-0.5 truncate">
              {userRole === "ADMIN"
                ? t("roleAdmin")
                : userRole === "DISPATCHER"
                ? t("roleDispatcher")
                : userRole === "DRIVER"
                ? t("roleDriver")
                : userRole === "FINANCE"
                ? t("roleFinance")
                : t("roleCustomer")}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
              {userRole === "ADMIN"
                ? language === "hi"
                  ? "सभी 12 मॉड्यूल अनलॉक हैं"
                  : "All 12 Modules Unlocked"
                : `${navItems.length} ${language === "hi" ? "प्राधिकृत मॉड्यूल" : "Authorized Modules"}`}
            </div>
          </div>

          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>{language === "hi" ? "सुलभ मॉड्यूल" : "Accessible Modules"}</span>
            <span className="font-mono text-[9px] text-muted-foreground">({navItems.length})</span>
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-xs shadow-primary/20"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate flex-1">
                      {PATH_TITLE_MAP[item.path] ? t(PATH_TITLE_MAP[item.path]) : item.title}
                    </span>
                    {item.badge && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold tracking-wide uppercase transition-colors ${
                          isActive
                            ? "bg-slate-900 text-yellow-400 shadow-xs font-black"
                            : "bg-emerald-500/20 text-emerald-600 border border-emerald-500/40"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}

          {/* Role-Specific Quick Portals */}
          <div className="pt-4 border-t border-border mt-3 space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Workflows & Portals
            </div>

            {(userRole === "ADMIN" || userRole === "DRIVER") && (
              <NavLink
                to="/driver-portal"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold text-accent hover:bg-accent/10 border border-accent/20 transition-colors"
              >
                <Smartphone className="h-4 w-4" />
                <span>Driver In-Cab Console</span>
              </NavLink>
            )}

            {userRole === "CUSTOMER" && (
              <NavLink
                to="/support"
                onClick={onClose}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ExternalLink className="h-3.5 w-3.5 text-primary" />
                  24/7 Helpline & Claims
                </span>
                <span className="text-[10px] font-mono text-emerald-400">Toll-Free</span>
              </NavLink>
            )}
          </div>
        </div>

        {/* User Card at Bottom */}
        <div className="p-3 border-t border-border bg-card/60">
          <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50 border border-border/60">
            <div className="h-8 w-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center border border-primary/30 shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : "LP"}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs font-semibold text-foreground truncate">{user?.name}</span>
              <span className="text-[10px] text-muted-foreground font-mono truncate">{user?.role}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
