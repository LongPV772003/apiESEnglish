import { Schema, model, Types } from "mongoose";

const mockTestQuestion = new Schema(
  {
    test_id: {
      type: Types.ObjectId,
      ref: "mock_tests",
      required: true,
    },

    bank_question_id: {
      type: Types.ObjectId,
      ref: "mock_test_question_bank",
      required: true,
    },

    order_in_test: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  { timestamps: true }
);

mockTestQuestion.index({ test_id: 1, order_in_test: 1 });

export const MockTestQuestion = model(
  "mock_test_questions",
  mockTestQuestion
);
