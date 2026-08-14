import User from "../models/User.js";
import Address from "../models/Address.js";
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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, "Email address already registered.", 400);
    }

    // Hash password inside the controller as required
    const encryptedPassword = await hashPassword(password);

    const newUser = await User.create({
      name,
      email,
      password: encryptedPassword,
      role: role || "customer",
      avatar: avatar || undefined,
      phone: phone || undefined
    });

    // Optional delivery address at signup — becomes the default. Skipped
    // silently if missing/incomplete since address is not required to register.
    let createdAddress = null;
    if (address && typeof address === "object") {
      const addrRequired = ["name", "phone", "city", "state", "zip"];
      const addrLine = address.line || address.street;
      const missingAddr = checkRequiredFields(address, addrRequired);
      if (!missingAddr && addrLine) {
        createdAddress = await Address.create({
          userId: newUser._id,
          tag: address.tag || address.type || "Home",
          name: address.name,
          phone: address.phone,
          line: addrLine,
          city: address.city,
          state: address.state,
          zip: address.zip,
          isDefault: true
        });
      }
    }

    const userProfile = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      avatar: newUser.avatar,
      phone: newUser.phone
    };

    const token = generateToken({ id: newUser._id, role: newUser.role });

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

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return sendError(res, "Invalid email or password credentials.", 401);
    }

    // Compare passwords inside controller
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return sendError(res, "Invalid email or password credentials.", 401);
    }

    const isSuperAdminEmail = user.email === "admin@reetsutra.com" || user.role === "superadmin";
    const effectiveRole = isSuperAdminEmail ? "superadmin" : user.role;

    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: effectiveRole,
      permissions: effectiveRole === "superadmin"
        ? ["dashboard", "products", "inventory", "categories", "orders", "customers", "banners", "analytics", "settings", "profile"]
        : (user.permissions || []),
      avatar: user.avatar,
      phone: user.phone
    };

    const token = generateToken({ id: user._id, role: effectiveRole });

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

    const user = await User.findOne({ email });
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

    const user = await User.findOne({ email });
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
    const user = await User.findById(req.user._id);

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
      const existing = await User.findOne({ email });
      if (existing) {
        return sendError(res, "Email address already registered by another account.", 400);
      }
      user.email = email;
    }

    await user.save();

    const updatedProfile = {
      id: user._id,
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
    if (!newPhone || String(newPhone).trim().length < 10 || !otp) {
      return sendError(res, "Valid 10-digit new phone number and OTP are required.", 400);
    }

    if (String(otp).trim() !== "1234") {
      return sendError(res, "Invalid OTP entered. Please enter 1234.", 400);
    }

    const cleanPhone = String(newPhone).trim();
    const existingUser = await User.findOne({
      _id: { $ne: req.user._id },
      $or: [{ phone: cleanPhone }, { phone: `+91${cleanPhone}` }, { phone: cleanPhone.replace("+91", "") }]
    });

    if (existingUser) {
      return sendError(res, "This mobile number is already linked to another account.", 400);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, "User profile not found.", 404);
    }

    user.phone = cleanPhone;
    await user.save();

    const updatedProfile = {
      id: user._id,
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
    if (!newEmail || !otp || !isValidEmail(newEmail)) {
      return sendError(res, "Valid new email address and OTP are required.", 400);
    }

    if (String(otp).trim() !== "1234") {
      return sendError(res, "Invalid OTP entered. Please enter 1234.", 400);
    }

    const cleanEmail = String(newEmail).trim().toLowerCase();
    const existingUser = await User.findOne({
      _id: { $ne: req.user._id },
      email: cleanEmail
    });

    if (existingUser) {
      return sendError(res, "This email address is already registered by another account.", 400);
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return sendError(res, "User profile not found.", 404);
    }

    user.email = cleanEmail;
    await user.save();

    const updatedProfile = {
      id: user._id,
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

    const existing = await User.findOne({ email });
    if (existing) {
      return sendError(res, "An account with this email already exists.", 400);
    }

    const encryptedPassword = await hashPassword(password);
    const newAdmin = await User.create({
      name,
      email,
      phone: phone || "",
      password: encryptedPassword,
      role: "admin",
      permissions: permissions && Array.isArray(permissions) ? permissions : ["dashboard", "products", "orders"]
    });

    return sendSuccess(res, "Admin account created successfully.", {
      id: newAdmin._id,
      name: newAdmin.name,
      email: newAdmin.email,
      phone: newAdmin.phone,
      role: newAdmin.role,
      permissions: newAdmin.permissions
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
    const admins = await User.find({ role: { $in: ["admin", "superadmin"] } }).select("-password").sort({ createdAt: -1 });
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

    const user = await User.findById(id);
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
      id: user._id,
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

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return sendError(res, "Admin account not found.", 404);
    }

    if (targetUser.role === "superadmin" || targetUser.email === "admin@reetsutra.com") {
      return sendError(res, "Super Admin account cannot be deleted.", 400);
    }

    await User.findByIdAndDelete(id);

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
    const { phone, password, isLogin } = req.body;
    if (!phone || String(phone).trim().length < 10) {
      return sendError(res, "Please enter a valid 10-digit mobile number.", 400);
    }

    const cleanPhone = String(phone).trim();
    const existingUser = await User.findOne({
      $or: [{ phone: cleanPhone }, { phone: `+91${cleanPhone}` }, { phone: cleanPhone.replace("+91", "") }]
    });

    if (isLogin) {
      if (!existingUser) {
        return sendError(res, "No account found with this phone number. Please sign up first.", 404);
      }
      if (!password) {
        return sendError(res, "Password is required to proceed.", 400);
      }
      const isPasswordMatch = await comparePassword(password, existingUser.password);
      if (!isPasswordMatch) {
        return sendError(res, "Incorrect password entered. Please try again.", 400);
      }
    }

    return sendSuccess(
      res,
      `Password verified! OTP sent successfully to +91 ${cleanPhone.slice(-10)} (Demo OTP: 1234)`,
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
    const user = await User.findOne({
      $or: [{ phone: cleanPhone }, { phone: `+91${cleanPhone}` }, { phone: cleanPhone.replace("+91", "") }]
    });

    if (!user) {
      return sendError(res, "No account found with this phone number. Please sign up first.", 404);
    }

    const token = generateToken({ id: user._id, role: user.role });

    const userProfile = {
      id: user._id,
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

    if (!address || typeof address !== "object" || !address.street || !address.city || !address.state || !address.zip) {
      return sendError(res, "Delivery Address (Street, City, State, ZIP) is compulsory.", 400);
    }

    const cleanPhone = String(phone).trim();

    const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return sendError(res, "This Email Address is already registered. Please sign in instead.", 400);
    }

    const existingPhone = await User.findOne({
      $or: [{ phone: cleanPhone }, { phone: `+91${cleanPhone}` }, { phone: cleanPhone.replace("+91", "") }]
    });
    if (existingPhone) {
      return sendError(res, "This Mobile Number is already registered. Please sign in instead.", 400);
    }

    const encryptedPassword = await hashPassword(password);

    const newUser = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: cleanPhone,
      password: encryptedPassword,
      role: "customer"
    });

    const createdAddress = await Address.create({
      userId: newUser._id,
      tag: address.type || address.tag || "Home",
      name: address.name || name.trim(),
      phone: address.phone || cleanPhone,
      line: address.street || address.line,
      city: address.city,
      state: address.state || "Bihar",
      zip: address.zip,
      isDefault: true
    });

    const userProfile = {
      id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
      role: newUser.role,
      avatar: newUser.avatar
    };

    const token = generateToken({ id: newUser._id, role: newUser.role });

    return sendSuccess(
      res,
      "Account registered successfully! You are now logged in.",
      { user: userProfile, token, address: createdAddress },
      201
    );
  } catch (error) {
    next(error);
  }
};
