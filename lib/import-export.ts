// Import Safety & Export Engine for MEMOIRE OS

export interface ImportValidationResult<T> {
  totalRows: number;
  validRows: T[];
  errorRows: { rowNumber: number; rawData: any; errorReason: string }[];
}

export function parseCSVText(csvText: string): Record<string, string>[] {
  const lines = csvText.split("\n").filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  const records: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || "";
    });
    records.push(row);
  }

  return records;
}

export function validateClientImportData(records: Record<string, string>[]): ImportValidationResult<any> {
  const validRows: any[] = [];
  const errorRows: { rowNumber: number; rawData: any; errorReason: string }[] = [];

  records.forEach((row, idx) => {
    const companyName = row["Company Name"] || row["companyName"] || row["Company"];
    const industry = row["Industry"] || row["industry"] || "General";
    const email = row["Email"] || row["email"];

    if (!companyName) {
      errorRows.push({ rowNumber: idx + 2, rawData: row, errorReason: "Missing required field: Company Name" });
    } else {
      validRows.push({
        id: `client-${Date.now()}-${idx}`,
        companyName,
        industry,
        website: row["Website"] || `https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.in`,
        location: row["Location"] || "India",
        status: "Active",
        primaryContact: {
          id: `cont-${Date.now()}-${idx}`,
          name: row["Contact Person"] || "Primary Contact",
          designation: "Key Representative",
          email: email || `contact@${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.in`,
          phone: row["Phone"] || "+91 98200 00000",
          isPrimary: true,
        },
        annualValue: Number(row["Annual Retainer"] || row["budget"] || 1200000),
        healthScore: 90,
        joinedDate: new Date().toISOString().split("T")[0],
      });
    }
  });

  return {
    totalRows: records.length,
    validRows,
    errorRows,
  };
}

export function generateErrorCSVDownload(errorRows: { rowNumber: number; rawData: any; errorReason: string }[]) {
  if (!errorRows.length) return;

  const csvContent = [
    "Row Number,Error Reason,Raw Data",
    ...errorRows.map((e) => `"${e.rowNumber}","${e.errorReason}","${JSON.stringify(e.rawData).replace(/"/g, '""')}"`),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `import_errors_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
