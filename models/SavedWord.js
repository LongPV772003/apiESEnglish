import { Schema, model, Types } from 'mongoose';
const s = new Schema({ user_id:{type:Types.ObjectId,ref:'users',required:true}, flashcard_id:{type:Types.ObjectId,ref:'flashcards',required:true}, saved_at:{type:Date,default:Date.now,required:true} });
s.index({ user_id:1, flashcard_id:1 }, { unique:true });
export const SavedWord = model('saved_words', s);