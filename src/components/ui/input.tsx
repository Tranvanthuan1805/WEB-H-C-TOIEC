import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn("flex h-10 w-full rounded-xl px-3.5 py-2 text-[13.5px] transition-all outline-none disabled:opacity-50", className)}
    style={{
      background: "var(--input)",
      border: "1.5px solid var(--border)",
      color: "var(--foreground)",
    }}
    onFocus={e => { e.target.style.borderColor = "var(--primary)"; e.target.style.boxShadow = "0 0 0 3px var(--primary-glow)"; }}
    onBlur={e => { e.target.style.borderColor = "var(--border)"; e.target.style.boxShadow = "none"; }}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
