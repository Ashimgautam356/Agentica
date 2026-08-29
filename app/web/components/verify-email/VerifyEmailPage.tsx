"use client";

import { ArrowLeft, MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";

export function VerifyEmailPage() {
  const router = useRouter();
  const customer = useAuthStore((state) => state.customer);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const error = useAuthStore((state) => state.error);
  const message = useAuthStore((state) => state.message);
  const isLoading = useAuthStore((state) => state.isLoading);
  const resendEmailVerification = useAuthStore((state) => state.resendEmailVerification);
  const verifyEmail = useAuthStore((state) => state.verifyEmail);
  const [pin, setPin] = useState("");

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!customer) {
      router.push("/login");
    }
  }, [customer, hasHydrated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await verifyEmail(pin);
    router.push("/profile");
  }

  if (!hasHydrated || !customer) {
    return null;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f7faf8] px-5 py-10">
      <section className="w-full max-w-md rounded-md border border-[#dfe6e3] bg-white p-6 shadow-[0_18px_50px_rgba(9,39,68,0.08)]">
        <Link
          className="mb-6 inline-flex items-center gap-2 text-sm font-extrabold text-[#687487] hover:text-main-green"
          href="/profile"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to profile
        </Link>

        <div className="grid h-14 w-14 place-items-center rounded-full bg-[#e8f8ed] text-[#16a34a]">
          <MailCheck className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-text-dark">Verify Email</h1>
        <p className="mt-2 text-sm leading-6 text-[#687487]">
          Enter the 6-digit PIN sent to {customer.email}.
        </p>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2">
            <span className="text-sm font-extrabold text-[#111827]">Verification PIN</span>
            <input
              className="h-13 rounded-md border border-[#dfe6e3] px-4 text-center text-xl font-extrabold tracking-[0.25em] text-text-dark outline-0 focus:border-main-green"
              value={pin}
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 6))}
              required
            />
          </label>

          <button
            className="h-12 rounded-md bg-main-green px-5 text-sm font-extrabold text-white transition hover:bg-main-green-hover disabled:opacity-70"
            type="submit"
            disabled={isLoading || pin.length !== 6}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <button
          className="mt-4 text-sm font-extrabold text-[#16a34a] hover:text-text-dark"
          type="button"
          disabled={isLoading}
          onClick={() => void resendEmailVerification()}
        >
          Resend PIN
        </button>

        {error ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="mt-4 rounded-md border border-main-green/30 bg-main-green/10 px-4 py-3 text-sm font-semibold text-text-dark">
            {message}
          </p>
        ) : null}
      </section>
    </main>
  );
}
