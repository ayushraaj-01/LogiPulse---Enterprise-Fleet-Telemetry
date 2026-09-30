import React, { useState, useEffect } from "react";
import { Receipt, DollarSign, Download, CheckCircle2, AlertCircle, Plus } from "lucide-react";
import API from "../services/api";
import { StatusBadge } from "../components/StatusBadge";

export const Billing = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      const res = await API.get("/billing/invoices");
      setInvoices(res.data.data || []);
    } catch (err) {
      console.error("Error loading invoices", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleMarkPaid = async (id) => {
    try {
      await API.patch(`/billing/invoices/${id}/pay`);
      fetchInvoices();
    } catch (err) {
      alert("Error updating payment: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary" />
            Invoicing & Financial Settlements
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Commercial rate cards, automated bill generation upon e-POD completion, and payment status tracking.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {invoices.map((inv) => (
                <tr key={inv._id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-foreground">{inv.customer?.name}</div>
                    <div className="text-[11px] text-muted-foreground">{inv.customer?.company}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="py-3.5 px-4 font-mono text-muted-foreground">
                    {new Date(inv.issueDate).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-muted-foreground">
                    {new Date(inv.dueDate).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    ${inv.totalAmountUSD?.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    {inv.status !== "PAID" && (
                      <button
                        onClick={() => handleMarkPaid(inv._id)}
                        className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 font-semibold"
                      >
                        Mark Paid
                      </button>
                    )}
                    <button
                      onClick={() => alert(`Downloading signed PDF invoice ${inv.invoiceNumber}...`)}
                      className="px-2.5 py-1 rounded-md border border-input hover:bg-muted font-semibold"
                    >
                      PDF
                    </button>
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
