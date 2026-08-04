import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { checkRequiredFields } from "../validations/validator.js";

/**
 * Add Category (Admin only).
 */
export const addCategory = async (req, res, next) => {
  try {
    const required = ["name"];
    const missing = checkRequiredFields(req.body, required);
    if (missing) {
      return sendError(res, `Required field missing: ${missing}`, 400);
    }

    const { name, description, status } = req.body;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    const existingCategory = await Category.findOne({ $or: [{ name }, { slug }] });
    if (existingCategory) {
      return sendError(res, "Category name or slug already exists.", 400);
    }

    const newCategory = await Category.create({
      name,
      description,
      status: status || "Active",
      slug
    });

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
    const { name, description, status } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return sendError(res, "Category not found.", 404);
    }

    if (name && name !== category.name) {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const existing = await Category.findOne({ $or: [{ name }, { slug }] });
      if (existing && existing._id.toString() !== id) {
        return sendError(res, "Category name or slug already in use.", 400);
      }
      category.name = name;
      category.slug = slug;
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
    const category = await Category.findById(id);
    if (!category) {
      return sendError(res, "Category not found.", 404);
    }

    // Optional Check: Are there products assigned to this category?
    const productsCount = await Product.countDocuments({ category: category._id });
    if (productsCount > 0) {
      return sendError(res, `Cannot delete. Category has ${productsCount} associated products.`, 400);
    }

    await Category.findByIdAndDelete(id);

    return sendSuccess(res, "Category deleted successfully.", { id });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Categories (Public).
 */
export const getCategories = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }

    const categories = await Category.find(query).sort({ name: 1 });

    // Inject Product Counts dynamically to match frontend expectations
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat._id });
        return {
          id: cat._id,
          name: cat.name,
          description: cat.description,
          status: cat.status,
          slug: cat.slug,
          productCount: count,
          createdAt: cat.createdAt
        };
      })
    );

    return sendSuccess(res, "Categories fetched successfully.", categoriesWithCount);
  } catch (error) {
    next(error);
  }
};
