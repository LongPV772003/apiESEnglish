import mongoose from "mongoose";
import dotenv from "dotenv";
import { MockTestQuestionBank } from "../models/mockTestQuestionBank.js";
import { MockTest } from "../models/MockTest.js";
import { MockTestQuestion } from "../models/MockTestQuestion.js";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

// =========================
// 20 CÂU GỐC
// =========================
const questions = [
  // ========= READING (10 câu) =========
  {
    question_text: "What is considered one of the major causes of global warming?",
    options: [
      { label: "A", option_text: "Increasing volcanic activity", is_correct: false },
      { label: "B", option_text: "Rising levels of greenhouse gases", is_correct: true },
      { label: "C", option_text: "Changes in Earth's magnetic field", is_correct: false },
      { label: "D", option_text: "Expansion of polar ice", is_correct: false }
    ]
  },
  {
    question_text: "What is a common concern regarding the rapid development of artificial intelligence?",
    options: [
      { label: "A", option_text: "Decrease in online shopping", is_correct: false },
      { label: "B", option_text: "Loss of traditional crafts", is_correct: false },
      { label: "C", option_text: "Automation replacing human jobs", is_correct: true },
      { label: "D", option_text: "Increased cost of mobile phones", is_correct: false }
    ]
  },
  {
    question_text: "Why do many students prefer online learning?",
    options: [
      { label: "A", option_text: "It guarantees higher grades", is_correct: false },
      { label: "B", option_text: "It allows flexible study schedules", is_correct: true },
      { label: "C", option_text: "It eliminates the need for teachers", is_correct: false },
      { label: "D", option_text: "It requires advanced technical skills", is_correct: false }
    ]
  },

  {
    question_text: "According to recent studies, how many hours of sleep do adults need?",
    options: [
      { label: "A", option_text: "3–4 hours", is_correct: false },
      { label: "B", option_text: "5–6 hours", is_correct: false },
      { label: "C", option_text: "7–9 hours", is_correct: true },
      { label: "D", option_text: "More than 10 hours", is_correct: false }
    ]
  },

  {
    question_text: "What is the most effective way to improve speaking skills?",
    options: [
      { label: "A", option_text: "Memorizing grammar rules", is_correct: false },
      { label: "B", option_text: "Listening to podcasts only", is_correct: false },
      { label: "C", option_text: "Practicing with native speakers", is_correct: true },
      { label: "D", option_text: "Reading textbooks silently", is_correct: false }
    ]
  },

  {
    question_text: "Which process describes water turning into vapor?",
    options: [
      { label: "A", option_text: "Condensation", is_correct: false },
      { label: "B", option_text: "Evaporation", is_correct: true },
      { label: "C", option_text: "Precipitation", is_correct: false },
      { label: "D", option_text: "Filtration", is_correct: false }
    ]
  },

  {
    question_text: "What does inflation refer to?",
    options: [
      { label: "A", option_text: "A rise in unemployment", is_correct: false },
      { label: "B", option_text: "A decrease in population", is_correct: false },
      { label: "C", option_text: "A general increase in prices", is_correct: true },
      { label: "D", option_text: "A reduction in public spending", is_correct: false }
    ]
  },

  {
    question_text: "Which ancient civilization built the pyramids?",
    options: [
      { label: "A", option_text: "Roman", is_correct: false },
      { label: "B", option_text: "Greek", is_correct: false },
      { label: "C", option_text: "Egyptian", is_correct: true },
      { label: "D", option_text: "Persian", is_correct: false }
    ]
  },

  {
    question_text: "What is the purpose of eco-tourism?",
    options: [
      { label: "A", option_text: "To encourage mass tourism", is_correct: false },
      { label: "B", option_text: "To protect natural environments", is_correct: true },
      { label: "C", option_text: "To replace hotels", is_correct: false },
      { label: "D", option_text: "To promote luxury travel", is_correct: false }
    ]
  },

  {
    question_text: "Why do many start-ups fail?",
    options: [
      { label: "A", option_text: "Excessive marketing", is_correct: false },
      { label: "B", option_text: "Poor financial management", is_correct: true },
      { label: "C", option_text: "Too many employees", is_correct: false },
      { label: "D", option_text: "Low product quality only", is_correct: false }
    ]
  },

  // ========= 10 câu LISTENING =========

  {
    question_text: "What time does the train to Oxford depart?",
    options: [
      { label: "A", option_text: "9:15", is_correct: false },
      { label: "B", option_text: "9:45", is_correct: true },
      { label: "C", option_text: "10:00", is_correct: false },
      { label: "D", option_text: "10:30", is_correct: false }
    ]
  },

  {
    question_text: "What type of room does the caller choose?",
    options: [
      { label: "A", option_text: "Single room", is_correct: false },
      { label: "B", option_text: "Double room", is_correct: false },
      { label: "C", option_text: "Twin room", is_correct: true },
      { label: "D", option_text: "Family suite", is_correct: false }
    ]
  },

  {
    question_text: "When will the campus tour begin?",
    options: [
      { label: "A", option_text: "Monday morning", is_correct: false },
      { label: "B", option_text: "Tuesday afternoon", is_correct: false },
      { label: "C", option_text: "Wednesday morning", is_correct: true },
      { label: "D", option_text: "Friday evening", is_correct: false }
    ]
  },

  {
    question_text: "What qualification is required for the position?",
    options: [
      { label: "A", option_text: "Bachelor's degree", is_correct: true },
      { label: "B", option_text: "High school diploma", is_correct: false },
      { label: "C", option_text: "Master's degree", is_correct: false },
      { label: "D", option_text: "No qualification", is_correct: false }
    ]
  },

  {
    question_text: "What weather is expected tomorrow?",
    options: [
      { label: "A", option_text: "Heavy snow", is_correct: false },
      { label: "B", option_text: "Light rain", is_correct: true },
      { label: "C", option_text: "Strong winds", is_correct: false },
      { label: "D", option_text: "Clear skies", is_correct: false }
    ]
  },

  {
    question_text: "When is the earliest appointment available?",
    options: [
      { label: "A", option_text: "9 AM", is_correct: true },
      { label: "B", option_text: "11 AM", is_correct: false },
      { label: "C", option_text: "1 PM", is_correct: false },
      { label: "D", option_text: "3 PM", is_correct: false }
    ]
  },

  {
    question_text: "How many books can students borrow?",
    options: [
      { label: "A", option_text: "3", is_correct: false },
      { label: "B", option_text: "5", is_correct: false },
      { label: "C", option_text: "7", is_correct: true },
      { label: "D", option_text: "10", is_correct: false }
    ]
  },

  {
    question_text: "Which bus goes to the city center?",
    options: [
      { label: "A", option_text: "Bus 15", is_correct: true },
      { label: "B", option_text: "Bus 27", is_correct: false },
      { label: "C", option_text: "Bus 40", is_correct: false },
      { label: "D", option_text: "Bus 52", is_correct: false }
    ]
  },

  {
    question_text: "What dish does the customer choose?",
    options: [
      { label: "A", option_text: "Grilled chicken", is_correct: false },
      { label: "B", option_text: "Beef burger", is_correct: false },
      { label: "C", option_text: "Seafood pasta", is_correct: true },
      { label: "D", option_text: "Vegetarian salad", is_correct: false }
    ]
  },

  {
    question_text: "How long is the membership selected?",
    options: [
      { label: "A", option_text: "1 month", is_correct: false },
      { label: "B", option_text: "3 months", is_correct: false },
      { label: "C", option_text: "6 months", is_correct: false },
      { label: "D", option_text: "12 months", is_correct: true }
    ]
  }
];


