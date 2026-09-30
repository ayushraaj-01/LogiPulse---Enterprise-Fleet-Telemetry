const express = require("express");
const http = require("http");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(morgan("dev"));

// API Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/vehicles", require("./routes/vehicles"));
app.use("/api/shipments", require("./routes/shipments"));
app.use("/api/drivers", require("./routes/drivers"));
app.use("/api/maintenance", require("./routes/maintenance"));
app.use("/api/fuel", require("./routes/fuel"));
app.use("/api/billing", require("./routes/billing"));
app.use("/api/analytics", require("./routes/analytics"));
app.use("/api/audit-logs", require("./routes/auditLogs"));
app.use("/api/chatbot", require("./routes/chatbot"));

// System Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    platform: "LogiPulse MERN Logistics Platform",
    timestamp: new Date().toISOString(),
    database: "connected",
  });
});

// Real-Time Socket.io Telemetry Simulation
const Vehicle = require("./models/Vehicle");

io.on("connection", (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Broadcast live fleet positions when client requests
  socket.on("REQUEST_FLEET_SYNC", async () => {
    try {
      const vehicles = await Vehicle.find().populate("assignedDriver", "name phone avatar");
      socket.emit("FLEET_TELEMETRY_UPDATE", vehicles);
    } catch (err) {
      console.error("[Socket.io] Error fetching vehicles:", err);
    }
  });

  // Handle Driver in-cab mobile GPS ping
  socket.on("DRIVER_GPS_PING", async (data) => {
    try {
      const { vehicleId, latitude, longitude, speedKmh, headingDeg } = data;
      if (vehicleId) {
        const updated = await Vehicle.findByIdAndUpdate(
          vehicleId,
          {
            "currentLocation.latitude": latitude,
            "currentLocation.longitude": longitude,
            "currentLocation.speedKmh": speedKmh,
            "currentLocation.headingDeg": headingDeg,
            "currentLocation.lastUpdated": new Date(),
          },
          { new: true }
        );
        io.emit("VEHICLE_POSITION_CHANGED", updated);
      }
    } catch (err) {
      console.error("[Socket.io] Error processing driver ping:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Periodic Telemetry Simulator: Gently moves vehicles along Seattle routes to provide alive, dynamic map experience
setInterval(async () => {
  try {
    const activeVehicles = await Vehicle.find({ status: { $in: ["IN_TRANSIT", "ACTIVE"] } });
    for (const v of activeVehicles) {
      // Small delta movement simulation (~0.001 deg)
      const latDelta = (Math.random() - 0.48) * 0.0012;
      const lngDelta = (Math.random() - 0.48) * 0.0012;
      v.currentLocation.latitude += latDelta;
      v.currentLocation.longitude += lngDelta;
      v.currentLocation.speedKmh = Math.floor(45 + Math.random() * 30);
      v.currentLocation.headingDeg = (v.currentLocation.headingDeg + Math.floor((Math.random() - 0.5) * 10) + 360) % 360;
      v.currentLocation.lastUpdated = new Date();
      await v.save();
    }
    const allVehicles = await Vehicle.find().populate("assignedDriver", "name phone avatar");
    io.emit("FLEET_TELEMETRY_UPDATE", allVehicles);
  } catch (err) {
    // Non-blocking telemetry simulation
  }
}, 4000);

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 LogiPulse MERN API Server running on port ${PORT}`);
  console.log(`📡 WebSocket / Socket.io active for live telemetry`);
  console.log(`=======================================================`);
});
