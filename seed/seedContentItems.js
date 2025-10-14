import mongoose from "mongoose";
import dotenv from "dotenv";
import { Topic } from "../models/Topic.js";
import { ContentItem } from "../models/ContentItem.js";
import { Skill } from "../models/Skill.js";

dotenv.config();
await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB");

const skills = await Skill.find();
const topics = await Topic.find();
if (!skills.length || !topics.length) {
  console.log("⚠️ Cần seed kỹ năng và topics trước khi chạy.");
  process.exit(1);
}

const contentItems = [];

for (const topic of topics) {
  // Tìm kỹ năng của topic để chọn loại content phù hợp
  const skill = skills.find((s) => s._id.toString() === topic.skill_id.toString());
  if (!skill) continue;

  switch (skill.code) {
    // ===============================================
    // LISTENING (audio)
    // ===============================================
    case "LISTENING":
      contentItems.push(
        {
          topic_id: topic._id,
          type: "LISTENING_AUDIO",
          title: `Audio 1: ${topic.title}`,
          body_text: "Listen to the conversation and answer the questions below.",
          media_audio_url: "https://cdn.openai.com/audio-sample-listening-1.mp3",
          media_image_url: "https://cdn.openai.com/english-listening.jpg",
          meta: { duration: "2:15", accent: "American" },
          is_published: true,
        },
        {
          topic_id: topic._id,
          type: "LISTENING_AUDIO",
          title: `Audio 2: ${topic.title}`,
          body_text: "Listen carefully and fill in the missing words.",
          media_audio_url: "https://cdn.openai.com/audio-sample-listening-2.mp3",
          media_image_url: "https://cdn.openai.com/audio-icon.png",
          meta: { transcript: "Hey there! How are you today?" },
          is_published: true,
        }
      );
      break;

    // ===============================================
    // READING (text)
    // ===============================================
    case "READING":
      contentItems.push(
        {
          topic_id: topic._id,
          type: "READING_PASSAGE",
          title: `Reading Passage 1: ${topic.title}`,
          body_text:
            "People around the world are becoming more aware of environmental problems. Many countries have started to recycle waste, reduce pollution, and plant trees.",
          media_image_url: "https://cdn.openai.com/reading-passage-1.jpg",
          meta: { word_count: 120, difficulty: "medium" },
          is_published: true,
        },
        {
          topic_id: topic._id,
          type: "READING_PASSAGE",
          title: `Reading Passage 2: ${topic.title}`,
          body_text:
            "Healthy eating means choosing foods that provide nutrients your body needs, such as vitamins, minerals, and fiber.",
          media_image_url: "https://cdn.openai.com/reading-passage-2.jpg",
          meta: { word_count: 100, difficulty: "easy" },
          is_published: true,
        }
      );
      break;

    // ===============================================
    // WRITING (prompt)
    // ===============================================
    case "WRITING":
      contentItems.push(
        {
          topic_id: topic._id,
          type: "WRITING_PROMPT",
          title: `Writing Task 1: ${topic.title}`,
          body_text:
            "Write about your daily routine. What time do you wake up, go to school, and go to bed? Use at least 5 sentences.",
          media_image_url: "https://cdn.openai.com/writing-prompt-1.png",
          meta: { word_limit: 120, difficulty: "beginner" },
          is_published: true,
        },
        {
          topic_id: topic._id,
          type: "WRITING_PROMPT",
          title: `Writing Task 2: ${topic.title}`,
          body_text:
            "Describe your favorite place to visit. Explain why it’s special and what people can do there.",
          media_image_url: "https://cdn.openai.com/writing-prompt-2.png",
          meta: { word_limit: 150, difficulty: "intermediate" },
          is_published: true,
        }
      );
      break;

    // ===============================================
    // SPEAKING (prompt + optional image)
    // ===============================================
    case "SPEAKING":
      contentItems.push(
        {
          topic_id: topic._id,
          type: "SPEAKING_PROMPT",
          title: `Speaking Practice 1: ${topic.title}`,
          body_text: "Talk about your favorite hobby. Why do you like it?",
          media_image_url: "https://cdn.openai.com/speaking-hobby.jpg",
          meta: { suggested_duration: "1 min" },
          is_published: true,
        },
        {
          topic_id: topic._id,
          type: "SPEAKING_PROMPT",
          title: `Speaking Practice 2: ${topic.title}`,
          body_text: "Describe a person who inspires you and explain why.",
          media_image_url: "https://cdn.openai.com/speaking-person.jpg",
          meta: { suggested_duration: "2 min" },
          is_published: true,
        }
      );
      break;

    // ===============================================
    // GRAMMAR (exercise)
    // ===============================================
    case "GRAMMAR":
      contentItems.push(
        {
          topic_id: topic._id,
          type: "GRAMMAR_EXERCISE",
          title: `Grammar Focus: ${topic.title}`,
          body_text:
            "Choose the correct form of the verb in each sentence: 1. He (go/goes) to school every day.",
          meta: { question_count: 5, topic: "Simple Present Tense" },
          is_published: true,
        },
        {
          topic_id: topic._id,
          type: "GRAMMAR_EXERCISE",
          title: `Grammar Practice: ${topic.title}`,
          body_text:
            "Fill in the blanks with the correct article (a, an, the): 1. ___ apple a day keeps the doctor away.",
          meta: { question_count: 5, topic: "Articles" },
          is_published: true,
        }
      );
      break;
  }
}

// clear + insert
await ContentItem.deleteMany({});
await ContentItem.insertMany(contentItems);

console.log(`✅ Seeded ${contentItems.length} content items successfully!`);
process.exit(0);
