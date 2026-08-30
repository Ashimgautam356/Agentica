"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastMessage } from "@/components/ToastMessage";
import { useAuthStore } from "@/stores/auth-store";
import { ProfileForm } from "./ProfileForm";
import { ProfileShell } from "./ProfileShell";
import { ProfileSkeleton } from "./ProfileSkeleton";

export function ProfilePage() {
  const router = useRouter();
  const customer = useAuthStore((state) => state.customer);
  const fetchCurrentCustomer = useAuthStore((state) => state.fetchCurrentCustomer);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [toast, setToast] = useState(readProfileToast);

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

  if (!hasHydrated || !customer) {
    return (
      <ProfileShell>
        <ProfileSkeleton />
      </ProfileShell>
    );
  }

  return (
    <ProfileShell>
      {toast ? <ToastMessage message={toast} onClose={() => setToast("")} /> : null}
      {isLoading ? (
        <ProfileSkeleton />
      ) : (
        <ProfileForm customer={customer} key={customer.updatedAt ?? customer.id} />
      )}
    </ProfileShell>
  );
}

function readProfileToast() {
  if (typeof window === "undefined") {
    return "";
  }

  const message = window.sessionStorage.getItem("agentica_profile_toast") ?? "";
  window.sessionStorage.removeItem("agentica_profile_toast");
  return message;
}
