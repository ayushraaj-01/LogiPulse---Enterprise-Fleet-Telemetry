"use client";

import * as React from "react";
import {
  Truck,
  Package,
  Wrench,
  Fuel,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
  Palette,
  Type,
  Maximize2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export default function DesignSystemPage() {
  const [testDialogOpen, setTestDialogOpen] = React.useState(false);
  const [progressVal, setProgressVal] = React.useState(68);

  return (
    <div className="space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col gap-2 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-primary font-mono text-xs">
              Phase 0.5
            </Badge>
            <span className="text-xs text-muted-foreground">WCAG 2.1 AA Compliant</span>
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground mt-1">
            LogiPulse Design System & Component Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Centralized design tokens, atomic headless primitives, elevation scales, and interactive states for enterprise logistics workflows.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="glass"
            size="sm"
            onClick={() => toast.success("Design system tokens revalidated!", { description: "Contrast ratios verified for light & dark modes." })}
          >
            <Sparkles className="mr-2 h-4 w-4 text-amber-500" />
            Test Toast Notification
          </Button>
        </div>
      </div>

      <Tabs defaultValue="tokens" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 max-w-xl">
          <TabsTrigger value="tokens" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Tokens & Colors</span>
          </TabsTrigger>
          <TabsTrigger value="components" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            <span>Base Components</span>
          </TabsTrigger>
          <TabsTrigger value="logistics" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span>Logistics Assets</span>
          </TabsTrigger>
          <TabsTrigger value="states" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>Async States</span>
          </TabsTrigger>
        </TabsList>

        {/* 1. TOKENS & COLORS */}
        <TabsContent value="tokens" className="space-y-8">
          {/* Brand & Neutral Colors */}
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold">Color Tokens (HSL Tailored)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              <div className="rounded-xl border p-3 bg-card space-y-2">
                <div className="h-14 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-mono text-xs font-bold shadow-xs">
                  Primary
                </div>
                <div>
                  <div className="text-xs font-semibold">Fleet Blue</div>
                  <div className="text-[10px] text-muted-foreground font-mono">221° 83% 53%</div>
                </div>
              </div>

              <div className="rounded-xl border p-3 bg-card space-y-2">
                <div className="h-14 rounded-lg bg-accent flex items-center justify-center text-accent-foreground font-mono text-xs font-bold shadow-xs">
                  Accent
                </div>
                <div>
                  <div className="text-xs font-semibold">Active Cyan</div>
                  <div className="text-[10px] text-muted-foreground font-mono">199° 89% 48%</div>
                </div>
              </div>

              <div className="rounded-xl border p-3 bg-card space-y-2">
                <div className="h-14 rounded-lg bg-success flex items-center justify-center text-success-foreground font-mono text-xs font-bold shadow-xs">
                  Success
                </div>
                <div>
                  <div className="text-xs font-semibold">In-Motion / Del.</div>
                  <div className="text-[10px] text-muted-foreground font-mono">142° 71% 45%</div>
                </div>
              </div>

              <div className="rounded-xl border p-3 bg-card space-y-2">
                <div className="h-14 rounded-lg bg-warning flex items-center justify-center text-warning-foreground font-mono text-xs font-bold shadow-xs">
                  Warning
                </div>
                <div>
                  <div className="text-xs font-semibold">Idling / Pending</div>
                  <div className="text-[10px] text-muted-foreground font-mono">38° 92% 50%</div>
                </div>
              </div>

              <div className="rounded-xl border p-3 bg-card space-y-2">
                <div className="h-14 rounded-lg bg-destructive flex items-center justify-center text-destructive-foreground font-mono text-xs font-bold shadow-xs">
                  Destructive
                </div>
                <div>
                  <div className="text-xs font-semibold">Stopped / Alert</div>
                  <div className="text-[10px] text-muted-foreground font-mono">0° 84% 60%</div>
                </div>
              </div>

              <div className="rounded-xl border p-3 bg-card space-y-2">
                <div className="h-14 rounded-lg bg-muted flex items-center justify-center text-muted-foreground font-mono text-xs font-bold border">
                  Muted
                </div>
                <div>
                  <div className="text-xs font-semibold">Slate Surface</div>
                  <div className="text-[10px] text-muted-foreground font-mono">210° 40% 96%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Typography Scale */}
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold flex items-center gap-2">
              <Type className="h-5 w-5 text-primary" />
              Typography Scale (Outfit Heading + Inter Body)
            </h2>
            <Card>
              <CardContent className="p-6 space-y-6 divide-y divide-border">
                <div className="pt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-xs font-mono text-muted-foreground w-40">Display Hero (48px)</span>
                  <span className="font-heading text-4xl sm:text-5xl font-bold tracking-tight">Real-Time Fleet Velocity</span>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-xs font-mono text-muted-foreground w-40">H1 Header (30px)</span>
                  <span className="font-heading text-3xl font-bold">Autonomous Dispatch & Routing</span>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-xs font-mono text-muted-foreground w-40">H2 Section (24px)</span>
                  <span className="font-heading text-2xl font-semibold">Active Fleet Telemetry Stream</span>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-xs font-mono text-muted-foreground w-40">H3 Card (18px)</span>
                  <span className="font-heading text-lg font-medium">Vehicle FLT-104 - Heavy Hauler</span>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-xs font-mono text-muted-foreground w-40">Body Standard (14px)</span>
                  <span className="text-sm text-foreground">Standardized tabular telemetry coordinate stream updating at 1,000ms intervals with heading interpolation.</span>
                </div>
                <div className="pt-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <span className="text-xs font-mono text-muted-foreground w-40">Numeric Monospace (24px)</span>
                  <span className="font-mono text-2xl font-bold tabular-nums text-primary">84.2 km/h • 1,428.40 USD • 98.6%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 2. BASE COMPONENTS */}
        <TabsContent value="components" className="space-y-8">
          {/* Button Matrix */}
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold">Button Hierarchy & Interactive States</h2>
            <Card>
              <CardContent className="p-6 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="default">Primary Action</Button>
                  <Button variant="secondary">Secondary Action</Button>
                  <Button variant="outline">Outline Action</Button>
                  <Button variant="destructive">Destructive</Button>
                  <Button variant="success">Success / Approve</Button>
                  <Button variant="warning">Warning / Hold</Button>
                  <Button variant="glass">Glass Panel</Button>
                  <Button variant="ghost">Ghost Link</Button>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border">
                  <Button size="sm">Small (32px)</Button>
                  <Button size="default">Default (36px)</Button>
                  <Button size="lg">Large (44px)</Button>
                  <Button size="icon" aria-label="Quick truck info">
                    <Truck className="h-4 w-4" />
                  </Button>
                  <Button disabled>Disabled State</Button>
                  <Button variant="default" className="active:scale-95 transition-transform">
                    Tactile Spring Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Inputs & Modals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Form Controls & Validation</CardTitle>
                <CardDescription>Inputs with focus rings, icons, and helper labels.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Tracking Number</label>
                  <Input placeholder="e.g. TRK-2026-98124" defaultValue="TRK-2026-98124" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Driver Assignment</label>
                  <Input placeholder="Search active drivers..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Disabled Parameter</label>
                  <Input disabled value="LOCKED_AUDIT_TRAIL" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Modal Dialog & Overlay</CardTitle>
                <CardDescription>Radix UI accessible dialog with focus-trap and smooth fade animation.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Modals are used for dispatch confirmations, driver onboarding, and emergency exception overrides.
                </p>
                <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Launch Interactive Test Modal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass-panel">
                    <DialogHeader>
                      <DialogTitle className="font-heading">Confirm Fast Dispatch Assignment</DialogTitle>
                      <DialogDescription>
                        This will re-route Truck FLT-104 and notify driver Marcus Ray via SMS and in-cab terminal.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-2 text-xs">
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">Shipment:</span>
                        <span className="font-semibold font-mono">TRK-2026-98124</span>
                      </div>
                      <div className="flex justify-between border-b pb-1">
                        <span className="text-muted-foreground">Estimated Distance:</span>
                        <span className="font-semibold">48.2 km</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dynamic ETA:</span>
                        <span className="font-semibold text-success">38 mins</span>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setTestDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="default"
                        onClick={() => {
                          setTestDialogOpen(false);
                          toast.success("Shipment successfully dispatched!", {
                            description: "Driver Marcus Ray acknowledged route.",
                          });
                        }}
                      >
                        Confirm Dispatch
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="space-y-2 pt-2 border-t border-border">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium">Fleet Load Factor</span>
                    <span className="font-mono text-primary font-bold">{progressVal}%</span>
                  </div>
                  <Progress value={progressVal} />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* 3. LOGISTICS ASSETS & STATUS BADGES */}
        <TabsContent value="logistics" className="space-y-8">
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold">Semantic Logistics Status Badges</h2>
            <Card>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-2 p-3 rounded-lg border bg-card">
                    <span className="text-xs text-muted-foreground">Active Transit</span>
                    <Badge variant="success" className="w-fit gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      In-Motion (72 km/h)
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2 p-3 rounded-lg border bg-card">
                    <span className="text-xs text-muted-foreground">Engine On / Stationary</span>
                    <Badge variant="warning" className="w-fit gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Idling (14 mins)
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2 p-3 rounded-lg border bg-card">
                    <span className="text-xs text-muted-foreground">Unscheduled Stop</span>
                    <Badge variant="destructive" className="w-fit gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Delayed / Exception
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2 p-3 rounded-lg border bg-card">
                    <span className="text-xs text-muted-foreground">Delivered with e-POD</span>
                    <Badge variant="info" className="w-fit gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      Delivered (Verified)
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Vehicle Markers Preview */}
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold">Map Marker Prototypes & Heading Rotations</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 flex items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 border-2 border-emerald-500 text-emerald-600 shadow-md">
                  <Truck className="h-7 w-7 transform rotate-45 transition-transform" />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 text-[9px] text-white font-bold">
                    ✓
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Heavy Truck (FLT-104)</h4>
                  <p className="text-xs text-muted-foreground">Heading: 45° NE • 68 km/h</p>
                  <span className="text-[11px] font-mono text-emerald-500 font-semibold">Online & Moving</span>
                </div>
              </Card>

              <Card className="p-4 flex items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 border-2 border-amber-500 text-amber-600 shadow-md">
                  <Package className="h-7 w-7 transform rotate-180 transition-transform" />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] text-white font-bold">
                    !
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Cargo Van (VN-208)</h4>
                  <p className="text-xs text-muted-foreground">Heading: 180° S • 0 km/h</p>
                  <span className="text-[11px] font-mono text-amber-500 font-semibold">Idling at Customer</span>
                </div>
              </Card>

              <Card className="p-4 flex items-center gap-4">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-destructive/10 border-2 border-destructive text-destructive shadow-md">
                  <MapPin className="h-7 w-7" />
                  <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] text-white font-bold">
                    ✕
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Depot Geofence Pin</h4>
                  <p className="text-xs text-muted-foreground">Radius: 800m Perimeter</p>
                  <span className="text-[11px] font-mono text-destructive font-semibold">Restricted Gate Sector</span>
                </div>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* 4. ASYNC STATES */}
        <TabsContent value="states" className="space-y-8">
          <div className="space-y-4">
            <h2 className="font-heading text-xl font-semibold">Loading Skeletons (Pre-Launch Checklist Item 19)</h2>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Async Content Placeholder Skeleton</CardTitle>
                <CardDescription>Prevents layout shifts while telemetry and shipment data are streaming.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <div className="space-y-2 pt-2">
                  <Skeleton className="h-20 w-full rounded-xl" />
                  <div className="grid grid-cols-3 gap-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
