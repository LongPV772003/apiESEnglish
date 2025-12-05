import axios from "axios";

export const askGemini = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Missing prompt" });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    };

    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    const answer =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "[No response from AI]";

    return res.json({ answer });
  } catch (err) {
    console.error("Gemini API Error:", err.response?.data || err);
    return res.status(500).json({
      message: "AI request failed",
      error: err.response?.data || err.message
    });
  }
};
