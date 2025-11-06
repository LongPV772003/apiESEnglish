import express from "express";
import { auth, requireAdmin } from "../middlewares/auth.js";
import * as ctl from "../controllers/contentAdminController.js";
const r = express.Router();

r.get("/", ctl.listContent);
r.get("/:id", ctl.getContent);
r.post("/", auth(true), requireAdmin, ctl.createContent);
r.put("/:id", auth(true), requireAdmin, ctl.updateContent);
r.delete("/:id", auth(true), requireAdmin, ctl.deleteContent);

//question
r.get("/:id/questions", ctl.listQuestionsOfItem);
r.post("/:id/questions", auth(true), requireAdmin, ctl.createQuestionForItem);
r.put("/question/:id", auth(true), requireAdmin, ctl.updateQuestion);
r.delete("/question/:id", auth(true), requireAdmin, ctl.deleteQuestion);

//question option
r.get("/question/:qid/options", ctl.listOptions);
r.post("/question/:qid/options", auth(true), requireAdmin, ctl.addOptionsBatch);
r.put("/options/:id", auth(true), requireAdmin, ctl.updateOption);
r.delete("/options/:id", auth(true), requireAdmin, ctl.deleteOption);

r.get("/:id/detail", ctl.getContentDetail);
export default r;
