import mongoose from "mongoose";

const studyTimeSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  date: { type: String, required: true },  // YYYY-MM-DD
  duration: { type: Number, default: 0 },  // số giây
});

studyTimeSchema.index({ user_id: 1, date: 1 }, { unique: true });

export const UserStudyTime = mongoose.model("UserStudyTime", studyTimeSchema);
