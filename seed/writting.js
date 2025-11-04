import mongoose from "mongoose";
import dotenv from "dotenv";
import { Skill } from "../models/Skill.js";
import { Level } from "../models/Level.js";
import { Topic } from "../models/Topic.js";
import { ContentItem } from "../models/ContentItem.js";
import { Question } from "../models/Question.js";
import { QuestionOption } from "../models/QuestionOption.js";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

// ====================== CONFIG ======================
const CLOUD_IMG_BASE = "https://res.cloudinary.com/dtdsqfj0i/image/upload/v1761314549/";

const writingImages = {
  BEGINNER: `${CLOUD_IMG_BASE}Essay-on-Football_huwk1d.jpg`,
  INTERMEDIATE: `${CLOUD_IMG_BASE}6523fd4986922b4ded7a47ce_blog-1-header_uyitbn.webp`,
  ADVANCED: `${CLOUD_IMG_BASE}images_v3zsnk.jpg`,
};

// ====================== HELPERS ======================
function getWritingContent(levelCode, topicIndex) {
  switch (levelCode) {
    case "BEGINNER":
      return {
        title: `Fill in the blank - Exercise ${topicIndex + 1}`,
        body_text:
          "Public Education in the United States, programs of instruction (provide) ______ to children, adolescents, and adults through schools and colleges.",
        description: "Điền từ đúng vào chỗ trống để hoàn thành câu.",
        question_text: "Hoàn thành câu bằng cách điền đúng từ vào chỗ trống.",
      };

    case "INTERMEDIATE":
      const topics = [
        { q: "Introduce yourself.", key: "intro" },
        { q: "Describe your job.", key: "job" },
        { q: "Talk about your hobbies.", key: "hobbies" },
      ];
      const t = topics[topicIndex % topics.length];
      return {
        title: `Short Introduction - ${t.key}`,
        body_text: `Viết 3-5 câu giới thiệu về chủ đề: "${t.q}"`,
        description: "Mô tả bản thân, công việc hoặc sở thích trong 3-5 câu.",
        question_text: t.q,
        image: writingImages.INTERMEDIATE, // Cùng hình ảnh cho các content trong Intermediate
      };

    case "ADVANCED":
      const advancedTopics = [
        { q: "What do you like to do in your free time?", key: "freetime" },
        { q: "Is it better to study abroad or in your own country?", key: "studyabroad" },
      ];
      const adv = advancedTopics[topicIndex % advancedTopics.length];
      return {
        title: `Essay Writing - ${adv.key}`,
        body_text: `Write a short essay (200–300 words) about the topic: "${adv.q}"`,
        description: "Viết bài luận ngắn theo chủ đề, thể hiện ý kiến cá nhân.",
        question_text: adv.q,
      };

    default:
      return {};
  }
}

// ====================== SEED ======================
async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected MongoDB");

    const writingSkill = await Skill.findOne({ code: "WRITING" });
    if (!writingSkill) throw new Error("⚠️ Skill WRITING chưa được seed!");

    const levels = await Level.find();
    if (!levels.length) throw new Error("⚠️ Cần seed các level trước!");

    // 🔥 Xóa dữ liệu cũ chỉ của WRITING
    const oldTopics = await Topic.find({ skill_id: writingSkill._id });
    const oldTopicIds = oldTopics.map(t => t._id);

    const oldContents = await ContentItem.find({ topic_id: { $in: oldTopicIds } });
    const oldContentIds = oldContents.map(c => c._id);

    const oldQuestions = await Question.find({ content_item_id: { $in: oldContentIds } });
    const oldQuestionIds = oldQuestions.map(q => q._id);

    await QuestionOption.deleteMany({ question_id: { $in: oldQuestionIds } });
    await Question.deleteMany({ _id: { $in: oldQuestionIds } });
    await ContentItem.deleteMany({ _id: { $in: oldContentIds } });
    await Topic.deleteMany({ _id: { $in: oldTopicIds } });

    console.log(`🧹 Cleared old WRITING data: ${oldTopics.length} topics, ${oldContents.length} contents, ${oldQuestions.length} questions.`);

    // ================== SEEDING ==================
    let topicCount = 0, contentCount = 0;

    for (const level of levels) {
      for (let t = 0; t < (level.code === "BEGINNER" ? 3 : level.code === "INTERMEDIATE" ? 2 : 1); t++) { // Điều chỉnh số lượng content-item cho từng cấp độ
        const topic = await Topic.create({
          skill_id: writingSkill._id,
          level_id: level._id,
          title: `Writing ${level.name} Topic ${t + 1}`,
          description: `Practice writing exercise for ${level.name} level.`,
          type: "CONTENT",
        });
        topicCount++;

        // Mỗi topic 1 content item
        const contentData = getWritingContent(level.code, t);
        const content = await ContentItem.create({
          topic_id: topic._id,
          type: "WRITING_PROMPT",
          title: contentData.title,
          body_text: contentData.body_text,
          media_image_url: contentData.image || writingImages[level.code],
          is_published: true,
          meta: { level: level.code, skill: "WRITING" },
        });
        contentCount++;

        // Mỗi content có 1 câu hỏi mở (OPEN_ENDED)
        await Question.create({
          content_item_id: content._id,
          question_type: "OPEN_ENDED",
          question_text: contentData.question_text,
          points: 5,
          order_in_item: 1,
        });
      }
    }

    console.log(`🎉 Seeded ${topicCount} WRITING topics & ${contentCount} content items successfully!`);
    console.log("💬 Sample AI scoring API: POST /api/ai-scoring/writing");
    console.log("🧠 Returns AI feedback & score for user essays.");

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}

run();
