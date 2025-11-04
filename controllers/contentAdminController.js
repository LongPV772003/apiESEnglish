import { ContentItem } from '../models/ContentItem.js';
import { Question } from '../models/Question.js';
import { QuestionOption } from '../models/QuestionOption.js';
import { buildPagination } from '../utils/paginate.js';
export const listContent = async (req, res) => {
  try {
    const { skip, limit } = buildPagination(req.query);
    const f = {};

    // lọc theo topic
    if (req.query.topic_id) f.topic_id = req.query.topic_id;

    // lọc theo loại content
    if (req.query.type) f.type = req.query.type;

    // lọc theo trạng thái publish
    if (req.query.published) f.is_published = req.query.published === "true";

    // 🔥 thêm lọc theo cấp độ (BEGINNER / INTERMEDIATE / ADVANCED)
    if (req.query.level_code)
      f["meta.level"] = req.query.level_code.toUpperCase();

    // 🔥 thêm lọc theo kỹ năng (READING / LISTENING / ...)
    if (req.query.skill_code)
      f["meta.skill"] = req.query.skill_code.toUpperCase();

    const [items, total] = await Promise.all([
      ContentItem.find(f)
        .skip(skip)
        .limit(limit)
        .sort({ created_at: -1 }),
      ContentItem.countDocuments(f),
    ]);

    res.json({ total, items });
  } catch (err) {
    console.error("❌ listContent error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getContent = async (req, res) => {
  try {
    const content = await ContentItem.findById(req.params.id);
    if (!content) return res.status(404).json({ message: "Not found" });
    res.json(content);
  } catch (err) {
    console.error("❌ getContent error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const createContent = async (req, res) => {
  try {
    const doc = await ContentItem.create({ ...req.body, created_by: req.user?._id });
    res.status(201).json(doc);
  } catch (err) {
    console.error("❌ createContent error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Cập nhật thông tin content item
export const updateContent = async (req, res) => {
  try {
    const updatedContent = await ContentItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedContent) return res.status(404).json({ message: "Not found" });
    res.json(updatedContent);
  } catch (err) {
    console.error("❌ updateContent error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Xoá content item
export const deleteContent = async (req, res) => {
  try {
    const content = await ContentItem.findByIdAndDelete(req.params.id);
    if (!content) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Xoá content thành công"});
  } catch (err) {
    console.error("❌ deleteContent error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
export const listQuestionsOfItem = async (req, res) => {
  try {
    const questions = await Question.find({ content_item_id: req.params.id }).sort({ order_in_item: 1 });
    res.json(questions);
  } catch (err) {
    console.error("❌ listQuestionsOfItem error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Tạo câu hỏi cho content item
export const createQuestionForItem = async (req, res) => {
  try {
    const question = await Question.create({ ...req.body, content_item_id: req.params.id });
    res.status(201).json(question);
  } catch (err) {
    console.error("❌ createQuestionForItem error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Cập nhật câu hỏi
export const updateQuestion = async (req, res) => {
  try {
    const updatedQuestion = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedQuestion) return res.status(404).json({ message: "Not found" });
    res.json(updatedQuestion);
  } catch (err) {
    console.error("❌ updateQuestion error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Xoá câu hỏi
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Xoá question thành công"});
  } catch (err) {
    console.error("❌ deleteQuestion error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
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