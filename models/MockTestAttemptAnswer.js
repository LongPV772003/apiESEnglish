import { Schema, model, Types } from "mongoose";

const s = new Schema(
  {
    attempt_id: {
      type: Types.ObjectId,
      ref: "mock_test_attempts",
      required: true
    },

    // ✔ lưu câu hỏi của ngân hàng
    bank_question_id: {
      type: Types.ObjectId,
      ref: "mock_test_question_bank",
      required: true
    },

    chosen_option_label: { type: String },
    is_correct: { type: Boolean, default: false },
    score: { type: Number, default: 0 }
  },
  { timestamps: true }
);

s.index({ attempt_id: 1, bank_question_id: 1 }, { unique: true });

export const MockTestAttemptAnswer = model(
  "mock_test_attempt_answers",
  s
);
