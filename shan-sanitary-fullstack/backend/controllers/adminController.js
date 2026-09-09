import User from "../models/User.js";
import { success, fail } from "../utils/apiResponse.js";
import { getaPagination, buildPaginationMeta } from "../utils/paginate.js";
import { logAction } from "../services/auditService.js";

export const getAdmins = async (req, res, next) => {
  try {
    const { page, limit, skip } = getPagination(req.query);
    const filter = { role: "admin" };

    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } },
      ];
    }

    const [admins, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);

    return success(res, 200, "Admins retrieved", {
      admins,
      pagination: buildPaginationMeta(total, page, limit),
    });
  } catch (error) {
    next(error);
  }
};


export const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return fail(res, 400, "Name, email, and password are required");
    }
    if (password.length < 6) {
      return fail(res, 400, "Password must be at least 6 characters");
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return fail(res, 400, "Email is already registered");

    
    const admin = await User.create({ name, email, password, phone, role: "admin" });

    await logAction({
      actor: req.user._id,
      action: "ADMIN_CREATED",
      targetModel: "User",
      target: admin._id,
      metadata: { email: admin.email },
    });

    return success(res, 201, "Admin account created successfully", {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    });
  } catch (error) {
    next(error);
  }
};


export const updateAdmin = async (req, res, next) => {
  try {
    const admin = await User.findOne({ _id: req.params.id, role: "admin" });
    if (!admin) return fail(res, 404, "Admin not found");

    const { name, email, phone } = req.body;
    if (name !== undefined) admin.name = name;
    if (phone !== undefined) admin.phone = phone;
    if (email !== undefined && email.toLowerCase() !== admin.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) return fail(res, 400, "Email is already in use");
      admin.email = email;
    }

    await admin.save();

    await logAction({
      actor: req.user._id,
      action: "ADMIN_UPDATED",
      targetModel: "User",
      target: admin._id,
      metadata: { email: admin.email },
    });

    return success(res, 200, "Admin updated successfully", admin);
  } catch (error) {
    next(error);
  }
};


export const toggleAdminStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== "boolean") return fail(res, 400, "isActive (true or false) is required");

    const admin = await User.findOne({ _id: req.params.id, role: "admin" });
    if (!admin) return fail(res, 404, "Admin not found");

    if (admin._id.toString() === req.user._id.toString()) {
      return fail(res, 400, "You cannot change your own account's status here");
    }

    admin.isActive = isActive;
    await admin.save();

    await logAction({
      actor: req.user._id,
      action: isActive ? "ADMIN_ENABLED" : "ADMIN_DISABLED",
      targetModel: "User",
      target: admin._id,
      metadata: { email: admin.email },
    });

    return success(res, 200, `Admin ${isActive ? "enabled" : "disabled"} successfully`);
  } catch (error) {
    next(error);
  }
};