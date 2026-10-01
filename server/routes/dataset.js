const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { loadAndSeedDataset, readDatasetFile } = require("../seed/datasetLoader");
const Shipment = require("../models/Shipment");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");

// @route   GET /api/dataset/info
// @desc    Get dataset metadata, statistics, and Kaggle supply chain attributes
// @access  Public
router.get("/info", async (req, res) => {
  try {
    const metadata = readDatasetFile("dataset_metadata.json");
    const shipmentsCount = await Shipment.countDocuments();
    const vehiclesCount = await Vehicle.countDocuments();
    const driversCount = await Driver.countDocuments();

    res.json({
      success: true,
      metadata,
      stats: {
        activeShipments: shipmentsCount,
        activeVehicles: vehiclesCount,
        verifiedDrivers: driversCount,
        status: "LIVE_DATASET_CONNECTED",
      },
    });
  } catch (err) {
    console.error("[Dataset API] Error fetching metadata:", err);
    res.status(500).json({ success: false, message: "Failed to load dataset metadata." });
  }
});

// @route   POST /api/dataset/reload
// @desc    Re-seed or synchronize database from the Kaggle DataCo dataset
// @access  Public
router.post("/reload", async (req, res) => {
  try {
    const result = await loadAndSeedDataset();
    res.json({
      success: true,
      message: "Database successfully re-synchronized from Kaggle DataCo Supply Chain dataset!",
      result,
    });
  } catch (err) {
    console.error("[Dataset API] Error reloading dataset:", err);
    res.status(500).json({ success: false, message: "Dataset synchronization failed." });
  }
});

module.exports = router;
