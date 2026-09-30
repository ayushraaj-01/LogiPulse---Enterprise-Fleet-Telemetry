const mongoose = require("mongoose");

const MaintenanceSchema = new mongoose.Schema(
  {
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },
    type: {
      type: String,
      enum: ["PREVENTIVE", "CORRECTIVE", "INSPECTION", "EMERGENCY"],
      default: "PREVENTIVE",
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    serviceDate: { type: Date, required: true },
    odometerKm: { type: Number, required: true },
    costUSD: { type: Number, required: true },
    technicianName: { type: String, default: "Apex Diesel Solutions" },
    status: {
      type: String,
      enum: ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "SCHEDULED",
    },
    nextDueDate: { type: Date, default: null },
    nextDueOdometerKm: { type: Number, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Maintenance", MaintenanceSchema);
