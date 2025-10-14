import { Schema, model, Types } from 'mongoose';
const s = new Schema({ title:{type:String,required:true}, duration_minutes:{type:Number,required:true,default:60}, skill_id:{type:Types.ObjectId,ref:'skills'}, created_by:{type:Types.ObjectId,ref:'users'} },{ timestamps:{ createdAt:'created_at', updatedAt:false } });
export const MockTest = model('mock_tests', s);