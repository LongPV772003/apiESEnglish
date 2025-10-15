import { Schema, model, Types } from 'mongoose';

const s = new Schema({
  topic_id: { type: Types.ObjectId, ref: 'topics', required: true },
  word: { type: String, required: true },
  phonetic: String,
  part_of_speech: String,
  meaning_vi: String,
  example_en: String,
  example_vi: String,
  audio_url: String,
  image_url: String,
}, {
  timestamps: { createdAt: 'created_at', updatedAt: false }
});

export const Flashcard = model('flashcards', s);
