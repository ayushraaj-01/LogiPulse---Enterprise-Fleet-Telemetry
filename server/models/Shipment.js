const mongoose = require("mongoose");

const ShipmentSchema = new mongoose.Schema(
  {
    trackingNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedDriver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    assignedVehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      default: null,
    },
    status: {
      type: String,
      enum: [
        "DRAFT",
        "UNASSIGNED",
        "DISPATCHED",
        "AT_PICKUP",
        "IN_TRANSIT",
        "OUT_FOR_DELIVERY",
        "DELIVERED",
        "NOT_DELIVERED",
        "FAILED",
        "CANCELLED",
      ],
      default: "UNASSIGNED",
    },
    priority: {
      type: String,
      enum: ["STANDARD", "EXPRESS", "CRITICAL"],
      default: "STANDARD",
    },
    origin: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    destination: {
      name: { type: String, required: true },
      address: { type: String, required: true },
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    scheduledPickup: { type: Date, required: true },
    scheduledDelivery: { type: Date, required: true },
    actualDeliveredAt: { type: Date, default: null },
    estimatedDistanceKm: { type: Number, default: 45 },
    estimatedDurationMinutes: { type: Number, default: 50 },
    weightKg: { type: Number, required: true },
    volumeCbm: { type: Number, default: 1.2 },
    declaredValueUSD: { type: Number, default: 500 },
    notes: { type: String, default: "" },

    // Porter-style operational options
    deliveryOtp: { type: String, default: "4829" },
    helperRequired: { type: Boolean, default: false },
    helperCount: { type: Number, default: 0 },
    failureReason: { type: String, default: "" },
    driverNotes: { type: String, default: "" },

    // Electronic Proof of Delivery (e-POD)
    proofOfDelivery: {
      recipientName: { type: String, default: "" },
      signatureUrl: { type: String, default: "" },
      photoUrl: { type: String, default: "" },
      signedAt: { type: Date, default: null },
      notes: { type: String, default: "" },
    },
    timeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        description: { type: String, required: true },
        location: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Shipment", ShipmentSchema);
