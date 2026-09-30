import React, { useState } from "react";
import {
  LifeBuoy,
  Phone,
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock,
  Shield,
  Send,
  FileText,
  ChevronDown,
} from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

const FAQS = [
  {
    q: "How does the 4-digit Delivery OTP work?",
    a: "Every shipment is assigned a unique 4-digit security code displayed on your tracking dashboard. When the driver arrives with your cargo, verify that your packages and seals are intact, then share the OTP with the driver to confirm delivery.",
  },
  {
    q: "What does the Helper Option include?",
    a: "If you select '+1 Helper' or '+2 Helpers' during freight booking, certified warehouse laborers will accompany the driver to assist with loading goods from your facility and unloading them at the destination door/dock.",
  },
  {
    q: "What should I do if my shipment is marked 'Not Delivered'?",
    a: "If a delivery attempt fails (e.g. consignee was unreachable or gate was locked), your cargo is safely returned to the regional dispatch depot. You can request a free re-attempt directly from your tracking screen or through support.",
  },
  {
    q: "How do I download my invoice and proof of delivery?",
    a: "Go to 'Invoices & Receipts' from your portal sidebar to view all finalized freight charges and download official tax receipts with verified digital receiver signatures.",
  },
];

export const CustomerSupport = () => {
  const { t, faqs } = useLanguage();
  const [ticketSubject, setTicketSubject] = useState("Delivery Delayed / Driver Not Moving");
  const [trackingId, setTrackingId] = useState("TRK-2026-98124");
  const [description, setDescription] = useState("");
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [openFaq, setOpenFaq] = useState(0);

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    const ticketId = "TKT-" + Math.floor(100000 + Math.random() * 900000);
    setSubmittedTicket({
      id: ticketId,
      subject: ticketSubject,
      trackingId,
      status: "OPEN / ASSIGNED TO DISPATCH LEAD",
      createdAt: new Date(),
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            24/7 CUSTOMER ADVOCACY & CLAIMS
          </span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1 flex items-center gap-2">
          <LifeBuoy className="h-7 w-7 text-primary" />
          {t("supportTitle")}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("supportSubtitle")}
        </p>
      </div>

      {/* 24/7 Quick Contact Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="hover-lift p-4 rounded-2xl border border-border bg-card flex items-center gap-3 shadow-xs hover:border-emerald-500/40">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Phone className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold">{t("supportHelpline")}</span>
            <div className="font-mono font-bold text-foreground text-sm">1-800-564-4785</div>
            <div className="text-[10px] text-emerald-400">{t("supportHelplineAvail")}</div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent("open-customer-chatbot"))}
          className="hover-lift p-4 rounded-2xl border border-primary/30 bg-primary/5 hover:bg-primary/10 flex items-center gap-3 shadow-xs text-left transition-all group cursor-pointer hover:border-primary/60"
        >
          <div className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-primary uppercase font-bold">{t("supportAiDispatcher")}</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
              <span>{t("supportChatPulseBot")}</span>
              <span className="text-xs">&rarr;</span>
            </div>
            <div className="text-[10px] text-muted-foreground">{t("supportInstantEta")}</div>
          </div>
        </button>

        <div className="hover-lift p-4 rounded-2xl border border-border bg-card flex items-center gap-3 shadow-xs hover:border-amber-500/40">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold">{t("supportCargoGuarantee")}</span>
            <div className="font-bold text-foreground text-sm">{t("supportTransitCoverage")}</div>
            <div className="text-[10px] text-amber-400">{t("supportInsuredFreight")}</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Raise Ticket + FAQs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Raise an Issue / Ticket Form */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h2 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {t("supportRaiseTicket")}
            </h2>
            <span className="text-[10px] text-muted-foreground font-mono">{t("supportFastEscalation")}</span>
          </div>

          {submittedTicket ? (
            <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs space-y-3">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5" />
                <span>Support Ticket Created!</span>
              </div>
              <div className="space-y-1 font-mono text-[11px] text-foreground">
                <div>Ticket ID: <b>{submittedTicket.id}</b></div>
                <div>Regarding: {submittedTicket.trackingId}</div>
                <div>Status: <span className="text-emerald-400">{submittedTicket.status}</span></div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Our Pacific Northwest dispatch supervisor has been paged. A representative will contact you via phone within 15 minutes.
              </p>
              <button
                onClick={() => setSubmittedTicket(null)}
                className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs font-semibold hover:bg-muted"
              >
                Submit Another Request
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitTicket} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-foreground">{t("supportTicketCategory")}</label>
                <select
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="Delivery Delayed / Driver Not Moving">Delivery Delayed / Driver Not Moving</option>
                  <option value="Damaged Cargo / Tampered Container Seal">Damaged Cargo / Tampered Container Seal</option>
                  <option value="Incorrect Delivery Address / Change Request">Incorrect Delivery Address / Change Request</option>
                  <option value="Billing Dispute / Extra Surcharge Charged">Billing Dispute / Extra Surcharge Charged</option>
                  <option value="Driver Behavior / Unprofessional Conduct">Driver Behavior / Unprofessional Conduct</option>
                  <option value="Helper Labor Not Provided">Helper Labor Not Provided</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">{t("supportTrackingId")}</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TRK-2026-98124"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">{t("supportDescProblem")}</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Provide specific details so our dispatch supervisor can resolve it immediately..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="btn-devfest w-full h-11 text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 stroke-[2.5]" />
                <span>{t("supportBtnSubmit")}</span>
              </button>
            </form>
          )}
        </div>

        {/* FAQs Accordion */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h2 className="font-heading text-sm font-bold text-foreground flex items-center gap-2">
              <HelpCircle className="h-4 w-4 text-primary" />
              {t("supportFaqTitle")}
            </h2>
            <span className="text-[10px] text-muted-foreground font-mono">{t("supportKnowledgeBase")}</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {faqs.map((faq, idx) => (
              <div
                key={faq.id || idx}
                className="hover-lift rounded-xl border border-border bg-background p-3 cursor-pointer hover:border-primary/40 transition-all"
                onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
              >
                <div className="flex items-center justify-between font-semibold text-foreground">
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      openFaq === idx ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </div>
                {openFaq === idx && (
                  <p className="text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/60 leading-relaxed whitespace-pre-line">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
