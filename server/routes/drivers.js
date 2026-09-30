const express = require("express");
const router = express.Router();
const Driver = require("../models/Driver");
const { protect, authorize } = require("../middleware/auth");

// @route   GET /api/drivers
// @desc    Get all drivers with user info and assigned vehicle
router.get("/", protect, async (req, res) => {
  try {
    const drivers = await Driver.find()
      .populate("user", "name email phone avatar company")
      .populate("assignedVehicle", "make model licensePlate type status");
    res.json({ success: true, count: drivers.length, data: drivers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/drivers/:id/status
// @desc    Update driver duty status
router.patch("/:id/status", protect, async (req, res) => {
  try {
    const { status } = req.body;
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ success: false, message: "Driver not found" });
    }
    driver.status = status;
    await driver.save();
    res.json({ success: true, data: driver });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
