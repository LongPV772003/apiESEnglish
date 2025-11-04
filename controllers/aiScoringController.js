import OpenAI from "openai";
import dotenv from "dotenv";
dotenv.config();

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export const scoreWriting = async (req, res) => {
  try {
    const { level, user_answer } = req.body;

    if (!user_answer || user_answer.trim().length < 5) {
      return res.status(400).json({ message: "Câu trả lời quá ngắn." });
    }

    // Prompt cho từng cấp độ
    const prompts = {
      BEGINNER: `
      You are a grammar teacher. Evaluate this short English sentence.
      - Check correctness (spelling, grammar)
      - Give a score from 0 to 5
      - Provide short feedback in plain English.
      Student text: """${user_answer}"""
      `,
      INTERMEDIATE: `
      You are an English examiner. Evaluate this short paragraph (3–5 sentences) describing a picture.
      Criteria:
      - Grammar & sentence structure (0–5)
      - Vocabulary variety (0–5)
      - Relevance to prompt (0–5)
      Return total score (0–15) and concise feedback.
      Student text: """${user_answer}"""
      `,
      ADVANCED: `
      You are an IELTS Writing Task 2 examiner.
      Evaluate the essay (200–300 words) using IELTS band descriptors:
      - Task response
      - Coherence & cohesion
      - Lexical resource
      - Grammatical range & accuracy
      Give:
      1. Band score (0–9)
      2. Brief justification (1 paragraph)
      Essay:
      """${user_answer}"""
      `,
    };

    const prompt = prompts[level] || prompts.BEGINNER;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are an English writing evaluator." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
    });

    const aiText = response.choices[0].message.content;

    res.json({
      level,
      result: aiText,
    });
  } catch (err) {
    console.error("❌ Lỗi chấm writing:", err.message);
    res.status(500).json({ message: "AI scoring failed" });
  }
};
