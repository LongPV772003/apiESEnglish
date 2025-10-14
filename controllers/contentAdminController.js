import { ContentItem } from '../models/ContentItem.js';
import { Question } from '../models/Question.js';
import { QuestionOption } from '../models/QuestionOption.js';
import { buildPagination } from '../utils/paginate.js';
export const listContent = async (req,res)=>{ const { skip,limit }=buildPagination(req.query); const f={}; if(req.query.topic_id) f.topic_id=req.query.topic_id; if(req.query.type) f.type=req.query.type; if(req.query.published) f.is_published=req.query.published==='true'; const [items,total]=await Promise.all([ ContentItem.find(f).skip(skip).limit(limit).sort({created_at:-1}), ContentItem.countDocuments(f) ]); res.json({ total, items }); };
export const getContent = async (req,res)=>{ const x=await ContentItem.findById(req.params.id); return x?res.json(x):res.status(404).json({message:'Not found'}); };
export const createContent = async (req,res)=>{ const doc=await ContentItem.create({ ...req.body, created_by:req.user?._id }); res.status(201).json(doc); };
export const updateContent = async (req,res)=> res.json(await ContentItem.findByIdAndUpdate(req.params.id, req.body, {new:true}));
export const deleteContent = async (req,res)=>{ await ContentItem.findByIdAndDelete(req.params.id); res.status(204).end(); };
export const listQuestionsOfItem = async (req,res)=> res.json(await Question.find({ content_item_id:req.params.id }).sort({order_in_item:1}));
export const createQuestionForItem = async (req,res)=>{ const q=await Question.create({ ...req.body, content_item_id:req.params.id }); res.status(201).json(q); };
export const listOptions = async (req,res)=> res.json(await QuestionOption.find({ question_id:req.params.qid }));
export const addOptionsBatch = async (req,res)=>{ const options=(req.body?.options||[]).map(o=>({ ...o, question_id:req.params.qid })); await QuestionOption.insertMany(options); res.status(201).json({ inserted: options.length }); };
export const updateOption = async (req,res)=> res.json(await QuestionOption.findByIdAndUpdate(req.params.id, req.body, {new:true}));
export const deleteOption = async (req,res)=>{ await QuestionOption.findByIdAndDelete(req.params.id); res.status(204).end(); };
export async function getContentDetail(req, res) {
  try {
    const { id } = req.params;

    // Lấy thông tin content chính
    const content = await ContentItem.findById(id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    // Lấy danh sách câu hỏi liên quan
    const questions = await Question.find({ content_item_id: id }).sort("order_in_item");

    // Lấy tất cả option của các câu hỏi này
    const questionIds = questions.map(q => q._id);
    const options = await QuestionOption.find({ question_id: { $in: questionIds } });

    // Gộp dữ liệu cho dễ đọc
    const questionsWithOptions = questions.map(q => ({
      _id: q._id,
      question_type: q.question_type,
      question_text: q.question_text,
      order_in_item: q.order_in_item,
      options: options.filter(o => o.question_id.toString() === q._id.toString()),
    }));

    res.json({
      item: content,
      total_questions: questions.length,
      questions: questionsWithOptions,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
}