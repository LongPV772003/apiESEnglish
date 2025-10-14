import { Schema, model, Types } from 'mongoose';
const s = new Schema({ user_id:{type:Types.ObjectId,ref:'users',required:true}, skill_id:{type:Types.ObjectId,ref:'skills',required:true}, level_id:{type:Types.ObjectId,ref:'levels'}, total_attempts:{type:Number,default:0,required:true}, correct_count:{type:Number,default:0,required:true}, total_score:{type:Number,default:0,required:true}, last_activity_at:Date });
s.index({ user_id:1, skill_id:1, level_id:1 }, { unique:true });
export const UserSkillProgress = model('user_skill_progress', s);