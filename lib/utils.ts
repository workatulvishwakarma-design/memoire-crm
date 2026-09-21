import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function getStatusBadgeVariant(status: string) {
  const s = status.toLowerCase();
  if (["active", "won", "completed", "approved", "present", "paid", "resolved"].includes(s)) {
    return "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm";
  }
  if (["in progress", "qualified", "proposal sent", "under review", "waiting", "review", "negotiation"].includes(s)) {
    return "bg-amber-50 text-amber-700 border-amber-200 shadow-sm";
  }
  if (["new", "planning", "contacted", "requested", "to do"].includes(s)) {
    return "bg-blue-50 text-blue-700 border-blue-200 shadow-sm";
  }
  if (["urgent", "overdue", "lost", "rejected", "absent", "blocked", "cancelled"].includes(s)) {
    return "bg-rose-50 text-rose-700 border-rose-200 shadow-sm";
  }
  return "bg-gray-50 text-gray-700 border-gray-200 shadow-sm";
}
