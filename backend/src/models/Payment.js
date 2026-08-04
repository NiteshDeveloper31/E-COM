import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    transactionId: {
      type: String,
      required: true,
      unique: true
    },
    paymentMethod: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending"
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

export default Payment;
