import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Plus,
  Search,
  Filter,
  ArrowRight,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  User,
  X,
  Radio,
  ExternalLink,
  Maximize2,
  Navigation,
} from "lucide-react";
import API from "../services/api";
import { StatusBadge } from "../components/StatusBadge";
import { RealMap } from "../components/RealMap";
import { useAuth } from "../context/AuthContext";

// Corridor builder for the modal
const getShipmentCorridor = (s) => {
  const oLat = s?.origin?.latitude || 47.5852;
  const oLng = s?.origin?.longitude || -122.3582;
  const dLat = s?.destination?.latitude || 47.6812;
  const dLng = s?.destination?.longitude || -122.1245;

  return [
    [oLat, oLng],
    [oLat + (dLat - oLat) * 0.2, oLng + (dLng - oLng) * 0.15],
    [47.6150, -122.3300], // Downtown Seattle
    [47.6400, -122.3080], // Montlake / WA-520
    [47.6420, -122.2500], // Floating Bridge
    [47.6550, -122.1650], // Bellevue / Redmond
    [dLat, dLng],
  ];
};

export const Shipments = () => {
  const { user } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [trackingModalShipment, setTrackingModalShipment] = useState(null);

  // New Shipment Form State
  const [newOrigin, setNewOrigin] = useState("Tacoma Port Gate 2, WA");
  const [newDestination, setNewDestination] = useState("Olympia Distribution Hub, WA");
  const [newWeight, setNewWeight] = useState(4200);
  const [newPriority, setNewPriority] = useState("EXPRESS");
  const [newDeclaredValue, setNewDeclaredValue] = useState(25000);
  const [submitting, setSubmitting] = useState(false);

  const fetchShipments = async () => {
    try {
      const res = await API.get("/shipments");
      setShipments(res.data.data || []);
    } catch (err) {
      console.error("Error loading shipments", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post("/shipments", {
        origin: {
          name: newOrigin,
          address: newOrigin,
          latitude: 47.2529,
          longitude: -122.4443,
        },
        destination: {
          name: newDestination,
          address: newDestination,
          latitude: 47.0379,
          longitude: -122.9007,
        },
        weightKg: Number(newWeight),
        volumeCbm: 8.5,
        priority: newPriority,
        declaredValueUSD: Number(newDeclaredValue),
        scheduledPickup: new Date(),
        scheduledDelivery: new Date(Date.now() + 3600 * 1000 * 5),
      });
      setModalOpen(false);
      fetchShipments();
    } catch (err) {
      alert("Failed to create shipment: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = shipments.filter((s) => {
    const matchStatus = statusFilter === "ALL" || s.status === statusFilter;
    const matchPriority = priorityFilter === "ALL" || s.priority === priorityFilter;
    const matchSearch =
      s.trackingNumber?.toLowerCase().includes(search.toLowerCase()) ||
      s.origin?.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.destination?.name?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const isCustomer = user?.role === "CUSTOMER";

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            {isCustomer ? "My Consignments & Orders" : "Shipment Operations Management"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isCustomer
              ? "Track active freight consignments live on real road maps, view delivery ETAs, and book new freight."
              : "Real-time shipment lifecycle monitoring, driver allocation, and electronic proof of delivery."}
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Book New Shipment</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl border border-border bg-card flex flex-col md:flex-row items-center gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tracking #, origin, destination..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-xs focus:ring-1 focus:ring-primary focus:outline-none font-mono"
          />
        </div>

        {/* Status Pills */}
        <div className="flex gap-1.5 overflow-x-auto w-full pb-1 md:pb-0">
          {["ALL", "UNASSIGNED", "DISPATCHED", "AT_PICKUP", "IN_TRANSIT", "DELIVERED", "NOT_DELIVERED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {st.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Data Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">Tracking ID</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Origin &rarr; Destination</th>
                <th className="py-3 px-4">Assigned Driver / Fleet</th>
                <th className="py-3 px-4">Weight</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((s) => (
                <tr key={s._id} className="hover:bg-muted/40 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                    <button
                      onClick={() => setTrackingModalShipment(s)}
                      className="text-primary hover:underline flex items-center gap-1.5"
                    >
                      <MapPin className="h-3.5 w-3.5 text-emerald-400" />
                      <span>{s.trackingNumber}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        s.priority === "CRITICAL"
                          ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                          : s.priority === "EXPRESS"
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {s.priority}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-foreground truncate">{s.origin?.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      &rarr; {s.destination?.name}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="text-foreground font-medium">
                      {s.assignedDriver?.name || "Unassigned"}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {s.assignedVehicle?.licensePlate || "No Vehicle"}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium">
                    {s.weightKg?.toLocaleString()} kg
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isCustomer ? (
                        <Link
                          to={`/track-order?id=${s.trackingNumber}`}
                          className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/90 transition-colors shadow-xs"
                        >
                          <Navigation className="h-3.5 w-3.5" />
                          <span>Track Order</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => setTrackingModalShipment(s)}
                          className="px-2.5 py-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          <MapPin className="h-3.5 w-3.5" />
                          <span>Live Corridor</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* INSTANT REAL MAP TRACKING MODAL */}
      {trackingModalShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-4xl rounded-2xl border border-border bg-card p-5 md:p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                  <Navigation className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-heading text-lg font-bold text-foreground font-mono">
                      {trackingModalShipment.trackingNumber}
                    </h3>
                    <StatusBadge status={trackingModalShipment.status} />
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Live Highway Corridor &bull; OpenStreetMap Street & Satellite View
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/track/${trackingModalShipment.trackingNumber}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-lg border border-border hover:bg-muted text-xs font-semibold flex items-center gap-1.5 text-foreground"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-primary" />
                  <span>Open Fullscreen</span>
                </Link>
                <button
                  onClick={() => setTrackingModalShipment(null)}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Real Map Canvas in Modal */}
            <div className="flex-1 min-h-[380px] rounded-xl overflow-hidden border border-border shadow-inner relative">
              <RealMap
                center={[
                  ((trackingModalShipment.origin?.latitude || 47.5852) + (trackingModalShipment.destination?.latitude || 47.6812)) / 2,
                  ((trackingModalShipment.origin?.longitude || -122.3582) + (trackingModalShipment.destination?.longitude || -122.1245)) / 2,
                ]}
                zoom={11}
                showGeofences={true}
                initialTile="streets"
                interactiveControls={true}
                height="100%"
                originPin={{
                  lat: trackingModalShipment.origin?.latitude || 47.5852,
                  lng: trackingModalShipment.origin?.longitude || -122.3582,
                  name: trackingModalShipment.origin?.name || "Origin Terminal",
                  address: trackingModalShipment.origin?.address,
                }}
                destinationPin={{
                  lat: trackingModalShipment.destination?.latitude || 47.6812,
                  lng: trackingModalShipment.destination?.longitude || -122.1245,
                  name: trackingModalShipment.destination?.name || "Destination Center",
                  address: trackingModalShipment.destination?.address,
                }}
                routePolyline={getShipmentCorridor(trackingModalShipment)}
                vehicles={
                  trackingModalShipment.assignedVehicle
                    ? [trackingModalShipment.assignedVehicle]
                    : [
                        {
                          _id: "modal-veh",
                          licensePlate: "WA-FLT-104",
                          make: "Freightliner",
                          model: "Cascadia",
                          type: "HEAVY_TRUCK",
                          status: trackingModalShipment.status,
                          currentLocation: {
                            latitude: 47.642,
                            longitude: -122.25,
                            speedKmh: 64,
                            headingDeg: 78,
                          },
                          assignedDriver: trackingModalShipment.assignedDriver,
                        },
                      ]
                }
              />
            </div>

            {/* Modal Bottom Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-2.5 rounded-lg bg-muted/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Origin</span>
                <div className="font-semibold text-foreground truncate mt-0.5">
                  {trackingModalShipment.origin?.name}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Destination</span>
                <div className="font-semibold text-foreground truncate mt-0.5">
                  {trackingModalShipment.destination?.name}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Driver</span>
                <div className="font-semibold text-foreground truncate mt-0.5">
                  {trackingModalShipment.assignedDriver?.name || "Marcus Ray"}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/40">
                <span className="text-[10px] text-muted-foreground uppercase font-bold">ETA</span>
                <div className="font-semibold font-mono text-emerald-400 truncate mt-0.5">
                  {trackingModalShipment.status === "DELIVERED" ? "Completed" : "Approx. 18 mins"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE SHIPMENT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-heading text-lg font-bold text-foreground flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                Book New Commercial Freight Order
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateShipment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Origin Facility / Terminal</label>
                <input
                  type="text"
                  required
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Destination Facility</label>
                <input
                  type="text"
                  required
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Cargo Weight (kg)</label>
                  <input
                    type="number"
                    required
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full h-9 px-2 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary focus:outline-none"
                  >
                    <option value="STANDARD">Standard</option>
                    <option value="EXPRESS">Express</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Declared Value ($)</label>
                  <input
                    type="number"
                    value={newDeclaredValue}
                    onChange={(e) => setNewDeclaredValue(e.target.value)}
                    className="w-full h-9 px-3 rounded-lg border border-input bg-background focus:ring-1 focus:ring-primary focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-input hover:bg-muted font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 disabled:opacity-50"
                >
                  {submitting ? "Booking..." : "Confirm & Initialize Shipment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
