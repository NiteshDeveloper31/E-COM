import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import StockNotification from "../models/StockNotification.js";
import User from "../models/User.js";
import { sendBackInStockEmail } from "../services/emailService.js";
import { getPaginationMeta } from "../utils/pagination.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { checkRequiredFields } from "../validations/validator.js";

const CATEGORY_POPULATE = { path: "category", select: "name slug status" };

/**
 * Trigger Back in Stock Emails if product stock restocked > 0
 */
export const notifySubscribersIfStockRestocked = async (productDoc) => {
  try {
    if (!productDoc || productDoc.stock <= 0) return;

    const pendingNotifications = await StockNotification.find({
      product: productDoc._id,
      status: "Pending"
    }).populate("user", "name email");

    if (pendingNotifications.length === 0) return;

    console.log(`🔔 Restock Alert: Sending ${pendingNotifications.length} notifications for ${productDoc.name}`);

    const discountedPrice = Math.round(productDoc.price * (1 - (productDoc.discount || 0) / 100));

    for (const sub of pendingNotifications) {
      let realName = "";
      if (sub.user && sub.user.name) {
        realName = sub.user.name;
      } else {
        const foundUser = await User.findOne({ email: sub.email });
        if (foundUser && foundUser.name) {
          realName = foundUser.name;
        }
      }

      await sendBackInStockEmail({
        toEmail: sub.email,
        userName: realName,
        productName: productDoc.name,
        productImage: productDoc.image,
        productPrice: discountedPrice,
        productId: productDoc._id,
        shortDescription: productDoc.shortDescription || productDoc.description || ""
      });
      sub.status = "Notified";
      sub.notifiedAt = new Date();
      await sub.save();
    }
  } catch (err) {
    console.error("Error triggering back in stock notifications:", err);
  }
};

/**
 * Add a new Product (Admin only).
 */
