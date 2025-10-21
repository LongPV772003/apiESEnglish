import mongoose from "mongoose";
import dotenv from "dotenv";
import { Topic } from "../models/Topic.js";

dotenv.config();

const flashcardTopics = [
  { title: "Food & Drinks", description: "Vocabulary about meals and beverages", type: "FLASHCARD" },
  { title: "Travel", description: "Vocabulary about journeys and destinations", type: "FLASHCARD" },
  { title: "Technology", description: "Vocabulary about tech and innovation", type: "FLASHCARD" },
  { title: "Health", description: "Vocabulary about body, fitness and medicine", type: "FLASHCARD" },
  { title: "Environment", description: "Vocabulary about nature and sustainability", type: "FLASHCARD" }
];

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
    await Topic.deleteMany({ type: "FLASHCARD" });
    await Topic.insertMany(flashcardTopics);
    console.log("🌱 Seeded 5 flashcard topics successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding topics:", err.message);
    process.exit(1);
  }
})();
