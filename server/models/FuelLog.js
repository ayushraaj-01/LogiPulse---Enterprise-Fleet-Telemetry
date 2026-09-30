const mongoose = require("mongoose");

const FuelLogSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fueledAt: { type: Date, default: Date.now },
    volumeLiters: { type: Number, required: true },
    costUSD: { type: Number, required: true },
    odometerKm: { type: Number, required: true },
    stationName: { type: String, default: "Shell Fleet Express #402" },
    fuelType: { type: String, default: "Ultra-Low Sulfur Diesel" },
    costPerKm: { type: Number, default: 0.62 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FuelLog", FuelLogSchema);
