import { Skill } from '../models/Skill.js';
import { Level } from '../models/Level.js';
import { Topic } from '../models/Topic.js';
import { buildPagination } from '../utils/paginate.js';
export const listSkills = async (_req,res)=> res.json(await Skill.find().sort({code:1}));
export const getSkill = async (req,res)=>{ const x=await Skill.findById(req.params.id); return x?res.json(x):res.status(404).json({message:'Not found'}); };
export const createSkill = async (req,res)=> res.status(201).json(await Skill.create(req.body));
export const updateSkill = async (req,res)=> res.json(await Skill.findByIdAndUpdate(req.params.id, req.body, {new:true}));
export const deleteSkill = async (req,res)=>{ await Skill.findByIdAndDelete(req.params.id); res.status(204).end(); };
export const listLevels = async (_req,res)=> res.json(await Level.find().sort({sort_order:1}));
export const getLevel = async (req,res)=>{ const x=await Level.findById(req.params.id); return x?res.json(x):res.status(404).json({message:'Not found'}); };
export const createLevel = async (req,res)=> res.status(201).json(await Level.create(req.body));
export const updateLevel = async (req,res)=> res.json(await Level.findByIdAndUpdate(req.params.id, req.body, {new:true}));
export const deleteLevel = async (req,res)=>{ await Level.findByIdAndDelete(req.params.id); res.status(204).end(); };

export const listTopics = async (req, res) => {
  try {
    const { skip, limit } = buildPagination(req.query);
    const filter = {};

    // ===== Bộ lọc =====
    if (req.query.type) {
      filter.type = req.query.type.toUpperCase(); // CONTENT / FLASHCARD
    }

    if (req.query.skill_id) {
      filter.skill_id = req.query.skill_id;
    }

    if (req.query.level_id) {
      filter.level_id = req.query.level_id;
    }

    if (req.query.q) {
      filter.title = new RegExp(String(req.query.q), "i"); // tìm kiếm theo tiêu đề
    }

    // ===== Query song song =====
    const [items, total] = await Promise.all([
      Topic.find(filter)
        .populate("skill_id", "code name")
        .populate("level_id", "name sort_order")
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Topic.countDocuments(filter),
    ]);

    res.json({ total, items });
  } catch (err) {
    console.error("❌ Lỗi listTopics:", err);
    res.status(500).json({ message: "Lỗi khi lấy danh sách topics." });
  }
};


export const getTopic = async (req,res)=>{ const x=await Topic.findById(req.params.id); return x?res.json(x):res.status(404).json({message:'Not found'}); };
export const createTopic = async (req,res)=> res.status(201).json(await Topic.create(req.body));
export const updateTopic = async (req,res)=> res.json(await Topic.findByIdAndUpdate(req.params.id, req.body, {new:true}));
export const deleteTopic = async (req,res)=>{ await Topic.findByIdAndDelete(req.params.id); res.status(204).end(); };