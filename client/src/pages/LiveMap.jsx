import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import {
  Truck,
  MapPin,
  Radio,
  Compass,
  Gauge,
  Fuel,
  User,
  Shield,
  Search,
  Filter,
  RefreshCw,
  Phone,
  Layers,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import API from "../services/api";
import { StatusBadge } from "../components/StatusBadge";
import { RealMap } from "../components/RealMap";

const FALLBACK_VEHICLES = [
  {
    _id: "veh-1",
    licensePlate: "WA-FLT-101",
    make: "Freightliner",
    model: "Cascadia EV",
    type: "HEAVY_TRUCK",
    status: "IN_TRANSIT",
    fuelLevelPercent: 88,
    currentLocation: {
      latitude: 47.6062,
      longitude: -122.3321,
      speedKmh: 62,
      headingDeg: 340,
    },
    assignedDriver: { name: "Marcus Ray", phone: "+1 (206) 555-0192" },
  },
  {
    _id: "veh-2",
    licensePlate: "WA-FLT-102",
    make: "Volvo",
    model: "VNR Electric",
    type: "HEAVY_TRUCK",
    status: "IN_TRANSIT",
    fuelLevelPercent: 94,
    currentLocation: {
      latitude: 47.6812,
      longitude: -122.1245,
      speedKmh: 48,
      headingDeg: 90,
    },
    assignedDriver: { name: "Sarah Jenkins", phone: "+1 (206) 555-0144" },
  },
  {
    _id: "veh-3",
    licensePlate: "WA-VAN-201",
    make: "Ford",
    model: "E-Transit 350",
    type: "SPRINTER_VAN",
    status: "IDLE",
    fuelLevelPercent: 76,
    currentLocation: {
      latitude: 47.5852,
      longitude: -122.3582,
      speedKmh: 0,
      headingDeg: 180,
    },
    assignedDriver: { name: "David Kim", phone: "+1 (206) 555-0188" },
  },
  {
    _id: "veh-4",
    licensePlate: "WA-FLT-104",
    make: "Kenworth",
    model: "T680 NextGen",
    type: "HEAVY_TRUCK",
    status: "IN_TRANSIT",
    fuelLevelPercent: 82,
    currentLocation: {
      latitude: 47.2562,
      longitude: -122.4215,
      speedKmh: 71,
      headingDeg: 15,
    },
    assignedDriver: { name: "Elena Rostova", phone: "+1 (206) 555-0112" },
  },
];

export const LiveMap = () => {
  const [vehicles, setVehicles] = useState(FALLBACK_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState(FALLBACK_VEHICLES[0]);
  const [filterType, setFilterType] = useState("ALL");
  const [search, setSearch] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  // Initialize Socket.io connection for live GPS streaming
  useEffect(() => {
    // Initial fetch from REST API
    const fetchVehicles = async () => {
      try {
        const res = await API.get("/vehicles");
        const list = res.data.data;
        if (list && list.length > 0) {
          setVehicles(list);
          setSelectedVehicle(list[0]);
        }
      } catch (err) {
        console.warn("Using offline telemetry vehicles:", err);
      }
    };
    fetchVehicles();

    // Connect to WebSocket server on port 5050
    const socket = io("http://localhost:5050");

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("REQUEST_FLEET_SYNC");
    });

    socket.on("FLEET_TELEMETRY_UPDATE", (updatedList) => {
      setVehicles(updatedList);
      // Keep selected vehicle updated if matches
      setSelectedVehicle((prev) => {
        if (!prev) return updatedList[0];
        const current = updatedList.find((v) => v._id === prev._id);
        return current || prev;
      });
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    return () => socket.disconnect();
  }, []);

  const filteredVehicles = vehicles.filter((v) => {
    const matchType = filterType === "ALL" || v.type === filterType;
    const matchSearch =
      v.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.model.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="h-[calc(100vh-7rem)] flex flex-col lg:flex-row gap-4 overflow-hidden">
      {/* LEFT: Fleet List & Search Controls */}
      <div className="w-full lg:w-80 flex flex-col rounded-xl border border-border bg-card p-4 space-y-4 shrink-0 overflow-hidden">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Live Fleet Stream
            </h2>
            <span
              className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                socketConnected
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-500 border-amber-500/30"
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${socketConnected ? "bg-emerald-400 animate-ping" : "bg-amber-400"}`} />
              {socketConnected ? "STREAM ACTIVE" : "CONNECTING"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {filteredVehicles.length} of {vehicles.length} assets visible
          </p>
        </div>

        {/* Search & Filter */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search plate, model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-input bg-background text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex gap-1 overflow-x-auto pb-1">
            {["ALL", "HEAVY_TRUCK", "CARGO_VAN", "BOX_TRUCK", "MOTORCYCLE"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 transition-colors ${
                  filterType === t
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Vehicle Card List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredVehicles.map((v) => (
            <div
              key={v._id}
              onClick={() => setSelectedVehicle(v)}
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                selectedVehicle?._id === v._id
                  ? "border-primary bg-primary/10 shadow-xs"
                  : "border-border hover:bg-muted/50 bg-card"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-foreground">{v.licensePlate}</span>
                <StatusBadge status={v.status} />
              </div>
              <div className="text-[11px] text-muted-foreground mt-1 font-medium">
                {v.make} {v.model}
              </div>
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1 font-mono text-emerald-400 font-semibold">
                  <Gauge className="h-3 w-3" />
                  {v.currentLocation?.speedKmh || 0} km/h
                </span>
                <span className="flex items-center gap-1">
                  <Compass className="h-3 w-3" />
                  {v.currentLocation?.headingDeg || 0}°
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Fuel className="h-3 w-3 text-amber-500" />
                  {v.fuelLevelPercent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER: Real Leaflet Interactive Geospatial Map Canvas */}
      <div className="flex-1 flex flex-col rounded-xl border border-border bg-card relative overflow-hidden shadow-inner">
        {/* Map Header Overlay */}
        <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
          <div className="px-3 py-1.5 rounded-lg border border-white/15 bg-black/80 backdrop-blur-md text-xs text-white font-mono flex items-center gap-2 shadow-xl">
            <Radio className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
            <span>REAL-TIME SEATTLE GPS TELEMETRY &bull; LEAFLET ENGINE</span>
          </div>
        </div>

        {/* Real Leaflet Map */}
        <div className="w-full h-full relative z-10">
          <RealMap
            vehicles={filteredVehicles}
            selectedVehicle={selectedVehicle}
            onSelectVehicle={setSelectedVehicle}
            center={[47.6101, -122.3328]}
            zoom={12}
            showGeofences={true}
          />
        </div>
      </div>

      {/* RIGHT: Selected Vehicle Telemetry Dossier */}
      {selectedVehicle && (
        <div className="w-full lg:w-80 rounded-xl border border-border bg-card p-5 flex flex-col justify-between shrink-0 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">Asset Dossier</span>
                <h3 className="font-heading text-lg font-bold text-foreground">
                  {selectedVehicle.licensePlate}
                </h3>
              </div>
              <StatusBadge status={selectedVehicle.status} />
            </div>

            {/* Vehicle Specs */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Make & Model:</span>
                <span className="font-semibold text-foreground">
                  {selectedVehicle.make} {selectedVehicle.model}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">VIN:</span>
                <span className="font-mono text-muted-foreground text-[11px]">{selectedVehicle.vin}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Payload Capacity:</span>
                <span className="font-semibold">{selectedVehicle.payloadCapacityKg.toLocaleString()} kg</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Current Odometer:</span>
                <span className="font-mono font-semibold">{selectedVehicle.currentOdometerKm.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border/50">
                <span className="text-muted-foreground">Current Location:</span>
                <span className="font-medium text-right max-w-[150px] truncate">
                  {selectedVehicle.currentLocation?.address || "Seattle Metro Corridor"}
                </span>
              </div>
            </div>

            {/* Assigned Driver Box */}
            <div className="p-3 rounded-xl border border-border bg-muted/40 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Assigned Operator
              </span>
              <div className="flex items-center gap-2.5">
                <img
                  src={selectedVehicle.assignedDriver?.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"}
                  alt="Driver"
                  className="h-9 w-9 rounded-full object-cover border border-primary/30"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">
                    {selectedVehicle.assignedDriver?.name || "Marcus Ray"}
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    {selectedVehicle.assignedDriver?.phone || "+1 (555) 100-2003"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-2 pt-3 border-t border-border">
            <button
              onClick={() => {
                alert(`Direct route command sent to ${selectedVehicle.licensePlate}`);
              }}
              className="w-full h-9 rounded-lg bg-primary text-primary-foreground font-semibold text-xs shadow-xs hover:bg-primary/90 transition-colors"
            >
              Dispatch Navigation Waypoint
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
