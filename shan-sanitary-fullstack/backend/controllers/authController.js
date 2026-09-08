import crypto from "crypto";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import sendEmail from "../utils/sendEmail.js";
import { success, fail } from "../utils/apiResponse.js";
import {
  validateRegisterInput,
  validateLoginInput,
  validateChangePasswordInput,
} from "../validators/authValidators.js";


export const register = async (req, res, next) => {
  try {
  
    const { name, email, password, confirmPassword, phone } = req.body;

    const errors = validateRegisterInput({ name, email, password, confirmPassword });
    if (Object.keys(errors).length > 0) {
      return fail(res, 400, "Validation failed", errors);
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return fail(res, 400, "Email is already registered");
    }

    const user = await User.create({
      name,
      email,
      password, 
      phone,
      
    });

    generateToken(res, user._id, user.role);

    return success(res, 201, "Account created successfully", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};


export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const errors = validateLoginInput({ email, password });
    if (Object.keys(errors).length > 0) {
      return fail(res, 400, "Validation failed", errors);
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return fail(res, 401, "Invalid email or password");
    }

    if (!user.isActive) {
      return fail(res, 403, "This account has been disabled");
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return fail(res, 401, "Invalid email or password");
    }

    generateToken(res, user._id, user.role);

    return success(res, 200, "Login successful", {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};


export const logout = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  return success(res, 200, "Logged out successfully");
};


export const getMe = async (req, res, next) => {
  try {
    
    return success(res, 200, "Current user retrieved", {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      avatar: req.user.avatar,
      createdAt: req.user.createdAt,
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    const errors = validateChangePasswordInput({ currentPassword, newPassword, confirmNewPassword });
    if (Object.keys(errors).length > 0) {
      return fail(res, 400, "Validation failed", errors);
    }

    const user = await User.findById(req.user._id).select("+password");

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return fail(res, 401, "Current password is incorrect");
    }

    user.password = newPassword; 
    await user.save();

    return success(res, 200, "Password changed successfully");
  } catch (error) {
    next(error);
  }
};


export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return fail(res, 400, "Email is required");

    const user = await User.findOne({ email: email.toLowerCase() });

    const genericResponse = () =>
      success(res, 200, "If that email is registered, a reset link has been sent");

    if (!user) return genericResponse();

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + (Number(process.env.RESET_TOKEN_EXPIRES_MINUTES) || 30) * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "SHAN SANITARY — Password Reset",
      text: `You requested a password reset. Click this link (valid for ${process.env.RESET_TOKEN_EXPIRES_MINUTES || 30} minutes): ${resetUrl}\n\nIf you did not request this, ignore this email.`,
    });

    return genericResponse();
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { newPassword, confirmNewPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return fail(res, 400, "New password must be at least 6 characters");
    }
    if (newPassword !== confirmNewPassword) {
      return fail(res, 400, "Passwords do not match");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return fail(res, 400, "Reset link is invalid or has expired");
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return success(res, 200, "Password has been reset successfully. Please log in.");
  } catch (error) {
    next(error);
  }
};