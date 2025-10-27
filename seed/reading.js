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

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected MongoDB");

    const readingSkill = await Skill.findOne({ code: "READING" });
    if (!readingSkill) throw new Error("⚠️ Skill READING chưa được seed!");

    const levels = await Level.find();
    if (!levels.length) throw new Error("⚠️ Cần seed các level trước!");

    const topics = await Topic.find({ skill_id: readingSkill._id, type: "CONTENT" });
    if (!topics.length) throw new Error("⚠️ Chưa có topic cho kỹ năng READING.");

    await ContentItem.deleteMany({ topic_id: { $in: topics.map(t => t._id) } });
    await Question.deleteMany({});
    await QuestionOption.deleteMany({});

    const CLOUD_BASE = "https://res.cloudinary.com/dtdsqfj0i/image/upload/v1761314549/";
    const readingImages = [
      `${CLOUD_BASE}reading1_elypsq.jpg`,
      `${CLOUD_BASE}reading2_dbanmb.jpg`,
      `${CLOUD_BASE}reading3_vc3nbq.jpg`,
    ];

    let total = 0;

    for (const topic of topics) {
    const level = await Level.findById(topic.level_id);
    if (!level) continue;

    for (let i = 1; i <= 5; i++) {
      console.log(`🌱 Seeding Reading content ${i}/5 for ${level.name} - ${topic.title}`);

      const body_text = getReadingBodyText(level.code, i);
      const question_data = getReadingQuestion(level.code, i);

      const content = await ContentItem.create({
        topic_id: topic._id,
        type: "READING_PASSAGE",
        title: `Reading ${i}: ${topic.title} (${level.name})`,
        body_text,
        media_image_url: readingImages[Math.floor(Math.random() * readingImages.length)],
        is_published: true,
        meta: { level: level.code, skill: "READING" },
      });

      const createdQuestion = await Question.create({
        content_item_id: content._id,
        question_type: "MCQ",
        question_text: question_data.text,
        points: 1,
        order_in_item: 1,
      });

      const shuffled = shuffle(question_data.options);
      for (let j = 0; j < shuffled.length; j++) {
        await QuestionOption.create({
          question_id: createdQuestion._id,
          label: String.fromCharCode(65 + j),
          option_text: shuffled[j].text,
          is_correct: shuffled[j].is_correct,
        });
      }

      total++;
    }
  }

    console.log(`🎉 Seeded ${total} READING content items (1 per topic)!`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}

// ================== HELPERS ===================
function getReadingBodyText(level) {
  const beginnerThemes = [
    "Lisa goes to the market with her mother every Sunday. They buy fresh fruits and vegetables.",
    "Tom likes playing football with his friends after school. He dreams of becoming a famous player.",
    "Anna has a small cat named Momo. Every morning, she feeds Momo milk and plays with it.",
    "Peter wakes up early to help his father water the garden before breakfast.",
    "Mary enjoys reading comic books before going to bed each night."
  ];

  const intermediateThemes = [
    "Technology allows people to work from home using computers and video calls, but it also creates loneliness.",
    "Many cities are planting more trees to reduce pollution and improve air quality.",
    "Public transport helps reduce traffic jams, but people still prefer private cars for convenience.",
    "Online shopping is fast and easy, but some customers worry about fake products.",
    "Social media connects people around the world, but also spreads false information quickly."
  ];

  const advancedThemes = [
    "The climate crisis is forcing nations to rethink their energy use and reduce carbon emissions.",
    "Artificial intelligence is transforming the job market, raising concerns about automation and ethics.",
    "Cultural globalization allows exchange of ideas, but may also erase local traditions.",
    "Privacy in the digital age has become a major concern for both individuals and governments.",
    "The rise of renewable energy offers hope, but economic inequality slows down global progress."
  ];

  switch (level) {
    case "BEGINNER": return randomChoice(beginnerThemes);
    case "INTERMEDIATE": return randomChoice(intermediateThemes);
    case "ADVANCED": return randomChoice(advancedThemes);
    default: return "Default reading passage.";
  }
}

function getReadingQuestion(level) {
  const beginnerQs = [
    {
      text: "What does Lisa buy at the market?",
      options: [
        { text: "Fruits and vegetables", is_correct: true },
        { text: "Toys", is_correct: false },
        { text: "Books", is_correct: false },
        { text: "Shoes", is_correct: false }
      ]
    },
    {
      text: "What animal does Anna have?",
      options: [
        { text: "A cat", is_correct: true },
        { text: "A dog", is_correct: false },
        { text: "A bird", is_correct: false },
        { text: "A fish", is_correct: false }
      ]
    },
    {
      text: "When does Peter water the garden?",
      options: [
        { text: "In the morning", is_correct: true },
        { text: "At night", is_correct: false },
        { text: "At lunchtime", is_correct: false },
        { text: "In the afternoon", is_correct: false }
      ]
    }
  ];

  const intermediateQs = [
    {
      text: "Why are cities planting more trees?",
      options: [
        { text: "To improve air quality", is_correct: true },
        { text: "To sell more land", is_correct: false },
        { text: "To build houses", is_correct: false },
        { text: "To attract tourists", is_correct: false }
      ]
    },
    {
      text: "What is one problem with online shopping?",
      options: [
        { text: "Fake products", is_correct: true },
        { text: "Fast delivery", is_correct: false },
        { text: "Too many discounts", is_correct: false },
        { text: "Friendly sellers", is_correct: false }
      ]
    },
    {
      text: "What issue is linked to social media?",
      options: [
        { text: "Spreading false information", is_correct: true },
        { text: "Better grammar", is_correct: false },
        { text: "Stronger friendships", is_correct: false },
        { text: "More exercise", is_correct: false }
      ]
    }
  ];

  const advancedQs = [
    {
      text: "What is the main idea of the passage?",
      options: [
        { text: "Climate change requires global cooperation", is_correct: true },
        { text: "Local traditions are disappearing", is_correct: false },
        { text: "AI replaces manual labor", is_correct: false },
        { text: "People use more social media", is_correct: false }
      ]
    },
    {
      text: "What problem is mentioned with artificial intelligence?",
      options: [
        { text: "Job loss and ethical concerns", is_correct: true },
        { text: "High energy costs", is_correct: false },
        { text: "Improved creativity", is_correct: false },
        { text: "Faster communication", is_correct: false }
      ]
    },
    {
      text: "Why is privacy important in the digital age?",
      options: [
        { text: "To protect personal information", is_correct: true },
        { text: "To make technology cheaper", is_correct: false },
        { text: "To improve tourism", is_correct: false },
        { text: "To increase online shopping", is_correct: false }
      ]
    }
  ];

  switch (level) {
    case "BEGINNER": return randomChoice(beginnerQs);
    case "INTERMEDIATE": return randomChoice(intermediateQs);
    case "ADVANCED": return randomChoice(advancedQs);
    default: return beginnerQs[0];
  }
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
run();
