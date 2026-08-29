"use client";

import { Copy, KeyRound, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastMessage } from "@/components/ToastMessage";
import { useAuthStore } from "@/stores/auth-store";
import { ProfileShell } from "./ProfileShell";
import { ProfileSkeleton } from "./ProfileSkeleton";

export function ApiKeysPage() {
  const router = useRouter();
  const customer = useAuthStore((state) => state.customer);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const fetchCurrentCustomer = useAuthStore((state) => state.fetchCurrentCustomer);
  const regenerateApiKey = useAuthStore((state) => state.regenerateApiKey);
  const [toast, setToast] = useState("");

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

  async function handleGenerate() {
    if (!customer?.emailVerifiedAt) {
      window.sessionStorage.setItem("agentica_profile_toast", "Please verify the email first.");
      router.push("/profile");
      return;
    }

    await regenerateApiKey();
  }

  async function copyKey() {
    if (customer?.apiKey) {
      await navigator.clipboard.writeText(customer.apiKey);
      setToast("API key copied.");
    }
  }

  if (!hasHydrated || !customer) {
    return (
      <ProfileShell>
        <ProfileSkeleton />
      </ProfileShell>
    );
  }

  return (
    <ProfileShell>
      {toast ? (
        <ToastMessage
          message={toast}
          tone={toast.includes("copied") ? "success" : "error"}
          onClose={() => setToast("")}
        />
      ) : null}
      {isLoading ? (
        <ProfileSkeleton />
      ) : customer.emailVerifiedAt && customer.apiKey ? (
        <section className="max-w-235">
          <h1 className="text-3xl font-extrabold text-text-dark">API Keys & MCP Connections</h1>
          <p className="mt-1 text-sm text-[#7c8798]">
            Let AI assistants like Claude, ChatGPT, or DeepSeek shop Agentica on your behalf.
          </p>

          <div className="mt-2 rounded-md border border-[#dfe6e3] bg-white p-5">
            <div className="flex flex-col gap-4 min-[760px]:flex-row min-[760px]:items-start min-[760px]:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-extrabold text-text-dark">Your API Key</h2>
                  <span className="rounded-full bg-main-green px-2 py-0.5 text-[10px] font-extrabold text-white">
                    ACTIVE
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold text-[#7c8798]">
                  Use this key to connect any MCP-compatible AI assistant to your Agentica account.
                </p>
                <div className="mt-3 rounded-md border border-[#dfe6e3] bg-[#f4f7f5] px-4 py-3 text-sm font-semibold text-text-dark">
                  {maskApiKey(customer.apiKey)}
                </div>
                <p className="mt-3 text-xs text-[#8b97a7]">
                  Created {formatDate(customer.updatedAt)}
                </p>
                <button
                  className="mt-1 inline-flex items-center cursor-pointer gap-2 text-xs font-extrabold text-[#16a34a]"
                  type="button"
                  onClick={() => void handleGenerate()}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate key
                </button>
              </div>

              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-main-green px-6 text-sm font-extrabold text-white transition hover:bg-main-green-hover"
                type="button"
                onClick={() => void copyKey()}
              >
                <Copy className="h-4 w-4" />
                Copy Key
              </button>
            </div>
          </div>

          <div className="mt-3 rounded-md border border-[#ffc9a6] bg-[#fff3eb] px-4 py-3 text-sm font-bold text-[#9b4b0f]">
            Anyone with this key can view products and place orders as you. Never share it publicly
            or paste it into an untrusted app.
          </div>
        </section>
      ) : (
        <section className="max-w-160">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[#e8f8ed] text-[#16a34a]">
            <KeyRound className="h-7 w-7" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-text-dark">Generate API key</h1>
          <button
            className="mt-8 h-12 rounded-md bg-main-green px-10 text-sm font-extrabold text-white transition hover:bg-main-green-hover disabled:opacity-70"
            type="button"
            disabled={isLoading}
            onClick={() => void handleGenerate()}
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
        </section>
      )}
    </ProfileShell>
  );
}

function maskApiKey(apiKey: string) {
  if (apiKey.length <= 12) {
    return apiKey;
  }

  return `${apiKey.slice(0, 9)}${"•".repeat(24)}${apiKey.slice(-4)}`;
}

function formatDate(value?: string) {
  if (!value) {
    return "today";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}
