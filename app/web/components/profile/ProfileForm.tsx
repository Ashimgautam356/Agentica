"use client";

import { CalendarDays, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { z } from "zod";
import { cloudinaryImageUrl } from "@/lib/cloudinary";
import { type Customer, useAuthStore } from "@/stores/auth-store";
import { EmailVerificationStatus } from "./EmailVerificationStatus";

type ProfileFormProps = {
  customer: Customer;
};

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Enter your full name.").max(120, "Name is too long."),
  contact: z
    .string()
    .trim()
    .max(40, "Phone number is too long.")
    .refine((value) => !value || /^[+\d][\d\s().-]{6,39}$/.test(value), {
      message: "Enter a valid phone number.",
    }),
  dob: z
    .string()
    .refine((value) => !value || !Number.isNaN(Date.parse(value)), "Enter a valid date.")
    .refine((value) => !value || new Date(value) <= new Date(), "Date of birth cannot be future."),
  gender: z.enum(["", "female", "male", "non-binary", "prefer-not-to-say"]),
});

const profileImageSchema = z
  .instanceof(File)
  .refine((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type), {
    message: "Use a JPG, PNG, or WEBP image.",
  })
  .refine((file) => file.size <= 2 * 1024 * 1024, {
    message: "Image must be 2MB or smaller.",
  });

