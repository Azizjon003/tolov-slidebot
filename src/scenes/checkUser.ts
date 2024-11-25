import { create } from "domain";
import { Scenes } from "telegraf";
import enabled from "../utils/enabled";
import prisma from "../../prisma/prisma";
import { keyboards } from "../utils/keyboards";
import { externalId } from "./start";
const scene = new Scenes.BaseScene("addUser");
scene.hears(/^[0-9]{1,10}$/, async (ctx: any) => {
  const checkUserId = ctx.message.text.trim();

  const userId = String(ctx.from.id);

  if (userId !== externalId) {
    return;
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
    return ctx.reply(
      "Bu foydalanuvchi mavjud emas \n Qaytadan kiritib ko'ring"
    );
  }
  const text = `Foydalnuvchi ${checkUser?.username}
  Balansi: ${checkUser.wallet?.balance}
  `;
  await ctx.telegram.sendMessage(userId, text, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Bekor qilish",
            callback_data: "cancel",
          },
        ],
      ],
    },
  });

  ctx.session.user = {
    checkUserId,
  };

  return ctx.scene.enter("addBalance");
});
scene.on("photo", async (ctx: any) => {
  try {
    // Forward qilingan rasmni tekshirish
    if (!ctx.message.forward_from) {
      return ctx.reply("Iltimos, rasmni forward qiling");
    }

    const forwardedFromId = String(ctx.message.forward_from.id);

    // Rasmni yuborgan foydalanuvchini bazadan tekshirish
    const checkUser = await prisma.user.findFirst({
      where: {
        telegram_id: forwardedFromId,
      },
      include: {
        wallet: true,
      },
    });

    if (!checkUser) {
      return ctx.reply(
        "Bu foydalanuvchi bazada mavjud emas \n Qaytadan urinib ko'ring"
      );
    }

    const text = `Foydalanuvchi ${checkUser?.username}
Balansi: ${checkUser.wallet?.balance}
`;

    await ctx.telegram.sendMessage(ctx.from.id, text, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Bekor qilish",
              callback_data: "cancel",
            },
          ],
        ],
      },
    });

    ctx.session.user = {
      checkUserId: forwardedFromId,
    };

    return ctx.scene.enter("addBalance");
  } catch (error) {
    console.error("Photo handler error:", error);
    return ctx.reply("Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring");
  }
});

scene.hears("Bugungi tushunmi ko'rish", async (ctx) => {
  const userId = String(ctx.from.id);

  if (userId !== externalId) {
    return;
  }

  const walletBalance = await prisma.walletRequest.findMany({
    where: {
      status: "APPROVED",
      created_at: {
        gte: new Date(new Date().setHours(0, 0, 0, 0)),
        lt: new Date(new Date().setHours(23, 59, 59, 999)),
      },
    },
  });

  let balance = 0;

  walletBalance.forEach((item) => {
    balance += item.amount;
  });

  const text = `Bugungi tushum: ${balance}`;
  await ctx.telegram.sendMessage(userId, text);
});
export default scene;
