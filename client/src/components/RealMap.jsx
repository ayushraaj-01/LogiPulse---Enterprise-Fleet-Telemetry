import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import {
  Layers,
  Crosshair,
  Maximize2,
  Navigation,
  Radio,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Truck,
  Eye,
} from "lucide-react";

// Fix default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Full-Color, High-Visibility Map Tile Providers (No Dark Mode)
const TILE_LAYERS = {
  google: {
    name: "Google Streets",
    url: "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
    attribution: '&copy; Google Maps',
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  },
  streets: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
    subdomains: ["a", "b", "c"],
  },
  satellite: {
    name: "Satellite Imagery",
    url: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
    attribution: '&copy; Google / Esri World Imagery',
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"],
  },
};

// Custom SVG vehicle marker generator
const createVehicleIcon = (vehicle, isSelected) => {
  const isMoving = vehicle.status === "IN_TRANSIT" || (vehicle.currentLocation?.speedKmh || 0) > 5;
  const statusColor = isMoving ? "#10b981" : vehicle.status === "IDLE" ? "#f59e0b" : "#2563eb";
  const heading = vehicle.currentLocation?.headingDeg || 0;
  const speed = vehicle.currentLocation?.speedKmh || 0;

  const html = `
    <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
      ${
        isMoving
          ? `<div style="position: absolute; width: 46px; height: 46px; border-radius: 50%; background: ${statusColor}; opacity: 0.3; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
          : ""
      }
      <div style="
        width: 36px;
        height: 36px;
        border-radius: 10px;
        background: ${isSelected ? "#1d4ed8" : "#0f172a"};
        border: 2.5px solid ${statusColor};
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        box-shadow: 0 4px 14px rgba(0,0,0,0.5);
        transform: rotate(${heading}deg);
        transition: transform 0.4s ease-out;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
          <path d="M15 18H9"/>
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
          <circle cx="17" cy="18.5" r="2.5"/>
          <circle cx="7" cy="18.5" r="2.5"/>
        </svg>
      </div>
      <div style="
        position: absolute;
        bottom: -15px;
        left: 50%;
        transform: translateX(-50%);
        background: #0f172a;
        color: #f8fafc;
        font-size: 10px;
        font-weight: 800;
        font-family: monospace;
        padding: 1px 6px;
        border-radius: 4px;
        border: 1px solid rgba(255,255,255,0.3);
        white-space: nowrap;
        pointer-events: none;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      ">
        ${vehicle.licensePlate} ${speed > 0 ? `&bull; ${speed}k` : ""}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "custom-vehicle-marker",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -24],
  });
};

