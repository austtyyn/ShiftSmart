import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-bold tracking-widest uppercase text-[#888] font-[var(--font-display)]"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          type={type}
          className={cn(
            "h-12 w-full rounded-lg bg-[#1A1A1A] border border-[#2A2A2A] px-4 text-[#F5F5F5] placeholder:text-[#555] transition-colors",
            "focus:outline-none focus:border-[#FF6B35] focus:ring-1 focus:ring-[#FF6B35]",
            error && "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-xs text-[#EF4444]">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-[#888]">{hint}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
