"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { FilterBar } from "@/components/ui/filter-bar";
import { ActionMenu } from "@/components/ui/action-menu";
import { Laptop, Camera, HardDrive, ShieldCheck, Plus, User, Calendar } from "lucide-react";

interface AssetRecord {
  id: string;
  name: string;
  category: "Laptop / Mac" | "Camera & Video" | "Monitor / Display" | "Software License";
  serialNumber: string;
  assignedTo: string;
  issueDate: string;
  condition: "Brand New" | "Good" | "Requires Service";
  status: "Active" | "Maintenance" | "Returned";
}

const INITIAL_ASSETS: AssetRecord[] = [];

export default function AssetsPage() {
  const { employees } = useStore();
  const [assets, setAssets] = useState<AssetRecord[]>(INITIAL_ASSETS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<AssetRecord | null>(null);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<any>("Laptop / Mac");
  const [serialNumber, setSerialNumber] = useState("");
  const [assignedTo, setAssignedTo] = useState(employees[0]?.name || "Rahul Sharma");
  const [condition, setCondition] = useState<any>("Good");
  const [assetStatus, setAssetStatus] = useState<any>("Active");

  const openCreateModal = () => {
    setEditingAsset(null);
    setName(""); setSerialNumber("");
    setCategory("Laptop / Mac"); setCondition("Good"); setAssetStatus("Active");
    setAssignedTo(employees[0]?.name || "Rahul Sharma");
    setModalOpen(true);
  };

  const openEditModal = (asset: AssetRecord) => {
    setEditingAsset(asset);
    setName(asset.name); setCategory(asset.category);
    setSerialNumber(asset.serialNumber); setAssignedTo(asset.assignedTo);
    setCondition(asset.condition); setAssetStatus(asset.status);
    setModalOpen(true);
  };

  useEffect(() => {
    fetch("/api/assets")
      .then((r) => r.json())
      .then((json) => {
        if (json.success && json.data?.length) {
          setAssets(json.data);
        }
      })
      .catch(() => {});
  }, []);

  const handleSaveAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    if (editingAsset) {
      setAssets(assets.map((a) => a.id === editingAsset.id ? { ...a, name, category, serialNumber, assignedTo, condition, status: assetStatus } : a));
    } else {
      const newAsset: AssetRecord = {
        id: `asset-${Date.now()}`,
        name, category,
        serialNumber: serialNumber || `MEM-SN-${Date.now().toString().slice(-6)}`,
        assignedTo,
        issueDate: new Date().toISOString().split("T")[0],
        condition, status: "Active",
      };
      setAssets([newAsset, ...assets]);
      try {
        await fetch("/api/assets", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newAsset),
        });
      } catch {}
    }
    setName(""); setSerialNumber(""); setModalOpen(false);
  };

  const filteredAssets = assets.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.assignedTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "ALL" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Laptop className="w-5 h-5 text-[#F26722]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Company Inventory</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Agency Hardware & Asset Tracking ({filteredAssets.length})</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Laptops, cinema cameras, 4K displays, and software license allocations.
            </p>
          </div>
          <Button size="sm" onClick={openCreateModal}>
            <Plus className="w-4 h-4" /> Assign New Asset
          </Button>
        </div>

        <FilterBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          statusOptions={[
            { label: "Active", value: "Active" },
            { label: "Maintenance", value: "Maintenance" },
            { label: "Returned", value: "Returned" },
          ]}
          totalCount={filteredAssets.length}
        />

        <Card>
          <CardContent className="p-0">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3.5">Asset Name</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Serial #</th>
                  <th className="px-6 py-3.5">Assigned Employee</th>
                  <th className="px-6 py-3.5">Issue Date</th>
                  <th className="px-6 py-3.5">Condition</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-900">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-bold text-gray-900">{asset.name}</td>
                    <td className="px-6 py-4 font-semibold text-gray-600">{asset.category}</td>
                    <td className="px-6 py-4 font-mono text-gray-500">{asset.serialNumber}</td>
                    <td className="px-6 py-4 font-bold text-[#F26722]">{asset.assignedTo}</td>
                    <td className="px-6 py-4 text-gray-500">{asset.issueDate}</td>
                    <td className="px-6 py-4 font-semibold">{asset.condition}</td>
                    <td className="px-6 py-4"><Badge status={asset.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <ActionMenu
                        onEdit={() => openEditModal(asset)}
                        onDelete={() => setAssets(assets.filter((a) => a.id !== asset.id))}
                      />
                    </td>
                  </tr>
                ))}
                {filteredAssets.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Laptop className="w-8 h-8 text-gray-300 mb-2" />
                        <p className="font-semibold text-gray-900 text-sm">No hardware assets logged yet</p>
                        <p className="text-xs text-gray-400 mt-0.5">Register company MacBooks, cinema cameras, and displays.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Create / Edit Asset Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingAsset ? `Edit — ${editingAsset.name}` : "Assign New Company Asset"} description="Track hardware allocation to employee">
          <form onSubmit={handleSaveAsset} className="space-y-4">
            <Input label="Asset Name" placeholder="e.g. MacBook Pro M3 Max" value={name} onChange={(e) => setName(e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                options={[
                  { label: "Laptop / Mac", value: "Laptop / Mac" },
                  { label: "Camera & Video", value: "Camera & Video" },
                  { label: "Monitor / Display", value: "Monitor / Display" },
                  { label: "Software License", value: "Software License" },
                ]}
              />
              <Input label="Serial Number" placeholder="e.g. C02G8912MD6R" value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Select label="Assigned Employee" value={assignedTo} onChange={(e) => setAssignedTo(e.target.value)} options={employees.map((e) => ({ label: e.name, value: e.name }))} />
              <Select
                label="Condition"
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                options={[
                  { label: "Brand New", value: "Brand New" },
                  { label: "Good", value: "Good" },
                  { label: "Requires Service", value: "Requires Service" },
                ]}
              />
            </div>
            {editingAsset && (
              <Select
                label="Asset Status"
                value={assetStatus}
                onChange={(e) => setAssetStatus(e.target.value as any)}
                options={[
                  { label: "Active", value: "Active" },
                  { label: "Under Maintenance", value: "Maintenance" },
                  { label: "Returned", value: "Returned" },
                ]}
              />
            )}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">{editingAsset ? "Save Changes" : "Assign Asset"}</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
