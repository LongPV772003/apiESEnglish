import bcrypt from "bcrypt";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { User } from "../models/User.js";

dotenv.config();

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const hash = await bcrypt.hash("Admin@123456", 10);
  const admin = await User.create({
    username: "Longadmin",
    email: "contact.work.esenglish@gmail.com",
    password_hash: hash,
    role: "ADMIN",
    status: "ACTIVE",
    full_name: "Admin ES English",
  });
  console.log("✅ Admin created:", admin.email);
  process.exit(0);
};

createAdmin();
