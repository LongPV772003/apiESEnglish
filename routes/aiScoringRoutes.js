import express from "express";
import { auth } from "../middlewares/auth.js";
import { scoreWriting } from "../controllers/aiScoringController.js";

const r = express.Router();
r.post("/writing", auth(true), scoreWriting);

export default r;
