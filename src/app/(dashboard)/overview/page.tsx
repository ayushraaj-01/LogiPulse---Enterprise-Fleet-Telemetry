"use client";

import * as React from "react";
import Link from "next/link";
import {
  Truck,
  Package,
  Clock,
  TrendingUp,
  MapPin,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
  Plus,
  Compass,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function OverviewPage() {
  return (
    <div className="space-y-8">
      {/* Top Banner / Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10 font-mono text-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
              SYSTEM OPERATIONAL
            </Badge>
            <span className="text-xs text-muted-foreground">Depot Central • Hub #1</span>
          </div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground mt-1">
            Fleet Command Overview
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Real-time telemetry, active delivery pipelines, and asset readiness status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/shipments">
            <Button variant="outline" size="sm">
              <Package className="mr-2 h-4 w-4" />
              Manage Shipments
            </Button>
          </Link>
          <Link href="/map">
            <Button variant="default" size="sm" className="shadow-md shadow-primary/20">
              <MapPin className="mr-2 h-4 w-4" />
              Open Live Map
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Active Vehicles
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Truck className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">24 / 28</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 mt-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span className="font-semibold">85.7%</span>
              <span className="text-muted-foreground">fleet utilization</span>
            </div>
            <div className="mt-3">
              <Progress value={85.7} />
            </div>
          </CardContent>
        </Card>

        {/* KPI 2 */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              In-Transit Shipments
            </CardTitle>
            <div className="p-2 rounded-lg bg-accent/10 text-accent">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">142</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 mt-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span className="font-semibold">+12%</span>
              <span className="text-muted-foreground">vs. yesterday</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>98 Scheduled</span>
              <span>44 Express</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3 */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              On-Time In-Full (OTIF)
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">98.4%</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 mt-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span className="font-semibold">+0.6%</span>
              <span className="text-muted-foreground">above 98% SLA target</span>
            </div>
            <div className="mt-3">
              <Progress value={98.4} indicatorClassName="bg-emerald-500" />
            </div>
          </CardContent>
        </Card>

        {/* KPI 4 */}
        <Card className="hover:border-primary/40 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Average Cost per Km
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">$1.42</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-500 mt-1">
              <ArrowDownRight className="h-3.5 w-3.5" />
              <span className="font-semibold">-4.1%</span>
              <span className="text-muted-foreground">cost efficiency gain</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>Fuel: $0.62/km</span>
              <span>Labor: $0.58/km</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Active Deliveries & Quick Dispatch Feeds */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Telemetry Watchlist */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg font-heading">High-Priority Live Shipments</CardTitle>
              <CardDescription>Real-time transit updates with dynamic ETA countdowns.</CardDescription>
            </div>
            <Link href="/shipments">
              <Button variant="ghost" size="sm" className="text-xs text-primary">
                View All Shipments &rarr;
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border/60">
              {/* Row 1 */}
              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold font-mono text-sm text-foreground">
                        TRK-2026-98124
                      </span>
                      <Badge variant="success" className="text-[10px]">
                        Moving (74 km/h)
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Seattle Harbor Bay &rarr; Redmond Distribution Ctr
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                  <div className="text-right">
                    <div className="font-semibold text-foreground font-mono">18 mins remaining</div>
                    <div className="text-[11px] text-muted-foreground">Driver: Marcus Ray</div>
                  </div>
                  <Link href="/map">
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      Track Live
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Row 2 */}
              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-warning/10 text-warning shrink-0">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold font-mono text-sm text-foreground">
                        TRK-2026-98119
                      </span>
                      <Badge variant="warning" className="text-[10px]">
                        Idling (Dock #4)
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Bellevue Depot &rarr; Kirkland Medical Hub
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                  <div className="text-right">
                    <div className="font-semibold text-foreground font-mono">Unloading Cargo</div>
                    <div className="text-[11px] text-muted-foreground">Driver: Elena Rostova</div>
                  </div>
                  <Link href="/map">
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      Track Live
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Row 3 */}
              <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold font-mono text-sm text-foreground">
                        TRK-2026-98092
                      </span>
                      <Badge variant="destructive" className="text-[10px]">
                        Traffic Congestion
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tacoma Port &rarr; Olympia Cold Storage
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 text-xs">
                  <div className="text-right">
                    <div className="font-semibold text-destructive font-mono">+25 min Delay</div>
                    <div className="text-[11px] text-muted-foreground">Driver: David K.</div>
                  </div>
                  <Link href="/routes">
                    <Button variant="outline" size="sm" className="h-8 text-xs">
                      Re-Route
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Col: Quick Dispatch & Maintenance Reminders */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-heading">Quick Actions</CardTitle>
              <CardDescription>Rapid workflow shortcuts for dispatchers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <Link href="/design-system" className="block">
                <Button variant="outline" className="w-full justify-between text-xs h-9">
                  <span>Explore Design System & Tokens</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </Link>
              <Link href="/shipments/board" className="block">
                <Button variant="outline" className="w-full justify-between text-xs h-9">
                  <span>Kanban Dispatch Board</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </Link>
              <Link href="/routes" className="block">
                <Button variant="outline" className="w-full justify-between text-xs h-9">
                  <span>Run Multi-Stop Route Optimizer</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </Link>
              <Link href="/driver/shift" className="block">
                <Button variant="secondary" className="w-full justify-between text-xs h-9">
                  <span>Switch to Mobile Driver PWA</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-heading">Compliance & Alerts</CardTitle>
                <Badge variant="warning" className="text-[10px]">2 Actions</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 space-y-1">
                <div className="font-semibold text-amber-500 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  CDL Expiry in 14 Days
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Driver Elena Rostova requires license renewal verification before Oct 15.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-border bg-card space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Mandatory Shift Rest
                </div>
                <p className="text-muted-foreground text-[11px]">
                  Driver Marcus Ray reaches 8 hours driving threshold in 45 minutes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
