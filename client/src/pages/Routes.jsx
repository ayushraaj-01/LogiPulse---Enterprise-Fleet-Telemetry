import React, { useState } from "react";
import {
  Route as RouteIcon,
  MapPin,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
  Plus,
  Trash2,
  Navigation,
  Compass,
  Zap,
} from "lucide-react";
import { RealMap } from "../components/RealMap";

export const Routes = () => {
  const [stops, setStops] = useState([
    {
      id: 1,
      name: "Seattle Harbor Depot (Origin)",
      address: "2400 11th Ave SW, Seattle, WA",
      coords: [47.5852, -122.3582],
      distance: "0 km",
      eta: "09:00 AM",
    },
    {
      id: 2,
      name: "Bellevue Commercial Center",
      address: "12000 NE 12th St, Bellevue, WA",
      coords: [47.6205, -122.1804],
      distance: "18.4 km",
      eta: "09:35 AM",
    },
    {
      id: 3,
      name: "Kirkland Medical Plaza",
      address: "11521 124th Ave NE, Kirkland, WA",
      coords: [47.7022, -122.1764],
      distance: "12.8 km",
      eta: "10:15 AM",
    },
    {
      id: 4,
      name: "Redmond Technology Campus",
      address: "15255 NE 90th St, Redmond, WA",
      coords: [47.6812, -122.1245],
      distance: "9.2 km",
      eta: "10:50 AM",
    },
  ]);
  const [optimized, setOptimized] = useState(false);
  const [newStop, setNewStop] = useState("");

  const handleOptimize = () => {
    // Re-order simulation for TSP shortest path
    setStops([...stops].reverse());
    setOptimized(true);
  };

  const handleAddStop = () => {
    if (!newStop) return;
    setStops([
      ...stops,
      {
        id: Date.now(),
        name: newStop,
        address: `${newStop}, Greater Seattle, WA`,
        coords: [47.65 + (Math.random() - 0.5) * 0.08, -122.25 + (Math.random() - 0.5) * 0.08],
        distance: "14.5 km",
        eta: "11:30 AM",
      },
    ]);
    setNewStop("");
    setOptimized(false);
  };

  const handleRemoveStop = (id) => {
    setStops(stops.filter((s) => s.id !== id));
  };

  // Route Polyline connecting all sequential stops
  const routePolyline = stops.map((s) => s.coords);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <RouteIcon className="h-6 w-6 text-primary" />
            Multi-Stop Route Planner & Optimizer
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Traveling Salesperson (TSP) heuristic algorithm solving multi-depot waypoints with live traffic avoidance on real road maps.
          </p>
        </div>

        <button
          onClick={handleOptimize}
          className="btn-devfest flex items-center gap-2 px-4 py-2.5 text-xs shadow-md self-start sm:self-auto cursor-pointer"
        >
          <Sparkles className="h-4 w-4" />
          <span>Run TSP Route Optimization</span>
        </button>
      </div>

      {optimized && (
        <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span>Route optimized! Reduced mileage by 18.2% and estimated driving duration by 24 minutes.</span>
          </span>
          <span className="font-mono font-bold">Total: 40.4 km &bull; 1h 48m</span>
        </div>
      )}

      {/* REAL MAP DISPLAY FOR ROUTE PLANNER */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            <h2 className="font-heading text-sm font-bold text-foreground">
              Geospatial Corridor Preview ({stops.length} Waypoints)
            </h2>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">
            Interactive OpenStreetMap & Satellite
          </span>
        </div>

        <div className="h-80 sm:h-96 rounded-xl overflow-hidden border border-border shadow-inner relative">
          <RealMap
            center={[47.63, -122.25]}
            zoom={11}
            showGeofences={true}
            initialTile="streets"
            interactiveControls={true}
            height="100%"
            originPin={{
              lat: stops[0]?.coords[0] || 47.5852,
              lng: stops[0]?.coords[1] || -122.3582,
              name: stops[0]?.name || "Route Start",
              address: stops[0]?.address,
            }}
            destinationPin={{
              lat: stops[stops.length - 1]?.coords[0] || 47.6812,
              lng: stops[stops.length - 1]?.coords[1] || -122.1245,
              name: stops[stops.length - 1]?.name || "Route End",
              address: stops[stops.length - 1]?.address,
            }}
            routePolyline={routePolyline}
            vehicles={[
              {
                _id: "route-veh",
                licensePlate: "WA-FLT-104",
                make: "Freightliner",
                model: "Cascadia",
                type: "HEAVY_TRUCK",
                status: "IN_TRANSIT",
                currentLocation: {
                  latitude: stops[1]?.coords[0] || 47.6205,
                  longitude: stops[1]?.coords[1] || -122.1804,
                  speedKmh: 58,
                  headingDeg: 45,
                },
                assignedDriver: { name: "Marcus Ray" },
              },
            ]}
          />
        </div>
      </div>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stops List */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <h2 className="font-heading text-sm font-bold text-foreground">
              Sequential Delivery Waypoints ({stops.length})
            </h2>
            <span className="text-[11px] text-muted-foreground">Order of execution</span>
          </div>

          <div className="space-y-3">
            {stops.map((stop, index) => (
              <div
                key={stop.id}
                className="p-3.5 rounded-xl border border-border bg-background flex items-center justify-between text-xs hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold font-mono text-xs flex items-center justify-center border border-primary/20 shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-bold text-foreground">{stop.name}</div>
                    <div className="text-[11px] text-muted-foreground">{stop.address}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right text-[11px]">
                    <div className="font-mono font-bold text-primary">{stop.distance}</div>
                    <div className="text-muted-foreground">{stop.eta}</div>
                  </div>
                  <button
                    onClick={() => handleRemoveStop(stop.id)}
                    className="p-1 rounded text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    title="Remove stop"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Stop Input */}
          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Add facility or destination stop..."
              value={newStop}
              onChange={(e) => setNewStop(e.target.value)}
              className="flex-1 h-9 px-3 rounded-lg border border-input bg-background text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            />
            <button
              onClick={handleAddStop}
              className="px-3.5 rounded-lg border border-border bg-card hover:bg-muted text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Stop</span>
            </button>
          </div>
        </div>

        {/* Route Summary */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="font-heading text-sm font-bold text-foreground pb-2 border-b border-border">
            Route Constraints & Metrics
          </h2>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Assigned Vehicle:</span>
              <span className="font-semibold text-foreground">WA-FLT-104 (Freightliner)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Driver:</span>
              <span className="font-semibold text-foreground">Marcus Ray</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Toll Roads:</span>
              <span className="text-emerald-400 font-semibold">Avoided via Policy</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/50">
              <span className="text-muted-foreground">Estimated Fuel:</span>
              <span className="font-mono font-semibold">18.4 Liters Diesel</span>
            </div>
          </div>

          <button
            onClick={() => alert("Route manifest successfully transmitted to driver's in-cab terminal.")}
            className="w-full h-10 mt-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-colors"
          >
            Transmit Manifest to Driver App
          </button>
        </div>
      </div>
    </div>
  );
};
