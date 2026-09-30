import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  PlusCircle,
  MapPin,
  Users,
  Shield,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
} from "lucide-react";
import API from "../services/api";
import { useLanguage } from "../context/LanguageContext";

const VEHICLE_TYPES = [
  {
    id: "TWO_WHEELER",
    name: "2-Wheeler Courier",
    capacity: "Up to 20 kg",
    dimensions: "40x40x40 cm",
    baseFare: 15,
    perKm: 1.2,
    icon: "🛵",
    description: "Documents, parcels, food & small medical boxes",
  },
  {
    id: "MINI_TRUCK",
    name: "3-Wheeler / Tata Ace",
    capacity: "Up to 750 kg",
    dimensions: "7x4x5 ft",
    baseFare: 45,
    perKm: 2.1,
    icon: "🛺",
    description: "Appliance delivery, boxes, retail replenishment",
    popular: true,
  },
  {
    id: "PICKUP_8FT",
    name: "Pickup 8ft Truck",
    capacity: "Up to 1,200 kg",
    dimensions: "8.5x4.5x5.5 ft",
    baseFare: 75,
    perKm: 2.8,
    icon: "🚚",
    description: "Furniture, commercial equipment, timber & pallet goods",
  },
  {
    id: "CANTER_14FT",
    name: "Canter 14ft",
    capacity: "Up to 2,500 kg",
    dimensions: "14x6x6.5 ft",
    baseFare: 125,
    perKm: 3.6,
    icon: "🚛",
    description: "Industrial machinery, raw materials, bulk inventory",
  },
  {
    id: "HEAVY_TRUCK",
    name: "Heavy 24ft Freight",
    capacity: "Up to 8,500 kg",
    dimensions: "24x8x8.5 ft",
    baseFare: 220,
    perKm: 5.2,
    icon: "🚛",
    description: "Intermodal port containers, high-capacity haulage",
  },
];

