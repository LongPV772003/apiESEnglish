import { Schema, model, Types } from 'mongoose';
import { CONTENT_TYPE } from '../utils/enums.js';
const s = new Schema({
topic_id:{ type:Types.ObjectId, ref:'topics', required:true },
type:{ type:String, enum:CONTENT_TYPE, required:true },
title:String, body_text:String, media_audio_url:String, media_image_url:String,
meta: Schema.Types.Mixed,
created_by:{ type:Types.ObjectId, ref:'users' },
is_published:{ type:Boolean, default:true, required:true },
},{ timestamps:{ createdAt:'created_at', updatedAt:'updated_at' } });
s.index({ topic_id:1, type:1 }); s.index({ is_published:1 });
export const ContentItem = model('content_items', s);