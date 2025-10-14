import mongoose from "mongoose";

const VerifyCodeSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code:  { type: String, required: true },
  expired_at: { type: Date, required: true },
  verified: { type: Boolean, default: false },
});

export const VerifyCode = mongoose.model("VerifyCode", VerifyCodeSchema);
