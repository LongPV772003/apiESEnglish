import { MockTest } from "../models/MockTest.js";
import { MockTestAttempt } from "../models/MockTestAttempt.js";
import { MockTestAttemptAnswer } from "../models/MockTestAttemptAnswer.js";
import { MockTestQuestion } from "../models/MockTestQuestion.js";
import { MockTestQuestionBank } from "../models/MockTestQuestionBank.js";
export const listTests = async (_req, res) => {
  const items = await MockTest.find().sort({ created_at: -1 });
  const total = await MockTest.countDocuments();
  return res.json({
    total,
    items
  });
};
export const getTest = async (req, res) => {
  const x = await MockTest.findById(req.params.id);
  return x ? res.json(x) : res.status(404).json({ message: "Not found" });
};
export const createTest = async (req, res) => {
  const t = await MockTest.create({ ...req.body, created_by: req.user.id });
  res.status(201).json(t);
};
export const updateTest = async (req, res) =>
  res.json(
    await MockTest.findByIdAndUpdate(req.params.id, req.body, { new: true })
  );
export const deleteTest = async (req, res) => {
  await MockTest.findByIdAndDelete(req.params.id);
  res.status(204).end();
};
export const addQuestionToTest = async (req, res) => {
  const { question_id, order_in_test } = req.body;
  const doc = await MockTestQuestion.create({
    test_id: req.params.id,
    question_id,
    order_in_test,
  });
  res.status(201).json(doc);
};
export const reorderTestQuestions = async (req, res) => {
  const { items } = req.body;
  await Promise.all(
    items.map((x) =>
      MockTestQuestion.findByIdAndUpdate(x._id, {
        order_in_test: x.order_in_test,
      })
    )
  );
  res.json({ updated: items.length });
};
export const removeTestQuestion = async (req, res) => {
  await MockTestQuestion.findByIdAndDelete(req.params.id);
  res.status(204).end();
};
export const listTestQuestions = async (req, res) => {
  const questions = await MockTestQuestion.find({ test_id: req.params.id })
    .sort({ order_in_test: 1 })
    .lean();

  // Lấy ID
  const bankIds = questions.map(q => q.bank_question_id);

  const bankQuestions = await MockTestQuestionBank.find({
    _id: { $in: bankIds }
  }).lean();

  // Map dữ liệu trả về
  const items = questions.map(q => ({
    mapping_id: q._id,
    test_id: q.test_id,
    order_in_test: q.order_in_test,
    bank_question_id: q.bank_question_id,
    question: bankQuestions.find(
      b => b._id.toString() === q.bank_question_id.toString()
    )
  }));

  return res.json({
    total: items.length,
    items
  });
};
export const startMockTest = async (req, res) => {
  const test = await MockTest.findById(req.params.id).lean();
  if (!test) return res.status(404).json({ message: "Test not found" });

  const attempt = await MockTestAttempt.create({
    user_id: req.user.id,
    test_id: test._id,
    skill_id: test.skill_id,
    level_id: test.level_id || null
  });

  res.json({ attempt });
};
export const answerMockTest = async (req, res) => {
  const { attempt_id, bank_question_id, chosen_option_label } = req.body;

  const question = await MockTestQuestionBank.findById(bank_question_id).lean();
  if (!question) return res.status(404).json({ message: "Question not found" });

  const opt = question.options.find(o => o.label === chosen_option_label);
  const is_correct = !!opt?.is_correct;
  const score = is_correct ? question.points : 0;

  const answer = await MockTestAttemptAnswer.findOneAndUpdate(
    { attempt_id, bank_question_id },
    { chosen_option_label, is_correct, score },
    { upsert: true, new: true }
  );

  res.json(answer);
};

export const answerMockTestMulti = async (req, res) => {
  const { attempt_id, answers } = req.body;

  if (!attempt_id || !Array.isArray(answers)) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const results = [];

  for (const item of answers) {
    const { bank_question_id, chosen_option_label } = item;

    const question = await MockTestQuestionBank.findById(bank_question_id).lean();
    if (!question) continue;

    const opt = question.options.find(o => o.label === chosen_option_label);
    const is_correct = !!opt?.is_correct;
    const score = is_correct ? question.points : 0;

    const saved = await MockTestAttemptAnswer.findOneAndUpdate(
      { attempt_id, bank_question_id },
      { chosen_option_label, is_correct, score },
      { upsert: true, new: true }
    );

    results.push(saved);
  }

  res.json({
    attempt_id,
    saved_count: results.length,
    answers: results
  });
};

export const submitMockTest = async (req, res) => {
  const { attempt_id } = req.body;

  const att = await MockTestAttempt.findById(attempt_id);
  if (!att) return res.status(404).json({ message: "Attempt not found" });

  const answers = await MockTestAttemptAnswer.find({ attempt_id });

  const correct = answers.filter(a => a.is_correct).length;
  const wrong   = answers.length - correct;

  // cập nhật attempt
  att.status = "SUBMITTED";
  att.correct_count = correct;
  att.wrong_count = wrong;
  att.score = correct;
  att.submitted_at = new Date();
  await att.save();

  res.json({
    attempt_id,
    correct,
    wrong,
    total_questions: answers.length,
    score: correct
  });
};
export const listMyMockTests = async (req, res) => {
  const tests = await MockTestAttempt.find({ user_id: req.user.id })
    .populate("test_id")
    .sort({ createdAt: -1 })
    .lean();

  res.json(tests);
};

export const getMockTestAttemptDetail = async (req, res) => {
  const attempt = await MockTestAttempt.findById(req.params.id)
    .populate("test_id")
    .lean();

  const answers = await MockTestAttemptAnswer.find({ attempt_id: attempt._id })
    .populate("bank_question_id")
    .populate("chosen_option_label")
    .lean();

  res.json({ attempt, answers });
};


