"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { z } from "zod";
import { ToastMessage } from "@/components/ToastMessage";
import { useAuthStore } from "@/stores/auth-store";
import { ProfileShell } from "./ProfileShell";
import { ProfileSkeleton } from "./ProfileSkeleton";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export function SecurityPage() {
  const router = useRouter();
  const customer = useAuthStore((state) => state.customer);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const message = useAuthStore((state) => state.message);
  const fetchCurrentCustomer = useAuthStore((state) => state.fetchCurrentCustomer);
  const updatePassword = useAuthStore((state) => state.updatePassword);
  const [toast, setToast] = useState("");
  const [formError, setFormError] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!customer?.id) {
      router.push("/login");
      return;
    }

    void fetchCurrentCustomer();
  }, [customer?.id, fetchCurrentCustomer, hasHydrated, router]);

  useEffect(() => {
    if (!hasHydrated || !customer) {
      return;
    }

    if (!customer.emailVerifiedAt) {
      window.sessionStorage.setItem("agentica_profile_toast", "Please verify the email first.");
      router.push("/profile");
    }
  }, [customer, hasHydrated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const form = new FormData(event.currentTarget);
    const result = passwordSchema.safeParse({
      currentPassword: String(form.get("currentPassword") ?? ""),
      newPassword: String(form.get("newPassword") ?? ""),
      confirmPassword: String(form.get("confirmPassword") ?? ""),
    });

    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? "Check your password details.");
      return;
    }

    await updatePassword(result.data);
    setToast("Password updated.");
    event.currentTarget.reset();
  }

  if (!hasHydrated || !customer || !customer.emailVerifiedAt) {
    return (
      <ProfileShell>
        <ProfileSkeleton />
      </ProfileShell>
    );
  }

  return (
    <ProfileShell>
      {toast ? <ToastMessage message={toast} tone="success" onClose={() => setToast("")} /> : null}
      <section className="max-w-160">
        <h1 className="text-3xl font-extrabold text-text-dark">Security</h1>
        <p className="mt-1 text-sm text-[#7c8798]">Update your account password.</p>

        <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
          <PasswordField
            label="Current Password"
            name="currentPassword"
            show={showCurrent}
            onToggle={() => setShowCurrent((value) => !value)}
          />
          <PasswordField
            label="New Password"
            name="newPassword"
            show={showNew}
            onToggle={() => setShowNew((value) => !value)}
          />
          <PasswordField
            label="Confirm Password"
            name="confirmPassword"
            show={showConfirm}
            onToggle={() => setShowConfirm((value) => !value)}
          />

          {formError || error ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {formError || error}
            </p>
          ) : null}

          {message && !toast ? (
            <p className="rounded-md border border-main-green/30 bg-main-green/10 px-4 py-3 text-sm font-semibold text-text-dark">
              {message}
            </p>
          ) : null}

          <button
            className="h-12 w-fit rounded-md bg-main-green px-7 text-sm font-extrabold text-white transition hover:bg-main-green-hover disabled:opacity-70"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </section>
    </ProfileShell>
  );
}

function PasswordField({
  label,
  name,
  show,
  onToggle,
}: {
  label: string;
  name: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-[#111827]">{label}</span>
      <span className="relative block">
        <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-[#8b97a7]" />
        <input
          className="h-13 w-full rounded-md border border-[#dfe6e3] bg-white pr-12 pl-11 text-sm font-semibold text-text-dark outline-0 transition focus:border-main-green"
          name={name}
          type={show ? "text" : "password"}
          minLength={name === "currentPassword" ? 1 : 8}
          required
        />
        <button
          className="absolute top-1/2 right-3 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-[#8b97a7] hover:bg-[#eef8fb] hover:text-text-dark"
          type="button"
          onClick={onToggle}
          aria-label={show ? `Hide ${label}` : `Show ${label}`}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
    </label>
  );
}