export const addProduct = async (req, res, next) => {
  try {
    const required = ["name", "price", "category", "stock", "image"];
    const missing = checkRequiredFields(req.body, required);
    if (missing) {
      return sendError(res, `Required field missing: ${missing}`, 400);
    }

    const { name, sku, description, price, compareAtPrice, category, stock, status, image, images, video, weight, shortDescription, ingredients, benefits, expiryDate, brand, gst, hsnCode, eanCode, size, length, width, height, cessRate, facility, badInventory, shelfLife } = req.body;

    if (!mongoose.Types.ObjectId.isValid(category)) {
      return sendError(res, "Invalid category selected.", 400);
    }
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return sendError(res, "Selected category does not exist.", 400);
    }

    // Generate unique SKU if not provided
    const productSku = sku || `RS-${name.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const existingProduct = await Product.findOne({ sku: productSku });
    if (existingProduct) {
      return sendError(res, `Product with SKU ${productSku} already exists.`, 400);
    }

    const newProduct = await Product.create({
      name,
      sku: productSku,
      description,
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      category: categoryDoc._id,
      stock: parseInt(stock),
      status: status || "Active",
      image,
      images: images || [],
      video: video || "",
      weight: weight || "",
      shortDescription: shortDescription || "",
      ingredients: ingredients || [],
      benefits: benefits || [],
      expiryDate: expiryDate || null,
      brand: brand || "",
      gst: gst ? parseFloat(gst) : 0,
      hsnCode: hsnCode || "",
      eanCode: eanCode || "",
      size: size || "",
      length: length ? parseFloat(length) : null,
      width: width ? parseFloat(width) : null,
      height: height ? parseFloat(height) : null,
      cessRate: cessRate ? parseFloat(cessRate) : 0,
      facility: facility || "Main Warehouse",
      badInventory: badInventory ? parseInt(badInventory) : 0,
      shelfLife: shelfLife || ""
    });

    await newProduct.populate(CATEGORY_POPULATE);

    // Notify if initial stock > 0
    if (newProduct.stock > 0) {
      await notifySubscribersIfStockRestocked(newProduct);
    }

    return sendSuccess(res, "Product created successfully.", newProduct, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Edit a Product (Admin only).
 */
export const editProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return sendError(res, "Product not found.", 404);
    }

    const previousStock = product.stock || 0;

    const fieldsToUpdate = [
      "name",
      "sku",
      "description",
      "price",
      "compareAtPrice",
      "category",
      "stock",
      "status",
      "image",
      "images",
      "video",
      "weight",
      "shortDescription",
      "ingredients",
      "benefits",
      "expiryDate",
      "brand",
      "gst",
      "hsnCode",
      "eanCode",
      "size",
      "length",
      "width",
      "height",
      "cessRate",
      "facility",
      "badInventory",
      "shelfLife"
    ];

    if (req.body.category !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(req.body.category)) {
        return sendError(res, "Invalid category selected.", 400);
      }
      const categoryDoc = await Category.findById(req.body.category);
      if (!categoryDoc) {
        return sendError(res, "Selected category does not exist.", 400);
      }
    }

    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        if (field === "price" || field === "compareAtPrice" || field === "gst" || field === "length" || field === "width" || field === "height" || field === "cessRate") {
          product[field] = req.body[field] ? parseFloat(req.body[field]) : null;
        } else if (field === "stock" || field === "badInventory") {
          product[field] = parseInt(req.body[field]) || 0;
        } else {
          product[field] = req.body[field];
        }
      }
    });

    await product.save();
    await product.populate(CATEGORY_POPULATE);

    // Trigger Restock Notification Emails if stock was 0 or restocked > 0
    if (product.stock > 0 && previousStock <= 0) {
      await notifySubscribersIfStockRestocked(product);
    }

    return sendSuccess(res, "Product updated successfully.", product);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a Product (Admin only).
 */
export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return sendError(res, "Product not found.", 404);
    }

    return sendSuccess(res, "Product deleted successfully.", { id });
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Products with search, category, status & pagination filters.
 */
export const getProducts = async (req, res, next) => {
  try {
    const { search, category, status, page = 1, limit = 50 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
        { brand: { $regex: search, $options: "i" } }
      ];
    }

    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        const catDoc = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, "i") } });
        if (catDoc) query.category = catDoc._id;
      }
    }

    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate(CATEGORY_POPULATE)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query)
    ]);

    const meta = getPaginationMeta(total, pageNum, limitNum);

    return sendSuccess(res, "Products fetched successfully.", {
      products,
      pagination: meta
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Product By ID.
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate(CATEGORY_POPULATE);

    if (!product) {
      return sendError(res, "Product not found.", 404);
    }

    return sendSuccess(res, "Product details fetched.", product);
  } catch (error) {
    next(error);
  }
};

/**
 * Subscribe Customer to Back-In-Stock Email Alerts
 */
export const subscribeStockNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    if (!email || !email.trim()) {
      return sendError(res, "Email address is required.", 400);
    }

    const product = await Product.findById(id);
    if (!product) {
      return sendError(res, "Product not found.", 404);
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if already pending subscription exists
    const existing = await StockNotification.findOne({
      product: id,
      email: cleanEmail,
      status: "Pending"
    });

    if (existing) {
      return sendSuccess(res, `You are already subscribed! We will email ${cleanEmail} as soon as ${product.name} is restocked.`, existing);
    }

    const newSub = await StockNotification.create({
      product: id,
      user: req.user?._id || null,
      email: cleanEmail,
      status: "Pending"
    });

    return sendSuccess(res, `Success! We will email ${cleanEmail} as soon as ${product.name} is back in stock.`, newSub, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk Import Products (Admin only).
 */
export const bulkImportProducts = async (req, res, next) => {
  try {
    const { products } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return sendError(res, "Products array is required for bulk import.", 400);
    }

    const allCategories = await Category.find();

    const createdProducts = [];
    for (const item of products) {
      let categoryId = null;
      if (item.category) {
        const found = allCategories.find(c =>
          c.name.toLowerCase() === String(item.category).toLowerCase()
        );
        if (found) categoryId = found._id;
      }

      let shelfLifeVal = item.shelfLife ? String(item.shelfLife).trim() : "";
      if (shelfLifeVal && !isNaN(shelfLifeVal)) {
        shelfLifeVal = `${shelfLifeVal} Days`;
      }

      const productSku = item.sku || item.eanCode || `RS-${String(item.name).slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      const newP = await Product.create({
        name: item.name,
        sku: productSku,
        eanCode: item.eanCode || "",
        hsnCode: item.hsnCode || "",
        brand: item.brand || "",
        price: item.mrp || item.price ? parseFloat(item.mrp || item.price) : 299,
        compareAtPrice: item.compareAtPrice ? parseFloat(item.compareAtPrice) : null,
        category: categoryId,
        stock: item.stock ? parseInt(item.stock) : 100,
        status: item.status || "Active",
        image: item.image || item.imageUrl || "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80",
        images: item.image ? [item.image] : [],
        weight: item.weight ? String(item.weight) : "",
        length: item.length ? parseFloat(item.length) : null,
        width: item.width ? parseFloat(item.width) : null,
        height: item.height ? parseFloat(item.height) : null,
        shelfLife: shelfLifeVal,
        description: item.description || ""
      });

      createdProducts.push(newP);
    }

    return sendSuccess(res, `Successfully imported ${createdProducts.length} products.`, {
      importedCount: createdProducts.length
    }, 201);
  } catch (error) {
    next(error);
  }
};
