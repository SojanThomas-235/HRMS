import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  leftAddon?: React.ReactNode;
  rightAddon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, leftAddon, rightAddon, className, ...props }, ref) => (
    <div className="relative flex items-center">
      {leftAddon && (
        <div className="absolute left-3 text-gray-400 dark:text-slate-500 pointer-events-none">
          {leftAddon}
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          "block w-full rounded-lg border text-sm transition-colors",
          "bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100",
          "placeholder:text-gray-400 dark:placeholder:text-slate-500",
          "focus:outline-none focus:ring-2 focus:ring-[#f9701a] focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          error
            ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
            : "border-gray-300 dark:border-slate-600",
          leftAddon  ? "pl-9"  : "pl-3.5",
          rightAddon ? "pr-9"  : "pr-3.5",
          "py-2",
          className
        )}
        {...props}
      />
      {rightAddon && (
        <div className="absolute right-3 text-gray-400 dark:text-slate-500 pointer-events-none">
          {rightAddon}
        </div>
      )}
    </div>
  )
);
Input.displayName = "Input";
