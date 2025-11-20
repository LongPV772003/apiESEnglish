import { Schema, model, Types } from "mongoose";

const s = new Schema({
  user_id: { type: Types.ObjectId, ref: "users", required: true },
  test_id: { type: Types.ObjectId, ref: "mock_tests", required: true },
  skill_id: { type: Types.ObjectId, ref: "skills" },       // để update progress
  level_id: { type: Types.ObjectId, ref: "levels" },

  score: { type: Number, default: 0 },
  correct_count: { type: Number, default: 0 },
  wrong_count: { type: Number, default: 0 },

  status: {
    type: String,
    enum: ["IN_PROGRESS", "SUBMITTED"],
    default: "IN_PROGRESS"
  },

  submitted_at: Date,
}, { timestamps: true });

export const MockTestAttempt = model("mock_test_attempts", s);
