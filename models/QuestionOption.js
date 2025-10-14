import { Schema, model, Types } from 'mongoose';
const s = new Schema({ question_id:{type:Types.ObjectId,ref:'questions',required:true}, label:String, option_text:String, is_correct:{type:Boolean,default:false,required:true} });
s.index({ question_id:1 });
export const QuestionOption = model('question_options', s);