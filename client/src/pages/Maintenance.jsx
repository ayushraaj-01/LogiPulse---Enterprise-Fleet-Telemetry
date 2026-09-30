import React, { useState, useEffect } from "react";
import { Wrench, Plus, Calendar, DollarSign, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import API from "../services/api";
import { StatusBadge } from "../components/StatusBadge";

export const Maintenance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenance = async () => {
      try {
        const res = await API.get("/maintenance");
        setRecords(res.data.data || []);
      } catch (err) {
        console.error("Error loading maintenance", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMaintenance();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Maintenance & Service Records
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Preventative maintenance intervals, work orders, service histories, and downtime tracking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {records.map((r) => (
          <div key={r._id} className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono font-bold text-xs text-primary">{r.vehicle?.licensePlate || "Fleet Asset"}</span>
              <StatusBadge status={r.status} />
            </div>

            <div>
              <h3 className="font-heading font-bold text-sm text-foreground">{r.title}</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{r.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
              <div>
                <span className="text-muted-foreground text-[11px]">Service Date:</span>
                <div className="font-medium text-foreground">{new Date(r.serviceDate).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-muted-foreground text-[11px]">Total Cost:</span>
                <div className="font-mono font-bold text-emerald-400">${r.costUSD.toFixed(2)}</div>
              </div>
            </div>

            <div className="text-[11px] text-muted-foreground pt-1 flex items-center justify-between">
              <span>Technician: {r.technicianName}</span>
              <span className="font-mono">Odometer: {r.odometerKm.toLocaleString()} km</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
