"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Truck,
  MapPin,
  Package,
  KanbanSquare,
  Wrench,
  Fuel,
  Receipt,
  BarChart3,
  ShieldCheck,
  Palette,
  Route,
  Users,
  Smartphone,
  ChevronLeft,
  ChevronRight,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const mainNavItems: NavItem[] = [
  { title: "Overview", href: "/overview", icon: BarChart3 },
  { title: "Live Map", href: "/map", icon: MapPin, badge: "Live" },
  { title: "Shipments", href: "/shipments", icon: Package },
  { title: "Dispatch Board", href: "/shipments/board", icon: KanbanSquare },
  { title: "Fleet Assets", href: "/fleet", icon: Truck },
  { title: "Drivers", href: "/drivers", icon: Users },
  { title: "Route Optimizer", href: "/routes", icon: Route },
  { title: "Maintenance", href: "/maintenance", icon: Wrench },
  { title: "Fuel & Expenses", href: "/fuel-expenses", icon: Fuel },
  { title: "Billing & Invoices", href: "/billing", icon: Receipt },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Audit Logs", href: "/audit-logs", icon: ShieldCheck },
  { title: "Design System", href: "/design-system", icon: Palette },
];

export function Sidebar({
  isMobile = false,
  onClose,
}: {
  isMobile?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-border bg-card/95 backdrop-blur-md transition-all duration-300 z-30",
        isMobile ? "w-72 h-full" : collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-border/80 px-4">
        <Link
          href="/overview"
          className="flex items-center gap-2.5 overflow-hidden group"
          onClick={onClose}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform">
            <Truck className="h-5 w-5" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex flex-col">
              <span className="font-heading text-lg font-bold tracking-tight text-foreground flex items-center gap-1.5">
                LogiPulse
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary uppercase tracking-wide">
                  PRO
                </span>
              </span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Fleet Online
              </span>
            </div>
          )}
        </Link>

        {!isMobile && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setCollapsed(!collapsed)}
            className="text-muted-foreground hover:text-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 relative",
                isActive
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0 transition-colors",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              {(!collapsed || isMobile) && (
                <span className="truncate flex-1">{item.title}</span>
              )}
              {(!collapsed || isMobile) && item.badge && (
                <Badge
                  variant={isActive ? "secondary" : "default"}
                  className="ml-auto text-[10px] px-1.5 py-0"
                >
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </div>

      {/* Driver Mobile Portal Shortcut */}
      <div className="p-3 border-t border-border/80">
        <Link
          href="/driver/shift"
          onClick={onClose}
          className="flex items-center gap-3 rounded-lg p-2.5 bg-accent/10 border border-accent/20 hover:bg-accent/15 transition-colors text-accent-foreground group"
        >
          <div className="p-1.5 rounded-md bg-accent/20 text-accent">
            <Smartphone className="h-4 w-4" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1">
                Driver PWA View
              </span>
              <span className="text-[10px] text-muted-foreground">
                In-cab mobile interface
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Bottom User & Theme Footer */}
      <div className="border-t border-border/80 p-3 flex items-center justify-between">
        {(!collapsed || isMobile) ? (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0 border border-primary/30">
              AD
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold truncate text-foreground">
                Alex Vance
              </span>
              <span className="text-[10px] text-muted-foreground truncate">
                Chief Dispatcher
              </span>
            </div>
          </div>
        ) : (
          <div className="h-8 w-8 mx-auto rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center border border-primary/30">
            AD
          </div>
        )}
        {(!collapsed || isMobile) && <ThemeToggle />}
      </div>
    </aside>
  );
}
