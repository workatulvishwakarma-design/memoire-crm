"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/utils";
import { Lead } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Modal } from "../ui/modal";
import { Input, Select } from "../ui/input";
import { ActionMenu } from "../ui/action-menu";
import { Briefcase, Trophy, DollarSign, Plus, ArrowRight, UserCheck } from "lucide-react";

export function BDMDashboard() {
  const { leads, addLead, updateLead, updateLeadStatus, winLead, deleteLead } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  // Lead Form State
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("D2C / F&B");
  const [location, setLocation] = useState("Mumbai");
  const [budget, setBudget] = useState("750000");
  const [assignedBDM, setAssignedBDM] = useState("Amit Patel");
  const [status, setStatus] = useState<any>("New");

  const openCreateModal = () => {
    setEditingLead(null);
    setCompanyName("");
    setContactName("");
    setEmail("");
    setPhone("");
    setModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditingLead(lead);
    setCompanyName(lead.companyName);
    setContactName(lead.contactName);
    setEmail(lead.email);
    setPhone(lead.phone);
    setIndustry(lead.industry);
    setLocation(lead.location);
    setBudget(String(lead.budget));
    setAssignedBDM(lead.assignedBDM);
    setStatus(lead.status);
    setModalOpen(true);
  };

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) return;

    if (editingLead) {
      updateLead(editingLead.id, {
        companyName,
        contactName,
        email,
        phone,
        industry,
        location,
        budget: Number(budget),
        assignedBDM,
        status,
      });
    } else {
      addLead({
        companyName,
        contactName,
        email,
        phone,
        industry,
        location,
        source: "Inbound Website",
        interestedServices: ["Brand Identity", "Performance Marketing"],
        budget: Number(budget),
        assignedBDM,
        leadScore: 85,
        status,
        expectedClosing: "2026-08-30",
        notes: "New inbound lead opportunity.",
      });
    }
    setModalOpen(false);
  };

  const stages: Lead["status"][] = [
    "New",
    "Contacted",
    "Qualified",
    "Meeting Scheduled",
    "Proposal Sent",
    "Negotiation",
    "Won",
  ];

  const totalPipelineValue = leads.reduce((acc, l) => acc + l.budget, 0);
  const wonDeals = leads.filter((l) => l.status === "Won");
  const wonValue = wonDeals.reduce((acc, l) => acc + l.budget, 0);
  const winRate = leads.length > 0 ? `${((wonDeals.length / leads.length) * 100).toFixed(1)}%` : "0%";

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-5 h-5 text-[#F26722]" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Sales & Business Development</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">BDM Sales Pipeline ({leads.length} Leads)</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Active deal tracking, proposal pipeline, and 1-click client onboarding converter.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={openCreateModal}><Plus className="w-4 h-4" /> Add New Lead</Button>
        </div>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-[#F26722]">
          <CardContent className="p-4">
            <span className="text-xs font-bold uppercase text-gray-500">Active Pipeline Value</span>
            <p className="text-2xl font-black text-gray-900 mt-1">{formatINR(totalPipelineValue)}</p>
            <p className="text-xs text-gray-500 mt-1">{leads.length} Active Opportunities</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="p-4">
            <span className="text-xs font-bold uppercase text-gray-500">Won Revenue Total</span>
            <p className="text-2xl font-black text-emerald-700 mt-1">{formatINR(wonValue)}</p>
            <p className="text-xs text-emerald-600 font-semibold mt-1">{wonDeals.length} Deals Converted</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-600">
          <CardContent className="p-4">
            <span className="text-xs font-bold uppercase text-gray-500">Win Conversion Rate</span>
            <p className="text-2xl font-black text-blue-700 mt-1">{winRate}</p>
            <p className="text-xs text-blue-600 font-semibold mt-1">
              {leads.length > 0 ? "High Intent BDM Conversion" : "No pipeline leads yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 overflow-x-auto pb-4">
        {stages.map((stg) => {
          const stageLeads = leads.filter((l) => l.status === stg);
          const stageTotal = stageLeads.reduce((acc, l) => acc + l.budget, 0);

          return (
            <div key={stg} className="bg-gray-50/70 p-3 rounded-2xl border border-gray-200 min-w-[240px] flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-gray-900 uppercase tracking-wider">{stg}</span>
                <span className="text-[10px] font-extrabold bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
                  {stageLeads.length}
                </span>
              </div>
              <span className="text-[11px] font-bold text-gray-400">{formatINR(stageTotal)}</span>

              <div className="space-y-3 flex-1">
                {stageLeads.map((lead) => (
                  <Card key={lead.id} className="p-3.5 space-y-2 hover:shadow-xs transition-all border-t-2 border-t-[#F26722]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-[#F26722] uppercase">{lead.industry}</span>
                      <ActionMenu
                        onEdit={() => openEditModal(lead)}
                        onDelete={() => deleteLead(lead.id)}
                        customItems={[
                          { label: "Win Deal 🎉", onClick: () => winLead(lead.id) },
                        ]}
                      />
                    </div>

                    <h4 className="font-bold text-xs text-gray-900 leading-snug">{lead.companyName}</h4>
                    <p className="text-[11px] text-gray-500">{lead.contactName} • {lead.location}</p>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="font-black text-gray-900">{formatINR(lead.budget)}</span>
                      <span className="text-[10px] font-bold bg-orange-50 text-[#F26722] px-1.5 py-0.5 rounded">
                        Score: {lead.leadScore}
                      </span>
                    </div>

                    {stg !== "Won" && (
                      <Button size="sm" onClick={() => winLead(lead.id)} className="w-full text-[11px] bg-emerald-600 hover:bg-emerald-700 h-7 mt-1">
                        <Trophy className="w-3 h-3" /> Win Deal 🎉
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Lead Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingLead ? `Edit ${editingLead.companyName}` : "Create Lead Opportunity"}
        description="Add deal specifications into sales pipeline"
      >
        <form onSubmit={handleSaveLead} className="space-y-4">
          <Input label="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Contact Name" value={contactName} onChange={(e) => setContactName(e.target.value)} required />
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <Input label="Industry" value={industry} onChange={(e) => setIndustry(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} required />
            <Input label="Budget (INR)" type="number" value={budget} onChange={(e) => setBudget(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Assigned BDM"
              value={assignedBDM}
              onChange={(e) => setAssignedBDM(e.target.value)}
              options={[
                { label: "Amit Patel", value: "Amit Patel" },
                { label: "Rohan Mehta", value: "Rohan Mehta" },
              ]}
            />
            <Select
              label="Pipeline Stage"
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={stages.map((s) => ({ label: s, value: s }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingLead ? "Save Lead Changes" : "Create Lead"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
