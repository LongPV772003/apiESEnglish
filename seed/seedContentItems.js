import mongoose from "mongoose";
import dotenv from "dotenv";
import axios from "axios";
import { Topic } from "../models/Topic.js";
import { ContentItem } from "../models/ContentItem.js";
import { Skill } from "../models/Skill.js";

dotenv.config();

if (!process.env.MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env");
  process.exit(1);
}
if (!process.env.PIXABAY_KEY) {
  console.error("❌ Missing PIXABAY_KEY in .env");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB");

// =========================
// Helpers: Pixabay
// =========================
async function getPixabayImage(query, fallbackText = "No Image") {
  const url = `https://pixabay.com/api/?key=${process.env.PIXABAY_KEY}&q=${encodeURIComponent(
    query
  )}&image_type=photo&orientation=horizontal&safesearch=true&per_page=5`;
  try {
    const res = await axios.get(url);
    if (res?.data?.hits?.length) {
      // Ưu tiên ảnh có độ phân giải tốt
      const hit = res.data.hits[0];
      return hit.webformatURL || hit.largeImageURL || hit.previewURL;
    }
  } catch (e) {
    console.warn(`⚠️ Pixabay image error (${query}): ${e.message}`);
  }
  return `https://via.placeholder.com/800x450?text=${encodeURIComponent(fallbackText)}`;
}

async function getPixabayVideo(query) {
  // Pixabay Videos endpoint
  const url = `https://pixabay.com/api/videos/?key=${process.env.PIXABAY_KEY}&q=${encodeURIComponent(
    query
  )}&video_type=film&safesearch=true&per_page=5`;
  try {
    const res = await axios.get(url);
    if (res?.data?.hits?.length) {
      const hit = res.data.hits[0];
      // Chọn chất lượng vừa phải để stream ổn định
      const files = hit.videos || {};
      return (
        files.medium?.url ||
        files.small?.url ||
        files.large?.url ||
        files.tiny?.url ||
        ""
      );
    }
  } catch (e) {
    console.warn(`⚠️ Pixabay video error (${query}): ${e.message}`);
  }
  return "";
}

// =========================
// Build seed
// =========================
const skills = await Skill.find();
const topics = await Topic.find();

if (!skills.length || !topics.length) {
  console.log("⚠️ Cần seed kỹ năng và topics trước khi chạy.");
  process.exit(1);
}

const contentItems = [];

for (const topic of topics) {
  const skill = skills.find((s) => s._id.toString() === String(topic.skill_id));
  if (!skill) continue;

  // Ảnh mặc định theo topic (dùng lại giữa các item của topic để đồng bộ visual)
  const topicImage = await getPixabayImage(`${topic.title} English learning`, topic.title);

  switch (skill.code) {
    // ===============================================
    // LISTENING (dùng video Pixabay làm nguồn nghe)
    // ===============================================
    case "LISTENING": {
      // Tạo 2 video “liên quan chủ đề” để làm listening clip
      const video1 =
        (await getPixabayVideo(`${topic.title} conversation`)) ||
        (await getPixabayVideo(`${topic.title} people talking`));
      const video2 =
        (await getPixabayVideo(`${topic.title} daily life`)) ||
        (await getPixabayVideo(`${topic.title} interview`));

      contentItems.push(
        {
          topic_id: topic._id,
          type: "LISTENING_AUDIO",
          title: `Audio 1: ${topic.title}`,
          body_text: "Listen to the short clip and answer the questions below.",
          // Pixabay không có audio-only => dùng video URL (MP4)
          media_audio_url: video1 || "",
          media_image_url: topicImage,
          meta: { duration: "~2 min", accent: "Neutral", media_type: "video" },
          is_published: true,
        },
        {
          topic_id: topic._id,
          type: "LISTENING_AUDIO",
          title: `Audio 2: ${topic.title}`,
          body_text: "Listen carefully and fill in the missing words you hear.",
          media_audio_url: video2 || "",
          media_image_url: topicImage,
          meta: { duration: "~2 min", accent: "Neutral", media_type: "video" },
          is_published: true,
        }
      );
      break;
    }

    // ===============================================
    // READING (text + ảnh minh họa từ Pixabay)
    // ===============================================
    case "READING":
      contentItems.push(
        {
          topic_id: topic._id,
          type: "READING_PASSAGE",
          title: `Reading Passage 1: ${topic.title}`,
          body_text:
            "People around the world are becoming more aware of environmental problems. Many countries have started to recycle waste, reduce pollution, and plant trees.",
          media_image_url:
            (await getPixabayImage(`${topic.title} environment`)) || topicImage,
          meta: { word_count: 120, difficulty: "medium" },
          is_published: true,
        },
        {
          topic_id: topic._id,
          type: "READING_PASSAGE",
          title: `Reading Passage 2: ${topic.title}`,
          body_text:
            "Healthy eating means choosing foods that provide nutrients your body needs, such as vitamins, minerals, and fiber.",
          media_image_url:
            (await getPixabayImage(`${topic.title} healthy food`)) || topicImage,
          meta: { word_count: 100, difficulty: "easy" },
          is_published: true,
        }
      );
      break;

    // ===============================================
    // WRITING (prompt + ảnh Pixabay)
    // ===============================================
    case "WRITING":
      contentItems.push(
        {
          topic_id: topic._id,
          type: "WRITING_PROMPT",
          title: `Writing Task 1: ${topic.title}`,
          body_text:
            "Write about your daily routine. What time do you wake up, go to school, and go to bed? Use at least 5 sentences.",
          media_image_url:
            (await getPixabayImage(`${topic.title} routine`)) || topicImage,
          meta: { word_limit: 120, difficulty: "beginner" },
          is_published: true,
        },
        {
          topic_id: topic._id,
          type: "WRITING_PROMPT",
          title: `Writing Task 2: ${topic.title}`,
          body_text:
            "Describe your favorite place to visit. Explain why it’s special and what people can do there.",
          media_image_url:
            (await getPixabayImage(`${topic.title} favorite place`)) || topicImage,
          meta: { word_limit: 150, difficulty: "intermediate" },
          is_published: true,
        }
      );
      break;

    // ===============================================
    // SPEAKING (prompt + ảnh Pixabay)
    // ===============================================
    case "SPEAKING":
      contentItems.push(
        {
          topic_id: topic._id,
          type: "SPEAKING_PROMPT",
          title: `Speaking Practice 1: ${topic.title}`,
          body_text: "Talk about your favorite hobby. Why do you like it?",
          media_image_url:
            (await getPixabayImage(`${topic.title} hobby`)) || topicImage,
          meta: { suggested_duration: "1 min" },
          is_published: true,
        },
        {
          topic_id: topic._id,
          type: "SPEAKING_PROMPT",
          title: `Speaking Practice 2: ${topic.title}`,
          body_text: "Describe a person who inspires you and explain why.",
          media_image_url:
            (await getPixabayImage(`${topic.title} people inspiration`)) || topicImage,
          meta: { suggested_duration: "2 min" },
          is_published: true,
        }
      );
      break;

    // ===============================================
    // GRAMMAR (exercise + ảnh Pixabay để minh họa)
    // ===============================================
    case "GRAMMAR":
      contentItems.push(
        {
          topic_id: topic._id,
          type: "GRAMMAR_EXERCISE",
          title: `Grammar Focus: ${topic.title}`,
          body_text:
            "Choose the correct form of the verb in each sentence: 1. He (go/goes) to school every day.",
          media_image_url:
            (await getPixabayImage(`${topic.title} grammar tense`)) || topicImage,
          meta: { question_count: 5, topic: "Simple Present Tense" },
          is_published: true,
        },
        {
          topic_id: topic._id,
          type: "GRAMMAR_EXERCISE",
          title: `Grammar Practice: ${topic.title}`,
          body_text:
            "Fill in the blanks with the correct article (a, an, the): 1. ___ apple a day keeps the doctor away.",
          media_image_url:
            (await getPixabayImage(`${topic.title} grammar articles`)) || topicImage,
          meta: { question_count: 5, topic: "Articles" },
          is_published: true,
        }
      );
      break;
  }
}

// =========================
// Xóa & Chèn
// =========================
await ContentItem.deleteMany({});
await ContentItem.insertMany(contentItems);

console.log(`✅ Seeded ${contentItems.length} content items successfully!`);
process.exit(0);
