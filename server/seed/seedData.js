const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Driver = require("../models/Driver");
const Shipment = require("../models/Shipment");
const Maintenance = require("../models/Maintenance");
const FuelLog = require("../models/FuelLog");
const Invoice = require("../models/Invoice");
const AuditLog = require("../models/AuditLog");

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/logipulse";

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("[Seeder] Connected to MongoDB for seeding...");

    // Clear existing collections
    await User.deleteMany({});
    await Vehicle.deleteMany({});
    await Driver.deleteMany({});
    await Shipment.deleteMany({});
    await Maintenance.deleteMany({});
    await FuelLog.deleteMany({});
    await Invoice.deleteMany({});
    await AuditLog.deleteMany({});
    console.log("[Seeder] Cleared old collections.");

    // Create 5 Core Users (One for each persona)
    const users = await User.create([
      {
        name: "Arthur Pendelton",
        email: "admin@logipulse.com",
        password: "password123",
        role: "ADMIN",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        phone: "+1 (555) 100-2001",
        company: "LogiPulse Global Headquarters",
      },
      {
        name: "Alex Vance",
        email: "dispatcher@logipulse.com",
        password: "password123",
        role: "DISPATCHER",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
        phone: "+1 (555) 100-2002",
        company: "Pacific Fleet Dispatch Operations",
      },
      {
        name: "Marcus Ray",
        email: "driver@logipulse.com",
        password: "password123",
        role: "DRIVER",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
        phone: "+1 (555) 100-2003",
        company: "LogiPulse Haulage Team A",
      },
      {
        name: "Elena Rostova",
        email: "customer@logipulse.com",
        password: "password123",
        role: "CUSTOMER",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
        phone: "+1 (555) 100-2004",
        company: "Cascadia Retail Logistics",
      },
      {
        name: "Julian Sterling",
        email: "finance@logipulse.com",
        password: "password123",
        role: "FINANCE",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80",
        phone: "+1 (555) 100-2005",
        company: "LogiPulse Financial Services",
      },
      {
        name: "David Kim",
        email: "driver2@logipulse.com",
        password: "password123",
        role: "DRIVER",
        avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
        phone: "+1 (555) 100-2006",
        company: "LogiPulse Haulage Team B",
      },
    ]);

    const adminUser = users[0];
    const dispatcherUser = users[1];
    const driverUser = users[2];
    const customerUser = users[3];
    const financeUser = users[4];
    const driverUser2 = users[5];

    console.log("[Seeder] Created 6 core role accounts.");

    // Create Fleet Vehicles
    const vehicles = await Vehicle.create([
      {
        vin: "1FT8W3BT9NED10041",
        licensePlate: "WA-FLT-104",
        make: "Freightliner",
        model: "Cascadia Evolution",
        year: 2024,
        type: "HEAVY_TRUCK",
        fuelType: "DIESEL",
        payloadCapacityKg: 22000,
        currentOdometerKm: 84250,
        status: "IN_TRANSIT",
        currentLocation: {
          latitude: 47.6101,
          longitude: -122.3328,
          speedKmh: 68,
          headingDeg: 45,
          address: "I-5 Northbound near Exit 165 (Mercer St)",
        },
        assignedDriver: driverUser._id,
        insuranceExpiry: new Date("2027-04-15"),
        permitExpiry: new Date("2027-02-28"),
        fuelLevelPercent: 78,
      },
      {
        vin: "3C6UR5FL8MG549210",
        licensePlate: "WA-VAN-208",
        make: "Mercedes-Benz",
        model: "Sprinter 3500 High Roof",
        year: 2023,
        type: "CARGO_VAN",
        fuelType: "DIESEL",
        payloadCapacityKg: 4500,
        currentOdometerKm: 39980,
        status: "IDLE",
        currentLocation: {
          latitude: 47.5752,
          longitude: -122.3411,
          speedKmh: 0,
          headingDeg: 180,
          address: "Harbor Island Distribution Bay #4",
        },
        assignedDriver: driverUser2._id,
        insuranceExpiry: new Date("2026-11-20"),
        permitExpiry: new Date("2026-10-15"), // Triggers 14-day alert!
        fuelLevelPercent: 92,
      },
      {
        vin: "1GB6G5BY1M1184920",
        licensePlate: "WA-BOX-312",
        make: "Isuzu",
        model: "NPR-HD 16ft Box",
        year: 2022,
        type: "BOX_TRUCK",
        fuelType: "DIESEL",
        payloadCapacityKg: 7800,
        currentOdometerKm: 62140,
        status: "ACTIVE",
        currentLocation: {
          latitude: 47.6553,
          longitude: -122.3035,
          speedKmh: 42,
          headingDeg: 310,
          address: "University District Delivery Hub",
        },
        insuranceExpiry: new Date("2027-08-30"),
        permitExpiry: new Date("2027-06-15"),
        fuelLevelPercent: 64,
      },
      {
        vin: "WB10A0306HZ984124",
        licensePlate: "WA-MTR-401",
        make: "BMW",
        model: "CE 04 Electric Courier",
        year: 2025,
        type: "MOTORCYCLE",
        fuelType: "ELECTRIC",
        payloadCapacityKg: 180,
        currentOdometerKm: 8900,
        status: "IN_TRANSIT",
        currentLocation: {
          latitude: 47.6085,
          longitude: -122.3401,
          speedKmh: 35,
          headingDeg: 90,
          address: "Pike Place Urban Express Zone",
        },
        insuranceExpiry: new Date("2027-12-31"),
        permitExpiry: new Date("2027-11-30"),
        fuelLevelPercent: 88,
      },
    ]);

    console.log("[Seeder] Created 4 fleet vehicle dossiers.");

    // Create Driver Records
    await Driver.create([
      {
        user: driverUser._id,
        licenseNumber: "CDL-WA-988421-A",
        licenseExpiry: new Date("2027-05-18"),
        medicalCertExpiry: new Date("2026-10-14"), // Alert due!
        status: "DRIVING",
        assignedVehicle: vehicles[0]._id,
        safetyScore: 98.4,
        totalTrips: 342,
        onTimeRatePercent: 99.2,
        hoursWorkedToday: 5.2,
      },
      {
        user: driverUser2._id,
        licenseNumber: "CDL-WA-774910-B",
        licenseExpiry: new Date("2027-09-22"),
        medicalCertExpiry: new Date("2027-01-10"),
        status: "AVAILABLE",
        assignedVehicle: vehicles[1]._id,
        safetyScore: 96.8,
        totalTrips: 188,
        onTimeRatePercent: 98.1,
        hoursWorkedToday: 3.0,
      },
    ]);

    // Create Shipments
    await Shipment.create([
      {
        trackingNumber: "TRK-2026-98124",
        customer: customerUser._id,
        assignedDriver: driverUser._id,
        assignedVehicle: vehicles[0]._id,
        status: "IN_TRANSIT",
        priority: "CRITICAL",
        origin: {
          name: "Seattle Harbor Terminal #18",
          address: "2400 11th Ave SW, Seattle, WA 98134",
          latitude: 47.5852,
          longitude: -122.3582,
        },
        destination: {
          name: "Redmond Advanced Logistics Center",
          address: "15255 NE 90th St, Redmond, WA 98052",
          latitude: 47.6812,
          longitude: -122.1245,
        },
        scheduledPickup: new Date(Date.now() - 3600 * 1000 * 2),
        scheduledDelivery: new Date(Date.now() + 3600 * 1000 * 1.5),
        estimatedDistanceKm: 34.8,
        estimatedDurationMinutes: 42,
        weightKg: 8500,
        volumeCbm: 18.5,
        declaredValueUSD: 145000,
        notes: "High-value cold chain semiconductors. Maintain cab sensor temperature between 2-4°C.",
        timeline: [
          { status: "DISPATCHED", description: "Assigned to Marcus Ray with Freightliner Cascadia", location: "Seattle Harbor" },
          { status: "AT_PICKUP", description: "Driver arrived at Harbor Gate 4", location: "Seattle Harbor" },
          { status: "IN_TRANSIT", description: "Departed pickup dock; in transit to Redmond", location: "I-5 Northbound" },
        ],
      },
      {
        trackingNumber: "TRK-2026-98119",
        customer: customerUser._id,
        assignedDriver: driverUser2._id,
        assignedVehicle: vehicles[1]._id,
        status: "AT_PICKUP",
        priority: "EXPRESS",
        origin: {
          name: "Bellevue Commercial Park",
          address: "12000 NE 12th St, Bellevue, WA 98005",
          latitude: 47.6205,
          longitude: -122.1804,
        },
        destination: {
          name: "Kirkland Medical Supply Depository",
          address: "11521 124th Ave NE, Kirkland, WA 98034",
          latitude: 47.7022,
          longitude: -122.1764,
        },
        scheduledPickup: new Date(Date.now() - 3600 * 1000),
        scheduledDelivery: new Date(Date.now() + 3600 * 1000 * 3),
        estimatedDistanceKm: 14.2,
        estimatedDurationMinutes: 25,
        weightKg: 620,
        volumeCbm: 2.8,
        declaredValueUSD: 18500,
        notes: "Urgent medical vials. Requires signed e-POD.",
        timeline: [
          { status: "DISPATCHED", description: "Dispatched to driver David Kim", location: "Bellevue" },
          { status: "AT_PICKUP", description: "Arrived at Bellevue loading dock", location: "Bellevue Commercial Park" },
        ],
      },
      {
        trackingNumber: "TRK-2026-98075",
        customer: customerUser._id,
        assignedDriver: driverUser._id,
        assignedVehicle: vehicles[0]._id,
        status: "DELIVERED",
        priority: "STANDARD",
        origin: {
          name: "Tacoma Marine Cargo Dock",
          address: "1 Sitcum Way, Tacoma, WA 98421",
          latitude: 47.2562,
          longitude: -122.4215,
        },
        destination: {
          name: "Seattle Central Market Hub",
          address: "1531 Western Ave, Seattle, WA 98101",
          latitude: 47.6091,
          longitude: -122.3412,
        },
        scheduledPickup: new Date(Date.now() - 3600 * 1000 * 24),
        scheduledDelivery: new Date(Date.now() - 3600 * 1000 * 4),
        actualDeliveredAt: new Date(Date.now() - 3600 * 1000 * 4.2),
        estimatedDistanceKm: 52.4,
        weightKg: 12400,
        volumeCbm: 24.0,
        declaredValueUSD: 65000,
        proofOfDelivery: {
          recipientName: "Jonathan Miller (Receiving Lead)",
          signatureUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='60'><path d='M10 40 Q 50 10, 90 40 T 170 30' stroke='%232563eb' fill='transparent' stroke-width='3'/></svg>",
          photoUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&auto=format&fit=crop&q=80",
          signedAt: new Date(Date.now() - 3600 * 1000 * 4.2),
          notes: "Inspected and accepted all 12 pallets with zero seal damage.",
        },
        timeline: [
          { status: "DISPATCHED", description: "Route started", location: "Tacoma" },
          { status: "IN_TRANSIT", description: "Crossed SR-99", location: "Tukwila" },
          { status: "DELIVERED", description: "Signed for by Jonathan Miller", location: "Western Ave Dock" },
        ],
      },
      {
        trackingNumber: "TRK-2026-98150",
        customer: customerUser._id,
        status: "UNASSIGNED",
        priority: "EXPRESS",
        origin: {
          name: "Everett Boeing Field Logistics",
          address: "3003 W Casino Rd, Everett, WA 98204",
          latitude: 47.9224,
          longitude: -122.2789,
        },
        destination: {
          name: "SeaTac Airport Air Freight Terminal",
          address: "17801 International Blvd, Seattle, WA 98158",
          latitude: 47.4502,
          longitude: -122.3088,
        },
        scheduledPickup: new Date(Date.now() + 3600 * 1000 * 2),
        scheduledDelivery: new Date(Date.now() + 3600 * 1000 * 6),
        estimatedDistanceKm: 68.5,
        estimatedDurationMinutes: 65,
        weightKg: 2800,
        volumeCbm: 6.5,
        declaredValueUSD: 94000,
        notes: "Awaiting driver & vehicle allocation from Dispatch Board.",
        timeline: [
          { status: "UNASSIGNED", description: "Order booked via customer portal", location: "Everett Depot" },
        ],
      },
    ]);

    console.log("[Seeder] Created 4 sample shipments.");

    // Create Maintenance Records
    await Maintenance.create([
      {
        vehicle: vehicles[0]._id,
        type: "PREVENTIVE",
        title: "80,000 km Scheduled Overhaul & Brake Service",
        description: "Replaced heavy front brake pads, synthetic engine oil 15W-40, air dryer cartridge, and DEF filter.",
        serviceDate: new Date("2026-08-15"),
        odometerKm: 81200,
        costUSD: 1480.50,
        technicianName: "Apex Diesel Solutions (Shop #3)",
        status: "COMPLETED",
        nextDueDate: new Date("2027-02-15"),
        nextDueOdometerKm: 100000,
      },
      {
        vehicle: vehicles[1]._id,
        type: "INSPECTION",
        title: "DOT Commercial Vehicle Safety Inspection",
        description: "Annual 49 CFR Part 396 periodic commercial vehicle inspection and emissions test.",
        serviceDate: new Date("2026-09-10"),
        odometerKm: 39500,
        costUSD: 350.00,
        technicianName: "Washington State DOT Certified Hub",
        status: "COMPLETED",
      },
    ]);

    // Create Fuel Logs
    await FuelLog.create([
      {
        vehicle: vehicles[0]._id,
        driver: driverUser._id,
        fueledAt: new Date(Date.now() - 3600 * 1000 * 8),
        volumeLiters: 280,
        costUSD: 345.80,
        odometerKm: 84120,
        stationName: "Pilot Flying J Travel Plaza #249",
        fuelType: "Ultra-Low Sulfur Diesel",
        costPerKm: 0.64,
      },
      {
        vehicle: vehicles[1]._id,
        driver: driverUser2._id,
        fueledAt: new Date(Date.now() - 3600 * 1000 * 20),
        volumeLiters: 75,
        costUSD: 98.40,
        odometerKm: 39820,
        stationName: "Shell Commercial Cardlock",
        fuelType: "Diesel #2",
        costPerKm: 0.58,
      },
    ]);

    // Create Invoices
    await Invoice.create([
      {
        invoiceNumber: "INV-2026-0482",
        customer: customerUser._id,
        dueDate: new Date(Date.now() + 3600 * 1000 * 24 * 14),
        status: "PAID",
        subtotalUSD: 1850.00,
        taxRatePercent: 8.5,
        taxAmountUSD: 157.25,
        totalAmountUSD: 2007.25,
        paidAt: new Date(Date.now() - 3600 * 1000 * 2),
        items: [
          { description: "Freight Haulage: Tacoma Port to Seattle Central Market", quantity: 1, unitPriceUSD: 1650.00, totalUSD: 1650.00 },
          { description: "Fuel Surcharge (12.1%)", quantity: 1, unitPriceUSD: 200.00, totalUSD: 200.00 },
        ],
      },
      {
        invoiceNumber: "INV-2026-0483",
        customer: customerUser._id,
        dueDate: new Date(Date.now() + 3600 * 1000 * 24 * 30),
        status: "ISSUED",
        subtotalUSD: 3200.00,
        taxRatePercent: 8.5,
        taxAmountUSD: 272.00,
        totalAmountUSD: 3472.00,
        items: [
          { description: "Dedicated Cascadia Reefer Run: Seattle Harbor to Redmond", quantity: 1, unitPriceUSD: 2950.00, totalUSD: 2950.00 },
          { description: "Priority Temperature Monitoring Telemetry Surcharge", quantity: 1, unitPriceUSD: 250.00, totalUSD: 250.00 },
        ],
      },
    ]);

    // Create Audit Logs
    await AuditLog.create([
      {
        userName: "Arthur Pendelton",
        userRole: "ADMIN",
        action: "SYSTEM_INITIALIZED",
        entity: "System",
        details: "Platform database seeded with MERN stack configuration and 5 role profiles",
        ipAddress: "127.0.0.1",
      },
      {
        userName: "Alex Vance",
        userRole: "DISPATCHER",
        action: "SHIPMENT_DISPATCHED",
        entity: "Shipment",
        entityId: "TRK-2026-98124",
        details: "Assigned Freightliner Cascadia to driver Marcus Ray",
        ipAddress: "127.0.0.1",
      },
    ]);

    console.log("[Seeder] Full database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("[Seeder] Error seeding database:", error);
    process.exit(1);
  }
};

seedDatabase();
