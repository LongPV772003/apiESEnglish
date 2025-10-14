import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import api from "./routes/index.js";

dotenv.config();

const app = express();

// Middleware bảo mật & hiệu năng
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "2mb" }));

// Kết nối MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Route mặc định
app.get("/", (req, res) => {
  res.json({ message: "🚀 ES English API is running" });
});

// Dùng routes chính (index.js trong /routes)
app.use("/api", api);

// Khởi động server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
