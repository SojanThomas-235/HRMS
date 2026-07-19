import { type SelectHTMLAttributes, forwardRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  placeholder?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ error, placeholder, options, className, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "block w-full appearance-none rounded-lg border text-sm transition-colors",
          "bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "pl-3.5 pr-9 py-2",
          error
            ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
            : "border-gray-300 dark:border-slate-600",
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500 pointer-events-none" />
    </div>
  )
);
Select.displayName = "Select";
