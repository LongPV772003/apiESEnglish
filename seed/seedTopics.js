import mongoose from "mongoose";
import dotenv from "dotenv";
import { Skill } from "../models/Skill.js";
import { Level } from "../models/Level.js";
import { Topic } from "../models/Topic.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ Connected to MongoDB");

const skills = await Skill.find();
const levels = await Level.find();

if (!skills.length || !levels.length) {
  console.log("⚠️ Bạn chưa seed kỹ năng hoặc cấp độ (chạy seed.js trước).");
  process.exit(1);
}

const topics = [];

// ==========================================
// LISTENING
// ==========================================
const listening = {
  BEGINNER: [
    { title: "Greetings and Introductions", desc: "Understanding simple conversations about saying hello and introducing yourself." },
    { title: "Daily Routines", desc: "Listening to short talks about daily habits and schedules." },
    { title: "Shopping for Food", desc: "Recognizing vocabulary and phrases used in a grocery store conversation." }
  ],
  INTERMEDIATE: [
    { title: "Travel and Directions", desc: "Listening to people giving directions and discussing travel plans." },
    { title: "Health and Lifestyle", desc: "Understanding discussions about healthy living and fitness." },
    { title: "Workplace Communication", desc: "Listening to colleagues discuss meetings, deadlines, and teamwork." }
  ],
  ADVANCED: [
    { title: "Global Environmental Issues", desc: "Listening to lectures about climate change and environmental protection." },
    { title: "Media and Technology", desc: "Analyzing podcasts or news about digital transformation and AI." },
    { title: "Cultural Differences", desc: "Understanding advanced discussions on intercultural communication." }
  ]
};

// ==========================================
// READING
// ==========================================
const reading = {
  BEGINNER: [
    { title: "Family and Friends", desc: "Reading short passages about family members and relationships." },
    { title: "At the Restaurant", desc: "Understanding menus and simple restaurant dialogues." },
    { title: "My Hometown", desc: "Reading simple texts describing cities and hometowns." }
  ],
  INTERMEDIATE: [
    { title: "Education Around the World", desc: "Reading articles about different education systems." },
    { title: "Science and Invention", desc: "Exploring stories of famous inventions and inventors." },
    { title: "Healthy Eating Habits", desc: "Reading passages about nutrition and healthy diets." }
  ],
  ADVANCED: [
    { title: "Artificial Intelligence", desc: "Reading complex articles about AI and its impact on society." },
    { title: "Global Economy", desc: "Understanding analytical texts about trade and finance." },
    { title: "Psychology of Success", desc: "Reading essays about motivation and personal development." }
  ]
};

// ==========================================
// WRITING
// ==========================================
const writing = {
  BEGINNER: [
    { title: "Writing About Yourself", desc: "Learning to describe yourself using simple sentences." },
    { title: "Describing Places", desc: "Writing short paragraphs about your favorite place." },
    { title: "Daily Schedule", desc: "Practicing writing about daily activities." }
  ],
  INTERMEDIATE: [
    { title: "Opinion Paragraphs", desc: "Writing paragraphs expressing opinions with supporting ideas." },
    { title: "Descriptive Essays", desc: "Writing essays describing people, events, or objects in detail." },
    { title: "Email Etiquette", desc: "Learning how to write professional and friendly emails." }
  ],
  ADVANCED: [
    { title: "Argumentative Essays", desc: "Developing persuasive writing skills with logical reasoning." },
    { title: "Report Writing", desc: "Learning how to write structured business and academic reports." },
    { title: "Creative Writing", desc: "Practicing storytelling and narrative composition." }
  ]
};

// ==========================================
// SPEAKING
// ==========================================
const speaking = {
  BEGINNER: [
    { title: "Introducing Yourself", desc: "Practicing simple self-introductions and greetings." },
    { title: "Ordering Food", desc: "Speaking about food preferences and ordering in restaurants." },
    { title: "Talking About Hobbies", desc: "Discussing personal interests and activities." }
  ],
  INTERMEDIATE: [
    { title: "Making Suggestions", desc: "Practicing polite ways to give advice or make suggestions." },
    { title: "Expressing Opinions", desc: "Sharing thoughts clearly and confidently in short discussions." },
    { title: "Describing Experiences", desc: "Talking about travel, work, and memorable events." }
  ],
  ADVANCED: [
    { title: "Debating Global Issues", desc: "Engaging in structured debates about environmental or political topics." },
    { title: "Public Speaking", desc: "Delivering short presentations and persuasive talks." },
    { title: "Interview Skills", desc: "Practicing professional speaking for job and academic interviews." }
  ]
};

// ==========================================
// TỔNG HỢP THEO DB
// ==========================================
const map = {
  LISTENING: listening,
  READING: reading,
  WRITING: writing,
  SPEAKING: speaking
};

for (const skill of skills) {
  const skillData = map[skill.code];
  if (!skillData) continue;

  for (const level of levels) {
    const levelData = skillData[level.code];
    if (!levelData) continue;

    for (const t of levelData) {
      topics.push({
        skill_id: skill._id,
        level_id: level._id,
        title: t.title,
        description: t.desc
      });
    }
  }
}

// Xóa topic cũ và chèn mới
await Topic.deleteMany({});
await Topic.insertMany(topics);

console.log(`✅ Seeded ${topics.length} high-quality topics successfully!`);
process.exit(0);
