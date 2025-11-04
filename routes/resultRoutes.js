// routes/results.js
import express from "express";
import { saveResult } from "../controllers/resultsController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

// Lưu kết quả vào database
router.post("/", auth(), saveResult);

export default router;
