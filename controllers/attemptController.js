import { UserAttempt } from "../models/UserAttempt.js";
import { AttemptAnswer } from "../models/AttemptAnswer.js";
import { QuestionOption } from "../models/QuestionOption.js";
import { AttemptArtifact } from "../models/AttemptArtifact.js";
import { UserSkillProgress } from "../models/UserSkillProgress.js";
import { Flashcard } from "../models/Flashcard.js";
import { SavedWord } from "../models/SavedWord.js";
import { UserStudyTime } from "../models/UserStudyTime.js";
import { ContentItem } from "../models/ContentItem.js";
import { MockTestAttempt } from "../models/MockTestAttempt.js";
import { MockTestAttemptAnswer } from "../models/MockTestAttemptAnswer.js";
import { Topic } from "../models/Topic.js";
import { Skill } from "../models/Skill.js";
import { Results } from "../models/Results.js";  
const autoGradeMCQ = async (question_id, chosen_option_id) => {
  const opt = await QuestionOption.findOne({
    _id: chosen_option_id,
    question_id,
  });
  if (!opt) return { is_correct: false, points: 0 };
  return { is_correct: !!opt.is_correct, points: opt.is_correct ? 10 : 0 };
};
export const startAttempt = async (req, res) => {
  const att = await UserAttempt.create({ user_id: req.user.id, ...req.body });
  res.json(att);
};
export const answerQuestion = async (req, res) => {
  const { attempt_id, question_id, chosen_option_id, answer_text } = req.body;
  const att = await UserAttempt.findOne({
    _id: attempt_id,
    user_id: req.user.id,
  });
  if (!att) return res.status(404).json({ message: "Attempt not found" });
  let is_correct, score;
  if (chosen_option_id) {
    const g = await autoGradeMCQ(question_id, chosen_option_id);
    is_correct = g.is_correct;
    score = g.points;
  }
  const ans = await AttemptAnswer.findOneAndUpdate(
    { attempt_id, question_id },
    { chosen_option_id, answer_text, is_correct, score },
    { upsert: true, new: true }
  );
  res.json(ans);
};
export const submitAttempt = async (req, res) => {
  const { attempt_id } = req.body;
  const att = await UserAttempt.findOne({
    _id: attempt_id,
    user_id: req.user.id,
  });
  if (!att) return res.status(404).json({ message: "Attempt not found" });
  const answers = await AttemptAnswer.find({ attempt_id });
  const totalScore = answers.reduce((s, a) => s + (a.score || 0), 0);
  const correctCount = answers.filter((a) => a.is_correct).length;
  att.status = "SUBMITTED";
  att.score = totalScore;
  att.submitted_at = new Date();
  await att.save();
  await UserSkillProgress.findOneAndUpdate(
    { user_id: req.user.id, skill_id: att.skill_id, level_id: att.level_id, topic_id: att.topic_id },
    {
      $inc: {
        total_attempts: 1,
        correct_count: correctCount > 0 ? 1 : 0,
        total_score: totalScore,
      },
      $set: { last_activity_at: new Date() },
    },
    { upsert: true, new: true }
  );
  res.json({ attempt_id, totalScore, correctCount });
};
export const getAttemptDetail = async (req, res) => {
  const att = await UserAttempt.findOne({
    _id: req.params.id,
    user_id: req.user.id,
  });
  if (!att) return res.status(404).json({ message: "Not found" });
  const answers = await AttemptAnswer.find({ attempt_id: att._id });
  res.json({ attempt: att, answers });
};
export const addArtifact = async (req, res) => {
  const { id } = req.params;
  const att = await UserAttempt.findOne({ _id: id, user_id: req.user.id });
  if (!att) return res.status(404).json({ message: "Attempt not found" });
  const art = await AttemptArtifact.create({ attempt_id: id, ...req.body });
  res.status(201).json(art);
};
export const getMyProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1) Lấy UserSkillProgress
    const progressRaw = await UserSkillProgress.find({ user_id: userId })
      .populate("skill_id")
      .populate("level_id")
      .populate("topic_id")
      .lean();

    const progress = [];

    for (const p of progressRaw) {
      const topicId = p.topic_id?._id;
      if (!topicId) continue;

      // 1) Toàn bộ content-item của topic
      const contentItems = await ContentItem.find({ topic_id: topicId }).lean();
      const total_questions_topic = contentItems.length;

      let correct_count = 0;

      for (const ci of contentItems) {

        // ================================
        // A) CHECK MCQ (Listening / Reading)
        // ================================
        const latestMCQ = await UserAttempt.findOne({
          user_id: userId,
          topic_id: topicId,
          content_item_id: ci._id,
          status: "SUBMITTED",
        })
          .sort({ submitted_at: -1 })
          .lean();

        if (latestMCQ && latestMCQ.score >= 5) {
          correct_count++;
          continue; // Không cần check Writing/Speaking nữa
        }

        // ==========================================
        // B) CHECK WRITING / SPEAKING (từ Results)
        // ==========================================
        const latestWS = await Results.findOne({
          userId,
          topic_id: topicId,
          content_item_id: ci._id,
        })
          .sort({ created_at: -1 })
          .lean();

        if (latestWS && latestWS.score > 0) {
          correct_count++;
        }
      }

      const progress_percent =
        total_questions_topic > 0
          ? Math.round((correct_count / total_questions_topic) * 100)
          : 0;

      progress.push({
        skill_code: p.skill_id.code,
        skill_name: p.skill_id.name,
        level: p.level_id.name,
        correct_count,
        point: correct_count * 10,
        total_questions_topic,
        progress_percent,
        last_activity_at: p.last_activity_at,
        topic_details: p.topic_id,
      });
    }

    // ---------- TỔNG HỢP TIẾN ĐỘ THEO SKILL ----------
    const skillScores = {};

    for (const p of progress) {
      if (!skillScores[p.skill_code]) {
        skillScores[p.skill_code] = {
          total_done: 0,
          total_questions_skill_all_topics: 0,
          progress_percent_list: [],
          skill_id: p.topic_details.skill_id,
        };
      }

      skillScores[p.skill_code].total_done += p.correct_count;
      skillScores[p.skill_code].progress_percent_list.push(p.progress_percent);
    }

    const allSkills = await Skill.find().lean();

    const skills_summary = [];

    for (const skill of allSkills) {
      const code = skill.code;

      // Nếu user chưa có data → gán default
      const s = skillScores[code] || {
        total_done: 0,
        skill_id: skill._id
      };

      // 1) Lấy topic thuộc skill
      const topicIds = await Topic.find({ skill_id: s.skill_id }).select("_id");

      // 2) Tổng số câu của toàn skill (từ tất cả content_item)
      const total_questions_skill_all_topics = await ContentItem.countDocuments({
        topic_id: { $in: topicIds.map(t => t._id) }
      });

      // 3) Số câu đã làm + chưa làm
      const total_done = s.total_done;
      const total_not_done = Math.max(total_questions_skill_all_topics - total_done, 0);

      // 4) % tiến độ
      const avg_progress_percent =
        total_questions_skill_all_topics > 0
          ? Number(((total_done / total_questions_skill_all_topics) * 100).toFixed(2))
          : 0;

      skills_summary.push({
        skill: code,
        total_done,
        total_point: total_done * 10,
        total_not_done,
        total_questions_skill_all_topics,
        avg_progress_percent
      });
    }

    // ---------- TÍNH TỔNG TIẾN ĐỘ TOÀN USER ----------
    const total_user_score = skills_summary.reduce(
      (sum, s) => (sum + (s.total_done * 10)) ,
      0
    );
    const total_user_questions = skills_summary.reduce(
      (sum, s) => sum + s.total_questions_skill_all_topics,
      0
    );

    // ---------- HỌC THỜI GIAN TRONG 7 NGÀY ----------
    const now = new Date();
    const days = [];
    let total_7days = 0;

    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);

      const dayStr = d.toISOString().slice(0, 10);

      const record = await UserStudyTime.findOne({
        user_id: userId,
        date: dayStr,
      });

      const duration = record ? record.duration : 0;
      total_7days += duration;

      days.push({
        date: dayStr,
        duration,
      });
    }

    const study_time = {
      total_7days,
      daily: days.reverse(),
    };

    // ---------- MOCK TEST ----------
    const mockAttempts = await MockTestAttempt.find({
      user_id: userId,
      status: "SUBMITTED",
    })
      .populate("test_id")
      .sort({ submitted_at: -1 })
      .lean();

    const mock_tests = [];

    for (const mt of mockAttempts) {
      const answers = await MockTestAttemptAnswer.find({
        attempt_id: mt._id,
      }).lean();

      mock_tests.push({
        mock_test_id: mt._id,
        test_title: mt.test_id?.title || "Unknown Test",
        total_questions_test: answers.length,
        test_correct: mt.correct_count,
        test_incorrect: mt.wrong_count,
        test_score: mt.score * 10,
        submitted_at: mt.submitted_at,
      });
    }

    // ---------- RESPONSE ----------
    return res.json({
      total_user_score,
      total_user_questions,
      progress,
      skills_summary,
      study_time,
      mock_tests,
    });
  } catch (err) {
    console.error("getMyProgress error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const clearAllProgress = async (req, res) => {
  try {
    const result = await UserSkillProgress.deleteMany({});
    res.json({
      message: "Đã xoá toàn bộ progress",
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    console.error("clearAllProgress error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

