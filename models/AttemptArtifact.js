import { Schema, model, Types } from 'mongoose';
const s = new Schema({
attempt_id:{ type:Types.ObjectId, ref:'user_attempts', required:true },
artifact_type:{ type:String, enum:['WRITING','SPEAKING'], required:true },
text_submitted:String, word_count:Number, audio_url:String, asr_text:String,
metrics_json: Schema.Types.Mixed, feedback:String, highlights: Schema.Types.Mixed,
});
export const AttemptArtifact = model('attempt_artifacts', s);