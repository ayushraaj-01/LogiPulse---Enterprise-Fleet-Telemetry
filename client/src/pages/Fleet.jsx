import React, { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  Search,
  Filter,
  Fuel,
  Gauge,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";
import API from "../services/api";
import { StatusBadge } from "../components/StatusBadge";

export const Fleet = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  // New Vehicle State
  const [vin, setVin] = useState("1FT8W3BT9NED99014");
  const [plate, setPlate] = useState("WA-FLT-109");
  const [make, setMake] = useState("Kenworth");
  const [model, setModel] = useState("T680 Next Gen");
  const [year, setYear] = useState(2024);
  const [type, setType] = useState("HEAVY_TRUCK");
  const [payloadKg, setPayloadKg] = useState(24000);

  const fetchVehicles = async () => {
    try {
      const res = await API.get("/vehicles");
      setVehicles(res.data.data || []);
    } catch (err) {
      console.error("Error loading vehicles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    try {
      await API.post("/vehicles", {
        vin,
        licensePlate: plate,
        make,
        model,
        year: Number(year),
        type,
        payloadCapacityKg: Number(payloadKg),
        insuranceExpiry: new Date("2027-06-30"),
        permitExpiry: new Date("2027-05-15"),
        currentOdometerKm: 12400,
        fuelLevelPercent: 95,
      });
      setModalOpen(false);
      fetchVehicles();
    } catch (err) {
      alert("Failed to add vehicle: " + (err.response?.data?.message || err.message));
    }
  };

  const filtered = vehicles.filter(
    (v) =>
      v.licensePlate.toLowerCase().includes(search.toLowerCase()) ||
      v.make.toLowerCase().includes(search.toLowerCase()) ||
      v.vin.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            Fleet Asset Registry & Telemetry
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Commercial vehicle dossiers, regulatory document expiration tracking, and asset health.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-xs shadow-md shadow-primary/20 hover:bg-primary/90 transition-all self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Register Asset</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search plate, VIN, make..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg border border-input bg-background text-xs focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="py-3 px-4">License Plate</th>
                <th className="py-3 px-4">Make & Model</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Odometer</th>
                <th className="py-3 px-4">Fuel</th>
                <th className="py-3 px-4">Document Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((v) => {
                const permitDate = new Date(v.permitExpiry);
                const isExpiringSoon = (permitDate - new Date()) / (1000 * 3600 * 24) < 30;

                return (
                  <tr key={v._id} className="hover:bg-muted/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      {v.licensePlate}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-foreground">{v.make} {v.model}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">{v.vin}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-muted text-muted-foreground">
                        {v.type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold">
                      {v.currentOdometerKm.toLocaleString()} km
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <span className="flex items-center gap-1.5 text-foreground">
                        <Fuel className="h-3.5 w-3.5 text-amber-500" />
                        {v.fuelLevelPercent}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {isExpiringSoon ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <AlertTriangle className="h-3 w-3" />
                          Permit Due Soon
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          Valid &bull; {permitDate.toLocaleDateString()}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD VEHICLE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-heading text-lg font-bold text-foreground">Register Fleet Asset</h3>
              <button onClick={() => setModalOpen(false)} className="p-1 rounded hover:bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-3">
              <div>
                <label className="block font-semibold mb-1">License Plate</label>
                <input
                  type="text"
                  required
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  className="w-full h-8 px-3 rounded-lg border border-input bg-background font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Vehicle Identification Number (VIN)</label>
                <input
                  type="text"
                  required
                  value={vin}
                  onChange={(e) => setVin(e.target.value)}
                  className="w-full h-8 px-3 rounded-lg border border-input bg-background font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Make</label>
                  <input
                    type="text"
                    required
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full h-8 px-3 rounded-lg border border-input bg-background"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Model</label>
                  <input
                    type="text"
                    required
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full h-8 px-3 rounded-lg border border-input bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Vehicle Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full h-8 px-2 rounded-lg border border-input bg-background"
                  >
                    <option value="HEAVY_TRUCK">Heavy Truck</option>
                    <option value="CARGO_VAN">Cargo Van</option>
                    <option value="BOX_TRUCK">Box Truck</option>
                    <option value="MOTORCYCLE">Motorcycle</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Payload (kg)</label>
                  <input
                    type="number"
                    value={payloadKg}
                    onChange={(e) => setPayloadKg(e.target.value)}
                    className="w-full h-8 px-3 rounded-lg border border-input bg-background font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg border border-input hover:bg-muted font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-primary text-primary-foreground font-semibold shadow-xs"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
