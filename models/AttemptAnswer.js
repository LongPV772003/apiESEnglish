import { Schema, model, Types } from 'mongoose';
const s = new Schema({
attempt_id:{ type:Types.ObjectId, ref:'user_attempts', required:true },
question_id:{ type:Types.ObjectId, ref:'questions', required:true },
chosen_option_id:{ type:Types.ObjectId, ref:'question_options' },
answer_text:String, is_correct:Boolean, score:Number, feedback:String,
});
s.index({ attempt_id:1, question_id:1 }, { unique:true });
export const AttemptAnswer = model('attempt_answers', s);