import { Schema, model, Types } from "mongoose";

const SavedWordSchema = new Schema(
  {
    user_id: {
      type: Types.ObjectId,
      ref: "User", // ✅ Tên model User đúng
      required: true,
    },
    flashcard_id: {
      type: Types.ObjectId,
      ref: "Flashcard", // ✅ Tên model Flashcard đúng
      required: true,
    },
    saved_at: {
      type: Date,
      default: Date.now,
      required: true,
    },
  },
  { versionKey: false }
);

// Unique index để 1 user chỉ lưu 1 lần mỗi từ
SavedWordSchema.index({ user_id: 1, flashcard_id: 1 }, { unique: true });

export const SavedWord = model("SavedWord", SavedWordSchema);
