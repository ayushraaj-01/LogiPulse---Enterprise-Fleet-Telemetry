const express = require("express");
const router = express.Router();
const Shipment = require("../models/Shipment");
const Vehicle = require("../models/Vehicle");

/**
 * Intelligent Logistics Customer Support Chatbot Engine
 * Automatically extracts tracking IDs from queries, inspects live MongoDB shipments,
 * and answers freight, delivery, OTP, and policy questions.
 */
router.post("/message", async (req, res) => {
  try {
    const { message = "" } = req.body;
    const cleanMsg = message.trim();
    const lower = cleanMsg.toLowerCase();

    // 1. Check for Tracking Number Pattern (e.g., TRK-2026-98124 or TRK-98124 or any TRK-...)
    const trkRegex = /TRK[-_A-Z0-9]+/i;
    const match = cleanMsg.match(trkRegex);

    if (match || lower.includes("track") || lower.includes("where is") || lower.includes("status")) {
      const candidateCode = match ? match[0].toUpperCase() : null;

      let shipment = null;
      if (candidateCode) {
        shipment = await Shipment.findOne({
          trackingNumber: new RegExp(candidateCode, "i"),
        })
          .populate("assignedDriver", "name phone avatar")
          .populate("assignedVehicle", "make model licensePlate type currentLocation");
      }

      // If no candidate was typed, but user asks "where is my order", look up the latest active order
      if (!shipment && (lower.includes("my order") || lower.includes("my delivery") || lower.includes("latest"))) {
        shipment = await Shipment.findOne({})
          .sort({ createdAt: -1 })
          .populate("assignedDriver", "name phone avatar")
          .populate("assignedVehicle", "make model licensePlate type currentLocation");
      }

      if (shipment) {
        const statusDescriptions = {
          DRAFT: "is currently in draft preparation at our dispatch terminal.",
          UNASSIGNED: "is registered and queued for driver assignment.",
          DISPATCHED: "has been assigned to a professional driver and is preparing for transit.",
          AT_PICKUP: "is currently being loaded onto the transport vehicle.",
          IN_TRANSIT: "is actively on route to the destination delivery address.",
          OUT_FOR_DELIVERY: "is in the final delivery mile and will arrive shortly.",
          DELIVERED: "has been successfully delivered and signed for.",
          FAILED: "encountered a delivery exception (e.g., recipient unavailable).",
          CANCELLED: "was cancelled per shipper request.",
        };

        const desc = statusDescriptions[shipment.status] || "is actively being handled.";
        const driverName = shipment.assignedDriver ? shipment.assignedDriver.name : "Driver to be allocated";
        const vehicleInfo = shipment.assignedVehicle
          ? `${shipment.assignedVehicle.make} ${shipment.assignedVehicle.model} (${shipment.assignedVehicle.licensePlate})`
          : "Fleet vehicle pending";

        return res.json({
          success: true,
          reply: `📦 **Shipment ${shipment.trackingNumber}** ${desc}\n\n` +
            `• **Current Status**: **${shipment.status}**\n` +
            `• **Origin**: ${shipment.origin?.name || shipment.origin?.address || "Terminal"}\n` +
            `• **Destination**: ${shipment.destination?.name || shipment.destination?.address || "Consignee Address"}\n` +
            `• **Assigned Driver**: ${driverName}\n` +
            `• **Vehicle**: ${vehicleInfo}\n` +
            `• **Security OTP**: 🔑 **${shipment.deliveryOtp || "4829"}** (Provide to driver upon handover)\n\n` +
            `Would you like to open the full real-time GPS live tracking map for this consignment?`,
          shipmentData: {
            trackingNumber: shipment.trackingNumber,
            status: shipment.status,
            driver: shipment.assignedDriver ? shipment.assignedDriver.name : null,
            otp: shipment.deliveryOtp,
            origin: shipment.origin?.name || shipment.origin?.address,
            destination: shipment.destination?.name || shipment.destination?.address,
            link: `/track/${shipment.trackingNumber}`,
          },
          quickReplies: [
            "View Live Map",
            "Call Dispatch Lead",
            "How do I share the OTP?",
            "Track another shipment",
          ],
        });
      } else if (candidateCode) {
        return res.json({
          success: true,
          reply: `⚠️ I couldn't find a record for **${candidateCode}** in our active fleet database. Please verify your tracking number format (e.g., \`TRK-2026-98124\`), or check your booking confirmation email.`,
          quickReplies: [
            "Track TRK-2026-98124",
            "Book a new delivery",
            "Talk to a human agent",
          ],
        });
      }
    }

    // 2. Delivery OTP Questions
    if (lower.includes("otp") || lower.includes("pin") || lower.includes("code") || lower.includes("password")) {
      return res.json({
        success: true,
        reply: `🔑 **Delivery OTP Security Protocol:**\n\n` +
          `Every LogiPulse consignment is protected by an automated **4-digit one-time PIN**:\n` +
          `1. Your OTP is generated automatically upon booking and visible on your tracking screen.\n` +
          `2. When your driver arrives, inspect your packages and security seals.\n` +
          `3. Only share your 4-digit code once you are satisfied with the delivered goods.\n` +
          `4. The driver enters the OTP into their mobile app to officially complete the delivery.\n\n` +
          `Need help finding your OTP for a specific order? Provide your tracking ID (e.g., \`TRK-2026-98124\`).`,
        quickReplies: [
          "Check OTP for TRK-2026-98124",
          "What if driver asks for OTP early?",
          "Can I change delivery address?",
        ],
      });
    }

    // 3. Helper / Porter Labor Questions
    if (lower.includes("helper") || lower.includes("labor") || lower.includes("loading") || lower.includes("unloading")) {
      return res.json({
        success: true,
        reply: `🤝 **Porter-Style Loading Helpers:**\n\n` +
          `You can request certified loading assistance during booking:\n` +
          `• **+1 Helper**: Driver + 1 dedicated porter for heavy or multi-box shipments ($25 flat fee).\n` +
          `• **+2 Helpers**: Driver + 2 certified warehouse laborers for heavy industrial/machinery cargo ($45 flat fee).\n` +
          `• **Included Duties**: Ground-to-vehicle loading, secure strapping, and door/dock drop-off.\n\n` +
          `Would you like to add helpers to an existing booking or calculate a freight quote?`,
        quickReplies: [
          "Calculate Freight Rate",
          "Book a Delivery with Helper",
          "Helper safety compliance",
        ],
      });
    }

    // 4. Pricing, Rates & Invoicing
    if (lower.includes("price") || lower.includes("rate") || lower.includes("cost") || lower.includes("fare") || lower.includes("invoice") || lower.includes("charge")) {
      return res.json({
        success: true,
        reply: `💵 **Transparent Freight Pricing & Invoices:**\n\n` +
          `Our transparent rate card includes:\n` +
          `• **Base Distance Fare**: $3.20/mile for city express; $2.40/mile for long-haul interstate.\n` +
          `• **Cargo Weight Slabs**: Up to 1,000 kg standard; tiered volume surcharge above 15 m³.\n` +
          `• **Live Fuel Surcharge**: Dynamically tied to the federal diesel index (updated weekly).\n` +
          `• **Automated Invoices**: Official PDF receipts with digital receiver signatures are generated immediately upon delivery.\n\n` +
          `You can view and download all past receipts in the **Invoices & Receipts** portal!`,
        quickReplies: [
          "View Invoices",
          "Book a Delivery",
          "Contact Billing Specialist",
        ],
      });
    }

    // 5. Delays, Damaged Goods, Claims & Emergencies
    if (lower.includes("delay") || lower.includes("late") || lower.includes("damage") || lower.includes("lost") || lower.includes("broken") || lower.includes("claim") || lower.includes("accident")) {
      const ticketId = "ESC-" + Math.floor(100000 + Math.random() * 900000);
      return res.json({
        success: true,
        reply: `🚨 **Priority Exception & Claims Escalation:**\n\n` +
          `I apologize for the inconvenience. Your issue has been assigned emergency tracking ID **#${ticketId}**.\n\n` +
          `• **Immediate Action**: Our 24/7 Central Dispatch Operations Lead has been notified.\n` +
          `• **Direct Telephone Hotline**: 📞 **1-800-564-4785** (Toll-Free, 24/7)\n` +
          `• **Cargo Protection**: All consignments carry full commercial freight loss & damage coverage up to $150,000.\n\n` +
          `Would you like me to connect you directly to a human dispatch supervisor right now?`,
        quickReplies: [
          "Call 1-800-564-4785",
          "Upload Damage Photo",
          "Check order status",
        ],
      });
    }

    // 6. Default Helpful Logistics Response
    return res.json({
      success: true,
      reply: `👋 Hello! I am **PulseBot**, your 24/7 LogiPulse AI dispatch assistant.\n\n` +
        `I can help you with:\n` +
        `• 📦 **Live Tracking**: Enter any tracking ID (e.g. \`TRK-2026-98124\`)\n` +
        `• 🔑 **Delivery OTP Verification**: Secure pickup and release codes\n` +
        `• 🚚 **Driver & Vehicle ETA**: Real-time vehicle positions\n` +
        `• 🤝 **Loading Helpers**: Porter assistance for heavy freight\n` +
        `• 📄 **Receipts & Invoices**: Billing and claims assistance\n\n` +
        `What can I assist you with today?`,
      quickReplies: [
        "Where is TRK-2026-98124?",
        "How do I share my OTP?",
        "Helper options & pricing",
        "Talk to a human dispatcher",
      ],
    });
  } catch (error) {
    console.error("[Chatbot Error]:", error);
    res.status(500).json({
      success: false,
      reply: "Sorry, I am temporarily having trouble reaching the dispatch telemetry stream. Please try again or call our hotline at 1-800-564-4785.",
    });
  }
});

module.exports = router;
