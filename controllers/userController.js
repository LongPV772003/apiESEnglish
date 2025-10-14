import { User } from "../models/User.js";

// Lấy thông tin hồ sơ người dùng hiện tại
export async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.id).select("-password_hash");
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
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
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

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
