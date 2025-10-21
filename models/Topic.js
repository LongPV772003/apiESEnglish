import mongoose, { Schema } from "mongoose";

const topicSchema = new Schema({
  skill_id: { type: Schema.Types.ObjectId, ref: "skills" },
  level_id: { type: Schema.Types.ObjectId, ref: "levels" },
  title: { type: String, required: true },
  description: String,
  type: {
    type: String,
    enum: ["CONTENT", "FLASHCARD"],
    default: "CONTENT"
  }
}, { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } });

export const Topic = mongoose.model("topics", topicSchema);
