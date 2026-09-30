import React, { useState, useEffect } from "react";
import { Fuel, TrendingUp, DollarSign, Calendar, MapPin, Gauge } from "lucide-react";
import API from "../services/api";

export const FuelExpenses = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFuel = async () => {
      try {
        const res = await API.get("/fuel");
        setLogs(res.data.data || []);
      } catch (err) {
        console.error("Error loading fuel logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFuel();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Fuel className="h-6 w-6 text-amber-500" />
          Fuel & Fleet Expense Monitoring
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Real-time pump volume logs, station locations, and automated cost per kilometer ($/km) telemetry.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="text-xs text-muted-foreground uppercase font-bold">Average Fleet Economy</div>
          <div className="text-2xl font-bold font-mono text-primary mt-1">3.8 km/L</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Diesel Heavy Fleet</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="text-xs text-muted-foreground uppercase font-bold">Average Cost per Km</div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">$0.62 / km</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Below target threshold ($0.65)</div>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <div className="text-xs text-muted-foreground uppercase font-bold">Total Fuel Volume Logged</div>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1">355 Liters</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">Recent 24-hour cycle</div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Station</th>
                <th className="py-3 px-4">Volume</th>
                <th className="py-3 px-4">Total Cost</th>
                <th className="py-3 px-4">Cost / Km</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {logs.map((l) => (
                <tr key={l._id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono text-muted-foreground">
                    {new Date(l.fueledAt).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                    {l.vehicle?.licensePlate || "Fleet Asset"}
                  </td>
                  <td className="py-3.5 px-4 text-foreground font-medium">
                    {l.driver?.name || "Driver"}
                  </td>
                  <td className="py-3.5 px-4 text-muted-foreground">{l.stationName}</td>
                  <td className="py-3.5 px-4 font-mono">{l.volumeLiters} L</td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    ${l.costUSD.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-primary font-semibold">
                    ${l.costPerKm} / km
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
