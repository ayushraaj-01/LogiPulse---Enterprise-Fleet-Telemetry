import React, { useState, useEffect } from "react";
import { Users, Shield, Clock, Award, Phone, Calendar, AlertCircle } from "lucide-react";
import API from "../services/api";
import { StatusBadge } from "../components/StatusBadge";

export const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await API.get("/drivers");
        setDrivers(res.data.data || []);
      } catch (err) {
        console.error("Error loading drivers", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrivers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          Driver Roster & Safety Scorecards
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Commercial driver certifications, shift hours of service (HOS), and driver safety ratings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map((d) => (
          <div key={d._id} className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={d.user?.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"}
                alt={d.user?.name}
                className="h-12 w-12 rounded-xl object-cover border border-primary/20"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-sm text-foreground truncate">{d.user?.name}</h3>
                  <StatusBadge status={d.status} />
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">{d.licenseNumber}</div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-muted/40 text-center">
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Safety</div>
                <div className="font-mono font-bold text-emerald-400 text-sm">{d.safetyScore}%</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold">On-Time</div>
                <div className="font-mono font-bold text-primary text-sm">{d.onTimeRatePercent}%</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase font-bold">Trips</div>
                <div className="font-mono font-bold text-foreground text-sm">{d.totalTrips}</div>
              </div>
            </div>

            {/* Hours of Service */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  Hours Driven Today:
                </span>
                <span className="font-mono font-semibold text-foreground">
                  {d.hoursWorkedToday}h / {d.maxDailyHours}h
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${(d.hoursWorkedToday / d.maxDailyHours) * 100}%` }}
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="text-[11px] text-muted-foreground pt-2 border-t border-border flex items-center justify-between">
              <span>Emergency: {d.emergencyContact?.name}</span>
              <span className="font-mono text-primary">{d.emergencyContact?.phone}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
