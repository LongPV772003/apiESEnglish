// seed/seedContentItemsFull.js
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

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// 🌱 SAMPLE MEDIA (Ảnh và âm thanh hoạt động thực)
const SAMPLE_AUDIOS = {
  BEGINNER: [
    "https://cdn.pixabay.com/download/audio/2022/03/15/audio_5b1ef5.mp3?filename=simple-english-words.mp3",
    "https://cdn.pixabay.com/download/audio/2021/11/30/audio_d2b9e5.mp3?filename=short-lesson.mp3",
  ],
  INTERMEDIATE: [
    "https://cdn.pixabay.com/download/audio/2022/01/24/audio_f4d3c9.mp3?filename=english-dialogue.mp3",
  ],
  ADVANCED: [
    "https://cdn.pixabay.com/download/audio/2021/09/06/audio_8a2ef1.mp3?filename=advanced-listening.mp3",
  ],
};

const SAMPLE_IMAGES = {
  BEGINNER: [
    "https://cdn.pixabay.com/photo/2016/11/21/15/42/english-1840468_640.jpg",
  ],
  INTERMEDIATE: [
    "https://cdn.pixabay.com/photo/2017/02/01/22/02/school-2036266_640.jpg",
  ],
  ADVANCED: [
    "https://cdn.pixabay.com/photo/2016/03/26/13/09/books-1281581_640.jpg",
  ],
};

// ================ MAIN FUNCTION ================
async function run() {
  try {
    console.log("🔌 Connecting MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected");

    console.log("🧹 Cleaning old data...");
    await Topic.deleteMany({});
    await ContentItem.deleteMany({});
    await Question.deleteMany({});
    await QuestionOption.deleteMany({});
    console.log("✅ Old content cleared");

    const skills = await Skill.find();
    const levels = await Level.find();

    for (const skill of skills) {
      for (const level of levels) {
        console.log(`🌱 ${skill.name} - ${level.name}`);
        for (let t = 1; t <= 3; t++) {
          const topic = await Topic.create({
            skill_id: skill._id,
            level_id: level._id,
            title: `${skill.name} Topic ${t} (${level.name})`,
            description: `Chủ đề ${t} cho ${skill.name} - ${level.name}`,
          });

          for (let c = 1; c <= 3; c++) {
            const content = await ContentItem.create({
              topic_id: topic._id,
              type: getType(skill.code),
              title: `${skill.name} Lesson ${c} (${level.name})`,
              body_text: getBody(skill.code, level.code),
              media_audio_url: getAudio(skill.code, level.code),
              media_image_url: getImage(skill.code, level.code),
              is_published: true,
              meta: { level: level.code, skill: skill.code },
            });

            const questionCount = 3 + Math.floor(Math.random() * 3);
            for (let q = 1; q <= questionCount; q++) {
              const qType = getQuestionType(skill.code, level.code);
              const question = await Question.create({
                content_item_id: content._id,
                question_type: qType,
                question_text: makeQuestion(skill.code, level.code, q),
                points: 1,
                order_in_item: q,
              });

              if (qType === "MCQ") {
                const opts = makeOptions(skill.code, level.code);
                for (let i = 0; i < opts.length; i++) {
                  await QuestionOption.create({
                    question_id: question._id,
                    label: String.fromCharCode(65 + i),
                    option_text: opts[i],
                    is_correct: i === 0,
                  });
                }
              }
            }
          }
        }
      }
    }

    console.log("🎉 Seed done — full content with image & audio!");
  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}

// ================== HELPERS ===================
function getType(skill) {
  switch (skill) {
    case "LISTENING":
      return "LISTENING_AUDIO";
    case "READING":
      return "READING_PASSAGE";
    case "WRITING":
      return "WRITING_PROMPT";
    case "SPEAKING":
      return "SPEAKING_PROMPT";
    default:
      return "READING_PASSAGE";
  }
}

function getAudio(skill, level) {
  if (skill === "LISTENING" || skill === "SPEAKING") {
    return randomChoice(SAMPLE_AUDIOS[level] || []);
  }
  return null;
}

function getImage(skill, level) {
  if (skill === "LISTENING" || skill === "READING") {
    return randomChoice(SAMPLE_IMAGES[level] || []);
  }
  return null;
}

function getBody(skill, level) {
  if (skill === "READING") {
    return `(${level}) Reading passage: Technology helps us connect with others around the world.`;
  }
  if (skill === "WRITING") {
    return `(${level}) Write a short paragraph about your favorite hobby.`;
  }
  if (skill === "SPEAKING") {
    return `(${level}) Describe your day using 3–5 sentences.`;
  }
  return `(${level}) Listen carefully and answer the following questions.`;
}

function getQuestionType(skill, level) {
  if (skill === "LISTENING") return "MCQ";
  if (skill === "READING") return level === "ADVANCED" ? "OPEN_ENDED" : "MCQ";
  if (skill === "WRITING") return "OPEN_ENDED";
  if (skill === "SPEAKING") return "OPEN_ENDED";
  return "MCQ";
}

function makeQuestion(skill, level, i) {
  switch (skill) {
    case "LISTENING":
      return `(${level}) What word did you hear in audio ${i}?`;
    case "READING":
      return `(${level}) What is the main idea in paragraph ${i}?`;
    case "WRITING":
      return `(${level}) Write sentence ${i} about today's topic.`;
    case "SPEAKING":
      return `(${level}) Speak for 30 seconds about prompt ${i}.`;
    default:
      return "Generic question.";
  }
}

function makeOptions(skill, level) {
  if (skill === "LISTENING") return ["Sleep", "Eat", "Read", "Walk"];
  if (skill === "READING") return ["Main idea", "Example", "Detail", "Summary"];
  return ["Option A", "Option B", "Option C", "Option D"];
}

await run();
