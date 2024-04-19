require("dotenv").config();
import { Context, Middleware } from "telegraf";
import bot from "./core/bot";
import session from "./core/session";
import botStart from "./utils/startBot";
import stage from "./scenes/index";
import { SceneContext } from "telegraf/typings/scenes";
import { subcribeFunk } from "./utils/subcribe";
import prisma from "../prisma/prisma";

bot.use(session);

const middleware: Middleware<Context | SceneContext> = (ctx: any, next) => {
  ctx?.session ?? (ctx.session = {});
};

bot.use(stage.middleware());

bot.start(async (ctx: any) => {
  return await ctx.scene.enter("start");
});

bot.catch((err: any, ctx) => {
  const userId = ctx?.from?.id;
  if (userId) {
    bot.telegram.sendMessage(
      userId,
      "Xatolik yuz berdi. Iltimos qayta urinib ko'ring\n /start buyrug'ini bosib qayta urunib ko'ring"
    );
  }
  console.log(err);
  console.log(`Ooops, encountered an error for ${ctx}`, err);
});
botStart(bot);
https: process.on("unhandledRejection", (reason, promise) => {
  console.error("Ushlanmagan rad etilgan va'da:", promise, "Sabab:");
});

process.on("uncaughtException", (error) => {
  console.error("Ushlanmagan istisno:", error);
});
