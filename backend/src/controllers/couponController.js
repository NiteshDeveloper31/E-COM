import Coupon from "../models/Coupon.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import CategoryMySQL from "../models/mysql/Category.js";
import ProductMySQL from "../models/mysql/Product.js";
import OrderMySQL from "../models/mysql/Order.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * @desc    Create a new coupon (Admin)
 * @route   POST /api/coupons
 * @access  Private/Admin
 */
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      applicableScope,
      applicableCategories,
      applicableProducts,
      minOrderAmount,
      validFrom,
      validUntil,
      usageLimit,
      perUserLimit,
      isActive
    } = req.body;

    if (!code || !discountValue) {
      return sendError(res, "Coupon code and discount value are required.", 400);
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return sendError(res, `Coupon code '${cleanCode}' already exists.`, 400);
    }

    const coupon = await Coupon.create({
      code: cleanCode,
      description: description || "",
      discountType: discountType || "percentage",
      discountValue: Number(discountValue),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      applicableScope: applicableScope || "ALL",
      applicableCategories: Array.isArray(applicableCategories) ? applicableCategories : [],
      applicableProducts: Array.isArray(applicableProducts) ? applicableProducts : [],
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      validFrom: validFrom ? new Date(validFrom) : new Date(),
      validUntil: validUntil ? new Date(validUntil) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      perUserLimit: perUserLimit ? Number(perUserLimit) : 1,
      isActive: isActive !== undefined ? Boolean(isActive) : true
    });

    return sendSuccess(res, "Coupon created successfully.", coupon, 201);
  } catch (error) {
    console.error("Error creating coupon:", error);
    return sendError(res, "Failed to create coupon.", 500, error);
  }
};

/**
 * @desc    Get all coupons (Admin)
 * @route   GET /api/coupons
 * @access  Private/Admin
 */
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return sendSuccess(res, "Coupons fetched successfully.", coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return sendError(res, "Failed to fetch coupons.", 500, error);
  }
};

/**
 * @desc    Get single coupon details (Admin)
 * @route   GET /api/coupons/:id
 * @access  Private/Admin
 */
export const getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return sendError(res, "Coupon not found.", 404);
    }

    return sendSuccess(res, "Coupon details retrieved.", coupon);
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return sendError(res, "Failed to fetch coupon details.", 500, error);
  }
};

/**
 * @desc    Update an existing coupon (Admin)
 * @route   PUT /api/coupons/:id
 * @access  Private/Admin
 */
export const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return sendError(res, "Coupon not found.", 404);
    }

    const {
      code,
      description,
      discountType,
      discountValue,
      maxDiscount,
      applicableScope,
      applicableCategories,
      applicableProducts,
      minOrderAmount,
      validFrom,
      validUntil,
      usageLimit,
      perUserLimit,
      isActive
    } = req.body;

    if (code && code.trim().toUpperCase() !== coupon.code) {
      const cleanCode = code.trim().toUpperCase();
      const existing = await Coupon.findOne({ code: cleanCode });
      if (existing) {
        return sendError(res, `Coupon code '${cleanCode}' is already taken by another coupon.`, 400);
      }
      coupon.code = cleanCode;
    }

    if (description !== undefined) coupon.description = description;
    if (discountType !== undefined) coupon.discountType = discountType;
    if (discountValue !== undefined) coupon.discountValue = Number(discountValue);
    if (maxDiscount !== undefined) coupon.maxDiscount = maxDiscount ? Number(maxDiscount) : null;
    if (applicableScope !== undefined) coupon.applicableScope = applicableScope;
    if (applicableCategories !== undefined) coupon.applicableCategories = Array.isArray(applicableCategories) ? applicableCategories : [];
    if (applicableProducts !== undefined) coupon.applicableProducts = Array.isArray(applicableProducts) ? applicableProducts : [];
    if (minOrderAmount !== undefined) coupon.minOrderAmount = Number(minOrderAmount);
    if (validFrom !== undefined) coupon.validFrom = validFrom ? new Date(validFrom) : coupon.validFrom;
    if (validUntil !== undefined) coupon.validUntil = validUntil ? new Date(validUntil) : null;
    if (usageLimit !== undefined) coupon.usageLimit = usageLimit ? Number(usageLimit) : null;
    if (perUserLimit !== undefined) coupon.perUserLimit = Number(perUserLimit);
    if (isActive !== undefined) coupon.isActive = Boolean(isActive);

    await coupon.save();

    return sendSuccess(res, "Coupon updated successfully.", coupon);
  } catch (error) {
    console.error("Error updating coupon:", error);
    return sendError(res, "Failed to update coupon.", 500, error);
  }
};

