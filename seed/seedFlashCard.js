import mongoose from "mongoose";
import dotenv from "dotenv";
import { Flashcard } from "../models/Flashcard.js";
import { Topic } from "../models/Topic.js";
import axios from "axios";

dotenv.config();

// ========================
// DỮ LIỆU 5 CHỦ ĐỀ × 10 TỪ
// ========================
const data = {
  "Food & Drinks": [
    { word: "appetite", phonetic: "/ˈæpɪtaɪt/", part_of_speech: "noun", meaning_vi: "sự thèm ăn", example_en: "He has a healthy appetite.", example_vi: "Anh ấy có sự thèm ăn tốt." },
    { word: "flavour", phonetic: "/ˈfleɪvər/", part_of_speech: "noun", meaning_vi: "hương vị", example_en: "This soup has a rich flavour.", example_vi: "Súp này có hương vị đậm đà." },
    { word: "cuisine", phonetic: "/kwɪˈziːn/", part_of_speech: "noun", meaning_vi: "ẩm thực", example_en: "Italian cuisine is famous worldwide.", example_vi: "Ẩm thực Ý nổi tiếng khắp thế giới." },
    { word: "ingredient", phonetic: "/ɪnˈɡriːdiənt/", part_of_speech: "noun", meaning_vi: "nguyên liệu", example_en: "Flour is the main ingredient in bread.", example_vi: "Bột là nguyên liệu chính trong bánh mì." },
    { word: "dessert", phonetic: "/dɪˈzɜːrt/", part_of_speech: "noun", meaning_vi: "món tráng miệng", example_en: "We had ice cream for dessert.", example_vi: "Chúng tôi ăn kem tráng miệng." },
    { word: "bitter", phonetic: "/ˈbɪtər/", part_of_speech: "adjective", meaning_vi: "đắng", example_en: "The coffee tastes bitter.", example_vi: "Cà phê có vị đắng." },
    { word: "spicy", phonetic: "/ˈspaɪsi/", part_of_speech: "adjective", meaning_vi: "cay", example_en: "I love spicy food.", example_vi: "Tôi thích đồ ăn cay." },
    { word: "bake", phonetic: "/beɪk/", part_of_speech: "verb", meaning_vi: "nướng", example_en: "She is baking a cake.", example_vi: "Cô ấy đang nướng bánh." },
    { word: "boil", phonetic: "/bɔɪl/", part_of_speech: "verb", meaning_vi: "luộc, đun sôi", example_en: "Boil the water before drinking.", example_vi: "Đun sôi nước trước khi uống." },
    { word: "refreshing", phonetic: "/rɪˈfreʃɪŋ/", part_of_speech: "adjective", meaning_vi: "sảng khoái", example_en: "A glass of lemonade is refreshing.", example_vi: "Một ly nước chanh thật sảng khoái." }
  ],

  "Travel": [
    { word: "destination", phonetic: "/ˌdestɪˈneɪʃn/", part_of_speech: "noun", meaning_vi: "điểm đến", example_en: "Paris is a popular tourist destination.", example_vi: "Paris là điểm đến du lịch nổi tiếng." },
    { word: "journey", phonetic: "/ˈdʒɜːrni/", part_of_speech: "noun", meaning_vi: "chuyến đi", example_en: "The journey took eight hours.", example_vi: "Chuyến đi mất tám tiếng." },
    { word: "luggage", phonetic: "/ˈlʌɡɪdʒ/", part_of_speech: "noun", meaning_vi: "hành lý", example_en: "She packed her luggage carefully.", example_vi: "Cô ấy đóng gói hành lý cẩn thận." },
    { word: "departure", phonetic: "/dɪˈpɑːrtʃər/", part_of_speech: "noun", meaning_vi: "sự khởi hành", example_en: "The train's departure was delayed.", example_vi: "Chuyến tàu bị hoãn khởi hành." },
    { word: "arrive", phonetic: "/əˈraɪv/", part_of_speech: "verb", meaning_vi: "đến nơi", example_en: "We arrived at the airport on time.", example_vi: "Chúng tôi đến sân bay đúng giờ." },
    { word: "explore", phonetic: "/ɪkˈsplɔːr/", part_of_speech: "verb", meaning_vi: "khám phá", example_en: "We explored the old city.", example_vi: "Chúng tôi khám phá khu phố cổ." },
    { word: "adventure", phonetic: "/ədˈventʃər/", part_of_speech: "noun", meaning_vi: "cuộc phiêu lưu", example_en: "He loves adventure travel.", example_vi: "Anh ấy thích du lịch phiêu lưu." },
    { word: "passport", phonetic: "/ˈpæspɔːrt/", part_of_speech: "noun", meaning_vi: "hộ chiếu", example_en: "Don't forget your passport.", example_vi: "Đừng quên hộ chiếu của bạn." },
    { word: "souvenir", phonetic: "/ˌsuːvəˈnɪr/", part_of_speech: "noun", meaning_vi: "quà lưu niệm", example_en: "I bought a souvenir from Japan.", example_vi: "Tôi mua quà lưu niệm từ Nhật Bản." },
    { word: "itinerary", phonetic: "/aɪˈtɪnəreri/", part_of_speech: "noun", meaning_vi: "lịch trình", example_en: "Our itinerary includes three cities.", example_vi: "Lịch trình của chúng tôi gồm ba thành phố." }
  ],

  "Technology": [
    { word: "device", phonetic: "/dɪˈvaɪs/", part_of_speech: "noun", meaning_vi: "thiết bị", example_en: "He bought a new device.", example_vi: "Anh ấy mua thiết bị mới." },
    { word: "software", phonetic: "/ˈsɒftweər/", part_of_speech: "noun", meaning_vi: "phần mềm", example_en: "Update the software regularly.", example_vi: "Cập nhật phần mềm thường xuyên." },
    { word: "data", phonetic: "/ˈdeɪtə/", part_of_speech: "noun", meaning_vi: "dữ liệu", example_en: "All data is stored securely.", example_vi: "Dữ liệu được lưu trữ an toàn." },
    { word: "network", phonetic: "/ˈnetwɜːrk/", part_of_speech: "noun", meaning_vi: "mạng lưới", example_en: "We built a fast network.", example_vi: "Chúng tôi xây dựng mạng nhanh." },
    { word: "innovation", phonetic: "/ˌɪnəˈveɪʃn/", part_of_speech: "noun", meaning_vi: "sự đổi mới", example_en: "Innovation drives progress.", example_vi: "Đổi mới thúc đẩy tiến bộ." },
    { word: "download", phonetic: "/ˈdaʊnloʊd/", part_of_speech: "verb", meaning_vi: "tải xuống", example_en: "Download the app now.", example_vi: "Tải ứng dụng ngay." },
    { word: "upload", phonetic: "/ˈʌploʊd/", part_of_speech: "verb", meaning_vi: "tải lên", example_en: "Upload your files to the cloud.", example_vi: "Tải tệp lên đám mây." },
    { word: "algorithm", phonetic: "/ˈælɡərɪðəm/", part_of_speech: "noun", meaning_vi: "thuật toán", example_en: "The algorithm filters results.", example_vi: "Thuật toán lọc kết quả." },
    { word: "virtual", phonetic: "/ˈvɜːrtʃuəl/", part_of_speech: "adjective", meaning_vi: "ảo", example_en: "We had a virtual meeting.", example_vi: "Chúng tôi họp trực tuyến." },
    { word: "cybersecurity", phonetic: "/ˌsaɪbərsɪˈkjʊrəti/", part_of_speech: "noun", meaning_vi: "an ninh mạng", example_en: "Cybersecurity is essential.", example_vi: "An ninh mạng là điều cần thiết." }
  ],

  "Health": [
    { word: "symptom", phonetic: "/ˈsɪmptəm/", part_of_speech: "noun", meaning_vi: "triệu chứng", example_en: "Coughing is a symptom of a cold.", example_vi: "Ho là triệu chứng của cảm lạnh." },
    { word: "treatment", phonetic: "/ˈtriːtmənt/", part_of_speech: "noun", meaning_vi: "điều trị", example_en: "He is receiving treatment.", example_vi: "Anh ấy đang điều trị." },
    { word: "recover", phonetic: "/rɪˈkʌvər/", part_of_speech: "verb", meaning_vi: "hồi phục", example_en: "She recovered quickly.", example_vi: "Cô ấy hồi phục nhanh." },
    { word: "disease", phonetic: "/dɪˈziːz/", part_of_speech: "noun", meaning_vi: "bệnh tật", example_en: "Heart disease is common.", example_vi: "Bệnh tim phổ biến." },
    { word: "exercise", phonetic: "/ˈeksərsaɪz/", part_of_speech: "noun", meaning_vi: "tập thể dục", example_en: "Exercise daily for good health.", example_vi: "Tập thể dục mỗi ngày để khỏe mạnh." },
    { word: "diet", phonetic: "/ˈdaɪət/", part_of_speech: "noun", meaning_vi: "chế độ ăn", example_en: "He follows a strict diet.", example_vi: "Anh ấy theo chế độ ăn nghiêm ngặt." },
    { word: "medicine", phonetic: "/ˈmedɪsn/", part_of_speech: "noun", meaning_vi: "thuốc", example_en: "Take your medicine twice a day.", example_vi: "Uống thuốc hai lần mỗi ngày." },
    { word: "pain", phonetic: "/peɪn/", part_of_speech: "noun", meaning_vi: "cơn đau", example_en: "He felt pain in his chest.", example_vi: "Anh ấy cảm thấy đau ngực." },
    { word: "doctor", phonetic: "/ˈdɒktər/", part_of_speech: "noun", meaning_vi: "bác sĩ", example_en: "She is a doctor.", example_vi: "Cô ấy là bác sĩ." },
    { word: "hospital", phonetic: "/ˈhɒspɪtl/", part_of_speech: "noun", meaning_vi: "bệnh viện", example_en: "He was taken to the hospital.", example_vi: "Anh ấy được đưa đến bệnh viện." }
  ],

  "Environment": [
    { word: "pollution", phonetic: "/pəˈluːʃn/", part_of_speech: "noun", meaning_vi: "ô nhiễm", example_en: "Air pollution affects health.", example_vi: "Ô nhiễm không khí ảnh hưởng sức khỏe." },
    { word: "recycle", phonetic: "/ˌriːˈsaɪkl/", part_of_speech: "verb", meaning_vi: "tái chế", example_en: "We should recycle plastic bottles.", example_vi: "Chúng ta nên tái chế chai nhựa." },
    { word: "climate", phonetic: "/ˈklaɪmət/", part_of_speech: "noun", meaning_vi: "khí hậu", example_en: "The climate here is tropical.", example_vi: "Khí hậu ở đây là nhiệt đới." },
    { word: "forest", phonetic: "/ˈfɒrɪst/", part_of_speech: "noun", meaning_vi: "rừng", example_en: "Forests are home to wildlife.", example_vi: "Rừng là nơi sinh sống của động vật hoang dã." },
    { word: "energy", phonetic: "/ˈenərdʒi/", part_of_speech: "noun", meaning_vi: "năng lượng", example_en: "Solar energy is renewable.", example_vi: "Năng lượng mặt trời là tái tạo." },
    { word: "waste", phonetic: "/weɪst/", part_of_speech: "noun", meaning_vi: "rác thải", example_en: "Reduce food waste.", example_vi: "Giảm lãng phí thực phẩm." },
    { word: "sustainability", phonetic: "/səˌsteɪnəˈbɪləti/", part_of_speech: "noun", meaning_vi: "tính bền vững", example_en: "Sustainability is key for the future.", example_vi: "Tính bền vững là chìa khóa cho tương lai." },
    { word: "earthquake", phonetic: "/ˈɜːrθkweɪk/", part_of_speech: "noun", meaning_vi: "động đất", example_en: "The earthquake destroyed buildings.", example_vi: "Động đất phá hủy nhiều công trình." },
    { word: "temperature", phonetic: "/ˈtemprətʃər/", part_of_speech: "noun", meaning_vi: "nhiệt độ", example_en: "The temperature is rising.", example_vi: "Nhiệt độ đang tăng." },
    { word: "wildlife", phonetic: "/ˈwaɪldlaɪf/", part_of_speech: "noun", meaning_vi: "động vật hoang dã", example_en: "Protect wildlife habitats.", example_vi: "Bảo vệ môi trường sống của động vật hoang dã." }
  ]
};

