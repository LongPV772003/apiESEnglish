import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },

  password_hash: {
    type: String,
    required: true,
  },

  role: {
    type: String,
    enum: ["ADMIN", "LEARNER"],
    default: "LEARNER",
  },

  status: {
    type: String,
    enum: ["ACTIVE", "LOCKED"],
    default: "ACTIVE",
  },

  full_name: {
    type: String,
    trim: true,
  },

  gender: {
    type: String,
    enum: ["MALE", "FEMALE", "OTHER"],
    default: "OTHER",
  },

  age: {
    type: Number,
    min: 0,
    max: 120,
  },

  occupation: {
    type: String,
    trim: true,
  },

  avatar_url: {
    type: String,
    default: "",
  },

  created_at: {
    type: Date,
    default: Date.now,
  },

  updated_at: {
    type: Date,
    default: Date.now,
  },
});

// Cập nhật `updated_at` tự động trước khi save
UserSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

export const User = mongoose.model("User", UserSchema);
