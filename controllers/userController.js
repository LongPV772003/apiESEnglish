import { User } from "../models/User.js";
import bcrypt from "bcrypt";

// Lấy thông tin hồ sơ người dùng hiện tại
export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password_hash");
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
}

// Cập nhật hồ sơ người dùng
export async function updateProfile(req, res) {
  try {
    const { full_name, gender, age, occupation, avatar_url } = req.body;
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    if (full_name !== undefined) user.full_name = full_name;
    if (gender !== undefined) user.gender = gender;
    if (age !== undefined) user.age = age;
    if (occupation !== undefined) user.occupation = occupation;
    if (avatar_url !== undefined) user.avatar_url = avatar_url;
    user.updated_at = new Date();

    await user.save();

    const safeUser = {
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

    res.json({ message: "Cập nhật hồ sơ thành công", user: safeUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
}
//get all user admin
export async function getAllUsers(req, res) {
  try {
    // Kiểm tra quyền truy cập (Chỉ admin mới có quyền lấy tất cả người dùng)
    console.log(req.user);
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ message: "Không đủ quyền hạn để xem danh sách người dùng." });
    }

    // Lấy tất cả người dùng trừ mật khẩu
    const users = await User.find().select("-password_hash"); // Không trả về trường password_hash
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
}
// Thêm người dùng mới (Chỉ cho admin)
export async function addUser(req, res) {
  try {
    const { username, email, password, role, gender } = req.body;

    // Kiểm tra role hợp lệ
    if (role !== "ADMIN" && role !== "LEARNER") {
      return res.status(400).json({ message: "Role không hợp lệ" });
    }

    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10); // Lấy salt để mã hóa mật khẩu
    const password_hash = await bcrypt.hash(password, salt); // Mã hóa mật khẩu

    // Tạo người dùng mới
    const newUser = new User({
      username,
      email,
      password_hash,
      role,
      gender
    });

    // Lưu vào cơ sở dữ liệu
    await newUser.save();
    res
      .status(201)
      .json({ message: "Thêm người dùng thành công", user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
}

// Xoá người dùng (Chỉ cho admin)
export async function deleteUser(req, res) {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    await User.findByIdAndDelete(userId);
    res.json({ message: "Xoá người dùng thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
}
