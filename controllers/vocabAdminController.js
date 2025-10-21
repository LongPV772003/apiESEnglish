import mongoose from "mongoose";
import { Flashcard } from "../models/Flashcard.js";
import { SavedWord } from "../models/SavedWord.js";
import { buildPagination } from "../utils/paginate.js";

// =========================
// 📘 LẤY DANH SÁCH FLASHCARDS
// =========================
export const listFlashcards = async (req, res) => {
  try {
    const { skip, limit } = buildPagination(req.query);
    const f = {};

    if (req.query.topic_id) f.topic_id = req.query.topic_id;
    if (req.query.q) f.word = new RegExp(String(req.query.q), "i");

    const [items, total] = await Promise.all([
      Flashcard.find(f).skip(skip).limit(limit),
      Flashcard.countDocuments(f),
    ]);

    res.json({ total, items });
  } catch (err) {
    console.error("❌ Lỗi listFlashcards:", err);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// =========================
// 📘 LẤY CHI TIẾT 1 FLASHCARD
// =========================
export const getFlashcard = async (req, res) => {
  try {
    const x = await Flashcard.findById(req.params.id);
    if (!x) return res.status(404).json({ message: "Không tìm thấy từ" });
    res.json(x);
  } catch (err) {
    console.error("❌ Lỗi getFlashcard:", err);
    res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

// =========================
// 🛠️ TẠO / SỬA / XÓA FLASHCARD (ADMIN)
// =========================
export const createFlashcard = async (req, res) => {
  const item = await Flashcard.create(req.body);
  res.status(201).json(item);
};

export const updateFlashcard = async (req, res) => {
  const item = await Flashcard.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  res.json(item);
};

export const deleteFlashcard = async (req, res) => {
  await Flashcard.findByIdAndDelete(req.params.id);
  res.status(204).end();
};

// =========================
// 💾 LƯU / BỎ LƯU TỪ VỰNG (TOGGLE)
// =========================
export const toggleSaveWord = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { flashcard_id } = req.body;

    if (!userId || !flashcard_id)
      return res
        .status(400)
        .json({ message: "Thiếu user_id hoặc flashcard_id" });

    // ✅ Kiểm tra ID hợp lệ (ObjectId)
    if (!mongoose.Types.ObjectId.isValid(flashcard_id)) {
      return res.status(400).json({ message: "flashcard_id không hợp lệ" });
    }

    // ✅ Kiểm tra flashcard có tồn tại
    const flashcard = await Flashcard.findById(flashcard_id);
    if (!flashcard) {
      return res.status(404).json({ message: "Không tìm thấy flashcard để lưu" });
    }

    const key = { user_id: userId, flashcard_id };
    const existing = await SavedWord.findOne(key);

    // ✅ Nếu đã lưu → xóa (bỏ lưu)
    if (existing) {
      await SavedWord.deleteOne(key);
      return res.json({ saved: false });
    }

    // ✅ Nếu chưa có → lưu mới
    await SavedWord.create(key);
    return res.json({ saved: true });
  } catch (err) {
    console.error("❌ Lỗi toggleSaveWord:", err);
    res.status(500).json({ message: "Lỗi hệ thống khi lưu/bỏ lưu từ" });
  }
};

// =========================
// 📚 DANH SÁCH TỪ ĐÃ LƯU CỦA NGƯỜI DÙNG
// =========================
export const listSavedWordsMine = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;

    if (!userId)
      return res.status(401).json({ message: "Thiếu thông tin người dùng" });

    console.log("🧩 userId dùng để query:", userId);
    const saved = await SavedWord.find({
      user_id: userId.toString(),
    }).select("flashcard_id");

    console.log("🔍 SavedWords tìm thấy:", saved.length);

    if (!saved.length) return res.json([]);

    const ids = saved.map((x) => x.flashcard_id);
    const flashcards = await Flashcard.find({ _id: { $in: ids } });

    res.json(flashcards);
  } catch (err) {
    console.error("❌ Lỗi listSavedWordsMine:", err);
    res.status(500).json({ message: "Lỗi hệ thống khi lấy danh sách từ đã lưu" });
  }
};

