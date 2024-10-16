import axios from "axios";
export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  message: string
) {
  const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const response = await axios.post(telegramApiUrl, {
      chat_id: chatId,
      text: message,
    });

    console.log("Xabar muvaffaqiyatli yuborildi:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "Xabar yuborishda xatolik yuz berdi:",
      error.response ? error.response.data : error.message
    );
    throw error;
  }
}
