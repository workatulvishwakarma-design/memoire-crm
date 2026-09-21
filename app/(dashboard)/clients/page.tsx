"use client";

import React from "react";
import { useStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { ClientTable } from "@/components/crm/ClientTable";
import { ClientDetailView } from "@/components/crm/ClientDetailView";

export default function ClientsPage() {
  const { selectedClientId, setSelectedClientId } = useStore();

  return (
    <AppShell>
      {selectedClientId ? (
        <ClientDetailView clientId={selectedClientId} onBack={() => setSelectedClientId(null)} />
      ) : (
        <ClientTable />
      )}
    </AppShell>
  );
}
