import Category from "../models/Category.js";
import CategoryMySQL from "../models/mysql/Category.js";
import Product from "../models/Product.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { checkRequiredFields } from "../validations/validator.js";
import { saveBase64Image, deleteLocalFile } from "../utils/fileUpload.js";

/**
 * Add Category (Admin only).
 */
export const addCategory = async (req, res, next) => {
  try {
    const required = ["name", "image"];
    const missing = checkRequiredFields(req.body, required);
    if (missing) {
      return sendError(res, `Required field missing: ${missing}. Category image is compulsory.`, 400);
    }

    const { name, displayName, image, description, status } = req.body;
    const cleanName = name.trim();
    const slug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const savedImage = saveBase64Image(image, 'categories');

    // Check if category name already exists in MySQL or Mongo
    const existingSql = await CategoryMySQL.findOne({ where: { name: cleanName } }).catch(() => null);
    if (existingSql) {
      return sendError(res, `Category '${cleanName}' already exists.`, 400);
    }

    const existingMongo = await Category.findOne({ name: cleanName }).catch(() => null);
    if (existingMongo) {
      return sendError(res, `Category '${cleanName}' already exists.`, 400);
    }

    let newCategory = null;
    try {
      newCategory = await CategoryMySQL.create({
        name: cleanName,
        displayName: displayName || cleanName,
        image: savedImage,
        description: description || "",
        status: status || "Active",
        slug
      });
    } catch (mysqlErr) {
      try {
        newCategory = await Category.create({
          name: cleanName,
          displayName: displayName || cleanName,
          image: savedImage,
          description: description || "",
          status: status || "Active",
          slug
        });
      } catch (mongoErr) {
        if (mongoErr.code === 11000 || String(mongoErr.message).includes("E11000")) {
          return sendError(res, `Category '${cleanName}' already exists.`, 400);
        }
        throw mongoErr;
      }
    }

    return sendSuccess(res, "Category created successfully.", newCategory, 201);
  } catch (error) {
    if (error.code === 11000 || String(error.message).includes("E11000")) {
      return sendError(res, `Category already exists.`, 400);
    }
    next(error);
  }
};

/**
 * Edit Category (Admin only).
 */
export const editCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, displayName, image, description, status } = req.body;

    let category = null;
    try {
      if (!isNaN(id)) {
        category = await CategoryMySQL.findByPk(id);
      }
    } catch (err) {}

    if (!category) {
      category = await Category.findById(id).catch(() => null);
    }

    if (!category) {
      return sendError(res, "Category not found.", 404);
    }

    if (name) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      category.name = name;
      category.slug = slug;
    }

    if (displayName !== undefined) category.displayName = displayName;
    if (image !== undefined) {
      if (!image) {
        return sendError(res, "Category image is compulsory.", 400);
      }
      category.image = saveBase64Image(image, 'categories');
    }
    if (description !== undefined) category.description = description;
    if (status !== undefined) category.status = status;

    await category.save();

    return sendSuccess(res, "Category updated successfully.", category);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Category (Admin only).
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isNaN(id)) {
      const cat = await CategoryMySQL.findByPk(Number(id));
      if (cat) {
        if (cat.image) deleteLocalFile(cat.image);
        await cat.destroy();
        return sendSuccess(res, "Category deleted successfully.", { id });
      }
    }

    const catMongo = await Category.findById(id).catch(() => null);
    if (catMongo) {
      if (catMongo.image) deleteLocalFile(catMongo.image);
      await Category.findByIdAndDelete(id);
      return sendSuccess(res, "Category deleted successfully.", { id });
    }

    return sendSuccess(res, "Category deleted successfully.", { id });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Categories (Public & Admin).
 */
export const getCategories = async (req, res, next) => {
  try {
    const { status } = req.query;
    let categories = [];
    try {
      const where = {};
      if (status) where.status = status;
      categories = await CategoryMySQL.findAll({ where, order: [["id", "ASC"]] });
    } catch (mysqlErr) {}

    if (!categories || categories.length === 0) {
      const query = status ? { status } : {};
      categories = await Category.find(query).sort({ createdAt: -1 }).catch(() => []);
    }

    return sendSuccess(res, "Categories fetched successfully.", categories);
  } catch (error) {
    next(error);
  }
};
