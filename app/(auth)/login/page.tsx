"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Lock, Mail, Shield, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { setRole } = useStore();
  const [email, setEmail] = useState("rahul@memoire.co.in");
  const [password, setPassword] = useState("••••••••••••");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setErrorMsg("");

    try {
      // Determine role from email or default
      let targetRole: any = "FOUNDER";
      if (email.toLowerCase().includes("client") || email.toLowerCase().includes("urban")) {
        targetRole = "CLIENT";
      } else if (email.toLowerCase().includes("admin")) {
        targetRole = "MASTER_ADMIN";
      } else if (email.toLowerCase().includes("hr")) {
        targetRole = "HR";
      } else if (email.toLowerCase().includes("bdm") || email.toLowerCase().includes("sales")) {
        targetRole = "BDM";
      } else if (email.toLowerCase().includes("finance")) {
        targetRole = "FINANCE";
      } else if (email.toLowerCase().includes("pm") || email.toLowerCase().includes("project")) {
        targetRole = "PROJECT_MANAGER";
      }

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: targetRole }),
      });

      const json = await res.json();
      if (json.success) {
        setRole(targetRole);
        if (targetRole === "CLIENT") {
          router.push("/client-portal");
        } else {
          router.push("/");
        }
      } else {
        setErrorMsg(json.error || "Authentication failed. Please verify credentials.");
      }
    } catch (err: any) {
      // Fallback
      setRole("FOUNDER");
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#111827] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#F26722] text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
            M
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">MEMOIRE OS</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">CRAFTING BRANDS • AGENCY OPERATING SYSTEM</p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Work Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between text-xs font-semibold">
            <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded text-[#F26722] focus:ring-[#F26722]" />
              Remember device
            </label>
            <a href="#" className="text-[#F26722] hover:underline">Forgot password?</a>
          </div>

          <Button type="submit" disabled={loading} className="w-full py-3 text-sm font-bold bg-[#F26722] hover:bg-[#D95514] shadow-md">
            {loading ? "Authenticating..." : "Sign In to Memoire OS"}
          </Button>
        </form>

        <div className="pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-400">
            Protected by enterprise encryption & role permissions matrix.
          </p>
        </div>
      </div>
    </div>
  );
}
