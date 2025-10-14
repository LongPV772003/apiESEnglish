import { Schema, model } from 'mongoose';
const s = new Schema({ 
    code: {type: String, required: true, unique: true}, 
    name: {type: String, required: true} 
});

export const Skill = model('skills', s);