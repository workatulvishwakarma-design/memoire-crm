"use client";

import React, { useState, useEffect } from "react";
import { formatINR } from "@/lib/utils";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { FilterBar } from "@/components/ui/filter-bar";
import { ActionMenu } from "@/components/ui/action-menu";
import { Briefcase, DollarSign, Plus, Phone, Mail } from "lucide-react";

interface VendorRecord {
  id: string;
  name: string;
  category: "Freelance Creative" | "Media Buyer" | "Print Vendor" | "Production House" | "Developer";
  contactPerson: string;
  email: string;
  phone: string;
  monthlyPayout: number;
  status: "Active" | "Inactive";
}

const INITIAL_VENDORS: VendorRecord[] = [];

export default function VendorsPage() {
  const [vendors, setVendors] = useState<VendorRecord[]>(INITIAL_VENDORS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<VendorRecord | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<any>("Freelance Creative");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [monthlyPayout, setMonthlyPayout] = useState("120000");
  const [vendorStatus, setVendorStatus] = useState<any>("Active");

  const openCreateModal = () => {
    setEditingVendor(null);
    setName(""); setContactPerson(""); setEmail(""); setPhone("");
    setCategory("Freelance Creative"); setMonthlyPayout("120000"); setVendorStatus("Active");
    setModalOpen(true);
  };

  const openEditModal = (vendor: VendorRecord) => {
    setEditingVendor(vendor);
    setName(vendor.name); setCategory(vendor.category);
    setContactPerson(vendor.contactPerson); setEmail(vendor.email);
    setPhone(vendor.phone); setMonthlyPayout(String(vendor.monthlyPayout));
    setVendorStatus(vendor.status);
    setModalOpen(true);
  };

  useEffect(() => {
    fetch("/api/vendors")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.length) {
          setVendors(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    if (editingVendor) {
      setVendors(vendors.map((v) => v.id === editingVendor.id ? { ...v, name, category, contactPerson, email, phone, monthlyPayout: Number(monthlyPayout), status: vendorStatus } : v));
    } else {
      const newVendor: VendorRecord = {
        id: `ven-${Date.now()}`,
        name, category, contactPerson, email, phone,
        monthlyPayout: Number(monthlyPayout), status: "Active",
      };
      setVendors([newVendor, ...vendors]);
      try {
        await fetch("/api/vendors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newVendor),
        });
      } catch {}
    }
    setName(""); setContactPerson(""); setEmail(""); setModalOpen(false);
  };

  const filteredVendors = vendors.filter((v) => {
    const matchSearch =
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.contactPerson.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "ALL" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Briefcase className="w-5 h-5 text-[#F26722]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">External Partners</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Vendor & Contractor Management ({filteredVendors.length})</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Freelancers, video production studios, print shops, and media buying agencies.
            </p>
          </div>
          <Button size="sm" onClick={openCreateModal}>
            <Plus className="w-4 h-4" /> Register Vendor
          </Button>
        </div>

          <FilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            statusOptions={[
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ]}
            totalCount={filteredVendors.length}
          />

        <Card>
          <CardContent className="p-0">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Vendor Name</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Contact Person</th>
                  <th className="px-6 py-3.5">Email & Phone</th>
                  <th className="px-6 py-3.5">Monthly Payout</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-900">
                {filteredVendors.map((vendor) => (
                  <tr key={vendor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-900">{vendor.name}</td>
                    <td className="px-6 py-4 font-semibold text-gray-600">{vendor.category}</td>
                    <td className="px-6 py-4 font-bold text-[#F26722]">{vendor.contactPerson}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900">{vendor.email}</p>
                        <p className="text-gray-400">{vendor.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900">{formatINR(vendor.monthlyPayout)}</td>
                    <td className="px-6 py-4"><Badge status={vendor.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <ActionMenu
                        onEdit={() => openEditModal(vendor)}
                        onDelete={() => setVendors(vendors.filter((v) => v.id !== vendor.id))}
                      />
                    </td>
                  </tr>
                ))}
                {filteredVendors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Briefcase className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="font-semibold text-gray-900 text-sm">No vendors registered yet</p>
                        <p className="text-xs text-gray-400 mt-0.5">Add production houses, freelancers, or media partners.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingVendor ? `Edit — ${editingVendor.name}` : "Register External Vendor"} description="Add contractor / agency partner to Memoire OS">
          <form onSubmit={handleSaveVendor} className="space-y-4">
            <Input label="Vendor / Studio Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                options={[
                  { label: "Freelance Creative", value: "Freelance Creative" },
                  { label: "Media Buyer", value: "Media Buyer" },
                  { label: "Print Vendor", value: "Print Vendor" },
                  { label: "Production House", value: "Production House" },
                  { label: "Developer", value: "Developer" },
                ]}
              />
              <Input label="Contact Person" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            <Input label="Monthly Payout (INR)" type="number" value={monthlyPayout} onChange={(e) => setMonthlyPayout(e.target.value)} required />
            {editingVendor && (
              <Select
                label="Vendor Status"
                value={vendorStatus}
                onChange={(e) => setVendorStatus(e.target.value as any)}
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Inactive", value: "Inactive" },
                ]}
              />
            )}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editingVendor ? "Save Changes" : "Save Vendor"}</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
