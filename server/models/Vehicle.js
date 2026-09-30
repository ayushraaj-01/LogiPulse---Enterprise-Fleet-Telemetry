const mongoose = require("mongoose");

const VehicleSchema = new mongoose.Schema(
  {
    vin: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    licensePlate: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    make: { type: String, required: true },
    model: { type: String, required: true },
    year: { type: Number, required: true },
    type: {
      type: String,
      enum: ["HEAVY_TRUCK", "BOX_TRUCK", "CARGO_VAN", "MOTORCYCLE"],
      default: "BOX_TRUCK",
    },
    fuelType: {
      type: String,
      enum: ["DIESEL", "PETROL", "ELECTRIC", "HYBRID"],
      default: "DIESEL",
    },
    payloadCapacityKg: { type: Number, required: true },
    currentOdometerKm: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["ACTIVE", "IN_TRANSIT", "IDLE", "MAINTENANCE", "OUT_OF_SERVICE"],
      default: "ACTIVE",
    },
    currentLocation: {
      latitude: { type: Number, default: 47.6062 },
      longitude: { type: Number, default: -122.3321 },
      speedKmh: { type: Number, default: 0 },
      headingDeg: { type: Number, default: 0 },
      lastUpdated: { type: Date, default: Date.now },
      address: { type: String, default: "Seattle Central Terminal" },
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    fuelLevelPercent: { type: Number, default: 85 },
    insuranceExpiry: { type: Date, required: true },
    permitExpiry: { type: Date, required: true },
    depotName: { type: String, default: "Pacific Northwest Hub" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Vehicle", VehicleSchema);
