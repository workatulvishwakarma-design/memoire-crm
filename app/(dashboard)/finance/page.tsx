"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/utils";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Select, Textarea } from "@/components/ui/input";
import { FilterBar } from "@/components/ui/filter-bar";
import {
  DollarSign,
  Plus,
  Download,
  Check,
  X,
  Printer,
  FileText,
  CreditCard,
  ShieldCheck,
  Building,
} from "lucide-react";
import { Invoice } from "@/types";
import { exportToCSV, buildInvoiceHTML, printDocument } from "@/lib/export";

interface PaymentEntry {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  amount: number;
  date: string;
  method: string;
  referenceNumber: string;
  notes: string;
}

export default function FinancePage() {
  const {
    invoices,
    reimbursements,
    clients,
    projects,
    addInvoice,
    updateInvoiceStatus,
    reviewReimbursement,
    addActivity,
  } = useStore();

  const [activeFinanceTab, setActiveFinanceTab] = useState<"invoices" | "payments" | "reimbursements">("invoices");
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [viewInvoiceModalOpen, setViewInvoiceModalOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create Invoice Form State
  const [clientName, setClientName] = useState(clients[0]?.companyName || "");
  const [projectName, setProjectName] = useState("");
  const [amount, setAmount] = useState("350000");
  const [dueDate, setDueDate] = useState("2026-09-30");

  // Record Payment Form State
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("NEFT / Bank Transfer");
  const [paymentRef, setPaymentRef] = useState("");
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split("T")[0]);
  const [paymentNotes, setPaymentNotes] = useState("");
  const [paymentsList, setPaymentsList] = useState<PaymentEntry[]>([]);

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.amount, 0);
  const paidAmount = invoices.filter((i) => i.status === "Paid").reduce((acc, i) => acc + i.amount, 0);
  const pendingAmount = invoices.filter((i) => i.status === "Pending" || i.status === "Overdue").reduce((acc, i) => acc + i.amount, 0);
  const overdueCount = invoices.filter((i) => i.status === "Overdue").length;

  const openCreateModal = () => {
    setClientName(clients[0]?.companyName || "");
    setProjectName(projects[0]?.name || "Brand Campaign");
    setAmount("350000");
    setDueDate(new Date(Date.now() + 15 * 86400000).toISOString().split("T")[0]);
    setInvoiceModalOpen(true);
  };

  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !clientName) return;
    addInvoice({
      invoiceNumber: "",
      clientName,
      projectName: projectName || "Creative Retainer",
      amount: Number(amount),
      issueDate: new Date().toISOString().split("T")[0],
      dueDate,
    });
    setInvoiceModalOpen(false);
  };

  const openPaymentModal = (inv: Invoice) => {
    setActiveInvoice(inv);
    setPaymentAmount(String(inv.amount));
    setPaymentRef(`TXN-${Date.now().toString().slice(-6)}`);
    setPaymentNotes("Full invoice settlement received via bank transfer");
    setPaymentModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeInvoice || !paymentAmount) return;

    const entry: PaymentEntry = {
      id: `pay-${Date.now()}`,
      invoiceId: activeInvoice.id,
      invoiceNumber: activeInvoice.invoiceNumber,
      clientName: activeInvoice.clientName,
      amount: Number(paymentAmount),
      date: paymentDate,
      method: paymentMethod,
      referenceNumber: paymentRef,
      notes: paymentNotes,
    };

    setPaymentsList((prev) => [entry, ...prev]);
    updateInvoiceStatus(activeInvoice.id, "Paid");
    addActivity({
      user: "Finance Lead",
      action: `Recorded payment of ${formatINR(Number(paymentAmount))} for ${activeInvoice.invoiceNumber}`,
      target: activeInvoice.clientName,
      type: "finance",
    });

    setPaymentModalOpen(false);
  };

  const handlePrintInvoice = (inv: Invoice) => {
    const client = clients.find((c) => c.companyName.toLowerCase() === inv.clientName.toLowerCase());
    const html = buildInvoiceHTML({ invoice: inv, client });
    printDocument(html, `Invoice_${inv.invoiceNumber}`);
  };

  const filteredInvoices = invoices.filter((i) => {
    const matchSearch =
      i.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "ALL" || i.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-5 h-5 text-[#F26722]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Agency Finances</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Invoices, Billing & Payments ({invoices.length})</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Client retainer billing, tax invoices, transaction receipts, and expense approvals.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                exportToCSV(
                  "Memoire_Invoices_Ledger",
                  invoices.map((i) => ({
                    "Invoice #": i.invoiceNumber,
                    Client: i.clientName,
                    Project: i.projectName,
                    Amount: i.amount,
                    "Issue Date": i.issueDate,
                    "Due Date": i.dueDate,
                    Status: i.status,
                  }))
                )
              }
            >
              <Download className="w-4 h-4 mr-1" /> Export CSV
            </Button>
            <Button size="sm" onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-1" /> Create Invoice
            </Button>
          </div>
        </div>

        {/* Financial Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-emerald-600">
            <CardContent className="p-4">
              <span className="text-xs font-bold uppercase text-gray-500">Collected Revenue</span>
              <p className="text-2xl font-black text-emerald-700 mt-1">{formatINR(paidAmount)}</p>
              <p className="text-xs text-emerald-600 font-semibold mt-1">
                {invoices.filter((i) => i.status === "Paid").length} Settled Invoices
              </p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-amber-600">
            <CardContent className="p-4">
              <span className="text-xs font-bold uppercase text-gray-500">Outstanding / Pending</span>
              <p className="text-2xl font-black text-amber-700 mt-1">{formatINR(pendingAmount)}</p>
              <p className="text-xs text-amber-600 font-semibold mt-1">Awaiting Payment Settlement</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-rose-600">
            <CardContent className="p-4">
              <span className="text-xs font-bold uppercase text-gray-500">Overdue Invoices</span>
              <p className="text-2xl font-black text-rose-700 mt-1">{overdueCount}</p>
              <p className="text-xs text-rose-600 font-semibold mt-1">Requires Payment Follow-up</p>
            </CardContent>
          </Card>
          <Card className="border-l-4 border-l-[#F26722]">
            <CardContent className="p-4">
              <span className="text-xs font-bold uppercase text-gray-500">Total Invoiced</span>
              <p className="text-2xl font-black text-gray-900 mt-1">{formatINR(totalInvoiced)}</p>
              <p className="text-xs text-gray-500 mt-1">Across {invoices.length} Registered Billings</p>
            </CardContent>
          </Card>
        </div>

        {/* Finance Sub-Tabs */}
        <div className="flex space-x-2 border-b border-gray-200 pb-2">
          <button
            onClick={() => setActiveFinanceTab("invoices")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeFinanceTab === "invoices"
                ? "bg-[#F26722] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Client Invoices ({invoices.length})
          </button>
          <button
            onClick={() => setActiveFinanceTab("payments")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeFinanceTab === "payments"
                ? "bg-[#F26722] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Payment Receipts ({paymentsList.length})
          </button>
          <button
            onClick={() => setActiveFinanceTab("reimbursements")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeFinanceTab === "reimbursements"
                ? "bg-[#F26722] text-white shadow-xs"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Reimbursements ({reimbursements.length})
          </button>
        </div>

        {/* ============================================================================== */}
        {/* SUBTAB 1: INVOICES TABLE */}
        {/* ============================================================================== */}
        {activeFinanceTab === "invoices" && (
          <div className="space-y-4">
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              statusOptions={[
                { label: "Pending", value: "Pending" },
                { label: "Paid", value: "Paid" },
                { label: "Overdue", value: "Overdue" },
              ]}
              totalCount={filteredInvoices.length}
            />

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3.5">Invoice #</th>
                        <th className="px-6 py-3.5">Client</th>
                        <th className="px-6 py-3.5">Project</th>
                        <th className="px-6 py-3.5">Issue Date</th>
                        <th className="px-6 py-3.5">Due Date</th>
                        <th className="px-6 py-3.5">Amount</th>
                        <th className="px-6 py-3.5">Status</th>
                        <th className="px-6 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-900">
                      {filteredInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-gray-900">{inv.invoiceNumber}</td>
                          <td className="px-6 py-4 font-semibold text-gray-900">{inv.clientName}</td>
                          <td className="px-6 py-4 text-gray-500">{inv.projectName}</td>
                          <td className="px-6 py-4 text-gray-500">{inv.issueDate}</td>
                          <td className={`px-6 py-4 font-semibold ${inv.status === "Overdue" ? "text-rose-600" : "text-gray-500"}`}>
                            {inv.dueDate}
                          </td>
                          <td className="px-6 py-4 font-black text-gray-900">{formatINR(inv.amount)}</td>
                          <td className="px-6 py-4">
                            <Badge status={inv.status} />
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-[11px] px-2"
                                onClick={() => handlePrintInvoice(inv)}
                              >
                                <Printer className="w-3.5 h-3.5 mr-1" /> PDF
                              </Button>
                              {inv.status !== "Paid" && (
                                <button
                                  onClick={() => openPaymentModal(inv)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors cursor-pointer inline-flex items-center gap-1"
                                >
                                  <CreditCard className="w-3.5 h-3.5" /> Pay
                                </button>
                              )}
                              {inv.status === "Pending" && (
                                <button
                                  onClick={() => updateInvoiceStatus(inv.id, "Overdue")}
                                  className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[11px] transition-colors cursor-pointer"
                                >
                                  Overdue
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {filteredInvoices.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center justify-center">
                              <DollarSign className="w-8 h-8 text-gray-300 mb-2" />
                              <p className="font-semibold text-gray-900 text-sm">No invoices found</p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Click "Create Invoice" above to generate your first billing statement.
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ============================================================================== */}
        {/* SUBTAB 2: PAYMENT RECEIPTS LEDGER */}
        {/* ============================================================================== */}
        {activeFinanceTab === "payments" && (
          <Card>
            <CardHeader>
              <CardTitle>Recorded Payment Receipts ({paymentsList.length})</CardTitle>
              <CardDescription>Verified remittances and bank settlements</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {paymentsList.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400">
                  <CreditCard className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="font-semibold text-gray-700">No payment receipts registered yet</p>
                  <p className="mt-0.5">Click "Pay" on any outstanding invoice to record a settlement.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3">Receipt ID</th>
                        <th className="px-6 py-3">Invoice #</th>
                        <th className="px-6 py-3">Client</th>
                        <th className="px-6 py-3">Payment Date</th>
                        <th className="px-6 py-3">Method</th>
                        <th className="px-6 py-3">Reference #</th>
                        <th className="px-6 py-3 text-right">Amount Settled</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 font-medium text-gray-900">
                      {paymentsList.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50/80">
                          <td className="px-6 py-3.5 font-mono text-gray-500">{p.id}</td>
                          <td className="px-6 py-3.5 font-mono font-bold text-gray-900">{p.invoiceNumber}</td>
                          <td className="px-6 py-3.5 font-semibold text-gray-900">{p.clientName}</td>
                          <td className="px-6 py-3.5 text-gray-500">{p.date}</td>
                          <td className="px-6 py-3.5">
                            <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-800 font-bold">{p.method}</span>
                          </td>
                          <td className="px-6 py-3.5 font-mono text-gray-600">{p.referenceNumber}</td>
                          <td className="px-6 py-3.5 text-right font-black text-emerald-700">{formatINR(p.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ============================================================================== */}
        {/* SUBTAB 3: EXPENSE REIMBURSEMENTS */}
        {/* ============================================================================== */}
        {activeFinanceTab === "reimbursements" && (
          <Card>
            <CardHeader>
              <CardTitle>Employee Expense Reimbursements</CardTitle>
              <CardDescription>Submitted receipts and expense approvals</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {reimbursements.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <p className="font-semibold text-gray-900 text-sm">No reimbursement claims</p>
                  <p className="text-xs text-gray-400 mt-0.5">Submitted team receipts and expense claims will show here.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 text-xs">
                  {reimbursements.map((r) => (
                    <div key={r.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{r.employeeName}</span>
                          <Badge variant="orange">{r.expenseType}</Badge>
                        </div>
                        <p className="text-gray-500 mt-0.5">{r.description} • {r.project}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-black text-sm text-gray-900">{formatINR(r.amount)}</span>
                        {r.status === "Submitted" ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => reviewReimbursement(r.id, "Approved")}
                              className="p-1.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => reviewReimbursement(r.id, "Rejected")}
                              className="p-1.5 rounded bg-rose-50 text-rose-700 hover:bg-rose-100"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <Badge status={r.status} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ============================================================================== */}
        {/* MODAL: CREATE INVOICE */}
        {/* ============================================================================== */}
        <Modal
          isOpen={invoiceModalOpen}
          onClose={() => setInvoiceModalOpen(false)}
          title="Create Retainer Invoice"
          description="Generate new tax billing record for a client"
        >
          <form onSubmit={handleSaveInvoice} className="space-y-4">
            {clients.length > 0 ? (
              <Select
                label="Client Company"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                options={clients.map((c) => ({ label: c.companyName, value: c.companyName }))}
              />
            ) : (
              <Input
                label="Client Company Name"
                placeholder="e.g. Acme Corp"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                required
              />
            )}
            <Input
              label="Project Scope / Retainer Item"
              placeholder="e.g. Monthly Social Media Retainer & Creative Production"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Invoice Amount (INR)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
              <Input
                label="Payment Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setInvoiceModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Generate Invoice</Button>
            </div>
          </form>
        </Modal>

        {/* ============================================================================== */}
        {/* MODAL: RECORD PAYMENT */}
        {/* ============================================================================== */}
        <Modal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          title={`Record Payment — ${activeInvoice?.invoiceNumber}`}
          description={`Settle billing balance for ${activeInvoice?.clientName}`}
        >
          <form onSubmit={handleSavePayment} className="space-y-4">
            <div className="p-3.5 bg-orange-50/60 rounded-xl border border-orange-100 text-xs text-gray-800 space-y-1">
              <p><strong>Client:</strong> {activeInvoice?.clientName}</p>
              <p><strong>Total Billed:</strong> {activeInvoice ? formatINR(activeInvoice.amount) : "₹0"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Payment Amount (INR)"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
              />
              <Input
                label="Settlement Date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Payment Method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={[
                  { label: "NEFT / RTGS / IMPS", value: "NEFT / RTGS" },
                  { label: "UPI Transfer", value: "UPI Transfer" },
                  { label: "Company Card / Gateway", value: "Credit Card" },
                  { label: "Cheque Deposit", value: "Cheque Deposit" },
                ]}
              />
              <Input
                label="Transaction / UTR Reference #"
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                required
              />
            </div>
            <Textarea
              label="Payment Notes"
              rows={2}
              value={paymentNotes}
              onChange={(e) => setPaymentNotes(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setPaymentModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                <ShieldCheck className="w-4 h-4 mr-1.5" /> Confirm Payment Settlement
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
