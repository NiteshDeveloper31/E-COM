import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { getPaginationMeta } from "../utils/pagination.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { checkRequiredFields } from "../validations/validator.js";

const CATEGORY_POPULATE = { path: "category", select: "name slug status" };

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
 * Get Products (Public).
 * Supports search term fuzzy query, category filter, status filter, and pagination.
 */
export const getProducts = async (req, res, next) => {
  try {
    const { search, category, status, page = 1, limit = 10 } = req.query;
    
    const query = {};

    // Filter by Status (Public gets Active, Admin can request specific ones)
    if (status) {
      query.status = status;
    } else {
      query.status = "Active"; // Default
    }

    // Category Filter (accepts a category id or its name)
    if (category) {
      let categoryDoc = null;
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryDoc = await Category.findById(category);
      }
      if (!categoryDoc) {
        categoryDoc = await Category.findOne({ name: category });
      }
      // Fall back to a non-existent id so an unmatched filter yields zero results, not everything.
      query.category = categoryDoc ? categoryDoc._id : new mongoose.Types.ObjectId();
    }

    // Fuzzy text search on Name or Description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const totalProducts = await Product.countDocuments(query);
    const pagination = getPaginationMeta(page, limit, totalProducts);

    const products = await Product.find(query)
      .populate(CATEGORY_POPULATE)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    return sendSuccess(res, "Products fetched successfully.", {
      products,
      pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Single Product by ID (Public).
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate(CATEGORY_POPULATE);

    if (!product) {
      return sendError(res, "Product not found.", 404);
    }

    return sendSuccess(res, "Product retrieved successfully.", product);
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk Import Products (Admin only).
 */
export const bulkImportProducts = async (req, res, next) => {
  try {
    const { products: rawProducts } = req.body;

    if (!Array.isArray(rawProducts) || rawProducts.length === 0) {
      return sendError(res, "Products array is required for bulk import.", 400);
    }

    // Find default category or create "General" category if needed
    let defaultCat = await Category.findOne({ status: "Active" });
    if (!defaultCat) {
      defaultCat = await Category.create({ name: "General", slug: "general", status: "Active" });
    }

    const categoriesList = await Category.find();

    const createdProducts = [];
    for (const item of rawProducts) {
      if (!item.name) continue;

      // Find matching category by name or ID
      let categoryId = defaultCat._id;
      if (item.category) {
        const found = categoriesList.find(c =>
          c._id.toString() === item.category ||
          c.name.toLowerCase() === String(item.category).toLowerCase()
        );
        if (found) categoryId = found._id;
      }

      // Format shelf life (e.g., if 1080 is passed, append "Days" if numeric)
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
