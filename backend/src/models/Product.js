import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    compareAtPrice: {
      type: Number,
      default: null,
      min: 0
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },
    image: {
      type: String,
      required: true
    },
    images: {
      type: [String],
      default: []
    },
    video: {
      type: String,
      default: ""
    },
    weight: {
      type: String,
      default: ""
    },
    shortDescription: {
      type: String,
      default: ""
    },
    ingredients: {
      type: [String],
      default: []
    },
    benefits: {
      type: [String],
      default: []
    },
    expiryDate: {
      type: Date,
      default: null
    },
    brand: {
      type: String,
      trim: true,
      default: ""
    },
    gst: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 0,
      max: 5
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true
  }
);

const Product = mongoose.model("Product", productSchema);

export default Product;
