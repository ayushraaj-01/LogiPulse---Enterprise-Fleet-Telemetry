const express = require("express");
const router = express.Router();
const FuelLog = require("../models/FuelLog");
const { protect } = require("../middleware/auth");

router.get("/", protect, async (req, res) => {
  try {
    const logs = await FuelLog.find()
      .populate("vehicle", "make model licensePlate type")
      .populate("driver", "name email")
      .sort({ fueledAt: -1 });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/", protect, async (req, res) => {
  try {
    const log = await FuelLog.create({
      ...req.body,
      driver: req.body.driver || req.user._id,
    });
    res.status(201).json({ success: true, data: log });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

module.exports = router;
