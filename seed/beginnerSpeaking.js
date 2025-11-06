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

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected MongoDB");

    // Create or find the "SPEAKING" Skill
    const speakingSkill = await Skill.findOne({ code: "SPEAKING" });
    if (!speakingSkill) throw new Error("⚠️ Skill SPEAKING not found!");

    // Create the "Beginner" Level
    const beginnerLevel = await Level.create({ name: "Beginner", code: "BEGINNER" });

    // Create Topic for Beginner Level
    const beginnerTopic = await Topic.create({
      title: "Introduction to Speaking",
      description: "Basic speaking exercises to practice introductions and simple questions.",
      skill_id: speakingSkill._id,
      level_id: beginnerLevel._id,
    });

    // Define images, audio, and body text for each ContentItem
    const speakingImages = [
      "https://res.cloudinary.com/dtdsqfj0i/image/upload/v1761314549/Beginner_Intro_Speaking.jpg",
      "https://res.cloudinary.com/dtdsqfj0i/image/upload/v1761314549/Beginner_Exercise_2.jpg",
      "https://res.cloudinary.com/dtdsqfj0i/image/upload/v1761314549/Beginner_Exercise_3.jpg",
    ];

    const sampleAudio = [
      "https://res.cloudinary.com/dtdsqfj0i/video/upload/v1762104151/Beginner_Intro_Speaking.mp3",
      "https://res.cloudinary.com/dtdsqfj0i/video/upload/v1762104151/Beginner_Second_Exercise.mp3",
      "https://res.cloudinary.com/dtdsqfj0i/video/upload/v1762104151/Beginner_Third_Exercise.mp3",
    ];

    const bodyTexts = [
      "Please introduce yourself and talk about your hobbies.",
      "What do you like to do in your free time? Explain in detail.",
      "Talk about your favorite place and why you love it.",
    ];

    let totalContentItems = 0;

    // Create 3 ContentItems for the Beginner Topic
    for (let i = 0; i < 3; i++) {
      const content = await ContentItem.create({
        topic_id: beginnerTopic._id,
        type: "SPEAKING_PROMPT",
        title: `Speaking Prompt: ${beginnerTopic.title} - Content ${i + 1}`,
        body_text: bodyTexts[i],  // Assign body text for each ContentItem
        media_image_url: speakingImages[i],  // Assign image for each ContentItem
        media_audio_url: sampleAudio[i],  // Assign audio for each ContentItem
        is_published: true,
        meta: { level: "BEGINNER", skill: "SPEAKING" },
        level_id: beginnerLevel._id, // Link level_id
      });

      // Create Question for each ContentItem
      const question = await Question.create({
        content_item_id: content._id,
        question_type: "OPEN_ENDED",
        question_text: `Please answer the following question for Beginner level: ${bodyTexts[i]}`,
        points: 1,
        order_in_item: i + 1,
      });

      // Add options for each question (simple example, can be more dynamic)
      await QuestionOption.create({
        question_id: question._id,
        option_text: "Option 1: Self-introduction",
        is_correct: false,
      });
      await QuestionOption.create({
        question_id: question._id,
        option_text: "Option 2: Hobbies",
        is_correct: true,  // Correct option
      });

      totalContentItems++;
    }

    console.log(`🎉 Seeded ${totalContentItems} content items for Speaking!`);
  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

run();
