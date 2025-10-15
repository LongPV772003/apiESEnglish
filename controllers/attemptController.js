import { UserAttempt } from '../models/UserAttempt.js';
import { AttemptAnswer } from '../models/AttemptAnswer.js';
import { QuestionOption } from '../models/QuestionOption.js';
import { AttemptArtifact } from '../models/AttemptArtifact.js';
import { UserSkillProgress } from '../models/UserSkillProgress.js';
import { Flashcard } from '../models/Flashcard.js';
const autoGradeMCQ = async (question_id, chosen_option_id)=>{ const opt=await QuestionOption.findOne({ _id:chosen_option_id, question_id }); if(!opt) return { is_correct:false, points:0 }; return { is_correct:!!opt.is_correct, points: opt.is_correct?1:0 }; };
export const startAttempt = async (req,res)=>{ const att=await UserAttempt.create({ user_id:req.user.id, ...req.body }); res.json(att); };
export const answerQuestion = async (req,res)=>{ const { attempt_id, question_id, chosen_option_id, answer_text }=req.body; const att=await UserAttempt.findOne({ _id:attempt_id, user_id:req.user.id }); if(!att) return res.status(404).json({ message:'Attempt not found' }); let is_correct,score; if(chosen_option_id){ const g=await autoGradeMCQ(question_id,chosen_option_id); is_correct=g.is_correct; score=g.points; } const ans=await AttemptAnswer.findOneAndUpdate({ attempt_id, question_id },{ chosen_option_id, answer_text, is_correct, score },{ upsert:true, new:true }); res.json(ans); };
export const submitAttempt = async (req,res)=>{ const { attempt_id }=req.body; const att=await UserAttempt.findOne({ _id:attempt_id, user_id:req.user.id }); if(!att) return res.status(404).json({ message:'Attempt not found' }); const answers=await AttemptAnswer.find({ attempt_id }); const totalScore=answers.reduce((s,a)=>s+(a.score||0),0); const correctCount=answers.filter(a=>a.is_correct).length; att.status='SUBMITTED'; att.score=totalScore; att.submitted_at=new Date(); await att.save(); await UserSkillProgress.findOneAndUpdate({ user_id:req.user.id, skill_id:att.skill_id, level_id:att.level_id },{ $inc:{ total_attempts:1, correct_count: correctCount>0?1:0, total_score: totalScore }, $set:{ last_activity_at:new Date() } },{ upsert:true, new:true }); res.json({ attempt_id, totalScore, correctCount }); };
export const getAttemptDetail = async (req,res)=>{ const att=await UserAttempt.findOne({ _id:req.params.id, user_id:req.user.id }); if(!att) return res.status(404).json({ message:'Not found' }); const answers=await AttemptAnswer.find({ attempt_id:att._id }); res.json({ attempt:att, answers }); };
export const addArtifact = async (req,res)=>{ const { id }=req.params; const att=await UserAttempt.findOne({ _id:id, user_id:req.user.id }); if(!att) return res.status(404).json({ message:'Attempt not found' }); const art=await AttemptArtifact.create({ attempt_id:id, ...req.body }); res.status(201).json(art); };
export const getMyProgress = async (req, res) => {
  try {
    const userId = req.user.id;

    const progressList = await UserSkillProgress.find({ user_id: userId })
      .populate('skill_id')
      .populate('level_id')
      .lean();

    const skills = [];
    for (const p of progressList) {
      const recentAttempt = await UserAttempt.findOne({
        user_id: userId,
        skill_id: p.skill_id._id,
        level_id: p.level_id?._id
      })
        .sort({ submitted_at: -1 })
        .lean();

      const progress_percent =
        p.total_attempts > 0
          ? Math.round((p.correct_count / p.total_attempts) * 100)
          : 0;

      skills.push({
        skill_code: p.skill_id.code,
        skill_name: p.skill_id.name,
        level: p.level_id?.name || 'Unknown',
        progress_percent,
        completed_lessons: p.correct_count,
        total_lessons: p.total_attempts,
        recent_topic: recentAttempt?.topic_title || '—',
      });
    }

    const mock_tests = {
      total_score: skills.reduce((sum, s) => sum + (s.progress_percent || 0), 0),
      skills: skills.map(s => ({
        skill: s.skill_name,
        score: s.progress_percent
      }))
    };

    const flashcardsRaw = await Flashcard.find({ user_id: userId })
      .populate('topic_id')
      .lean();

    const grouped = {};
    for (const f of flashcardsRaw) {
      const topicName = f.topic_id?.title || 'General';
      if (!grouped[topicName]) grouped[topicName] = [];
      grouped[topicName].push({
        front: f.front_text,
        back: f.back_text,
        example: f.example || null,
      });
    }

    const flashcards = Object.keys(grouped).map(topic => ({
      topic,
      words: grouped[topic],
    }));

    res.json({
      skills,
      mock_tests,
      flashcards
    });
  } catch (err) {
    console.error('getMyProgress error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};