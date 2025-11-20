import mongoose from "mongoose";
import dotenv from "dotenv";
import { Question } from "../models/Question.js";
import { QuestionOption } from "../models/QuestionOption.js";
import { MockTest } from "../models/MockTest.js";
import { MockTestQuestion } from "../models/MockTestQuestion.js";

dotenv.config();
const MONGO_URI = process.env.MONGO_URI;

// =============================
// DATA IELTS QUESTION + OPTIONS
// =============================
const questionsData = [
  // 20 câu bạn đã có – tôi giữ nguyên
  {
    content: "What is considered one of the major causes of global warming?",
    options: [
      { label: "A", option_text: "Increasing volcanic activity", is_correct: false },
      { label: "B", option_text: "Rising levels of greenhouse gases", is_correct: true },
      { label: "C", option_text: "Changes in Earth’s magnetic field", is_correct: false },
      { label: "D", option_text: "Expansion of polar ice", is_correct: false },
    ],
  },
  {
    content: "What is a common concern regarding the rapid development of artificial intelligence?",
    options: [
      { label: "A", option_text: "Decrease in online shopping", is_correct: false },
      { label: "B", option_text: "Loss of traditional crafts", is_correct: false },
      { label: "C", option_text: "Automation replacing human jobs", is_correct: true },
      { label: "D", option_text: "Increased cost of mobile phones", is_correct: false },
    ],
  },
  {
    content: "Why do many students prefer online learning?",
    options: [
      { label: "A", option_text: "It guarantees higher grades", is_correct: false },
      { label: "B", option_text: "It allows flexible study schedules", is_correct: true },
      { label: "C", option_text: "It eliminates the need for teachers", is_correct: false },
      { label: "D", option_text: "It requires advanced technical skills", is_correct: false },
    ],
  },
  {
    content: "According to recent studies, how many hours of sleep do adults generally need?",
    options: [
      { label: "A", option_text: "3–4 hours", is_correct: false },
      { label: "B", option_text: "5–6 hours", is_correct: false },
      { label: "C", option_text: "7–9 hours", is_correct: true },
      { label: "D", option_text: "More than 10 hours", is_correct: false },
    ],
  },
  {
    content: "What is the most effective way to improve speaking skills?",
    options: [
      { label: "A", option_text: "Memorizing grammar rules", is_correct: false },
      { label: "B", option_text: "Listening to podcasts only", is_correct: false },
      { label: "C", option_text: "Practicing with native speakers", is_correct: true },
      { label: "D", option_text: "Reading textbooks silently", is_correct: false },
    ],
  },
  {
    content: "Which process describes water turning from liquid into vapor?",
    options: [
      { label: "A", option_text: "Condensation", is_correct: false },
      { label: "B", option_text: "Evaporation", is_correct: true },
      { label: "C", option_text: "Precipitation", is_correct: false },
      { label: "D", option_text: "Filtration", is_correct: false },
    ],
  },
  {
    content: "What does inflation refer to?",
    options: [
      { label: "A", option_text: "A rise in unemployment", is_correct: false },
      { label: "B", option_text: "A decrease in population", is_correct: false },
      { label: "C", option_text: "A general increase in prices", is_correct: true },
      { label: "D", option_text: "A reduction in public spending", is_correct: false },
    ],
  },
  {
    content: "Which ancient civilization built the pyramids?",
    options: [
      { label: "A", option_text: "Roman", is_correct: false },
      { label: "B", option_text: "Greek", is_correct: false },
      { label: "C", option_text: "Egyptian", is_correct: true },
      { label: "D", option_text: "Persian", is_correct: false },
    ],
  },
  {
    content: "What is the main purpose of eco-tourism?",
    options: [
      { label: "A", option_text: "To encourage mass tourism", is_correct: false },
      { label: "B", option_text: "To protect natural environments", is_correct: true },
      { label: "C", option_text: "To replace traditional hotels", is_correct: false },
      { label: "D", option_text: "To promote luxury travel", is_correct: false },
    ],
  },
  {
    content: "Why do many start-ups fail within their first year?",
    options: [
      { label: "A", option_text: "Excessive marketing", is_correct: false },
      { label: "B", option_text: "Poor financial management", is_correct: true },
      { label: "C", option_text: "Having too many employees", is_correct: false },
      { label: "D", option_text: "Low product quality only", is_correct: false },
    ],
  },

  // LISTENING QUESTIONS
  {
    content: "What time does the train to Oxford depart?",
    options: [
      { label: "A", option_text: "9:15", is_correct: false },
      { label: "B", option_text: "9:45", is_correct: true },
      { label: "C", option_text: "10:00", is_correct: false },
      { label: "D", option_text: "10:30", is_correct: false },
    ],
  },
  {
    content: "What type of room does the caller choose?",
    options: [
      { label: "A", option_text: "Single room", is_correct: false },
      { label: "B", option_text: "Double room", is_correct: false },
      { label: "C", option_text: "Twin room", is_correct: true },
      { label: "D", option_text: "Family suite", is_correct: false },
    ],
  },
  {
    content: "When will the campus tour begin?",
    options: [
      { label: "A", option_text: "Monday morning", is_correct: false },
      { label: "B", option_text: "Tuesday afternoon", is_correct: false },
      { label: "C", option_text: "Wednesday morning", is_correct: true },
      { label: "D", option_text: "Friday evening", is_correct: false },
    ],
  },
  {
    content: "What qualification is required for the position?",
    options: [
      { label: "A", option_text: "A bachelor's degree", is_correct: true },
      { label: "B", option_text: "A high school diploma", is_correct: false },
      { label: "C", option_text: "A master's degree", is_correct: false },
      { label: "D", option_text: "No formal qualification", is_correct: false },
    ],
  },
  {
    content: "What weather condition is expected tomorrow?",
    options: [
      { label: "A", option_text: "Heavy snow", is_correct: false },
      { label: "B", option_text: "Light rain", is_correct: true },
      { label: "C", option_text: "Strong winds", is_correct: false },
      { label: "D", option_text: "Clear skies", is_correct: false },
    ],
  },
  {
    content: "When is the earliest appointment available?",
    options: [
      { label: "A", option_text: "9 AM", is_correct: true },
      { label: "B", option_text: "11 AM", is_correct: false },
      { label: "C", option_text: "1 PM", is_correct: false },
      { label: "D", option_text: "3 PM", is_correct: false },
    ],
  },
  {
    content: "What is the maximum number of books students can borrow?",
    options: [
      { label: "A", option_text: "3", is_correct: false },
      { label: "B", option_text: "5", is_correct: false },
      { label: "C", option_text: "7", is_correct: true },
      { label: "D", option_text: "10", is_correct: false },
    ],
  },
  {
    content: "Which bus goes directly to the city center?",
    options: [
      { label: "A", option_text: "Bus 15", is_correct: true },
      { label: "B", option_text: "Bus 27", is_correct: false },
      { label: "C", option_text: "Bus 40", is_correct: false },
      { label: "D", option_text: "Bus 52", is_correct: false },
    ],
  },
  {
    content: "What dish does the customer finally choose?",
    options: [
      { label: "A", option_text: "Grilled chicken", is_correct: false },
      { label: "B", option_text: "Beef burger", is_correct: false },
      { label: "C", option_text: "Seafood pasta", is_correct: true },
      { label: "D", option_text: "Vegetarian salad", is_correct: false },
    ],
  },
  {
    content: "How long is the membership the customer selects?",
    options: [
      { label: "A", option_text: "1 month", is_correct: false },
      { label: "B", option_text: "3 months", is_correct: false },
      { label: "C", option_text: "6 months", is_correct: false },
      { label: "D", option_text: "12 months", is_correct: true },
    ],
  },
];

