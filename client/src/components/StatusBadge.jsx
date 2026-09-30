import React from "react";

export const StatusBadge = ({ status }) => {
  const getStyle = () => {
    switch (status?.toUpperCase()) {
      case "IN_TRANSIT":
      case "MOVING":
      case "DRIVING":
      case "ACTIVE":
      case "PAID":
        return "bg-emerald-500/15 text-emerald-500 border-emerald-500/30";
      case "DELIVERED":
      case "COMPLETED":
        return "bg-sky-500/15 text-sky-400 border-sky-500/30";
      case "DISPATCHED":
      case "AT_PICKUP":
      case "ON_DUTY":
      case "ISSUED":
      case "EXPRESS":
        return "bg-indigo-500/15 text-indigo-400 border-indigo-500/30";
      case "IDLE":
      case "RESTING":
      case "UNASSIGNED":
      case "SCHEDULED":
      case "STANDARD":
        return "bg-amber-500/15 text-amber-500 border-amber-500/30";
      case "MAINTENANCE":
      case "OUT_OF_SERVICE":
      case "CRITICAL":
      case "FAILED":
      case "NOT_DELIVERED":
      case "REJECTED":
      case "OVERDUE":
        return "bg-rose-500/15 text-rose-500 border-rose-500/30";
      default:
        return "bg-slate-500/15 text-slate-400 border-slate-500/30";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStyle()}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status ? status.replace("_", " ") : "UNKNOWN"}
    </span>
  );
};
