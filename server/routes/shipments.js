const express = require("express");
const router = express.Router();
const Shipment = require("../models/Shipment");
const AuditLog = require("../models/AuditLog");
const { protect, authorize } = require("../middleware/auth");

// @route   GET /api/shipments/track/:trackingNumber
// @desc    Public unauthenticated endpoint for tracking portal (Checklist Item 5.3)
router.get("/track/:trackingNumber", async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      trackingNumber: req.params.trackingNumber.toUpperCase(),
    })
      .populate("assignedDriver", "name phone avatar")
      .populate("assignedVehicle", "make model licensePlate type currentLocation");

    if (!shipment) {
      return res.status(404).json({ success: false, message: "Tracking number not found" });
    }

    res.json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/shipments
// @desc    Get all shipments with role-aware filtering
router.get("/", protect, async (req, res) => {
  try {
    const { status, priority, search } = req.query;
    let query = {};

    // Customer only sees their shipments, Driver only sees assigned
    if (req.user.role === "CUSTOMER") {
      query.customer = req.user._id;
    } else if (req.user.role === "DRIVER") {
      query.assignedDriver = req.user._id;
    }

    if (status && status !== "ALL") query.status = status;
    if (priority && priority !== "ALL") query.priority = priority;
    if (search) {
      query.$or = [
        { trackingNumber: new RegExp(search, "i") },
        { "origin.name": new RegExp(search, "i") },
        { "destination.name": new RegExp(search, "i") },
      ];
    }

    const shipments = await Shipment.find(query)
      .populate("customer", "name email phone company")
      .populate("assignedDriver", "name email phone avatar")
      .populate("assignedVehicle", "make model licensePlate type status currentLocation")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: shipments.length, data: shipments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/shipments/:id
// @desc    Get single shipment
router.get("/:id", protect, async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate("customer", "name email phone company")
      .populate("assignedDriver", "name email phone avatar")
      .populate("assignedVehicle", "make model licensePlate type currentLocation status");

    if (!shipment) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    res.json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/shipments
// @desc    Create new shipment
router.post("/", protect, async (req, res) => {
  try {
    const dateStr = new Date().getFullYear();
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const trackingNumber = `TRK-${dateStr}-${randomSuffix}`;

    const shipmentData = {
      ...req.body,
      trackingNumber,
      customer: req.user.role === "CUSTOMER" ? req.user._id : req.body.customer || req.user._id,
      timeline: [
        {
          status: "UNASSIGNED",
          description: "Order booked and shipment record initialized",
          location: req.body.origin ? req.body.origin.name : "Origin Terminal",
        },
      ],
    };

    const shipment = await Shipment.create(shipmentData);

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: "SHIPMENT_CREATED",
      entity: "Shipment",
      entityId: shipment._id.toString(),
      details: `Created shipment ${trackingNumber}`,
      ipAddress: req.ip || "127.0.0.1",
    });

    res.status(201).json({ success: true, data: shipment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/shipments/:id/status
// @desc    Update shipment status & record timeline event
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status, note, location } = req.body;
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    shipment.status = status;
    shipment.timeline.push({
      status,
      timestamp: new Date(),
      description: note || `Shipment transitioned to ${status}`,
      location: location || "",
    });

    if (status === "DELIVERED") {
      shipment.actualDeliveredAt = new Date();
    }

    await shipment.save();

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: `SHIPMENT_STATUS_${status}`,
      entity: "Shipment",
      entityId: shipment._id.toString(),
      details: `Status updated to ${status}`,
      ipAddress: req.ip || "127.0.0.1",
    });

    res.json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/shipments/:id/assign
// @desc    Assign vehicle and driver to shipment
router.patch("/:id/assign", protect, authorize("ADMIN", "DISPATCHER"), async (req, res) => {
  try {
    const { driverId, vehicleId } = req.body;
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    shipment.assignedDriver = driverId || shipment.assignedDriver;
    shipment.assignedVehicle = vehicleId || shipment.assignedVehicle;
    if (shipment.status === "UNASSIGNED") {
      shipment.status = "DISPATCHED";
      shipment.timeline.push({
        status: "DISPATCHED",
        timestamp: new Date(),
        description: "Assigned to driver and vehicle for dispatch",
        location: shipment.origin.name,
      });
    }

    await shipment.save();
    res.json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/shipments/:id/pod
// @desc    Submit electronic Proof of Delivery (Signature + Photo)
router.post("/:id/pod", protect, async (req, res) => {
  try {
    const { recipientName, signatureUrl, photoUrl, notes } = req.body;
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    shipment.proofOfDelivery = {
      recipientName,
      signatureUrl,
      photoUrl,
      signedAt: new Date(),
      notes: notes || "Delivered in good condition",
    };
    shipment.status = "DELIVERED";
    shipment.actualDeliveredAt = new Date();
    shipment.timeline.push({
      status: "DELIVERED",
      timestamp: new Date(),
      description: `Signed for by ${recipientName} (e-POD verified)`,
      location: shipment.destination.name,
    });

    await shipment.save();

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: "POD_SUBMITTED",
      entity: "Shipment",
      entityId: shipment._id.toString(),
      details: `e-POD captured for ${shipment.trackingNumber}`,
      ipAddress: req.ip || "127.0.0.1",
    });

    res.json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/shipments/:id/not-delivered
// @desc    Mark shipment as NOT DELIVERED with operational reason (Porter-style exception)
router.post("/:id/not-delivered", protect, async (req, res) => {
  try {
    const { failureReason, driverNotes } = req.body;
    const shipment = await Shipment.findById(req.params.id);

    if (!shipment) {
      return res.status(404).json({ success: false, message: "Shipment not found" });
    }

    shipment.status = "NOT_DELIVERED";
    shipment.failureReason = failureReason || "Consignee unavailable / delivery failed";
    shipment.driverNotes = driverNotes || "";
    shipment.timeline.push({
      status: "NOT_DELIVERED",
      timestamp: new Date(),
      description: `Delivery Failed: ${shipment.failureReason}. ${driverNotes ? `Notes: ${driverNotes}` : ""}`,
      location: shipment.destination.name,
    });

    await shipment.save();

    await AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      userRole: req.user.role,
      action: "SHIPMENT_NOT_DELIVERED",
      entity: "Shipment",
      entityId: shipment._id.toString(),
      details: `Shipment marked NOT_DELIVERED: ${shipment.failureReason}`,
      ipAddress: req.ip || "127.0.0.1",
    });

    res.json({ success: true, data: shipment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
