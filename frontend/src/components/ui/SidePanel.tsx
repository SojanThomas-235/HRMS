"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Extra classes on the panel itself (e.g. custom width) */
  className?: string;
}

/**
 * Slide-in panel from the right edge.
 * Closes on backdrop click or Escape key.
 *
 * Example:
 *   <SidePanel open={!!selected} onClose={() => setSelected(null)}>
 *     <SidePanel.Header onClose={() => setSelected(null)}>Employee Details</SidePanel.Header>
 *     <SidePanel.Body>…content…</SidePanel.Body>
 *   </SidePanel>
 */
export function SidePanel({ open, onClose, children, className }: SidePanelProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 transition-all duration-300",
          "bg-black/10 dark:bg-black/40 backdrop-blur-[2px]",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed top-0 right-0 h-full z-50",
          "flex flex-col",
          "w-[400px] max-w-[92vw]",
          "bg-white dark:bg-slate-900",
          "border-l border-gray-200/80 dark:border-slate-700",
          "shadow-[-24px_0_80px_rgba(0,0,0,0.09)] dark:shadow-[-24px_0_80px_rgba(0,0,0,0.4)]",
          "transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          open ? "translate-x-0" : "translate-x-full",
          className,
        )}
      >
        {children}
      </aside>
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

SidePanel.Header = function SidePanelHeader({
  onClose,
  children,
  actions,
  className,
}: {
  onClose: () => void;
  children?: React.ReactNode;
  /** Icon buttons rendered between the title and the close button */
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between px-5 py-4",
      "border-b border-gray-100 dark:border-slate-700/60 shrink-0",
      className,
    )}>
      <span className="text-sm font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
        {children}
      </span>
      <div className="flex items-center gap-0.5">
        {actions}
        {/* Divider if actions present */}
        {actions && (
          <span className="w-px h-4 bg-gray-200 dark:bg-slate-700 mx-1" />
        )}
        <button
          onClick={onClose}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            "text-gray-400 hover:text-gray-700 dark:text-slate-500 dark:hover:text-slate-200",
            "hover:bg-gray-100 dark:hover:bg-slate-700",
          )}
          aria-label="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

SidePanel.Body = function SidePanelBody({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex-1 overflow-y-auto", className)}>
      {children}
    </div>
  );
};

SidePanel.Footer = function SidePanelFooter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "shrink-0 px-5 py-4",
      "border-t border-gray-100 dark:border-slate-700/60",
      className,
    )}>
      {children}
    </div>
  );
};