export const RealMap = ({
  vehicles = [],
  selectedVehicle = null,
  onSelectVehicle = () => {},
  center = [47.6101, -122.3328],
  zoom = 12,
  showGeofences = true,
  routePolyline = null,
  originPin = null,
  destinationPin = null,
  initialTile = "google",
  interactiveControls = true,
  height = "100%",
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const currentTileLayerRef = useRef(null);
  const markersRef = useRef({});
  const geofencesRef = useRef([]);
  const polylineRef = useRef(null);
  const originMarkerRef = useRef(null);
  const destMarkerRef = useRef(null);

  const [activeTileType, setActiveTileType] = useState(() => {
    if (initialTile && TILE_LAYERS[initialTile]) return initialTile;
    return "google";
  });
  const [mapReady, setMapReady] = useState(false);

  // Helper to attach tile layer
  const attachTileLayer = useCallback((map, type) => {
    if (!map) return;
    const config = TILE_LAYERS[type] || TILE_LAYERS.google;

    if (currentTileLayerRef.current) {
      try {
        map.removeLayer(currentTileLayerRef.current);
      } catch (e) {}
    }

    const newLayer = L.tileLayer(config.url, {
      maxZoom: config.maxZoom || 19,
      subdomains: config.subdomains || ["a", "b", "c"],
      attribution: config.attribution,
    });

    // Fallback if specific tile layer has network failure
    newLayer.on("tileerror", () => {
      if (type !== "google" && type !== "streets") {
        console.warn(`Tile layer ${type} error, falling back to google streets`);
        attachTileLayer(map, "google");
      }
    });

    newLayer.addTo(map);
    currentTileLayerRef.current = newLayer;
    setActiveTileType(type);
  }, []);

  // Handle Tile Switcher manually from HUD
  const switchTileLayer = useCallback((type) => {
    attachTileLayer(mapInstanceRef.current, type);
  }, [attachTileLayer]);

  // Initialize Map Instance once safely with React StrictMode protection
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    // Destroy any existing map on this container to prevent "Map container is already initialized"
    if (container._leaflet_id) {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (err) {}
        mapInstanceRef.current = null;
      }
      delete container._leaflet_id;
    }

    let map;
    try {
      map = L.map(container, {
        center,
        zoom,
        zoomControl: false,
        attributionControl: true,
      });
    } catch (err) {
      console.warn("Retrying Leaflet initialization after cleaning container ID...", err);
      delete container._leaflet_id;
      try {
        map = L.map(container, {
          center,
          zoom,
          zoomControl: false,
          attributionControl: true,
        });
      } catch (fatalErr) {
        console.error("Leaflet fatal init error:", fatalErr);
        return;
      }
    }

    // Add Zoom Control bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;

    // Attach initial full-color tile layer (Google Streets default)
    const initialType = (initialTile && TILE_LAYERS[initialTile]) ? initialTile : "google";
    attachTileLayer(map, initialType);

    setMapReady(true);

    // Ensure Leaflet recalculates dimensions after layout mounts
    const invalidate = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    const t1 = setTimeout(invalidate, 100);
    const t2 = setTimeout(invalidate, 400);
    const t3 = setTimeout(invalidate, 1000);

    window.addEventListener("resize", invalidate);

    // ResizeObserver to handle fluid container sizing
    let observer;
    if (window.ResizeObserver && container) {
      observer = new ResizeObserver(() => invalidate());
      observer.observe(container);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("resize", invalidate);
      if (observer) observer.disconnect();
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (err) {}
        mapInstanceRef.current = null;
      }
      if (container) {
        delete container._leaflet_id;
      }
      setMapReady(false);
    };
  }, []);

  // Update or render Geofences
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    geofencesRef.current.forEach((g) => {
      try { g.remove(); } catch (e) {}
    });
    geofencesRef.current = [];

    if (!showGeofences) return;

    // Seattle Harbor Terminal Depot
    const harbor = L.circle([47.5852, -122.3582], {
      color: "#10b981",
      fillColor: "#10b981",
      fillOpacity: 0.16,
      radius: 1100,
      dashArray: "6, 8",
      weight: 2,
    }).addTo(map);
    harbor.bindPopup(`
      <div style="font-family:sans-serif; font-size:12px; line-height:1.4;">
        <b style="color:#059669; font-size:13px;">Seattle Harbor Depot #18</b><br/>
        <span>Authorized Gateway • Terminal Gate 4</span>
      </div>
    `);

    // Redmond Advanced Logistics Center
    const redmond = L.circle([47.6812, -122.1245], {
      color: "#2563eb",
      fillColor: "#2563eb",
      fillOpacity: 0.16,
      radius: 1300,
      dashArray: "6, 8",
      weight: 2,
    }).addTo(map);
    redmond.bindPopup(`
      <div style="font-family:sans-serif; font-size:12px; line-height:1.4;">
        <b style="color:#2563eb; font-size:13px;">Redmond Logistics Hub</b><br/>
        <span>Primary Destination Terminal & Dock</span>
      </div>
    `);

    // Tacoma Marine Terminal
    const tacoma = L.circle([47.2562, -122.4215], {
      color: "#f59e0b",
      fillColor: "#f59e0b",
      fillOpacity: 0.14,
      radius: 1600,
      dashArray: "6, 8",
      weight: 2,
    }).addTo(map);
    tacoma.bindPopup(`
      <div style="font-family:sans-serif; font-size:12px; line-height:1.4;">
        <b style="color:#d97706; font-size:13px;">Tacoma Cargo Port</b><br/>
        <span>Intermodal Rail & Ocean Container Yard</span>
      </div>
    `);

    geofencesRef.current = [harbor, redmond, tacoma];
  }, [showGeofences, mapReady]);

  // Update or render Vehicle Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    const currentIds = new Set(vehicles.map((v) => v._id));

    // Remove obsolete markers
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentIds.has(id)) {
        try { markersRef.current[id].remove(); } catch (e) {}
        delete markersRef.current[id];
      }
    });

    // Add or glide existing markers
    vehicles.forEach((v) => {
      const lat = v.currentLocation?.latitude || 47.6062;
      const lng = v.currentLocation?.longitude || -122.3321;
      const isSelected = selectedVehicle?._id === v._id;
      const icon = createVehicleIcon(v, isSelected);

      if (markersRef.current[v._id]) {
        // Smoothly update location & icon
        markersRef.current[v._id].setLatLng([lat, lng]);
        markersRef.current[v._id].setIcon(icon);
      } else {
        const marker = L.marker([lat, lng], { icon })
          .addTo(map)
          .on("click", () => {
            onSelectVehicle(v);
          });

        marker.bindPopup(`
          <div style="font-family: sans-serif; font-size: 12px; color: #0f172a; min-width: 190px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
              <span style="font-weight: 800; font-size: 14px; color: #2563eb; font-family:monospace;">
                ${v.licensePlate}
              </span>
              <span style="font-size:10px; font-weight:700; background:#e0e7ff; color:#3730a3; padding:2px 6px; border-radius:4px;">
                ${v.status || "IN_TRANSIT"}
              </span>
            </div>
            <div style="font-weight: 600; color:#1e293b;">${v.make} ${v.model}</div>
            <div style="color: #64748b; font-size: 11px; margin-bottom: 6px;">${v.type?.replace("_", " ")}</div>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; display: flex; justify-content: space-between; font-family:monospace; font-size:11px;">
              <span>Speed: <b>${v.currentLocation?.speedKmh || 0} km/h</b></span>
              <span>Heading: <b>${v.currentLocation?.headingDeg || 0}&deg;</b></span>
            </div>
            <div style="margin-top: 6px; font-size: 11px; color: #059669; font-weight:600;">
              Driver: ${v.assignedDriver?.name || "Marcus Ray"}
            </div>
          </div>
        `);

        markersRef.current[v._id] = marker;
      }
    });
  }, [vehicles, selectedVehicle, mapReady, onSelectVehicle]);

  // Center on selected vehicle if clicked
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedVehicle || !mapReady) return;

    const lat = selectedVehicle.currentLocation?.latitude;
    const lng = selectedVehicle.currentLocation?.longitude;
    if (lat && lng) {
      map.panTo([lat, lng], { animate: true, duration: 0.8 });
    }
  }, [selectedVehicle, mapReady]);

  // Route Polyline & Origin / Destination Pins
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    if (polylineRef.current) {
      try { polylineRef.current.remove(); } catch (e) {}
      polylineRef.current = null;
    }
    if (originMarkerRef.current) {
      try { originMarkerRef.current.remove(); } catch (e) {}
      originMarkerRef.current = null;
    }
    if (destMarkerRef.current) {
      try { destMarkerRef.current.remove(); } catch (e) {}
      destMarkerRef.current = null;
    }

    if (routePolyline && routePolyline.length > 0) {
      // Glow border line for contrast
      const glowLine = L.polyline(routePolyline, {
        color: "#1e3a8a",
        weight: 9,
        opacity: 0.5,
      }).addTo(map);

      // Core route polyline
      const polyline = L.polyline(routePolyline, {
        color: "#2563eb",
        weight: 5,
        opacity: 0.95,
        smoothFactor: 1,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      polylineRef.current = L.layerGroup([glowLine, polyline]).addTo(map);
      try {
        map.fitBounds(polyline.getBounds(), { padding: [60, 60], maxZoom: 14 });
      } catch (e) {}
    }

    if (originPin) {
      const originIcon = L.divIcon({
        html: `
          <div style="position:relative; width: 36px; height: 36px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:34px; height:34px; border-radius:50%; background:#10b981; opacity:0.35; animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width: 32px; height: 32px; background: #10b981; border: 2.5px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.45);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        `,
        className: "origin-pin",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      originMarkerRef.current = L.marker([originPin.lat, originPin.lng], { icon: originIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif; font-size:12px;">
            <span style="font-size:10px; font-weight:800; color:#059669; text-transform:uppercase;">Origin Dispatch Terminal</span>
            <div style="font-weight:700; color:#0f172a; margin-top:2px;">${originPin.name || "Origin Terminal"}</div>
            ${originPin.address ? `<div style="font-size:11px; color:#64748b;">${originPin.address}</div>` : ""}
          </div>
        `);
    }

    if (destinationPin) {
      const destIcon = L.divIcon({
        html: `
          <div style="position:relative; width: 36px; height: 36px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:34px; height:34px; border-radius:50%; background:#ef4444; opacity:0.35; animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width: 32px; height: 32px; background: #ef4444; border: 2.5px solid white; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.45);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
          </div>
        `,
        className: "dest-pin",
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      destMarkerRef.current = L.marker([destinationPin.lat, destinationPin.lng], { icon: destIcon })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:sans-serif; font-size:12px;">
            <span style="font-size:10px; font-weight:800; color:#dc2626; text-transform:uppercase;">Destination Consignee Hub</span>
            <div style="font-weight:700; color:#0f172a; margin-top:2px;">${destinationPin.name || "Destination Center"}</div>
            ${destinationPin.address ? `<div style="font-size:11px; color:#64748b;">${destinationPin.address}</div>` : ""}
          </div>
        `);
    }
  }, [routePolyline, originPin, destinationPin, mapReady]);

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedVehicle?.currentLocation?.latitude) {
      map.panTo(
        [
          selectedVehicle.currentLocation.latitude,
          selectedVehicle.currentLocation.longitude,
        ],
        { animate: true, duration: 0.8 }
      );
    } else if (polylineRef.current) {
      const bounds = routePolyline ? L.latLngBounds(routePolyline) : null;
      if (bounds) map.fitBounds(bounds, { padding: [60, 60] });
    } else {
      map.setView(center, zoom, { animate: true });
    }
  };

  const handleFitRoute = () => {
    const map = mapInstanceRef.current;
    if (!map || !routePolyline || routePolyline.length === 0) return;
    try {
      map.fitBounds(L.latLngBounds(routePolyline), { padding: [50, 50], animate: true });
    } catch (e) {}
  };

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden shadow-inner bg-slate-100 dark:bg-slate-900 border border-border"
      style={{ height: height || "100%", minHeight: "360px", width: "100%" }}
    >
      {/* Leaflet DOM Node with guaranteed 100% dimensions */}
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ width: "100%", height: "100%", minHeight: "360px" }}
      />

      {/* Floating HUD Controls (Full-Color Bright Maps Only) */}
      {interactiveControls && (
        <div className="absolute top-3 right-3 z-[1000] flex items-center gap-1.5 bg-black/85 backdrop-blur-md p-1.5 rounded-xl border border-white/20 shadow-2xl">
          {/* Tile Switcher Buttons */}
          <button
            type="button"
            onClick={() => switchTileLayer("google")}
            title="Google Maps Standard Road Network"
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              activeTileType === "google"
                ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>📍 Google</span>
          </button>

          <button
            type="button"
            onClick={() => switchTileLayer("streets")}
            title="Real OpenStreetMap (Roads, Street Names, Highways)"
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              activeTileType === "streets"
                ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>🗺️ Streets</span>
          </button>

          <button
            type="button"
            onClick={() => switchTileLayer("satellite")}
            title="Google Satellite Photography"
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all cursor-pointer ${
              activeTileType === "satellite"
                ? "bg-amber-400 text-slate-950 font-black shadow-sm"
                : "text-white/80 hover:text-white hover:bg-white/10"
            }`}
          >
            <span>🛰️ Satellite</span>
          </button>

          <div className="h-4 w-px bg-white/20 mx-0.5" />

          {/* Recenter Action Button */}
          <button
            type="button"
            onClick={handleRecenter}
            title="Re-center on vehicle"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <Crosshair className="h-4 w-4 text-emerald-400" />
          </button>

          {/* Fit Route Bounds Button */}
          {routePolyline && routePolyline.length > 0 && (
            <button
              type="button"
              onClick={handleFitRoute}
              title="Fit entire highway corridor in view"
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Maximize2 className="h-4 w-4 text-sky-400" />
            </button>
          )}
        </div>
      )}

      {/* Floating Active Tile Badge at bottom left */}
      <div className="absolute bottom-3 left-3 z-[1000] pointer-events-none">
        <div className="px-2.5 py-1 rounded-md bg-black/85 backdrop-blur-md border border-white/15 text-[10px] font-mono text-white/90 flex items-center gap-1.5 shadow-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>MAP ENGINE: <b>{TILE_LAYERS[activeTileType]?.name.toUpperCase() || "GOOGLE STREETS"}</b></span>
        </div>
      </div>
    </div>
  );
};
