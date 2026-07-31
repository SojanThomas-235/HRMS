import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "purple" | "teal";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-600 dark:bg-slate-700/80 dark:text-slate-300 border border-gray-200/60 dark:border-slate-600/40",
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-700/40",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200/60 dark:border-amber-700/40",
  danger:  "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200/60 dark:border-red-700/40",
  info:    "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200/60 dark:border-blue-700/40",
  purple:  "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200/60 dark:border-purple-700/40",
  teal:    "bg-[#e8f7f7] text-[#136F9A] dark:bg-[#27B1AE]/15 dark:text-[#4fc4c1] border border-[#9ae8e6]/60 dark:border-[#27B1AE]/30",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-gray-400",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger:  "bg-red-500",
  info:    "bg-blue-500",
  purple:  "bg-purple-500",
  teal:    "bg-[#27B1AE]",
};

export function Badge({ variant = "default", children, className, dot }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold",
      variants[variant],
      className
    )}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors[variant])} />}
      {children}
    </span>
  );
}
