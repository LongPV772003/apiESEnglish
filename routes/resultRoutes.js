// routes/results.js
import express from "express";
import { deleteAllResults, deleteAllResultsUser, deleteResult, getAllResults, getResults, saveResult } from "../controllers/resultsController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

// Lưu kết quả vào database
router.post("/", auth(), saveResult);
router.get("/", auth(), getResults);
router.delete("/:id", auth(), deleteResult);
router.delete("/", auth(), deleteAllResultsUser);
router.delete("/all", deleteAllResults);
router.get("/all", getAllResults); 

export default router;
