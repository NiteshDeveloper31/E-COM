import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    orderCode: { type: String, unique: true, sparse: true, trim: true },
    invoiceCode: { type: String, unique: true, sparse: true, trim: true },
    invoiceDate: { type: Date, default: null },
    channelName: { type: String, default: "Website" },
    items: [
      {
        saleOrderItemCode: { type: String },
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        productName: {
          type: String,
          required: true
        },
        price: {
          type: Number,
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          min: 1
        },
        image: {
          type: String,
          required: true
        }
      }
    ],
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    shipping: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "COD", "Card", "NetBanking", "Razorpay"],
      default: "COD"
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending"
    },
    razorpayOrderId: {
      type: String
    },
    razorpayPaymentId: {
      type: String
    },
    razorpaySignature: {
      type: String
    },
    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "On Hold", "Shipped", "Delivered", "Cancelled"],
      default: "Pending"
    },
    isStockDeducted: {
      type: Boolean,
      default: false
    },
    isSkuVerified: {
      type: Boolean,
      default: false
    },
    shippingAddress: {
      name: { type: String },
      phone: { type: String },
      line: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      zip: { type: String, required: true },
      country: { type: String, default: "India" }
    },
    billingAddress: {
      name: { type: String },
      phone: { type: String },
      line: { type: String },
      city: { type: String },
      state: { type: String },
      zip: { type: String },
      country: { type: String, default: "India" }
    },
    discount: { type: Number, default: 0, min: 0 },
    voucherCode: { type: String, default: "" },
    codServiceCharge: { type: Number, default: 0, min: 0 },
    giftWrapCharges: { type: Number, default: 0, min: 0 },
    shippingMethodCharges: { type: Number, default: 0, min: 0 },
    taxBreakdown: {
      cgst: { type: Number, default: 0 },
      cgstRate: { type: Number, default: 0 },
      sgst: { type: Number, default: 0 },
      sgstRate: { type: Number, default: 0 },
      igst: { type: Number, default: 0 },
      igstRate: { type: Number, default: 0 },
      utgst: { type: Number, default: 0 },
      utgstRate: { type: Number, default: 0 },
      cess: { type: Number, default: 0 },
      cessRate: { type: Number, default: 0 },
      tcsRate: { type: Number, default: 0 },
      tcsAmount: { type: Number, default: 0 }
    },
    packetNumber: { type: String, default: "" },
    shippingCourier: { type: String, default: "" },
    trackingNumber: { type: String, default: "" },
    timeline: [
      {
        status: { type: String, required: true },
        date: { type: Date, default: Date.now }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Pre-save hook to ensure orderCode and invoiceCode are ALWAYS populated
orderSchema.pre("save", function (next) {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);

  if (!this.orderCode || this.orderCode === "null") {
    this.orderCode = `ORD-${dateStr}-${randomSuffix}`;
  }
  if (!this.invoiceCode || this.invoiceCode === "null") {
    this.invoiceCode = `INV-${dateStr}-${randomSuffix}`;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);

// Self-healing: Ensure legacy null orderCode documents get valid codes & drop old non-sparse index
setTimeout(async () => {
  try {
    const nullOrders = await Order.find({ $or: [{ orderCode: null }, { orderCode: "null" }, { orderCode: { $exists: false } }] });
    for (const ord of nullOrders) {
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      ord.orderCode = `ORD-${dateStr}-${randomSuffix}`;
      if (!ord.invoiceCode) {
        ord.invoiceCode = `INV-${dateStr}-${randomSuffix}`;
      }
      await ord.save();
    }
    await Order.collection.dropIndex("orderCode_1").catch(() => {});
  } catch (err) {
    // Ignore index drop errors
  }
}, 2000);

export default Order;
