// Utility helper to export JSON arrays to CSV format and trigger browser download

export function exportToCSV<T extends Record<string, any>>(filename: string, rows: T[]) {
  if (!rows || !rows.length) return;

  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          let value = row[header];
          if (value === null || value === undefined) value = "";
          if (typeof value === "object") value = JSON.stringify(value);
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Re-export PDF & printable document builders
export {
  printDocument,
  downloadDocument,
  buildOfferLetterHTML,
  buildInvoiceHTML,
  buildClientReportHTML,
  buildEmployeeIDCardHTML,
  buildSalarySlipHTML,
  buildClientContractHTML,
  buildPaymentReceiptHTML,
  buildProposalHTML,
} from "./pdf-generator";


