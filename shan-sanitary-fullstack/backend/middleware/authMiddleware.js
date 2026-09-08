import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { fail } from "../utils/apiResponse.js";

// AUTHENTICATE: verifies the JWT, loads the real user, attaches it to req.user.
// Every protected route uses this first.
export const authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return fail(res, 401, "Not authorized, no token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // We load the FULL user from the database rather than trusting the JWT payload
    // alone, so a deactivated (isActive: false) account is rejected immediately,
    // even if their token hasn't expired yet.
    const user = await User.findById(decoded.userId);

    if (!user) {
      return fail(res, 401, "Not authorized, user no longer exists");
    }

    if (!user.isActive) {
      return fail(res, 403, "This account has been disabled");
    }

    req.user = user; // full Mongoose user document, password excluded by schema default
    next();
  } catch (error) {
    return fail(res, 401, "Not authorized, invalid or expired token");
  }
};

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
     
      return fail(res, 401, "Not authorized");
    }

    if (!allowedRoles.includes(req.user.role)) {
      return fail(res, 403, `Role '${req.user.role}' is not permitted to perform this action`);
    }

    next();
  };
};