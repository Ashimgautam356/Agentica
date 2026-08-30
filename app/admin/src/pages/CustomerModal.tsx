import { RiCloseLine, RiDeleteBin6Line, RiImageAddLine } from "@remixicon/react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { UserInput, UserPasswordInput, UserRecord } from "../api/admin";
import { ButtonSpinner } from "../components/ButtonSpinner";
import { useToast } from "../components/Toast";
import { cloudinaryImageUrl } from "../lib/cloudinary";

export function CustomerModal({
  customer,
  isSaving,
  onClose,
  onPasswordSubmit,
  onSubmit,
}: {
  customer: UserRecord;
  isSaving: boolean;
  onClose: () => void;
  onPasswordSubmit: (input: UserPasswordInput) => void;
  onSubmit: (input: UserInput) => void;
}) {
  const [fullName, setFullName] = useState(getFullName(customer));
  const [password, setPassword] = useState("");
  const [imageId, setImageId] = useState(customer.imageId ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const toast = useToast();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setIsUploading(Boolean(imageFile));
      setUploadError("");
      const uploadedImageId = imageFile ? await uploadToCloudinary(imageFile) : imageId.trim();
      const { firstName, lastName } = splitFullName(fullName);

      onSubmit({
        firstName,
        lastName,
        imageId: uploadedImageId || null,
      });

      if (password.trim()) {
        onPasswordSubmit({ password: password.trim() });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Image upload failed.";

      setUploadError(message);
      toast.error(message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div
      aria-labelledby="customer-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-[70] grid min-h-dvh place-items-center bg-[#241F14]/35 px-5 py-8 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-[520px] overflow-hidden rounded-lg border border-[#EFE7D8] bg-white shadow-[0_24px_70px_rgba(36,31,20,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#EFE7D8] px-6 py-5">
          <div>
            <p className="text-xs font-extrabold uppercase text-[#34A85B]">Customer details</p>
            <h2 id="customer-modal-title" className="mt-1 text-2xl font-extrabold text-[#241F14]">
              Edit customer
            </h2>
          </div>
          <button
            aria-label="Close customer modal"
            className="grid size-10 shrink-0 place-items-center rounded-lg text-[#6A717F] transition-[background-color,color,transform] duration-150 hover:bg-[#FFF0EE] hover:text-[#D9584A] active:scale-95"
            onClick={onClose}
            type="button"
          >
            <RiCloseLine size={22} />
          </button>
        </div>

        <form className="grid gap-4 px-6 py-5" onSubmit={submit}>
          <label className="grid gap-2">
            <span className="text-xs font-bold text-[#8A8172]">Full Name</span>
            <input
              className="min-h-12 w-full rounded-lg border border-[#EFE7D8] px-3 text-sm font-semibold text-[#241F14] outline-none transition-colors placeholder:text-[#8A8172] focus:border-[#34A85B]"
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Full name"
              required
              value={fullName}
            />
          </label>

          <label className="grid gap-2">
            <span className="text-xs font-bold text-[#8A8172]">New Password</span>
            <input
              className="min-h-12 w-full rounded-lg border border-[#EFE7D8] px-3 text-sm font-semibold text-[#241F14] outline-none transition-colors placeholder:text-[#8A8172] focus:border-[#34A85B]"
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Leave blank to keep current password"
              type="password"
              value={password}
            />
          </label>

          <CustomerImageUpload
            currentImageId={imageId}
            file={imageFile}
            onDrop={(file) => {
              setImageFile(file);
              setImageId("");
              setUploadError("");
            }}
            onDropRejected={() => setUploadError("Choose one image under 5 MB.")}
            onRemove={() => {
              setImageFile(null);
              setImageId("");
              setUploadError("");
            }}
          />

          {uploadError ? (
            <p className="m-0 text-sm font-semibold text-[#D9584A]">{uploadError}</p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-3 border-t border-[#EFE7D8] pt-4">
            <button
              className="min-h-11 rounded-lg border border-[#EFE7D8] bg-white px-5 text-sm font-bold text-[#6A717F] transition-[background-color,transform] duration-150 hover:bg-[#FBF8F2] active:scale-95"
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#34A85B] px-5 text-sm font-bold text-white transition-[background-color,transform] duration-150 hover:bg-[#2C8F4E] active:scale-95 disabled:bg-[#A7CDB3]"
              disabled={isSaving || isUploading}
              type="submit"
            >
              {isSaving || isUploading ? <ButtonSpinner /> : null}
              {isSaving || isUploading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CustomerImageUpload({
  currentImageId,
  file,
  onDrop,
  onDropRejected,
  onRemove,
}: {
  currentImageId: string;
  file: File | null;
  onDrop: (file: File) => void;
  onDropRejected: () => void;
  onRemove: () => void;
}) {
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  const currentImageUrl = useMemo(
    () => cloudinaryImageUrl(currentImageId, "f_auto,q_auto,c_fill,w_220,h_160"),
    [currentImageId],
  );
  const hasImage = Boolean(file || currentImageId);
  const { getInputProps, getRootProps, isDragActive } = useDropzone({
    accept: { "image/*": [] },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    onDrop: ([droppedFile]) => {
      if (droppedFile) {
        onDrop(droppedFile);
      }
    },
    onDropRejected,
  });

  useEffect(() => {
    if (!previewUrl) {
      return undefined;
    }

    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-[#8A8172]">Customer image</span>
        {hasImage ? (
          <button
            aria-label="Remove customer image"
            className="grid size-8 place-items-center rounded-lg bg-[#FFF0EE] text-[#D9584A] transition-[background-color,transform] duration-150 hover:bg-[#FBE0DD] active:scale-95"
            onClick={onRemove}
            type="button"
          >
            <RiDeleteBin6Line size={16} />
          </button>
        ) : null}
      </div>
      <div
        {...getRootProps()}
        className={`grid min-h-40 cursor-pointer place-items-center rounded-lg border border-dashed px-4 py-5 text-center transition-colors ${
          isDragActive ? "border-[#34A85B] bg-[#EAF5EC]" : "border-[#D8CFBE] bg-[#FBF8F2]"
        }`}
      >
        <input {...getInputProps()} />
        {previewUrl ? (
          <img
            alt="Selected customer"
            className="max-h-40 rounded-lg object-contain"
            src={previewUrl}
          />
        ) : currentImageUrl ? (
          <img
            alt="Selected customer"
            className="max-h-40 rounded-lg object-contain"
            src={currentImageUrl}
          />
        ) : (
          <div className="grid justify-items-center gap-2">
            <span className="grid size-12 place-items-center rounded-lg bg-[#EAF5EC] text-[#34A85B]">
              <RiImageAddLine size={24} />
            </span>
            <p className="m-0 text-sm font-semibold text-[#6A717F]">
              Drop an image here, or click to choose.
            </p>
            {currentImageId ? (
              <p className="m-0 max-w-full truncate text-xs font-semibold text-[#8A8172]">
                {currentImageId}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

function getFullName(customer: UserRecord) {
  return [customer.firstName, customer.lastName].filter(Boolean).join(" ") || "Customer";
}

function splitFullName(value: string) {
  const [firstName = "", ...rest] = value.trim().split(/\s+/);

  return {
    firstName,
    lastName: rest.join(" ") || null,
  };
}

async function uploadToCloudinary(file: File) {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary env values are missing in app/admin/.env.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const body = (await response.json()) as { public_id?: string; error?: { message?: string } };

  if (!response.ok || !body.public_id) {
    throw new Error(body.error?.message ?? "Cloudinary upload failed.");
  }

  return body.public_id;
}
