import { Scenes } from "telegraf";
import enabled from "../utils/enabled";
import prisma from "../../prisma/prisma";
import { keyboards } from "../utils/keyboards";
const scene = new Scenes.BaseScene("start");
export const externalId = "6558268720";
scene.enter(async (ctx: any) => {
  const user_id = String(ctx.from?.id);

  if (user_id !== externalId) {
    return;
  }

  ctx.telegram.sendMessage(
    user_id,
    `Assalomu alaykum to'lov qilmoqchi bo'lgan foydalanuvchining Id sini kiriting`
  );

  return await ctx.scene.enter("addUser");
});

export default scene;
