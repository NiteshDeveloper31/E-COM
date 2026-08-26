import GRN from "../models/GRN.js";
import Product from "../models/Product.js";
import ProductMySQL from "../models/mysql/Product.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { notifySubscribersIfStockRestocked } from "./productController.js";

/**
 * Process new GRN Stock Entry and update inventory stock live.
 */
export const createGRN = async (req, res, next) => {
  try {
    const { productId, receivedQty, goodQty, badQty, notes } = req.body;

    if (!productId) {
      return sendError(res, "Product selection is required for GRN.", 400);
    }

    const recQtyNum = parseInt(receivedQty) || 0;
    const goodQtyNum = parseInt(goodQty) || 0;
    const badQtyNum = parseInt(badQty) || 0;

    if (recQtyNum <= 0) {
      return sendError(res, "Received quantity must be greater than 0.", 400);
    }

    if (goodQtyNum < 0 || badQtyNum < 0) {
      return sendError(res, "Quantities cannot be negative numbers.", 400);
    }

    let product = null;

    if (!isNaN(productId)) {
      product = await ProductMySQL.findByPk(Number(productId));
    }
    if (!product) {
      product = await Product.findById(productId).catch(() => null);
    }

    if (!product) {
      return sendError(res, "Selected product not found.", 404);
    }

    const previousStock = product.stock || 0;
    const newStock = previousStock + goodQtyNum;

    // Update Product stock & badInventory live in DB
    product.stock = newStock;
    product.badInventory = (product.badInventory || 0) + badQtyNum;
    await product.save();

    // Trigger Restock Email Notification if product has stock and pending subscribers
    if (newStock > 0) {
      await notifySubscribersIfStockRestocked(product);
    }

    const prodId = product.id || product._id;

    // Create GRN Audit Log Entry
    const grnRecord = await GRN.create({
      productId: String(prodId),
      productName: product.name,
      sku: product.sku || "N/A",
      weight: product.weight || "",
      previousStock,
      receivedQty: recQtyNum,
      goodQty: goodQtyNum,
      badQty: badQtyNum,
      newStock,
      notes: notes || "",
      processedBy: req.user ? `${req.user.name} (${req.user.email})` : "Admin User"
    });

    return sendSuccess(
      res,
      `GRN processed! Added ${goodQtyNum} good items to ${product.name}. New Stock: ${newStock}`,
      { grn: grnRecord, updatedProduct: product },
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get all GRN Audit Logs.
 */
export const getGRNLogs = async (req, res, next) => {
  try {
    const logs = await GRN.find()
      .populate("productId", "name sku image weight stock")
      .sort({ createdAt: -1 })
      .limit(200);

    return sendSuccess(res, "GRN audit history fetched successfully.", logs);
  } catch (error) {
    next(error);
  }
};
