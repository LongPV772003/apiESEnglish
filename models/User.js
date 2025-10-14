import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  role: { type: String, enum: ["ADMIN", "LEARNER"], default: "LEARNER" },
  status: { type: String, enum: ["ACTIVE", "LOCKED"], default: "ACTIVE" },
  full_name: String,
  avatar_url: String,
  created_at: { type: Date, default: Date.now },
});

export const User = mongoose.model("User", UserSchema);
