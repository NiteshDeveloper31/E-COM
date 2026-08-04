import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { getPaginationMeta } from "../utils/pagination.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { checkRequiredFields } from "../validations/validator.js";
import Razorpay from "razorpay";
import crypto from "crypto";

/**
 * Create Order (Customer only).
 */
export const createOrder = async (req, res, next) => {
  try {
    const required = ["items", "shippingAddress", "paymentMethod"];
    const missing = checkRequiredFields(req.body, required);
    if (missing) {
      return sendError(res, `Required field missing: ${missing}`, 400);
    }

    const { items, shippingAddress, paymentMethod } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return sendError(res, "Order items must be a non-empty array.", 400);
    }

    // Process and validate items stock availability
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return sendError(res, `Product not found: ${item.productId}`, 404);
      }

      if (product.status !== "Active") {
        return sendError(res, `Product ${product.name} is currently unavailable.`, 400);
      }

      if (product.stock < item.quantity) {
        return sendError(res, `Insufficient stock for: ${product.name}. Available: ${product.stock}`, 400);
      }

      // Deduct Stock immediately
      product.stock -= item.quantity;
      await product.save();

      const itemCost = product.price * item.quantity;
      subtotal += itemCost;

      processedItems.push({
        productId: product._id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    // Calculations
    const taxRate = 0.05; // 5% GST
    const tax = Math.round(subtotal * taxRate);
    const shipping = subtotal >= 1000 ? 0 : 50; // Free shipping over ₹1000, else ₹50
    const total = subtotal + tax + shipping;

    const newOrder = await Order.create({
      userId: req.user._id,
      items: processedItems,
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      orderStatus: "Pending",
      shippingAddress,
      timeline: [
        {
          status: "Pending",
          date: new Date()
        }
      ]
    });

    return sendSuccess(res, "Order placed successfully.", newOrder, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Authenticated User Orders.
 */
export const getUserOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const totalOrders = await Order.countDocuments({ userId: req.user._id });
    const pagination = getPaginationMeta(page, limit, totalOrders);

    const orders = await Order.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    return sendSuccess(res, "Orders retrieved successfully.", { orders, pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Order Details.
 */
export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("userId", "name email phone");
    
    if (!order) {
      return sendError(res, "Order not found.", 404);
    }

    // Authorization: User must own the order or be admin
    if (req.user.role !== "admin" && order.userId._id.toString() !== req.user._id.toString()) {
      return sendError(res, "Unauthorized access to order logs.", 403);
    }

    return sendSuccess(res, "Order details retrieved successfully.", order);
  } catch (error) {
    next(error);
  }
};

/**
 * Get All Orders (Admin only).
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const { orderStatus, page = 1, limit = 10 } = req.query;
    const query = {};
    if (orderStatus) {
      query.orderStatus = orderStatus;
    }

    const totalOrders = await Order.countDocuments(query);
    const pagination = getPaginationMeta(page, limit, totalOrders);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit)
      .populate("userId", "name email phone");

    return sendSuccess(res, "All orders fetched successfully.", { orders, pagination });
  } catch (error) {
    next(error);
  }
};

/**
 * Update Order Status (Admin only).
 */
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;

    if (!orderStatus) {
      return sendError(res, "Please specify new order status.", 400);
    }

    const order = await Order.findById(id);
    if (!order) {
      return sendError(res, "Order not found.", 404);
    }

    if (order.orderStatus === orderStatus) {
      return sendError(res, "Order is already in this status state.", 400);
    }

    // Process cancellations (stock replenishment)
    if (orderStatus === "Cancelled" && order.orderStatus !== "Cancelled") {
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }
      order.paymentStatus = "Failed";
    }

    // Process delivery payment sync
    if (orderStatus === "Delivered") {
      order.paymentStatus = "Paid";
    }

    order.orderStatus = orderStatus;
    order.timeline.push({
      status: orderStatus,
      date: new Date()
    });

    await order.save();
    const populatedOrder = await Order.findById(order._id).populate("userId", "name email phone");
    return sendSuccess(res, `Order status updated to ${orderStatus} successfully.`, populatedOrder);
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel Order (User or Admin).
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    
    if (!order) {
      return sendError(res, "Order not found.", 404);
    }

    // Authorization: User must own the order or be admin
    if (req.user.role !== "admin" && order.userId.toString() !== req.user._id.toString()) {
      return sendError(res, "Unauthorized access to cancel this order.", 403);
    }

    // Validations: Cannot cancel if already Shipped or Delivered
    if (order.orderStatus === "Shipped" || order.orderStatus === "Delivered") {
      return sendError(res, `Cannot cancel order. It has already been ${order.orderStatus.toLowerCase()}.`, 400);
    }

    if (order.orderStatus === "Cancelled") {
      return sendError(res, "Order has already been cancelled.", 400);
    }

    // Replenish stock
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.orderStatus = "Cancelled";
    order.paymentStatus = "Failed";
    order.timeline.push({
      status: "Cancelled",
      date: new Date()
    });

    await order.save();
    return sendSuccess(res, "Order cancelled successfully. Stocks returned to inventory.", order);
  } catch (error) {
    next(error);
  }
};

