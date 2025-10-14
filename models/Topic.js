import { Schema, model, Types } from 'mongoose';
const s = new Schema({
skill_id:{ type:Types.ObjectId, ref:'skills', required:true },
level_id:{ type:Types.ObjectId, ref:'levels', required:true },
title:{ type:String, required:true, maxlength:200 },
description: String,
},{ timestamps:{ createdAt:'created_at', updatedAt:'updated_at' } });
s.index({ skill_id:1, level_id:1 }); s.index({ title:'text' });
export const Topic = model('topics', s);