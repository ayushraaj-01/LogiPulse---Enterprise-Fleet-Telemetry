import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Shield,
  Star,
  ArrowRight,
  ExternalLink,
  Navigation,
  Compass,
  Gauge,
  Thermometer,
  Radio,
  Search,
  KeyRound,
  Users,
} from "lucide-react";
import API from "../services/api";
import { RealMap } from "../components/RealMap";
import { LogiPulseLogo } from "../components/LogiPulseLogo";
import { useLanguage } from "../context/LanguageContext";
import { buildHighwayCorridor } from "../utils/geoCorridor";
import io from "socket.io-client";

// Predefined sample tracking IDs from Kaggle DataCo Supply Chain Dataset
const SAMPLE_ORDERS = [
  { id: "TRK-2026-98124", label: "Noida SEZ → Gurugram (Semiconductors)", status: "IN_TRANSIT" },
  { id: "TRK-2026-98119", label: "IGI Airport → AIIMS (Cold Chain Kits)", status: "AT_PICKUP" },
  { id: "TRK-2026-98075", label: "JNPT Mumbai → Chakan Pune (Machinery)", status: "DELIVERED" },
  { id: "TRK-2026-98150", label: "Whitefield → Sriperumbudur (Servers)", status: "UNASSIGNED" },
  { id: "TRK-2026-10492", label: "Sanand → Sitapura Jaipur (Solar Inverters)", status: "IN_TRANSIT" },
];

