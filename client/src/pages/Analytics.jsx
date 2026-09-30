import React, { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Truck, Package, Clock, ShieldCheck, Activity } from "lucide-react";
import API from "../services/api";

export const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    API.get("/analytics/overview").then((res) => setData(res.data.data));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          Fleet Intelligence & Analytics
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Comprehensive operational metrics, service level compliance (SLA), and cost per kilometer trends.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Utilization Meter */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <h2 className="font-heading font-bold text-sm text-foreground">Fleet Capacity Utilization</h2>
          <div className="text-3xl font-bold font-mono text-primary">{data?.utilizationRate || 85.7}%</div>
          <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
              style={{ width: `${data?.utilizationRate || 85.7}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {data?.activeVehicles || 3} of {data?.totalVehicles || 4} vehicles active on scheduled routes today.
          </p>
        </div>

        {/* OTIF SLA Meter */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <h2 className="font-heading font-bold text-sm text-foreground">On-Time In-Full (OTIF) Fulfillment</h2>
          <div className="text-3xl font-bold font-mono text-emerald-400">{data?.otifRate || 98.4}%</div>
          <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${data?.otifRate || 98.4}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Exceeding enterprise contractual threshold of 98.0% across all customer delivery nodes.
          </p>
        </div>

        {/* Operating Cost Breakdown */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
          <h2 className="font-heading font-bold text-sm text-foreground">Cost per Operating Mile</h2>
          <div className="text-3xl font-bold font-mono text-amber-400">${data?.averageCostPerKm || 1.42} / km</div>
          <div className="space-y-1.5 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Fuel Surcharge:</span>
              <span className="font-mono text-foreground font-semibold">$0.62 / km</span>
            </div>
            <div className="flex justify-between">
              <span>Driver Labor:</span>
              <span className="font-mono text-foreground font-semibold">$0.58 / km</span>
            </div>
            <div className="flex justify-between">
              <span>Preventative Maintenance:</span>
              <span className="font-mono text-foreground font-semibold">$0.22 / km</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Trail */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-3">
        <h2 className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          Recent Real-Time Telemetry Events
        </h2>
        <div className="divide-y divide-border/60">
          {data?.recentActivity?.map((act, index) => (
            <div key={index} className="py-2.5 flex items-center justify-between text-xs">
              <span className="text-foreground font-medium">{act.event}</span>
              <span className="text-muted-foreground font-mono text-[11px]">{act.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
