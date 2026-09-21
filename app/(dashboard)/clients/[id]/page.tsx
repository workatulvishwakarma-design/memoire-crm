"use client";

import React, { use } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ClientDetailView } from "@/components/crm/ClientDetailView";
import { useRouter } from "next/navigation";

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  return (
    <AppShell>
      <ClientDetailView clientId={resolvedParams.id} onBack={() => router.push("/clients")} />
    </AppShell>
  );
}
