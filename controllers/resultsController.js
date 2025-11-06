import { Results } from "../models/Results.js";  // Model lưu kết quả
import { UserSkillProgress } from "../models/UserSkillProgress.js";  // Theo dõi tiến độ học
import { Topic } from "../models/Topic.js";  // Lấy topic

export const saveResult = async (req, res) => {
  try {
    const { topic_id, score, band_score, feedback } = req.body;

    // Kiểm tra dữ liệu hợp lệ
    if (!topic_id || score === undefined || feedback === undefined) {
      return res.status(400).json({ message: "Dữ liệu không hợp lệ!" });
    }

    // Kiểm tra thông tin user
    if (!req.user || !req.user.id) {
      return res.status(400).json({ message: "User không hợp lệ hoặc không có token" });
    }
    const userId = req.user.id;

    // Lấy thông tin topic và skill, level từ topic_id
    const topic = await Topic.findById(topic_id).populate('skill_id').populate('level_id');
    if (!topic) return res.status(404).json({ message: "Topic không tìm thấy" });

    // Kiểm tra thông tin skill và level
    const { skill_id, level_id } = topic;
    if (!skill_id || !level_id) {
      return res.status(400).json({ message: "Không tìm thấy thông tin skill hoặc level trong topic" });
    }

    // Lấy mã skill và level
    const skillCode = skill_id.code;  // Lấy mã kỹ năng từ skill_id (đã được populate)
    const levelCode = level_id.code;  // Lấy mã cấp độ từ level_id (đã được populate)
    const skillId = skill_id._id;  // Lấy mã kỹ năng từ skill_id (đã được populate)
    const levelId = level_id._id; 

    const result = await Results.create({
      userId, 
      skill: skillCode,
      level: levelCode,
      score,
      band_score,
      feedback,
      topic_id,
    });

    // Cập nhật tiến độ học của người dùng
    await UserSkillProgress.findOneAndUpdate(
        { user_id: userId, skill_id: skillId, level_id: levelId, topic_id },
        {
            $inc: { total_attempts: 1, total_score: score, correct_count: score >= 5 ? 1 : 0 },
            $set: { last_activity_at: new Date() },
        },
        { upsert: true, new: true }
    );


    res.status(201).json({
      message: "Kết quả đã được lưu thành công!",
      result,
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ message: "Lỗi lưu kết quả." });
  }
};
export const getResults = async (req, res) => {
  try {
    const userId = req.user.id;
    const results = await Results.find({ userId })
      .populate("topic_id", "title")
      .sort({ created_at: -1 });

    res.json({ total: results.length, results });
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