/**
 * @desc    Delete a coupon (Admin)
 * @route   DELETE /api/coupons/:id
 * @access  Private/Admin
 */
export const deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) {
      return sendError(res, "Coupon not found.", 404);
    }
    return sendSuccess(res, "Coupon deleted successfully.");
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return sendError(res, "Failed to delete coupon.", 500, error);
  }
};

/**
 * @desc    Validate and apply coupon code (Public / Customer)
 * @route   POST /api/coupons/validate
 * @access  Public
 */
export const validateCoupon = async (req, res) => {
  try {
    const { couponCode, cartSubtotal = 0, cartItems = [], userId = null } = req.body;

    if (!couponCode || !couponCode.trim()) {
      return sendError(res, "Please enter a valid coupon code.", 400);
    }

    const cleanCode = couponCode.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: cleanCode })
      .populate("applicableCategories")
      .populate("applicableProducts");

    if (!coupon) {
      return sendError(res, `Invalid Coupon Code '${cleanCode}'. Please check and try again.`, 404);
    }

    if (!coupon.isActive) {
      return sendError(res, `Coupon '${cleanCode}' is currently inactive.`, 400);
    }

    const now = new Date();
    if (coupon.validFrom && new Date(coupon.validFrom) > now) {
      return sendError(res, `Coupon '${cleanCode}' is not active yet.`, 400);
    }

    if (coupon.validUntil && new Date(coupon.validUntil) < now) {
      return sendError(res, `Coupon '${cleanCode}' has expired on ${new Date(coupon.validUntil).toLocaleDateString()}.`, 400);
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return sendError(res, `Coupon '${cleanCode}' usage limit has been reached.`, 400);
    }

    const effectiveUserId = req.user?.id || req.user?._id || userId;
    const effectiveEmail = req.user?.email || req.body.email || "";

    if (coupon.perUserLimit) {
      let userUsageCount = 0;

      if (effectiveUserId) {
        const userUsage = (coupon.usedByUsers || []).find(u => String(u.userId) === String(effectiveUserId));
        if (userUsage) userUsageCount += userUsage.count;
      }

      if (effectiveUserId || effectiveEmail) {
        try {
          const { Op } = await import("sequelize");
          const whereConditions = [];
          if (effectiveUserId && !isNaN(effectiveUserId)) {
            whereConditions.push({ userId: Number(effectiveUserId) });
          }
          if (effectiveEmail) {
            whereConditions.push({ customerEmail: effectiveEmail });
          }
          if (whereConditions.length > 0) {
            const pastOrdersCount = await OrderMySQL.count({
              where: {
                couponCode: cleanCode,
                [Op.or]: whereConditions
              }
            }).catch(() => 0);
            userUsageCount = Math.max(userUsageCount, pastOrdersCount);
          }
        } catch (e) {}
      }

      if (userUsageCount >= coupon.perUserLimit) {
        return sendError(res, `You have already used coupon '${cleanCode}'. This promo code is limited to ${coupon.perUserLimit} use per customer.`, 400);
      }
    }

    // Minimum Order Threshold check
    const numericSubtotal = Number(cartSubtotal) || 0;
    if (numericSubtotal < coupon.minOrderAmount) {
      return sendError(
        res,
        `Minimum order purchase of ₹${coupon.minOrderAmount} is required to apply coupon '${cleanCode}'. (Add ₹${coupon.minOrderAmount - numericSubtotal} more to your cart)`,
        400
      );
    }

    // Evaluate Scope (ALL vs CATEGORY vs PRODUCT)
    let applicableSubtotal = numericSubtotal;

    if (coupon.applicableScope === "CATEGORY") {
      const categoryIds = (coupon.applicableCategories || []).map(c => String(c._id || c.id || c));
      let categoryNames = (coupon.applicableCategories || []).map(c => String(c.name || c).toLowerCase());

      const numericIds = categoryIds.filter(id => !isNaN(id)).map(Number);
      if (numericIds.length > 0) {
        const catDocs = await CategoryMySQL.findAll({ where: { id: numericIds } }).catch(() => []);
        catDocs.forEach(c => {
          if (c.name) categoryNames.push(c.name.toLowerCase());
        });
      }

      const matchingItems = cartItems.filter(item => {
        const itemCatId = String(item.product?.categoryId || item.product?.category?._id || item.product?.category?.id || item.product?.category || item.categoryId || item.category || "");
        const itemCatName = String(item.product?.category?.name || item.product?.category || item.category || "").toLowerCase();

        return categoryIds.includes(itemCatId) ||
               (itemCatName && categoryNames.includes(itemCatName)) ||
               (itemCatName && categoryNames.some(cn => cn.length > 2 && itemCatName.includes(cn)));
      });

      if (matchingItems.length === 0) {
        return sendError(res, `Coupon '${cleanCode}' is only valid for items in specific selected categories.`, 400);
      }

      applicableSubtotal = matchingItems.reduce((sum, item) => {
        const itemPrice = item.product?.price || item.price || 0;
        const itemQty = item.quantity || 1;
        const itemDisc = item.product?.discount || item.discount || 0;
        const finalPrice = Math.round(itemPrice * (1 - itemDisc / 100));
        return sum + finalPrice * itemQty;
      }, 0);
    } else if (coupon.applicableScope === "PRODUCT") {
      const productIds = (coupon.applicableProducts || []).map(p => String(p._id || p));

      const matchingItems = cartItems.filter(item => {
        const itemProdId = String(item.product?._id || item.product?.id || item.productId || item.id || "");
        return productIds.includes(itemProdId);
      });

      if (matchingItems.length === 0) {
        return sendError(res, `Coupon '${cleanCode}' is only valid for specific promotional items not currently in your cart.`, 400);
      }

      applicableSubtotal = matchingItems.reduce((sum, item) => {
        const itemPrice = item.product?.price || item.price || 0;
        const itemQty = item.quantity || 1;
        const itemDisc = item.product?.discount || item.discount || 0;
        const finalPrice = Math.round(itemPrice * (1 - itemDisc / 100));
        return sum + finalPrice * itemQty;
      }, 0);
    }

    // Calculate Discount
    let discountAmount = 0;
    if (coupon.discountType === "percentage") {
      let raw = (applicableSubtotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && raw > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      } else {
        discountAmount = raw;
      }
    } else {
      // Flat amount
      discountAmount = Math.min(coupon.discountValue, applicableSubtotal);
    }

    discountAmount = Math.round(discountAmount);

    return sendSuccess(res, `✓ Coupon '${cleanCode}' applied successfully! Saved ₹${discountAmount}.`, {
      coupon: {
        id: coupon._id,
        code: coupon.code,
        description: coupon.description,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        applicableScope: coupon.applicableScope,
        minOrderAmount: coupon.minOrderAmount
      },
      discountAmount,
      finalTotal: Math.max(0, numericSubtotal - discountAmount)
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return sendError(res, "Failed to validate coupon code.", 500, error);
  }
};
