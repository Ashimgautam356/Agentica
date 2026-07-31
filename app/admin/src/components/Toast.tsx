import { RiCheckboxCircleLine, RiCloseLine, RiErrorWarningLine } from "@remixicon/react";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

type ToastKind = "success" | "error";
type Toast = {
  id: number;
  kind: ToastKind;
  message: string;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((kind: ToastKind, message: string) => {
    const id = Date.now();

    setToasts((current) => [...current.slice(-2), { id, kind, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 3200);
  }, []);

  const value = useMemo(
    () => ({
      success: (message: string) => show("success", message),
      error: (message: string) => show("error", message),
    }),
    [show],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed left-1/2 top-4 z-[90] grid w-[min(92vw,28rem)] -translate-x-1/2 gap-2"
      >
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onClose={() => setToasts((current) => current.filter((item) => item.id !== toast.id))}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const toast = useContext(ToastContext);

  if (!toast) {
    throw new Error("useToast must be used within ToastProvider.");
  }

  return toast;
}

function ToastItem({ onClose, toast }: { onClose: () => void; toast: Toast }) {
  const isSuccess = toast.kind === "success";
  const Icon = isSuccess ? RiCheckboxCircleLine : RiErrorWarningLine;

  return (
    <div
      className={`pointer-events-auto flex min-h-14 items-start gap-3 rounded-lg border bg-white px-4 py-3 shadow-[0_18px_50px_rgba(36,31,20,0.16)] motion-safe:animate-[toast-slide-down_220ms_ease-out_both] ${
        isSuccess
          ? "border-[#BFE8CB] bg-[#EAF8EF] text-[#1F7A3D]"
          : "border-[#F3C8C2] bg-white text-[#C94738]"
      }`}
      role="status"
    >
      <Icon className="mt-0.5 shrink-0" size={20} />
      <p className="m-0 min-w-0 flex-1 text-sm font-bold leading-5 text-[#241F14] text-wrap-pretty">
        {toast.message}
      </p>
      <button
        aria-label="Close alert"
        className="grid size-8 shrink-0 place-items-center rounded-lg text-[#8A8172] transition-[background-color,color,transform] duration-150 hover:bg-[#FBF8F2] hover:text-[#241F14] active:scale-95"
        onClick={onClose}
        type="button"
      >
        <RiCloseLine size={18} />
      </button>
    </div>
  );
}
