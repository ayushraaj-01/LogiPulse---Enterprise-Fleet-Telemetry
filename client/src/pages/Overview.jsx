import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  Package,
  CheckCircle2,
  TrendingUp,
  MapPin,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  ArrowRight,
  Shield,
  Activity,
} from "lucide-react";
import API from "../services/api";
import { StatusBadge } from "../components/StatusBadge";
import { useLanguage } from "../context/LanguageContext";

export const Overview = () => {
  const { t, language } = useLanguage();
  const [analytics, setAnalytics] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [anaRes, shipRes, vehRes] = await Promise.all([
          API.get("/analytics/overview"),
          API.get("/shipments"),
          API.get("/vehicles"),
        ]);
        setAnalytics(anaRes.data.data);
        setShipments(shipRes.data.data || []);
        setVehicles(vehRes.data.data || []);
      } catch (err) {
        console.error("Error fetching overview data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Kaggle DataCo Supply Chain Dataset Active</span>
            </span>
            <span className="text-xs text-muted-foreground font-mono">10 Live Corridors</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
            {t("fleetCommandCenter")}
          </h1>
          <p className="text-xs text-muted-foreground">
            {t("fleetCommandDesc")}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/dispatch-board"
            className="btn-devfest flex items-center gap-2 px-4 py-2 text-xs shadow-md cursor-pointer"
          >
            <Package className="h-3.5 w-3.5 stroke-[2.5]" />
            <span>{t("dispatchBoard")}</span>
          </Link>
          <Link
            to="/shipments"
            className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-input bg-card hover:bg-muted hover:border-primary/50 hover:scale-[1.02] active:scale-[0.98] text-xs font-semibold transition-all"
          >
            <Truck className="h-3.5 w-3.5" />
            <span>{t("navShipments")}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid with DevFest Telemetry Color Accents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 - Google Blue Active Fleet */}
        <div className="hover-lift p-4 rounded-2xl border border-border border-l-4 border-l-[#4285F4] bg-card shadow-xs group cursor-default">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span className="uppercase tracking-wider font-semibold">{t("kpiActiveVehicles")}</span>
            <div className="p-2 rounded-xl bg-[#4285F4]/10 text-[#4285F4] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-200">
              <Truck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-foreground">
            {analytics?.activeVehicles || 3} / {analytics?.totalVehicles || 4}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#34A853] mt-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span className="font-semibold">{analytics?.utilizationRate || 85.7}%</span>
            <span className="text-muted-foreground">fleet utilization</span>
          </div>
        </div>

        {/* KPI 2 - Golden Yellow Live Deliveries */}
        <div className="hover-lift p-4 rounded-2xl border border-border border-l-4 border-l-[#FBBC04] bg-card shadow-xs group cursor-default">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span className="uppercase tracking-wider font-semibold">{t("kpiLiveDeliveries")}</span>
            <div className="p-2 rounded-xl bg-[#FBBC04]/15 text-[#D97706] dark:text-[#FBBC04] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-200">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-foreground">
            {analytics?.inTransitShipments || 2} Active
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#34A853] mt-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span className="font-semibold">+14%</span>
            <span className="text-muted-foreground">vs previous 24h</span>
          </div>
        </div>

        {/* KPI 3 - Google Emerald OTIF Fulfillment */}
        <div className="hover-lift p-4 rounded-2xl border border-border border-l-4 border-l-[#34A853] bg-card shadow-xs group cursor-default">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span className="uppercase tracking-wider font-semibold">{t("kpiOtifRate")}</span>
            <div className="p-2 rounded-xl bg-[#34A853]/10 text-[#34A853] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-200">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-foreground">
            {analytics?.otifRate || 98.4}%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#34A853] mt-1">
            <span className="font-semibold">Target: &gt;98%</span>
            <span className="text-muted-foreground">SLA fulfilled</span>
          </div>
        </div>

        {/* KPI 4 - Google Red Financial Throughput */}
        <div className="hover-lift p-4 rounded-2xl border border-border border-l-4 border-l-[#EA4335] bg-card shadow-xs group cursor-default">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span className="uppercase tracking-wider font-semibold">{t("kpiBilledRevenue")}</span>
            <div className="p-2 rounded-xl bg-[#EA4335]/10 text-[#EA4335] group-hover:scale-110 group-hover:rotate-6 transition-transform duration-200">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono mt-2 text-foreground">
            ${analytics?.totalRevenueUSD ? analytics.totalRevenueUSD.toLocaleString() : "48,250"}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <span className="font-semibold text-foreground">$1.42/km</span>
            <span>average cost</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Active Deliveries & Quick Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Priority Shipments List */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h2 className="font-heading text-base font-bold text-foreground">
                {t("highPriorityShipments")}
              </h2>
              <p className="text-xs text-muted-foreground">
                {t("highPriorityDesc")}
              </p>
            </div>
            <Link to="/shipments" className="text-xs font-semibold text-primary hover:underline">
              {t("viewAll")} ({shipments.length}) &rarr;
            </Link>
          </div>

          <div className="divide-y divide-border/60">
            {shipments.slice(0, 4).map((s) => (
              <div
                key={s._id}
                className="py-3 px-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl hover:bg-muted/40 hover:translate-x-1.5 transition-all duration-200 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                        {s.trackingNumber}
                      </span>
                      <StatusBadge status={s.status} />
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground uppercase">
                        {s.priority}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-md">
                      {s.origin?.name} &rarr; {s.destination?.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                  <div className="text-right">
                    <div className="font-mono font-semibold text-foreground">
                      {s.estimatedDurationMinutes || 40} mins est.
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Driver: {s.assignedDriver?.name || "Unassigned"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Quick Dispatch Actions & Compliance Alerts */}
        <div className="space-y-6">
          {/* Quick Action Shortcuts */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3 hover-lift">
            <h2 className="font-heading text-sm font-bold text-foreground">{t("quickActions")}</h2>
            <div className="space-y-2">
              <Link
                to="/shipments"
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 hover:translate-x-1 text-xs font-medium transition-all group"
              >
                <span className="group-hover:text-primary transition-colors">{t("createShipment")}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                to="/routes"
                className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 hover:translate-x-1 text-xs font-medium transition-all group"
              >
                <span className="group-hover:text-primary transition-colors">{t("runRouteOptimizer")}</span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                to="/driver-portal"
                className="w-full flex items-center justify-between p-2.5 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 hover:translate-x-1 text-accent-foreground text-xs font-medium transition-all group"
              >
                <span>{t("openDriverPwa")}</span>
                <ArrowRight className="h-3.5 w-3.5 text-accent group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Compliance & Regulatory Alerts */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-sm font-bold text-foreground">{t("complianceWatchlist")}</h2>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                2 Items
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/5 space-y-1">
                <div className="font-semibold text-primary flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {t("driverMedicalCertExpiring")}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Marcus Ray DOT medical certification renewal due within 14 days.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-border bg-card space-y-1">
                <div className="font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {t("vehiclePermitAlert")}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  WA-VAN-208 periodic commercial road permit expiring in October.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
