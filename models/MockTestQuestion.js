import { Schema, model, Types } from 'mongoose';
const s = new Schema({ test_id:{type:Types.ObjectId,ref:'mock_tests',required:true}, question_id:{type:Types.ObjectId,ref:'questions',required:true}, order_in_test:{type:Number,required:true,default:1} });
s.index({ test_id:1, order_in_test:1 });
export const MockTestQuestion = model('mock_test_questions', s);