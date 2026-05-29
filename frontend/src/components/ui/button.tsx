import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e3b72f] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#183b72] text-[#fff7d6] shadow-[0_8px_18px_rgba(24,59,114,0.18)] hover:bg-[#102e5d]",
        ghost: "text-[#26324a] hover:bg-[#e8eef7]/80 hover:text-[#10233f]",
        outline: "border border-[#b9c2d1] bg-white/65 text-[#26324a] hover:bg-[#f4f6f9]",
      },
      size: {
        default: "h-9 px-4 py-2",
        icon: "h-9 w-9",
        sm: "h-8 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);

Button.displayName = "Button";
