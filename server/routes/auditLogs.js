const express = require("express");
const router = express.Router();
const AuditLog = require("../models/AuditLog");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, authorize("ADMIN"), async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, count: logs.length, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
