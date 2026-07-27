"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export function BackButton({ href, label = "Back", className }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (href) router.push(href);
    else router.back();
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
        "text-gray-600 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white",
        "bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700",
        "border border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600",
        className,
      )}
    >
      <ChevronLeft className="w-4 h-4" />
      {label}
    </button>
  );
}
