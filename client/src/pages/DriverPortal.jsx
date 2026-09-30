import React, { useState, useRef, useEffect } from "react";
import {
  Truck,
  CheckCircle2,
  XCircle,
  Camera,
  PenTool,
  Clock,
  HeartPulse,
  Phone,
  AlertTriangle,
  ArrowRight,
  Shield,
  MapPin,
  Package,
  KeyRound,
  Users,
  Navigation,
  DollarSign,
  AlertOctagon,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import API from "../services/api";
import { StatusBadge } from "../components/StatusBadge";

export const DriverPortal = () => {
  const [dutyOnline, setDutyOnline] = useState(true);
  const [activeTab, setActiveTab] = useState("active_trip"); // "active_trip" | "earnings" | "safety"
  const [activeShipment, setActiveShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Delivery OTP Verification (Porter Style)
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Helper Option (Porter Style)
  const [helperCount, setHelperCount] = useState(1);

  // POD Form State
  const [recipientName, setRecipientName] = useState("");
  const [podSubmitted, setPodSubmitted] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const canvasRef = useRef(null);

  // Not Delivered / Exception Modal State (Porter Style)
  const [showNotDeliveredModal, setShowNotDeliveredModal] = useState(false);
  const [failureReason, setFailureReason] = useState("Consignee Unreachable");
  const [driverNotes, setDriverNotes] = useState("");
  const [submittingException, setSubmittingException] = useState(false);
  const [exceptionSubmitted, setExceptionSubmitted] = useState(false);

  // DOT Pre-Trip Checklist
  const [checklist, setChecklist] = useState({
    brakes: true,
    tires: true,
    lights: true,
    cargoStraps: true,
    engineOil: true,
  });

  const fetchActiveTrip = async () => {
    try {
      const res = await API.get("/shipments");
      const list = res.data.data || [];
      // Look for active in-transit or at-pickup order, or the first active one
      const target =
        list.find((s) => s.status === "IN_TRANSIT" || s.status === "AT_PICKUP" || s.status === "DISPATCHED") ||
        list[0];
      if (target) {
        setActiveShipment(target);
      }
    } catch (err) {
      console.error("Error loading active shipment:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTrip();
  }, []);

  // Update trip status: Arrived at Pickup, Loaded, In-Transit, etc.
  const updateTripStatus = async (newStatus, note) => {
    if (!activeShipment) return;
    try {
      const res = await API.patch(`/shipments/${activeShipment._id}/status`, {
        status: newStatus,
        note,
      });
      setActiveShipment(res.data.data);
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data?.message || err.message));
    }
  };

  // Verify Porter-style Delivery OTP
  const handleVerifyOtp = () => {
    const requiredOtp = activeShipment?.deliveryOtp || "4829";
    if (enteredOtp.trim() === requiredOtp) {
      setOtpVerified(true);
      setOtpError("");
    } else {
      setOtpError(`Invalid OTP entered. Expected consignee OTP is ${requiredOtp} for demo.`);
    }
  };

  // Submit Successful Delivery (e-POD)
  const handleCompleteDelivered = async () => {
    if (!recipientName) {
      alert("Please enter recipient name before completing delivery.");
      return;
    }
    try {
      const canvas = canvasRef.current;
      const signatureUrl = canvas ? canvas.toDataURL() : "";

      await API.post(`/shipments/${activeShipment._id}/pod`, {
        recipientName,
        signatureUrl,
        photoUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80",
        notes: `Porter-style delivery completed. OTP Verified. Helpers: ${helperCount}`,
      });

      setPodSubmitted(true);
      fetchActiveTrip();
    } catch (err) {
      alert("Error submitting POD: " + err.message);
    }
  };

  // Submit NOT DELIVERED Exception (Porter Style)
  const handleMarkNotDelivered = async () => {
    if (!activeShipment) return;
    setSubmittingException(true);
    try {
      await API.post(`/shipments/${activeShipment._id}/not-delivered`, {
        failureReason,
        driverNotes,
      });
      setShowNotDeliveredModal(false);
      setExceptionSubmitted(true);
      fetchActiveTrip();
    } catch (err) {
      alert("Error logging exception: " + err.message);
    } finally {
      setSubmittingException(false);
    }
  };

  // HTML5 Signature Canvas Drawing Helpers
  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#2563eb";
    ctx.lineCap = "round";
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto min-h-[50vh] flex flex-col items-center justify-center space-y-3 font-mono text-xs text-muted-foreground">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading Driver Operations Console...</span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-4 pb-16">
      {/* Porter-Style Driver Header with Duty Switcher */}
      <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 text-white shadow-xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/30">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <div className="font-heading font-extrabold text-sm flex items-center gap-1.5">
                Marcus Ray
                <span className="text-[10px] text-amber-400 font-mono font-bold">★ 4.92</span>
              </div>
              <div className="text-[10px] text-slate-300 font-mono">
                WA-FLT-104 &bull; Freightliner Cascadia
              </div>
            </div>
          </div>

          {/* Porter Online / Offline Duty Toggle */}
          <button
            onClick={() => setDutyOnline(!dutyOnline)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 transition-all shadow-md ${
              dutyOnline
                ? "bg-emerald-500 text-white shadow-emerald-500/25"
                : "bg-slate-700 text-slate-300"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                dutyOnline ? "bg-white animate-ping" : "bg-slate-400"
              }`}
            />
            <span>{dutyOnline ? "ONLINE" : "OFFLINE"}</span>
          </button>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="grid grid-cols-3 gap-1 bg-white/10 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab("active_trip")}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === "active_trip"
                ? "bg-primary text-primary-foreground font-black shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Active Trip
          </button>
          <button
            onClick={() => setActiveTab("safety")}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === "safety"
                ? "bg-primary text-primary-foreground font-black shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Inspection
          </button>
          <button
            onClick={() => setActiveTab("earnings")}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === "earnings"
                ? "bg-primary text-primary-foreground font-black shadow-sm"
                : "text-slate-300 hover:text-white"
            }`}
          >
            Earnings
          </button>
        </div>
      </div>

      {/* TAB 1: ACTIVE PORTER TRIP (Delivered vs Not Delivered Options) */}
      {activeTab === "active_trip" && (
        <div className="space-y-4">
          {activeShipment ? (
            <div className="rounded-2xl border border-primary/30 bg-card p-5 shadow-lg space-y-4">
              {/* Order Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div>
                  <span className="text-[10px] font-mono font-bold text-primary uppercase">
                    Porter Delivery Order
                  </span>
                  <h3 className="font-heading font-extrabold text-base text-foreground font-mono">
                    {activeShipment.trackingNumber}
                  </h3>
                </div>
                <StatusBadge status={activeShipment.status} />
              </div>

              {/* Porter Helper Requirement Selector */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary shrink-0" />
                  <div>
                    <span className="font-bold text-foreground">Labor Assistance (Helper)</span>
                    <div className="text-[10px] text-muted-foreground">Loading & Unloading Support</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {[0, 1, 2].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setHelperCount(cnt)}
                      className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                        helperCount === cnt
                          ? "bg-primary text-primary-foreground"
                          : "bg-background border border-border text-muted-foreground"
                      }`}
                    >
                      {cnt === 0 ? "Solo" : `+${cnt} Helper`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Route Summary: Origin & Destination */}
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-background border border-border">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase">Pickup Location</span>
                    <div className="font-bold text-foreground truncate">{activeShipment.origin?.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{activeShipment.origin?.address}</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-background border border-border">
                  <div className="h-6 w-6 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-rose-500 uppercase">Dropoff Destination</span>
                    <div className="font-bold text-foreground truncate">{activeShipment.destination?.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{activeShipment.destination?.address}</div>
                  </div>
                </div>
              </div>

              {/* Trip Progression Step Buttons (Porter Style Lifecycle) */}
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Trip Execution Progression:
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => updateTripStatus("AT_PICKUP", "Driver arrived at loading gate")}
                    className="p-2.5 rounded-xl border border-border bg-card hover:border-primary text-foreground font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>📍 At Pickup</span>
                  </button>

                  <button
                    onClick={() => updateTripStatus("IN_TRANSIT", "Goods loaded; departed pickup point")}
                    className="p-2.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>🚚 In Transit</span>
                  </button>
                </div>
              </div>

              {/* Porter Delivery OTP Verification Box */}
              {!otpVerified && activeShipment.status !== "DELIVERED" && activeShipment.status !== "NOT_DELIVERED" && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-500 flex items-center gap-1.5">
                      <KeyRound className="h-4 w-4" />
                      Consignee Delivery OTP Verification
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Demo OTP: <b>{activeShipment.deliveryOtp || "4829"}</b>
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Ask the customer at delivery for their 4-digit security code before handing over cargo.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={4}
                      placeholder="Enter 4-Digit OTP"
                      value={enteredOtp}
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      className="w-36 h-9 px-3 rounded-lg border border-input bg-background font-mono font-bold text-center tracking-widest text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                    <button
                      onClick={handleVerifyOtp}
                      className="flex-1 h-9 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors"
                    >
                      Verify OTP
                    </button>
                  </div>
                  {otpError && <div className="text-[10px] text-rose-500">{otpError}</div>}
                </div>
              )}

              {/* Porter Delivery Actions: DELIVERED vs NOT DELIVERED */}
              {activeShipment.status !== "DELIVERED" && activeShipment.status !== "NOT_DELIVERED" && (
                <div className="space-y-3 pt-3 border-t border-border">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Final Delivery Decision:
                  </div>

                  {/* Primary Success vs Not Delivered Action Buttons */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* OPTION 1: MARK AS NOT DELIVERED (The Porter Exception Feature) */}
                    <button
                      type="button"
                      onClick={() => setShowNotDeliveredModal(true)}
                      className="h-11 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Not Delivered</span>
                    </button>

                    {/* OPTION 2: PROCEED TO DELIVERED */}
                    <button
                      type="button"
                      onClick={() => {
                        if (!otpVerified) {
                          alert(`Please verify the delivery OTP first (Demo OTP: ${activeShipment.deliveryOtp || "4829"}).`);
                        }
                      }}
                      className={`h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                        otpVerified
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25"
                          : "bg-muted text-muted-foreground cursor-not-allowed opacity-75"
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{otpVerified ? "Complete POD" : "Verify OTP First"}</span>
                    </button>
                  </div>

                  {/* If OTP verified, show electronic signature and completion */}
                  {otpVerified && !podSubmitted && (
                    <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-3 text-xs animate-in fade-in">
                      <span className="font-bold text-foreground flex items-center gap-1.5 text-xs">
                        <PenTool className="h-4 w-4 text-emerald-500" />
                        Receiver Proof of Delivery (e-POD)
                      </span>

                      <div>
                        <label className="block text-muted-foreground mb-1 text-[11px]">
                          Receiver / Consignee Full Name
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Jonathan Miller"
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          className="w-full h-8 px-3 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                      </div>

                      {/* Touch Signature Pad */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-muted-foreground text-[11px]">Touch Signature Pad</span>
                          <button
                            onClick={clearSignature}
                            className="text-[10px] text-primary hover:underline font-semibold"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="rounded-xl border border-input bg-background p-1 overflow-hidden">
                          <canvas
                            ref={canvasRef}
                            width={320}
                            height={90}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            className="w-full h-24 touch-none bg-slate-900/60 rounded-lg cursor-crosshair"
                          />
                        </div>
                      </div>

                      {/* Photo Capture Simulation */}
                      <button
                        type="button"
                        onClick={() => setCameraActive(!cameraActive)}
                        className="w-full h-8 rounded-lg border border-border bg-card text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-muted"
                      >
                        <Camera className="h-3.5 w-3.5 text-primary" />
                        <span>{cameraActive ? "Photo Attached (1 File)" : "Attach Cargo Photo"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCompleteDelivered}
                        className="w-full h-10 mt-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Confirm & Mark Delivered</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Status Banner when Delivered */}
              {activeShipment.status === "DELIVERED" && (
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs text-center space-y-1">
                  <CheckCircle2 className="h-7 w-7 mx-auto" />
                  <div className="font-bold text-sm">Delivery Completed Successfully!</div>
                  <p className="text-[11px] text-muted-foreground">
                    e-POD verified and signed. Freight settlement credited to your driver wallet.
                  </p>
                </div>
              )}

              {/* Status Banner when NOT Delivered */}
              {activeShipment.status === "NOT_DELIVERED" && (
                <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <XCircle className="h-5 w-5 text-rose-500" />
                    <span>Consignment Marked Not Delivered</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    <b>Reason:</b> {activeShipment.failureReason || "Consignee unavailable"}.
                  </div>
                  <div className="p-2 rounded bg-black/30 font-mono text-[10px]">
                    Return to dispatch hub initiated. Fleet manager notified.
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-border bg-card text-center space-y-3">
              <Truck className="h-10 w-10 mx-auto text-muted-foreground" />
              <div className="font-heading font-bold text-foreground text-sm">No Active Trips Assigned</div>
              <p className="text-xs text-muted-foreground">
                You are currently {dutyOnline ? "Online and waiting for dispatch." : "Offline."}
              </p>
            </div>
          )}

          {/* Quick Call Customer & Dispatch Support */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <a
              href="tel:+15551002003"
              className="p-3 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Phone className="h-4 w-4 text-emerald-500" />
              <span>Call Consignee</span>
            </a>
            <a
              href="tel:+18005554357"
              className="p-3 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Shield className="h-4 w-4 text-primary" />
              <span>Call Dispatch HQ</span>
            </a>
          </div>
        </div>
      )}

      {/* TAB 2: SAFETY PRE-TRIP INSPECTION */}
      {activeTab === "safety" && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="font-heading font-bold text-xs uppercase text-foreground">
              DOT Pre-Trip Safety Inspection
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">100% COMPLIANT</span>
          </div>

          <div className="space-y-2 text-xs">
            {Object.keys(checklist).map((key) => (
              <label
                key={key}
                className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border cursor-pointer hover:border-primary/40 transition-colors"
              >
                <span className="capitalize font-semibold text-foreground">{key} System Inspection</span>
                <input
                  type="checkbox"
                  checked={checklist[key]}
                  onChange={() => setChecklist({ ...checklist, [key]: !checklist[key] })}
                  className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                />
              </label>
            ))}
          </div>

          <button
            onClick={() => alert("Inspection manifest submitted and logged to Washington State DOT records.")}
            className="w-full h-10 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
          >
            Submit Daily Vehicle Inspection Report (DVIR)
          </button>
        </div>
      )}

      {/* TAB 3: EARNINGS & TRIP SUMMARY */}
      {activeTab === "earnings" && (
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <span className="font-heading font-bold text-xs uppercase text-foreground">
              Driver Payout & Ledger
            </span>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">SETTLED DAILY</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Today's Payout</span>
              <div className="text-xl font-bold font-mono text-foreground mt-0.5">$342.50</div>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Trips Completed</span>
              <div className="text-xl font-bold font-mono text-primary mt-0.5">3 Trips</div>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Distance Driven</span>
              <div className="text-xl font-bold font-mono text-foreground mt-0.5">148.2 km</div>
            </div>
            <div className="p-3 rounded-xl bg-muted/40 border border-border">
              <span className="text-[10px] text-muted-foreground uppercase font-bold">Helper Bonus</span>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">+$50.00</div>
            </div>
          </div>
        </div>
      )}

      {/* PORTER-STYLE NOT DELIVERED REASON MODAL */}
      {showNotDeliveredModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-rose-500/30 bg-card p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
                <AlertOctagon className="h-5 w-5" />
                <span>Mark as Not Delivered</span>
              </div>
              <button
                onClick={() => setShowNotDeliveredModal(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                &times;
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Select the operational reason why this freight consignment could not be delivered to the consignee.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-foreground">Exception Category</label>
                <select
                  value={failureReason}
                  onChange={(e) => setFailureReason(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary focus:outline-none text-xs"
                >
                  <option value="Consignee Unreachable / Phone Switched Off">Consignee Unreachable / Phone Switched Off</option>
                  <option value="Incorrect / Incomplete Delivery Address">Incorrect / Incomplete Delivery Address</option>
                  <option value="Consignee Refused Acceptance of Cargo">Consignee Refused Acceptance of Cargo</option>
                  <option value="Security / Building Gate Access Denied">Security / Building Gate Access Denied</option>
                  <option value="Payment / Surcharge Amount Dispute">Payment / Surcharge Amount Dispute</option>
                  <option value="Cargo Seal Damaged / Broken in Transit">Cargo Seal Damaged / Broken in Transit</option>
                  <option value="Road Blocked / Vehicle Breakdown">Road Blocked / Vehicle Breakdown</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-foreground">Driver Incident Notes</label>
                <textarea
                  rows={3}
                  placeholder="Provide incident details (e.g. waited 25 mins at gate 4, tried calling customer 3 times with no answer)..."
                  value={driverNotes}
                  onChange={(e) => setDriverNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary focus:outline-none text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowNotDeliveredModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-border hover:bg-muted font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingException}
                  onClick={handleMarkNotDelivered}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-600/20 disabled:opacity-50"
                >
                  {submittingException ? "Submitting..." : "Confirm Not Delivered"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
