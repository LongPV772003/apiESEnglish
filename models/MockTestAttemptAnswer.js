import { Schema, model, Types } from "mongoose";

const s = new Schema({
  attempt_id: { type: Types.ObjectId, ref: "mock_test_attempts", required: true },
  question_id: { type: Types.ObjectId, ref: "questions", required: true },
  chosen_option_id: { type: Types.ObjectId, ref: "question_options" },

  is_correct: Boolean,
  score: Number
}, { timestamps: true });

export const MockTestAttemptAnswer = model("mock_test_attempt_answers", s);
