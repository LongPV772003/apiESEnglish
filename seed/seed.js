import mongoose from "mongoose";
import dotenv from "dotenv";
import { Skill } from "../models/Skill.js";
import { Level } from "../models/Level.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB");

// Seed kỹ năng
await Skill.insertMany([
  { code: "LISTENING", name: "Listening" },
  { code: "READING", name: "Reading" },
  { code: "WRITING", name: "Writing" },
  { code: "SPEAKING", name: "Speaking" },
]);
console.log("✅ Seeded Skills");

// Seed cấp độ
await Level.insertMany([
  { code: "BEGINNER", name: "Beginner", sort_order: 1 },
  { code: "INTERMEDIATE", name: "Intermediate", sort_order: 2 },
  { code: "ADVANCED", name: "Advanced", sort_order: 3 },
]);
console.log("✅ Seeded Levels");

process.exit(0);