export function ProfileForm({ customer }: ProfileFormProps) {
  const updateCustomer = useAuthStore((state) => state.updateCustomer);
  const resendEmailVerification = useAuthStore((state) => state.resendEmailVerification);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const message = useAuthStore((state) => state.message);
  const [fullName, setFullName] = useState(getFullName(customer));
  const [contact, setContact] = useState(customer.contact ?? "");
  const [dob, setDob] = useState(toDateInputValue(customer.dob));
  const [gender, setGender] = useState(customer.gender ?? "");
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState("");
  const [imageError, setImageError] = useState("");
  const [formError, setFormError] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarUrl = cloudinaryImageUrl(customer.imageId, "f_auto,q_auto,c_fill,w_96,h_96");
  const shownAvatarUrl = pendingImageUrl || avatarUrl;
  const isVerified = Boolean(customer.emailVerifiedAt);

  useEffect(() => {
    return () => {
      if (pendingImageUrl) {
        URL.revokeObjectURL(pendingImageUrl);
      }
    };
  }, [pendingImageUrl]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const result = profileSchema.safeParse({ fullName, contact, dob, gender });

    if (!result.success) {
      setFormError(result.error.issues[0]?.message ?? "Check your profile details.");
      return;
    }

    const { firstName, lastName } = splitName(result.data.fullName);

    await updateCustomer({
      firstName: firstName || null,
      lastName: lastName || null,
      contact: result.data.contact || null,
      dob: result.data.dob || null,
      gender: result.data.gender || null,
    });
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const result = profileImageSchema.safeParse(file);

    if (!result.success) {
      setImageError(result.error.issues[0]?.message ?? "Choose a valid image.");
      event.target.value = "";
      return;
    }

    setImageError("");
    if (pendingImageUrl) {
      URL.revokeObjectURL(pendingImageUrl);
    }

    setPendingImage(file);
    setPendingImageUrl(URL.createObjectURL(file));
  }

  async function confirmImageUpload() {
    if (!pendingImage) {
      return;
    }

    setIsUploadingImage(true);
    setImageError("");

    try {
      const formData = new FormData();
      formData.append("file", pendingImage);

      const response = await fetch("/api/profile-image", {
        method: "POST",
        headers: authHeader(),
        body: formData,
      });
      const body = (await response.json()) as { publicId?: string; error?: string };

      if (!response.ok || !body.publicId) {
        throw new Error(body.error ?? "Image upload failed.");
      }

      await updateCustomer({ imageId: body.publicId });
      if (pendingImageUrl) {
        URL.revokeObjectURL(pendingImageUrl);
      }

      setPendingImage(null);
      setPendingImageUrl("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      setImageError(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setIsUploadingImage(false);
    }
  }

  function clearPendingImage() {
    if (pendingImageUrl) {
      URL.revokeObjectURL(pendingImageUrl);
    }

    setPendingImage(null);
    setPendingImageUrl("");
    setImageError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <form className="max-w-210" onSubmit={handleSubmit}>
      <h1 className="text-3xl font-extrabold text-text-dark">Profile</h1>
      <p className="mt-1 text-sm text-[#7c8798]">Manage your personal information.</p>

      <section className="mt-9">
        <h2 className="text-sm font-extrabold text-[#111827]">Profile Photo</h2>
        <div className="mt-6 flex items-center gap-5">
          <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-full bg-[#d7f0dd] text-lg font-extrabold text-[#16a34a]">
            {shownAvatarUrl ? (
              <span
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${shownAvatarUrl})` }}
                aria-hidden="true"
              />
            ) : (
              initials(fullName || customer.email)
            )}
          </div>
          <div>
            <input
              className="sr-only"
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleImageChange}
            />
            <button
              className="h-10 rounded-md bg-[#e8f8ed] px-6 text-sm font-extrabold cursor-pointer text-[#16a34a]"
              type="button"
              onClick={() => fileInputRef.current?.click()}
            >
              Change Photo
            </button>
            <p className="mt-2 text-xs font-semibold text-[#9aa4b2]">JPG, PNG, or WEBP, max 2MB.</p>
            {pendingImage ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  className="h-9 rounded-md bg-main-green px-4 text-xs font-extrabold text-white disabled:opacity-70"
                  type="button"
                  disabled={isUploadingImage || isLoading}
                  onClick={() => void confirmImageUpload()}
                >
                  {isUploadingImage ? "Uploading..." : "Confirm Photo"}
                </button>
                <button
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-[#dfe6e3] px-3 text-xs font-extrabold text-[#7c8798] hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                  type="button"
                  disabled={isUploadingImage}
                  onClick={clearPendingImage}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
              </div>
            ) : null}
            {imageError ? (
              <p className="mt-2 text-xs font-extrabold text-red-600">{imageError}</p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mt-7 grid gap-5 min-[760px]:grid-cols-2">
        <ProfileField label="Full Name">
          <input
            className={inputClass}
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </ProfileField>

        <ProfileField label="Phone Number">
          <input
            className={inputClass}
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            placeholder="+977 98x-xxxxxxx"
          />
        </ProfileField>

        <ProfileField
          label="Email Address"
          action={
            <EmailVerificationStatus
              isVerified={isVerified}
              onVerifyNow={() => void resendEmailVerification()}
            />
          }
        >
          <input className={inputClass} value={customer.email} type="email" disabled />
        </ProfileField>

        <ProfileField label="Date of Birth">
          <div className="relative">
            <input
              className={`${inputClass} pr-11`}
              value={dob}
              type="date"
              onChange={(event) => setDob(event.target.value)}
            />
            <CalendarDays className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-[#8b97a7]" />
          </div>
        </ProfileField>

        <ProfileField label="Gender">
          <select
            className={inputClass}
            value={gender}
            onChange={(event) => setGender(event.target.value)}
          >
            <option value="">Select gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="non-binary">Non-binary</option>
            <option value="prefer-not-to-say">Prefer not to say</option>
          </select>
        </ProfileField>
      </div>

      <p className="mt-6 text-sm text-[#8b97a7]">
        This name and photo appear on your reviews and order history.
      </p>

      {formError || error ? (
        <p className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {formError || error}
        </p>
      ) : null}

      {message ? (
        <p className="mt-5 rounded-md border border-main-green/30 bg-main-green/10 px-4 py-3 text-sm font-semibold text-text-dark">
          {message}
        </p>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-4">
        <button
          className="h-12 rounded-md cursor-pointer bg-main-green px-7 text-sm font-extrabold text-white transition hover:bg-main-green-hover disabled:opacity-70"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </button>
        <button
          className="h-12 cursor-pointer rounded-md border border-[#dfe6e3] px-7 text-sm font-extrabold text-[#7c8798]"
          type="button"
          onClick={() => {
            setFullName(getFullName(customer));
            setContact(customer.contact ?? "");
            setDob(toDateInputValue(customer.dob));
            setGender(customer.gender ?? "");
            setFormError("");
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "h-13 w-full rounded-md border border-[#dfe6e3] bg-white px-4 text-sm font-semibold text-text-dark outline-0 transition focus:border-main-green disabled:bg-[#f8faf9] disabled:text-[#687487]";

function ProfileField({
  label,
  action,
  children,
}: {
  label: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="flex min-h-5 items-center justify-between gap-3 text-sm font-extrabold text-[#111827]">
        {label}
        {action}
      </span>
      {children}
    </label>
  );
}

function getFullName(customer: Customer) {
  return [customer.firstName, customer.lastName].filter(Boolean).join(" ");
}

function splitName(fullName: string) {
  const [firstName, ...rest] = fullName.trim().split(/\s+/).filter(Boolean);

  return {
    firstName,
    lastName: rest.length > 0 ? rest.join(" ") : null,
  };
}

function toDateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function authHeader(): HeadersInit {
  if (typeof window === "undefined") {
    return {};
  }

  const token = window.localStorage.getItem("agentica_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
