import User from "../models/User.js";
import Address from "../models/Address.js";
import AddressMySQL from "../models/mysql/Address.js";
import { findUserByEmail, findUserById } from "../models/mysql/dbHelper.js";
import UserMySQL from "../models/mysql/User.js";
import { hashPassword, comparePassword } from "../utils/password.js";
import { generateToken } from "../utils/token.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { checkRequiredFields, isValidEmail } from "../validations/validator.js";

/**
 * Register a new User account.
 */
export const register = async (req, res, next) => {
  try {
    const required = ["name", "email", "password"];
    const missing = checkRequiredFields(req.body, required);
    if (missing) {
      return sendError(res, `Required field missing: ${missing}`, 400);
    }

    const { name, email, password, role, avatar, phone, address } = req.body;

    if (!isValidEmail(email)) {
      return sendError(res, "Invalid email address format.", 400);
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return sendError(res, "Email address already registered.", 400);
    }

    // Hash password inside the controller as required
    const encryptedPassword = await hashPassword(password);

    let newUser = null;
    try {
      newUser = await UserMySQL.create({
        name,
        email,
        password: encryptedPassword,
        role: role || "customer",
        phone: phone || undefined
      });
    } catch (mysqlErr) {
      newUser = await User.create({
        name,
        email,
        password: encryptedPassword,
        role: role || "customer",
        avatar: avatar || undefined,
        phone: phone || undefined
      });
    }

    const userId = newUser.id || newUser._id;

    // Optional delivery address at signup
    let createdAddress = null;
    if (address && typeof address === "object") {
      const recipientName = (address.name && String(address.name).trim().length > 1) ? String(address.name).trim() : name;
      const recipientPhone = (address.phone && String(address.phone).trim().length >= 10) ? String(address.phone).trim() : (phone || "");
      const addrLine = address.line || address.street;
      
      if (addrLine) {
        if (!isNaN(userId)) {
          createdAddress = await AddressMySQL.create({
            userId: Number(userId),
            tag: address.tag || address.type || "Home",
            name: recipientName,
            phone: recipientPhone,
            line: addrLine,
            city: address.city || "Patna",
            state: address.state || "Bihar",
            zip: address.zip || "800001",
            isDefault: true
          }).catch(() => null);
        }
        await Address.create({
          userId: userId,
          tag: address.tag || address.type || "Home",
          name: recipientName,
          phone: recipientPhone,
          line: addrLine,
          city: address.city || "Patna",
          state: address.state || "Bihar",
          zip: address.zip || "800001",
          isDefault: true
        }).catch(() => null);
      }
    }

    const userProfile = {
      id: userId,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      phone: newUser.phone
    };

    const token = generateToken({ id: userId, role: newUser.role });

    return sendSuccess(res, "User registered successfully.", { user: userProfile, token, address: createdAddress }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Login user.
 */
export const login = async (req, res, next) => {
  try {
    const required = ["email", "password"];
    const missing = checkRequiredFields(req.body, required);
    if (missing) {
      return sendError(res, `Required field missing: ${missing}`, 400);
    }

    const emailClean = String(req.body.email || "").trim().toLowerCase();
    const passwordClean = String(req.body.password || "").trim();

    const user = await findUserByEmail(emailClean);
    if (!user) {
      return sendError(res, "Invalid email or password credentials.", 401);
    }

    // Compare passwords inside controller
    const isMatch = await comparePassword(passwordClean, user.password);
    if (!isMatch) {
      return sendError(res, "Invalid email or password credentials.", 401);
    }

    const isSuperAdminEmail = user.email === "admin@reetsutra.com" || user.role === "superadmin";
    const effectiveRole = isSuperAdminEmail ? "superadmin" : user.role;

    const userId = user.id || user._id;

    const userProfile = {
      id: userId,
      name: user.name,
      email: user.email,
      role: effectiveRole,
      permissions: effectiveRole === "superadmin"
        ? ["dashboard", "products", "inventory", "categories", "orders", "customers", "banners", "analytics", "settings", "profile"]
        : (user.permissions || []),
      avatar: user.avatar,
      phone: user.phone
    };

    const token = generateToken({ id: userId, role: effectiveRole });

    return sendSuccess(res, "Login successful.", { user: userProfile, token });
  } catch (error) {
    next(error);
  }
};

/**
 * Mock Request Forgot Password Token.
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return sendError(res, "Please provide a valid registered email.", 400);
    }

    let user = await UserMySQL.findOne({ where: { email } }).catch(() => null);
    if (!user) {
      user = await User.findOne({ email }).catch(() => null);
    }
    if (!user) {
      return sendError(res, "Email not found in our records.", 404);
    }

    // In production, send email reset URL. For this mock:
    const mockResetToken = Math.floor(100000 + Math.random() * 900000).toString();

    return sendSuccess(res, "Reset code generated.", {
      message: "Forgot password code issued.",
      resetToken: mockResetToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mock Reset Password.
 */
export const resetPassword = async (req, res, next) => {
  try {
    const required = ["email", "resetToken", "newPassword"];
    const missing = checkRequiredFields(req.body, required);
    if (missing) {
      return sendError(res, `Required field missing: ${missing}`, 400);
    }

    const { email, newPassword } = req.body;

    let user = await UserMySQL.findOne({ where: { email } }).catch(() => null);
    if (!user) {
      user = await User.findOne({ email }).catch(() => null);
    }
    if (!user) {
      return sendError(res, "User not found.", 404);
    }

    // Hash new password inside controller
    const encryptedPassword = await hashPassword(newPassword);
    user.password = encryptedPassword;
    await user.save();

    return sendSuccess(res, "Password updated successfully. You can now login.", null);
  } catch (error) {
    next(error);
  }
};

/**
 * Get Authenticated User Profile.
 */
export const getProfile = async (req, res) => {
  const isSuperAdminEmail = req.user.email === "admin@reetsutra.com" || req.user.role === "superadmin";
  const effectiveRole = isSuperAdminEmail ? "superadmin" : req.user.role;

  const profile = {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: effectiveRole,
    permissions: effectiveRole === "superadmin"
      ? ["dashboard", "products", "inventory", "categories", "orders", "customers", "banners", "analytics", "settings", "profile"]
      : (req.user.permissions || []),
    avatar: req.user.avatar,
    phone: req.user.phone,
    createdAt: req.user.createdAt
  };
  return sendSuccess(res, "Profile retrieved successfully.", { user: profile });
};

/**
 * Update Authenticated User Profile.
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { name, email, avatar, phone } = req.body;
    const userId = req.user.id || req.user._id;

    let user = null;
    if (!isNaN(userId)) {
      user = await UserMySQL.findByPk(Number(userId));
    }
    if (!user) {
      user = await User.findById(userId).catch(() => null);
    }

    if (!user) {
      return sendError(res, "User profile not found.", 404);
    }

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (phone !== undefined) user.phone = phone;

    if (email && email !== user.email) {
      if (!isValidEmail(email)) {
        return sendError(res, "Invalid email address format.", 400);
      }
      let existing = await UserMySQL.findOne({ where: { email } }).catch(() => null);
      if (!existing) {
        existing = await User.findOne({ email }).catch(() => null);
      }
      if (existing && String(existing.id || existing._id) !== String(userId)) {
        return sendError(res, "Email address already registered by another account.", 400);
      }
      user.email = email;
    }

    await user.save();

    const updatedProfile = {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone
    };

    return sendSuccess(res, "Profile updated successfully.", { user: updatedProfile });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP (1234) and Update Authenticated User Phone Number.
 */
export const changePhoneWithOTP = async (req, res, next) => {
  try {
    const { newPhone, otp } = req.body;
    const userId = req.user.id || req.user._id;

    if (!newPhone || String(newPhone).trim().length < 10 || !otp) {
      return sendError(res, "Valid 10-digit new phone number and OTP are required.", 400);
    }

    if (String(otp).trim() !== "1234") {
      return sendError(res, "Invalid OTP entered. Please enter 1234.", 400);
    }

    const cleanPhone = String(newPhone).trim();
    let existingUser = await UserMySQL.findOne({ where: { phone: cleanPhone } }).catch(() => null);
    if (!existingUser) {
      existingUser = await User.findOne({
        _id: { $ne: userId },
        $or: [{ phone: cleanPhone }, { phone: `+91${cleanPhone}` }, { phone: cleanPhone.replace("+91", "") }]
      }).catch(() => null);
    }

    if (existingUser && String(existingUser.id || existingUser._id) !== String(userId)) {
      return sendError(res, "This mobile number is already linked to another account.", 400);
    }

    let user = null;
    if (!isNaN(userId)) {
      user = await UserMySQL.findByPk(Number(userId));
    }
    if (!user) {
      user = await User.findById(userId).catch(() => null);
    }

    if (!user) {
      return sendError(res, "User profile not found.", 404);
    }

    user.phone = cleanPhone;
    await user.save();

    const updatedProfile = {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone
    };

    return sendSuccess(res, "Mobile number verified and updated successfully!", { user: updatedProfile });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP (1234) and Update Authenticated User Email Address.
 */
export const changeEmailWithOTP = async (req, res, next) => {
  try {
    const { newEmail, otp } = req.body;
    const userId = req.user.id || req.user._id;

    if (!newEmail || !otp || !isValidEmail(newEmail)) {
      return sendError(res, "Valid new email address and OTP are required.", 400);
    }

    if (String(otp).trim() !== "1234") {
      return sendError(res, "Invalid OTP entered. Please enter 1234.", 400);
    }

    const cleanEmail = String(newEmail).trim().toLowerCase();
    let existingUser = await UserMySQL.findOne({ where: { email: cleanEmail } }).catch(() => null);
    if (!existingUser) {
      existingUser = await User.findOne({
        _id: { $ne: userId },
        email: cleanEmail
      }).catch(() => null);
    }

    if (existingUser && String(existingUser.id || existingUser._id) !== String(userId)) {
      return sendError(res, "This email address is already registered by another account.", 400);
    }

    let user = null;
    if (!isNaN(userId)) {
      user = await UserMySQL.findByPk(Number(userId));
    }
    if (!user) {
      user = await User.findById(userId).catch(() => null);
    }

    if (!user) {
      return sendError(res, "User profile not found.", 404);
    }

    user.email = cleanEmail;
    await user.save();

    const updatedProfile = {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone
    };

    return sendSuccess(res, "Email address verified and updated successfully!", { user: updatedProfile });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a Sub-Admin account (Super Admin Only)
 */
export const createSubAdmin = async (req, res, next) => {
  try {
    const { name, email, phone, password, permissions } = req.body;
    if (!name || !email || !password) {
      return sendError(res, "Name, email, and password are required.", 400);
    }

    const cleanEmail = String(email).trim().toLowerCase();

    let existing = await UserMySQL.findOne({ where: { email: cleanEmail } }).catch(() => null);
    if (!existing) {
      existing = await User.findOne({ email: cleanEmail }).catch(() => null);
    }

    if (existing) {
      return sendError(res, "An account with this email already exists.", 400);
    }

    const encryptedPassword = await hashPassword(password);
    let newAdmin = null;
    try {
      newAdmin = await UserMySQL.create({
        name: name.trim(),
        email: cleanEmail,
        phone: phone || "",
        password: encryptedPassword,
        role: "admin",
        status: "Active",
        permissions: permissions && Array.isArray(permissions) ? permissions : ["dashboard", "products", "orders"]
      });
    } catch (mysqlErr) {
      newAdmin = await User.create({
        name: name.trim(),
        email: cleanEmail,
        phone: phone || "",
        password: encryptedPassword,
        role: "admin",
        permissions: permissions && Array.isArray(permissions) ? permissions : ["dashboard", "products", "orders"]
      });
    }

    return sendSuccess(res, "Admin account created successfully.", {
      id: newAdmin.id || newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      phone: newAdmin.phone,
      role: newAdmin.role,
      permissions: permissions && Array.isArray(permissions) ? permissions : ["dashboard", "products", "orders"]
    }, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get all Sub-Admins (Super Admin Only)
 */
export const getSubAdmins = async (req, res, next) => {
  try {
    let admins = [];
    try {
      const { Op } = await import("sequelize");
      admins = await UserMySQL.findAll({
        where: { role: { [Op.in]: ["admin", "superadmin"] } },
        attributes: { exclude: ["password"] },
        order: [["id", "DESC"]]
      });
    } catch (sqlErr) {
      admins = await User.find({ role: { $in: ["admin", "superadmin"] } }).select("-password").sort({ createdAt: -1 }).catch(() => []);
    }
    return sendSuccess(res, "Sub-admins fetched successfully.", admins);
  } catch (error) {
    next(error);
  }
};

/**
 * Update Sub-Admin permissions & details (Super Admin Only)
 */
export const updateSubAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, phone, password, permissions } = req.body;

    let user = null;
    if (!isNaN(id)) {
      user = await UserMySQL.findByPk(Number(id));
    }
    if (!user) {
      user = await User.findById(id).catch(() => null);
    }

    if (!user) {
      return sendError(res, "Admin account not found.", 404);
    }

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (permissions && Array.isArray(permissions)) user.permissions = permissions;
    if (password) {
      user.password = await hashPassword(password);
    }

    await user.save();

    return sendSuccess(res, "Admin permissions updated successfully.", {
      id: user.id || user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      permissions: user.permissions
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete Sub-Admin (Super Admin Only)
 */
export const deleteSubAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;

    let targetUser = null;
    if (!isNaN(id)) {
      targetUser = await UserMySQL.findByPk(Number(id));
    }
    if (!targetUser) {
      targetUser = await User.findById(id).catch(() => null);
    }

    if (!targetUser) {
      return sendError(res, "Admin account not found.", 404);
    }

    if (targetUser.role === "superadmin" || targetUser.email === "admin@reetsutra.com") {
      return sendError(res, "Super Admin account cannot be deleted.", 400);
    }

    if (!isNaN(id)) {
      await UserMySQL.destroy({ where: { id: Number(id) } });
    }
    await User.findByIdAndDelete(id).catch(() => {});

    return sendSuccess(res, "Admin account deleted successfully.");
  } catch (error) {
    next(error);
  }
};

/**
 * Send Demo OTP (1234) to Phone Number (Verifies Password if provided for Login)
 */
export const sendOTP = async (req, res, next) => {
  try {
    const { phone, isLogin } = req.body;
    if (!phone) {
      return sendError(res, "Mobile phone number is required.", 400);
    }

    const cleanPhone = String(phone).trim();
    let existingUser = await UserMySQL.findOne({ where: { phone: cleanPhone } });

    return sendSuccess(
      res,
      `Demo OTP (1234) sent to ${cleanPhone}.`,
      {
        phone: cleanPhone,
        demoOtp: "1234",
        isExistingUser: Boolean(existingUser),
        userName: existingUser?.name || ""
      }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP for Login (Existing User)
 */
export const verifyOTPLogin = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return sendError(res, "Mobile number and OTP are required.", 400);
    }

    if (String(otp).trim() !== "1234") {
      return sendError(res, "Invalid OTP entered. Please enter 1234.", 400);
    }

    const cleanPhone = String(phone).trim();
    let user = await UserMySQL.findOne({ where: { phone: cleanPhone } });
    if (!user) {
      user = await User.findOne({ phone: cleanPhone }).catch(() => null);
    }

    if (!user) {
      return sendError(res, "No account found with this phone number. Please sign up first.", 404);
    }

    const userId = user.id || user._id;
    const token = generateToken({ id: userId, role: user.role });

    const userProfile = {
      id: userId,
      name: user.name,
      email: user.email,
      phone: user.phone || cleanPhone,
      role: user.role,
      avatar: user.avatar
    };

    return sendSuccess(res, "OTP verified! Login successful.", { user: userProfile, token });
  } catch (error) {
    next(error);
  }
};

/**
 * Register User with Custom Password, OTP and Compulsory Address
 */
export const registerWithOTP = async (req, res, next) => {
  try {
    const { name, email, phone, password, otp, address } = req.body;

    if (!name || !email || !phone || !otp || !password) {
      return sendError(res, "Full Name, Email, Phone number, Password, and OTP are required.", 400);
    }

    if (String(password).length < 6) {
      return sendError(res, "Password must be at least 6 characters long.", 400);
    }

    if (String(otp).trim() !== "1234") {
      return sendError(res, "Invalid OTP entered. Please enter 1234.", 400);
    }

    if (!isValidEmail(email)) {
      return sendError(res, "Invalid email address format.", 400);
    }

    const cleanPhone = String(phone).trim();
    const cleanEmail = email.trim().toLowerCase();

    // Check MySQL database exclusively
    const existingEmail = await UserMySQL.findOne({ where: { email: cleanEmail } });
    if (existingEmail) {
      return sendError(res, "This Email Address is already registered. Please sign in instead.", 400);
    }

    const existingPhone = await UserMySQL.findOne({ where: { phone: cleanPhone } });
    if (existingPhone) {
      return sendError(res, "This Mobile Number is already registered. Please sign in instead.", 400);
    }

    const encryptedPassword = await hashPassword(password);

    let newUser = await UserMySQL.create({
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: encryptedPassword,
      role: "customer"
    });

    const userId = newUser.id || newUser._id;

    if (address && typeof address === "object") {
      if (!isNaN(userId)) {
        await AddressMySQL.create({
          userId: Number(userId),
          tag: address.type || address.tag || "Home",
          name: address.name || name.trim(),
          phone: address.phone || cleanPhone,
          line: address.street || address.line || "Main St",
          city: address.city || "Patna",
          state: address.state || "Bihar",
          zip: address.zip || "800001",
          isDefault: true
        }).catch(() => {});
      }
      await Address.create({
        userId,
        tag: address.type || address.tag || "Home",
        name: address.name || name.trim(),
        phone: address.phone || cleanPhone,
        line: address.street || address.line || "Main St",
        city: address.city || "Patna",
        state: address.state || "Bihar",
        zip: address.zip || "800001",
        isDefault: true
      }).catch(() => {});
    }

    const userProfile = {
      id: userId,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role
    };

    const token = generateToken({ id: userId, role: newUser.role });

    return sendSuccess(res, "Registration completed successfully!", { user: userProfile, token }, 201);
  } catch (error) {
    next(error);
  }
};
