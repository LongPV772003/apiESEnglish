import { Results } from "../models/Results.js"; // Model lưu kết quả
import { UserSkillProgress } from "../models/UserSkillProgress.js"; // Theo dõi tiến độ học
import { Topic } from "../models/Topic.js"; // Lấy topic
import { User } from "../models/User.js";
import { ContentItem } from "../models/ContentItem.js";

export const saveResult = async (req, res) => {
  try {
    const { topic_id, content_item_id, score, band_score, feedback } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!topic_id || !content_item_id || score === undefined || !feedback) {
      return res.status(400).json({ message: "Thiếu dữ liệu bắt buộc!" });
    }

    const userId = req.user.id;

    // Kiểm tra user tồn tại
    const user = await User.findById(userId).select("full_name username email");
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // Kiểm tra topic tồn tại
    const topic = await Topic.findById(topic_id)
      .populate("skill_id")
      .populate("level_id");
    if (!topic) {
      return res.status(404).json({ message: "Topic không tồn tại" });
    }

    const skill = topic.skill_id;
    const level = topic.level_id;

    // Kiểm tra content_item thuộc topic (nếu cần)
   const contentItem = await ContentItem.findOne({
    _id: content_item_id,
    topic_id: topic_id
  });

  if (!contentItem) {
    return res.status(400).json({
      message: "Content-item không tồn tại hoặc không thuộc topic này!"
    });
  }

    // 🔁 Kiểm tra nếu user đã có kết quả cho content_item_id này thì cập nhật thay vì tạo mới
    const existingResult = await Results.findOne({
      userId,
      topic_id,
      content_item_id,
    });

    let result;
    if (existingResult) {
      existingResult.score = score;
      existingResult.band_score = band_score;
      existingResult.feedback = feedback;
      existingResult.created_at = new Date();
      await existingResult.save();
      result = existingResult;
    } else {
      result = await Results.create({
        userId,
        user_name: user.full_name || user.username,
        skill: skill.code,
        level: level.code,
        score,
        band_score,
        feedback,
        topic_id,
        content_item_id,
      });
    }

    // ➤ Cập nhật tiến độ học
    await UserSkillProgress.findOneAndUpdate(
      { user_id: userId, skill_id: skill._id, level_id: level._id, topic_id },
      {
        $inc: {
          total_attempts: 1,
          total_score: score,
          correct_count: score >= 5 ? 1 : 0,
        },
        $set: { last_activity_at: new Date() },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      message: existingResult
        ? "Đã cập nhật kết quả cho content-item này!"
        : "Đã lưu kết quả mới!",
      result,
    });
  } catch (err) {
    console.error("❌ Lỗi khi lưu kết quả:", err.message);
    res.status(500).json({
      message: "Lỗi lưu kết quả.",
      error: err.message,
    });
  }
};
export const getResults = async (req, res) => {
  try {
    const userId = req.user.id;

    // Lấy tất cả kết quả của user hiện tại
    const results = await Results.find({ userId })
      .populate("topic_id", "title")
      .sort({ created_at: -1 })
      .select(
        "user_name skill level score band_score feedback topic_id created_at"
      );

    // Nếu chưa có user_name (trường cũ), fallback từ req.user.full_name
    const formatted = results.map((r) => ({
      _id: r._id,
      user_name: r.user_name || req.user.full_name || "Unknown User",
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
    if (!result)
      return res
        .status(404)
        .json({ message: "Kết quả không tồn tại hoặc không thuộc user này." });

    res.json({ message: "Xóa kết quả thành công." });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ message: "Lỗi khi xóa kết quả." });
  }
};
export const deleteAllResultsUser = async (req, res) => {
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
export const deleteAllResults = async (req, res) => {
  try {
    // Xóa tất cả kết quả trong bảng Results mà không cần tham số _id
    const deleted = await Results.deleteMany({}); // Không có điều kiện, xóa tất cả bản ghi

    if (deleted.deletedCount === 0)
      return res.status(404).json({ message: "Không có kết quả nào để xóa." });

    res.json({
      message: `Đã xóa ${deleted.deletedCount} kết quả trong cơ sở dữ liệu.`,
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ message: "Lỗi khi xóa tất cả kết quả." });
  }
};

export const getAllResults = async (req, res) => {
  try {
    // Lấy tất cả kết quả từ database mà không cần populate
    const results = await Results.find().sort({ created_at: -1 });

    res.json({
      total: results.length,
      results,
    });
  } catch (err) {
    console.error("❌ Error:", err.message);
    res.status(500).json({ message: "Lỗi khi lấy tất cả kết quả." });
  }
};
