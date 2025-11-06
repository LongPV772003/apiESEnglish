import mongoose from "mongoose";

const resultSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  user_name: { type: String }, // ⚡ thêm dòng này để lưu full_name hoặc username
  skill: { type: String, enum: ["WRITING", "SPEAKING"], required: true },
  level: { type: String, enum: ["BEGINNER", "INTERMEDIATE", "ADVANCED"], required: true },
  score: { type: Number, required: true },
  band_score: { type: Number, min: 0, max: 9 },
  feedback: { type: String, required: true },
  topic_id: { type: mongoose.Schema.Types.ObjectId, ref: "topics", required: true },
  created_at: { type: Date, default: Date.now },
});

export const Results = mongoose.model("Results", resultSchema);
