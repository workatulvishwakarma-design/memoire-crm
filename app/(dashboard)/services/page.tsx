"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { formatINR } from "@/lib/utils";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { FilterBar } from "@/components/ui/filter-bar";
import { ActionMenu } from "@/components/ui/action-menu";
import { Sparkles, Layers, Building, Plus, Download } from "lucide-react";
import { AgencyService } from "@/types";
import { exportToCSV } from "@/lib/export";

const CATEGORIES = [
  "BRAND & CREATIVE",
  "DIGITAL MARKETING",
  "WEBSITE & TECHNOLOGY",
  "ADVERTISING",
  "CONTENT & PRODUCTION",
  "PACKAGING & SPACE",
];

export default function ServicesPage() {
  const { services, addService, updateService, deleteService } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<AgencyService | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState<any>("BRAND & CREATIVE");
  const [description, setDescription] = useState("");
  const [pricingType, setPricingType] = useState<any>("Retainer");
  const [basePrice, setBasePrice] = useState("250000");

  const openCreateModal = () => {
    setEditingService(null);
    setName(""); setDescription("");
    setCategory("BRAND & CREATIVE"); setPricingType("Retainer"); setBasePrice("250000");
    setModalOpen(true);
  };

  const openEditModal = (serv: AgencyService) => {
    setEditingService(serv);
    setName(serv.name); setCategory(serv.category);
    setDescription(serv.description); setPricingType(serv.pricingType);
    setBasePrice(String(serv.basePrice));
    setModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    if (editingService) {
      updateService(editingService.id, { name, category, description, pricingType, basePrice: Number(basePrice) });
    } else {
      addService({ name, category, description: description || "Comprehensive agency service offering.", pricingType, basePrice: Number(basePrice) });
    }
    setName(""); setDescription(""); setModalOpen(false);
  };

  const filteredServices = services.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = categoryFilter === "ALL" || s.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-[#F26722]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Service Catalog</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Memoire Agency Offerings ({filteredServices.length})</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Brand, Digital Marketing, Technology, Performance Advertising, Production, and Space Design verticals.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => exportToCSV("Memoire_Services", services.map((s) => ({
              Name: s.name, Category: s.category, Pricing: s.pricingType, BasePrice: s.basePrice,
            })))}>
              <Download className="w-4 h-4" /> Export
            </Button>
            <Button size="sm" onClick={openCreateModal}>
              <Plus className="w-4 h-4" /> Add Service
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={categoryFilter}
          onStatusChange={setCategoryFilter}
          statusOptions={CATEGORIES.map((c) => ({ label: c, value: c }))}
          totalCount={filteredServices.length}
        />

        {/* Service Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((serv) => (
            <Card key={serv.id} className="border-t-4 border-t-[#F26722] hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex-1 min-w-0">
                  <Badge variant="orange">{serv.category}</Badge>
                  <CardTitle className="mt-2 text-base font-bold text-gray-900 leading-snug">{serv.name}</CardTitle>
                </div>
                <ActionMenu
                  onEdit={() => openEditModal(serv)}
                  onDelete={() => deleteService(serv.id)}
                />
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-gray-600 leading-relaxed min-h-[48px]">{serv.description}</p>
                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-400 block">Pricing Model</span>
                    <p className="font-bold text-gray-900 mt-0.5">{serv.pricingType}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 block">Starting Base</span>
                    <p className="font-black text-gray-900 mt-0.5">{formatINR(serv.basePrice)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#F26722]" /> {serv.activeProjectsCount} Active Projects
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-blue-600" /> {serv.activeClientsCount} Clients
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add / Edit Modal */}
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingService ? `Edit — ${editingService.name}` : "Add Agency Service Offering"}
          description="Configure service vertical in Memoire OS catalog"
        >
          <form onSubmit={handleSaveService} className="space-y-4">
            <Input label="Service Name" placeholder="e.g. 3D Architectural Visualization" value={name} onChange={(e) => setName(e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                options={CATEGORIES.map((c) => ({ label: c, value: c }))}
              />
              <Select
                label="Pricing Model"
                value={pricingType}
                onChange={(e) => setPricingType(e.target.value as any)}
                options={[
                  { label: "Retainer", value: "Retainer" },
                  { label: "Project Based", value: "Project Based" },
                  { label: "Custom Quote", value: "Custom" },
                ]}
              />
            </div>
            <Input label="Base Price (INR)" type="number" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
            <Input label="Service Description" placeholder="Detailed scope of deliverable assets" value={description} onChange={(e) => setDescription(e.target.value)} />
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editingService ? "Save Changes" : "Create Service"}</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
