import React, { useState, useEffect } from "react";
import {
  KanbanSquare,
  Package,
  Truck,
  ArrowRight,
  Clock,
  User,
  Plus,
  RefreshCw,
  CheckCircle2,
  AlertOctagon,
  RotateCcw,
} from "lucide-react";
import API from "../services/api";
import { StatusBadge } from "../components/StatusBadge";

export const DispatchBoard = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchShipments = async () => {
    try {
      const res = await API.get("/shipments");
      setShipments(res.data.data || []);
    } catch (err) {
      console.error("Error loading board shipments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const moveStatus = async (shipmentId, nextStatus, note) => {
    try {
      await API.patch(`/shipments/${shipmentId}/status`, {
        status: nextStatus,
        note: note || `Status advanced to ${nextStatus}`,
      });
      fetchShipments();
    } catch (err) {
      alert("Failed to advance shipment status: " + err.message);
    }
  };

  const columns = [
    { title: "Unassigned Queue", status: "UNASSIGNED", next: "DISPATCHED", color: "border-amber-500/30 bg-amber-500/5" },
    { title: "Dispatched", status: "DISPATCHED", next: "AT_PICKUP", color: "border-blue-500/30 bg-blue-500/5" },
    { title: "At Loading Dock", status: "AT_PICKUP", next: "IN_TRANSIT", color: "border-indigo-500/30 bg-indigo-500/5" },
    { title: "In-Transit Active", status: "IN_TRANSIT", next: "DELIVERED", color: "border-emerald-500/30 bg-emerald-500/5" },
    { title: "Completed / Delivered", status: "DELIVERED", next: null, color: "border-sky-500/30 bg-sky-500/5" },
    { title: "Exceptions / Not Delivered", status: "NOT_DELIVERED", next: "DISPATCHED", retryText: "Re-attempt Delivery", color: "border-rose-500/30 bg-rose-500/5" },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <KanbanSquare className="h-6 w-6 text-primary" />
            Interactive Dispatch Board
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Stage, assign, and advance freight deliveries through the real-time operational pipeline (Delivered & Exception Queues).
          </p>
        </div>

        <button
          onClick={fetchShipments}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-semibold cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Kanban Columns Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
        {columns.map((col) => {
          const colItems = shipments.filter((s) => s.status === col.status);

          return (
            <div
              key={col.status}
              className={`rounded-2xl border p-3.5 flex flex-col min-w-[250px] ${col.color}`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-border/80 mb-3">
                <span className="font-heading font-bold text-xs uppercase tracking-wider text-foreground">
                  {col.title}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-background border border-border">
                  {colItems.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {colItems.length === 0 ? (
                  <div className="h-28 rounded-xl border border-dashed border-border/60 flex items-center justify-center text-xs text-muted-foreground text-center p-2">
                    No orders in stage
                  </div>
                ) : (
                  colItems.map((s) => (
                    <div
                      key={s._id}
                      className="p-3.5 rounded-xl border border-border bg-card shadow-xs hover:border-primary/50 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-primary">{s.trackingNumber}</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-muted text-muted-foreground uppercase">
                          {s.priority}
                        </span>
                      </div>

                      <div className="text-xs">
                        <div className="font-semibold text-foreground truncate">{s.origin?.name}</div>
                        <div className="text-[11px] text-muted-foreground truncate">
                          &rarr; {s.destination?.name}
                        </div>
                      </div>

                      {/* If Not Delivered, display failure reason */}
                      {s.status === "NOT_DELIVERED" && s.failureReason && (
                        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] space-y-0.5">
                          <div className="font-bold flex items-center gap-1">
                            <AlertOctagon className="h-3 w-3" />
                            <span>{s.failureReason}</span>
                          </div>
                          {s.driverNotes && <div className="text-muted-foreground truncate">{s.driverNotes}</div>}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/50">
                        <span className="font-mono">{s.weightKg?.toLocaleString()} kg</span>
                        <span className="truncate max-w-[100px]">{s.assignedDriver?.name || "Unassigned"}</span>
                      </div>

                      {/* Advance or Retry Button */}
                      {col.status === "NOT_DELIVERED" ? (
                        <button
                          onClick={() => moveStatus(s._id, "DISPATCHED", "Re-dispatched after delivery exception")}
                          className="w-full h-8 mt-1 rounded-lg bg-primary text-primary-foreground font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          <span>Re-attempt Order</span>
                        </button>
                      ) : col.next ? (
                        <button
                          onClick={() => moveStatus(s._id, col.next)}
                          className="w-full h-8 mt-1 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                        >
                          <span>Move to {col.next.replace("_", " ")}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      ) : null}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
