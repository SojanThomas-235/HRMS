import { type ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-r from-[#27B1AE] to-[#136F9A] text-white hover:from-[#1e9e9b] hover:to-[#0e5a7d] active:from-[#167b79] active:to-[#0a4560] shadow-sm shadow-[#27B1AE]/25 hover:shadow-md hover:shadow-[#27B1AE]/30 focus:ring-[#27B1AE]",
  secondary:
    "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700/80 dark:text-slate-200 dark:hover:bg-slate-600 border border-gray-200 dark:border-slate-600/50 focus:ring-gray-400",
  ghost:
    "bg-transparent text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-800 focus:ring-gray-400",
  danger:
    "bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 shadow-sm shadow-red-500/20 focus:ring-red-500",
  outline:
    "border border-[#dde8f0] dark:border-slate-600 bg-transparent text-gray-700 dark:text-slate-300 hover:bg-[#f0f8f8] dark:hover:bg-slate-800 focus:ring-[#27B1AE]",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-9 px-4 text-sm gap-2",
  lg: "h-10 px-5 text-sm gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, leftIcon, rightIcon, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled ?? loading}
      className={cn(
        "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
);
Button.displayName = "Button";
