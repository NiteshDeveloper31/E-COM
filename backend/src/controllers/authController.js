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

    const userProfile = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      phone: user.phone
    };

    const token = generateToken({ id: user._id, role: user.role });

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
  const profile = {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
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
