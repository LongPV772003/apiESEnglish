import { Results } from "../models/Results.js";  // Model lưu kết quả
import { UserSkillProgress } from "../models/UserSkillProgress.js";  // Theo dõi tiến độ học
import { Topic } from "../models/Topic.js";  // Lấy topic
import { User } from "../models/User.js";

export const saveResult = async (req, res) => {
  try {
    const { topic_id, score, band_score, feedback } = req.body;

    if (!topic_id || score === undefined || feedback === undefined)
      return res.status(400).json({ message: "Dữ liệu không hợp lệ!" });

    if (!req.user || !req.user.id)
      return res.status(400).json({ message: "User không hợp lệ hoặc không có token" });

    const userId = req.user.id;

    // Lấy thông tin user để lấy full_name
    const user = await User.findById(userId).select("full_name username email");
    if (!user) return res.status(404).json({ message: "Không tìm thấy thông tin user." });

    // Lấy thông tin topic + skill + level
    const topic = await Topic.findById(topic_id).populate("skill_id").populate("level_id");
    if (!topic) return res.status(404).json({ message: "Topic không tìm thấy" });

    const { skill_id, level_id } = topic;
    if (!skill_id || !level_id)
      return res.status(400).json({ message: "Không tìm thấy thông tin skill hoặc level trong topic" });

    const skillCode = skill_id.code;
    const levelCode = level_id.code;
    const skillId = skill_id._id;
    const levelId = level_id._id;

    // Lưu kết quả
    const result = await Results.create({
      userId,
      user_name: user.full_name || user.username, // ⚡ thêm tên người dùng
      skill: skillCode,
      level: levelCode,
      score,
      band_score,
      feedback,
      topic_id,
    });

    // Cập nhật tiến độ học
    await UserSkillProgress.findOneAndUpdate(
      { user_id: userId, skill_id: skillId, level_id: levelId, topic_id },
      {
        $inc: { total_attempts: 1, total_score: score, correct_count: score >= 5 ? 1 : 0 },
        $set: { last_activity_at: new Date() },
      },
      { upsert: true, new: true }
    );

    // Trả về kết quả có thông tin người dùng
    res.status(201).json({
      message: "Kết quả đã được lưu thành công!",
      result: {
        ...result.toObject(),
        user: {
          id: userId,
          full_name: user.full_name,
          username: user.username,
          email: user.email,
        },
      },
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ message: "Lỗi lưu kết quả." });
  }
};
export const getResults = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy tất cả kết quả của user hiện tại
    const results = await Results.find({ userId })
      .populate("topic_id", "title")
      .sort({ created_at: -1 })
      .select("user_name skill level score band_score feedback topic_id created_at");

    // Nếu chưa có user_name (trường cũ), fallback từ req.user.full_name
    const formatted = results.map(r => ({
      _id: r._id,
      name: r.user_name || req.user.full_name || "Unknown User",
      skill: r.skill,
      level: r.level,
      score: r.score,
      band_score: r.band_score,
      feedback: r.feedback,
      topic: r.topic_id ? r.topic_id.title : null,
      created_at: r.created_at,
    }));

    res.json({
      total: formatted.length,
      results: formatted,
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ message: "Lỗi khi lấy kết quả." });
  }
};


// Xóa kết quả theo id
export const deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await Results.findOneAndDelete({ _id: id, userId });
    if (!result) return res.status(404).json({ message: "Kết quả không tồn tại hoặc không thuộc user này." });

    res.json({ message: "Xóa kết quả thành công." });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ message: "Lỗi khi xóa kết quả." });
  }
};
export const deleteAllResults = async (req, res) => {
  try {
    const userId = req.user.id;

    const deleted = await Results.deleteMany({ userId });
    if (deleted.deletedCount === 0)
      return res.status(404).json({ message: "Không có kết quả nào để xóa." });

    res.json({
      message: `Đã xóa ${deleted.deletedCount} kết quả của người dùng.`,
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ message: "Lỗi khi xóa tất cả kết quả." });
  }
};
