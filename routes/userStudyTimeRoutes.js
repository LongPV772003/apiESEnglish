import express from "express";
import { auth } from "../middlewares/auth.js";
import { saveStudyTime } from "../controllers/studyTimeController.js";
const r = express.Router()

r.post('/',auth(true), saveStudyTime)

export default r