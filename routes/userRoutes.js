import express from "express";
import { updateProfile, getProfile } from "../controllers/userController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/profile", auth(true), getProfile);

router.put("/profile", auth(true), updateProfile);

export default router;
