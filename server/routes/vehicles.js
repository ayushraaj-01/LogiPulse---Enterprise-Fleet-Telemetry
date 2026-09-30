const express = require("express");
const router = express.Router();
const Vehicle = require("../models/Vehicle");
const { protect, authorize } = require("../middleware/auth");

// @route   GET /api/vehicles
// @desc    Get all vehicles with optional filters
router.get("/", protect, async (req, res) => {
  try {
    const { status, type, search } = req.query;
    let query = {};

    if (status && status !== "ALL") query.status = status;
    if (type && type !== "ALL") query.type = type;
    if (search) {
      query.$or = [
        { licensePlate: new RegExp(search, "i") },
        { vin: new RegExp(search, "i") },
        { make: new RegExp(search, "i") },
        { model: new RegExp(search, "i") },
      ];
    }

    const vehicles = await Vehicle.find(query)
      .populate("assignedDriver", "name email phone avatar")
      .sort({ updatedAt: -1 });

    res.json({ success: true, count: vehicles.length, data: vehicles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/vehicles/:id
// @desc    Get single vehicle details
router.get("/:id", protect, async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id).populate(
      "assignedDriver",
      "name email phone avatar"
    );
    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }
    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/vehicles
// @desc    Create new vehicle dossier
router.post("/", protect, authorize("ADMIN", "DISPATCHER"), async (req, res) => {
  try {
    const vehicle = await Vehicle.create(req.body);
    res.status(201).json({ success: true, data: vehicle });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/vehicles/:id/location
// @desc    Update vehicle live coordinates (telemetry ping)
router.patch("/:id/location", protect, async (req, res) => {
  try {
    const { latitude, longitude, speedKmh, headingDeg, address } = req.body;
    const vehicle = await Vehicle.findById(req.params.id);

    if (!vehicle) {
      return res.status(404).json({ success: false, message: "Vehicle not found" });
    }

    vehicle.currentLocation = {
      latitude,
      longitude,
      speedKmh: speedKmh !== undefined ? speedKmh : vehicle.currentLocation.speedKmh,
      headingDeg: headingDeg !== undefined ? headingDeg : vehicle.currentLocation.headingDeg,
      address: address || vehicle.currentLocation.address,
      lastUpdated: new Date(),
    };

    if (speedKmh > 5) {
      vehicle.status = "IN_TRANSIT";
    } else if (speedKmh <= 5 && vehicle.status === "IN_TRANSIT") {
      vehicle.status = "IDLE";
    }

    await vehicle.save();
    res.json({ success: true, data: vehicle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
