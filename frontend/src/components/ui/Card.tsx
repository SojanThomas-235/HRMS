import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddings = { none: "", sm: "p-4", md: "p-5", lg: "p-6" };

export function Card({ children, className, padding = "md" }: CardProps) {
  return (
    <div className={cn(
      "bg-white dark:bg-slate-800 rounded-2xl",
      "border border-[#dde8f0] dark:border-slate-700/60",
      "shadow-[0_2px_12px_-2px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
      paddings[padding],
      className
    )}>
      {children}
    </div>
  );
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className, icon }: { children: React.ReactNode; className?: string; icon?: React.ReactNode }) {
  return (
    <h3 className={cn("flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100", className)}>
      {icon && <span className="text-gray-400 dark:text-slate-500">{icon}</span>}
      {children}
    </h3>
  );
}

export function CardDivider() {
  return <div className="border-t border-gray-100 dark:border-slate-700 -mx-5 my-4" />;
}
