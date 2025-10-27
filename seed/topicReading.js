import mongoose from "mongoose";
import dotenv from "dotenv";
import { Skill } from "../models/Skill.js";
import { Level } from "../models/Level.js";
import { Topic } from "../models/Topic.js";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

async function seedReadingTopics() {
  await mongoose.connect(MONGO_URI);
  console.log("✅ Connected");

  const skill = await Skill.findOne({ code: "READING" });
  const levels = await Level.find();
  if (!skill || !levels.length) throw new Error("Missing skill/level data");

  await Topic.deleteMany({ skill_id: skill._id });

  const topics = [
    // BEGINNER
    { title: "Daily Routine", description: "Simple daily activities", level_code: "BEGINNER" },
    { title: "Family and Friends", description: "Basic social relationships", level_code: "BEGINNER" },
    { title: "School Life", description: "Basic reading about school", level_code: "BEGINNER" },

    // INTERMEDIATE
    { title: "Modern Life and Work", description: "How technology changes work", level_code: "INTERMEDIATE" },
    { title: "Travel and Culture", description: "Exploring new places", level_code: "INTERMEDIATE" },
    { title: "Health and Lifestyle", description: "Reading about well-being", level_code: "INTERMEDIATE" },

    // ADVANCED
    { title: "Climate Change", description: "Environmental topics", level_code: "ADVANCED" },
    { title: "Digital Privacy", description: "Technology and ethics", level_code: "ADVANCED" },
    { title: "Global Communication", description: "How people connect worldwide", level_code: "ADVANCED" },
  ];

  for (const t of topics) {
    const level = levels.find(l => l.code === t.level_code);
    if (!level) continue;
    await Topic.create({
      skill_id: skill._id,
      level_id: level._id,
      title: t.title,
      description: t.description,
      type: "CONTENT",
    });
    console.log(`✅ Created topic ${t.title} (${t.level_code})`);
  }

  console.log("🎉 Seeded Reading topics successfully");
  await mongoose.disconnect();
}

seedReadingTopics();
