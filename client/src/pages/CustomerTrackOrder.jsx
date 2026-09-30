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

// Highway corridor builder for tracking
const buildHighwayCorridor = (origin, destination) => {
  const oLat = origin?.latitude || 47.5852;
  const oLng = origin?.longitude || -122.3582;
  const dLat = destination?.latitude || 47.6812;
  const dLng = destination?.longitude || -122.1245;

  return [
    [oLat, oLng],
    [oLat + (dLat - oLat) * 0.15, oLng + (dLng - oLng) * 0.1],
    [47.598, -122.332],
    [47.615, -122.33],
    [47.64, -122.308],
    [47.642, -122.25],
    [47.643, -122.19],
    [47.665, -122.145],
    [dLat, dLng],
  ];
};

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
    const initialVeh = selectedShipment.assignedVehicle || {
      _id: "cust-veh",
      licensePlate: "WA-FLT-104",
      make: "Freightliner",
      model: "Cascadia",
      type: "HEAVY_TRUCK",
      status: selectedShipment.status,
      currentLocation: {
        latitude: corridor[4][0],
        longitude: corridor[4][1],
        speedKmh: 62,
        headingDeg: 78,
      },
      assignedDriver: selectedShipment.assignedDriver || { name: "Marcus Ray", phone: "+1 (555) 100-2003" },
    };
    setLiveVehicle(initialVeh);

    // Gently glide vehicle along corridor
    let stepIndex = 4;
    const interval = setInterval(() => {
      stepIndex = (stepIndex + 1) % corridor.length;
      const pt = corridor[stepIndex];
      const nextPt = corridor[(stepIndex + 1) % corridor.length];
      const dLng = nextPt[1] - pt[1];
      const dLat = nextPt[0] - pt[0];
      const heading = Math.round((Math.atan2(dLng, dLat) * 180) / Math.PI + 360) % 360;

      setLiveVehicle((prev) => ({
        ...prev,
        currentLocation: {
          latitude: pt[0],
          longitude: pt[1],
          speedKmh: Math.floor(52 + Math.random() * 18),
          headingDeg: heading,
          address: "WA-520 Freight Corridor Eastbound",
        },
      }));
    }, 4000);

    return () => clearInterval(interval);
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
                    ((selectedShipment.origin?.latitude || 47.5852) +
                      (selectedShipment.destination?.latitude || 47.6812)) /
                      2,
                    ((selectedShipment.origin?.longitude || -122.3582) +
                      (selectedShipment.destination?.longitude || -122.1245)) /
                      2,
                  ]}
                  zoom={11}
                  showGeofences={false}
                  initialTile="streets"
                  interactiveControls={true}
                  height="100%"
                  originPin={{
                    lat: selectedShipment.origin?.latitude || 47.5852,
                    lng: selectedShipment.origin?.longitude || -122.3582,
                    name: selectedShipment.origin?.name || "Origin Terminal",
                    address: selectedShipment.origin?.address,
                  }}
                  destinationPin={{
                    lat: selectedShipment.destination?.latitude || 47.6812,
                    lng: selectedShipment.destination?.longitude || -122.1245,
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
                    {selectedShipment.assignedDriver?.name || "Marcus Ray"}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Carrier Partner &bull; <span className="text-amber-400 font-bold">★ 4.92 Rating</span>
                  </div>
                  <div className="text-[11px] font-mono text-primary font-semibold mt-0.5">
                    {selectedShipment.assignedVehicle?.licensePlate || "WA-FLT-104"} ({selectedShipment.assignedVehicle?.make || "Freightliner"})
                  </div>
                </div>
              </div>

              {/* Call Driver Action */}
              <a
                href={`tel:${selectedShipment.assignedDriver?.phone || "+15551002003"}`}
                className="btn-devfest w-full h-11 text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <Phone className="h-4 w-4 stroke-[2.5]" />
                <span>{t("callDriver")}: {selectedShipment.assignedDriver?.phone || "+1 (555) 100-2003"}</span>
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
