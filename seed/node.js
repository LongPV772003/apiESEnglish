// seed/node.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import { ContentItem } from "../models/ContentItem.js";
import { Question } from "../models/Question.js";
import { QuestionOption } from "../models/QuestionOption.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  try {
    console.log("🔌 Kết nối MongoDB...");
    await mongoose
      .connect(process.env.MONGO_URI)
      .then(() => console.log("✅ MongoDB connected"))
      .catch((err) => console.error("❌ MongoDB error:", err));
    console.log("✅ Đã kết nối MongoDB");

    console.log("🧹 Xoá dữ liệu cũ...");
    await ContentItem.deleteMany({});
    await Question.deleteMany({});
    await QuestionOption.deleteMany({});
    console.log("✅ Đã xoá toàn bộ content_items, questions, question_options");

    // (phần seed dữ liệu mới của bạn ở đây)
    console.log("🌱 Đang seed dữ liệu mới...");
    // await ContentItem.insertMany([...]);

    console.log("🎉 Seed xong!");
  } catch (err) {
    console.error("❌ Lỗi khi seed dữ liệu:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Đã ngắt kết nối MongoDB");
  }
}

run();
