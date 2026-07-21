import ExcelJS from "exceljs";

export interface ExcelReceiptRow {
  receiptNumber: string | null;
  date: string;
  customerName: string;
  serviceType: string;
  credit: string | null;
  debit: string | null;
  balance: string | null;
  description: string | null;
  createdByName: string | null | undefined;
}

/** Build an .xlsx workbook buffer from a list of receipt rows. */
export async function buildExcelBuffer(entries: ExcelReceiptRow[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const sheet = wb.addWorksheet("Receipts");

  sheet.columns = [
    { header: "Receipt #",    key: "receiptNumber", width: 18 },
    { header: "Date",         key: "date",          width: 14 },
    { header: "Customer",     key: "customerName",  width: 24 },
    { header: "Service",      key: "serviceType",   width: 20 },
    { header: "Credit (₹)",   key: "credit",        width: 14 },
    { header: "Debit (₹)",    key: "debit",         width: 14 },
    { header: "Balance (₹)",  key: "balance",       width: 14 },
    { header: "Operator",     key: "operator",      width: 16 },
    { header: "Description",  key: "description",   width: 30 },
  ];
  sheet.getRow(1).font = { bold: true };

  let totalCredit = 0;
  let totalDebit = 0;

  for (const e of entries) {
    const credit = parseFloat(e.credit ?? "0");
    const debit  = parseFloat(e.debit  ?? "0");
    totalCredit += credit;
    totalDebit  += debit;
    sheet.addRow({
      receiptNumber: e.receiptNumber,
      date:          e.date,
      customerName:  e.customerName,
      serviceType:   e.serviceType,
      credit,
      debit,
      balance:       parseFloat(e.balance ?? "0"),
      operator:      e.createdByName ?? "",
      description:   e.description ?? "",
    });
  }

  sheet.addRow({});
  const totalsRow = sheet.addRow({ customerName: "TOTAL", credit: totalCredit, debit: totalDebit });
  totalsRow.font = { bold: true };

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
