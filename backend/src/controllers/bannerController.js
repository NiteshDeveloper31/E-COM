import Banner from "../models/Banner.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { checkRequiredFields } from "../validations/validator.js";

/**
 * Add Banner (Admin only).
 */
export const addBanner = async (req, res, next) => {
  try {
    const required = ["title", "image", "buttonText", "buttonLink", "endDate"];
    const missing = checkRequiredFields(req.body, required);
    if (missing) {
      return sendError(res, `Required field missing: ${missing}`, 400);
    }

    const { title, subtitle, image, buttonText, buttonLink, status, placement, startDate, endDate } = req.body;

    const newBanner = await Banner.create({
      title,
      subtitle,
      image,
      buttonText,
      buttonLink,
      status: status || "Active",
      placement: placement || "Main Hero",
      startDate: startDate || new Date(),
      endDate: new Date(endDate)
    });

    return sendSuccess(res, "Banner campaign created successfully.", newBanner, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Edit Banner (Admin only).
 */
export const editBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) {
      return sendError(res, "Banner campaign not found.", 404);
    }

    const fields = [
      "title",
      "subtitle",
      "image",
      "buttonText",
      "buttonLink",
      "status",
      "placement",
      "startDate",
      "endDate"
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "startDate" || field === "endDate") {
          banner[field] = new Date(req.body[field]);
        } else {
          banner[field] = req.body[field];
        }
      }
    });

    await banner.save();
    return sendSuccess(res, "Banner updated successfully.", banner);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Banner (Admin only).
 */
export const deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      return sendError(res, "Banner not found.", 404);
    }

    return sendSuccess(res, "Banner deleted successfully.", { id });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Banners (Public).
 */
export const getBanners = async (req, res, next) => {
  try {
    const { placement, status } = req.query;
    const query = {};

    if (placement) query.placement = placement;
    if (status) {
      query.status = status;
    } else {
      query.status = "Active"; // Default active
    }

    const banners = await Banner.find(query).sort({ createdAt: -1 });

    return sendSuccess(res, "Banners fetched successfully.", banners);
  } catch (error) {
    next(error);
  }
};
