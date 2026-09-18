import "dotenv/config";
import { loadKnowledgeBase } from "./rag/knowledgeBase.js";
import { createBot } from "./bot/bot.js";

const REQUIRED_ENV = ["TELEGRAM_BOT_TOKEN", "ANTHROPIC_API_KEY"];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Не заданы переменные окружения: ${missing.join(", ")}. См. .env.example`);
  process.exit(1);
}

const knowledgeBase = loadKnowledgeBase();
console.log(`База знаний загружена: ${knowledgeBase.chunkCount} фрагментов`);

const bot = createBot(knowledgeBase);

bot.start();
console.log("Бот запущен");
