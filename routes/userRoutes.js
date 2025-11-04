import express from "express";
import { updateProfile, getProfile, addUser, deleteUser, getAllUsers } from "../controllers/userController.js";
import { auth } from "../middlewares/auth.js";

const router = express.Router();

router.get("/profile", auth(true), getProfile);

router.put("/profile", auth(true), updateProfile);

router.get("/allUsers", auth(true,'admin') , getAllUsers)

router.post("/new", auth(true, 'admin'), addUser);

router.delete("/:id", auth(true, 'admin'), deleteUser);

export default router;
