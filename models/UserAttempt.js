import { Schema, model, Types } from 'mongoose';
const s = new Schema({
user_id:{ type:Types.ObjectId, ref:'users', required:true },
skill_id:{ type:Types.ObjectId, ref:'skills', required:true },
level_id:{ type:Types.ObjectId, ref:'levels' },
topic_id:{ type:Types.ObjectId, ref:'topics' },
content_item_id:{ type:Types.ObjectId, ref:'content_items' },
test_id:{ type:Types.ObjectId, ref:'mock_tests' },
attempt_scope:{ type:String, enum:['CONTENT','MOCK_TEST'], default:'CONTENT', required:true },
status:{ type:String, enum:['IN_PROGRESS','SUBMITTED','GRADED'], default:'IN_PROGRESS', required:true },
score:Number, ai_score:Number, ai_feedback:String, duration_seconds:Number,
started_at:{ type:Date, default:Date.now, required:true }, submitted_at:Date,
});
s.index({ user_id:1, skill_id:1, started_at:-1 }); s.index({ content_item_id:1 });
export const UserAttempt = model('user_attempts', s);