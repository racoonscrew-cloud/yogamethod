import { Bot } from "grammy";
import { answerQuestion } from "../rag/answer.js";

const WELCOME = `Привет! Я бот-ассистент курса инструкторов дыхательных техник.

Отвечаю на вопросы по структуре курса, содержанию уроков и подготовке к экзамену —
на основе материалов курса. Если чего-то не знаю, так и скажу и подскажу, куда обратиться.

Просто напишите вопрос.`;

export function createBot(knowledgeBase) {
  const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);

  bot.command("start", (ctx) => ctx.reply(WELCOME));

  bot.on("message:text", async (ctx) => {
    const question = ctx.message.text.trim();
    if (!question) return;

    await ctx.replyWithChatAction("typing");

    try {
      const answer = await answerQuestion(knowledgeBase, question);
      await ctx.reply(answer);
    } catch (err) {
      console.error("Ошибка при генерации ответа:", err);
      await ctx.reply(
        "Что-то пошло не так при обработке вопроса. Попробуйте ещё раз чуть позже или напишите куратору."
      );
    }
  });

  bot.catch((err) => {
    console.error("Необработанная ошибка бота:", err);
  });

  return bot;
}
