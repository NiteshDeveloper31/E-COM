import Category from "../models/Category.js";
import CategoryMySQL from "../models/mysql/Category.js";
import Product from "../models/Product.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { checkRequiredFields } from "../validations/validator.js";

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
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    let newCategory = null;
    try {
      newCategory = await CategoryMySQL.create({
        name,
        image,
        status: status || "Active",
        slug
      });
    } catch (mysqlErr) {
      newCategory = await Category.create({
        name,
        displayName: displayName || name,
        image,
        description,
        status: status || "Active",
        slug
      });
    }

    return sendSuccess(res, "Category created successfully.", newCategory, 201);
  } catch (error) {
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
      category = await Category.findById(id);
    }

    if (!category) {
      return sendError(res, "Category not found.", 404);
    }

    if (name) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      category.name = name;
      category.slug = slug;
    }

    if (displayName !== undefined && category.displayName !== undefined) category.displayName = displayName;
    if (image !== undefined) {
      if (!image) {
        return sendError(res, "Category image is compulsory.", 400);
      }
      category.image = image;
    }
    if (description !== undefined && category.description !== undefined) category.description = description;
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
    try {
      if (!isNaN(id)) {
        await CategoryMySQL.destroy({ where: { id } });
      }
    } catch (err) {}
    await Category.findByIdAndDelete(id).catch(() => {});

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
      categories = await Category.find(query).sort({ createdAt: -1 });
    }

    return sendSuccess(res, "Categories fetched successfully.", categories);
  } catch (error) {
    next(error);
  }
};
