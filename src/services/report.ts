import ExcelJS from "exceljs";
import prisma from "../../prisma/prisma";

async function exportWalletRequestsToExcel() {
  // Ma'lumotlarni olish
  const approvedRequests = await prisma.walletRequest.findMany({
    where: {
      status: "APPROVED",
      created_at: {
        gte: new Date("2024-11-01"),
        lte: new Date("2024-11-28"),
      },
    },
    include: {
      user: true,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  // Excel workbook yaratish
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Approved Requests");

  // Ustunlarni sozlash
  worksheet.columns = [
    { header: "№", key: "no", width: 5 },
    { header: "Sana", key: "date", width: 20 },
    { header: "Foydalanuvchi", key: "user", width: 30 },
    { header: "Summa", key: "amount", width: 15 },
    { header: "ID", key: "id", width: 40 },
  ];

  // Header stilini sozlash
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE0E0E0" },
  };

  // Ma'lumotlarni qo'shish
  approvedRequests.forEach((request, index) => {
    worksheet.addRow({
      no: index + 1,
      date: request.created_at.toLocaleString("uz-UZ"),
      user: request.user.name,
      amount: request.amount,
      id: request.id,
      telegram_id: request.user.telegram_id,
    });
  });

  // Summani hisoblash va qo'shish
  const totalAmount = approvedRequests.reduce(
    (sum, request) => sum + request.amount,
    0
  );

  // Bo'sh qator qo'shish
  worksheet.addRow([]);

  // Jami summani qo'shish
  const totalRow = worksheet.addRow({
    user: "JAMI:",
    amount: totalAmount,
  });
  totalRow.font = { bold: true };

  // Raqamlar ustunini formatlash
  worksheet.getColumn("amount").numFmt = "#,##0";

  // Faylni saqlash
  const fileName = `wallet_requests_${
    new Date().toISOString().split("T")[0]
  }.xlsx`;
  await workbook.xlsx.writeFile(fileName);

  return fileName;
}

// Funksiyani ishlatish
const test = async () => {
  try {
    const fileName = await exportWalletRequestsToExcel();
    console.log(`Excel file yaratildi: ${fileName}`);
  } catch (error) {
    console.error("Excel faylni yaratishda xatolik:", error);
  }
};

test();
