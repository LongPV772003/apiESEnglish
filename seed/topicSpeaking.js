import mongoose from "mongoose";
import dotenv from "dotenv";
import { Skill } from "../models/Skill.js";
import { Level } from "../models/Level.js";
import { Topic } from "../models/Topic.js";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

async function seedSpeakingTopics() {
  try {
    console.log("🔌 Connecting MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 1️⃣ Lấy kỹ năng SPEAKING
    const speakingSkill = await Skill.findOne({ code: "SPEAKING" });
    if (!speakingSkill) throw new Error("⚠️ Skill SPEAKING chưa được seed!");

    // 2️⃣ Lấy các cấp độ (BEGINNER, INTERMEDIATE, ADVANCED)
    const levels = await Level.find();
    if (!levels.length) throw new Error("⚠️ Chưa seed các level!");

    // 3️⃣ Xóa các topic cũ thuộc SPEAKING
    console.log("🧹 Cleaning old topics...");
    await Topic.deleteMany({ skill_id: speakingSkill._id });

    // 4️⃣ Tạo danh sách topic mới, mỗi topic gắn đúng level
    const speakingTopics = [
      {
        title: "Speaking: Introductions",
        description: "Basic Speaking: Introduce yourself and talk about hobbies.",
        skill_id: speakingSkill._id,
        level_id: levels.find(l => l.code === "BEGINNER")?._id,
      },
      {
        title: "Speaking: Daily Activities",
        description: "Intermediate Speaking: Describe your daily activities.",
        skill_id: speakingSkill._id,
        level_id: levels.find(l => l.code === "INTERMEDIATE")?._id,
      },
      {
        title: "Speaking: Future Plans",
        description: "Advanced Speaking: Talk about your future goals and plans.",
        skill_id: speakingSkill._id,
        level_id: levels.find(l => l.code === "ADVANCED")?._id,
      },
    ];

    console.log("🌱 Seeding new topics for SPEAKING...");
    for (const topicData of speakingTopics) {
      if (!topicData.level_id) {
        console.warn(`⚠️ Skipped topic ${topicData.title}: level not found`);
        continue;
      }
      await Topic.create(topicData);
      console.log(`✅ Created Topic: ${topicData.title}`);
    }

    console.log("🎉 Seeded topics for SPEAKING successfully!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

seedSpeakingTopics();