/**
 * Initialize Razorpay order (Customer only)
 */
export const createRazorpayOrder = async (req, res, next) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return sendError(res, "Razorpay API keys are not configured in environment.", 500);
    }

    const required = ["items", "shippingAddress"];
    const missing = checkRequiredFields(req.body, required);
    if (missing) {
      return sendError(res, `Required field missing: ${missing}`, 400);
    }

    const { items, shippingAddress } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return sendError(res, "Order items must be a non-empty array.", 400);
    }

    // Process and validate items stock availability
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return sendError(res, `Product not found: ${item.productId}`, 404);
      }

      if (product.status !== "Active") {
        return sendError(res, `Product ${product.name} is currently unavailable.`, 400);
      }

      if (product.stock < item.quantity) {
        return sendError(res, `Insufficient stock for: ${product.name}. Available: ${product.stock}`, 400);
      }

      // Deduct Stock immediately
      product.stock -= item.quantity;
      await product.save();

      const itemCost = product.price * item.quantity;
      subtotal += itemCost;

      processedItems.push({
        productId: product._id,
        productName: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    // Calculations
    const taxRate = 0.05; // 5% GST
    const tax = Math.round(subtotal * taxRate);
    const shipping = subtotal >= 1000 ? 0 : 50; // Free shipping over ₹1000, else ₹50
    const total = subtotal + tax + shipping;

    // Initialize Razorpay
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });

    const options = {
      amount: Math.round(total * 100), // convert to paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create Order in DB (Pending Payment status)
    const newOrder = await Order.create({
      userId: req.user._id,
      items: processedItems,
      subtotal,
      tax,
      shipping,
      total,
      paymentMethod: "Razorpay",
      paymentStatus: "Pending",
      razorpayOrderId: razorpayOrder.id,
      orderStatus: "Pending",
      shippingAddress,
      timeline: [
        {
          status: "Pending",
          date: new Date()
        }
      ]
    });

    return sendSuccess(res, "Razorpay order initialized successfully.", {
      key_id: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      razorpayOrderId: razorpayOrder.id,
      orderId: newOrder._id,
      customer: {
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || ""
      }
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Verify Razorpay payment signature (Customer only)
 */
export const verifyRazorpayPayment = async (req, res, next) => {
  try {
    const required = ["orderId", "razorpayOrderId", "razorpayPaymentId", "razorpaySignature"];
    const missing = checkRequiredFields(req.body, required);
    if (missing) {
      return sendError(res, `Required field missing: ${missing}`, 400);
    }

    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return sendError(res, "Order not found.", 404);
    }

    // Verify signature
    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpayOrderId + "|" + razorpayPaymentId)
      .digest("hex");

    if (generated_signature === razorpaySignature) {
      // Payment Successful
      order.paymentStatus = "Paid";
      order.orderStatus = "Processing";
      order.razorpayPaymentId = razorpayPaymentId;
      order.razorpaySignature = razorpaySignature;
      order.timeline.push({
        status: "Paid",
        date: new Date()
      });

      await order.save();
      return sendSuccess(res, "Payment verified successfully.", order);
    } else {
      // Payment Verification Failed
      order.paymentStatus = "Failed";
      order.orderStatus = "Cancelled";
      
      // Replenish stock
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          product.stock += item.quantity;
          await product.save();
        }
      }

      order.timeline.push({
        status: "Payment Verification Failed",
        date: new Date()
      });

      await order.save();
      return sendError(res, "Payment signature verification failed.", 400);
    }
  } catch (error) {
    next(error);
  }
};
