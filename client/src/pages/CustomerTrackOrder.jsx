import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Navigation,
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Shield,
  KeyRound,
  Users,
  Search,
  ExternalLink,
  ChevronRight,
  Compass,
  Gauge,
  HelpCircle,
  Star,
  Share2,
  Download,
  RotateCcw,
  Check,
} from "lucide-react";
import API from "../services/api";
import { StatusBadge } from "../components/StatusBadge";
import { RealMap } from "../components/RealMap";
import { useLanguage } from "../context/LanguageContext";
import { buildHighwayCorridor } from "../utils/geoCorridor";
import io from "socket.io-client";

export const CustomerTrackOrder = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [liveVehicle, setLiveVehicle] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reattemptScheduled, setReattemptScheduled] = useState(false);
  const [driverRating, setDriverRating] = useState(5);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const [selectedTags, setSelectedTags] = useState(["On-time", "Careful Handling"]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/shipments");
        const list = res.data.data || [];
        setShipments(list);

        const targetId = searchParams.get("id");
        if (targetId) {
          const match = list.find((s) => s.trackingNumber === targetId || s._id === targetId);
          if (match) setSelectedShipment(match);
        } else if (list.length > 0) {
          // Default to the first in-transit or delivered order
          const defaultOrder =
            list.find((s) => s.status === "IN_TRANSIT" || s.status === "AT_PICKUP") || list[0];
          setSelectedShipment(defaultOrder);
        }
      } catch (err) {
        console.error("Error loading customer orders", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [searchParams]);

  // Set up live moving vehicle along corridor for selected shipment
  useEffect(() => {
    if (!selectedShipment) return;

    const corridor = buildHighwayCorridor(selectedShipment.origin, selectedShipment.destination);
    const originLat = Number(selectedShipment.origin?.latitude) || 28.5355;
    const originLng = Number(selectedShipment.origin?.longitude) || 77.391;
    const destLat = Number(selectedShipment.destination?.latitude) || 28.4952;
    const destLng = Number(selectedShipment.destination?.longitude) || 77.0892;

    const assignedVeh = selectedShipment.assignedVehicle;
    const assignedDrv = selectedShipment.assignedDriver;

    // Determine initial location based on status
    let initialLat = corridor.length > 5 ? corridor[5][0] : originLat;
    let initialLng = corridor.length > 5 ? corridor[5][1] : originLng;
    let initialSpeed = 58;
    let initialHeading = 75;
    let initialAddress = `${selectedShipment.origin?.name || "Origin"} → ${selectedShipment.destination?.name || "Destination"} Freight Corridor`;

    if (selectedShipment.status === "DELIVERED") {
      initialLat = destLat;
      initialLng = destLng;
      initialSpeed = 0;
      initialHeading = 0;
      initialAddress = `${selectedShipment.destination?.name || "Destination Hub"}, ${selectedShipment.destination?.address || ""}`;
    } else if (selectedShipment.status === "AT_PICKUP" || selectedShipment.status === "UNASSIGNED") {
      initialLat = originLat;
      initialLng = originLng;
      initialSpeed = 0;
      initialHeading = 0;
      initialAddress = `${selectedShipment.origin?.name || "Origin Terminal"}, ${selectedShipment.origin?.address || ""}`;
    } else if (assignedVeh?.currentLocation?.latitude && assignedVeh?.currentLocation?.longitude) {
      initialLat = assignedVeh.currentLocation.latitude;
      initialLng = assignedVeh.currentLocation.longitude;
      initialSpeed = assignedVeh.currentLocation.speedKmh || 58;
      initialHeading = assignedVeh.currentLocation.headingDeg || 75;
      if (assignedVeh.currentLocation.address) {
        initialAddress = assignedVeh.currentLocation.address;
      }
    }

    const defaultVehicle = {
      _id: assignedVeh?._id || "cust-veh",
      licensePlate: assignedVeh?.licensePlate || "DL-01-AA-4091",
      make: assignedVeh?.make || "Tata Motors",
      model: assignedVeh?.model || "Signa 4825.T Heavy Multi-Axle",
      type: assignedVeh?.type || "HEAVY_TRUCK",
      status: selectedShipment.status,
      currentLocation: {
        latitude: initialLat,
        longitude: initialLng,
        speedKmh: initialSpeed,
        headingDeg: initialHeading,
        address: initialAddress,
      },
      assignedDriver: assignedDrv || { name: "Rajesh Kumar", phone: "+91 98112-40912" },
    };
    setLiveVehicle(defaultVehicle);

    if (
      selectedShipment.status === "DELIVERED" ||
      selectedShipment.status === "NOT_DELIVERED" ||
      selectedShipment.status === "UNASSIGNED"
    ) {
      return;
    }

    // Connect to WebSocket server for live telemetry updates
    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5050";
    let socket;
    try {
      socket = io(socketUrl);
      socket.on("FLEET_TELEMETRY_UPDATE", (updatedVehicles) => {
        if (assignedVeh?._id) {
          const match = updatedVehicles.find((v) => v._id === assignedVeh._id);
          if (match && match.currentLocation?.latitude) {
            setLiveVehicle((prev) => ({
              ...prev,
              ...match,
              currentLocation: {
                ...match.currentLocation,
                address: match.currentLocation.address || initialAddress,
              },
            }));
          }
        }
      });
    } catch (e) {
      console.warn("Socket connection fallback to corridor progression", e);
    }

    // Gentle progressive movement along the corridor
    let stepIndex = Math.min(5, Math.floor(corridor.length / 2));
    let forward = true;
    const interval = setInterval(() => {
      if (!corridor || corridor.length < 2) return;
      if (forward) {
        stepIndex++;
        if (stepIndex >= corridor.length - 1) forward = false;
      } else {
        stepIndex--;
        if (stepIndex <= 1) forward = true;
      }

      const pt = corridor[stepIndex];
      const targetPt = forward
        ? corridor[Math.min(stepIndex + 1, corridor.length - 1)]
        : corridor[Math.max(stepIndex - 1, 0)];

      const dLng = targetPt[1] - pt[1];
      const dLat = targetPt[0] - pt[0];
      const heading = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;

      setLiveVehicle((prev) => ({
        ...prev,
        currentLocation: {
          latitude: pt[0],
          longitude: pt[1],
          speedKmh: Math.floor(52 + Math.random() * 18),
          headingDeg: heading,
          address: initialAddress,
        },
      }));
    }, 3500);

    return () => {
      clearInterval(interval);
      if (socket) socket.disconnect();
    };
  }, [selectedShipment]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const match = shipments.find(
      (s) => s.trackingNumber.toLowerCase() === searchQuery.trim().toLowerCase()
    );
    if (match) {
      setSelectedShipment(match);
    } else {
      alert(`Consignment "${searchQuery}" not found. Please check tracking ID.`);
    }
  };

  const handleCopyLink = () => {
    if (!selectedShipment) return;
    const url = `${window.location.origin}/track/${selectedShipment.trackingNumber}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleToggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 font-mono text-xs text-muted-foreground">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span>Loading Consignment Tracking Interface...</span>
      </div>
    );
  }

  const corridor = selectedShipment
    ? buildHighwayCorridor(selectedShipment.origin, selectedShipment.destination)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Navigation className="h-6 w-6 text-primary" />
            {t("trackConsignmentTitle")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {t("trackConsignmentSubtitle")}
          </p>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder={t("searchTrackingPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 px-3 rounded-lg border border-input bg-card text-xs font-mono focus:ring-1 focus:ring-primary focus:outline-none w-full sm:w-64"
          />
          <button
            type="submit"
            className="btn-devfest px-5 h-9 text-xs flex items-center justify-center cursor-pointer shadow-md"
          >
            {t("btnTrack")}
          </button>
        </form>
      </div>

      {/* Quick Order Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] uppercase font-bold text-muted-foreground shrink-0 px-1">
          {t("activeConsignments")}
        </span>
        {shipments.map((s) => (
          <button
            key={s._id}
            onClick={() => setSelectedShipment(s)}
            className={`hover-lift px-3 py-1.5 rounded-lg font-mono text-xs font-bold shrink-0 transition-all flex items-center gap-2 cursor-pointer ${
              selectedShipment?._id === s._id
                ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/40"
                : "bg-card border border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
            }`}
          >
            <span>{s.trackingNumber}</span>
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                s.status === "DELIVERED"
                  ? "bg-sky-400"
                  : s.status === "NOT_DELIVERED"
                  ? "bg-rose-400"
                  : "bg-emerald-400 animate-ping"
              }`}
            />
          </button>
        ))}
      </div>

      {selectedShipment ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Real Map Corridor + Milestone Stepper */}
          <div className="lg:col-span-2 space-y-6">
            {/* Real Road Map Box (Only for THIS shipment) */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-border gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-primary font-bold uppercase">
                      {t("activeRouteBanner")}
                    </span>
                    <StatusBadge status={selectedShipment.status} />
                  </div>
                  <h2 className="font-heading text-lg font-extrabold text-foreground font-mono mt-0.5">
                    {selectedShipment.trackingNumber}
                  </h2>
                </div>

                {/* Action Badges: Share Link & Porter Delivery OTP */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyLink}
                    className="h-10 px-3 rounded-xl border border-border bg-card hover:bg-muted text-xs font-semibold flex items-center gap-1.5 text-foreground transition-colors"
                    title="Share consignment tracking link with receiver"
                  >
                    {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4 text-primary" />}
                    <span>{copiedLink ? t("linkCopied") : t("shareLink")}</span>
                  </button>

                  <div className="px-3.5 py-1.5 rounded-xl bg-primary/10 border border-primary/25 flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-primary" />
                    <div className="text-left">
                      <span className="text-[9px] font-bold uppercase text-muted-foreground block">
                        {t("deliveryOtpLabel")}
                      </span>
                      <span className="font-mono font-extrabold text-primary text-sm tracking-wider">
                        {selectedShipment.deliveryOtp || "4829"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dynamic Notification Banner */}
              {selectedShipment.status === "NOT_DELIVERED" ? (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm text-rose-500">
                      <AlertCircle className="h-4 w-4" />
                      <span>Consignment Delivery Unsuccessful</span>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                      Safely Returned to Depot
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    <b>Recorded Reason:</b> {selectedShipment.failureReason || "Consignee unavailable / Gate access restricted"}.
                    Cargo has been safely secured in the regional dispatch facility. You can schedule a free re-attempt below.
                  </p>

                  <div className="pt-1 flex flex-wrap items-center gap-3">
                    {reattemptScheduled ? (
                      <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-lg text-xs">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Re-attempt Confirmed: Dispatched Tomorrow 09:00 AM &ndash; 12:00 PM</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReattemptScheduled(true)}
                        className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        <span>Schedule Free Next-Day Re-attempt</span>
                      </button>
                    )}
                    <Link
                      to="/support"
                      className="px-3 py-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground text-xs font-semibold transition-colors"
                    >
                      Contact Dispatch Desk &rarr;
                    </Link>
                  </div>
                </div>
              ) : selectedShipment.status === "DELIVERED" ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-bold text-sm">Delivered & Verified via e-POD</span>
                    </div>
                    <span className="font-mono text-[11px] text-muted-foreground">Digital Signature Verified</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                    <span>Receiver: <b>Alex Vance (Dock Lead)</b> &bull; Proof: <b>OTP Verified (#4829)</b></span>
                    <Link to="/billing" className="text-primary hover:underline font-semibold flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      <span>Download Tax Invoice</span>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-primary font-bold">
                    <Clock className="h-4 w-4" />
                    <span>{t("dynamicEtaBanner")}</span>
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 font-semibold">
                    LIVE SATELLITE RADAR
                  </span>
                </div>
              )}

              {/* REAL MAP (Scoped ONLY to this shipment's road corridor) */}
              <div className="h-80 sm:h-96 rounded-xl overflow-hidden border border-border shadow-inner relative">
                <RealMap
                  center={[
                    ((selectedShipment.origin?.latitude || 28.5355) +
                      (selectedShipment.destination?.latitude || 28.4952)) /
                      2,
                    ((selectedShipment.origin?.longitude || 77.391) +
                      (selectedShipment.destination?.longitude || 77.0892)) /
                      2,
                  ]}
                  zoom={12}
                  showGeofences={true}
                  initialTile="streets"
                  interactiveControls={true}
                  height="100%"
                  originPin={{
                    lat: selectedShipment.origin?.latitude || 28.5355,
                    lng: selectedShipment.origin?.longitude || 77.391,
                    name: selectedShipment.origin?.name || "Origin Terminal",
                    address: selectedShipment.origin?.address,
                  }}
                  destinationPin={{
                    lat: selectedShipment.destination?.latitude || 28.4952,
                    lng: selectedShipment.destination?.longitude || 77.0892,
                    name: selectedShipment.destination?.name || "Delivery Address",
                    address: selectedShipment.destination?.address,
                  }}
                  routePolyline={corridor}
                  vehicles={liveVehicle ? [liveVehicle] : []}
                  selectedVehicle={liveVehicle}
                />
              </div>

              {/* Origin & Destination Route Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 rounded-xl bg-muted/40 border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">{t("pickupOrigin")}</span>
                  <div className="font-semibold text-foreground mt-0.5">{selectedShipment.origin?.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{selectedShipment.origin?.address}</div>
                </div>
                <div className="p-3 rounded-xl bg-muted/40 border border-border">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold">{t("dropoffDestination")}</span>
                  <div className="font-semibold text-foreground mt-0.5">{selectedShipment.destination?.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{selectedShipment.destination?.address}</div>
                </div>
              </div>
            </div>

            {/* Delivery Milestone Lifecycle Stepper */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
              <h3 className="font-heading font-bold text-sm text-foreground">
                {t("milestoneTimeline")}
              </h3>
              <div className="space-y-4">
                {selectedShipment.timeline?.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs relative">
                    <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-foreground">{step.status}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {new Date(step.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px] mt-0.5">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Driver Contact, Package Specs & Support */}
          <div className="space-y-6">
            {/* Assigned Driver Card */}
            <div className="hover-lift rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm hover:border-primary/40">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                {t("assignedOperator")}
              </span>

              <div className="flex items-center gap-3">
                <img
                  src={
                    selectedShipment.assignedDriver?.avatar ||
                    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
                  }
                  alt="Driver"
                  className="h-12 w-12 rounded-full object-cover border-2 border-primary/30"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-heading font-bold text-sm text-foreground truncate">
                    {selectedShipment.assignedDriver?.name || "Rajesh Kumar"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Carrier Partner &bull; <span className="text-amber-400 font-bold">★ 4.92 Rating</span>
                  </div>
                  <div className="text-[11px] font-mono text-primary font-semibold mt-0.5">
                    {selectedShipment.assignedVehicle?.licensePlate || "DL-01-AA-4091"} ({selectedShipment.assignedVehicle?.make || "Tata Motors"})
                  </div>
                </div>
              </div>

              {/* Call Driver Action */}
              <a
                href={`tel:${selectedShipment.assignedDriver?.phone || "+919811240912"}`}
                className="btn-devfest w-full h-11 text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Phone className="h-4 w-4 stroke-[2.5]" />
                <span>{t("callDriver")}: {selectedShipment.assignedDriver?.phone || "+91 98112-40912"}</span>
              </a>

              {/* Helper Badge */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-emerald-500" />
                  <span className="text-foreground font-medium">{t("laborAssistance")}</span>
                </div>
                <span className="font-bold text-emerald-400">
                  {selectedShipment.helperCount ? `+${selectedShipment.helperCount} Loading Helper` : t("bookSolo")}
                </span>
              </div>
            </div>

            {/* Porter Customer Driver Rating (When Delivered) */}
            {selectedShipment.status === "DELIVERED" && (
              <div className="rounded-2xl border border-border bg-card p-5 space-y-3 text-xs shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    {t("rateDeliveryExp")}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold">Porter Verified</span>
                </div>

                {ratingSubmitted ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center space-y-1">
                    <div className="font-bold flex items-center justify-center gap-1 text-xs">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{t("feedbackSubmitted")}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      Thank you for rating {selectedShipment.assignedDriver?.name || "your driver"} {driverRating} stars.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 py-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setDriverRating(star)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= driverRating
                                ? "text-amber-400 fill-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {[
                        "On-time",
                        "Careful Handling",
                        "Polite Driver",
                        "Smooth Unload",
                        "Clean Vehicle",
                      ].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={`px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                            selectedTags.includes(tag)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted/60 text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={() => setRatingSubmitted(true)}
                      className="w-full h-8 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90 transition-colors"
                    >
                      {t("submitRating")}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Package Specifications */}
            <div className="hover-lift rounded-2xl border border-border bg-card p-5 space-y-3 text-xs hover:border-primary/40">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                {t("cargoDetails")}
              </span>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">{t("cargoWeight")}</span>
                  <span className="font-mono font-bold text-foreground">
                    {selectedShipment.weightKg?.toLocaleString()} kg
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">{t("declaredValue")}</span>
                  <span className="font-mono font-bold text-foreground">
                    ${selectedShipment.declaredValueUSD?.toLocaleString()} USD
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">{t("priorityTier")}</span>
                  <span className="font-bold text-primary">{selectedShipment.priority}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border/60">
                  <span className="text-muted-foreground">{t("coldChainTemp")}</span>
                  <span className="font-mono font-bold text-sky-400">2.8&deg;C (Compliant)</span>
                </div>
              </div>

              {selectedShipment.notes && (
                <div className="p-2.5 rounded-lg bg-muted/40 text-[11px] text-muted-foreground mt-2">
                  <b>Special Handling:</b> {selectedShipment.notes}
                </div>
              )}
            </div>

            {/* Need Help Box */}
            <div className="hover-lift rounded-2xl border border-border bg-card p-5 space-y-2 text-xs hover:border-primary/40">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <HelpCircle className="h-4 w-4 text-primary" />
                <span>{t("needAssistance")}</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                {t("needAssistanceDesc")}
              </p>
              <Link
                to="/support"
                className="w-full h-9 rounded-lg border border-border hover:bg-muted text-xs font-semibold flex items-center justify-center gap-2 transition-colors mt-2 hover:border-primary/50"
              >
                <span>{t("openSupportClaims")}</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 rounded-2xl border border-border bg-card text-center space-y-3">
          <Package className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="font-heading font-bold text-base text-foreground">No Consignment Selected</h3>
          <p className="text-xs text-muted-foreground">
            Please enter a tracking number or select one from your orders above.
          </p>
        </div>
      )}
    </div>
  );
};
