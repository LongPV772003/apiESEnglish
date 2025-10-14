import { Schema, model, Types } from 'mongoose';
import { QUESTION_TYPE } from '../utils/enums.js';
const s = new Schema({
content_item_id:{ type:Types.ObjectId, ref:'content_items', required:true },
question_type:{ type:String, enum:QUESTION_TYPE, required:true },
question_text:{ type:String, required:true },
image_url:String, points:{ type:Number, default:1, required:true },
order_in_item:{ type:Number, default:1, required:true },
});
s.index({ content_item_id:1, order_in_item:1 });
export const Question = model('questions', s);