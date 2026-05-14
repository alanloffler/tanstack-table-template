import ExcelJS from "exceljs";
import type { Table } from "@tanstack/react-table";
import { saveAs } from "file-saver";

type TProps<T> = {
  filename?: string;
  formatters?: Record<string, TXlsFormatter<T>>;
  table: Table<T>;
  sheetName?: string;
};

export type TXlsFormatter<T> = (row: T) => string;

export async function exportTableToXls<T>({
  filename = `table-${Date.now()}.xlsx`,
  formatters = {},
  table,
  sheetName = "Sheet1",
}: TProps<T>): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  const columns = table
    .getAllLeafColumns()
    .filter((col) => col.getIsVisible() && !(col.columnDef.meta as Record<string, unknown> | undefined)?.disableExport);

  const headerRow = columns.map((col) => col.id);

  const selectedRows = table.getSelectedRowModel().rows;
  const rows = selectedRows.length > 0 ? selectedRows : table.getFilteredRowModel().rows;

  const body = rows.map((row) =>
    columns.map((col) => {
      const formatter = formatters[col.id];
      if (formatter) return formatter(row.original);

      const value = row.getValue(col.id);
      if (value == null) return "";
      if (typeof value === "object") return JSON.stringify(value);
      return String(value);
    }),
  );

  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.font = "11pt Calibri";
  const zeroWidth = ctx.measureText("0").width;

  const colWidths = columns.map((_, colIndex) => {
    let maxPixels = ctx.measureText(headerRow[colIndex]).width;
    for (const row of body) {
      const w = ctx.measureText(row[colIndex] || "").width;
      if (w > maxPixels) maxPixels = w;
    }
    const chars = maxPixels / zeroWidth;
    return Math.min(Math.max(Math.ceil(chars + 2), 10), 80);
  });

  worksheet.columns = columns.map((col, i) => ({
    key: col.id,
    header: col.id,
    width: colWidths[i],
  }));

  const headerRowExcel = worksheet.getRow(1);
  headerRowExcel.height = 24;
  headerRowExcel.eachCell((cell) => {
    cell.font = { bold: true };
    cell.alignment = { vertical: "middle" };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "f4f4f4" },
    };
  });

  body.forEach((rowArr) => {
    const row = worksheet.addRow(rowArr);
    row.height = 16;
    row.eachCell((cell) => {
      cell.alignment = { vertical: "middle" };
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), filename);
}
