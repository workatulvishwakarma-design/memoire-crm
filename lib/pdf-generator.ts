// ==============================================================================
// MEMOIRE CRM — HIGH FIDELITY PRINTABLE & PDF EXPORT GENERATOR
// ==============================================================================
// Provides pixel-perfect vector document generation using approved Memoire
// design standards (#F26722 branding, A4 styling, clean typography, tables).
// ==============================================================================

import { Client, Employee, Invoice, Project, Task, AttendanceRecord } from "@/types";
import { formatINR } from "@/lib/utils";

// Core print/PDF launcher utility
export function printDocument(htmlContent: string, documentTitle: string = "Memoire_Document") {
  if (typeof window === "undefined") return;

  const printWindow = window.open("", "_blank", "width=850,height=950");
  if (!printWindow) {
    alert("Please allow popups for this site to generate and print PDF documents.");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Give resources a tick to load before triggering native print dialog
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}

// Download HTML file helper
export function downloadDocument(htmlContent: string, filename: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.html`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Base printable CSS layout
const BASE_PRINT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
  
  @page {
    size: A4;
    margin: 14mm 16mm;
  }

  @media print {
    body {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      background-color: #ffffff !important;
    }
    .no-print {
      display: none !important;
    }
    .page-break {
      page-break-after: always;
    }
  }

  body {
    background: #f8fafc;
    color: #0f172a;
    font-size: 13px;
    line-height: 1.6;
    padding: 24px;
  }

  .document-container {
    max-width: 800px;
    margin: 0 auto;
    background: #ffffff;
    padding: 44px 48px;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    border: 1px solid #e2e8f0;
  }

  @media print {
    .document-container {
      box-shadow: none !important;
      border: none !important;
      padding: 0 !important;
      max-width: 100% !important;
    }
    body {
      padding: 0 !important;
    }
  }

  .primary-color {
    color: #F26722;
  }

  .bg-primary {
    background-color: #F26722;
  }

  .table-clean {
    width: 100%;
    border-collapse: collapse;
    margin-top: 16px;
    margin-bottom: 20px;
  }

  .table-clean th {
    background: #f8fafc;
    color: #475569;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.05em;
    font-weight: 700;
    padding: 10px 14px;
    border-bottom: 2px solid #e2e8f0;
    text-align: left;
  }

  .table-clean td {
    padding: 12px 14px;
    border-bottom: 1px solid #f1f5f9;
    color: #1e293b;
    font-size: 12px;
  }

  .badge {
    display: inline-block;
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 700;
    border-radius: 6px;
  }

  .badge-paid {
    background: #ecfdf5;
    color: #059669;
    border: 1px solid #a7f3d0;
  }

  .badge-pending {
    background: #fffbeb;
    color: #d97706;
    border: 1px solid #fde68a;
  }

  .badge-overdue {
    background: #fef2f2;
    color: #dc2626;
    border: 1px solid #fecaca;
  }

  .action-bar {
    max-width: 800px;
    margin: 0 auto 20px auto;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .action-btn {
    background: #F26722;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 10px;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    box-shadow: 0 2px 6px rgba(242,103,34,0.3);
  }

  .action-btn.secondary {
    background: #ffffff;
    color: #334155;
    border: 1px solid #cbd5e1;
    box-shadow: none;
  }
`;

// ==============================================================================
// 1. OFFER LETTER GENERATOR
// ==============================================================================
export interface OfferLetterDetails {
  employee: Employee;
  annualCtc?: number;
  probationMonths?: number;
  noticePeriodDays?: number;
  joiningDate?: string;
  reportingManager?: string;
  termsNotes?: string;
}

export function buildOfferLetterHTML(details: OfferLetterDetails): string {
  const { employee } = details;
  const ctc = details.annualCtc || 900000;
  const monthly = Math.round(ctc / 12);
  const basic = Math.round(monthly * 0.5);
  const hra = Math.round(monthly * 0.3);
  const specialAllowance = monthly - basic - hra;
  const todayFormatted = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const joiningDateFormatted = details.joiningDate || employee.joiningDate || "October 1, 2026";
  const refNo = `MEM/HR/OFFER/${new Date().getFullYear()}/${employee.employeeId || "001"}`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Offer Letter - ${employee.name} | Memoire Creative Agency</title>
  <style>${BASE_PRINT_CSS}</style>
</head>
<body>
  <div class="action-bar no-print">
    <button class="action-btn secondary" onclick="window.close()">Close Window</button>
    <button class="action-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="document-container">
    <!-- Header Letterhead -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #F26722; padding-bottom: 20px; margin-bottom: 24px;">
      <div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="background: #F26722; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 20px;">M</div>
          <div>
            <h1 style="font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em;">MEMOIRE</h1>
            <p style="font-size: 10px; font-weight: 800; color: #F26722; letter-spacing: 0.15em; text-transform: uppercase;">Creative Agency & Operating System</p>
          </div>
        </div>
      </div>
      <div style="text-align: right; font-size: 11px; color: #64748b;">
        <p style="font-weight: 700; color: #1e293b;">Memoire Creative Agency LLP</p>
        <p>Enterprise Brand & Digital Growth Systems</p>
        <p>Navi Mumbai, Maharashtra 400703</p>
        <p>connect@memoire.agency | www.memoire.agency</p>
      </div>
    </div>

    <!-- Letter Reference & Date -->
    <div style="display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 12px;">
      <div>
        <p style="color: #64748b;"><strong>Reference:</strong> <span style="font-family: monospace; color: #0f172a;">${refNo}</span></p>
      </div>
      <div>
        <p style="color: #64748b;"><strong>Date of Issuance:</strong> <span style="color: #0f172a;">${todayFormatted}</span></p>
      </div>
    </div>

    <!-- Candidate Info -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
      <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #F26722; letter-spacing: 0.05em; margin-bottom: 4px;">Candidate Details</p>
      <p style="font-size: 16px; font-weight: 800; color: #0f172a;">${employee.name}</p>
      <p style="font-size: 12px; color: #475569; margin-top: 2px;">
        ${employee.email} • ${employee.phone} • Location: ${employee.workLocation}
      </p>
    </div>

    <!-- Subject & Greeting -->
    <div style="margin-bottom: 20px;">
      <p style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 12px;">
        SUB: OFFER OF EMPLOYMENT AS ${employee.designation.toUpperCase()}
      </p>
      <p style="color: #334155; margin-bottom: 12px;">
        Dear <strong>${employee.name}</strong>,
      </p>
      <p style="color: #334155; line-height: 1.7; margin-bottom: 12px;">
        On behalf of <strong>Memoire Creative Agency LLP</strong>, we are pleased to extend this formal offer of employment for the position of <strong>${employee.designation}</strong> in the <strong>${employee.department}</strong> department. We were thoroughly impressed by your credentials, creative portfolio, and domain passion, and we are confident that you will play a pivotal role in delivering transformative brand experiences for our clients.
      </p>
    </div>

    <!-- Terms Summary Table -->
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px;">
        Key Terms of Employment
      </h3>
      <table class="table-clean" style="margin-top: 8px;">
        <tbody>
          <tr>
            <td style="width: 35%; font-weight: 700; color: #475569;">Designation & Role</td>
            <td style="font-weight: 600; color: #0f172a;">${employee.designation}</td>
          </tr>
          <tr>
            <td style="font-weight: 700; color: #475569;">Department</td>
            <td style="font-weight: 600; color: #0f172a;">${employee.department}</td>
          </tr>
          <tr>
            <td style="font-weight: 700; color: #475569;">Date of Joining</td>
            <td style="font-weight: 600; color: #0f172a;">${joiningDateFormatted}</td>
          </tr>
          <tr>
            <td style="font-weight: 700; color: #475569;">Work Location & Mode</td>
            <td style="font-weight: 600; color: #0f172a;">${employee.workLocation} (${employee.employmentStatus})</td>
          </tr>
          <tr>
            <td style="font-weight: 700; color: #475569;">Reporting Manager</td>
            <td style="font-weight: 600; color: #0f172a;">${details.reportingManager || employee.reportingManager || "Founder & Managing Director"}</td>
          </tr>
          <tr>
            <td style="font-weight: 700; color: #475569;">Probation Period</td>
            <td style="font-weight: 600; color: #0f172a;">${details.probationMonths || 3} Months from Date of Joining</td>
          </tr>
          <tr>
            <td style="font-weight: 700; color: #475569;">Working Hours</td>
            <td style="font-weight: 600; color: #0f172a;">Monday to Friday, 9:30 AM to 6:30 PM (IST)</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Compensation Annexure -->
    <div style="margin-bottom: 24px;">
      <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 12px;">
        Annexure A — Compensation Structure
      </h3>
      <table class="table-clean" style="margin-top: 8px;">
        <thead>
          <tr>
            <th>Salary Component</th>
            <th style="text-align: right;">Monthly (INR)</th>
            <th style="text-align: right;">Annual CTC (INR)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="font-weight: 600;">Basic Salary (50%)</td>
            <td style="text-align: right; font-family: monospace;">${formatINR(basic)}</td>
            <td style="text-align: right; font-family: monospace;">${formatINR(basic * 12)}</td>
          </tr>
          <tr>
            <td style="font-weight: 600;">House Rent Allowance (HRA - 30%)</td>
            <td style="text-align: right; font-family: monospace;">${formatINR(hra)}</td>
            <td style="text-align: right; font-family: monospace;">${formatINR(hra * 12)}</td>
          </tr>
          <tr>
            <td style="font-weight: 600;">Special / Performance Allowance</td>
            <td style="text-align: right; font-family: monospace;">${formatINR(specialAllowance)}</td>
            <td style="text-align: right; font-family: monospace;">${formatINR(specialAllowance * 12)}</td>
          </tr>
          <tr style="background: #fff7ed; font-weight: 800; border-top: 2px solid #fdba74;">
            <td style="color: #9a3412;">Total Cost to Company (CTC)</td>
            <td style="text-align: right; font-family: monospace; color: #c2410c;">${formatINR(monthly)}</td>
            <td style="text-align: right; font-family: monospace; color: #c2410c; font-size: 14px;">${formatINR(ctc)}</td>
          </tr>
        </tbody>
      </table>
      <p style="font-size: 11px; color: #64748b; font-style: italic;">* Statutory deductions like Professional Tax and TDS will apply per prevailing government guidelines.</p>
    </div>

    <!-- Standard Clauses -->
    <div style="margin-bottom: 32px; font-size: 11.5px; color: #475569; line-height: 1.6;">
      <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px;">
        General Policies & Obligations
      </h3>
      <p style="margin-bottom: 6px;"><strong>Leave Policy:</strong> You will be entitled to ${employee.leaveBalance.casual || 12} days Casual Leave, ${employee.leaveBalance.sick || 8} days Sick Leave, and ${employee.leaveBalance.earned || 15} days Earned Leave per fiscal year upon completion of probation.</p>
      <p style="margin-bottom: 6px;"><strong>Confidentiality & IP Rights:</strong> All proprietary design assets, client data, CRM records, campaign code, and intellectual works created during your tenure remain the exclusive property of Memoire Creative Agency and client partners.</p>
      <p style="margin-bottom: 6px;"><strong>Notice Period:</strong> Following successful probation confirmation, either party may terminate employment by giving ${details.noticePeriodDays || 30} days written notice or gross salary in lieu thereof.</p>
    </div>

    <!-- Signatures -->
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
      <div>
        <p style="font-size: 13px; font-weight: 800; color: #0f172a;">For Memoire Creative Agency LLP</p>
        <div style="margin: 20px 0 10px 0; height: 40px; border-bottom: 1px dashed #94a3b8; width: 180px;"></div>
        <p style="font-size: 12px; font-weight: 700; color: #1e293b;">Authorized Signatory</p>
        <p style="font-size: 11px; color: #64748b;">Human Resources & Operations</p>
      </div>

      <div style="text-align: right;">
        <p style="font-size: 13px; font-weight: 800; color: #0f172a;">Candidate Acceptance</p>
        <div style="margin: 20px 0 10px auto; height: 40px; border-bottom: 1px dashed #94a3b8; width: 180px;"></div>
        <p style="font-size: 12px; font-weight: 700; color: #1e293b;">${employee.name}</p>
        <p style="font-size: 11px; color: #64748b;">Date: ________________________</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// ==============================================================================
// 2. INVOICE PDF GENERATOR
// ==============================================================================
export interface InvoiceDetails {
  invoice: Invoice;
  client?: Client;
  items?: { description: string; quantity: number; rate: number; amount: number }[];
  taxRate?: number; // e.g. 18 for 18% GST
  notes?: string;
  paymentTerms?: string;
}

export function buildInvoiceHTML(details: InvoiceDetails): string {
  const { invoice, client } = details;
  const items = details.items || [
    {
      description: `${invoice.projectName || "Agency Retainer & Creative Services"} — Q3 Campaign Deliverables`,
      quantity: 1,
      rate: invoice.amount,
      amount: invoice.amount,
    },
  ];

  const subtotal = items.reduce((acc, it) => acc + it.amount, 0);
  const taxRate = details.taxRate ?? 18;
  const taxAmount = Math.round((subtotal * taxRate) / 100);
  const grandTotal = subtotal + taxAmount;

  const statusBadge =
    invoice.status === "Paid"
      ? `<span class="badge badge-paid">PAID IN FULL</span>`
      : invoice.status === "Overdue"
      ? `<span class="badge badge-overdue">OVERDUE</span>`
      : `<span class="badge badge-pending">PAYMENT PENDING</span>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice - ${invoice.invoiceNumber} | Memoire Creative Agency</title>
  <style>${BASE_PRINT_CSS}</style>
</head>
<body>
  <div class="action-bar no-print">
    <button class="action-btn secondary" onclick="window.close()">Close Window</button>
    <button class="action-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="document-container">
    <!-- Header Letterhead -->
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #F26722; padding-bottom: 20px; margin-bottom: 24px;">
      <div>
        <div style="display: flex; align-items: center; gap: 10px;">
          <div style="background: #F26722; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 20px;">M</div>
          <div>
            <h1 style="font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em;">MEMOIRE</h1>
            <p style="font-size: 10px; font-weight: 800; color: #F26722; letter-spacing: 0.15em; text-transform: uppercase;">Creative Agency & Operating System</p>
          </div>
        </div>
        <div style="margin-top: 14px; font-size: 11px; color: #64748b;">
          <p><strong>GSTIN:</strong> 27AABCM8920C1Z4</p>
          <p><strong>PAN:</strong> AABCM8920C</p>
        </div>
      </div>

      <div style="text-align: right;">
        <h2 style="font-size: 24px; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; margin-bottom: 4px;">TAX INVOICE</h2>
        <p style="font-family: monospace; font-size: 14px; font-weight: 800; color: #F26722;">${invoice.invoiceNumber}</p>
        <div style="margin-top: 8px;">${statusBadge}</div>
      </div>
    </div>

    <!-- Metadata Grid: Bill From / Bill To / Dates -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 28px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px;">
        <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #F26722; letter-spacing: 0.05em; margin-bottom: 6px;">Billed To (Client)</p>
        <p style="font-size: 15px; font-weight: 800; color: #0f172a;">${invoice.clientName}</p>
        ${client ? `
          <p style="font-size: 12px; color: #475569; margin-top: 2px;">Attn: ${client.primaryContact?.name || "Accounts Payable"} (${client.primaryContact?.designation || "Director"})</p>
          <p style="font-size: 12px; color: #475569;">${client.primaryContact?.email || ""} • ${client.primaryContact?.phone || ""}</p>
          <p style="font-size: 12px; color: #475569;">Location: ${client.location || "Mumbai, India"}</p>
        ` : `
          <p style="font-size: 12px; color: #475569; margin-top: 2px;">Project: ${invoice.projectName}</p>
        `}
      </div>

      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #F26722; letter-spacing: 0.05em; margin-bottom: 6px;">Billing Particulars</p>
          <p style="font-size: 12px; color: #475569; margin-bottom: 3px;"><strong>Issue Date:</strong> ${invoice.issueDate}</p>
          <p style="font-size: 12px; color: #475569; margin-bottom: 3px;"><strong>Due Date:</strong> ${invoice.dueDate}</p>
          <p style="font-size: 12px; color: #475569;"><strong>Payment Terms:</strong> ${details.paymentTerms || "Net 15 Days"}</p>
        </div>
      </div>
    </div>

    <!-- Line Items Table -->
    <table class="table-clean">
      <thead>
        <tr>
          <th style="width: 50%;">Service Description</th>
          <th style="text-align: center; width: 10%;">Qty</th>
          <th style="text-align: right; width: 20%;">Rate (INR)</th>
          <th style="text-align: right; width: 20%;">Total (INR)</th>
        </tr>
      </thead>
      <tbody>
        ${items.map(it => `
          <tr>
            <td>
              <p style="font-weight: 700; color: #0f172a;">${it.description}</p>
              <p style="font-size: 11px; color: #64748b;">Creative design, campaign assets & agency deliverables</p>
            </td>
            <td style="text-align: center; font-weight: 600;">${it.quantity}</td>
            <td style="text-align: right; font-family: monospace;">${formatINR(it.rate)}</td>
            <td style="text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">${formatINR(it.amount)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <!-- Totals Section -->
    <div style="display: flex; justify-content: flex-end; margin-bottom: 28px;">
      <div style="width: 320px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
          <span style="color: #64748b; font-weight: 600;">Subtotal</span>
          <span style="font-family: monospace; font-weight: 700; color: #0f172a;">${formatINR(subtotal)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 8px;">
          <span style="color: #64748b; font-weight: 600;">Integrated GST (${taxRate}%)</span>
          <span style="font-family: monospace; font-weight: 700; color: #0f172a;">${formatINR(taxAmount)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: 900; border-top: 2px solid #F26722; padding-top: 10px; margin-top: 10px; color: #F26722;">
          <span>Grand Total</span>
          <span style="font-family: monospace;">${formatINR(grandTotal)}</span>
        </div>
      </div>
    </div>

    <!-- Wire & Bank Transfer Details -->
    <div style="background: #fff7ed; border: 1px solid #ffedd5; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px;">
      <p style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #c2410c; letter-spacing: 0.05em; margin-bottom: 6px;">Remittance & Bank Transfer Details</p>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 12px; color: #334155;">
        <div>
          <p><strong>Account Name:</strong> Memoire Creative Agency LLP</p>
          <p><strong>Bank Name:</strong> HDFC Bank Ltd</p>
          <p><strong>Account Number:</strong> 50200084920194</p>
        </div>
        <div>
          <p><strong>Branch IFSC Code:</strong> HDFC0001024</p>
          <p><strong>UPI ID:</strong> memoire.agency@hdfcbank</p>
          <p><strong>Account Type:</strong> Current Account</p>
        </div>
      </div>
    </div>

    <!-- Signatory & Terms -->
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
      <div style="font-size: 11px; color: #64748b; max-width: 440px;">
        <p><strong>Terms & Conditions:</strong></p>
        <p>1. Please quote the Invoice Number on wire transfers and remittances.</p>
        <p>2. Payment is due on or before the specified Due Date.</p>
        <p>3. This is an official digital agency invoice generated via Memoire OS.</p>
      </div>

      <div style="text-align: right;">
        <p style="font-size: 12px; font-weight: 800; color: #0f172a;">For Memoire Creative Agency LLP</p>
        <div style="margin: 20px 0 8px auto; height: 36px; border-bottom: 1px dashed #94a3b8; width: 160px;"></div>
        <p style="font-size: 11px; font-weight: 700; color: #1e293b;">Authorized Signatory</p>
        <p style="font-size: 10px; color: #64748b;">Finance & Accounts</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// ==============================================================================
// 3. CLIENT DOSSIER & PERFORMANCE REPORT PDF GENERATOR
// ==============================================================================
export function buildClientReportHTML(
  client: Client,
  projects: Project[],
  tasks: Task[],
  invoices: Invoice[]
): string {
  const clientProjects = projects.filter((p) => p.clientId === client.id || p.clientName === client.companyName);
  const clientTasks = tasks.filter((t) => t.clientName === client.companyName);
  const clientInvoices = invoices.filter((i) => i.clientName === client.companyName);
  const totalBilled = clientInvoices.reduce((a, b) => a + b.amount, 0);
  const totalPaid = clientInvoices.filter((i) => i.status === "Paid").reduce((a, b) => a + b.amount, 0);

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Client Executive Dossier - ${client.companyName} | Memoire CRM</title>
  <style>${BASE_PRINT_CSS}</style>
</head>
<body>
  <div class="action-bar no-print">
    <button class="action-btn secondary" onclick="window.close()">Close Window</button>
    <button class="action-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="document-container">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #F26722; padding-bottom: 20px; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 22px; font-weight: 900; color: #0f172a;">${client.companyName}</h1>
        <p style="font-size: 11px; font-weight: 800; color: #F26722; text-transform: uppercase;">Client Dossier & Delivery Audit Report</p>
        <p style="font-size: 12px; color: #64748b; margin-top: 4px;">${client.industry} • ${client.location} • ${client.website}</p>
      </div>
      <div style="text-align: right; font-size: 11px; color: #64748b;">
        <p><strong>Health Score:</strong> <span style="color: #059669; font-weight: 800;">${client.healthScore}%</span></p>
        <p><strong>Account Manager:</strong> ${client.accountManager}</p>
        <p><strong>Assigned BDM:</strong> ${client.bdm}</p>
      </div>
    </div>

    <!-- Metrics -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 24px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
        <p style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Annual Value</p>
        <p style="font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 2px;">${formatINR(client.annualValue)}</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
        <p style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Active Projects</p>
        <p style="font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 2px;">${clientProjects.length}</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
        <p style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Total Billed</p>
        <p style="font-size: 16px; font-weight: 900; color: #0f172a; margin-top: 2px;">${formatINR(totalBilled)}</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px;">
        <p style="font-size: 10px; font-weight: 700; color: #64748b; text-transform: uppercase;">Collected Revenue</p>
        <p style="font-size: 16px; font-weight: 900; color: #059669; margin-top: 2px;">${formatINR(totalPaid)}</p>
      </div>
    </div>

    <!-- Active Projects Table -->
    <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-bottom: 8px;">Active Project Engagements</h3>
    <table class="table-clean">
      <thead>
        <tr>
          <th>Project</th>
          <th>Service Category</th>
          <th>Project Manager</th>
          <th>Status</th>
          <th style="text-align: right;">Progress</th>
        </tr>
      </thead>
      <tbody>
        ${clientProjects.map(p => `
          <tr>
            <td style="font-weight: 700;">${p.name}</td>
            <td>${p.serviceCategory}</td>
            <td>${p.projectManager}</td>
            <td>${p.status}</td>
            <td style="text-align: right; font-weight: 800; color: #059669;">${p.progress}%</td>
          </tr>
        `).join("")}
        ${clientProjects.length === 0 ? `<tr><td colspan="5" style="text-align: center; color: #94a3b8;">No projects registered for this client.</td></tr>` : ""}
      </tbody>
    </table>

    <!-- Billing Ledger -->
    <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-top: 20px; margin-bottom: 8px;">Billing & Invoice Records</h3>
    <table class="table-clean">
      <thead>
        <tr>
          <th>Invoice #</th>
          <th>Project</th>
          <th>Issue Date</th>
          <th>Due Date</th>
          <th>Status</th>
          <th style="text-align: right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${clientInvoices.map(i => `
          <tr>
            <td style="font-family: monospace; font-weight: 700;">${i.invoiceNumber}</td>
            <td>${i.projectName}</td>
            <td>${i.issueDate}</td>
            <td>${i.dueDate}</td>
            <td>${i.status}</td>
            <td style="text-align: right; font-family: monospace; font-weight: 800;">${formatINR(i.amount)}</td>
          </tr>
        `).join("")}
        ${clientInvoices.length === 0 ? `<tr><td colspan="6" style="text-align: center; color: #94a3b8;">No billing records found.</td></tr>` : ""}
      </tbody>
    </table>
  </div>
</body>
</html>
  `;
}

// ==============================================================================
// 4. EMPLOYEE ID CARD GENERATOR
// ==============================================================================
export function buildEmployeeIDCardHTML(employee: Employee): string {
  const blood = employee.bloodGroup || "O+";
  const emergencyPhone = employee.emergencyContact?.phone || employee.phone;
  const emergencyName = employee.emergencyContact?.name || "Immediate Family";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>ID Card - ${employee.name} | Memoire Creative Agency</title>
  <style>
    ${BASE_PRINT_CSS}
    .badge-card {
      width: 320px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      border: 2px solid #e2e8f0;
      text-align: center;
    }
    .badge-header {
      background: linear-gradient(135deg, #F26722 0%, #d95514 100%);
      color: white;
      padding: 24px 16px 20px 16px;
    }
    .badge-photo {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 4px solid #ffffff;
      margin: -45px auto 12px auto;
      object-fit: cover;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      background: #f1f5f9;
    }
  </style>
</head>
<body>
  <div class="action-bar no-print">
    <button class="action-btn secondary" onclick="window.close()">Close</button>
    <button class="action-btn" onclick="window.print()">Print ID Card Badge</button>
  </div>

  <div class="badge-card">
    <div class="badge-header">
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
        <div style="background: white; color: #F26722; font-weight: 900; width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 16px;">M</div>
        <div style="text-align: left;">
          <h2 style="font-size: 14px; font-weight: 900; letter-spacing: 0.05em; line-height: 1;">MEMOIRE</h2>
          <span style="font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.9;">CREATIVE AGENCY</span>
        </div>
      </div>
    </div>

    <!-- Photo -->
    <img src="${employee.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}" alt="${employee.name}" class="badge-photo" />

    <div style="padding: 0 20px 20px 20px;">
      <h3 style="font-size: 16px; font-weight: 900; color: #0f172a;">${employee.name}</h3>
      <p style="font-size: 11px; font-weight: 700; color: #F26722; margin-top: 2px;">${employee.designation}</p>
      <span style="display: inline-block; margin-top: 6px; padding: 2px 8px; background: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; font-size: 10px; font-weight: 800; border-radius: 6px; font-family: monospace;">
        ${employee.employeeId}
      </span>

      <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid #f1f5f9; text-align: left; font-size: 10.5px; color: #475569; space-y: 6px;">
        <p style="margin-bottom: 4px;"><strong>Department:</strong> <span style="float: right; color: #0f172a;">${employee.department}</span></p>
        <p style="margin-bottom: 4px;"><strong>Blood Group:</strong> <span style="float: right; color: #e11d48; font-weight: 800;">${blood}</span></p>
        <p style="margin-bottom: 4px;"><strong>Work Mode:</strong> <span style="float: right; color: #0f172a;">${employee.workLocation}</span></p>
        <p style="margin-bottom: 4px;"><strong>Emergency Contact:</strong> <span style="float: right; color: #0f172a;">${emergencyPhone}</span></p>
      </div>

      <!-- Barcode simulation -->
      <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
        <div style="height: 24px; background: repeating-linear-gradient(90deg, #0f172a, #0f172a 2px, transparent 2px, transparent 4px, #0f172a 4px, #0f172a 6px, transparent 6px, transparent 7px); width: 70%; margin: 0 auto;"></div>
        <p style="font-size: 8px; font-family: monospace; color: #94a3b8; margin-top: 4px;">OFFICIAL AUTHORIZED CREDENTIAL</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// ==============================================================================
// 5. SALARY SLIP GENERATOR
// ==============================================================================
export function buildSalarySlipHTML(employee: Employee, month: string = "September", year: number = 2026): string {
  const annualCtc = employee.salary?.annualCtc || 960000;
  const monthlyGross = Math.round(annualCtc / 12);
  const basic = employee.salary?.basic || Math.round(monthlyGross * 0.5);
  const hra = employee.salary?.hra || Math.round(monthlyGross * 0.3);
  const special = employee.salary?.specialAllowance || (monthlyGross - basic - hra);
  
  // Deductions
  const pf = Math.min(1800, Math.round(basic * 0.12));
  const pt = 200;
  const totalDeductions = pf + pt;
  const netPay = monthlyGross - totalDeductions;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Payslip - ${employee.name} (${month} ${year}) | Memoire CRM</title>
  <style>${BASE_PRINT_CSS}</style>
</head>
<body>
  <div class="action-bar no-print">
    <button class="action-btn secondary" onclick="window.close()">Close</button>
    <button class="action-btn" onclick="window.print()">Print Payslip</button>
  </div>

  <div class="document-container">
    <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #F26722; padding-bottom: 16px; margin-bottom: 20px;">
      <div>
        <h1 style="font-size: 20px; font-weight: 900; color: #0f172a;">MEMOIRE CREATIVE AGENCY LLP</h1>
        <p style="font-size: 11px; font-weight: 800; color: #F26722; text-transform: uppercase;">Monthly Salary Slip & Earnings Statement</p>
      </div>
      <div style="text-align: right; font-size: 12px;">
        <p style="font-weight: 800; color: #0f172a;">Period: ${month} ${year}</p>
        <p style="color: #64748b; font-size: 11px;">Pay Date: 30 ${month} ${year}</p>
      </div>
    </div>

    <!-- Employee Particulars -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 20px; font-size: 11.5px;">
      <div>
        <p><strong>Employee Name:</strong> ${employee.name}</p>
        <p style="margin-top: 4px;"><strong>Employee ID:</strong> <span style="font-family: monospace;">${employee.employeeId}</span></p>
        <p style="margin-top: 4px;"><strong>Department:</strong> ${employee.department}</p>
        <p style="margin-top: 4px;"><strong>Designation:</strong> ${employee.designation}</p>
      </div>
      <div>
        <p><strong>Bank Account:</strong> ${employee.bankDetails?.accountNumber ? `•••• ${employee.bankDetails.accountNumber.slice(-4)}` : "Registered Payroll Bank"}</p>
        <p style="margin-top: 4px;"><strong>PAN Number:</strong> ${employee.bankDetails?.pan || "AABCM8920C"}</p>
        <p style="margin-top: 4px;"><strong>Days Payable:</strong> 30 Days</p>
        <p style="margin-top: 4px;"><strong>Work Mode:</strong> ${employee.workLocation}</p>
      </div>
    </div>

    <!-- Earnings & Deductions Grid -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
      <div>
        <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">Earnings (INR)</h3>
        <table class="table-clean" style="margin: 0;">
          <tbody>
            <tr><td>Basic Salary</td><td style="text-align: right; font-family: monospace;">${formatINR(basic)}</td></tr>
            <tr><td>House Rent Allowance (HRA)</td><td style="text-align: right; font-family: monospace;">${formatINR(hra)}</td></tr>
            <tr><td>Special Allowance</td><td style="text-align: right; font-family: monospace;">${formatINR(special)}</td></tr>
            <tr style="font-weight: 800; background: #f8fafc;"><td>Gross Earnings</td><td style="text-align: right; font-family: monospace; color: #059669;">${formatINR(monthlyGross)}</td></tr>
          </tbody>
        </table>
      </div>

      <div>
        <h3 style="font-size: 12px; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px;">Deductions (INR)</h3>
        <table class="table-clean" style="margin: 0;">
          <tbody>
            <tr><td>Provident Fund (PF)</td><td style="text-align: right; font-family: monospace;">${formatINR(pf)}</td></tr>
            <tr><td>Professional Tax (PT)</td><td style="text-align: right; font-family: monospace;">${formatINR(pt)}</td></tr>
            <tr><td>Income Tax / TDS</td><td style="text-align: right; font-family: monospace;">₹0</td></tr>
            <tr style="font-weight: 800; background: #f8fafc;"><td>Total Deductions</td><td style="text-align: right; font-family: monospace; color: #dc2626;">${formatINR(totalDeductions)}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Net Pay Summary -->
    <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 12px; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #9a3412;">Net Remittance Amount</span>
        <p style="font-size: 20px; font-weight: 900; color: #c2410c; margin-top: 2px;">${formatINR(netPay)}</p>
      </div>
      <div style="text-align: right; font-size: 11px; color: #64748b;">
        <p>Transfer Status: <strong style="color: #059669;">PROCESSED</strong></p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// ==============================================================================
// 6. CLIENT CONTRACT & PROPOSAL GENERATOR
// ==============================================================================
export function buildClientContractHTML(client: Client, projectTitle: string = "Brand Strategy & Campaign Retainer"): string {
  const refNo = `MEM/MSA/${new Date().getFullYear()}/${client.companyName.replace(/[^A-Z]/gi, "").slice(0, 4).toUpperCase()}-01`;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Master Services Agreement - ${client.companyName} | Memoire</title>
  <style>${BASE_PRINT_CSS}</style>
</head>
<body>
  <div class="action-bar no-print">
    <button class="action-btn secondary" onclick="window.close()">Close</button>
    <button class="action-btn" onclick="window.print()">Print Agreement</button>
  </div>

  <div class="document-container">
    <div style="border-bottom: 2px solid #F26722; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="font-size: 20px; font-weight: 900; color: #0f172a;">MASTER SERVICES AGREEMENT</h1>
        <p style="font-size: 11px; font-weight: 800; color: #F26722; text-transform: uppercase;">Agency Client Service Engagement</p>
      </div>
      <div style="text-align: right; font-size: 11px; color: #64748b;">
        <p><strong>Ref:</strong> ${refNo}</p>
        <p><strong>Effective Date:</strong> ${client.joinedDate || new Date().toISOString().split("T")[0]}</p>
      </div>
    </div>

    <p style="margin-bottom: 16px;">This Agreement is executed between <strong>Memoire Creative Agency LLP</strong> ("Agency") and <strong>${client.companyName}</strong> ("Client").</p>

    <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px;">1. Scope of Engagement</h3>
    <p style="margin-bottom: 12px; font-size: 12px; color: #334155;">Agency agrees to provide strategic branding, design, technology, and campaign execution services as contracted under project: <strong>${projectTitle}</strong>.</p>

    <h3 style="font-size: 13px; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 10px;">2. Commercial Consideration</h3>
    <p style="margin-bottom: 12px; font-size: 12px; color: #334155;">Client agrees to pay the annual retainer consideration of <strong>${formatINR(client.annualValue)}</strong> subject to billing milestones and net payment terms.</p>

    <div style="display: flex; justify-content: space-between; margin-top: 48px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
      <div>
        <p style="font-weight: 800; font-size: 12px;">For Memoire Creative Agency</p>
        <div style="margin: 30px 0 10px 0; border-bottom: 1px dashed #94a3b8; width: 180px;"></div>
        <p style="font-size: 11px; color: #64748b;">Authorized Signatory</p>
      </div>
      <div style="text-align: right;">
        <p style="font-weight: 800; font-size: 12px;">For ${client.companyName}</p>
        <div style="margin: 30px 0 10px auto; border-bottom: 1px dashed #94a3b8; width: 180px;"></div>
        <p style="font-size: 11px; color: #64748b;">Authorized Signatory</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

// ==============================================================================
// 7. PAYMENT RECEIPT GENERATOR
// ==============================================================================
export function buildPaymentReceiptHTML(payment: {
  receiptId: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  date: string;
  method: string;
  referenceNumber: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Payment Receipt - ${payment.receiptId} | Memoire CRM</title>
  <style>${BASE_PRINT_CSS}</style>
</head>
<body>
  <div class="action-bar no-print">
    <button class="action-btn secondary" onclick="window.close()">Close</button>
    <button class="action-btn" onclick="window.print()">Print Receipt</button>
  </div>

  <div class="document-container">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #F26722; padding-bottom: 16px; margin-bottom: 20px;">
      <div>
        <h1 style="font-size: 20px; font-weight: 900; color: #0f172a;">MEMOIRE CREATIVE AGENCY</h1>
        <p style="font-size: 11px; font-weight: 800; color: #059669; text-transform: uppercase;">Official Payment Acknowledgment Receipt</p>
      </div>
      <div style="text-align: right;">
        <p style="font-family: monospace; font-size: 14px; font-weight: 800; color: #F26722;">${payment.receiptId}</p>
        <p style="font-size: 11px; color: #64748b;">Date: ${payment.date}</p>
      </div>
    </div>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 20px; font-size: 12px;">
      <p style="margin-bottom: 6px;">Received with thanks from: <strong>${payment.clientName}</strong></p>
      <p style="margin-bottom: 6px;">Towards Settlement of Invoice: <strong>${payment.invoiceNumber}</strong></p>
      <p style="margin-bottom: 6px;">Payment Method: <strong>${payment.method}</strong></p>
      <p>Bank Reference / UTR Number: <strong style="font-family: monospace;">${payment.referenceNumber}</strong></p>
    </div>

    <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px 20px; text-align: center;">
      <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #065f46;">Amount Received</span>
      <p style="font-size: 24px; font-weight: 900; color: #059669; margin-top: 2px;">${formatINR(payment.amount)}</p>
    </div>
  </div>
</body>
</html>
  `;
}

// ==============================================================================
// 8. COMMERCIAL PROPOSAL / QUOTATION GENERATOR
// ==============================================================================
export function buildProposalHTML(proposal: {
  proposalNumber: string;
  client: Client;
  title: string;
  scopeItems: { description: string; timeline: string; price: number }[];
  validUntil: string;
  terms: string;
}): string {
  const subtotal = proposal.scopeItems.reduce((sum, item) => sum + item.price, 0);
  const gst = Math.round(subtotal * 0.18);
  const total = subtotal + gst;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Commercial Proposal - ${proposal.proposalNumber} | Memoire CRM</title>
  <style>${BASE_PRINT_CSS}</style>
</head>
<body>
  <div class="action-bar no-print">
    <button class="action-btn secondary" onclick="window.close()">Close</button>
    <button class="action-btn" onclick="window.print()">Print Proposal</button>
  </div>

  <div class="document-container">
    <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #F26722; padding-bottom: 16px; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 20px; font-weight: 900; color: #0f172a;">MEMOIRE CREATIVE AGENCY LLP</h1>
        <p style="font-size: 11px; font-weight: 800; color: #F26722; text-transform: uppercase;">Commercial Proposal & Scope of Work</p>
      </div>
      <div style="text-align: right; font-size: 11px;">
        <p style="font-family: monospace; font-size: 13px; font-weight: 800; color: #F26722;">${proposal.proposalNumber}</p>
        <p style="color: #64748b; margin-top: 2px;">Date: ${new Date().toISOString().split("T")[0]}</p>
        <p style="color: #64748b;">Valid Until: ${proposal.validUntil}</p>
      </div>
    </div>

    <!-- Prepared For -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; margin-bottom: 24px;">
      <span style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">Prepared Exclusively For</span>
      <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin-top: 4px;">${proposal.client.companyName}</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 10px; font-size: 11.5px; color: #334155;">
        <p><strong>Primary Contact:</strong> ${proposal.client.primaryContact?.name || proposal.client.companyName} (${proposal.client.primaryContact?.email || "N/A"})</p>
        <p><strong>Phone:</strong> ${proposal.client.primaryContact?.phone || "N/A"}</p>
        <p><strong>Industry:</strong> ${proposal.client.industry}</p>
        <p><strong>GSTIN:</strong> ${proposal.client.taxInfo?.gstin || "N/A"}</p>
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <h3 style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 6px;">Project: ${proposal.title}</h3>
      <p style="font-size: 12px; color: #475569;">Detailed breakdown of deliverables, creative execution scope, timelines, and investment.</p>
    </div>

    <!-- Scope Items Table -->
    <table class="table-clean" style="margin-bottom: 24px;">
      <thead>
        <tr>
          <th style="width: 50px;">#</th>
          <th>Deliverable & Scope Description</th>
          <th style="width: 120px;">Timeline</th>
          <th style="width: 140px; text-align: right;">Investment (INR)</th>
        </tr>
      </thead>
      <tbody>
        ${proposal.scopeItems
          .map(
            (item, index) => `
          <tr>
            <td style="color: #94a3b8; font-weight: 700;">${index + 1}</td>
            <td>
              <strong style="color: #0f172a;">${item.description}</strong>
            </td>
            <td style="font-size: 11px; color: #475569;">${item.timeline}</td>
            <td style="text-align: right; font-family: monospace; font-weight: 700; color: #0f172a;">${formatINR(item.price)}</td>
          </tr>
        `
          )
          .join("")}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="3" style="text-align: right; font-weight: 700; color: #475569;">Subtotal:</td>
          <td style="text-align: right; font-family: monospace; font-weight: 800; color: #0f172a;">${formatINR(subtotal)}</td>
        </tr>
        <tr>
          <td colspan="3" style="text-align: right; font-weight: 700; color: #475569;">Applicable GST (18%):</td>
          <td style="text-align: right; font-family: monospace; font-weight: 800; color: #0f172a;">${formatINR(gst)}</td>
        </tr>
        <tr style="background: #fff7ed; font-size: 13px;">
          <td colspan="3" style="text-align: right; font-weight: 900; color: #c2410c;">Total Proposed Investment:</td>
          <td style="text-align: right; font-family: monospace; font-weight: 900; color: #c2410c;">${formatINR(total)}</td>
        </tr>
      </tfoot>
    </table>

    <!-- Commercial Terms -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin-bottom: 28px; font-size: 11.5px; color: #334155;">
      <h4 style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #0f172a; margin-bottom: 6px;">Commercial Terms & Milestones</h4>
      <p style="line-height: 1.6;">${proposal.terms || "50% advance mobilization advance upon approval; remaining 50% upon final delivery sign-off. Revisions include up to 2 creative revision rounds."}</p>
    </div>

    <!-- Signatures -->
    <div style="display: flex; justify-content: space-between; margin-top: 36px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
      <div>
        <p style="font-weight: 800; font-size: 12px;">For Memoire Creative Agency LLP</p>
        <div style="margin: 32px 0 10px 0; border-bottom: 1px dashed #94a3b8; width: 180px;"></div>
        <p style="font-size: 11px; color: #64748b;">Managing Director / Partner</p>
      </div>
      <div style="text-align: right;">
        <p style="font-weight: 800; font-size: 12px;">Accepted & Approved by ${proposal.client.companyName}</p>
        <div style="margin: 32px 0 10px auto; border-bottom: 1px dashed #94a3b8; width: 180px;"></div>
        <p style="font-size: 11px; color: #64748b;">Authorized Signatory</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
}

