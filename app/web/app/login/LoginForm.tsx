"use client";

import { useState, type FormEvent } from "react";
import s from "./login.module.css";

/* ── Types ─────────────────────────────────── */

interface LoginFormState {
  email: string;
  password: string;
  remember: boolean;
}

interface FieldErrors {
  email?: string;
  password?: string;
}

/* ── Validation helpers ────────────────────── */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(state: LoginFormState): FieldErrors {
  const errors: FieldErrors = {};

  if (!state.email.trim()) {
    errors.email = "Email is required.";
  } else if (!EMAIL_RE.test(state.email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!state.password) {
    errors.password = "Password is required.";
  }

  return errors;
}

/* ── Stub submit handler ───────────────────── */

function onLoginSubmit(data: LoginFormState) {
  // TODO: wire up to real auth API
  console.log("[LoginForm] submit →", data);
}

/* ── Component ─────────────────────────────── */

export default function LoginForm() {
  const [form, setForm] = useState<LoginFormState>({
    email: "",
    password: "",
    remember: false,
  });

  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleChange(field: keyof LoginFormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));

    // Clear field error when the user starts correcting
    if (submitted && errors[field as keyof FieldErrors]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as keyof FieldErrors];
        return next;
      });
    }
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);

    const fieldErrors = validate(form);
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length === 0) {
      onLoginSubmit(form);
    }
  }

  return (
    <div className={s.card}>
      {/* ── Logo ── */}
      <div className={s.logoRow}>
        <div className={s.logoMark}>
          <div className={s.logoInset} />
        </div>
        <span className={s.logoText}>Agentica</span>
      </div>

      {/* ── Heading ── */}
      <h1 className={s.heading}>Welcome back</h1>
      <p className={s.subtext}>
        Sign in to chat with your shopping assistant and pick up where you left
        off.
      </p>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className={s.fieldGroup}>
          <label htmlFor="login-email" className={s.label}>
            Email
          </label>
          <input
            id="login-email"
            type="email"
            className={`${s.input}${errors.email ? ` ${s.inputError}` : ""}`}
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            autoComplete="email"
          />
          {errors.email && <p className={s.errorText}>{errors.email}</p>}
        </div>

        {/* Password */}
        <div className={s.fieldGroup}>
          <label htmlFor="login-password" className={s.label}>
            Password
          </label>
          <input
            id="login-password"
            type="password"
            className={`${s.input}${errors.password ? ` ${s.inputError}` : ""}`}
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            autoComplete="current-password"
          />
          {errors.password && (
            <p className={s.errorText}>{errors.password}</p>
          )}
        </div>

        {/* Remember / Forgot */}
        <div className={s.optionsRow}>
          <label className={s.checkboxLabel}>
            <input
              type="checkbox"
              className={s.checkbox}
              checked={form.remember}
              onChange={(e) => handleChange("remember", e.target.checked)}
            />
            Remember me
          </label>
          <a href="#" className={s.forgotLink}>
            Forgot password?
          </a>
        </div>

        {/* Submit */}
        <button type="submit" className={s.submitBtn}>
          Sign in
        </button>
      </form>

      {/* ── Divider ── */}
      <div className={s.divider}>
        <span className={s.dividerLine} />
        <span className={s.dividerText}>or</span>
        <span className={s.dividerLine} />
      </div>

      {/* ── Footer ── */}
      <p className={s.footer}>
        Don&apos;t have an account?{" "}
        <a href="#" className={s.signupLink}>
          Sign up
        </a>
      </p>
    </div>
  );
}
