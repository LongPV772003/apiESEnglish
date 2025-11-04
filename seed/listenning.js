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

// ================= CONFIG =================
const CLOUD_AUDIO_BASE = "https://res.cloudinary.com/dtdsqfj0i/video/upload/v1761319001/";
const CLOUD_IMAGE = "https://res.cloudinary.com/dtdsqfj0i/image/upload/v1761750138/Essay-on-Football_huwk1d.jpg";

const audioFiles = {
  BEGINNER: [
    `${CLOUD_AUDIO_BASE}apple--_us_1_bpgkq1.mp3`,
    `${CLOUD_AUDIO_BASE}chair--_us_1_isgssv.mp3`,
  ],
  INTERMEDIATE: [
    `${CLOUD_AUDIO_BASE}Rachel_fWHz7l8NMdFBOIaPkD6c_iwjcsl.mp3`,
    `${CLOUD_AUDIO_BASE}Rachel_w0fMGxapPrEbHdh2yp32_zndmvn.mp3`,
  ],
  ADVANCED: [
    `${CLOUD_AUDIO_BASE}ElevenLabs_Emma_Hi__Tom__How_was_your_weekend_Tom_It_was_great__I_we_1_ou1c2h.mp3`,
    `${CLOUD_AUDIO_BASE}1.2_ugemcj.mp3`,
  ],
};

// =============== HELPERS ==================
function getAudioFile(levelCode, index) {
  const list = audioFiles[levelCode] || [];
  if (list.length === 0) return null;
  return list[index % list.length];
}

function getListeningBodyText(level) {
  switch (level) {
    case "BEGINNER":
      return "Listen to the word carefully and choose the correct answer.";
    case "INTERMEDIATE":
      return "Listen to the short description and answer the question about the situation.";
    case "ADVANCED":
      return "Listen to the conversation between two people and choose the correct answer.";
    default:
      return "Listen and answer the question.";
  }
}

function getListeningQuestion(level, index) {
  const beginnerQuestions = [
    {
      text: "What word did you hear?",
      options: [
        { text: "Apple", is_correct: true },
        { text: "Banana", is_correct: false },
        { text: "Orange", is_correct: false },
        { text: "Mango", is_correct: false },
      ],
    },
    {
      text: "What word did you hear?",
      options: [
        { text: "Chair", is_correct: true },
        { text: "Table", is_correct: false },
        { text: "Sofa", is_correct: false },
        { text: "Door", is_correct: false },
      ],
    },
  ];

  const intermediateQuestions = [
    {
      text: "What is the boy doing in the park?",
      options: [
        { text: "Playing football", is_correct: true },
        { text: "Reading a book", is_correct: false },
        { text: "Sleeping", is_correct: false },
        { text: "Swimming", is_correct: false },
      ],
    },
    {
      text: "Where is the woman?",
      options: [
        { text: "In the kitchen", is_correct: true },
        { text: "At school", is_correct: false },
        { text: "In the office", is_correct: false },
        { text: "At the market", is_correct: false },
      ],
    },
  ];

  const advancedQuestions = [
    {
      text: "What did Tom do last weekend?",
      options: [
        { text: "He went hiking", is_correct: true },
        { text: "He stayed home", is_correct: false },
        { text: "He studied all day", is_correct: false },
        { text: "He went shopping", is_correct: false },
      ],
    },
    {
      text: "What are the teacher and student talking about?",
      options: [
        { text: "Recycling", is_correct: true },
        { text: "Painting", is_correct: false },
        { text: "Cooking", is_correct: false },
        { text: "Reading", is_correct: false },
      ],
    },
  ];

  switch (level) {
    case "BEGINNER":
      return beginnerQuestions[index % beginnerQuestions.length];
    case "INTERMEDIATE":
      return intermediateQuestions[index % intermediateQuestions.length];
    case "ADVANCED":
      return advancedQuestions[index % advancedQuestions.length];
    default:
      return beginnerQuestions[0];
  }
}

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// =============== MAIN SEED ==================
async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected MongoDB");

    const listeningSkill = await Skill.findOne({ code: "LISTENING" });
    if (!listeningSkill) throw new Error("⚠️ Skill LISTENING chưa được seed!");

    const levels = await Level.find();
    if (!levels.length) throw new Error("⚠️ Cần seed các level trước!");

    // 🔥 Xóa dữ liệu cũ chỉ trong skill LISTENING
    const oldTopics = await Topic.find({ skill_id: listeningSkill._id });
    const oldTopicIds = oldTopics.map(t => t._id);

    const oldContents = await ContentItem.find({ topic_id: { $in: oldTopicIds } });
    const oldContentIds = oldContents.map(c => c._id);

    const oldQuestions = await Question.find({ content_item_id: { $in: oldContentIds } });
    const oldQuestionIds = oldQuestions.map(q => q._id);

    await QuestionOption.deleteMany({ question_id: { $in: oldQuestionIds } });
    await Question.deleteMany({ _id: { $in: oldQuestionIds } });
    await ContentItem.deleteMany({ _id: { $in: oldContentIds } });
    await Topic.deleteMany({ _id: { $in: oldTopicIds } });

    console.log(`🧹 Cleared old Listening data: ${oldTopics.length} topics, ${oldContents.length} contents, ${oldQuestions.length} questions.`);

    // Tạo mới dữ liệu LISTENING
    let topicCount = 0, contentCount = 0;

    for (const level of levels) {
      for (let t = 1; t <= 2; t++) {
        const topic = await Topic.create({
          skill_id: listeningSkill._id,
          level_id: level._id,
          title: `Listening Topic ${t} (${level.name})`,
          description: `Listening practice for ${level.name} level - Topic ${t}`,
          type: "CONTENT",
        });
        topicCount++;

        // Mỗi topic có 2 content item
        for (let i = 0; i < 2; i++) {
          const audio_url = getAudioFile(level.code, i);
          const body_text = getListeningBodyText(level.code);
          const qData = getListeningQuestion(level.code, i);

          const content = await ContentItem.create({
            topic_id: topic._id,
            type: "LISTENING_AUDIO",
            title: `${topic.title} - Audio ${i + 1}`,
            body_text,
            media_audio_url: audio_url,
            media_image_url: CLOUD_IMAGE,
            is_published: true,
            meta: { level: level.code, skill: "LISTENING" },
          });
          contentCount++;

          const question = await Question.create({
            content_item_id: content._id,
            question_type: "MCQ",
            question_text: qData.text,
            points: 1,
            order_in_item: 1,
          });

          const shuffled = shuffle(qData.options);
          for (let j = 0; j < shuffled.length; j++) {
            await QuestionOption.create({
              question_id: question._id,
              label: String.fromCharCode(65 + j),
              option_text: shuffled[j].text,
              is_correct: shuffled[j].is_correct,
            });
          }
        }
      }
    }

    console.log(`🎉 Seeded ${topicCount} Listening topics and ${contentCount} content items successfully!`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}

run();
