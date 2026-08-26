import User from "../models/User.js";
import Order from "../models/Order.js";
import Address from "../models/Address.js";
import UserMySQL from "../models/mysql/User.js";
import OrderMySQL from "../models/mysql/Order.js";
import AddressMySQL from "../models/mysql/Address.js";
import { getPaginationMeta } from "../utils/pagination.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { Op } from "sequelize";

/**
 * Get Customer Listing (Admin only).
 * Fetches users with role "customer", computes total spent and orders count on the fly.
 */
export const getCustomerListing = async (req, res, next) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let customers = [];
    let totalCustomers = 0;

    try {
      const where = { role: "customer" };
      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ];
      }
      const { rows, count } = await UserMySQL.findAndCountAll({
        where,
        order: [["id", "DESC"]],
        limit: limitNum,
        offset
      });
      customers = rows;
      totalCustomers = count;
    } catch (mysqlErr) {
      const query = { role: "customer" };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } }
        ];
      }
      const pagination = getPaginationMeta(page, limit, await User.countDocuments(query));
      customers = await User.find(query).sort({ createdAt: -1 }).skip(pagination.skip).limit(pagination.limit);
      totalCustomers = customers.length;
    }

    const pagination = getPaginationMeta(pageNum, limitNum, totalCustomers);

    const customersWithStats = await Promise.all(
      customers.map(async (cust) => {
        const custId = cust.id || cust._id;
        let orders = [];
        try {
          orders = await OrderMySQL.findAll({ where: { userId: custId } });
        } catch (err) {
          orders = await Order.find({ userId: custId }).catch(() => []);
        }

        const ordersCount = orders.length;
        const totalSpending = orders
          .filter((o) => o.paymentStatus === "Paid" || o.orderStatus === "Delivered")
          .reduce((sum, o) => sum + (o.total || 0), 0);

        return {
          id: custId,
          _id: custId,
          name: cust.name,
          email: cust.email,
          avatar: cust.avatar || "",
          phone: cust.phone || "N/A",
          registrationDate: cust.createdAt ? new Date(cust.createdAt).toISOString().slice(0, 10) : "N/A",
          totalOrders: ordersCount,
          totalSpending: totalSpending,
          status: cust.status || "Active"
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
 * Get Customer Profile Details with Order History.
 */
export const getCustomerAddresses = async (req, res, next) => {
  try {
    const { userId } = req.params;
    let addresses = [];
    if (!isNaN(userId)) {
      addresses = await AddressMySQL.findAll({ where: { userId: Number(userId) }, order: [["id", "DESC"]] });
    }
    if (!addresses || addresses.length === 0) {
      addresses = await Address.find({ userId }).sort({ createdAt: -1 }).catch(() => []);
    }
    return sendSuccess(res, "Addresses fetched.", addresses);
  } catch (error) {
    next(error);
  }
};

export const getCustomerOrderHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;
    let orders = [];
    if (!isNaN(userId)) {
      orders = await OrderMySQL.findAll({ where: { userId: Number(userId) }, order: [["id", "DESC"]] });
    }
    if (!orders || orders.length === 0) {
      orders = await Order.find({ userId }).sort({ createdAt: -1 }).catch(() => []);
    }
    return sendSuccess(res, "Order history fetched.", orders);
  } catch (error) {
    next(error);
  }
};

export const addCustomerAddress = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { name, phone, line, street, city, state, zip, tag, type, isDefault } = req.body;

    const addressLine = street || line;
    const addressTag = type || tag || "Home";

    let newAddress = null;
    if (!isNaN(userId)) {
      newAddress = await AddressMySQL.create({
        userId: Number(userId),
        name: name || "Customer",
        phone: phone || "",
        line: addressLine || "Main St",
        city: city || "Patna",
        state: state || "Bihar",
        zip: zip || "800001",
        tag: addressTag,
        isDefault: Boolean(isDefault)
      });
    } else {
      newAddress = await Address.create({
        userId,
        name: name || "Customer",
        phone: phone || "",
        line: addressLine || "Main St",
        city: city || "Patna",
        state: state || "Bihar",
        zip: zip || "800001",
        tag: addressTag,
        isDefault: Boolean(isDefault)
      });
    }

    return sendSuccess(res, "Address added successfully.", newAddress, 201);
  } catch (error) {
    next(error);
  }
};

export const updateCustomerAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { name, phone, line, street, city, state, zip, tag, type, isDefault } = req.body;

    const updateFields = {};
    if (name) updateFields.name = name;
    if (phone) updateFields.phone = phone;
    if (street || line) updateFields.line = street || line;
    if (city) updateFields.city = city;
    if (state) updateFields.state = state;
    if (zip) updateFields.zip = zip;
    if (type || tag) updateFields.tag = type || tag;
    if (typeof isDefault === "boolean") updateFields.isDefault = isDefault;

    if (!isNaN(addressId)) {
      await AddressMySQL.update(updateFields, { where: { id: Number(addressId) } });
    }
    await Address.findByIdAndUpdate(addressId, updateFields).catch(() => {});

    return sendSuccess(res, "Address updated successfully.", updateFields);
  } catch (error) {
    next(error);
  }
};

export const setDefaultCustomerAddress = async (req, res, next) => {
  try {
    const { userId, addressId } = req.params;
    if (!isNaN(userId)) {
      await AddressMySQL.update({ isDefault: false }, { where: { userId: Number(userId) } });
      if (!isNaN(addressId)) {
        await AddressMySQL.update({ isDefault: true }, { where: { id: Number(addressId) } });
      }
    }
    return sendSuccess(res, "Default address set.", { addressId });
  } catch (error) {
    next(error);
  }
};

export const deleteCustomerAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    if (!isNaN(addressId)) {
      await AddressMySQL.destroy({ where: { id: Number(addressId) } });
    }
    await Address.findByIdAndDelete(addressId).catch(() => {});
    return sendSuccess(res, "Address deleted successfully.", { id: addressId });
  } catch (error) {
    next(error);
  }
};

export const getCustomerProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    let customer = null;

    if (!isNaN(id)) {
      customer = await UserMySQL.findByPk(Number(id));
    }
    if (!customer) {
      customer = await User.findById(id).catch(() => null);
    }

    if (!customer) {
      return sendError(res, "Customer not found.", 404);
    }

    const custId = customer.id || customer._id;
    let orders = [];
    try {
      orders = await OrderMySQL.findAll({ where: { userId: custId }, order: [["id", "DESC"]] });
    } catch (err) {
      orders = await Order.find({ userId: custId }).sort({ createdAt: -1 }).catch(() => []);
    }

    const ordersCount = orders.length;
    const totalSpending = orders
      .filter((o) => o.paymentStatus === "Paid" || o.orderStatus === "Delivered")
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return sendSuccess(res, "Customer profile fetched.", {
      customer: {
        id: custId,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        status: customer.status || "Active",
        totalOrders: ordersCount,
        totalSpending
      },
      orders
    });
  } catch (error) {
    next(error);
  }
};

export const getCustomerDetails = getCustomerProfile;

/**
 * Update Customer Status (Block / Activate)
 */
export const updateCustomerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    let customer = null;
    if (!isNaN(id)) {
      customer = await UserMySQL.findByPk(Number(id));
    }
    if (!customer) {
      customer = await User.findById(id).catch(() => null);
    }

    if (!customer) {
      return sendError(res, "Customer not found.", 404);
    }

    customer.status = status;
    await customer.save();

    return sendSuccess(res, `Customer status updated to ${status}.`, customer);
  } catch (error) {
    next(error);
  }
};