// ===========================
//   SEED FUNCTION
// ===========================
async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("DB connected.");

    await MockTestQuestionBank.deleteMany({});
    await MockTest.deleteMany({});
    await MockTestQuestion.deleteMany({});
    console.log("Old data cleared.");

    const bank = await MockTestQuestionBank.insertMany(questions);
    console.log("Inserted", bank.length, "Bank Questions");

    // ===========================
    //   TÁCH THÀNH HAI ĐỀ
    // ===========================
    const test1Questions = bank.slice(0, 10);
    const test2Questions = bank.slice(10, 20);

    // ===== Test 01 =====
    const test1 = await MockTest.create({
      title: "Mock Test 01 — 10 Questions",
      duration_minutes: 30,
      skill_id: null
    });

    await MockTestQuestion.insertMany(
      test1Questions.map((q, i) => ({
        test_id: test1._id,
        bank_question_id: q._id,
        order_in_test: i + 1
      }))
    );

    // ===== Test 02 =====
    const test2 = await MockTest.create({
      title: "Mock Test 02 — 10 Questions",
      duration_minutes: 30,
      skill_id: null
    });

    await MockTestQuestion.insertMany(
      test2Questions.map((q, i) => ({
        test_id: test2._id,
        bank_question_id: q._id,
        order_in_test: i + 1
      }))
    );

    console.log("Seed completed successfully!");
    process.exit();
  } catch (err) {
    console.error("Seed Error:", err);
    process.exit(1);
  }
}

seed();
