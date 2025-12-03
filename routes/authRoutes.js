import express from "express";
import {
  sendCode,
  verifyCode,
  register,
  login,
  changePassword,
  forgotPassword,
  verifyResetCode,
  resetPassword,
} from "../controllers/authController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

// Xác minh email khi đăng ký
router.post("/send-code", sendCode);            // Gửi mã xác minh qua email
router.post("/verify", verifyCode);             // Xác minh mã OTP đăng ký
router.post("/register", register);             // Đăng ký sau khi xác minh email

// Đăng nhập
router.post("/login", login);

// Đổi mật khẩu khi đã đăng nhập
router.post("/change-password", auth(true), changePassword);

// ======= 🔥 QUÊN MẬT KHẨU (RESET PASSWORD) ======= //
router.post("/forgot-password", forgotPassword);     // Gửi mã OTP reset
router.post("/verify-reset", verifyResetCode);       // Xác minh mã OTP reset
router.post("/reset-password", resetPassword);       // Đặt lại mật khẩu mới

export default router;
