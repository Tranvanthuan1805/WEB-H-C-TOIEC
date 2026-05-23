import * as React from "react";
import { cn } from "@/lib/utils";

const variantStyles: Record<string, React.CSSProperties> = {
  default:     { background:"var(--primary)", color:"#fff" },
  secondary:   { background:"var(--bg-secondary)", color:"var(--muted)", border:"1px solid var(--border)" },
  success:     { background:"rgba(16,185,129,0.12)", color:"#059669" },
  warning:     { background:"rgba(245,158,11,0.12)", color:"#d97706" },
  destructive: { background:"rgba(239,68,68,0.12)",  color:"#dc2626" },
  outline:     { background:"transparent", border:"1px solid var(--border)", color:"var(--muted)" },
  purple:      { background:"rgba(168,85,247,0.12)", color:"#9333ea" },
  blue:        { background:"rgba(59,130,246,0.12)", color:"#2563eb" },
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variantStyles;
}

function Badge({ className, variant = "default", style, ...props }: BadgeProps) {
  return (
    <span
      className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold leading-none", className)}
      style={{ ...variantStyles[variant], ...style }}
      {...props}
    />
  );
}

export { Badge };
