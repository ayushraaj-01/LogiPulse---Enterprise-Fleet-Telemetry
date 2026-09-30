const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: { type: String, required: true, unique: true },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipment",
      default: null,
    },
    issueDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["DRAFT", "ISSUED", "PAID", "OVERDUE", "VOID"],
      default: "ISSUED",
    },
    subtotalUSD: { type: Number, required: true },
    taxRatePercent: { type: Number, default: 8.5 },
    taxAmountUSD: { type: Number, required: true },
    totalAmountUSD: { type: Number, required: true },
    paidAt: { type: Date, default: null },
    items: [
      {
        description: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        unitPriceUSD: { type: Number, required: true },
        totalUSD: { type: Number, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Invoice", InvoiceSchema);
