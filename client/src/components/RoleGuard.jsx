import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldAlert, ArrowRight, Sparkles, UserCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { isPathAllowedForRole, ROLE_CONFIG, getDefaultPathForRole } from "../utils/rolePermissions";

export const RoleGuard = ({ children }) => {
  const { user, demoRoles, loginAsRole } = useAuth();
  const location = useLocation();

  const userRole = (user?.role || "CUSTOMER").toUpperCase();
  const isAllowed = isPathAllowedForRole(userRole, location.pathname);

  if (isAllowed) {
    return children;
  }

  const roleMeta = ROLE_CONFIG[userRole] || ROLE_CONFIG.CUSTOMER;
  const defaultPath = getDefaultPathForRole(userRole);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-lg w-full rounded-2xl border border-destructive/30 bg-card p-6 md:p-8 shadow-xl text-center space-y-5">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20">
          <ShieldAlert className="h-7 w-7" />
        </div>

        <div>
          <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded bg-destructive/15 text-destructive">
            Role Permission Barrier
          </span>
          <h2 className="font-heading text-xl font-bold text-foreground mt-2">
            Module Restricted for {roleMeta.label}
          </h2>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Your current persona (<b className="text-foreground">{userRole}</b>) is scoped to specialized
            operations and does not have clearance for the <span className="font-mono text-primary">{location.pathname}</span> route.
          </p>
        </div>

        {/* Allowed Modules for this role */}
        <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-left space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Authorized Areas for {roleMeta.label}:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {roleMeta.allowedPaths.map((path) => (
              <Link
                key={path}
                to={path}
                className="px-2 py-1 rounded-md bg-background border border-border text-[11px] font-medium text-foreground hover:border-primary hover:text-primary transition-colors"
              >
                {path.replace("/", "").replace("-", " ").toUpperCase()}
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Switch to Role or Return to Home */}
        <div className="space-y-3 pt-2">
          <Link
            to={defaultPath}
            className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 flex items-center justify-center gap-2 transition-colors"
          >
            <span>Return to {roleMeta.label} Home</span>
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="text-[11px] text-muted-foreground pt-1 flex items-center justify-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Need full clearance? Instant 1-click switch:</span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => loginAsRole("ADMIN")}
              className="px-3 py-2 rounded-lg border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Switch to Admin</span>
            </button>
            <button
              onClick={() => loginAsRole("DISPATCHER")}
              className="px-3 py-2 rounded-lg border border-border bg-muted/60 hover:bg-muted text-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Switch to Dispatcher</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
