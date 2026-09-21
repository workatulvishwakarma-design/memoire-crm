import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";

    const variants = {
      primary: "bg-[#F26722] hover:bg-[#D95514] text-white focus:ring-[#F26722] shadow-sm",
      secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-300",
      outline: "border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-[#F26722]",
      ghost: "hover:bg-gray-100 text-gray-700 focus:ring-gray-300",
      danger: "bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs gap-1.5",
      md: "px-4 py-2 text-sm gap-2",
      lg: "px-5 py-2.5 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
