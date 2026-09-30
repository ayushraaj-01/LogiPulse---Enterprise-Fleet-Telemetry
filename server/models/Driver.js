const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    licenseNumber: { type: String, required: true, unique: true },
    licenseExpiry: { type: Date, required: true },
    medicalCertExpiry: { type: Date, required: true },
    status: {
      type: String,
      enum: ["AVAILABLE", "ON_DUTY", "DRIVING", "RESTING", "OFF_DUTY"],
      default: "AVAILABLE",
    },
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },
    safetyScore: { type: Number, default: 98.5 },
    totalTrips: { type: Number, default: 240 },
    onTimeRatePercent: { type: Number, default: 99.1 },
    emergencyContact: {
      name: { type: String, default: "Sarah Connor" },
      phone: { type: String, default: "+1 (555) 019-2834" },
      relation: { type: String, default: "Spouse" },
    },
    hoursWorkedToday: { type: Number, default: 4.5 },
    maxDailyHours: { type: Number, default: 8.0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", DriverSchema);
