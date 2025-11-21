import { Schema, model } from "mongoose";

const mockTestQuestionBankSchema = new Schema(
  {
    question_text: { type: String, required: true },
    image_url: { type: String },
    points: { type: Number, default: 10 },

    options: [
      {
        label: { type: String, required: true },
        option_text: { type: String, required: true },
        is_correct: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

export const MockTestQuestionBank = model(
  "mock_test_question_bank",
  mockTestQuestionBankSchema
);
