import mongoose from "mongoose";

const grnSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      default: "N/A"
    },
    weight: {
      type: String,
      default: ""
    },
    previousStock: {
      type: Number,
      required: true
    },
    receivedQty: {
      type: Number,
      required: true,
      min: 0
    },
    goodQty: {
      type: Number,
      required: true,
      min: 0
    },
    badQty: {
      type: Number,
      required: true,
      default: 0
    },
    newStock: {
      type: Number,
      required: true
    },
    notes: {
      type: String,
      default: ""
    },
    processedBy: {
      type: String,
      default: "Admin User"
    }
  },
  {
    timestamps: true
  }
);

const GRN = mongoose.model("GRN", grnSchema);
export default GRN;
