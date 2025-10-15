import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { VerifyCode } from "../models/VerifyCode.js";
import validator from "validator";
import dotenv from "dotenv";
import dns from "dns/promises";
import { sendVerifyCode } from "../utils/mailer.js";
import { existsSync } from "fs";

dotenv.config();


// Gửi mã xác minh qua email
export async function sendCode(req, res) {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ message: "Vui lòng nhập email." });

    if (!validator.isEmail(email))
      return res.status(400).json({ message: "Email không hợp lệ." });

    // ✅ Kiểm tra domain có MX record không
    const domain = email.split("@")[1];
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (!mxRecords || mxRecords.length === 0) {
        return res.status(400).json({ message: "Tên miền email không tồn tại." });
      }
    } catch {
      return res.status(400).json({ message: "Tên miền email không tồn tại." });
    }
    const exists = await User.findOne({ email });
    if (exists)
      return res.status(409).json({ message: "Email đã được đăng ký." });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expired_at = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

    await VerifyCode.deleteMany({ email });
    await VerifyCode.create({ email, code, expired_at });

    await sendVerifyCode(email, code);

    res.json({ message: "Mã xác minh đã được gửi đến email của bạn." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi hệ thống, vui lòng thử lại sau." });
  }
}


// Xác minh mã (OTP)
export async function verifyCode(req, res) {
  try {
    const { email, code } = req.body;

    if (!email || !code)
      return res.status(400).json({ message: "Thiếu email hoặc mã xác minh." });

    const record = await VerifyCode.findOne({ email }).sort({ createdAt: -1 });

    if (!record)
      return res.status(400).json({ message: "Không tìm thấy mã xác minh." });

    if (record.verified)
      return res.status(400).json({ message: "Email đã được xác minh." });

    if (record.expired_at < new Date())
      return res.status(400).json({ message: "Mã đã hết hạn." });

    if (record.code !== code)
      return res.status(400).json({ message: "Mã không hợp lệ." });

    record.verified = true;
    await record.save();

    res.json({ message: "Xác minh thành công." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi hệ thống, vui lòng thử lại sau." });
  }
}


// Đăng ký
export async function register(req, res) {
  const { username, email, password } = req.body;
  const verify = await VerifyCode.findOne({ email, verified: true });
  if (!verify) return res.status(400).json({ message: "Email chưa được xác minh" });

  const exists = await User.findOne({ $or: [{ username }, { email }] });
  if (exists) return res.status(409).json({ message: "Tài khoản đã tồn tại" });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ username, email, password_hash: hash });
  await VerifyCode.deleteMany({ email });

  res.status(201).json({ message: "Đăng ký thành công", user: { id: user._id, username, email } });
}

// Đăng nhập
export async function login(req, res) {
  try {
    const { usernameOrEmail, password } = req.body;

    // Tìm user theo username hoặc email
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

    if (!user) {
      return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    // So sánh mật khẩu
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
    }

    // Sinh JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Trả về thông tin user (ẩn password)
    const userInfo = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
      full_name: user.full_name,
      gender: user.gender,
      age: user.age,
      occupation: user.occupation,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: userInfo,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
}
// Đặt lại mật khẩu (sau khi xác minh OTP)
export async function resetPassword(req, res) {
  try {
    const { email, new_password } = req.body;

    if (!email || !new_password)
      return res.status(400).json({ message: "Thiếu email hoặc mật khẩu mới." });

    const verify = await VerifyCode.findOne({ email, verified: true });
    if (!verify)
      return res.status(400).json({ message: "Email chưa được xác minh OTP." });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng." });

    const hash = await bcrypt.hash(new_password, 10);
    user.password_hash = hash;
    await user.save();

    await VerifyCode.deleteMany({ email });

    res.json({ message: "Đặt lại mật khẩu thành công." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi hệ thống, vui lòng thử lại sau." });
  }
}


// Đổi mật khẩu khi đã đăng nhập
export async function changePassword(req, res) {
  try {
    const userId = req.user?.id;
    const { old_password, new_password } = req.body;

    if (!old_password || !new_password)
      return res.status(400).json({ message: "Thiếu mật khẩu cũ hoặc mới." });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại." });

    const valid = await bcrypt.compare(old_password, user.password_hash);
    if (!valid) return res.status(400).json({ message: "Mật khẩu cũ không đúng." });

    user.password_hash = await bcrypt.hash(new_password, 10);
    await user.save();

    res.json({ message: "Đổi mật khẩu thành công." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi hệ thống." });
  }
}
