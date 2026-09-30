const express = require("express");
const router = express.Router();
const Invoice = require("../models/Invoice");
const { protect, authorize } = require("../middleware/auth");

router.get("/invoices", protect, async (req, res) => {
  try {
    let query = {};
    if (req.user.role === "CUSTOMER") {
      query.customer = req.user._id;
    }
    const invoices = await Invoice.find(query)
      .populate("customer", "name email company phone")
      .populate("shipment", "trackingNumber origin destination")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: invoices.length, data: invoices });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/invoices", protect, authorize("ADMIN", "FINANCE"), async (req, res) => {
  try {
    const randomInv = `INV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const invoice = await Invoice.create({
      ...req.body,
      invoiceNumber: req.body.invoiceNumber || randomInv,
    });
    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.patch("/invoices/:id/pay", protect, async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice not found" });
    }
    invoice.status = "PAID";
    invoice.paidAt = new Date();
    await invoice.save();
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
