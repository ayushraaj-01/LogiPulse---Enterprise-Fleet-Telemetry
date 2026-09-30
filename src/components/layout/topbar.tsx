"use client";

import * as React from "react";
import {
  Menu,
  Search,
  Bell,
  Radio,
  Plus,
  SlidersHorizontal,
  LogOut,
  User,
  Shield,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const [unreadCount, setUnreadCount] = React.useState(3);
  const [isDemoMode, setIsDemoMode] = React.useState(true);

  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-border bg-card/80 px-4 md:px-6 backdrop-blur-md">
      {/* Left: Mobile Menu & Search Trigger */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="md:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Global Search / Command Palette Trigger */}
        <button
          className="flex h-9 items-center gap-2 rounded-lg border border-input bg-background/60 px-3 text-xs text-muted-foreground transition-colors hover:border-primary/50 hover:bg-background md:w-64"
          aria-label="Open command palette"
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="hidden md:inline">Search vehicles, shipments...</span>
          <span className="md:hidden">Search...</span>
          <kbd className="ml-auto pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>

        {/* Demo Mode Badge */}
        {isDemoMode && (
          <Badge
            variant="warning"
            className="hidden sm:inline-flex items-center gap-1 cursor-pointer select-none text-[11px]"
            onClick={() => setIsDemoMode(!isDemoMode)}
            title="Click to toggle Demo Mode"
          >
            <Sparkles className="h-3 w-3 text-amber-500" />
            Demo Mode Active
          </Badge>
        )}
      </div>

      {/* Right: Live Connection Pill, Quick Action, Notifications, User Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Live WebSocket Status Pill */}
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="hidden sm:inline font-mono text-[11px]">TELEMETRY LIVE</span>
          <span className="sm:hidden font-mono text-[11px]">LIVE</span>
        </div>

        {/* Notification Bell Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label="View notifications"
            >
              <Bell className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white shadow-xs">
                  {unreadCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 glass-dropdown">
            <div className="flex items-center justify-between p-3 border-b border-border/80">
              <span className="font-semibold text-sm">Notifications</span>
              <button
                onClick={() => setUnreadCount(0)}
                className="text-[11px] text-primary hover:underline"
              >
                Mark all as read
              </button>
            </div>
            <div className="py-1 divide-y divide-border/40">
              <div className="p-3 text-xs hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    Geofence Alert: Depot South
                  </span>
                  <span className="text-[10px] text-muted-foreground">2m ago</span>
                </div>
                <p className="text-muted-foreground mt-0.5">
                  Truck FLT-104 exited unauthorized sector.
                </p>
              </div>
              <div className="p-3 text-xs hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">
                    Shipment Delivered
                  </span>
                  <span className="text-[10px] text-muted-foreground">14m ago</span>
                </div>
                <p className="text-muted-foreground mt-0.5">
                  TRK-98124 signed by M. Sterling (e-POD verified).
                </p>
              </div>
              <div className="p-3 text-xs hover:bg-muted/50 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-amber-500">
                    Maintenance Due
                  </span>
                  <span className="text-[10px] text-muted-foreground">1h ago</span>
                </div>
                <p className="text-muted-foreground mt-0.5">
                  Van VN-208 reached 40,000 km threshold.
                </p>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Avatar Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="relative h-9 w-9 rounded-full ring-offset-background transition-transform active:scale-95"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary/20 text-primary font-bold">
                  AV
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 glass-dropdown" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none text-foreground">
                  Alex Vance
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  a.vance@logipulse.io
                </p>
                <div className="pt-1">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    DISPATCHER_ADMIN
                  </Badge>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Dispatcher Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Shield className="mr-2 h-4 w-4" />
              <span>Role Permissions</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <span>Fleet Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setIsDemoMode(!isDemoMode)}
              className="text-amber-500 font-medium"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Toggle Demo Mode</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive font-medium">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
