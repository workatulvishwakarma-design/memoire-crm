"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Select } from "@/components/ui/input";
import { FileText, Download, Plus, Search, Trash2 } from "lucide-react";

export default function DocumentsPage() {
  const { documents, uploadDocument, deleteDocument } = useStore();
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [category, setCategory] = useState<any>("Brand Assets");
  const [fileType, setFileType] = useState<any>("pdf");
  const [size, setSize] = useState("4.2 MB");

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    uploadDocument({
      name,
      category,
      size,
      uploadedBy: "Rahul Sharma",
      tags: ["Memoire OS", category],
      fileType,
    });
    setName("");
    setModalOpen(false);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-5 h-5 text-[#F26722]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Enterprise Vault</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Document Vault & Brand Assets ({documents.length})</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Contracts, brand guidelines, client proposals, and Figma project files.
            </p>
          </div>
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="w-4 h-4" /> Upload Document
          </Button>
        </div>

        {documents.length === 0 ? (
          <div className="py-16 text-center text-gray-500 bg-white rounded-2xl border border-gray-200">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-gray-900 text-sm">No documents uploaded</p>
            <p className="text-xs text-gray-400 mt-0.5">Upload contracts, brand guidelines, or assets to the vault.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {documents.map((doc) => (
              <Card key={doc.id} className="p-5 space-y-3 border-t-4 border-t-[#F26722] hover:shadow-md transition-all">
                <div className="flex items-center justify-between">
                  <Badge variant="orange">{doc.category}</Badge>
                  <span className="text-[11px] font-bold text-gray-400 uppercase">{doc.fileType}</span>
                </div>
                <h3 className="font-bold text-xs text-gray-900 leading-snug truncate" title={doc.name}>
                  {doc.name}
                </h3>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                  <span>{doc.size}</span>
                  <span className="text-gray-400">By {doc.uploadedBy}</span>
                </div>
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Download className="w-4 h-4" /> Download
                  </Button>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-2 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Upload Document Modal */}
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Upload Document to Vault" description="Save enterprise asset into Memoire OS">
          <form onSubmit={handleUpload} className="space-y-4">
            <Input label="Document Title" placeholder="e.g. UrbanNest Q3 Master Agreement.pdf" value={name} onChange={(e) => setName(e.target.value)} required />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                options={[
                  { label: "Brand Assets", value: "Brand Assets" },
                  { label: "Contracts", value: "Contracts" },
                  { label: "Project Documents", value: "Project Documents" },
                  { label: "Proposals", value: "Proposals" },
                ]}
              />
              <Select
                label="File Format"
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                options={[
                  { label: "PDF Document", value: "pdf" },
                  { label: "Figma File", value: "figma" },
                  { label: "PNG Image", value: "png" },
                  { label: "ZIP Archive", value: "zip" },
                ]}
              />
            </div>
            <Input label="File Size Display" value={size} onChange={(e) => setSize(e.target.value)} placeholder="e.g. 5.4 MB" />
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit">Upload File</Button>
            </div>
          </form>
        </Modal>
      </div>
    </AppShell>
  );
}
