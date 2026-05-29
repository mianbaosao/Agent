import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors shadow-[0_2px_8px_rgba(116,82,43,0.08)]",
  {
    variants: {
      variant: {
        default: "border-[#2d5f9a]/35 bg-[#dce8f6]/85 text-[#153f73]",
        success: "border-[#6c9a65]/45 bg-[#e4efdf]/90 text-[#34622e]",
        warning: "border-[#e3b72f]/55 bg-[#fff2b8]/90 text-[#806018]",
        danger: "border-[#c8413a]/45 bg-[#f7dfdc]/90 text-[#a72f2c]",
        muted: "border-[#c4cad4] bg-white/55 text-[#4b5568]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
