import mongoose from "mongoose";
import dotenv from "dotenv";
import { Skill } from "../models/Skill.js";
import { Topic } from "../models/Topic.js";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

async function seedSpeakingTopics() {
  try {
    console.log("🔌 Connecting MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // Tìm kỹ năng SPEAKING
    const speakingSkill = await Skill.findOne({ code: "SPEAKING" });
    if (!speakingSkill) throw new Error("⚠️ Skill SPEAKING chưa được seed!");

    // Tạo các topic cho kỹ năng SPEAKING, mỗi topic đều liên quan đến câu hỏi
    const speakingTopics = [
      {
        title: "Speaking: Introductions (Beginner)",
        description: "Basic Speaking: Introduce yourself and talk about hobbies.",
        skill_id: speakingSkill._id,
      },
      {
        title: "Speaking: Daily Activities (Intermediate)",
        description: "Intermediate Speaking: Describe your daily activities.",
        skill_id: speakingSkill._id,
      },
      {
        title: "Speaking: Future Plans (Advanced)",
        description: "Advanced Speaking: Talk about your future goals and plans.",
        skill_id: speakingSkill._id,
      },
    ];

    console.log("🧹 Cleaning old topics...");
    await Topic.deleteMany({ skill_id: speakingSkill._id });

    console.log("🌱 Seeding new topics for SPEAKING...");
    for (const topicData of speakingTopics) {
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

// Call the function to run the seed process
seedSpeakingTopics();
