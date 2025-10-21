import { Schema, model, Types } from "mongoose";

const s = new Schema(
  {
    topic_id: { type: Types.ObjectId, ref: "topics", required: true },
    word: { type: String, required: true },
    phonetic: String,
    part_of_speech: {
      type: String,
      enum: ["noun", "verb", "adjective", "adverb"],
      default: "noun",
    },
    meaning_vi: String,
    example_en: String,
    example_vi: String,
    audio_url: {
      type: String,
      get: (v) =>
        v ||
        (this.word
          ? `https://ssl.gstatic.com/dictionary/static/sounds/oxford/${this.word.toLowerCase()}--_us_1.mp3`
          : null),
    },
    image_url: String,
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

export const Flashcard = model("flashcards", s);
