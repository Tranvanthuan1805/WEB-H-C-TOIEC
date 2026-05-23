import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] disabled:opacity-50 disabled:pointer-events-none select-none",
  {
    variants: {
      variant: {
        default: "text-white shadow-sm active:scale-[0.97]",
        secondary: "active:scale-[0.97]",
        outline: "border active:scale-[0.97]",
        ghost: "active:scale-[0.97]",
        destructive: "bg-red-500 text-white hover:bg-red-600 active:scale-[0.97]",
        success: "bg-emerald-500 text-white hover:bg-emerald-600 active:scale-[0.97]",
      },
      size: {
        sm:   "h-8 px-3 text-[12px] rounded-lg",
        default: "h-10 px-4 text-[13px] rounded-xl",
        lg:   "h-11 px-6 text-[14px] rounded-xl",
        icon: "h-9 w-9 rounded-xl",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, style, ...props }, ref) => {
    const variantStyles: React.CSSProperties = {};
    if (variant === "default" || !variant) {
      variantStyles.background = "linear-gradient(135deg, var(--primary), var(--primary-dark))";
    } else if (variant === "secondary") {
      variantStyles.background = "var(--bg-secondary)";
      variantStyles.color = "var(--foreground)";
      variantStyles.border = "1px solid var(--border)";
    } else if (variant === "outline") {
      variantStyles.background = "transparent";
      variantStyles.color = "var(--foreground)";
      variantStyles.borderColor = "var(--border)";
    } else if (variant === "ghost") {
      variantStyles.background = "transparent";
      variantStyles.color = "var(--foreground)";
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        style={{ ...variantStyles, ...style }}
        onMouseEnter={e => {
          if (variant === "secondary" || variant === "outline" || variant === "ghost") {
            e.currentTarget.style.background = "var(--bg)";
          }
        }}
        onMouseLeave={e => {
          if (variant === "secondary") e.currentTarget.style.background = "var(--bg-secondary)";
          else if (variant === "outline" || variant === "ghost") e.currentTarget.style.background = "transparent";
        }}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
