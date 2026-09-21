// Dynamic Variable Document Generator for HR & Commercial Templates in MEMOIRE OS

export interface DocumentVariableMap {
  [key: string]: string | number | boolean | undefined;
}

export interface DocumentTemplateConfig {
  title: string;
  category: "HR" | "COMMERCIAL" | "REPORT";
  templateText: string;
}

export const DOCUMENT_TEMPLATES: Record<string, DocumentTemplateConfig> = {
  OFFER_LETTER: {
    title: "Employment Offer Letter",
    category: "HR",
    templateText: `
MEMOIRE — CRAFTING BRANDS
Navi Mumbai Office • Commercial Tower 4, Belapur, MH

OFFER OF EMPLOYMENT

Date: {{document.date}}
Doc Ref: {{document.number}}

To,
{{employee.firstName}} {{employee.lastName}}
Email: {{employee.email}}
Phone: {{employee.phone}}

Dear {{employee.firstName}},

We are pleased to offer you the position of {{employee.designation}} in the {{employee.department}} Department at MEMOIRE.

1. Joining Date: {{employee.joiningDate}}
2. Annual Compensation: {{employee.salary}}
3. Work Location: {{employee.workLocation}}
4. Reporting Manager: {{employee.manager}}

Please sign and return the duplicate copy of this letter as token of your acceptance.

Warm regards,

Rahul Sharma
Founder & CEO, MEMOIRE
    `,
  },
  CLIENT_PROPOSAL: {
    title: "Agency Commercial Proposal",
    category: "COMMERCIAL",
    templateText: `
MEMOIRE — CRAFTING BRANDS
BRAND & DIGITAL AGENCY PROPOSAL

Proposal Reference: {{document.number}}
Date: {{document.date}}

PREPARED FOR:
Client: {{client.companyName}}
Contact: {{client.contactName}}
Email: {{client.email}}

PROJECT SCOPE:
Service Vertical: {{proposal.serviceCategory}}
Scope: {{proposal.scope}}

COMMERCIAL TERMS:
Total Retainer / Project Fee: {{proposal.amount}}
Payment Terms: 50% Advance, 50% on Milestone Completion

Accepted & Agreed by Client Representative:

Signature: ______________________
Date: _________________________
    `,
  },
  EXPERIENCE_LETTER: {
    title: "Experience & Relieving Certificate",
    category: "HR",
    templateText: `
MEMOIRE — CRAFTING BRANDS

EXPERIENCE CERTIFICATE

Date: {{document.date}}
Doc Ref: {{document.number}}

TO WHOMSOEVER IT MAY CONCERN

This is to certify that {{employee.firstName}} {{employee.lastName}} was employed with MEMOIRE from {{employee.joiningDate}} to {{employee.relievingDate}} as {{employee.designation}} in the {{employee.department}} department.

During their tenure with us, we found them to be hardworking, dedicated, and professional. We wish them all the success in their future endeavors.

For MEMOIRE,

Priya Nair
Head of Human Resources
    `,
  },
};

export function renderDocumentTemplate(templateKey: string, variables: DocumentVariableMap): string {
  const config = DOCUMENT_TEMPLATES[templateKey];
  if (!config) return "Template not found.";

  let content = config.templateText;
  Object.keys(variables).forEach((key) => {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    content = content.replace(regex, String(variables[key] ?? ""));
  });

  return content;
}

export function triggerDocumentPrint(title: string, content: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; line-height: 1.6; color: #111827; }
          .header { text-align: center; border-bottom: 2px solid #F26722; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { font-size: 24px; font-weight: 900; color: #F26722; letter-spacing: 2px; }
          .tagline { font-size: 10px; font-weight: 700; color: #6B7280; letter-spacing: 3px; }
          .content { white-space: pre-wrap; font-size: 13px; }
          .footer { margin-top: 50px; pt-20px; border-top: 1px solid #E5E7EB; font-size: 10px; color: #9CA3AF; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">MEMOIRE</div>
          <div class="tagline">CRAFTING BRANDS</div>
        </div>
        <div class="content">${content}</div>
        <div class="footer">MEMOIRE OS Confidential Document • Generated on ${new Date().toLocaleDateString("en-IN")}</div>
      </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 250);
}
