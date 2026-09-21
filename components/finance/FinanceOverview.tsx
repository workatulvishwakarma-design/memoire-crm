"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { Input, Select } from "../ui/input";
import { DollarSign, FileText, CheckCircle2, Clock, AlertCircle, Plus, Check, X } from "lucide-react";

export function FinanceOverview() {
  const { invoices, reimbursements, clients, addInvoice, updateInvoiceStatus, reviewReimbursement } = useStore();
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const [clientName, setClientName] = useState(clients[0]?.companyName || "UrbanNest Realty");
  const [projectName, setProjectName] = useState("UrbanNest Tower A Launch");
  const [amount, setAmount] = useState("350000");

  const totalInvoiced = invoices.reduce((acc, i) => acc + i.amount, 0);
  const paidInvoices = invoices.filter((i) => i.status === "Paid");
  const paidAmount = paidInvoices.reduce((acc, i) => acc + i.amount, 0);
  const pendingAmount = invoices.filter((i) => i.status === "Pending" || i.status === "Overdue").reduce((acc, i) => acc + i.amount, 0);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    addInvoice({
      invoiceNumber: "",
      clientName,
      projectName,
      amount: Number(amount),
      issueDate: new Date().toISOString().split("T")[0],
      dueDate: "2026-08-30",
    });
    setInvoiceModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-[#F26722]" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Agency Finances</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Invoices & Financial Overview</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Client retainer billing, outstanding invoices, and employee expense reimbursements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline">Export Ledger</Button>
          <Button size="sm" onClick={() => setInvoiceModalOpen(true)}><Plus className="w-4 h-4" /> Create Invoice</Button>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="p-4">
            <span className="text-xs font-bold uppercase text-gray-500">Collected Revenue</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{formatINR(paidAmount)}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">{paidInvoices.length} Paid Invoices</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-600">
          <CardContent className="p-4">
            <span className="text-xs font-bold uppercase text-gray-500">Outstanding / Pending</span>
            <p className="text-2xl font-black text-amber-700 mt-1">{formatINR(pendingAmount)}</p>
            <p className="text-xs text-amber-600 font-semibold mt-1">Pending Retainers</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-[#F26722]">
          <CardContent className="p-4">
            <span className="text-xs font-bold uppercase text-gray-500">Total Invoiced Q3</span>
            <p className="text-2xl font-black text-gray-900 mt-1">{formatINR(totalInvoiced)}</p>
            <p className="text-xs text-gray-500 mt-1">Across Retainer Clients</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Client Invoices</CardTitle>
            <CardDescription>Billing records and payment statuses</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Invoice #</th>
                  <th className="px-6 py-3">Client</th>
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-900">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900">{inv.invoiceNumber}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{inv.clientName}</td>
                    <td className="px-6 py-4">{inv.projectName}</td>
                    <td className="px-6 py-4 text-gray-500">{inv.dueDate}</td>
                    <td className="px-6 py-4 font-black text-gray-900">{formatINR(inv.amount)}</td>
                    <td className="px-6 py-4"><Badge status={inv.status} /></td>
                    <td className="px-6 py-4 text-right">
                      {inv.status !== "Paid" && (
                        <button
                          onClick={() => updateInvoiceStatus(inv.id, "Paid")}
                          className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Expense Reimbursements Section */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Employee Expense Reimbursements</CardTitle>
            <CardDescription>Submitted receipts and expense approvals</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
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
                      <button onClick={() => reviewReimbursement(r.id, "Approved")} className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100" title="Approve">
                        <Check className="w-4 h-4" />
                      </button>
                      <button onClick={() => reviewReimbursement(r.id, "Rejected")} className="p-1 rounded bg-rose-50 text-rose-700 hover:bg-rose-100" title="Reject">
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
        </CardContent>
      </Card>

      {/* Create Invoice Modal */}
      <Modal isOpen={invoiceModalOpen} onClose={() => setInvoiceModalOpen(false)} title="Create Retainer Invoice" description="Generate new billing record for client">
        <form onSubmit={handleCreateInvoice} className="space-y-4">
          <Input label="Client Name" value={clientName} onChange={(e) => setClientName(e.target.value)} required />
          <Input label="Project Name" value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
          <Input label="Invoice Amount (INR)" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setInvoiceModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Invoice</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
