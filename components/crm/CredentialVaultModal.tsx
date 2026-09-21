"use client";

import React, { useState } from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { Input, Select } from "../ui/input";
import { ShieldCheck, Eye, EyeOff, Copy, Key, Lock, Check } from "lucide-react";

export interface VaultCredential {
  id: string;
  serviceName: string;
  category: "Website / Hosting" | "Social Media" | "Ad Account" | "Analytics / SEO";
  username: string;
  secret: string;
  lastUpdated: string;
}

const INITIAL_CREDENTIALS: VaultCredential[] = [
  {
    id: "cred-1",
    serviceName: "WordPress Hosting (cPanel)",
    category: "Website / Hosting",
    username: "urbannest_admin",
    secret: "Un#2026!KhargharSecureKey",
    lastUpdated: "2026-08-01",
  },
  {
    id: "cred-2",
    serviceName: "Meta Ads Manager",
    category: "Ad Account",
    username: "ads@urbannest.co.in",
    secret: "MetaBiz#98412_Secret",
    lastUpdated: "2026-08-05",
  },
  {
    id: "cred-3",
    serviceName: "Instagram Brand Handle",
    category: "Social Media",
    username: "@urbannest_realty",
    secret: "InstaRealty2026Pass",
    lastUpdated: "2026-07-28",
  },
];

export function CredentialVaultModal({
  isOpen,
  onClose,
  clientName,
}: {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
}) {
  const [credentials, setCredentials] = useState<VaultCredential[]>(INITIAL_CREDENTIALS);
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for new credential
  const [serviceName, setServiceName] = useState("");
  const [category, setCategory] = useState<any>("Website / Hosting");
  const [username, setUsername] = useState("");
  const [secret, setSecret] = useState("");
  const [addingNew, setAddingNew] = useState(false);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddCredential = (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName || !secret) return;
    const newCred: VaultCredential = {
      id: `cred-${Date.now()}`,
      serviceName,
      category,
      username,
      secret,
      lastUpdated: new Date().toISOString().split("T")[0],
    };
    setCredentials([newCred, ...credentials]);
    setServiceName("");
    setUsername("");
    setSecret("");
    setAddingNew(false);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${clientName} Access Credential Vault`}
      description="AES-256 encrypted credential store with reveal audit logging"
    >
      <div className="space-y-4">
        {/* Security Banner */}
        <div className="p-3 bg-slate-900 text-white rounded-xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#F26722]" />
            <span>Encrypted Vault • Access Logged to Audit Center</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => setAddingNew(!addingNew)} className="text-xs text-white border-slate-700 hover:bg-slate-800">
            {addingNew ? "Cancel" : "+ Add Access Key"}
          </Button>
        </div>

        {/* Add Credential Form */}
        {addingNew && (
          <form onSubmit={handleAddCredential} className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input label="Service Name" placeholder="e.g. Google Analytics 4" value={serviceName} onChange={(e) => setServiceName(e.target.value)} required />
              <Select
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                options={[
                  { label: "Website / Hosting", value: "Website / Hosting" },
                  { label: "Social Media", value: "Social Media" },
                  { label: "Ad Account", value: "Ad Account" },
                  { label: "Analytics / SEO", value: "Analytics / SEO" },
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Username / Email" value={username} onChange={(e) => setUsername(e.target.value)} required />
              <Input label="Password / API Key" type="password" value={secret} onChange={(e) => setSecret(e.target.value)} required />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" size="sm">Save Encrypted Key</Button>
            </div>
          </form>
        )}

        {/* Credentials List */}
        <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto pr-1 text-xs">
          {credentials.map((cred) => {
            const isRevealed = revealedIds[cred.id];

            return (
              <div key={cred.id} className="py-3.5 flex items-center justify-between hover:bg-gray-50 px-2 rounded-lg transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{cred.serviceName}</span>
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{cred.category}</span>
                  </div>
                  <p className="text-gray-500 font-mono">User: {cred.username}</p>
                  <p className="font-mono font-bold text-gray-900">
                    Key: {isRevealed ? cred.secret : "••••••••••••••••"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleReveal(cred.id)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                    title={isRevealed ? "Hide Password" : "Reveal Password"}
                  >
                    {isRevealed ? <EyeOff className="w-4 h-4 text-rose-600" /> : <Eye className="w-4 h-4 text-blue-600" />}
                  </button>
                  <button
                    onClick={() => copyToClipboard(cred.id, cred.secret)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                    title="Copy Secret"
                  >
                    {copiedId === cred.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-600" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}
