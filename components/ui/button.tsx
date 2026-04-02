import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-[var(--font-display)] font-bold tracking-wide uppercase text-sm transition-all duration-150 cursor-pointer disabled:pointer-events-none disabled:opacity-40 select-none",
  {
    variants: {
      variant: {
        default:
          "bg-[#FF6B35] text-white hover:bg-[#FF8555] active:scale-[0.98]",
        secondary:
          "bg-[#1A1A1A] text-[#F5F5F5] border border-[#2A2A2A] hover:bg-[#242424] hover:border-[#3A3A3A]",
        ghost:
          "text-[#888] hover:text-[#F5F5F5] hover:bg-[#1A1A1A]",
        danger:
          "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/20",
        success:
          "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/30 hover:bg-[#22C55E]/20",
        warning:
          "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/30 hover:bg-[#F59E0B]/20",
        outline:
          "border border-[#FF6B35] text-[#FF6B35] hover:bg-[#FF6B35]/10",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md",
        default: "h-11 px-5 rounded-lg",
        lg: "h-14 px-8 text-base rounded-xl",
        icon: "h-11 w-11 rounded-lg",
        "icon-sm": "h-8 w-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
