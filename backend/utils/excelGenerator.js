import ExcelJS from "exceljs";

/**
 * Generates an Excel workbook and streams it to the response
 * @param {Object} options - Options for generation
 * @param {Array} options.data - Array of objects to export
 * @param {Array} options.columns - Column definitions { header, key, width }
 * @param {String} options.sheetName - Name of the worksheet
 * @param {Object} options.res - Express response object
 * @param {String} options.fileName - Name of the file to download
 */
export const exportToExcel = async ({
  data,
  columns,
  sheetName = "Sheet1",
  res,
  fileName = "export.xlsx",
}) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(sheetName);

    worksheet.columns = columns;

    // Add rows
    worksheet.addRows(data);

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4F46E5" }, // Indigo-600
    };
    headerRow.alignment = { vertical: "middle", horizontal: "center" };
    headerRow.height = 25;

    // Auto-filter for all columns
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columns.length },
    };

    // Border for all cells
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });
    });

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${fileName}`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Excel Generation Error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to generate Excel file" });
    }
  }
};
