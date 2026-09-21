"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/utils";
import { Client } from "@/types";
import { Badge } from "../ui/badge";
import { ActionMenu } from "../ui/action-menu";
import { FilterBar } from "../ui/filter-bar";
import { Modal } from "../ui/modal";
import { Input, Select, Textarea } from "../ui/input";
import { Button } from "../ui/button";
import { Tabs } from "../ui/tabs";
import { exportToCSV } from "@/lib/export";
import {
  ExternalLink,
  Building,
  ShieldAlert,
  Plus,
  Download,
  Users,
  Briefcase,
  DollarSign,
  FileText,
} from "lucide-react";

export function ClientTable() {
  const { clients, employees, services, setSelectedClientId, addClient, updateClient, deleteClient } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("latest");

  // Modal States
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientFormTab, setClientFormTab] = useState("company");

  // Full Client Form State
  const [companyName, setCompanyName] = useState("");
  const [legalName, setLegalName] = useState("");
  const [industry, setIndustry] = useState("Real Estate & Luxury Retail");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("Navi Mumbai, Maharashtra");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("Navi Mumbai");
  const [stateName, setStateName] = useState("Maharashtra");
  const [pincode, setPincode] = useState("400703");
  const [gstin, setGstin] = useState("27AABCM8920C1Z4");
  const [pan, setPan] = useState("AABCM8920C");

  // Contact
  const [contactName, setContactName] = useState("");
  const [contactDesignation, setContactDesignation] = useState("Managing Director");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("+91 ");
  const [contactWhatsapp, setContactWhatsapp] = useState("+91 ");

  // Commercials
  const [status, setStatus] = useState<"Active" | "VIP" | "Prospect" | "Inactive">("Active");
  const [accountManager, setAccountManager] = useState(employees[0]?.name || "Account Lead");
  const [bdm, setBdm] = useState(employees[0]?.name || "BDM Growth Lead");
  const [annualValue, setAnnualValue] = useState("1800000");
  const [billingCycle, setBillingCycle] = useState<"Monthly Retainer" | "Quarterly" | "Milestone Based" | "Annual">("Monthly Retainer");
  const [paymentTerms, setPaymentTerms] = useState<"Due on Receipt" | "Net 15" | "Net 30" | "Net 45">("Net 15");
  const [selectedServices, setSelectedServices] = useState<string[]>(["Brand Strategy & Identity", "Performance Marketing"]);
  const [notes, setNotes] = useState("");

  const openCreateModal = () => {
    setEditingClient(null);
    setCompanyName("");
    setLegalName("");
    setIndustry("Real Estate & Luxury Retail");
    setWebsite("https://");
    setLocation("Navi Mumbai, Maharashtra");
    setStreetAddress("");
    setCity("Navi Mumbai");
    setStateName("Maharashtra");
    setPincode("400703");
    setGstin("27AABCM8920C1Z4");
    setPan("AABCM8920C");
    setContactName("");
    setContactDesignation("Managing Director");
    setContactEmail("");
    setContactPhone("+91 ");
    setContactWhatsapp("+91 ");
    setStatus("Active");
    setAccountManager(employees[0]?.name || "Account Lead");
    setBdm(employees[0]?.name || "Growth Lead");
    setAnnualValue("1800000");
    setBillingCycle("Monthly Retainer");
    setPaymentTerms("Net 15");
    setSelectedServices(services.length > 0 ? [services[0].name] : ["Brand Strategy & Identity"]);
    setNotes("");
    setClientFormTab("company");
    setCreateModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setCompanyName(client.companyName);
    setLegalName(client.legalName || client.companyName);
    setIndustry(client.industry);
    setWebsite(client.website);
    setLocation(client.location);
    setStreetAddress(client.address?.street || "");
    setCity(client.address?.city || "Navi Mumbai");
    setStateName(client.address?.state || "Maharashtra");
    setPincode(client.address?.pincode || "400703");
    setGstin(client.taxInfo?.gstin || "27AABCM8920C1Z4");
    setPan(client.taxInfo?.pan || "AABCM8920C");
    setContactName(client.primaryContact?.name || "");
    setContactDesignation(client.primaryContact?.designation || "Director");
    setContactEmail(client.primaryContact?.email || "");
    setContactPhone(client.primaryContact?.phone || "");
    setContactWhatsapp(client.primaryContact?.phone || "");
    setStatus(client.status);
    setAccountManager(client.accountManager);
    setBdm(client.bdm);
    setAnnualValue(String(client.annualValue));
    setBillingCycle(client.billingDetails?.billingCycle || "Monthly Retainer");
    setPaymentTerms(client.billingDetails?.paymentTerms || "Net 15");
    setSelectedServices(client.services || []);
    setNotes(client.notes || "");
    setClientFormTab("company");
    setCreateModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName) return;

    const clientPayload = {
      companyName,
      legalName: legalName || companyName,
      logo: "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150",
      industry,
      website: website || `https://${companyName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`,
      location: `${city}, ${stateName}`,
      address: {
        street: streetAddress,
        city,
        state: stateName,
        country: "India",
        pincode,
      },
      taxInfo: {
        gstin,
        pan,
      },
      status,
      primaryContact: {
        id: `cont-${Date.now()}`,
        name: contactName || "Key Contact",
        designation: contactDesignation,
        email: contactEmail,
        phone: contactPhone,
        isPrimary: true,
      },
      bdm,
      accountManager,
      services: selectedServices,
      annualValue: Number(annualValue) || 1800000,
      healthScore: 92,
      billingDetails: {
        billingCycle,
        paymentTerms,
        retainerAmount: Math.round(Number(annualValue || 0) / 12),
      },
      notes,
    };

    if (editingClient) {
      updateClient(editingClient.id, clientPayload);
    } else {
      addClient(clientPayload);
    }
    setCreateModalOpen(false);
  };

  const filteredClients = clients
    .filter((c) => {
      const matchesSearch =
        c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "value-high") return b.annualValue - a.annualValue;
      if (sortBy === "name") return a.companyName.localeCompare(b.companyName);
      return 0;
    });

  const handleExportCSV = () => {
    exportToCSV(
      "Memoire_Clients_Directory",
      filteredClients.map((c) => ({
        "Company Name": c.companyName,
        Industry: c.industry,
        "Primary Contact": c.primaryContact?.name,
        Email: c.primaryContact?.email,
        Phone: c.primaryContact?.phone,
        "Account Manager": c.accountManager,
        "Annual Value": formatINR(c.annualValue),
        Status: c.status,
      }))
    );
  };

  const clientModalTabs = [
    { id: "company", label: "1. Company & Legal" },
    { id: "contact", label: "2. Brand Contact" },
    { id: "retainer", label: "3. Retainers & Billing" },
    { id: "notes", label: "4. Strategic Notes" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building className="w-5 h-5 text-[#F26722]" />
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Client Management</span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">
            Clients & Strategic Accounts ({filteredClients.length})
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Retainer portfolio, brand stakeholders, delivery workspaces, and invoicing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-1.5" /> Export CSV
          </Button>
          <Button size="sm" onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Client
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        statusOptions={[
          { label: "Active", value: "Active" },
          { label: "VIP Retainer", value: "VIP" },
          { label: "Prospect", value: "Prospect" },
          { label: "Inactive", value: "Inactive" },
        ]}
        sortBy={sortBy}
        onSortChange={setSortBy}
        sortOptions={[
          { label: "Latest Joined", value: "latest" },
          { label: "Retainer Value (High)", value: "value-high" },
          { label: "Company Name (A-Z)", value: "name" },
        ]}
        totalCount={filteredClients.length}
      />

      {/* Clients Data Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5">Company Name</th>
                <th className="px-6 py-3.5">Industry</th>
                <th className="px-6 py-3.5">Primary Contact</th>
                <th className="px-6 py-3.5">Retainer Value</th>
                <th className="px-6 py-3.5">Account Health</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium text-gray-900">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={client.logo || "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=150"}
                      alt={client.companyName}
                      className="w-9 h-9 rounded-xl object-cover border border-gray-200 shadow-2xs"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{client.companyName}</p>
                      <p className="text-[11px] text-gray-400">{client.location}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{client.industry}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-900">{client.primaryContact?.name}</p>
                    <p className="text-[11px] text-gray-400">{client.primaryContact?.email}</p>
                  </td>
                  <td className="px-6 py-4 font-black text-gray-900">{formatINR(client.annualValue)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-12 bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            client.healthScore >= 90 ? "bg-emerald-500" : client.healthScore >= 75 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${client.healthScore}%` }}
                        />
                      </div>
                      <span className="font-bold text-gray-700">{client.healthScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={client.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedClientId(client.id)}
                        className="px-2.5 py-1 rounded-lg bg-orange-50 text-[#F26722] hover:bg-orange-100 font-bold text-[11px] transition-colors cursor-pointer"
                      >
                        Profile Hub
                      </button>
                      <ActionMenu
                        onViewDetails={() => setSelectedClientId(client.id)}
                        onEdit={() => openEditModal(client)}
                        onDelete={() => deleteClient(client.id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                      <Building className="w-10 h-10 text-gray-300" />
                      <div>
                        <p className="font-bold text-gray-900 text-base">No clients registered</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Onboard a client company or convert a won deal from the sales pipeline.
                        </p>
                      </div>
                      <Button size="sm" onClick={openCreateModal}>
                        <Plus className="w-4 h-4 mr-1.5" /> Add New Client
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* PROFESSIONAL CLIENT ONBOARDING MODAL */}
      {/* ============================================================================== */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={editingClient ? `Edit Account — ${editingClient.companyName}` : "Onboard New Client Account"}
        description={
          editingClient
            ? "Update commercial terms, primary contacts, and company specifications"
            : "Complete registration for an agency brand partnership"
        }
      >
        <form onSubmit={handleSaveClient} className="space-y-4">
          <Tabs tabs={clientModalTabs} activeTab={clientFormTab} onChange={setClientFormTab} variant="pills" />

          {/* TAB 1: COMPANY & LEGAL */}
          {clientFormTab === "company" && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Company Brand Name"
                  placeholder="e.g. UrbanNest Realty"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
                <Input
                  label="Legal / Registered Name"
                  placeholder="e.g. UrbanNest Living Pvt Ltd"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Industry Vertical"
                  placeholder="e.g. Luxury Real Estate, D2C Apparel"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required
                />
                <Input
                  label="Official Website"
                  placeholder="https://urbannest.in"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="GSTIN / Tax Number"
                  placeholder="27AABCM8920C1Z4"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                />
                <Input
                  label="Company PAN"
                  placeholder="AABCM8920C"
                  value={pan}
                  onChange={(e) => setPan(e.target.value)}
                />
              </div>
              <Input
                label="Registered Street Address"
                placeholder="Suite 402, Platinum Techno Park"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
              />
              <div className="grid grid-cols-3 gap-3">
                <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
                <Input label="State" value={stateName} onChange={(e) => setStateName(e.target.value)} />
                <Input label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />
              </div>
            </div>
          )}

          {/* TAB 2: BRAND CONTACT */}
          {clientFormTab === "contact" && (
            <div className="space-y-3 pt-2">
              <Input
                label="Primary Contact Person"
                placeholder="e.g. Priya Sharma"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Designation / Role"
                  placeholder="e.g. VP Marketing / Managing Director"
                  value={contactDesignation}
                  onChange={(e) => setContactDesignation(e.target.value)}
                />
                <Input
                  label="Official Email"
                  type="email"
                  placeholder="priya@urbannest.in"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Phone Number"
                  placeholder="+91 98200 12345"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                />
                <Input
                  label="WhatsApp Business Contact"
                  placeholder="+91 98200 12345"
                  value={contactWhatsapp}
                  onChange={(e) => setContactWhatsapp(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* TAB 3: RETAINERS & BILLING */}
          {clientFormTab === "retainer" && (
            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Account Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  options={[
                    { label: "Active Retainer", value: "Active" },
                    { label: "VIP Account", value: "VIP" },
                    { label: "Prospect", value: "Prospect" },
                    { label: "Inactive", value: "Inactive" },
                  ]}
                />
                <Input
                  label="Annual Contract Value (INR)"
                  type="number"
                  value={annualValue}
                  onChange={(e) => setAnnualValue(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Billing Frequency"
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value as any)}
                  options={[
                    { label: "Monthly Retainer", value: "Monthly Retainer" },
                    { label: "Quarterly Billing", value: "Quarterly" },
                    { label: "Milestone Based", value: "Milestone Based" },
                    { label: "Annual Contract", value: "Annual" },
                  ]}
                />
                <Select
                  label="Payment Terms"
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value as any)}
                  options={[
                    { label: "Net 15 Days", value: "Net 15" },
                    { label: "Net 30 Days", value: "Net 30" },
                    { label: "Due on Receipt", value: "Due on Receipt" },
                    { label: "Net 45 Days", value: "Net 45" },
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Assigned Account Manager"
                  value={accountManager}
                  onChange={(e) => setAccountManager(e.target.value)}
                  options={
                    employees.length > 0
                      ? employees.map((emp) => ({ label: `${emp.name} (${emp.department})`, value: emp.name }))
                      : [{ label: "Account Lead", value: "Account Lead" }]
                  }
                />
                <Select
                  label="Assigned BDM"
                  value={bdm}
                  onChange={(e) => setBdm(e.target.value)}
                  options={
                    employees.length > 0
                      ? employees.map((emp) => ({ label: `${emp.name} (BDM)`, value: emp.name }))
                      : [{ label: "Growth Team", value: "Growth Team" }]
                  }
                />
              </div>
            </div>
          )}

          {/* TAB 4: STRATEGIC NOTES */}
          {clientFormTab === "notes" && (
            <div className="space-y-3 pt-2">
              <Textarea
                label="Executive Background & Engagement Notes"
                rows={5}
                placeholder="Document client preferences, key stakeholders, brand tone, or billing arrangements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          )}

          {/* Footer Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex gap-1.5 text-xs text-gray-400">
              {clientFormTab !== "company" && (
                <button
                  type="button"
                  onClick={() => {
                    const idx = clientModalTabs.findIndex((t) => t.id === clientFormTab);
                    if (idx > 0) setClientFormTab(clientModalTabs[idx - 1].id);
                  }}
                  className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer"
                >
                  ← Previous
                </button>
              )}
              {clientFormTab !== "notes" && (
                <button
                  type="button"
                  onClick={() => {
                    const idx = clientModalTabs.findIndex((t) => t.id === clientFormTab);
                    if (idx < clientModalTabs.length - 1) setClientFormTab(clientModalTabs[idx + 1].id);
                  }}
                  className="px-2 py-1 rounded bg-orange-50 hover:bg-orange-100 text-[#F26722] font-semibold cursor-pointer"
                >
                  Next →
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingClient ? "Save Account Changes" : "Register Client"}
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
