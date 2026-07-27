import { type TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error, className, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={3}
      className={cn(
        "block w-full rounded-lg border text-sm transition-colors resize-none",
        "bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100",
        "placeholder:text-gray-400 dark:placeholder:text-slate-500",
        "focus:outline-none focus:ring-2 focus:ring-[#f9701a] focus:border-transparent",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "px-3.5 py-2",
        error
          ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10"
          : "border-gray-300 dark:border-slate-600",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
