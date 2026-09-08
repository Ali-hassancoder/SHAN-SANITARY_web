import express from "express"; 
import {
    register,
    login,
    logout,
    getMe,
    changePassword,
    forgotPassword,
    resetPassword,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:token", authLimiter, resetPassword);

router.get("/me", authenticate, getMe);
router.patch("/change-password", authenticate, changePassword);

export default router;