"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Search, Building, Briefcase, CheckSquare, Layers, FileText, Users, DollarSign, X } from "lucide-react";
import { formatINR } from "@/lib/utils";

export function CommandPalette() {
  const router = useRouter();
  const { searchOpen, setSearchOpen, clients, leads, projects, tasks, documents, employees, invoices } = useStore();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, setSearchOpen]);

  if (!searchOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredClients = clients.filter(
    (c) => c.companyName.toLowerCase().includes(q) || c.industry.toLowerCase().includes(q)
  );

  const filteredLeads = leads.filter(
    (l) => l.companyName.toLowerCase().includes(q) || l.contactName.toLowerCase().includes(q)
  );

  const filteredProjects = projects.filter(
    (p) => p.name.toLowerCase().includes(q) || p.clientName.toLowerCase().includes(q)
  );

  const filteredTasks = tasks.filter(
    (t) => t.title.toLowerCase().includes(q) || t.assignedTo.toLowerCase().includes(q)
  );

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.designation.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q)
  );

  const filteredInvoices = invoices.filter(
    (i) =>
      i.invoiceNumber.toLowerCase().includes(q) ||
      i.clientName.toLowerCase().includes(q) ||
      i.projectName.toLowerCase().includes(q)
  );

  const filteredDocs = documents.filter((d) => d.name.toLowerCase().includes(q));

  const handleNavigate = (path: string) => {
    setSearchOpen(false);
    router.push(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-gray-50/60">
          <Search className="w-5 h-5 text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients, leads, projects, tasks, documents... (or press Esc to close)"
            className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            autoFocus
          />
          <button
            onClick={() => setSearchOpen(false)}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Stream */}
        <div className="overflow-y-auto p-4 space-y-6">
          {q === "" && (
            <div className="py-8 text-center text-xs text-gray-400">
              Type keywords to search across Memoire OS entities (e.g. <span className="font-semibold text-gray-700">"UrbanNest"</span>, <span className="font-semibold text-gray-700">"Meta Ads"</span>, <span className="font-semibold text-gray-700">"Ananya"</span>)
            </div>
          )}

          {/* Clients Section */}
          {filteredClients.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#F26722]" /> Clients ({filteredClients.length})
              </p>
              <div className="space-y-1">
                {filteredClients.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleNavigate(`/clients/${c.id}`)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-orange-50/60 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900 group-hover:text-[#F26722]">{c.companyName}</p>
                      <p className="text-[11px] text-gray-500">{c.industry} • {c.location}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-700">{formatINR(c.annualValue)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Leads Section */}
          {filteredLeads.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" /> Leads ({filteredLeads.length})
              </p>
              <div className="space-y-1">
                {filteredLeads.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleNavigate(`/leads`)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-blue-50/60 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900 group-hover:text-blue-600">{l.companyName}</p>
                      <p className="text-[11px] text-gray-500">{l.contactName} • {l.status}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-700">{formatINR(l.budget)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {filteredProjects.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" /> Projects ({filteredProjects.length})
              </p>
              <div className="space-y-1">
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleNavigate(`/projects`)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50/60 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900 group-hover:text-emerald-600">{p.name}</p>
                      <p className="text-[11px] text-gray-500">{p.clientName} • {p.status}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">{p.progress}%</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Section */}
          {filteredTasks.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-amber-600" /> Tasks ({filteredTasks.length})
              </p>
              <div className="space-y-1">
                {filteredTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleNavigate(`/tasks`)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-amber-50/60 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900 group-hover:text-amber-600">{t.title}</p>
                      <p className="text-[11px] text-gray-500">Assigned to {t.assignedTo} • Due {t.dueDate}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100">{t.priority}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Employees Section */}
          {filteredEmployees.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" /> Team & HR ({filteredEmployees.length})
              </p>
              <div className="space-y-1">
                {filteredEmployees.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => handleNavigate(`/hr/employees/${e.id}`)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-indigo-50/60 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900 group-hover:text-indigo-600">{e.name}</p>
                      <p className="text-[11px] text-gray-500">{e.designation} • {e.department}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100">{e.employeeId}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Invoices Section */}
          {filteredInvoices.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Invoices ({filteredInvoices.length})
              </p>
              <div className="space-y-1">
                {filteredInvoices.map((inv) => (
                  <button
                    key={inv.id}
                    onClick={() => handleNavigate(`/finance`)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-emerald-50/60 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900 group-hover:text-emerald-600 font-mono">{inv.invoiceNumber}</p>
                      <p className="text-[11px] text-gray-500">{inv.clientName} • Due {inv.dueDate}</p>
                    </div>
                    <span className="text-xs font-black text-emerald-700">{formatINR(inv.amount)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Documents Section */}
          {filteredDocs.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-600" /> Documents ({filteredDocs.length})
              </p>
              <div className="space-y-1">
                {filteredDocs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => handleNavigate(`/documents`)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-purple-50/60 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-bold text-gray-900 group-hover:text-purple-600">{d.name}</p>
                      <p className="text-[11px] text-gray-500">{d.category} • {d.size}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
