import mongoose from "mongoose";
import dotenv from "dotenv";
import { Flashcard } from "../models/Flashcard.js";
import { Topic } from "../models/Topic.js";

dotenv.config();

const data = {
  "Food & Drinks": [
    { word: "appetite", phonetic: "/ˈæpɪtaɪt/", part_of_speech: "noun", meaning_vi: "sự thèm ăn", example_en: "He has a healthy appetite.", example_vi: "Anh ấy có sự thèm ăn tốt.", audio_url: "https://cdn.pixabay.com/download/audio/2021/11/30/audio_d2b9e5.mp3?filename=short-lesson.mp3", image_url: "https://cdn.pixabay.com/photo/2016/10/27/22/51/meal-1778766_640.jpg" },
    { word: "flavour", phonetic: "/ˈfleɪvər/", part_of_speech: "noun", meaning_vi: "hương vị", example_en: "This soup has a rich flavour.", example_vi: "Súp này có hương vị đậm đà.", audio_url: "", image_url: "" },
    { word: "cuisine", phonetic: "/kwɪˈziːn/", part_of_speech: "noun", meaning_vi: "ẩm thực", example_en: "Italian cuisine is famous worldwide.", example_vi: "Ẩm thực Ý nổi tiếng khắp thế giới.", audio_url: "", image_url: "" },
    { word: "ingredient", phonetic: "/ɪnˈɡriːdiənt/", part_of_speech: "noun", meaning_vi: "nguyên liệu", example_en: "Flour is the main ingredient in bread.", example_vi: "Bột là nguyên liệu chính trong bánh mì.", audio_url: "", image_url: "" },
    { word: "dessert", phonetic: "/dɪˈzɜːrt/", part_of_speech: "noun", meaning_vi: "món tráng miệng", example_en: "We had ice cream for dessert.", example_vi: "Chúng tôi ăn kem tráng miệng.", audio_url: "", image_url: "" }
  ],
  "Travel": [
    { word: "destination", phonetic: "/ˌdestɪˈneɪʃn/", part_of_speech: "noun", meaning_vi: "điểm đến", example_en: "Paris is a popular tourist destination.", example_vi: "Paris là điểm đến du lịch nổi tiếng.", audio_url: "", image_url: "" },
    { word: "journey", phonetic: "/ˈdʒɜːrni/", part_of_speech: "noun", meaning_vi: "chuyến đi", example_en: "The journey took more than eight hours.", example_vi: "Chuyến đi mất hơn tám tiếng.", audio_url: "", image_url: "" },
    { word: "luggage", phonetic: "/ˈlʌɡɪdʒ/", part_of_speech: "noun", meaning_vi: "hành lý", example_en: "She packed her luggage carefully.", example_vi: "Cô ấy đóng gói hành lý cẩn thận.", audio_url: "", image_url: "" },
    { word: "departure", phonetic: "/dɪˈpɑːrtʃər/", part_of_speech: "noun", meaning_vi: "sự khởi hành", example_en: "The train's departure was delayed.", example_vi: "Chuyến tàu bị hoãn khởi hành.", audio_url: "", image_url: "" },
    { word: "arrive", phonetic: "/əˈraɪv/", part_of_speech: "verb", meaning_vi: "đến nơi", example_en: "We arrived at the airport on time.", example_vi: "Chúng tôi đến sân bay đúng giờ.", audio_url: "", image_url: "" }
  ],
  "Technology": [
    { word: "device", phonetic: "/dɪˈvaɪs/", part_of_speech: "noun", meaning_vi: "thiết bị", example_en: "He bought a new electronic device.", example_vi: "Anh ấy mua một thiết bị điện tử mới.", audio_url: "", image_url: "" },
    { word: "software", phonetic: "/ˈsɒftweər/", part_of_speech: "noun", meaning_vi: "phần mềm", example_en: "The software needs updating.", example_vi: "Phần mềm cần được cập nhật.", audio_url: "", image_url: "" },
    { word: "data", phonetic: "/ˈdeɪtə/", part_of_speech: "noun", meaning_vi: "dữ liệu", example_en: "All data is stored securely.", example_vi: "Tất cả dữ liệu được lưu trữ an toàn.", audio_url: "", image_url: "" },
    { word: "network", phonetic: "/ˈnetwɜːrk/", part_of_speech: "noun", meaning_vi: "mạng lưới", example_en: "The company has a global network.", example_vi: "Công ty có mạng lưới toàn cầu.", audio_url: "", image_url: "" },
    { word: "innovation", phonetic: "/ˌɪnəˈveɪʃn/", part_of_speech: "noun", meaning_vi: "sự đổi mới", example_en: "Innovation drives development.", example_vi: "Sự đổi mới thúc đẩy phát triển.", audio_url: "", image_url: "" }
  ],
  "Health": [
    { word: "symptom", phonetic: "/ˈsɪmptəm/", part_of_speech: "noun", meaning_vi: "triệu chứng", example_en: "Coughing is a common symptom of a cold.", example_vi: "Ho là triệu chứng thường gặp của cảm lạnh.", audio_url: "", image_url: "" },
    { word: "treatment", phonetic: "/ˈtriːtmənt/", part_of_speech: "noun", meaning_vi: "điều trị", example_en: "He is receiving treatment for his injury.", example_vi: "Anh ấy đang điều trị chấn thương.", audio_url: "", image_url: "" },
    { word: "recover", phonetic: "/rɪˈkʌvər/", part_of_speech: "verb", meaning_vi: "hồi phục", example_en: "She recovered quickly after surgery.", example_vi: "Cô ấy hồi phục nhanh sau ca phẫu thuật.", audio_url: "", image_url: "" },
    { word: "disease", phonetic: "/dɪˈziːz/", part_of_speech: "noun", meaning_vi: "bệnh tật", example_en: "Heart disease is common among adults.", example_vi: "Bệnh tim phổ biến ở người lớn.", audio_url: "", image_url: "" },
    { word: "exercise", phonetic: "/ˈeksərsaɪz/", part_of_speech: "noun", meaning_vi: "tập thể dục", example_en: "Regular exercise is good for your health.", example_vi: "Tập thể dục thường xuyên tốt cho sức khỏe.", audio_url: "", image_url: "" }
  ]
};

const seedFlashcards = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const topics = await Topic.find();
    if (topics.length === 0) throw new Error("⚠️ Không tìm thấy topics trong DB.");

    console.log("🧹 Xóa flashcards cũ...");
    await Flashcard.deleteMany();

    console.log("🌱 Thêm flashcards mới...");
    for (const [topicName, cards] of Object.entries(data)) {
      const topic = topics.find(t => t.title.includes(topicName)) || topics[0];
      for (const card of cards) {
        await Flashcard.create({ ...card, topic_id: topic._id });
      }
      console.log(`✅ Đã thêm ${cards.length} flashcards cho topic ${topicName}`);
    }

    console.log("🎉 Seed flashcards thành công!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi seed:", err.message);
    process.exit(1);
  }
};

seedFlashcards();
