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

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected MongoDB");

    const speakingSkill = await Skill.findOne({ code: "SPEAKING" });
    if (!speakingSkill) throw new Error("⚠️ Skill SPEAKING chưa được seed!");

    const levels = await Level.find(); // Lấy tất cả các level
    if (!levels.length) throw new Error("⚠️ Cần seed các level trước!");

    const topics = await Topic.find({ skill_id: speakingSkill._id });
    if (!topics.length) throw new Error("⚠️ Chưa có topic cho kỹ năng SPEAKING.");

    // Không xoá câu hỏi của các kỹ năng khác, chỉ xoá câu hỏi của SPEAKING
    await ContentItem.deleteMany({ topic_id: { $in: topics.map(t => t._id) } });
    await Question.deleteMany({ content_item_id: { $in: topics.map(t => t._id) } });

    const CLOUD_BASE = "https://res.cloudinary.com/dtdsqfj0i/image/upload/v1761314549/";

    // Cập nhật hình ảnh và audio cho từng content-item
    const speakingImages = {
      BEGINNER: [
        `${CLOUD_BASE}Morning_brushing_vs._nighttime_brushing_zl0008.jpg`,
      ],
      INTERMEDIATE: [
        `${CLOUD_BASE}nghi-luan-ve-tam-quan-trong-cua-viec-hoc_kpedpg.jpg`,
      ],
      ADVANCED: [
        `${CLOUD_BASE}images_1_tiv9fz.jpg`,
      ],
    };

    const SAMPLE_AUDIO = {
      BEGINNER: [
        "https://res.cloudinary.com/dtdsqfj0i/video/upload/v1762104151/1762103517809908853-329935719813257_izwwxm.mp3",
        "https://res.cloudinary.com/dtdsqfj0i/video/upload/v1762104151/1762103546573471077-329935847858244_iprm9y.mp3",
      ],
      INTERMEDIATE: [
        "https://res.cloudinary.com/dtdsqfj0i/video/upload/v1762104151/1762103591694443831-329935951863893_rlt4ep.mp3",
      ],
      ADVANCED: [],
    };

    let total = 0;

    for (const topic of topics) {
      for (const level of levels) {
        console.log(`🌱 Seeding Speaking content for ${level.name} - ${topic.title}`);

        // Lấy danh sách hình ảnh và âm thanh cho cấp độ hiện tại
        const images = speakingImages[level.code];
        const audio = SAMPLE_AUDIO[level.code];

        // 1️⃣ BODY TEXT CHUẨN THEO LEVEL
        const body_text = getSpeakingBodyText(level.code);
        const question_data = getSpeakingQuestion(level.code);

        // 2️⃣ Tạo content item cho mỗi câu hỏi trong topic
        for (let i = 0; i < images.length; i++) {
          const content = await ContentItem.create({
            topic_id: topic._id,
            type: "SPEAKING_PROMPT",
            title: `Speaking Prompt: ${topic.title} (${level.name}) - Content ${i + 1}`,
            body_text,
            media_image_url: images[i],
            media_audio_url: audio[i],
            is_published: true,
            meta: { level: level.code, skill: "SPEAKING" },
            level_id: level._id, // Thêm `level_id` vào ContentItem
          });

          // 3️⃣ Tạo câu hỏi (1 câu hỏi cho content-item)
          const createdQuestion = await Question.create({
            content_item_id: content._id,
            question_type: "OPEN_ENDED",
            question_text: question_data.text,
            points: 1,
            order_in_item: i + 1,
          });

          total++;
        }
      }
    }

    console.log(`🎉 Seeded ${total} SPEAKING content items!`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

function getSpeakingBodyText(level) {
  switch (level) {
    case "BEGINNER":
      return "Đọc lại đoạn văn sau và ghi âm giọng nói của bạn.";
    case "INTERMEDIATE":
      return "Trả lời câu hỏi sau bằng giọng nói của bạn.";
    case "ADVANCED":
      return "Nêu ý kiến của bạn về chủ đề dưới đây trong vòng 1-2 phút.";
    default:
      return "Default speaking prompt.";
  }
}

function getSpeakingQuestion(level) {
  switch (level) {
    case "BEGINNER":
      return {
        text: "I brush my teeth every morning",
      };
    case "INTERMEDIATE":
      return {
        text: "Please answer the following question in your own voice: What do you like to do in your free time? ",
      };
    case "ADVANCED":
      return {
        text: "State your opinion on the topic: 'The importance of lifelong learning'.",
      };
    default:
      return {
        text: "Default speaking question.",
      };
  }
}

run();

