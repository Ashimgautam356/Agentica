"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

type ToastMessageProps = {
  message: string;
  onClose: () => void;
  tone?: "success" | "error";
};

export function ToastMessage({ message, onClose, tone = "error" }: ToastMessageProps) {
  const className =
    tone === "success"
      ? "border-main-green/30 bg-main-green/10 text-text-dark"
      : "border-[#f7c6c6] bg-red-50 text-red-700";

  useEffect(() => {
    const timeout = window.setTimeout(onClose, 2500);

    return () => window.clearTimeout(timeout);
  }, [onClose, message]);

  return (
    <div
      className={`fixed top-1/2 left-1/2 z-[160] flex max-w-84 -translate-x-1/2 -translate-y-1/2 items-center gap-3 rounded-md border px-4 py-3 text-center text-sm font-extrabold shadow-[0_18px_50px_rgba(9,39,68,0.12)] ${className}`}
    >
      <span>{message}</span>
      <button className="grid h-6 w-6 place-items-center" type="button" onClick={onClose}>
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
