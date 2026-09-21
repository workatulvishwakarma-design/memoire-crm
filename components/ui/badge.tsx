import * as React from "react";
import { cn, getStatusBadgeVariant } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status?: string;
  variant?: "default" | "orange" | "emerald" | "rose" | "blue" | "gray";
}

export function Badge({ className, status, variant = "default", children, ...props }: BadgeProps) {
  if (status) {
    return (
      <span
        className={cn(
          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
          getStatusBadgeVariant(status),
          className
        )}
        {...props}
      >
        {status}
      </span>
    );
  }

  const variants = {
    default: "bg-gray-100 text-gray-800 border-gray-200",
    orange: "bg-orange-50 text-[#F26722] border-orange-200",
    emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rose: "bg-rose-50 text-rose-700 border-rose-200",
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    gray: "bg-gray-50 text-gray-600 border-gray-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
