"use client";

import { AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

type EmailVerificationStatusProps = {
  isVerified: boolean;
  onVerifyNow: () => void;
};

export function EmailVerificationStatus({ isVerified, onVerifyNow }: EmailVerificationStatusProps) {
  if (isVerified) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-[#e8f8ed] px-3 py-1 text-[11px] font-extrabold text-[#16a34a]">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Verified
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-3">
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-[11px] font-extrabold text-red-600">
        <AlertCircle className="h-3.5 w-3.5" />
        Unverified
      </span>
      <Link
        className="text-[11px] font-extrabold text-[#6f7785] underline hover:text-main-green"
        href="/verify-email"
        onClick={onVerifyNow}
      >
        verify now
      </Link>
    </span>
  );
}
