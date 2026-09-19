import {
  RiArrowLeftLine,
  RiEyeCloseLine,
  RiEyeLine,
  RiMailSendLine,
  RiRefreshLine,
  RiShieldCheckLine,
  RiShieldKeyholeLine,
} from "@remixicon/react";
import { type ClipboardEvent, type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { ButtonSpinner } from "../components/ButtonSpinner";
import { useToast } from "../components/Toast";
import logoUrl from "../assets/agentica.svg";
import { getErrorMessage } from "../lib/utils";

const pinLength = 6;
const resendCooldownSeconds = 30;

type ResetStep = "email" | "pin" | "password";
type VerifyResetPinResponse = {
  resetToken: string;
};

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const [step, setStep] = useState<ResetStep>("email");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState(() => Array(pinLength).fill(""));
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resendWait, setResendWait] = useState(0);

  const code = useMemo(() => pin.join(""), [pin]);
  const isPinComplete = code.length === pinLength;

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

  async function handleSendPin(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setError("");
    setIsSending(true);

    try {
      await api("/api/admin/forgot-password", { method: "POST", data: { email } });
      setStep("pin");
      setPin(Array(pinLength).fill(""));
      setResetToken("");
      setResendWait(resendCooldownSeconds);
      toast.success("Password reset PIN sent to your email.");
    } catch (sendError) {
      const message = getErrorMessage(sendError, "Could not send password reset PIN");

      setError(message);
      toast.error(message);
    } finally {
      setIsSending(false);
    }
  }

  async function handleVerifyPin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isPinComplete) {
      setError("Enter the 6-digit PIN sent to your email.");
      return;
    }

    setError("");
    setIsVerifying(true);

    try {
      const result = await api<VerifyResetPinResponse>("/api/admin/reset-password/verify-pin", {
        method: "POST",
        data: { email, pin: code },
      });

      setResetToken(result.resetToken);
      setStep("password");
      toast.success("PIN verified. Set your new password.");
    } catch (verifyError) {
      const message = getErrorMessage(verifyError, "Could not verify password reset PIN");

      setError(message);
      toast.error(message);
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleResetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setIsResetting(true);

    try {
      await api("/api/admin/reset-password", {
        method: "POST",
        data: { email, resetToken, password },
      });
      toast.success("Password updated. You can sign in now.");
      navigate("/login", { replace: true });
    } catch (resetError) {
      const message = getErrorMessage(resetError, "Could not reset password");

      setError(message);
      toast.error(message);
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#FBF8F2] font-sans text-[#241F14] motion-safe:animate-[login-fade-in_360ms_ease-out_both]">
      <section className="mx-auto flex min-h-screen w-full max-w-[72rem] flex-col px-6 py-8 max-sm:px-4">
        <header className="flex items-center justify-between gap-4">
          <img className="h-auto w-[196px] max-w-[58vw]" src={logoUrl} alt="Agentica" />
          <Link
            className="inline-flex min-h-11 items-center gap-2 rounded-[10px] border border-[#EFE7D8] bg-white px-4 text-sm font-bold text-[#5F574A] shadow-[0_8px_24px_rgba(36,31,20,0.05)] transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:border-[#E6DAC8] hover:text-[#241F14] hover:shadow-[0_12px_28px_rgba(36,31,20,0.08)] active:translate-y-0 active:scale-[0.98] max-sm:px-3"
            to="/login"
          >
            <RiArrowLeftLine className="shrink-0" size={18} />
            <span className="max-sm:hidden">Back to login</span>
          </Link>
        </header>

        <div className="grid flex-1 place-items-center py-10">
          <section className="w-full max-w-[32rem] rounded-[22px] border border-[#EFE7D8] bg-white px-8 py-9 shadow-[0_24px_70px_rgba(36,31,20,0.10)] motion-safe:animate-[login-rise_420ms_80ms_ease-out_both] max-sm:rounded-[18px] max-sm:px-5 max-sm:py-7">
            <div className="text-center">
              <div className="mx-auto inline-flex min-h-8 items-center gap-2 rounded-full border border-[#EFE7D8] bg-[#FBF8F2] px-3 text-xs font-extrabold uppercase text-[#E8A33D]">
                {step === "password" ? (
                  <RiShieldCheckLine size={15} />
                ) : (
                  <RiShieldKeyholeLine size={15} />
                )}
                Password recovery
              </div>
              <h1 className="mt-5 text-[clamp(1.9rem,6vw,2.5rem)] font-extrabold leading-[1.08] tracking-normal text-wrap-balance">
                {step === "email"
                  ? "Forgot your password?"
                  : step === "pin"
                    ? "Verify reset PIN"
                    : "Set new password"}
              </h1>
              <p className="mt-4 text-sm font-semibold leading-6 text-[#8A8172] text-wrap-pretty">
                {step === "email"
                  ? "Enter your admin email and we'll send a password reset PIN if the account is verified."
                  : step === "pin"
                    ? `Enter the 6-digit PIN sent to ${email}.`
                    : "PIN verified. Choose a new password for your admin account."}
              </p>
            </div>

            {error ? (
              <p className="mt-5 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {error}
              </p>
            ) : null}

            {step === "email" ? (
              <form className="mt-8 grid gap-6" onSubmit={handleSendPin}>
                <label className="grid gap-3 text-base font-bold text-[#241F14]">
                  Email
                  <input
                    className="h-[3.4rem] rounded-[10px] border border-[#EFE7D8] bg-[#FBF8F2] px-5 text-base font-normal text-[#241F14] outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-out focus:border-[#E8A33D] focus:ring-2 focus:ring-[#E8A33D]/25"
                    name="email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@agentica.ai"
                    required
                    type="email"
                    value={email}
                  />
                </label>

                <button
                  className="flex h-[3.65rem] items-center justify-center gap-3 rounded-[10px] border border-[#2f9852] bg-[#34A85B] px-7 text-base font-extrabold text-white shadow-[0_14px_28px_rgba(52,168,91,0.18)] transition-[transform,background-color,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:bg-[#2f9852] hover:shadow-[0_18px_34px_rgba(52,168,91,0.24)] focus:outline-none focus:ring-2 focus:ring-[#241F14] focus:ring-offset-2 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 max-sm:h-auto max-sm:py-4"
                  disabled={isSending}
                  type="submit"
                >
                  {isSending ? <ButtonSpinner /> : <RiMailSendLine size={20} />}
                  <span>{isSending ? "Sending..." : "Send Reset PIN"}</span>
                </button>
              </form>
            ) : null}

            {step === "pin" ? (
              <form className="mt-8" onSubmit={handleVerifyPin}>
                <div
                  className="flex flex-nowrap justify-center gap-2.5 max-sm:gap-1.5"
                  role="group"
                  aria-label="Password reset PIN"
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

                <div className="mt-7 flex justify-center">
                  <button
                    className="flex h-[3.25rem] min-w-[12rem] items-center justify-center gap-3 rounded-[10px] border border-[#2f9852] bg-[#34A85B] px-7 text-base font-extrabold text-white shadow-[0_14px_28px_rgba(52,168,91,0.18)] transition-[transform,background-color,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:bg-[#2f9852] hover:shadow-[0_18px_34px_rgba(52,168,91,0.24)] focus:outline-none focus:ring-2 focus:ring-[#241F14] focus:ring-offset-2 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!isPinComplete || isVerifying}
                    type="submit"
                  >
                    {isVerifying ? <ButtonSpinner /> : null}
                    <span>{isVerifying ? "Verifying..." : "Verify PIN"}</span>
                  </button>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-center text-sm font-semibold text-[#8A8172]">
                  <span>Didn&apos;t receive it?</span>
                  <button
                    className="inline-flex min-h-10 items-center gap-2 rounded-[10px] px-3 text-[#34A85B] transition-[background-color,color,transform] duration-150 ease-out hover:-translate-y-0.5 hover:bg-[#EFFAF2] hover:text-[#2f9852] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={isSending || resendWait > 0}
                    onClick={() => void handleSendPin()}
                    type="button"
                  >
                    {isSending ? <ButtonSpinner /> : <RiRefreshLine size={18} />}
                    <span>
                      {isSending
                        ? "Sending..."
                        : resendWait > 0
                          ? `Resend PIN in ${resendWait}s`
                          : "Resend PIN"}
                    </span>
                  </button>
                </div>
              </form>
            ) : null}

            {step === "password" ? (
              <form className="mt-8 grid gap-5" onSubmit={handleResetPassword}>
                <label className="grid gap-3 text-base font-bold text-[#241F14]">
                  New password
                  <span className="relative block">
                    <input
                      className="h-[3.4rem] w-full rounded-[10px] border border-[#EFE7D8] bg-[#FBF8F2] px-5 pr-14 text-base font-normal text-[#241F14] outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-out focus:border-[#E8A33D] focus:ring-2 focus:ring-[#E8A33D]/25"
                      minLength={8}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter new password"
                      required
                      type={showPassword ? "text" : "password"}
                      value={password}
                    />
                    <button
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-[#8A8172] transition-[background-color,color,transform] duration-150 ease-out hover:bg-[#EFE7D8] hover:text-[#241F14] active:scale-95"
                      onClick={() => setShowPassword((isVisible) => !isVisible)}
                      type="button"
                    >
                      {showPassword ? <RiEyeCloseLine size={20} /> : <RiEyeLine size={20} />}
                    </button>
                  </span>
                </label>

                <label className="grid gap-3 text-base font-bold text-[#241F14]">
                  Confirm password
                  <span className="relative block">
                    <input
                      className="h-[3.4rem] w-full rounded-[10px] border border-[#EFE7D8] bg-[#FBF8F2] px-5 pr-14 text-base font-normal text-[#241F14] outline-none transition-[background-color,border-color,box-shadow] duration-150 ease-out focus:border-[#E8A33D] focus:ring-2 focus:ring-[#E8A33D]/25"
                      minLength={8}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      placeholder="Confirm new password"
                      required
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                    />
                    <button
                      aria-label={
                        showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                      }
                      className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full text-[#8A8172] transition-[background-color,color,transform] duration-150 ease-out hover:bg-[#EFE7D8] hover:text-[#241F14] active:scale-95"
                      onClick={() => setShowConfirmPassword((isVisible) => !isVisible)}
                      type="button"
                    >
                      {showConfirmPassword ? <RiEyeCloseLine size={20} /> : <RiEyeLine size={20} />}
                    </button>
                  </span>
                </label>

                <button
                  className="flex h-[3.65rem] items-center justify-center gap-3 rounded-[10px] border border-[#2f9852] bg-[#34A85B] px-7 text-base font-extrabold text-white shadow-[0_14px_28px_rgba(52,168,91,0.18)] transition-[transform,background-color,box-shadow] duration-150 ease-out hover:-translate-y-0.5 hover:bg-[#2f9852] hover:shadow-[0_18px_34px_rgba(52,168,91,0.24)] focus:outline-none focus:ring-2 focus:ring-[#241F14] focus:ring-offset-2 active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 max-sm:h-auto max-sm:py-4"
                  disabled={!resetToken || isResetting}
                  type="submit"
                >
                  {isResetting ? <ButtonSpinner /> : <RiShieldKeyholeLine size={20} />}
                  <span>{isResetting ? "Updating..." : "Update Password"}</span>
                </button>
              </form>
            ) : null}
          </section>
        </div>
      </section>
    </main>
  );
}
