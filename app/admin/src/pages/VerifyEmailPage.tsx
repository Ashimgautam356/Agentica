import { RiArrowLeftLine, RiRefreshLine, RiShieldCheckLine } from "@remixicon/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type ClipboardEvent,
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { currentAdminQueryOptions } from "../api/admin";
import { adminQueryKeys } from "../api/admin/queryKeys";
import { api } from "../api/client";
import { ButtonSpinner } from "../components/ButtonSpinner";
import { useToast } from "../components/Toast";
import logoUrl from "../assets/agentica.svg";
import { getErrorMessage } from "../lib/utils";

const pinLength = 6;
const resendCooldownSeconds = 5;

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { data: admin, isLoading } = useQuery(currentAdminQueryOptions());
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const requestedInitialPin = useRef(false);
  const [pin, setPin] = useState(() => Array(pinLength).fill(""));
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendWait, setResendWait] = useState(0);

  const code = useMemo(() => pin.join(""), [pin]);
  const isComplete = code.length === pinLength;
  const isResendDisabled = isResending || resendWait > 0;

  const sendVerificationPin = useCallback(
    async (showSuccessToast: boolean) => {
      setError("");
      setIsResending(true);

      try {
        await api("/api/admin/verify-email/resend", { method: "POST" });
        setResendWait(resendCooldownSeconds);

        if (showSuccessToast) {
          toast.success("A new PIN has been sent to your Gmail.");
        }
      } catch (resendError) {
        const message = getErrorMessage(resendError, "Could not resend verification PIN");

        setError(message);
        toast.error(message);
      } finally {
        setIsResending(false);
      }
    },
    [toast],
  );

  useEffect(() => {
    if (isLoading || !admin || admin.emailVerifiedAt || requestedInitialPin.current) {
      return;
    }

    requestedInitialPin.current = true;
    void sendVerificationPin(false);
  }, [admin, isLoading, sendVerificationPin]);

  useEffect(() => {
    if (resendWait === 0) {
      return;
    }

    const timer = window.setTimeout(
      () => setResendWait((seconds) => Math.max(0, seconds - 1)),
      1000,
    );

    return () => window.clearTimeout(timer);
  }, [resendWait]);

  if (isLoading) {
    return null;
  }

  if (admin?.emailVerifiedAt) {
    return <Navigate replace to="/dashboard" />;
  }

  function focusInput(index: number) {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  }

  function updatePin(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);

    setPin((current) => {
      const next = [...current];
      next[index] = digit;
      return next;
    });

    if (digit && index < pinLength - 1) {
      focusInput(index + 1);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pastedCode = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, pinLength);

    if (!pastedCode) {
      return;
    }

    setPin(Array.from({ length: pinLength }, (_, index) => pastedCode[index] ?? ""));
    focusInput(Math.min(pastedCode.length, pinLength) - 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isComplete) {
      setError("Enter the 6-digit PIN sent to your Gmail.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      await api("/api/admin/verify-email", { method: "POST", data: { pin: code } });
      await queryClient.invalidateQueries({ queryKey: adminQueryKeys.currentAdmin });
      toast.success("Email verified. Welcome to the dashboard.");
      navigate("/dashboard", { replace: true });
    } catch (verifyError) {
      const message = getErrorMessage(verifyError, "Email verification failed");

      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    await sendVerificationPin(true);
  }

  return (
    <main className="min-h-screen bg-[#FBF8F2] font-sans text-[#241F14] motion-safe:animate-[login-fade-in_360ms_ease-out_both]">
      <section className="mx-auto flex min-h-screen w-full max-w-[72rem] flex-col px-6 py-8 max-sm:px-4">
        <header className="flex items-center justify-between gap-4">
          <img className="h-auto w-[196px] max-w-[58vw]" src={logoUrl} alt="Agentica" />
          <button
            className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-[#EFE7D8] bg-white px-4 text-sm font-bold text-[#5F574A] shadow-[0_8px_24px_rgba(36,31,20,0.05)] transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:border-[#E6DAC8] hover:text-[#241F14] hover:shadow-[0_12px_28px_rgba(36,31,20,0.08)] active:translate-y-0 active:scale-[0.98] max-sm:px-3"
            onClick={() => navigate("/login")}
            type="button"
          >
            <RiArrowLeftLine className="shrink-0" size={18} />
            <span className="max-sm:hidden">Back to login</span>
          </button>
        </header>

        <div className="grid flex-1 place-items-center py-10">
          <section className="w-full max-w-[31rem] rounded-[22px] border border-[#EFE7D8] bg-white px-8 py-9 shadow-[0_24px_70px_rgba(36,31,20,0.10)] motion-safe:animate-[login-rise_420ms_80ms_ease-out_both] max-sm:rounded-[18px] max-sm:px-5 max-sm:py-7">
            <div className="text-center">
              <div className="mx-auto inline-flex min-h-8 items-center gap-2 rounded-full border border-[#EFE7D8] bg-[#FBF8F2] px-3 text-xs font-extrabold uppercase text-[#E8A33D]">
                <RiShieldCheckLine size={15} />
                Secure verification
              </div>
              <h1 className="mt-5 text-[clamp(1.9rem,6vw,2.5rem)] font-extrabold leading-[1.08] tracking-normal text-wrap-balance">
                Verify your email
              </h1>
              <p className="mt-4 text-sm font-semibold leading-6 text-[#8A8172] text-wrap-pretty">
                Enter the 6-digit PIN sent to{" "}
                <span className="font-extrabold text-[#241F14]">
                  {admin?.email ?? "your admin email"}
                </span>
                .
              </p>
            </div>

            <form className="mt-8" onSubmit={handleSubmit}>
              <div
                className="flex flex-nowrap justify-center gap-2.5 max-sm:gap-1.5"
                role="group"
                aria-label="Email verification PIN"
              >
                {pin.map((digit, index) => (
                  <input
                    key={index}
                    ref={(node) => {
                      inputRefs.current[index] = node;
                    }}
                    aria-label={`Digit ${index + 1}`}
                    className="size-13 shrink-0 rounded-[12px] border border-[#EFE7D8] bg-[#FBF8F2] text-center text-xl font-extrabold text-[#241F14] outline-none transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out [font-variant-numeric:tabular-nums] focus:border-[#E8A33D] focus:bg-white focus:ring-2 focus:ring-[#E8A33D]/25 max-sm:size-10 max-sm:rounded-[10px] max-sm:text-lg"
                    inputMode="numeric"
                    maxLength={1}
                    onChange={(event) => updatePin(index, event.target.value)}
                    onFocus={(event) => event.currentTarget.select()}
                    onKeyDown={(event) => {
                      if (event.key === "Backspace" && !digit && index > 0) {
                        focusInput(index - 1);
                      }
                    }}
                    onPaste={handlePaste}
                    pattern="[0-9]*"
                    type="text"
                    value={digit}
                  />
                ))}
              </div>

              {error ? (
                <p className="mt-4 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                  {error}
                </p>
              ) : null}

              <div className="mt-7 flex justify-center">
                <button
                  className="flex h-[3.25rem] min-w-[12rem] items-center justify-center gap-3 rounded-[10px] border border-[#2f9852] bg-[#34A85B] px-7 text-base font-extrabold text-white shadow-[0_14px_28px_rgba(52,168,91,0.18)] transition-[transform,background-color,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:bg-[#2f9852] hover:shadow-[0_18px_34px_rgba(52,168,91,0.24)] focus:outline-none focus:ring-2 focus:ring-[#241F14] focus:ring-offset-2 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={!isComplete || isSubmitting}
                  type="submit"
                >
                  {isSubmitting ? <ButtonSpinner /> : null}
                  <span>{isSubmitting ? "Verifying..." : "Verify Email"}</span>
                </button>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-center text-sm font-semibold text-[#8A8172]">
              <span>Didn&apos;t receive it?</span>
              <button
                className="inline-flex min-h-10 items-center gap-2 rounded-[10px] px-3 text-[#34A85B] transition-[background-color,color,transform] duration-150 ease-out hover:-translate-y-0.5 hover:bg-[#EFFAF2] hover:text-[#2f9852] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isResendDisabled}
                onClick={handleResend}
                type="button"
              >
                {isResending ? <ButtonSpinner /> : <RiRefreshLine size={18} />}
                <span>
                  {isResending
                    ? "Sending..."
                    : resendWait > 0
                      ? `Resend PIN in ${resendWait}s`
                      : "Resend PIN"}
                </span>
              </button>
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
