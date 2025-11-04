// seed/seedListeningTopics.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Skill } from "../models/Skill.js";
import { Level } from "../models/Level.js";
import { Topic } from "../models/Topic.js";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected to MongoDB");

  const listeningSkill = await Skill.findOne({ code: "LISTENING" });
  if (!listeningSkill) throw new Error("⚠️ Skill LISTENING chưa được seed!");
  const levels = await Level.find();
  if (!levels.length) throw new Error("⚠️ Cần seed level trước!");

  // Xóa cũ
  await Topic.deleteMany({ skill_id: listeningSkill._id });

  const topicData = [];

  for (const level of levels) {
    if (["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(level.code)) {
      for (let i = 1; i <= 2; i++) {
        topicData.push({
          skill_id: listeningSkill._id,
          level_id: level._id,
          title: `Listening Topic ${i} (${level.name})`,
          description: `Audio comprehension practice ${i} for ${level.name}`,
          type: "CONTENT",
        });
      }
    }
  }

  await Topic.insertMany(topicData);
  console.log(`🎧 Seeded ${topicData.length} Listening topics.`);
  await mongoose.disconnect();
  console.log("🔌 Disconnected");
}

run();