export const CustomerBookDelivery = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLE_TYPES[1]);
  const [originName, setOriginName] = useState("Seattle Harbor Terminal Gate 4");
  const [originAddress, setOriginAddress] = useState("2400 11th Ave SW, Seattle, WA 98134");
  const [destName, setDestName] = useState("Bellevue Tech Square Depot");
  const [destAddress, setDestAddress] = useState("10885 NE 4th St, Bellevue, WA 98004");
  const [estimatedKm, setEstimatedKm] = useState(18.5);
  const [helperCount, setHelperCount] = useState(1);
  const [priority, setPriority] = useState("EXPRESS");
  const [weightKg, setWeightKg] = useState(480);
  const [declaredValue, setDeclaredValue] = useState(12500);
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bookedShipment, setBookedShipment] = useState(null);

  // Pricing formula
  const helperFee = helperCount === 1 ? 25 : helperCount === 2 ? 45 : 0;
  const distanceFee = Math.round(estimatedKm * selectedVehicle.perKm);
  const prioritySurcharge = priority === "EXPRESS" ? 15 : priority === "CRITICAL" ? 35 : 0;
  const subtotal = selectedVehicle.baseFare + distanceFee + helperFee + prioritySurcharge;
  const gst = Math.round(subtotal * 0.085);
  const totalFare = subtotal + gst;

  const handleBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await API.post("/shipments", {
        origin: {
          name: originName,
          address: originAddress,
          latitude: 47.5852,
          longitude: -122.3582,
        },
        destination: {
          name: destName,
          address: destAddress,
          latitude: 47.6185,
          longitude: -122.1952,
        },
        weightKg: Number(weightKg),
        priority,
        declaredValueUSD: Number(declaredValue),
        notes: `Vehicle: ${selectedVehicle.name}. Helpers: ${helperCount}. Notes: ${notes || "None"}`,
      });

      const data = res.data.data;
      setBookedShipment(data);
    } catch (err) {
      alert("Failed to create shipment: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            PORTER-GRADE ON-DEMAND LOGISTICS
          </span>
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1 flex items-center gap-2">
          <PlusCircle className="h-7 w-7 text-primary" />
          {t("bookTitle")}
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          {t("bookSubtitle")}
        </p>
      </div>

      {bookedShipment ? (
        <div className="p-8 rounded-2xl border border-emerald-500/30 bg-card shadow-2xl text-center space-y-5 animate-in zoom-in-95">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
            <CheckCircle2 className="h-9 w-9" />
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase font-bold text-emerald-400">
              {t("bookBookingConfirmed")}
            </span>
            <h2 className="font-heading text-3xl font-extrabold text-foreground font-mono mt-1">
              {bookedShipment.trackingNumber}
            </h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
              Your Porter freight order has been accepted. A nearby {selectedVehicle.name} driver is being dispatched to {originName}.
            </p>
          </div>

          {/* OTP Box */}
          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 max-w-sm mx-auto space-y-1">
            <span className="text-[10px] font-bold uppercase text-muted-foreground">
              {t("deliveryOtpLabel")}
            </span>
            <div className="font-mono text-2xl font-black text-primary">
              {bookedShipment.deliveryOtp || "4829"}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {t("bookOtpNotice")}
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/track-order?id=${bookedShipment.trackingNumber}`)}
              className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
            >
              {t("bookBtnTrackLive")} &rarr;
            </button>
            <button
              onClick={() => {
                setBookedShipment(null);
              }}
              className="px-5 py-2.5 rounded-xl border border-border hover:bg-muted font-semibold text-xs text-foreground transition-colors"
            >
              {t("bookBtnAnother")}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Vehicle & Address Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Vehicle Category Selector */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">1</span>
                  {t("bookStep1")}
                </span>
                <span className="text-[11px] text-muted-foreground">5 Options Available</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {VEHICLE_TYPES.map((veh) => (
                  <div
                    key={veh.id}
                    onClick={() => setSelectedVehicle(veh)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all relative hover-lift ${
                      selectedVehicle.id === veh.id
                        ? "border-primary bg-primary/10 shadow-md ring-1 ring-primary/40"
                        : "border-border bg-background hover:bg-muted/40 hover:border-primary/40"
                    }`}
                  >
                    {veh.popular && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Most Popular
                      </span>
                    )}
                    <div className="flex items-start gap-3">
                      <span className="text-2xl transition-transform group-hover:scale-110">{veh.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs text-foreground truncate">{veh.name}</div>
                        <div className="text-[10px] text-primary font-mono font-semibold">{veh.capacity}</div>
                        <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">{veh.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Pickup & Drop Locations */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">2</span>
                  {t("bookStep2")}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">Distance: {estimatedKm} km</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold mb-1 text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                    {t("bookPickupTerminal")}
                  </label>
                  <input
                    type="text"
                    required
                    value={originName}
                    onChange={(e) => setOriginName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Full street address..."
                    value={originAddress}
                    onChange={(e) => setOriginAddress(e.target.value)}
                    className="w-full h-8 px-3 rounded-lg border border-input bg-background/50 focus:ring-1 focus:ring-primary focus:outline-none text-[11px] mt-1 text-muted-foreground"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-foreground flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-rose-500" />
                    {t("bookDropoffDest")}
                  </label>
                  <input
                    type="text"
                    required
                    value={destName}
                    onChange={(e) => setDestName(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Full street address..."
                    value={destAddress}
                    onChange={(e) => setDestAddress(e.target.value)}
                    className="w-full h-8 px-3 rounded-lg border border-input bg-background/50 focus:ring-1 focus:ring-primary focus:outline-none text-[11px] mt-1 text-muted-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Porter Helper & Cargo Details */}
            <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="font-heading font-bold text-sm text-foreground flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-bold">3</span>
                  {t("bookStep3")}
                </span>
              </div>

              {/* Helper Selector */}
              <div className="space-y-2 text-xs">
                <span className="text-muted-foreground font-medium block">
                  {t("bookHelperPrompt")}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setHelperCount(0)}
                    className={`p-3 rounded-xl border text-center transition-all hover-lift cursor-pointer ${
                      helperCount === 0
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/40"
                    }`}
                  >
                    <div>{t("bookSolo")}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{t("bookSoloDesc")}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHelperCount(1)}
                    className={`p-3 rounded-xl border text-center transition-all hover-lift cursor-pointer ${
                      helperCount === 1
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/40"
                    }`}
                  >
                    <div>{t("bookPlus1")}</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">{t("bookPlus1Desc")}</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHelperCount(2)}
                    className={`p-3 rounded-xl border text-center transition-all hover-lift cursor-pointer ${
                      helperCount === 2
                        ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                        : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-primary/40"
                    }`}
                  >
                    <div>{t("bookPlus2")}</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">{t("bookPlus2Desc")}</div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <label className="block font-semibold mb-1">Cargo Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Priority Tier</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="STANDARD">Standard Service</option>
                    <option value="EXPRESS">Express Priority (+ $15)</option>
                    <option value="CRITICAL">Critical Direct Route (+ $35)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Transparent Price Breakdown & Booking Card */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-primary/30 bg-card p-5 space-y-4 shadow-lg sticky top-20">
              <span className="text-[10px] uppercase font-bold tracking-wider text-primary">
                {t("bookFareBreakdown")}
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground">{t("bookVehicleBaseFare")} ({selectedVehicle.name}):</span>
                  <span className="font-mono font-bold">${selectedVehicle.baseFare}.00</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground">{t("bookDistanceCharge")} ({estimatedKm} km):</span>
                  <span className="font-mono font-bold">${distanceFee}.00</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground">{t("bookHelperLaborCharge")}:</span>
                  <span className="font-mono font-bold text-emerald-400">
                    {helperFee > 0 ? `+$${helperFee}.00` : "$0.00"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground">{t("bookPrioritySurcharge")}:</span>
                  <span className="font-mono font-bold">
                    {prioritySurcharge > 0 ? `+$${prioritySurcharge}.00` : "$0.00"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/60">
                  <span className="text-muted-foreground">{t("bookTaxSurcharge")}:</span>
                  <span className="font-mono font-bold">${gst}.00</span>
                </div>

                <div className="pt-2 flex justify-between items-center text-sm font-bold text-foreground">
                  <span>{t("bookTotalEstimated")}</span>
                  <span className="text-xl font-mono text-primary font-extrabold">${totalFare}.00</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-devfest w-full h-11 text-xs tracking-wide flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg"
              >
                {submitting ? (
                  <span>Allocating Driver...</span>
                ) : (
                  <>
                    <span className="font-extrabold">{t("bookBtnConfirm")} &bull; ${totalFare}.00</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5] transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <div className="text-[10px] text-center text-muted-foreground pt-1">
                {t("bookFreeCancellation")}
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
