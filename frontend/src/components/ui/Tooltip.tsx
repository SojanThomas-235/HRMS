"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  label: string;
  children: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  className?: string;
}

/**
 * Custom luxury tooltip — dark pill with a directional arrow.
 * Wrap any element with <Tooltip label="…"> to add a hover tooltip.
 *
 * Example:
 *   <Tooltip label="Open full profile">
 *     <button>…</button>
 *   </Tooltip>
 */
export function Tooltip({ label, children, side = "top", className }: TooltipProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}

      {/* Floating label */}
      <div
        role="tooltip"
        aria-hidden={!visible}
        className={cn(
          "absolute z-[70] pointer-events-none select-none",
          "transition-all duration-150",
          visible ? "opacity-100 scale-100" : "opacity-0 scale-95",
          // Position
          side === "top"    && "bottom-full left-1/2 -translate-x-1/2 mb-2.5 origin-bottom",
          side === "bottom" && "top-full    left-1/2 -translate-x-1/2 mt-2.5 origin-top",
          side === "left"   && "right-full  top-1/2  -translate-y-1/2 mr-2.5 origin-right",
          side === "right"  && "left-full   top-1/2  -translate-y-1/2 ml-2.5 origin-left",
        )}
      >
        {/* Pill */}
        <div className="relative px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shadow-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900">
          {label}

          {/* Arrow */}
          <span
            className={cn(
              "absolute w-2.5 h-2.5 rotate-45 bg-gray-900 dark:bg-white",
              side === "top"    && "top-full left-1/2 -translate-x-1/2 -mt-[5px]",
              side === "bottom" && "bottom-full left-1/2 -translate-x-1/2 mb-[-5px]",
              side === "left"   && "left-full  top-1/2 -translate-y-1/2 -ml-[5px]",
              side === "right"  && "right-full top-1/2 -translate-y-1/2 mr-[-5px]",
            )}
          />
        </div>
      </div>
    </div>
  );
}
