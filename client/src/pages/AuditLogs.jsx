import React, { useState, useEffect } from "react";
import { ShieldCheck, Search, Clock, User, Globe } from "lucide-react";
import API from "../services/api";

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/audit-logs")
      .then((res) => setLogs(res.data.data || []))
      .catch((err) => console.error("Error loading audit logs", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Immutable System Audit Trail
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tamper-evident regulatory audit log capturing all dispatch assignments, rate modifications, and user logins.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono text-[11px]">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-bold text-foreground">{log.userName}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-muted text-primary uppercase">
                      {log.userRole}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-emerald-400 font-bold">{log.action}</td>
                  <td className="py-3 px-4 text-muted-foreground">{log.entity}</td>
                  <td className="py-3 px-4 text-foreground font-sans max-w-sm truncate">{log.details}</td>
                  <td className="py-3 px-4 text-muted-foreground">{log.ipAddress}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
