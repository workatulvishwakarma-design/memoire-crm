import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function Avatar({ className, src, name, size = "md", ...props }: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const sizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-11 h-11 text-base",
    xl: "w-16 h-16 text-xl font-bold",
  };

  const getInitials = (n: string) => {
    if (!n) return "M";
    const parts = n.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return n.slice(0, 2).toUpperCase();
  };

  if (src && !imageError) {
    return (
      <div className={cn("relative rounded-full overflow-hidden shrink-0 border border-gray-200", sizes[size], className)} {...props}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full bg-[#111827] text-white flex items-center justify-center font-semibold shrink-0 shadow-xs border border-gray-800",
        sizes[size],
        className
      )}
      {...props}
    >
      {getInitials(name)}
    </div>
  );
}

export function AvatarGroup({ employees }: { employees: { name: string; avatar?: string }[] }) {
  return (
    <div className="flex -space-x-2 overflow-hidden">
      {employees.slice(0, 4).map((emp, i) => (
        <Avatar key={i} name={emp.name} src={emp.avatar} size="sm" className="ring-2 ring-white" />
      ))}
      {employees.length > 4 && (
        <div className="w-7 h-7 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-600">
          +{employees.length - 4}
        </div>
      )}
    </div>
  );
}
