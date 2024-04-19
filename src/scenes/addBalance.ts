import { Scenes } from "telegraf";
import enabled from "../utils/enabled";
import prisma from "../../prisma/prisma";
import { keyboards } from "../utils/keyboards";
import { externalId } from "./start";
const scene = new Scenes.BaseScene("addBalance");

scene.hears(/^\d+$/, async (ctx: any) => {
  const userId = String(ctx.from.id);

  if (userId !== externalId) {
    return;
  }

  const addBalance = Number(ctx.message.text);
  const checkUserId = ctx?.session.user.checkUserId;
  const txt = `Foydalanuvchi Id:${checkUserId}
               kiritiladigan summa:${addBalance} 
    `;

  ctx.session.user = {
    checkUserId: checkUserId,
    balance: addBalance,
  };

  ctx.telegram.sendMessage(externalId, txt, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Tasdiqlash",
            callback_data: "confirm",
          },
        ],
        [
          {
            text: "Bekor qilish",
            callback_data: "cancel",
          },
        ],
      ],
    },
  });
});

scene.action("cancel", async (ctx: any) => {
  ctx.session.user = {};
  await ctx.answerCbQuery();
  await ctx.deleteMessage();
  return ctx.scene.enter("start");
});

scene.action("confirm", async (ctx: any) => {
  await ctx.answerCbQuery();
  await ctx.deleteMessage();
  const userId = String(ctx.from.id);

  if (userId !== externalId) {
    return;
  }

  const checkUserId = ctx.session.user.checkUserId;
  const balance = ctx.session.user.balance;

  if (!checkUserId && !balance) {
    return ctx.scene.enter("start");
  }

  const checkUser = await prisma.user.findFirst({
    where: {
      telegram_id: checkUserId,
    },
    include: {
      wallet: true,
    },
  });

  if (!checkUser) {
    return ctx.scene.enter("start");
  }

  const walletUpdate = await prisma.wallet.update({
    where: {
      id: String(checkUser.wallet?.id),
    },
    data: {
      balance: {
        increment: balance,
      },
    },
  });

  const walletRequest = await prisma.walletRequest.create({
    data: {
      user_id: checkUser.id,
      amount: balance,
      status: "APPROVED",
    },
  });

  let text = `Foydalanuvchi ${checkUser.username}\n Summa:${balance} tasdiqlandi.Oldingi balansi ${checkUser.wallet?.balance}`;
  ctx.reply(text);
  return ctx.scene.enter("start");
});

export default scene;
