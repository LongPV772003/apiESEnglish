import express from "express";
import { sendCode, verifyCode, register, login } from "../controllers/authController.js";

const router = express.Router();

router.post("/send-code", sendCode);     // Gửi mã xác minh qua email
router.post("/verify", verifyCode);      // Xác minh mã OTP
router.post("/register", register);      // Đăng ký sau khi xác minh email
router.post("/login", login);            // Đăng nhập

export default router;
