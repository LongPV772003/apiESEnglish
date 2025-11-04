import mongoose from "mongoose";
import dotenv from "dotenv";
import { Skill } from "../models/Skill.js";
import { Level } from "../models/Level.js";
import { Topic } from "../models/Topic.js";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected MongoDB");

    const writingSkill = await Skill.findOne({ code: "WRITING" });
    if (!writingSkill) throw new Error("⚠️ Skill WRITING chưa được seed!");

    const levels = await Level.find();
    if (!levels.length) throw new Error("⚠️ Cần seed các level trước!");

    // Xóa các topic cũ của WRITING
    await Topic.deleteMany({ skill_id: writingSkill._id });
    console.log("🧹 Cleared old WRITING topics");

    const topicTemplates = {
      BEGINNER: [
        {
          title: "Fill in the blanks with correct verbs",
          description: "Practice using the correct verb form in sentences.",
        },
        {
          title: "Choose the correct form of the word",
          description: "Improve your grammar and sentence accuracy.",
        },
      ],
      INTERMEDIATE: [
        {
          title: "Describe your favorite sport",
          description: "Write 3–5 sentences describing what you like about it.",
        },
        {
          title: "Describe a picture of people working",
          description: "Use simple present tense to describe what you see.",
        },
      ],
      ADVANCED: [
        {
          title: "Essay: Free time activities",
          description: "Write a 200–300 word essay about how you spend your free time.",
        },
        {
          title: "Essay: Studying abroad vs studying locally",
          description: "Write about the advantages and disadvantages of studying abroad.",
        },
      ],
    };

    let total = 0;

    for (const level of levels) {
      const topics = topicTemplates[level.code] || [];
      for (const t of topics) {
        await Topic.create({
          skill_id: writingSkill._id,
          level_id: level._id,
          title: `Writing ${level.name}: ${t.title}`,
          description: t.description,
          type: "CONTENT",
        });
        total++;
      }
    }

    console.log(`🎉 Seeded ${total} WRITING topics successfully!`);
    console.log("👉 Next: Run `node seedWritingContent.js` to add writing lessons.");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected");
  }
}

run();
