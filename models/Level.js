import { Schema, model } from 'mongoose';
const s = new Schema({ 
    code:{type:String,required:true,unique:true}, 
    name:{type:String,required:true}, 
    sort_order:{type:Number,default:1,required:true} 
});

export const Level = model('levels', s);