import mongoose from "mongoose";

const stockNotificationSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    status: {
      type: String,
      enum: ["Pending", "Notified"],
      default: "Pending"
    },
    notifiedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate pending notifications for same email & product
stockNotificationSchema.index({ product: 1, email: 1, status: 1 });

const StockNotification = mongoose.model("StockNotification", stockNotificationSchema);

export default StockNotification;