// ========================
// SEED LOGIC
// ========================
const seedFlashcards = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");

    const topics = await Topic.find();
    if (!topics.length) throw new Error("⚠️ Không tìm thấy topics trong DB.");

    console.log("🧹 Xóa flashcards cũ...");
    await Flashcard.deleteMany();

    console.log("🌱 Thêm flashcards mới...");
    for (const [topicName, cards] of Object.entries(data)) {
      console.log("Tìm kiếm topic:", topicName);
      const topic = topics.find(t => t.title === topicName);

      if (!topic) {
        console.warn(`⚠️ Không tìm thấy topic với tên: ${topicName}`);
        continue; // Bỏ qua topic này nếu không tìm thấy
      }

      for (const card of cards) {
        const word = card.word.toLowerCase();

        // 🔊 Âm thanh Oxford
        const audio = `https://ssl.gstatic.com/dictionary/static/sounds/oxford/${word}--_us_1.mp3`;

        // 🖼️ Gọi API Pixabay để lấy ảnh phù hợp
        const query = encodeURIComponent(word);
        const pixabayUrl = `https://pixabay.com/api/?key=${process.env.PIXABAY_KEY}&q=${query}&image_type=photo&orientation=horizontal&per_page=3`;

        let image = "";
        try {
          const res = await axios.get(pixabayUrl);
          if (res.data.hits && res.data.hits.length > 0) {
            image = res.data.hits[0].webformatURL; // Lấy ảnh đầu tiên
          } else {
            image = "https://via.placeholder.com/600x400?text=No+Image"; // fallback
          }
        } catch (err) {
          console.warn(`⚠️ Pixabay lỗi cho từ '${word}':`, err.message);
          image = "https://via.placeholder.com/600x400?text=Error";
        }
        // 💾 Lưu vào MongoDB
        await Flashcard.create({
          ...card,
          audio_url: audio,
          image_url: image,
          topic_id: topic._id
        });
      }

      console.log(`✅ Đã thêm ${cards.length} flashcards cho topic ${topicName}`);
    }

    console.log("🎉 Seed flashcards FULL thành công!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi seed:", err.message);
    process.exit(1);
  }
};

seedFlashcards();
