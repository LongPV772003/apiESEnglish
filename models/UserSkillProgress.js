import mongoose from "mongoose";

const userSkillProgressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    skill_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "skills",
      required: true,
    },
    level_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "levels",
      required: true,
    },
    topic_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "topics",
      required: true,
    },
    content_item_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "content_items",
      required: true,
    }, // ⚡ Mới thêm: theo dõi từng content-item trong topic

    total_attempts: { type: Number, default: 0 },
    correct_count: { type: Number, default: 0 },
    total_questions_done: { type: Number, default: 0 },
    total_score: { type: Number, default: 0 },

    last_activity_at: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const UserSkillProgress = mongoose.model(
  "UserSkillProgress",
  userSkillProgressSchema
);
