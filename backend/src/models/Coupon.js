import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    discountType: {
      type: String,
      enum: ["percentage", "flat"],
      default: "percentage"
    },
    discountValue: {
      type: Number,
      required: true,
      min: 0
    },
    maxDiscount: {
      type: Number,
      default: null,
      min: 0
    },
    applicableScope: {
      type: String,
      enum: ["ALL", "CATEGORY", "PRODUCT"],
      default: "ALL"
    },
    applicableCategories: [
      {
        type: mongoose.Schema.Types.Mixed
      }
    ],
    applicableProducts: [
      {
        type: mongoose.Schema.Types.Mixed
      }
    ],
    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    validFrom: {
      type: Date,
      default: Date.now
    },
    validUntil: {
      type: Date,
      default: null
    },
    usageLimit: {
      type: Number,
      default: null
    },
    usedCount: {
      type: Number,
      default: 0
    },
    perUserLimit: {
      type: Number,
      default: 1
    },
    usedByUsers: [
      {
        userId: { type: String },
        count: { type: Number, default: 1 }
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;
