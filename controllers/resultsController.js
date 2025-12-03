import { Results } from "../models/Results.js"; // Model lưu kết quả
import { UserSkillProgress } from "../models/UserSkillProgress.js"; // Theo dõi tiến độ học
import { Topic } from "../models/Topic.js"; // Lấy topic
import { User } from "../models/User.js";
import { ContentItem } from "../models/ContentItem.js";

export const saveResult = async (req, res) => {
  try {
    const { topic_id, content_item_id, score, band_score, feedback } = req.body;

    if (!topic_id || !content_item_id || score === undefined || !feedback) {
      return res.status(400).json({ message: "Thiếu dữ liệu!" });
    }

    const userId = req.user.id;

    const topic = await Topic.findById(topic_id)
      .populate("skill_id")
      .populate("level_id");

    if (!topic) return res.status(404).json({ message: "Topic không tồn tại" });

    const skill = topic.skill_id;
    const level = topic.level_id;
    const user = await User.findById(userId).select("full_name username email");
        if (!user) {
          return res.status(404).json({ message: "User không tồn tại" });
        }

    // Lấy content-item để kiểm tra hợp lệ
    const contentItem = await ContentItem.findOne({
      _id: content_item_id,
      topic_id
    });

    if (!contentItem) {
      return res.status(400).json({ message: "Content item không thuộc topic!" });
    }

    // =========== SAVE / UPDATE RESULT ===========
    const existing = await Results.findOne({ userId, topic_id, content_item_id });
    const isFirstTime = existing ? false : true;

    let result;
    if (existing) {
      existing.score = score;
      existing.band_score = band_score;
      existing.feedback = feedback;
      existing.created_at = new Date();
      await existing.save();
      result = existing;
    } else {
      result = await Results.create({
        userId,
        user_name: user.full_name || user.username,
        skill: skill.code,
        level: level.code,
        topic_id,
        content_item_id,
        score,
        band_score,
        feedback
      });
    }

    // =========== UPDATE PROGRESS ===========
    await UserSkillProgress.findOneAndUpdate(
      {
        user_id: userId,
        skill_id: skill._id,
        level_id: level._id,
        topic_id
      },
      {
        $inc: {
          total_attempts: 1,
          total_questions_done: isFirstTime ? 1 : 0
        },
        $set: { last_activity_at: new Date() }
      },
      { upsert: true }
    );

    return res.json({
      message: existing ? "Đã cập nhật kết quả!" : "Đã lưu kết quả!",
      result
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

export const getResults = async (req, res) => {
  try {
    const userId = req.user.id;

    const results = await Results.find({ userId })
      .populate("topic_id", "title")
      .sort({ created_at: -1 })
      .lean();

    const formatted = results.map((r) => ({
      _id: r._id,
      skill: r.skill,
      level: r.level,
      score: r.score,
      band_score: r.band_score,
      feedback: r.feedback,
      topic_id: r.topic_id?._id,
      topic_title: r.topic_id?.title,
      content_item_id: r.content_item_id,
      created_at: r.created_at,
    }));

    res.json({ total: formatted.length, results: formatted });
  } catch (err) {
    console.error("❌ getResults error:", err);
    res.status(500).json({ message: "Lỗi khi lấy kết quả." });
  }
};

/* ============================================================
   DELETE SINGLE RESULT
   ============================================================ */
export const deleteResult = async (req, res) => {
  try {
    const userId = req.user.id;

    const deleted = await Results.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!deleted)
      return res
        .status(404)
        .json({ message: "Không tìm thấy kết quả hoặc không thuộc user." });

    res.json({ message: "Đã xóa kết quả." });
  } catch (err) {
    console.error("❌ deleteResult error:", err);
    res.status(500).json({ message: "Lỗi xóa kết quả." });
  }
};

/* ============================================================
   DELETE ALL RESULTS OF THIS USER
   ============================================================ */
export const deleteAllResultsUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const deleted = await Results.deleteMany({ userId });

    res.json({
      message: `Đã xóa ${deleted.deletedCount} kết quả của user.`,
    });
  } catch (err) {
    console.error("❌ deleteAllResultsUser error:", err);
    res.status(500).json({ message: "Lỗi xóa kết quả user." });
  }
};

/* ============================================================
   DELETE ALL RESULTS (ADMIN)
   ============================================================ */
export const deleteAllResults = async (_req, res) => {
  try {
    const deleted = await Results.deleteMany({});
    res.json({
      message: `Đã xóa ${deleted.deletedCount} kết quả toàn hệ thống.`,
    });
  } catch (err) {
    console.error("❌ deleteAllResults error:", err);
    res.status(500).json({ message: "Lỗi xóa toàn bộ kết quả." });
  }
};

/* ============================================================
   GET ALL RESULTS (ADMIN)
   ============================================================ */
export const getAllResults = async (_req, res) => {
  try {
    const results = await Results.find()
      .populate("topic_id", "title")
      .sort({ created_at: -1 })
      .lean();

    res.json({
      total: results.length,
      results,
    });
  } catch (err) {
    console.error("❌ getAllResults error:", err);
    res.status(500).json({ message: "Lỗi lấy tất cả kết quả." });
  }
};