"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock, LogIn, Mail, User, UserPlus } from "lucide-react";
import { useAuthStore } from "@/stores/auth-store";

type AuthMode = "login" | "signup" | "forgot-password";

const content = {
  login: {
    icon: LogIn,
    title: "Sign in with email",
    subtitle: "Shop faster, track orders, and keep your Agentica picks in one place.",
    button: "Sign In",
    footer: "New to Agentica?",
    footerLink: "Create account",
    footerHref: "/signup",
  },
  signup: {
    icon: UserPlus,
    title: "Create your account",
    subtitle: "Join Agentica and get fresh deals, smart product help, and quick checkout.",
    button: "Create Account",
    footer: "Already have an account?",
    footerLink: "Sign in",
    footerHref: "/login",
  },
  "forgot-password": {
    icon: KeyRound,
    title: "Reset password",
    subtitle: "Enter your email and we will send you a secure password reset link.",
    button: "Send Reset Link",
    footer: "Remembered your password?",
    footerLink: "Back to login",
    footerHref: "/login",
  },
} satisfies Record<AuthMode, Record<string, unknown>>;

export function AuthPage({ mode }: { mode: AuthMode }) {
  const details = content[mode];
  const Icon = details.icon as typeof LogIn;
  const isLogin = mode === "login";
  const isSignup = mode === "signup";
  const router = useRouter();
  const { error, forgotPassword, isLoading, login, message, signup } = useAuthStore();
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    try {
      if (mode === "forgot-password") {
        await forgotPassword(email);
        return;
      }

      if (mode === "login") {
        await login(email, password);
        router.push("/");
        return;
      }

      const confirmPassword = String(form.get("confirmPassword") ?? "");

      if (password !== confirmPassword) {
        setFormError("Passwords do not match.");
        return;
      }

      const { firstName, lastName } = splitName(String(form.get("fullName") ?? ""));
      await signup({ email, password, firstName, lastName });
      router.push("/");
    } catch {
      return;
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-text-dark px-5 py-8 text-text-dark">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src="/skey.mp4"
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,39,68,0.28),rgba(9,39,68,0.52))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(53,220,99,0.22),transparent_36%)]" />

      <Link
        className="relative z-10 inline-flex items-center gap-3 text-lg font-extrabold text-white drop-shadow-[0_8px_20px_rgba(0,0,0,0.22)]"
        href="/"
        aria-label="Agentica home"
      >
        <Image src="/agentica.svg" width={116} height={44} alt="Agentica" priority />
      </Link>

      <section className="relative z-10 mx-auto mt-[clamp(3rem,12vh,8rem)] w-full max-w-[23rem] rounded-[28px] border border-white/50 bg-white/78 px-6 py-8 text-center shadow-[0_26px_80px_rgba(9,39,68,0.26)] backdrop-blur-xl sm:max-w-[26rem] sm:px-8">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl border border-white/70 bg-white text-text-dark shadow-[0_12px_28px_rgba(9,39,68,0.16)]">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </div>

        <h1 className="text-2xl font-extrabold tracking-normal">{details.title as string}</h1>
        <p className="mx-auto mt-2 max-w-[18rem] text-sm leading-6 text-placeholder">
          {details.subtitle as string}
        </p>

        <form className="mt-6 flex flex-col gap-3 text-left" onSubmit={handleSubmit}>
          {isSignup ? (
            <label className="relative block">
              <span className="sr-only">Full name</span>
              <User className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-placeholder" />
              <input
                className="h-12 w-full rounded-xl border border-transparent bg-white/80 pr-4 pl-11 text-sm font-medium outline-none transition placeholder:text-placeholder/80 focus:border-main-green focus:bg-white focus:ring-4 focus:ring-main-green/18"
                name="fullName"
                type="text"
                placeholder="Full name"
                required
              />
            </label>
          ) : null}

          <label className="relative block">
            <span className="sr-only">Email</span>
            <Mail className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-placeholder" />
            <input
              className="h-12 w-full rounded-xl border border-transparent bg-white/80 pr-4 pl-11 text-sm font-medium outline-none transition placeholder:text-placeholder/80 focus:border-main-green focus:bg-white focus:ring-4 focus:ring-main-green/18"
              name="email"
              type="email"
              placeholder="Email"
              required
            />
          </label>

          {mode !== "forgot-password" ? (
            <label className="relative block">
              <span className="sr-only">Password</span>
              <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-placeholder" />
              <input
                className="h-12 w-full rounded-xl border border-transparent bg-white/80 pr-11 pl-11 text-sm font-medium outline-none transition placeholder:text-placeholder/80 focus:border-main-green focus:bg-white focus:ring-4 focus:ring-main-green/18"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                minLength={8}
                required
              />
              <button
                className="absolute top-1/2 right-3 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-placeholder transition hover:bg-main-green/10 hover:text-text-dark"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </label>
          ) : null}

          {isSignup ? (
            <label className="relative block">
              <span className="sr-only">Confirm password</span>
              <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-placeholder" />
              <input
                className="h-12 w-full rounded-xl border border-transparent bg-white/80 pr-11 pl-11 text-sm font-medium outline-none transition placeholder:text-placeholder/80 focus:border-main-green focus:bg-white focus:ring-4 focus:ring-main-green/18"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                minLength={8}
                required
              />
              <button
                className="absolute top-1/2 right-3 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-placeholder transition hover:bg-main-green/10 hover:text-text-dark"
                type="button"
                onClick={() => setShowConfirmPassword((value) => !value)}
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </label>
          ) : null}

          {isLogin ? (
            <Link
              className="self-end text-xs font-semibold text-text-dark transition hover:text-nav-green"
              href="/forgot-password"
            >
              Forgot password?
            </Link>
          ) : null}

          <button
            className="mt-1 inline-flex h-12 items-center justify-center rounded-xl bg-main-green px-5 text-sm font-extrabold text-text-dark shadow-[0_14px_28px_rgba(53,220,99,0.32)] transition hover:-translate-y-0.5 hover:bg-main-green-hover disabled:cursor-not-allowed disabled:opacity-70"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Please wait..." : (details.button as string)}
          </button>
        </form>

        {formError || error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-left text-sm font-semibold text-red-700">
            {formError ?? error}
          </p>
        ) : null}

        {message ? (
          <p className="mt-4 rounded-xl border border-main-green/30 bg-main-green/10 px-4 py-3 text-left text-sm font-semibold text-text-dark">
            {message}
          </p>
        ) : null}

        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-placeholder">
          <span>{details.footer as string}</span>
          <Link
            className="font-extrabold text-nav-green hover:text-text-dark"
            href={details.footerHref as string}
          >
            {details.footerLink as string}
          </Link>
        </div>

        {mode !== "login" ? (
          <Link
            className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-text-dark transition hover:text-nav-green"
            href="/login"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Login
          </Link>
        ) : null}
      </section>
    </main>
  );
}

function splitName(fullName: string) {
  const [firstName, ...rest] = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    firstName,
    lastName: rest.length > 0 ? rest.join(" ") : undefined,
  };
}
