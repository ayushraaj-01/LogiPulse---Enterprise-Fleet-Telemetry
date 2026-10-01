import React, { useState, useRef, useEffect } from "react";
import {
  Truck,
  CheckCircle2,
  XCircle,
  Camera,
  PenTool,
  Clock,
  Phone,
  Shield,
  MapPin,
  KeyRound,
  Users,
  AlertOctagon,
  Wifi,
  BatteryCharging,
  Signal,
  Sliders,
  Flashlight,
  Maximize2,
  Minimize2,
  RotateCcw,
  Sparkles,
  Smartphone,
  Navigation,
  DollarSign,
  Check,
} from "lucide-react";
import API from "../services/api";
import { StatusBadge } from "../components/StatusBadge";

export const DriverPortal = () => {
  // Smartphone Hardware Frame & Display Controls
  const [deviceMode, setDeviceMode] = useState(true);
  const [deviceFinish, setDeviceFinish] = useState("titanium"); // "titanium" | "midnight" | "silver"
  const [dynamicIslandExpanded, setDynamicIslandExpanded] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [torchActive, setTorchActive] = useState(false);

  // Driver Operational State
  const [dutyOnline, setDutyOnline] = useState(true);
  const [activeTab, setActiveTab] = useState("active_trip"); // "active_trip" | "safety" | "earnings"
  const [activeShipment, setActiveShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  // Delivery OTP Verification (Porter Style)
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");

  // Helper Option (Porter Style)
  const [helperCount, setHelperCount] = useState(1);

  // In-Cab Smartphone Camera Simulation
  const [cameraModalOpen, setCameraModalOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [shutterFlashing, setShutterFlashing] = useState(false);

  // POD Form State
  const [recipientName, setRecipientName] = useState("");
  const [podSubmitted, setPodSubmitted] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);

  // Not Delivered / Exception Modal State (Porter Style)
  const [showNotDeliveredModal, setShowNotDeliveredModal] = useState(false);
  const [failureReason, setFailureReason] = useState("Consignee Unreachable / Phone Switched Off");
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

  // Real-time Smartphone Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, "0");
      hours = hours % 12 || 12;
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchActiveTrip = async () => {
    try {
      const res = await API.get("/shipments");
      const list = res.data.data || [];
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
        photoUrl:
          capturedPhoto ||
          "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80",
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

  // Touch & Mouse Signature Canvas Drawing Helpers
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#2563eb";
    ctx.lineCap = "round";
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
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

  // Smartphone Camera Capture simulation
  const handleShutterClick = () => {
    setShutterFlashing(true);
    setTimeout(() => {
      setShutterFlashing(false);
      setCapturedPhoto(
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80"
      );
    }, 250);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 font-mono text-xs text-muted-foreground">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Initializing In-Cab SmartPhone Terminal...</span>
      </div>
    );
  }

  // Device Finish Color Schemes
  const finishStyles = {
    titanium: {
      outerRim: "from-stone-500 via-stone-700 to-stone-900 border-stone-600/70",
      buttonBg: "bg-stone-700",
      glow: "shadow-[0_25px_70px_rgba(0,0,0,0.6),0_0_50px_rgba(120,113,108,0.15)]",
      name: "Natural Titanium",
    },
    midnight: {
      outerRim: "from-slate-700 via-slate-900 to-black border-slate-700/80",
      buttonBg: "bg-slate-800",
      glow: "shadow-[0_25px_70px_rgba(0,0,0,0.7),0_0_50px_rgba(30,58,138,0.2)]",
      name: "Deep Midnight",
    },
    silver: {
      outerRim: "from-slate-300 via-slate-500 to-slate-800 border-slate-400/80",
      buttonBg: "bg-slate-500",
      glow: "shadow-[0_25px_70px_rgba(0,0,0,0.55),0_0_50px_rgba(203,213,225,0.25)]",
      name: "Alpine Silver",
    },
  };

  const currentFinish = finishStyles[deviceFinish] || finishStyles.titanium;

  return (
    <div className="w-full py-4 px-2 space-y-6 animate-fade-in-up">
      {/* Top Device Studio HUD (Mockup controls & Specs) */}
      <div className="max-w-xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl border border-border bg-card/90 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-primary/10 text-primary">
            <Smartphone className="h-5 w-5" />
          </div>
          <div>
            <div className="font-heading font-bold text-xs sm:text-sm text-foreground flex items-center gap-2">
              LogiPulse Rugged In-Cab Smartphone Terminal
              <span className="text-[10px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                5G UPLINK
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Simulated High-Visibility In-Cab Driver Console &bull; Touch e-POD &bull; OTP Verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Finish Selector */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl">
            <button
              onClick={() => setDeviceFinish("titanium")}
              title="Natural Titanium"
              className={`h-5 w-5 rounded-full bg-stone-600 transition-all ${
                deviceFinish === "titanium" ? "ring-2 ring-primary scale-110" : "opacity-60 hover:opacity-100"
              }`}
            />
            <button
              onClick={() => setDeviceFinish("midnight")}
              title="Deep Midnight"
              className={`h-5 w-5 rounded-full bg-slate-900 transition-all ${
                deviceFinish === "midnight" ? "ring-2 ring-primary scale-110" : "opacity-60 hover:opacity-100"
              }`}
            />
            <button
              onClick={() => setDeviceFinish("silver")}
              title="Alpine Silver"
              className={`h-5 w-5 rounded-full bg-slate-300 transition-all ${
                deviceFinish === "silver" ? "ring-2 ring-primary scale-110" : "opacity-60 hover:opacity-100"
              }`}
            />
          </div>

          {/* Toggle Device Frame vs Expanded View */}
          <button
            onClick={() => setDeviceMode(!deviceMode)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-foreground transition-all cursor-pointer shadow-xs"
            title={deviceMode ? "Switch to Flat Expanded View" : "Switch to Realistic Smart Phone Mockup"}
          >
            {deviceMode ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
            <span className="text-[11px]">{deviceMode ? "Full Width" : "Smart Phone"}</span>
          </button>
        </div>
      </div>

      {/* Main Container: Device Mockup OR Flat Responsive Card */}
      <div className="flex justify-center items-center">
        {deviceMode ? (
          /* REALISTIC SMARTPHONE HARDWARE CHASSIS */
          <div className="relative group transition-all duration-300">
            {/* Left Hardware Buttons (Action Button, Volume Up, Volume Down) */}
            <div className="absolute -left-3 top-28 w-1.5 h-8 rounded-l-md bg-stone-700 shadow-xs" />
            <div className="absolute -left-3 top-42 w-1.5 h-12 rounded-l-md bg-stone-700 shadow-xs" />
            <div className="absolute -left-3 top-58 w-1.5 h-12 rounded-l-md bg-stone-700 shadow-xs" />

            {/* Right Hardware Button (Power / Lock Button) */}
            <div className="absolute -right-3 top-38 w-1.5 h-16 rounded-r-md bg-stone-700 shadow-xs" />

            {/* Smartphone Outer Titanium Chassis */}
            <div
              className={`w-[380px] sm:w-[412px] rounded-[52px] p-[10px] bg-gradient-to-b ${currentFinish.outerRim} ${currentFinish.glow} border-[4px] relative transition-all`}
            >
              {/* Internal Glass Bezel Rim */}
              <div className="w-full rounded-[44px] bg-background border border-black/40 overflow-hidden relative shadow-inner flex flex-col min-h-[780px] max-h-[860px]">
                {/* SMARTPHONE STATUS BAR */}
                <div className="h-11 px-6 pt-2 bg-background flex items-center justify-between z-30 select-none border-b border-border/20">
                  {/* Left: Clock */}
                  <span className="font-mono text-xs font-bold text-foreground tracking-tight">
                    {currentTime || "11:18"}
                  </span>

                  {/* Center: DYNAMIC ISLAND */}
                  <div
                    onClick={() => setDynamicIslandExpanded(!dynamicIslandExpanded)}
                    className={`transition-all duration-300 ease-out cursor-pointer bg-black text-white flex items-center justify-between px-2.5 shadow-md ${
                      dynamicIslandExpanded
                        ? "w-64 h-11 rounded-2xl"
                        : "w-28 h-6 rounded-full hover:scale-105"
                    }`}
                  >
                    {dynamicIslandExpanded ? (
                      <div className="flex items-center justify-between w-full text-[10px] px-1 font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                          <span className="font-bold text-emerald-400">In-Cab Radar</span>
                        </div>
                        <span className="text-slate-300 truncate max-w-[120px]">
                          {activeShipment?.trackingNumber || "Active Trip"}
                        </span>
                      </div>
                    ) : (
                      <>
                        {/* Camera sensor dot */}
                        <div className="h-2.5 w-2.5 rounded-full bg-slate-900 border border-slate-800 ring-1 ring-white/10" />
                        <span className="text-[9px] font-mono text-slate-300 font-bold">58 km/h</span>
                        {/* Microphone sensor dot */}
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      </>
                    )}
                  </div>

                  {/* Right: Cellular, WiFi, Battery */}
                  <div className="flex items-center gap-1.5 text-foreground text-xs">
                    <Signal className="h-3 w-3" />
                    <Wifi className="h-3 w-3" />
                    <div className="flex items-center gap-0.5 text-[10px] font-mono font-bold">
                      <span>96%</span>
                      <BatteryCharging className="h-3.5 w-3.5 text-emerald-500" />
                    </div>
                  </div>
                </div>

                {/* SMARTPHONE SCROLLABLE SCREEN CONTENT */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3.5 scrollbar-thin">
                  {/* Driver Header with Duty Switcher */}
                  <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 text-white shadow-md border border-white/10 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black shadow-md shadow-primary/30">
                          <Truck className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-heading font-extrabold text-xs flex items-center gap-1 text-white">
                            Marcus Ray
                            <span className="text-[10px] text-amber-400 font-mono font-bold">★ 4.92</span>
                          </div>
                          <div className="text-[9px] text-slate-300 font-mono truncate max-w-[140px]">
                            DL-01-AA-4091 &bull; Heavy Haulage
                          </div>
                        </div>
                      </div>

                      {/* Online / Offline Duty Switcher */}
                      <button
                        onClick={() => setDutyOnline(!dutyOnline)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                          dutyOnline
                            ? "bg-emerald-500 text-white shadow-emerald-500/25"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            dutyOnline ? "bg-white animate-ping" : "bg-slate-400"
                          }`}
                        />
                        <span>{dutyOnline ? "ONLINE" : "OFFLINE"}</span>
                      </button>
                    </div>

                    {/* Navigation Tab Bar inside Phone */}
                    <div className="grid grid-cols-3 gap-1 bg-white/10 p-1 rounded-xl text-[11px] font-semibold">
                      <button
                        onClick={() => setActiveTab("active_trip")}
                        className={`py-1 rounded-lg transition-all cursor-pointer ${
                          activeTab === "active_trip"
                            ? "bg-primary text-primary-foreground font-extrabold shadow-xs"
                            : "text-slate-300 hover:text-white"
                        }`}
                      >
                        Active Trip
                      </button>
                      <button
                        onClick={() => setActiveTab("safety")}
                        className={`py-1 rounded-lg transition-all cursor-pointer ${
                          activeTab === "safety"
                            ? "bg-primary text-primary-foreground font-extrabold shadow-xs"
                            : "text-slate-300 hover:text-white"
                        }`}
                      >
                        DVIR Safety
                      </button>
                      <button
                        onClick={() => setActiveTab("earnings")}
                        className={`py-1 rounded-lg transition-all cursor-pointer ${
                          activeTab === "earnings"
                            ? "bg-primary text-primary-foreground font-extrabold shadow-xs"
                            : "text-slate-300 hover:text-white"
                        }`}
                      >
                        Earnings
                      </button>
                    </div>
                  </div>

                  {/* TAB 1: ACTIVE PORTER TRIP */}
                  {activeTab === "active_trip" && (
                    <div className="space-y-3">
                      {activeShipment ? (
                        <div className="rounded-2xl border border-primary/30 bg-card p-3.5 shadow-sm space-y-3 text-xs">
                          {/* Order Header */}
                          <div className="flex items-center justify-between pb-2 border-b border-border">
                            <div>
                              <span className="text-[9px] font-mono font-bold text-primary uppercase block">
                                Assigned Consignment
                              </span>
                              <h3 className="font-heading font-extrabold text-sm text-foreground font-mono">
                                {activeShipment.trackingNumber}
                              </h3>
                            </div>
                            <StatusBadge status={activeShipment.status} />
                          </div>

                          {/* Helper Requirement */}
                          <div className="p-2.5 rounded-xl bg-muted/40 border border-border flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5 text-primary shrink-0" />
                              <div>
                                <span className="font-bold text-[11px] text-foreground">Labor Helpers</span>
                                <div className="text-[9px] text-muted-foreground">Loading Support</div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {[0, 1, 2].map((cnt) => (
                                <button
                                  key={cnt}
                                  onClick={() => setHelperCount(cnt)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                                    helperCount === cnt
                                      ? "bg-primary text-primary-foreground"
                                      : "bg-background border border-border text-muted-foreground"
                                  }`}
                                >
                                  {cnt === 0 ? "Solo" : `+${cnt}`}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Waypoints */}
                          <div className="space-y-1.5 text-[11px]">
                            <div className="flex items-start gap-2 p-2 rounded-xl bg-muted/30 border border-border/70">
                              <div className="h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                <MapPin className="h-3 w-3" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[9px] font-bold text-emerald-500 uppercase block">Pickup</span>
                                <div className="font-bold text-foreground truncate">{activeShipment.origin?.name}</div>
                                <div className="text-[10px] text-muted-foreground truncate">{activeShipment.origin?.address}</div>
                              </div>
                            </div>

                            <div className="flex items-start gap-2 p-2 rounded-xl bg-muted/30 border border-border/70">
                              <div className="h-5 w-5 rounded-full bg-rose-500/15 text-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                                <MapPin className="h-3 w-3" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[9px] font-bold text-rose-500 uppercase block">Dropoff</span>
                                <div className="font-bold text-foreground truncate">{activeShipment.destination?.name}</div>
                                <div className="text-[10px] text-muted-foreground truncate">{activeShipment.destination?.address}</div>
                              </div>
                            </div>
                          </div>

                          {/* Trip Progression Step Buttons */}
                          <div className="pt-2 border-t border-border space-y-1.5">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground block">
                              Trip Execution Milestones:
                            </span>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <button
                                onClick={() => updateTripStatus("AT_PICKUP", "Driver arrived at loading gate")}
                                className="p-2 rounded-xl border border-border bg-card hover:border-primary text-foreground font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              >
                                <span>📍 At Pickup</span>
                              </button>
                              <button
                                onClick={() => updateTripStatus("IN_TRANSIT", "Cargo loaded; dispatched onto corridor")}
                                className="p-2 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              >
                                <span>🚚 In Transit</span>
                              </button>
                            </div>
                          </div>

                          {/* Delivery OTP Box */}
                          {!otpVerified && activeShipment.status !== "DELIVERED" && activeShipment.status !== "NOT_DELIVERED" && (
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-amber-500 flex items-center gap-1 text-[11px]">
                                  <KeyRound className="h-3.5 w-3.5" />
                                  Customer OTP Verification
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEnteredOtp(activeShipment.deliveryOtp || "4829")}
                                  className="text-[9px] font-mono font-bold text-primary underline"
                                >
                                  Auto-fill ({activeShipment.deliveryOtp || "4829"})
                                </button>
                              </div>
                              <p className="text-[10px] text-muted-foreground">
                                Obtain the 4-digit security code from the consignee at the delivery gate.
                              </p>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  maxLength={4}
                                  placeholder="4-Digit OTP"
                                  value={enteredOtp}
                                  onChange={(e) => setEnteredOtp(e.target.value)}
                                  className="w-28 h-8 px-2 rounded-lg border border-input bg-background font-mono font-bold text-center tracking-widest text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                                />
                                <button
                                  onClick={handleVerifyOtp}
                                  className="flex-1 h-8 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors cursor-pointer"
                                >
                                  Verify OTP
                                </button>
                              </div>
                              {otpError && <div className="text-[9px] text-rose-500 font-semibold">{otpError}</div>}
                            </div>
                          )}

                          {/* Final Delivery Decision Buttons */}
                          {activeShipment.status !== "DELIVERED" && activeShipment.status !== "NOT_DELIVERED" && (
                            <div className="space-y-2 pt-2 border-t border-border">
                              <div className="grid grid-cols-2 gap-2">
                                <button
                                  type="button"
                                  onClick={() => setShowNotDeliveredModal(true)}
                                  className="h-9 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  <span>Not Delivered</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!otpVerified) {
                                      alert(`Please verify the delivery OTP first (Demo OTP: ${activeShipment.deliveryOtp || "4829"}).`);
                                    }
                                  }}
                                  className={`h-9 rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                    otpVerified
                                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                                      : "bg-muted text-muted-foreground cursor-not-allowed opacity-75"
                                  }`}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  <span>{otpVerified ? "Sign e-POD" : "OTP Required"}</span>
                                </button>
                              </div>

                              {/* e-POD Signature Area if OTP Verified */}
                              {otpVerified && !podSubmitted && (
                                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-2 text-xs">
                                  <span className="font-bold text-foreground flex items-center gap-1 text-[11px]">
                                    <PenTool className="h-3.5 w-3.5 text-emerald-500" />
                                    Consignee Digital e-POD Signature
                                  </span>

                                  <input
                                    type="text"
                                    placeholder="Receiver Name (e.g. Alex Vance)"
                                    value={recipientName}
                                    onChange={(e) => setRecipientName(e.target.value)}
                                    className="w-full h-8 px-2.5 rounded-lg border border-input bg-background text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                                  />

                                  <div>
                                    <div className="flex justify-between items-center mb-1">
                                      <span className="text-muted-foreground text-[10px]">Sign on screen below</span>
                                      <button
                                        type="button"
                                        onClick={clearSignature}
                                        className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                                      >
                                        Clear Pad
                                      </button>
                                    </div>
                                    <div className="rounded-xl border border-input bg-background p-1">
                                      <canvas
                                        ref={canvasRef}
                                        width={320}
                                        height={80}
                                        onMouseDown={startDrawing}
                                        onMouseMove={draw}
                                        onMouseUp={stopDrawing}
                                        onTouchStart={startDrawing}
                                        onTouchMove={draw}
                                        onTouchEnd={stopDrawing}
                                        className="w-full h-20 touch-none bg-slate-900/90 rounded-lg cursor-crosshair"
                                      />
                                    </div>
                                  </div>

                                  {/* Camera Snapshot Trigger */}
                                  <button
                                    type="button"
                                    onClick={() => setCameraModalOpen(true)}
                                    className="w-full h-8 rounded-lg border border-border bg-card text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-muted cursor-pointer"
                                  >
                                    <Camera className="h-3.5 w-3.5 text-primary" />
                                    <span>{capturedPhoto ? "Cargo Photo Captured ✓" : "Take Cargo Handover Photo"}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={handleCompleteDelivered}
                                    className="w-full h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span>Complete Delivery & Verify e-POD</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Status Alerts */}
                          {activeShipment.status === "DELIVERED" && (
                            <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-center space-y-1">
                              <CheckCircle2 className="h-6 w-6 mx-auto" />
                              <div className="font-bold text-xs">Delivery Completed Successfully!</div>
                              <p className="text-[10px] text-muted-foreground">
                                e-POD signature verified. Wallet credited for trip settlement.
                              </p>
                            </div>
                          )}

                          {activeShipment.status === "NOT_DELIVERED" && (
                            <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 space-y-1">
                              <div className="flex items-center gap-1.5 font-bold text-xs">
                                <XCircle className="h-4 w-4 text-rose-500" />
                                <span>Consignment Marked Not Delivered</span>
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                <b>Reason:</b> {activeShipment.failureReason || "Consignee unavailable"}.
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-6 rounded-2xl border border-border bg-card text-center space-y-2">
                          <Truck className="h-8 w-8 mx-auto text-muted-foreground" />
                          <div className="font-bold text-xs text-foreground">No Active Trips Assigned</div>
                          <p className="text-[11px] text-muted-foreground">
                            You are currently {dutyOnline ? "Online and ready for dispatches." : "Offline."}
                          </p>
                        </div>
                      )}

                      {/* Quick Contact Buttons */}
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <a
                          href="tel:+919811240912"
                          className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Phone className="h-3.5 w-3.5 text-emerald-500" />
                          <span>Call Receiver</span>
                        </a>
                        <a
                          href="tel:+918005554357"
                          className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Shield className="h-3.5 w-3.5 text-primary" />
                          <span>Dispatch HQ</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: SAFETY PRE-TRIP INSPECTION */}
                  {activeTab === "safety" && (
                    <div className="rounded-2xl border border-border bg-card p-3.5 space-y-3 text-xs">
                      <div className="flex items-center justify-between pb-1.5 border-b border-border">
                        <span className="font-heading font-bold text-[11px] uppercase text-foreground">
                          DOT Pre-Trip Safety Check
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold">100% COMPLIANT</span>
                      </div>

                      <div className="space-y-1.5">
                        {Object.keys(checklist).map((key) => (
                          <label
                            key={key}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-muted/40 border border-border cursor-pointer hover:border-primary/40 transition-colors"
                          >
                            <span className="capitalize font-semibold text-[11px] text-foreground">
                              {key} System Check
                            </span>
                            <input
                              type="checkbox"
                              checked={checklist[key]}
                              onChange={() => setChecklist({ ...checklist, [key]: !checklist[key] })}
                              className="rounded border-input text-primary focus:ring-primary h-4 w-4 cursor-pointer"
                            />
                          </label>
                        ))}
                      </div>

                      <button
                        onClick={() => alert("Inspection manifest submitted & logged to regional DOT records.")}
                        className="w-full h-9 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-sm hover:bg-primary/90 transition-all cursor-pointer"
                      >
                        Submit DVIR Checklist
                      </button>
                    </div>
                  )}

                  {/* TAB 3: EARNINGS & TRIP SUMMARY */}
                  {activeTab === "earnings" && (
                    <div className="rounded-2xl border border-border bg-card p-3.5 space-y-3 text-xs">
                      <div className="flex items-center justify-between pb-1.5 border-b border-border">
                        <span className="font-heading font-bold text-[11px] uppercase text-foreground">
                          Driver Daily Ledger
                        </span>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold">SETTLED DAILY</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold block">Today's Payout</span>
                          <div className="text-lg font-bold font-mono text-foreground mt-0.5">₹3,450.00</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold block">Trips Done</span>
                          <div className="text-lg font-bold font-mono text-primary mt-0.5">3 Completed</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold block">Distance</span>
                          <div className="text-lg font-bold font-mono text-foreground mt-0.5">148.2 km</div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-muted/40 border border-border">
                          <span className="text-[9px] text-muted-foreground uppercase font-bold block">Helper Tips</span>
                          <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">+₹450.00</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* SMARTPHONE BOTTOM SYSTEM HOME INDICATOR */}
                <div className="h-7 w-full bg-background flex flex-col justify-center items-center select-none border-t border-border/20">
                  <div
                    onClick={() => setActiveTab("active_trip")}
                    className="w-32 h-1 rounded-full bg-foreground/30 hover:bg-foreground/60 transition-colors cursor-pointer"
                    title="Tap to return to Active Trip Home"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* FLAT RESPONSIVE VIEW (When user clicks "Full Width") */
          <div className="w-full max-w-xl space-y-4">
            {/* Same contents in flat card layout */}
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-blue-950 text-white shadow-xl border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black shadow-md">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-heading font-extrabold text-sm flex items-center gap-1.5 text-white">
                      Marcus Ray
                      <span className="text-[10px] text-amber-400 font-mono font-bold">★ 4.92</span>
                    </div>
                    <div className="text-[10px] text-slate-300 font-mono">
                      DL-01-AA-4091 &bull; Signa Heavy Carrier
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setDutyOnline(!dutyOnline)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer ${
                    dutyOnline ? "bg-emerald-500 text-white" : "bg-slate-700 text-slate-300"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${dutyOnline ? "bg-white animate-ping" : "bg-slate-400"}`} />
                  <span>{dutyOnline ? "ONLINE" : "OFFLINE"}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-1 bg-white/10 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveTab("active_trip")}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === "active_trip" ? "bg-primary text-primary-foreground font-black" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Active Trip
                </button>
                <button
                  onClick={() => setActiveTab("safety")}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === "safety" ? "bg-primary text-primary-foreground font-black" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Safety Check
                </button>
                <button
                  onClick={() => setActiveTab("earnings")}
                  className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === "earnings" ? "bg-primary text-primary-foreground font-black" : "text-slate-300 hover:text-white"
                  }`}
                >
                  Earnings
                </button>
              </div>
            </div>

            {/* Active Trip Card */}
            {activeShipment && (
              <div className="rounded-2xl border border-primary/30 bg-card p-5 shadow-lg space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-primary uppercase">Active Consignment</span>
                    <h3 className="font-heading font-extrabold text-base text-foreground font-mono">
                      {activeShipment.trackingNumber}
                    </h3>
                  </div>
                  <StatusBadge status={activeShipment.status} />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => updateTripStatus("AT_PICKUP", "Driver arrived at loading gate")}
                    className="p-2.5 rounded-xl border border-border bg-card hover:border-primary text-foreground font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>📍 At Pickup</span>
                  </button>
                  <button
                    onClick={() => updateTripStatus("IN_TRANSIT", "Goods loaded; departed pickup point")}
                    className="p-2.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>🚚 In Transit</span>
                  </button>
                </div>

                {/* Final Delivery Decision */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowNotDeliveredModal(true)}
                    className="h-10 rounded-xl border border-rose-500/40 bg-rose-500/10 text-rose-500 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="h-4 w-4" />
                    <span>Not Delivered</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!otpVerified) {
                        alert(`Please verify the delivery OTP first.`);
                      }
                    }}
                    className={`h-10 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                      otpVerified ? "bg-emerald-600 text-white" : "bg-muted text-muted-foreground opacity-75"
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Complete e-POD</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SMARTPHONE IN-CAB CAMERA VIEWFINDER MODAL */}
      {cameraModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm rounded-[32px] overflow-hidden border border-white/20 bg-slate-950 p-4 shadow-2xl space-y-3 relative text-white">
            {/* Camera Viewfinder Header */}
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-mono text-[10px] uppercase font-bold tracking-wider">
                In-Cab Cargo Viewfinder
              </span>
              <button
                onClick={() => setCameraModalOpen(false)}
                className="h-7 w-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center cursor-pointer text-white"
              >
                &times;
              </button>
            </div>

            {/* Viewfinder Lens Area */}
            <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-black border border-white/15 flex items-center justify-center">
              {shutterFlashing && (
                <div className="absolute inset-0 bg-white z-20 animate-out fade-out duration-200" />
              )}

              <img
                src={
                  capturedPhoto ||
                  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80"
                }
                alt="Cargo Snapshot"
                className="w-full h-full object-cover opacity-90"
              />

              {/* Camera Grid Lines Overlay */}
              <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/20">
                <div className="border-r border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                <div className="border-b border-white/20" />
                <div className="border-r border-b border-white/20" />
                {/* Center crosshair */}
                <div className="border-r border-b border-white/20 flex items-center justify-center">
                  <div className="h-8 w-8 border border-amber-400/80 rounded-full flex items-center justify-center">
                    <div className="h-1.5 w-1.5 bg-amber-400 rounded-full" />
                  </div>
                </div>
                <div className="border-b border-white/20" />
                <div className="border-r border-white/20" />
                <div className="border-r border-white/20" />
                <div />
              </div>
            </div>

            {/* Shutter Button & Controls */}
            <div className="flex items-center justify-around pt-2">
              <button
                type="button"
                onClick={() => setTorchActive(!torchActive)}
                className={`p-2.5 rounded-full border transition-colors cursor-pointer ${
                  torchActive
                    ? "bg-amber-400 text-black border-amber-400"
                    : "bg-white/10 text-white border-white/20 hover:bg-white/20"
                }`}
                title="Toggle In-Cab Flash"
              >
                <Flashlight className="h-4 w-4" />
              </button>

              {/* Large Shutter Button */}
              <button
                type="button"
                onClick={handleShutterClick}
                className="h-14 w-14 rounded-full border-4 border-white bg-white/20 hover:bg-white/40 flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-lg"
              >
                <div className="h-10 w-10 rounded-full bg-white" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setCameraModalOpen(false);
                }}
                className="p-2.5 rounded-full bg-emerald-500 text-white border border-emerald-400 hover:bg-emerald-400 transition-colors cursor-pointer"
                title="Use This Photo"
              >
                <Check className="h-4 w-4 stroke-[3]" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PORTER NOT DELIVERED EXCEPTION MODAL */}
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
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted cursor-pointer"
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
                  className="px-3.5 py-2 rounded-lg border border-border hover:bg-muted font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={submittingException}
                  onClick={handleMarkNotDelivered}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold shadow-md shadow-rose-600/20 disabled:opacity-50 cursor-pointer"
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
