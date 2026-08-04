import User from "../models/User.js";
import Order from "../models/Order.js";
import Address from "../models/Address.js";
import { getPaginationMeta } from "../utils/pagination.js";
import { sendSuccess, sendError } from "../utils/response.js";

/**
 * Get Customer Listing (Admin only).
 * Fetches users with role "customer", computes total spent and orders count on the fly.
 */
export const getCustomerListing = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const query = { role: "customer" };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    const totalCustomers = await User.countDocuments(query);
    const pagination = getPaginationMeta(page, limit, totalCustomers);

    const customers = await User.find(query)
      .sort({ createdAt: -1 })
      .skip(pagination.skip)
      .limit(pagination.limit);

    // Compute aggregations dynamically to match frontend expectations
    const customersWithStats = await Promise.all(
      customers.map(async (cust) => {
        // Fetch matching orders
        const orders = await Order.find({ userId: cust._id });
        const ordersCount = orders.length;
        
        // Sum total spent on paid or delivered orders
        const totalSpending = orders
          .filter((o) => o.paymentStatus === "Paid" || o.orderStatus === "Delivered")
          .reduce((sum, o) => sum + o.total, 0);

        return {
          id: cust._id,
          name: cust.name,
          email: cust.email,
          avatar: cust.avatar,
          phone: cust.phone,
          registrationDate: cust.createdAt.toISOString().slice(0, 10),
          totalOrders: ordersCount,
          totalSpending: totalSpending,
          status: "Active" // Default active status. Toggleable in user profiles
        };
      })
    );

    return sendSuccess(res, "Customer listing retrieved successfully.", {
      customers: customersWithStats,
      pagination
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Customer Profile Details (Admin only).
 */
export const getCustomerDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const customer = await User.findById(id).select("-password");
    if (!customer || customer.role !== "customer") {
      return sendError(res, "Customer profile not found.", 404);
    }

    return sendSuccess(res, "Customer details retrieved successfully.", customer);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Customer Address Logs (Admin or Owner).
 */
export const getCustomerAddresses = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check authorization: Owner or Admin
    if (req.user.role !== "admin" && req.user._id.toString() !== userId) {
      return sendError(res, "Unauthorized access to shipping records.", 403);
    }

    const addresses = await Address.find({ userId });
    return sendSuccess(res, "Addresses retrieved successfully.", addresses);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Customer Order Logs (Admin or Owner).
 */
export const getCustomerOrderHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Check authorization: Owner or Admin
    if (req.user.role !== "admin" && req.user._id.toString() !== userId) {
      return sendError(res, "Unauthorized access to order logs.", 403);
    }

    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    return sendSuccess(res, "Orders history retrieved successfully.", orders);
  } catch (error) {
    next(error);
  }
};

/**
 * Add Customer Address (Admin or Owner).
 */
export const addCustomerAddress = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { type, name, street, city, state, zip, phone } = req.body;

    // Check authorization: Owner or Admin
    if (req.user.role !== "admin" && req.user._id.toString() !== userId) {
      return sendError(res, "Unauthorized access to shipping records.", 403);
    }

    const existingCount = await Address.countDocuments({ userId });

    const newAddress = await Address.create({
      userId,
      tag: type || "Home",
      name: name || "Recipient",
      phone: phone || "Not Provided",
      line: street,
      city,
      state,
      zip,
      isDefault: existingCount === 0
    });

    return sendSuccess(res, "Address added successfully.", newAddress);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Customer Address (Admin or Owner).
 */
export const updateCustomerAddress = async (req, res, next) => {
  try {
    const { userId, addressId } = req.params;
    const { type, name, street, city, state, zip, phone } = req.body;

    // Check authorization: Owner or Admin
    if (req.user.role !== "admin" && req.user._id.toString() !== userId) {
      return sendError(res, "Unauthorized access to shipping records.", 403);
    }

    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return sendError(res, "Address not found.", 404);
    }

    if (type) address.tag = type;
    if (name) address.name = name;
    if (street) address.line = street;
    if (city) address.city = city;
    if (state) address.state = state;
    if (zip) address.zip = zip;
    if (phone) address.phone = phone;
    // isDefault is intentionally not settable here — use the dedicated
    // set-default endpoint so "exactly one default" stays enforced in one place.

    await address.save();
    return sendSuccess(res, "Address updated successfully.", address);
  } catch (error) {
    next(error);
  }
};

/**
 * Set Default Customer Address (Admin or Owner).
 */
export const setDefaultCustomerAddress = async (req, res, next) => {
  try {
    const { userId, addressId } = req.params;

    // Check authorization: Owner or Admin
    if (req.user.role !== "admin" && req.user._id.toString() !== userId) {
      return sendError(res, "Unauthorized access to shipping records.", 403);
    }

    const target = await Address.findOne({ _id: addressId, userId });
    if (!target) {
      return sendError(res, "Address not found.", 404);
    }

    await Address.updateMany({ userId, _id: { $ne: addressId } }, { $set: { isDefault: false } });
    target.isDefault = true;
    await target.save();

    return sendSuccess(res, "Default address updated successfully.", target);
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Customer Address (Admin or Owner).
 */
export const deleteCustomerAddress = async (req, res, next) => {
  try {
    const { userId, addressId } = req.params;

    // Check authorization: Owner or Admin
    if (req.user.role !== "admin" && req.user._id.toString() !== userId) {
      return sendError(res, "Unauthorized access to shipping records.", 403);
    }

    const deleted = await Address.findOneAndDelete({ _id: addressId, userId });
    if (!deleted) {
      return sendError(res, "Address not found.", 404);
    }

    return sendSuccess(res, "Address deleted successfully.", null);
  } catch (error) {
    next(error);
  }
};