// =============================
// SEED FUNCTION
// =============================
const seed = async () => {
  await mongoose.connect(MONGO_URI);
  console.log("MongoDB Connected");

  await Question.deleteMany({});
  await QuestionOption.deleteMany({});
  await MockTest.deleteMany({});
  await MockTestQuestion.deleteMany({});
  console.log("Cleared old data");

  // CREATE QUESTIONS
  const createdQuestions = [];
  for (const q of questionsData) {
    const newQ = await Question.create({
      content: q.content,
      type: "MCQ",
    });

    for (const op of q.options) {
      await QuestionOption.create({
        question_id: newQ._id,
        label: op.label,
        option_text: op.option_text,
        is_correct: op.is_correct,
      });
    }

    createdQuestions.push(newQ);
  }

  const test1 = await MockTest.create({
    title: "Mock Test 1",
    duration_minutes: 30,
  });

  const test2 = await MockTest.create({
    title: "Mock Test 2",
    duration_minutes: 30,
  });

  for (let i = 0; i < 10; i++) {
    await MockTestQuestion.create({
      test_id: test1._id,
      question_id: createdQuestions[i]._id,
      order_in_test: i + 1,
    });
  }

  for (let i = 10; i < 20; i++) {
    await MockTestQuestion.create({
      test_id: test2._id,
      question_id: createdQuestions[i]._id,
      order_in_test: i - 9,
    });
  }

  console.log("SEED DONE!");
  mongoose.connection.close();
};

seed().catch(console.error);
