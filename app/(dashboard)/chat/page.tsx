"use client";

import { AppShell } from "@/components/layout/AppShell";
import { InternalChat } from "@/components/chat/InternalChat";

export default function ChatPage() {
  return (
    <AppShell>
      <InternalChat />
    </AppShell>
  );
}
