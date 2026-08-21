import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    displayName: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;
