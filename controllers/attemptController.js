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
// export const getMyProgress = async (req, res) => {
//   try {
//     const userId = req.user.id; // Lấy user_id từ decoded token

//     // 1️⃣ Lấy thông tin tiến độ học của người dùng từ UserSkillProgress và populate skill_id, level_id, topic_id
//     const progressList = await UserSkillProgress.find({ user_id: userId })
//       .populate("skill_id") // Populate thông tin về skill
//       .populate("level_id") // Populate thông tin về level
//       .populate("topic_id") // Populate thông tin về topic
//       .lean();

//     const progress = [];

//     // 2️⃣ Duyệt qua các tiến độ học của người dùng
//     for (const p of progressList) {
//       // Lấy điểm và nhận xét của mỗi topic
//       const recentAttempt = await UserAttempt.findOne({
//         user_id: userId,
//         skill_id: p.skill_id?._id,
//         level_id: p.level_id?._id,
//         topic_id: p.topic_id?._id, // Lọc theo topic_id
//       })
//         .sort({ submitted_at: -1 }) // Sắp xếp để lấy attempt gần nhất
//         .lean();

//       const score = recentAttempt ? recentAttempt.score : 0;
//       const feedback = recentAttempt
//         ? recentAttempt.feedback
//         : "No feedback provided";

//       const progress_percent =
//         p.total_attempts > 0
//           ? Math.round((p.correct_count / p.total_attempts) * 100)
//           : 0;

//       // Lưu thông tin tiến độ của từng topic
//       progress.push({
//         skill_code: p.skill_id.code,
//         skill_name: p.skill_id.name,
//         level: p.level_id?.name || "Unknown",
//         topic_title: p.topic_id?.title || "No Title",
//         topic_description: p.topic_id?.description || "No Description",
//         progress_percent,
//         completed_lessons: p.correct_count,
//         total_lessons: p.total_attempts,
//         score, // Điểm của topic
//         feedback, // Nhận xét của topic
//         topic_details: p.topic_id || {}, // Thêm tất cả thông tin của topic_id
//       });
//     }

//     // 3️⃣ Tính tổng điểm mock tests (điểm từ tiến độ học)
//     const mock_tests = {
//       total_score: progress.reduce(
//         (sum, s) => sum + (s.progress_percent || 0),
//         0
//       ),
//       skills: progress.map((s) => ({
//         skill: s.skill_name,
//         score: s.progress_percent,
//       })),
//     };

//     const savedWords = await SavedWord.find({ user_id: userId })
//       .select("flashcard_id") // Lấy thông tin flashcard_id đã lưu
//       .lean();

//     if (!savedWords.length) {
//       return res.json({ progress, mock_tests, flashcards: [] }); // Nếu không có từ đã lưu
//     }

//     // 5️⃣ Truy vấn các flashcards đã lưu và nhóm theo topic_id
//     const flashcardsRaw = await Flashcard.find({
//       _id: { $in: savedWords.map((s) => s.flashcard_id) },
//     })
//       .populate("topic_id") // Populate để lấy thông tin về topic_id
//       .lean();

//     const grouped = {};
//     for (const f of flashcardsRaw) {
//       const topicName = f.topic_id?.title || "General";
//       if (!grouped[topicName]) grouped[topicName] = [];
//       grouped[topicName].push({
//         words: f.word,
//         phonetic: f.phonetic,
//       });
//     }

//     const flashcards = Object.keys(grouped).map((topic) => ({
//       topic,
//       words: grouped[topic],
//     }));

//     // 5️⃣ Trả về dữ liệu tiến độ học, điểm và nhận xét cho từng topic, flashcards
//     res.json({
//       progress, // Trả thông tin về điểm và nhận xét cho từng topic
//       mock_tests,
//       flashcards,
//     });
//   } catch (err) {
//     console.error("getMyProgress error:", err);
//     res.status(500).json({ message: "Server error", error: err.message });
//   }
// };
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

    // ---------- XỬ LÝ TIẾN ĐỘ TỪNG TOPIC ----------
    for (const p of progressRaw) {
      const topicId = p.topic_id?._id;
      if (!topicId) continue;

      // 1) Lấy toàn bộ content-item thuộc topic
      const contentItems = await ContentItem.find({ topic_id: topicId }).lean();
      const total_questions_topic = contentItems.length;

      // 2) Đếm số content-item đã DONE (lấy attempt gần nhất)
      let correct_count = 0;

      for (const ci of contentItems) {
        const latestAttempt = await UserAttempt.findOne({
          user_id: userId,
          topic_id: topicId,
          content_item_id: ci._id,
          status: "SUBMITTED",
        })
          .sort({ submitted_at: -1 })
          .lean();

        if (latestAttempt && latestAttempt.score >= 5) {
          correct_count++;
        }
      }

      // 3) Tính %
      const progress_percent =
        total_questions_topic > 0
          ? Math.round((correct_count / total_questions_topic) * 100)
          : 0;

      progress.push({
        skill_code: p.skill_id.code,
        skill_name: p.skill_id.name,
        level: p.level_id.name,
        total_attempts: p.total_attempts,
        point: correct_count * 10,
        correct_count,
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

    const skills_summary = [];

    for (const code of Object.keys(skillScores)) {
      const s = skillScores[code];

      // 1) Lấy tất cả topic thuộc skill
      const allTopics = await Topic.find({ skill_id: s.skill_id }).select("_id");

      // 2) Tổng số content-item của toàn skill
      const total_questions_skill_all_topics = await ContentItem.countDocuments({
        topic_id: { $in: allTopics.map((t) => t._id) },
      });
      // 3) Trung bình % tiến độ từ từng topic
      const avg_progress = Number(
        ((s.total_done / total_questions_skill_all_topics) * 100).toFixed(2)
      );

      skills_summary.push({
        skill: code,
        total_done: s.total_done,
        total_point: s.total_done * 10,
        total_not_done: total_questions_skill_all_topics - s.total_done,
        total_questions_skill_all_topics,
        avg_progress_percent: avg_progress,
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

