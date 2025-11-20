import { UserStudyTime } from "../models/UserStudyTime.js";

export const saveStudyTime = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, duration } = req.body;

    if (!date || !duration)
      return res.status(400).json({ message: "Thiếu dữ liệu thời gian học." });

    const updated = await UserStudyTime.findOneAndUpdate(
      { user_id: userId, date },
      { $inc: { duration } },
      { upsert: true, new: true }
    );

    res.json({ message: "Đã lưu thời gian học.", data: updated });
  } catch (err) {
    res.status(500).json({ message: "Lỗi lưu thời gian học." });
  }
};
