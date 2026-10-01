const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const Shipment = require("../models/Shipment");
const Maintenance = require("../models/Maintenance");
const FuelLog = require("../models/FuelLog");
const Invoice = require("../models/Invoice");
const AuditLog = require("../models/AuditLog");

const DATA_DIR = path.join(__dirname, "../data");

/**
 * Loads JSON dataset file safely
 */
const readDatasetFile = (filename) => {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Dataset file not found: ${filePath}`);
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
};

/**
 * Main Dataset Ingestion & Seeding Engine
 * Connects to MongoDB, ingests Kaggle DataCo Supply Chain & Telematics datasets,
 * and populates full relational structures.
 */
const loadAndSeedDataset = async () => {
  const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/logipulse";
  
  if (mongoose.connection.readyState === 0) {
    console.log(`[Dataset Engine] Connecting to MongoDB: ${MONGO_URI.split("@")[1] || "Local instance"}...`);
    await mongoose.connect(MONGO_URI);
  }

  console.log("[Dataset Engine] Reading external dataset archives from /server/data...");
  const metadata = readDatasetFile("dataset_metadata.json");
  const vehiclesRaw = readDatasetFile("fleet_vehicles_dataset.json");
  const driversRaw = readDatasetFile("commercial_drivers_dataset.json");
  const shipmentsRaw = readDatasetFile("dataco_supply_chain_dataset.json");

  console.log(`[Dataset Engine] Loaded "${metadata.datasetName}" (v${metadata.version})`);
  console.log(`[Dataset Engine] Records: ${shipmentsRaw.length} Shipments | ${vehiclesRaw.length} Fleet Assets | ${driversRaw.length} Commercial Drivers`);

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Vehicle.deleteMany({}),
    Driver.deleteMany({}),
    Shipment.deleteMany({}),
    Maintenance.deleteMany({}),
    FuelLog.deleteMany({}),
    Invoice.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
  console.log("[Dataset Engine] Cleared legacy tables.");

  // 1. Create System Persona Users (Admin, Dispatcher, Finance, Customer) + Dataset Drivers
  const corePersonas = [
    {
      name: "Arthur Pendelton",
      email: "admin@logipulse.com",
      password: "password123",
      role: "ADMIN",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      phone: "+91 98110-20001",
      company: "LogiPulse India Headquarters (Delhi NCR)",
    },
    {
      name: "Alex Vance",
      email: "dispatcher@logipulse.com",
      password: "password123",
      role: "DISPATCHER",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      phone: "+91 98110-20002",
      company: "National Freight Dispatch Operations (Gurugram)",
    },
    {
      name: "Julian Sterling",
      email: "finance@logipulse.com",
      password: "password123",
      role: "FINANCE",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
      phone: "+91 98110-20005",
      company: "LogiPulse Financial Services India",
    },
    {
      name: "Elena Rostova",
      email: "customer@logipulse.com",
      password: "password123",
      role: "CUSTOMER",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      phone: "+91 98110-20004",
      company: "India Retail & Enterprise Logistics Pvt Ltd",
    },
  ];

  // Map dataset drivers to User records
  const driverUsersToCreate = driversRaw.map((d) => ({
    name: d.name,
    email: d.email,
    password: "password123",
    role: "DRIVER",
    avatar: d.avatar,
    phone: d.phone,
    company: "LogiPulse Verified Fleet Roster",
  }));

  const createdUsers = await User.create([...corePersonas, ...driverUsersToCreate]);
  const adminUser = createdUsers[0];
  const dispatcherUser = createdUsers[1];
  const financeUser = createdUsers[2];
  const customerUser = createdUsers[3];
  const driverUserMap = new Map();

  createdUsers.slice(4).forEach((u, idx) => {
    driverUserMap.set(driversRaw[idx].email, u);
  });
  console.log(`[Dataset Engine] Created ${createdUsers.length} total users (${driverUsersToCreate.length} commercial drivers from dataset).`);

  // 2. Ingest Commercial Fleet Vehicles Dataset
  const vehiclesToCreate = vehiclesRaw.map((v) => {
    // Check if a driver is assigned to this VIN in driver dataset
    const matchedDriver = driversRaw.find((d) => d.vehicleVin === v.vin);
    const assignedUser = matchedDriver ? driverUserMap.get(matchedDriver.email) : null;

    return {
      vin: v.vin,
      licensePlate: v.licensePlate,
      make: v.make,
      model: v.model,
      year: v.year,
      type: v.type,
      fuelType: v.fuelType,
      payloadCapacityKg: v.payloadCapacityKg,
      currentOdometerKm: v.currentOdometerKm,
      status: v.status,
      currentLocation: {
        ...v.currentLocation,
        lastUpdated: new Date(),
      },
      fuelLevelPercent: v.fuelLevelPercent,
      insuranceExpiry: new Date("2027-08-30"),
      permitExpiry: new Date("2027-06-15"),
      depotName: v.depotName,
      assignedDriver: assignedUser ? assignedUser._id : null,
    };
  });

  const createdVehicles = await Vehicle.create(vehiclesToCreate);
  const vehicleVinMap = new Map();
  createdVehicles.forEach((veh) => vehicleVinMap.set(veh.vin, veh));
  console.log(`[Dataset Engine] Ingested ${createdVehicles.length} fleet vehicle dossiers.`);

  // 3. Ingest Commercial Drivers Dossiers
  const driversToCreate = driversRaw.map((d) => {
    const userObj = driverUserMap.get(d.email);
    const assignedVehicle = vehicleVinMap.get(d.vehicleVin);

    return {
      user: userObj._id,
      licenseNumber: d.licenseNumber,
      licenseExpiry: new Date(d.licenseExpiry),
      medicalCertExpiry: new Date(d.medicalCertExpiry),
      status: d.status,
      assignedVehicle: assignedVehicle ? assignedVehicle._id : null,
      safetyScore: d.safetyScore,
      totalTrips: d.totalTrips,
      onTimeRatePercent: d.onTimeRatePercent,
      hoursWorkedToday: (Math.random() * 4 + 2).toFixed(1),
    };
  });

  await Driver.create(driversToCreate);
  console.log(`[Dataset Engine] Ingested ${driversToCreate.length} verified driver credential profiles.`);

  // 4. Ingest Kaggle DataCo Supply Chain Shipments Dataset
  const defaultDriver = createdUsers.find((u) => u.role === "DRIVER") || createdUsers[4];
  const defaultVehicle = createdVehicles[0];

  const shipmentsToCreate = shipmentsRaw.map((s, idx) => {
    // Distribute among created vehicles and drivers
    const vehicle = createdVehicles[idx % createdVehicles.length];
    const driver = vehicle.assignedDriver
      ? createdUsers.find((u) => u._id.equals(vehicle.assignedDriver))
      : defaultDriver;

    const now = Date.now();
    const scheduledPickup = new Date(now - 3600 * 1000 * (idx * 4 + 2));
    const scheduledDelivery = new Date(now + 3600 * 1000 * (idx * 2 + 3));

    return {
      trackingNumber: s.trackingNumber,
      customer: customerUser._id,
      assignedDriver: driver ? driver._id : defaultDriver._id,
      assignedVehicle: vehicle ? vehicle._id : defaultVehicle._id,
      status: s.deliveryStatus,
      priority: s.priority || "STANDARD",
      origin: s.origin,
      destination: s.destination,
      scheduledPickup,
      scheduledDelivery,
      actualDeliveredAt: s.deliveryStatus === "DELIVERED" ? new Date(now - 3600 * 1000) : null,
      estimatedDistanceKm: s.estimatedDistanceKm,
      estimatedDurationMinutes: s.estimatedDurationMinutes,
      weightKg: s.weightKg,
      volumeCbm: s.volumeCbm,
      declaredValueUSD: s.declaredValueUSD,
      notes: `[Kaggle DataCo: ${s.shippingMode} | Cat: ${s.productCategory}] - ${s.notes}`,
      deliveryOtp: s.deliveryOtp || "4829",
      helperRequired: s.helperRequired || false,
      helperCount: s.helperCount || 0,
      proofOfDelivery: s.deliveryStatus === "DELIVERED" ? {
        recipientName: "Authorized Warehouse Lead",
        signedAt: new Date(now - 3600 * 1000),
        signatureUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80",
        notes: "Inspected and sealed without damage.",
      } : {},
      timeline: [
        {
          status: "ORDER_REGISTERED",
          timestamp: new Date(now - 3600 * 1000 * 8),
          description: `Consignment registered via ${s.shippingMode} channel. Order Ref: ${s.orderId}`,
          location: s.origin.name,
        },
        {
          status: "PICKUP_COMPLETED",
          timestamp: new Date(now - 3600 * 1000 * 4),
          description: "Cargo loaded and verified with bill of lading.",
          location: s.origin.name,
        },
        {
          status: s.deliveryStatus === "DELIVERED" ? "DELIVERY_COMPLETED" : "IN_TRANSIT",
          timestamp: new Date(),
          description: s.deliveryStatus === "DELIVERED"
            ? "Consignment delivered and verified with 4-digit OTP."
            : "Active GPS telemetry corridor navigation underway.",
          location: s.destination.name,
        },
      ],
    };
  });

  const createdShipments = await Shipment.create(shipmentsToCreate);
  console.log(`[Dataset Engine] Ingested ${createdShipments.length} Kaggle DataCo commercial shipments.`);

  // 5. Ingest Supporting Records (Maintenance, Fuel, Invoices, Audits)
  await Maintenance.create([
    {
      vehicle: createdVehicles[0]._id,
      title: "50,000 km Transmission & Filter Overhaul",
      type: "PREVENTIVE",
      description: "Overhauled transmission fluid, air filtration cartridges, and calibrated telematics sensors.",
      costUSD: 28500,
      odometerKm: 80000,
      serviceCenter: "Tata Motors Authorized Commercial Care, Okhla New Delhi",
      status: "COMPLETED",
      serviceDate: new Date("2026-08-15"),
    },
    {
      vehicle: createdVehicles[1]._id,
      title: "State Transport Annual Fitness & Brake Inspection",
      type: "INSPECTION",
      description: "RTO Commercial Vehicle Safety, Pneumatic Brake Caliper Check, and Speed Governor Calibration.",
      costUSD: 14200,
      odometerKm: 38500,
      serviceCenter: "BharatBenz Authorized Fleet Center, Navi Mumbai",
      status: "COMPLETED",
      serviceDate: new Date("2026-09-02"),
    },
  ]);

  await FuelLog.create([
    {
      vehicle: createdVehicles[0]._id,
      driver: defaultDriver._id,
      volumeLiters: 180,
      costUSD: 16200,
      odometerKm: 83900,
      stationName: "IndianOil COCO Swarna Jayanti Expressway Hub, Mathura",
      fuelType: "Ultra-Low Sulfur Diesel",
    },
    {
      vehicle: createdVehicles[1]._id,
      driver: defaultDriver._id,
      volumeLiters: 120,
      costUSD: 10800,
      odometerKm: 39800,
      stationName: "Bharat Petroleum Highway Oasis, JNPT Uran Highway",
      fuelType: "Ultra-Low Sulfur Diesel",
    },
  ]);

  await Invoice.create([
    {
      invoiceNumber: "INV-2026-00412",
      shipment: createdShipments[0]._id,
      customer: customerUser._id,
      subtotalUSD: 185000.0,
      taxAmountUSD: 33300.0,
      totalAmountUSD: 218300.0,
      status: "PAID",
      dueDate: new Date(Date.now() + 86400 * 1000 * 14),
      paidAt: new Date(),
      items: [
        {
          description: "DataCo Commercial Freight Haulage (Noida SEZ to Gurugram Cyber Hub)",
          quantity: 1,
          unitPriceUSD: 185000.0,
          totalUSD: 185000.0,
        },
      ],
    },
    {
      invoiceNumber: "INV-2026-00413",
      shipment: createdShipments[1]._id,
      customer: customerUser._id,
      subtotalUSD: 72000.0,
      taxAmountUSD: 12960.0,
      totalAmountUSD: 84960.0,
      status: "ISSUED",
      dueDate: new Date(Date.now() + 86400 * 1000 * 30),
      items: [
        {
          description: "Cold-Chain Express Biomedical Transit (IGI Airport Cargo T3 to AIIMS)",
          quantity: 1,
          unitPriceUSD: 72000.0,
          totalUSD: 72000.0,
        },
      ],
    },
  ]);

  await AuditLog.create([
    {
      user: adminUser._id,
      userName: adminUser.name,
      userRole: "ADMIN",
      action: "DATASET_INGESTION_COMPLETED",
      entity: "SYSTEM_CORE",
      details: `Kaggle DataCo supply chain dataset loaded successfully. Seeded ${createdShipments.length} shipments and ${createdVehicles.length} vehicles.`,
      ipAddress: "127.0.0.1",
    },
  ]);

  console.log("[Dataset Engine] Full dataset synchronization completed successfully!");
  return {
    success: true,
    metadata,
    shipmentsCount: createdShipments.length,
    vehiclesCount: createdVehicles.length,
    driversCount: driversToCreate.length,
  };
};

// If run directly from terminal: `node seed/datasetLoader.js`
if (require.main === module) {
  loadAndSeedDataset()
    .then((res) => {
      console.log(`[Dataset Engine] Finished: ${res.shipmentsCount} shipments & ${res.vehiclesCount} vehicles ready in MongoDB.`);
      process.exit(0);
    })
    .catch((err) => {
      console.error("[Dataset Engine] Ingestion failed:", err);
      process.exit(1);
    });
}

module.exports = {
  loadAndSeedDataset,
  readDatasetFile,
};
