import express from "express";
import { sendCode, verifyCode, register, login,changePassword } from "../controllers/authController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.post("/send-code", sendCode);     // Gửi mã xác minh qua email
router.post("/verify", verifyCode);      // Xác minh mã OTP
router.post("/register", register);      // Đăng ký sau khi xác minh email
router.post("/login", login);            // Đăng nhập
router.post("/change-password", auth(true), changePassword); //Đổi mật khẩu

export default router;
