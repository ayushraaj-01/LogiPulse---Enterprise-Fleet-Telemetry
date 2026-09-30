const express = require("express");
const router = express.Router();
const Maintenance = require("../models/Maintenance");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, async (req, res) => {
  try {
    const records = await Maintenance.find()
      .populate("vehicle", "make model licensePlate type currentOdometerKm")
      .sort({ serviceDate: -1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/", protect, authorize("ADMIN", "DISPATCHER"), async (req, res) => {
  try {
    const record = await Maintenance.create(req.body);
    res.status(201).json({ success: true, data: record });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
