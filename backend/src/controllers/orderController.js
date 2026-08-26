import Coupon from "../models/Coupon.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import OrderMySQL from "../models/mysql/Order.js";
import ProductMySQL from "../models/mysql/Product.js";
import UserMySQL from "../models/mysql/User.js";
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

    // Auto-generate Sequential Order Code: RS_2410, RS_2411, etc.
    let lastOrder = null;
    try {
      lastOrder = await OrderMySQL.findOne({ order: [["id", "DESC"]] });
    } catch (e) {
      lastOrder = await Order.findOne({ orderCode: /^RS_\d+/ }).sort({ createdAt: -1 }).catch(() => null);
    }

    let nextNumber = 2410;
    if (lastOrder && lastOrder.orderCode) {
      const match = lastOrder.orderCode.match(/RS_(\d+)/);
      if (match && match[1]) {
        const lastNum = parseInt(match[1], 10);
        if (!isNaN(lastNum) && lastNum >= 2410) {
          nextNumber = lastNum + 1;
        }
      }
    }
    const orderCode = `RS_${nextNumber}`;
    const invoiceCode = `INV_RS_${nextNumber}`;

    for (const item of items) {
      const rawId = item.productId || item.product?.id || item.product?._id || item.product;
      let product = null;

      if (!isNaN(rawId)) {
        product = await ProductMySQL.findByPk(Number(rawId));
      }
      if (!product) {
        product = await Product.findById(rawId).catch(() => null);
      }

      if (!product) {
        return sendError(res, `Product not found: ${rawId}`, 404);
      }

      if (product.status !== "Active") {
        return sendError(res, `Product ${product.name} is currently unavailable.`, 400);
      }

      const availableToSell = Math.max(0, product.stock - (product.blockedInOrders || 0));
      if (availableToSell < item.quantity) {
        return sendError(res, `Insufficient stock for: ${product.name}. Available to sell: ${availableToSell}`, 400);
      }

      // Reserve / Block quantity in orders
      if (typeof product.save === "function") {
        product.blockedInOrders = (product.blockedInOrders || 0) + item.quantity;
        await product.save().catch(() => {});
      }

      const itemCost = product.price * item.quantity;
      subtotal += itemCost;

      processedItems.push({
        saleOrderItemCode: `${orderCode}-ITEM-${processedItems.length + 1}`,
        productId: product.id || product._id,
        productName: product.name,
        sku: product.sku || `RS-${product.name.slice(0, 3).toUpperCase()}-9015`,
        price: product.price,
        quantity: item.quantity,
        image: product.image,
        gst: product.gst || 0
      });
    }

    // Calculations
    const SELLER_STATE = "Bihar";
    const UNION_TERRITORIES = ["Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"];

    const buyerState = shippingAddress.state || "";
    const isSameState = buyerState.toLowerCase() === SELLER_STATE.toLowerCase();
    const isUnionTerritory = UNION_TERRITORIES.some(ut => ut.toLowerCase() === buyerState.toLowerCase());

    // Calculate GST
    let totalGstAmount = 0;
    let totalCessAmount = 0;
    for (const item of processedItems) {
      const itemTotal = item.price * item.quantity;
      const gstRate = item.gst || 0;
      totalGstAmount += Math.round(itemTotal * gstRate / 100);
    }

    let taxBreakdown = {
      cgst: 0, cgstRate: 0,
      sgst: 0, sgstRate: 0,
      igst: 0, igstRate: 0,
      utgst: 0, utgstRate: 0,
      cess: totalCessAmount, cessRate: 0,
      tcsRate: 0, tcsAmount: 0
    };

    if (isSameState) {
      taxBreakdown.cgst = Math.round(totalGstAmount / 2);
      taxBreakdown.sgst = Math.round(totalGstAmount / 2);
    } else if (isUnionTerritory) {
      taxBreakdown.cgst = Math.round(totalGstAmount / 2);
      taxBreakdown.utgst = Math.round(totalGstAmount / 2);
    } else {
      taxBreakdown.igst = totalGstAmount;
    }

    const finalSubtotal = req.body.subtotal !== undefined ? Number(req.body.subtotal) : subtotal;
    const couponDiscount = Number(req.body.couponDiscount || req.body.discount || 0);
    const couponCode = String(req.body.couponCode || req.body.voucherCode || req.body.coupon || "").trim().toUpperCase();
    const shipping = req.body.shipping !== undefined ? Number(req.body.shipping) : (req.body.deliveryCharge !== undefined ? Number(req.body.deliveryCharge) : (finalSubtotal >= 1000 ? 0 : 50));
    const tax = req.body.tax !== undefined ? Number(req.body.tax) : 0;
    const total = req.body.total !== undefined ? Number(req.body.total) : Math.max(0, Math.round(finalSubtotal + tax + shipping - couponDiscount));

    let newOrder = null;
    const rawUserId = req.user.id || req.user._id;
    let validUserId = null;

    if (!isNaN(rawUserId)) {
      const u = await UserMySQL.findByPk(Number(rawUserId));
      if (u) validUserId = u.id;
    }

    try {
      newOrder = await OrderMySQL.create({
        orderCode,
        invoiceCode,
        userId: validUserId,
        customerName: req.user.name || "Customer",
        customerEmail: req.user.email || "",
        customerPhone: req.user.phone || "",
        items: processedItems,
        subtotal,
        tax,
        shipping,
        discount: couponDiscount,
        couponCode: couponCode,
        total,
        shippingAddress,
        billingAddress: req.body.billingAddress || shippingAddress,
        paymentMethod,
        paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
        orderStatus: "Pending"
      });

      // Increment coupon usage count and per-user count
      if (couponCode) {
        try {
          const couponDoc = await Coupon.findOne({ code: couponCode });
          if (couponDoc) {
            couponDoc.usedCount = (couponDoc.usedCount || 0) + 1;
            const userIdStr = String(validUserId || req.user.id || req.user._id || "");
            if (userIdStr) {
              const existingUsage = (couponDoc.usedByUsers || []).find(u => String(u.userId) === userIdStr);
              if (existingUsage) {
                existingUsage.count += 1;
              } else {
                couponDoc.usedByUsers.push({ userId: userIdStr, count: 1 });
              }
            }
            await couponDoc.save().catch(() => {});
          }
        } catch (err) {
          console.error("Failed to update coupon usage count:", err);
        }
      }
    } catch (mysqlErr) {
      console.error("OrderMySQL creation failed:", mysqlErr.message);
      return sendError(res, `Failed to place order: ${mysqlErr.message}`, 500);
    }

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
    let order = null;

    if (!isNaN(id)) {
      const sqlOrder = await OrderMySQL.findByPk(Number(id), {
        include: [{ model: UserMySQL, as: "user", attributes: ["name", "email", "phone"], required: false }]
      });
      if (sqlOrder) {
        const plain = sqlOrder.get({ plain: true });
        const u = plain.user || {};
        order = {
          ...plain,
          id: plain.id,
          customerName: plain.customerName || u.name || "N/A",
          customerEmail: plain.customerEmail || u.email || "",
          customerPhone: plain.customerPhone || u.phone || "N/A"
        };
      }
    }

    if (!order) {
      order = await Order.findById(id)
        .populate("userId", "name email phone")
        .catch(() => null);
    }
    
    if (!order) {
      return sendError(res, "Order not found.", 404);
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
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let orders = [];
    let totalOrders = 0;

    try {
      const where = {};
      if (orderStatus) where.orderStatus = orderStatus;
      const { rows, count } = await OrderMySQL.findAndCountAll({
        where,
        include: [{ model: UserMySQL, as: "user", attributes: ["name", "email", "phone"], required: false }],
        order: [["id", "DESC"]],
        limit: limitNum,
        offset
      });
      orders = rows.map((o) => {
        const plain = o.get({ plain: true });
        const u = plain.user || {};
        return {
          ...plain,
          customerName: plain.customerName || u.name || "N/A",
          customerEmail: plain.customerEmail || u.email || "",
          customerPhone: plain.customerPhone || u.phone || "N/A"
        };
      });
      totalOrders = count;
    } catch (mysqlErr) {
      const query = {};
      if (orderStatus) query.orderStatus = orderStatus;
      totalOrders = await Order.countDocuments(query).catch(() => 0);
      orders = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limitNum)
        .populate("userId", "name email phone")
        .catch(() => []);
    }

    const pagination = getPaginationMeta(pageNum, limitNum, totalOrders);

    return sendSuccess(res, "All orders fetched successfully.", { orders, pagination });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { orderStatus, shippingCourier, trackingNumber, packetNumber } = req.body;

    let order = null;
    let isMySQL = false;

    if (!isNaN(id)) {
      order = await OrderMySQL.findByPk(Number(id));
      if (order) isMySQL = true;
    }
    if (!order) {
      order = await Order.findById(id).catch(() => null);
    }

    if (!order) {
      return sendError(res, "Order not found.", 404);
    }

    const currentStatus = order.orderStatus;
    const newStatus = orderStatus || currentStatus;

    const validStatuses = ["Pending", "Processing", "On Hold", "Shipped", "Delivered", "Cancelled"];
    if (orderStatus && !validStatuses.includes(orderStatus)) {
      return sendError(res, "Invalid order status.", 400);
    }

    // Deduct physical stock from warehouse when Order becomes Shipped or Delivered
    if ((newStatus === "Shipped" || newStatus === "Delivered") && !order.isStockDeducted) {
      const itemsList = order.items || [];
      for (const item of itemsList) {
        const prodId = item.productId || item.product?.id || item.product?._id;
        let product = null;
        if (!isNaN(prodId)) product = await ProductMySQL.findByPk(Number(prodId));
        if (!product) product = await Product.findById(prodId).catch(() => null);
        if (product) {
          if (product.isBundle && product.bundleItems && product.bundleItems.length > 0) {
            for (const child of product.bundleItems) {
              const childId = child.productId;
              let childProd = null;
              if (!isNaN(childId)) childProd = await ProductMySQL.findByPk(Number(childId));
              if (!childProd) childProd = await Product.findById(childId).catch(() => null);
              if (childProd) {
                const totalChildQty = (child.quantity || 1) * item.quantity;
                childProd.stock = Math.max(0, childProd.stock - totalChildQty);
                childProd.blockedInOrders = Math.max(0, (childProd.blockedInOrders || 0) - totalChildQty);
                if (typeof childProd.save === "function") await childProd.save().catch(() => {});
              }
            }
          }
          product.stock = Math.max(0, product.stock - item.quantity);
          if (product.blockedInOrders !== undefined) {
            product.blockedInOrders = Math.max(0, (product.blockedInOrders || 0) - item.quantity);
          }
          if (typeof product.save === "function") await product.save().catch(() => {});
        }
      }
      order.isStockDeducted = true;
    }

    // Restore stock if status changed back from Shipped/Delivered to Processing/Pending
    if (["Pending", "Processing", "On Hold"].includes(newStatus) && order.isStockDeducted) {
      const itemsList = order.items || [];
      for (const item of itemsList) {
        const prodId = item.productId || item.product?.id || item.product?._id;
        let product = null;
        if (!isNaN(prodId)) product = await ProductMySQL.findByPk(Number(prodId));
        if (!product) product = await Product.findById(prodId).catch(() => null);
        if (product) {
          product.stock = (product.stock || 0) + item.quantity;
          if (product.blockedInOrders !== undefined) {
            product.blockedInOrders = (product.blockedInOrders || 0) + item.quantity;
          }
          if (typeof product.save === "function") await product.save().catch(() => {});
        }
      }
      order.isStockDeducted = false;
    }

    // Update fulfillment fields if provided
    if (shippingCourier !== undefined) order.shippingCourier = shippingCourier;
    if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
    if (packetNumber !== undefined) order.packetNumber = packetNumber;

    if (["Processing", "Shipped", "Delivered"].includes(newStatus)) {
      order.isSkuVerified = true;
    }
    order.orderStatus = newStatus;
    if (newStatus === "Delivered") {
      order.paymentStatus = "Paid";
    }

    const currentTimeline = Array.isArray(order.timeline) ? order.timeline : [];
    order.timeline = [
      ...currentTimeline,
      { status: newStatus, date: new Date() }
    ];

    if (isMySQL) {
      await order.save();
      const updatedOrder = order.get({ plain: true });
      return sendSuccess(res, `Order status updated to ${newStatus} successfully.`, updatedOrder);
    } else {
      await order.save();
      return sendSuccess(res, `Order status updated to ${newStatus} successfully.`, order);
    }
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
    if (req.user.role !== "admin" && req.user.role !== "superadmin" && req.user.email !== "admin@reetsutra.com" && order.userId.toString() !== req.user._id.toString()) {
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

    // Auto-generate Order Code & Invoice Code
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const orderCode = `ORD-${dateStr}-${randomSuffix}`;
    const invoiceCode = `INV-${dateStr}-${randomSuffix}`;

    // Create Order in DB (Pending Payment status)
    const newOrder = await Order.create({
      userId: req.user._id,
      orderCode,
      invoiceCode,
      invoiceDate: new Date(),
      channelName: "Website",
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