export const PublicTrack = () => {
  const { trackingNumber } = useParams();
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [liveVehicle, setLiveVehicle] = useState(null);
  const [corridor, setCorridor] = useState([]);

  useEffect(() => {
    const fetchTracking = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await API.get(`/shipments/track/${trackingNumber}`);
        const data = res.data.data;
        setShipment(data);

        // Generate highway corridor
        const routePoints = buildHighwayCorridor(data.origin, data.destination);
        setCorridor(routePoints);

        // Initialize vehicle position based on status
        const originLat = Number(data.origin?.latitude) || 28.5355;
        const originLng = Number(data.origin?.longitude) || 77.391;
        const destLat = Number(data.destination?.latitude) || 28.4952;
        const destLng = Number(data.destination?.longitude) || 77.0892;

        let initialLat = routePoints.length > 5 ? routePoints[5][0] : originLat;
        let initialLng = routePoints.length > 5 ? routePoints[5][1] : originLng;
        let initialSpeed = 58;
        let initialHeading = 75;
        let initialAddress = `${data.origin?.name || "Origin"} → ${data.destination?.name || "Destination"} Freight Corridor`;

        if (data.status === "DELIVERED") {
          initialLat = destLat;
          initialLng = destLng;
          initialSpeed = 0;
          initialHeading = 0;
          initialAddress = `${data.destination?.name || "Destination Hub"}, ${data.destination?.address || ""}`;
        } else if (data.status === "AT_PICKUP" || data.status === "UNASSIGNED") {
          initialLat = originLat;
          initialLng = originLng;
          initialSpeed = 0;
          initialHeading = 0;
          initialAddress = `${data.origin?.name || "Origin Terminal"}, ${data.origin?.address || ""}`;
        } else if (data.assignedVehicle?.currentLocation?.latitude) {
          initialLat = data.assignedVehicle.currentLocation.latitude;
          initialLng = data.assignedVehicle.currentLocation.longitude;
          initialSpeed = data.assignedVehicle.currentLocation.speedKmh || 58;
          initialHeading = data.assignedVehicle.currentLocation.headingDeg || 75;
          if (data.assignedVehicle.currentLocation.address) {
            initialAddress = data.assignedVehicle.currentLocation.address;
          }
        }

        const defaultVehicle = {
          _id: data.assignedVehicle?._id || "trk-veh-live",
          licensePlate: data.assignedVehicle?.licensePlate || "DL-01-AA-4091",
          make: data.assignedVehicle?.make || "Tata Motors",
          model: data.assignedVehicle?.model || "Signa 4825.T Heavy Multi-Axle",
          type: data.assignedVehicle?.type || "HEAVY_TRUCK",
          status: data.status,
          currentLocation: {
            latitude: initialLat,
            longitude: initialLng,
            speedKmh: initialSpeed,
            headingDeg: initialHeading,
            address: initialAddress,
          },
          assignedDriver: data.assignedDriver || { name: "Rajesh Kumar", phone: "+91 98112-40912" },
        };
        setLiveVehicle(defaultVehicle);
      } catch (err) {
        setError("Consignment tracking record not found. Please verify the tracking number.");
      } finally {
        setLoading(false);
      }
    };

    if (trackingNumber) {
      fetchTracking();
    }
  }, [trackingNumber]);

  // Gentle live vehicle GPS movement animation along the corridor with live WebSocket sync
  useEffect(() => {
    if (!corridor || corridor.length < 2 || !liveVehicle) return;
    if (shipment?.status === "DELIVERED" || shipment?.status === "NOT_DELIVERED" || shipment?.status === "UNASSIGNED") return;

    // Connect to WebSocket server for live telemetry updates
    const socketUrl = import.meta.env.VITE_API_URL || "http://localhost:5050";
    let socket;
    try {
      socket = io(socketUrl);
      socket.on("FLEET_TELEMETRY_UPDATE", (updatedVehicles) => {
        if (shipment?.assignedVehicle?._id) {
          const match = updatedVehicles.find((v) => v._id === shipment.assignedVehicle._id);
          if (match && match.currentLocation?.latitude) {
            setLiveVehicle((prev) => ({
              ...prev,
              ...match,
              currentLocation: {
                ...match.currentLocation,
                address: match.currentLocation.address || prev?.currentLocation?.address,
              },
            }));
          }
        }
      });
    } catch (e) {}

    let stepIndex = Math.min(4, Math.floor(corridor.length / 2));
    let forward = true;
    const interval = setInterval(() => {
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
          speedKmh: Math.floor(54 + Math.random() * 16),
          headingDeg: heading,
          address: prev?.currentLocation?.address || "Active Highway Transit Corridor",
        },
      }));
    }, 3800);

    return () => {
      clearInterval(interval);
      if (socket) socket.disconnect();
    };
  }, [corridor, shipment]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground space-y-4 font-mono text-xs">
        <div className="h-10 w-10 border-3 border-primary border-t-transparent rounded-full animate-spin" />
        <div>Connecting to GPS Satellite Telemetry Uplink...</div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground text-center space-y-5">
        <AlertCircle className="h-12 w-12 text-rose-500" />
        <h2 className="text-2xl font-bold font-heading">Tracking Record Not Found</h2>
        <p className="text-xs text-muted-foreground max-w-sm">{error}</p>

        {/* Quick Sample Selectors */}
        <div className="p-4 rounded-xl border border-border bg-card max-w-md w-full text-left space-y-2 text-xs">
          <span className="text-[10px] uppercase font-bold text-muted-foreground block">
            Try active live demonstration tracking numbers:
          </span>
          {SAMPLE_ORDERS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => navigate(`/track/${sample.id}`)}
              className="w-full flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors font-mono"
            >
              <span className="font-bold text-primary">{sample.id}</span>
              <span className="text-[10px] text-muted-foreground">{sample.label}</span>
            </button>
          ))}
        </div>

        <Link to="/login" className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold">
          Return to Portal Login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground py-8 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-border gap-3">
          <div className="flex items-center gap-3">
            <LogiPulseLogo
              size="md"
              subtitle={t("brandSubtitle")}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLanguage}
              className="flex items-center p-0.5 rounded-full border border-border bg-card shadow-xs text-xs font-semibold transition-all hover:bg-muted"
              title={language === "en" ? "हिंदी में बदलें (Switch to Hindi)" : "Switch to English"}
            >
              <span
                className={`px-2.5 py-1 rounded-full transition-all text-[11px] font-bold ${
                  language === "en"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                EN
              </span>
              <span
                className={`px-2.5 py-1 rounded-full transition-all text-[11px] font-bold ${
                  language === "hi"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                हिंदी
              </span>
            </button>

            <Link
              to="/login"
              className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-semibold text-foreground transition-colors"
            >
              {t("loginSignInLink")}
            </Link>
          </div>
        </div>

        {/* Quick Sample Switcher Bar */}
        <div className="p-2.5 rounded-xl border border-border bg-card/60 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground shrink-0 px-1">
            Track Other Consignments:
          </span>
          {SAMPLE_ORDERS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => navigate(`/track/${sample.id}`)}
              className={`hover-lift px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold shrink-0 transition-all cursor-pointer ${
                sample.id === shipment.trackingNumber
                  ? "bg-primary text-primary-foreground shadow-sm ring-1 ring-primary/40"
                  : "bg-muted text-muted-foreground hover:text-foreground hover:border-primary/40"
              }`}
            >
              {sample.id}
            </button>
          ))}
        </div>

        {/* Hero Card: Tracking Number & Real Road Map */}
        <div className="p-6 rounded-2xl border border-primary/30 bg-card shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">
                COMMERCIAL FREIGHT CONSIGNMENT
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-foreground font-mono mt-0.5">
                {shipment.trackingNumber}
              </h1>
            </div>

            <span className="px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 self-start sm:self-auto flex items-center gap-1.5 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              {shipment.status.replace("_", " ")}
            </span>
          </div>

          {/* Porter Consignee Delivery OTP & Helper Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-xs font-mono font-bold flex items-center gap-2 text-primary">
              <KeyRound className="h-3.5 w-3.5" />
              <span>DELIVERY OTP: <b>{shipment.deliveryOtp || "4829"}</b></span>
              <span className="text-[9px] font-normal text-muted-foreground">(Share with driver at dropoff)</span>
            </div>

            <div className="px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-xs font-semibold flex items-center gap-1.5 text-foreground">
              <Users className="h-3.5 w-3.5 text-emerald-400" />
              <span>{shipment.helperCount ? `+${shipment.helperCount} Helper Included` : "Driver Solo Delivery"}</span>
            </div>
          </div>

          {/* Dynamic Traffic-Adjusted Countdown Banner OR Not Delivered Alert */}
          {shipment.status === "NOT_DELIVERED" ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-500 flex items-center justify-center shrink-0">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-[11px] text-rose-400 uppercase font-bold tracking-wider">
                    Delivery Exception Reported
                  </div>
                  <div className="text-base font-bold text-rose-500 mt-0.5">
                    Not Delivered &bull; {shipment.failureReason || "Consignee unavailable / Gate closed"}
                  </div>
                  {shipment.driverNotes && (
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Driver Note: {shipment.driverNotes}
                    </div>
                  )}
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <span className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-400 font-mono text-[11px] font-bold">
                  CARGO SAFE AT DEPOT
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gradient-to-r from-primary/15 via-primary/10 to-transparent border border-primary/25 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider">
                    Real-Time Traffic-Adjusted ETA
                  </div>
                  <div className="text-xl font-bold font-mono text-primary mt-0.5">
                    {shipment.status === "DELIVERED"
                      ? "Safely Delivered at Destination Hub"
                      : "Approx. 18 minutes remaining (ETA 10:48 AM)"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-left sm:text-right">
                  <div className="text-[10px] text-muted-foreground">CARGO SEAL</div>
                  <div className="font-bold text-emerald-400">VERIFIED #9482</div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-[10px] text-muted-foreground">TEMPERATURE</div>
                  <div className="font-bold text-sky-400 font-mono">2.8&deg;C (REEFER)</div>
                </div>
              </div>
            </div>
          )}

          {/* REAL ROAD MAP COMPONENT */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground flex items-center gap-1.5">
                  <Navigation className="h-4 w-4 text-primary" />
                  Live Highway Corridor Map
                </span>
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  (Click markers for live vehicle telemetry)
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <Radio className="h-3 w-3 animate-pulse text-emerald-400" />
                12 Satellites In Lock
              </span>
            </div>

            {/* Map Container */}
            <div className="rounded-xl border border-border overflow-hidden shadow-2xl relative h-[420px]">
              <RealMap
                center={[
                  ((shipment.origin?.latitude || 28.5355) + (shipment.destination?.latitude || 28.4952)) / 2,
                  ((shipment.origin?.longitude || 77.391) + (shipment.destination?.longitude || 77.0892)) / 2,
                ]}
                zoom={12}
                showGeofences={true}
                initialTile="streets"
                interactiveControls={true}
                height="100%"
                originPin={{
                  lat: shipment.origin?.latitude || 28.5355,
                  lng: shipment.origin?.longitude || 77.391,
                  name: shipment.origin?.name || "Origin Terminal",
                  address: shipment.origin?.address,
                }}
                destinationPin={{
                  lat: shipment.destination?.latitude || 28.4952,
                  lng: shipment.destination?.longitude || 77.0892,
                  name: shipment.destination?.name || "Destination Center",
                  address: shipment.destination?.address,
                }}
                routePolyline={corridor}
                vehicles={liveVehicle ? [liveVehicle] : []}
                selectedVehicle={liveVehicle}
              />
            </div>
          </div>

          {/* Live Telemetry Sensor Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
            <div className="hover-lift p-3 rounded-xl bg-muted/40 border border-border/60 hover:border-primary/40">
              <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Gauge className="h-3 w-3 text-primary" />
                Vehicle Speed
              </div>
              <div className="text-base font-bold font-mono text-foreground mt-1">
                {liveVehicle?.currentLocation?.speedKmh || 64} km/h
              </div>
            </div>

            <div className="hover-lift p-3 rounded-xl bg-muted/40 border border-border/60 hover:border-primary/40">
              <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Compass className="h-3 w-3 text-emerald-400" />
                Heading Angle
              </div>
              <div className="text-base font-bold font-mono text-foreground mt-1">
                {liveVehicle?.currentLocation?.headingDeg || 78}&deg; ENE
              </div>
            </div>

            <div className="hover-lift p-3 rounded-xl bg-muted/40 border border-border/60 hover:border-primary/40">
              <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Truck className="h-3 w-3 text-amber-500" />
                Assigned Asset
              </div>
              <div className="text-sm font-bold font-mono text-foreground mt-1 truncate">
                {liveVehicle?.licensePlate || "WA-FLT-104"}
              </div>
            </div>

            <div className="hover-lift p-3 rounded-xl bg-muted/40 border border-border/60 hover:border-primary/40">
              <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3 text-sky-400" />
                Operator
              </div>
              <div className="text-sm font-semibold text-foreground mt-1 truncate">
                {shipment.assignedDriver?.name || "Marcus Ray"}
              </div>
            </div>
          </div>

          {/* Origin & Destination Route Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
            <div className="hover-lift p-4 rounded-xl bg-muted/30 border border-border hover:border-emerald-500/40">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                  Origin Terminal
                </span>
              </div>
              <div className="font-bold text-foreground text-sm mt-2">{shipment.origin?.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{shipment.origin?.address}</div>
            </div>

            <div className="hover-lift p-4 rounded-xl bg-muted/30 border border-border hover:border-rose-500/40">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider">
                  Consignee Destination
                </span>
              </div>
              <div className="font-bold text-foreground text-sm mt-2">{shipment.destination?.name}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{shipment.destination?.address}</div>
            </div>
          </div>
        </div>

        {/* Animated Delivery Stepper Timeline */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-4">
          <h2 className="font-heading font-bold text-sm text-foreground">Delivery Milestone Lifecycle</h2>
          <div className="space-y-4">
            {shipment.timeline?.map((step, index) => (
              <div key={index} className="flex items-start gap-3 text-xs relative">
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

        {/* Real Review & Delivery Experience Form */}
        <div className="p-6 rounded-2xl border border-border bg-card space-y-3 text-xs">
          <h2 className="font-heading font-bold text-sm text-foreground">Verified Consignee Delivery Rating</h2>
          <p className="text-muted-foreground text-[11px]">
            LogiPulse displays only real, verified reviews submitted directly by consignees upon receipt.
          </p>

          {!reviewSubmitted ? (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground font-semibold">Rate Delivery Experience:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-110 transition-transform"
                  >
                    <Star className={`h-5 w-5 ${star <= rating ? "fill-current" : ""}`} />
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setReviewSubmitted(true)}
                className="btn-devfest px-6 py-2.5 text-xs shadow-md cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Submit Verified Feedback</span>
              </button>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                Thank you! Your verified rating of {rating} stars has been recorded to driver {shipment.assignedDriver?.name || "Rajesh Kumar"}'s safety scorecard.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
