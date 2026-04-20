import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

interface SalesRow {
  Date: string;
  Patient: string;
  Service: string;
  Dentist: string;
  Amount: number;
}

interface ExpenseRow {
  Date: string;
  Description: string;
  Category: string;
  Amount: number;
}
export async function exportFinancialReportExcel(
  salesRows: SalesRow[],
  expenseRows: ExpenseRow[],
  filters: { from?: Date; to?: Date },
  fileName = "Financial_Report",
  clinicName = "YOUR CLINIC NAME", // Pwede mong gawing dynamic
) {
  const workbook = new ExcelJS.Workbook();
  const summarySheet = workbook.addWorksheet("Executive Summary", {
    views: [{ showGridLines: false }],
  });

  // 1. SETUP COLUMN WIDTHS (Para iwas "####")
  summarySheet.getColumn("B").width = 35; // Stats Column
  summarySheet.getColumn("E").width = 30; // Service Names
  summarySheet.getColumn("F").width = 25; // Bar Chart Column
  summarySheet.getColumn("G").width = 20; // Revenue Numbers

  // 2. PREPARE DATA
  const totalSales = salesRows.reduce((sum, r) => sum + r.Amount, 0);
  const totalExp = expenseRows.reduce((sum, r) => sum + r.Amount, 0);
  const netProfit = totalSales - totalExp;

  const serviceCounts: Record<string, number> = {};
  salesRows.forEach((r) => {
    serviceCounts[r.Service] = (serviceCounts[r.Service] || 0) + r.Amount;
  });
  const topServices = Object.entries(serviceCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // 3. BRANDING & HEADERS
  // Clinic Name & Main Title
  summarySheet.mergeCells("B2:G2");
  const clinicNameCell = summarySheet.getCell("B2");
  clinicNameCell.value = clinicName.toUpperCase();
  clinicNameCell.font = { bold: true, size: 20, color: { argb: "FF4F46E5" } };
  clinicNameCell.alignment = { horizontal: "center" };

  summarySheet.mergeCells("B3:G4");
  const mainHeader = summarySheet.getCell("B3");
  mainHeader.value = "FINANCIAL PERFORMANCE REPORT";
  mainHeader.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF4F46E5" },
  };
  mainHeader.font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
  mainHeader.alignment = { vertical: "middle", horizontal: "center" };

  // 4. DATE RANGE & CREATED DATE
  const fromStr = filters.from
    ? new Date(filters.from).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Start";
  const toStr = filters.to
    ? new Date(filters.to).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "End";

  summarySheet.getCell("B5").value = `Reporting Period: ${fromStr} - ${toStr}`;
  summarySheet.getCell("B5").font = { bold: true, color: { argb: "FF64748B" } };

  summarySheet.getCell("G5").value =
    `Generated: ${new Date().toLocaleString()}`;
  summarySheet.getCell("G5").font = {
    size: 9,
    italic: true,
    color: { argb: "FF94A3B8" },
  };
  summarySheet.getCell("G5").alignment = { horizontal: "right" };

  // 5. STATS CARDS (Column B)
  const stats = [
    { label: "TOTAL GROSS SALES", value: totalSales, color: "FF10B981" },
    { label: "TOTAL EXPENSES", value: totalExp, color: "FFEF4444" },
    { label: "NET PROFIT", value: netProfit, color: "FF4F46E5" },
  ];

  stats.forEach((stat, i) => {
    const rowIdx = 7 + i * 3;
    summarySheet.getCell(`B${rowIdx}`).value = stat.label;
    summarySheet.getCell(`B${rowIdx}`).font = {
      bold: true,
      size: 10,
      color: { argb: "FF94A3B8" },
    };

    const valCell = summarySheet.getCell(`B${rowIdx + 1}`);
    valCell.value = stat.value;
    valCell.font = { bold: true, size: 24, color: { argb: stat.color } }; // Ginawang 24 para "Big Stats"
    valCell.numFmt = '"₱"#,##0.00';
  });

  // 6. TOP SERVICES CHART (Fixed Overlap)
  summarySheet.getCell("E7").value = "TOP SERVICES BY REVENUE";
  summarySheet.getCell("E7").font = { bold: true, size: 11 };

  topServices.forEach((service, i) => {
    const rowIdx = 8 + i;
    summarySheet.getCell(`E${rowIdx}`).value = service.name;

    // Ang "Magic Trick" para itago ang text sa loob ng bar
    const barCell = summarySheet.getCell(`F${rowIdx}`);
    barCell.value = service.value;
    barCell.numFmt = ";;;"; // Excel trick: itatago ang value pero nandyan pa rin para sa chart

    const revCell = summarySheet.getCell(`G${rowIdx}`);
    revCell.value = service.value;
    revCell.numFmt = '"₱"#,##0.00';
    revCell.font = { bold: true };

    summarySheet.getRow(rowIdx).height = 25;
  });

  if (topServices.length > 0) {
    summarySheet.addConditionalFormatting({
      ref: `F8:F${7 + topServices.length}`,
      rules: [
        {
          type: "dataBar",
          cfvo: [{ type: "min" }, { type: "max" }],
          color: { argb: "FF818CF8" },
        } as any,
      ],
    });
  }
  // Hide the helper column F numbers but keep the bars
  summarySheet.getColumn("F").width = 15;
  summarySheet.getColumn("F").font = { color: { argb: "FFFFFFFF" } };

  // ==========================================
  // 2. SALES LOG SHEET
  // ==========================================
  const salesSheet = workbook.addWorksheet("Sales Log");
  salesSheet.columns = [
    { header: "Date", key: "Date", width: 15 },
    { header: "Patient Name", key: "Patient", width: 25 },
    { header: "Service", key: "Service", width: 25 },
    { header: "Dentist", key: "Dentist", width: 20 },
    { header: "Amount", key: "Amount", width: 15 },
  ];
  formatLogHeader(salesSheet, "FF4F46E5");
  fillLogData(salesSheet, salesRows, "Amount");

  // ==========================================
  // 3. EXPENSE LOG SHEET
  // ==========================================
  const expenseSheet = workbook.addWorksheet("Expense Log");
  expenseSheet.columns = [
    { header: "Date", key: "Date", width: 15 },
    { header: "Description", key: "Description", width: 35 },
    { header: "Category", key: "Category", width: 20 },
    { header: "Amount", key: "Amount", width: 15 },
  ];
  formatLogHeader(expenseSheet, "FFEF4444");
  fillLogData(expenseSheet, expenseRows, "Amount");

  // --- Finalize and Save ---
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${fileName}_${new Date().toISOString().split("T")[0]}.xlsx`);
}

/** HELPER FUNCTIONS **/

function formatLogHeader(sheet: ExcelJS.Worksheet, color: string) {
  const headerRow = sheet.getRow(1);
  headerRow.height = 25;
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
    cell.alignment = { vertical: "middle", horizontal: "center" };
    cell.border = { bottom: { style: "medium", color: { argb: "FF000000" } } };
  });
  sheet.views = [{ state: "frozen", ySplit: 1 }]; // Freeze header
}

function fillLogData(sheet: ExcelJS.Worksheet, rows: any[], amountKey: string) {
  rows.forEach((r) => {
    const row = sheet.addRow(r);
    row.getCell(amountKey).numFmt = '"₱"#,##0.00';
    row.eachCell((cell) => {
      cell.border = { bottom: { style: "thin", color: { argb: "FFF1F5F9" } } };
    });
  });

  // Footer Total
  const total = rows.reduce((sum, r) => sum + (r.Amount || 0), 0);
  const footerRow = sheet.addRow({ [amountKey]: total });
  footerRow.font = { bold: true };
  footerRow.getCell(amountKey).numFmt = '"₱"#,##0.00';
}
