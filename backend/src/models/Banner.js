import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    subtitle: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      required: true
    },
    buttonText: {
      type: String,
      required: true,
      trim: true
    },
    buttonLink: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },
    placement: {
      type: String,
      required: true,
      default: "Main Hero"
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Banner = mongoose.model("Banner", bannerSchema);

export default Banner;
