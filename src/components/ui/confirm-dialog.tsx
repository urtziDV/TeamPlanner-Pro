"use client";

import { useState, useCallback, useRef } from "react";
import { AlertTriangle, Trash2, ShieldAlert, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "destructive" | "warning" | "default";
};

type ConfirmState = ConfirmOptions & {
  open: boolean;
  resolve: (value: boolean) => void;
};

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    open: false,
    title: "",
    resolve: () => {},
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({ ...options, open: true, resolve });
    });
  }, []);

  const handleConfirm = () => {
    state.resolve(true);
    setState((s) => ({ ...s, open: false }));
  };

  const handleCancel = () => {
    state.resolve(false);
    setState((s) => ({ ...s, open: false }));
  };

  return { confirm, confirmState: state, handleConfirm, handleCancel };
}

// ─── Dialog Component ─────────────────────────────────────────────────────────

const variantConfig = {
  destructive: {
    icon: Trash2,
    iconClass: "text-red-500",
    iconBg: "bg-red-500/10",
    confirmClass: "bg-red-600 hover:bg-red-700 text-white border-0",
    ring: "ring-red-500/20",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-500",
    iconBg: "bg-amber-500/10",
    confirmClass: "bg-amber-600 hover:bg-amber-700 text-white border-0",
    ring: "ring-amber-500/20",
  },
  default: {
    icon: HelpCircle,
    iconClass: "text-primary",
    iconBg: "bg-primary/10",
    confirmClass: "bg-primary hover:bg-primary/90 text-primary-foreground border-0",
    ring: "ring-primary/20",
  },
};

export function ConfirmDialog({
  confirmState,
  onConfirm,
  onCancel,
}: {
  confirmState: ConfirmState;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const variant = confirmState.variant ?? "default";
  const cfg = variantConfig[variant];
  const Icon = cfg.icon;

  if (!confirmState.open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      aria-modal="true"
      role="alertdialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in-0 duration-150"
        onClick={onCancel}
      />

      {/* Panel */}
      <div
        className={`relative z-10 w-full max-w-sm mx-4 bg-popover rounded-2xl shadow-2xl ring-1 ${cfg.ring} ring-inset p-6 animate-in fade-in-0 zoom-in-95 duration-150`}
      >
        {/* Icon */}
        <div className={`w-12 h-12 rounded-full ${cfg.iconBg} flex items-center justify-center mb-4`}>
          <Icon className={`w-6 h-6 ${cfg.iconClass}`} strokeWidth={2} />
        </div>

        {/* Title */}
        <h2 className="text-base font-semibold text-foreground mb-1">
          {confirmState.title}
        </h2>

        {/* Message */}
        {confirmState.message && (
          <p className="text-sm text-muted-foreground mb-5">
            {confirmState.message}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end mt-5">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-input bg-background hover:bg-muted text-foreground transition-colors"
          >
            {confirmState.cancelLabel ?? "Cancelar"}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${cfg.confirmClass}`}
          >
            {confirmState.confirmLabel ?? "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
