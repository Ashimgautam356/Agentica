"use client";

import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { useEffect } from "react";

type ToastMessageProps = {
  message: string;
  onClose: () => void;
  tone?: "success" | "normal" | "error";
};

export function ToastMessage({ message, onClose, tone = "normal" }: ToastMessageProps) {
  const styles = {
    success: {
      container: "border-emerald-200 bg-emerald-50 text-emerald-950",
      icon: "bg-emerald-500 text-white",
      Icon: CircleCheck,
    },
    normal: {
      container: "border-blue-200 bg-blue-50 text-blue-950",
      icon: "bg-blue-500 text-white",
      Icon: Info,
    },
    error: {
      container: "border-red-200 bg-red-50 text-red-950",
      icon: "bg-red-500 text-white",
      Icon: CircleAlert,
    },
  }[tone];
  const Icon = styles.Icon;

  useEffect(() => {
    const timeout = window.setTimeout(onClose, 2500);

    return () => window.clearTimeout(timeout);
  }, [onClose, message]);

  return (
    <div
      aria-live="polite"
      className={`toast-enter fixed top-4 left-1/2 z-[160] flex w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 items-center gap-3 rounded-xl border p-3.5 text-sm font-semibold shadow-[0_16px_45px_rgba(9,39,68,0.18)] ${styles.container}`}
      role="status"
    >
      <span className={`grid size-8 shrink-0 place-items-center rounded-full ${styles.icon}`}>
        <Icon className="size-4.5" aria-hidden="true" />
      </span>
      <span className="flex-1 leading-5">{message}</span>
      <button
        aria-label="Close notification"
        className="grid size-7 shrink-0 place-items-center rounded-full text-current/60 transition hover:bg-black/5 hover:text-current"
        type="button"
        onClick={onClose}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
