import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "success" | "warning" | "danger" | "muted";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-bold tracking-wider uppercase font-[var(--font-display)]",
        {
          "bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]/30": variant === "accent",
          "bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/30": variant === "success",
          "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/30": variant === "warning",
          "bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/30": variant === "danger",
          "bg-[#888]/20 text-[#888] border border-[#888]/30": variant === "muted",
          "bg-[#F5F5F5]/10 text-[#F5F5F5] border border-[#F5F5F5]/20": variant === "default",
        },
        className
      )}
      {...props}
    />
  );
}
