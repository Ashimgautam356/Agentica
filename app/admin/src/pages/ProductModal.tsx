import { RiCloseLine, RiDeleteBin6Line, RiImageAddLine } from "@remixicon/react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { CategoryRecord, ProductInput, ProductRecord } from "../api/admin";
import { ButtonSpinner } from "../components/ButtonSpinner";
import { useToast } from "../components/Toast";
import { cloudinaryImageUrl } from "../lib/cloudinary";

export function ProductModal({
  categories,
  initialProduct,
  isSaving,
  onClose,
  onSubmit,
}: {
  categories: CategoryRecord[];
  initialProduct: ProductRecord | null;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (input: ProductInput) => void;
}) {
  const [name, setName] = useState(initialProduct?.name ?? "");
  const [imageId, setImageId] = useState(initialProduct?.imageId ?? "");
  const [imageId1, setImageId1] = useState(initialProduct?.imageId1 ?? "");
  const [imageId2, setImageId2] = useState(initialProduct?.imageId2 ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [secondImageFile, setSecondImageFile] = useState<File | null>(null);
  const [thirdImageFile, setThirdImageFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [description, setDescription] = useState(initialProduct?.description.join("\n") ?? "");
  const [price, setPrice] = useState(String(initialProduct?.price ?? ""));
  const [tags, setTags] = useState(initialProduct?.tags.join(", ") ?? "");
  const [categoryId, setCategoryId] = useState(initialProduct?.categoryId ?? "");
  const isEditing = Boolean(initialProduct);
  const toast = useToast();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      if (!imageFile && !imageId.trim()) {
        setUploadError("Choose a product image first.");
        return;
      }

      setIsUploading(Boolean(imageFile || secondImageFile || thirdImageFile));
      setUploadError("");
      const [uploadedImageId, uploadedImageId1, uploadedImageId2] = await Promise.all([
        imageFile ? uploadToCloudinary(imageFile) : Promise.resolve(imageId.trim()),
        secondImageFile ? uploadToCloudinary(secondImageFile) : Promise.resolve(imageId1.trim()),
        thirdImageFile ? uploadToCloudinary(thirdImageFile) : Promise.resolve(imageId2.trim()),
      ]);

      onSubmit({
        name: name.trim(),
        imageId: uploadedImageId,
        imageId1: uploadedImageId1 || null,
        imageId2: uploadedImageId2 || null,
        description: toList(description, "\n"),
        price: Number(price),
        tags: toList(tags, ","),
        categoryId,
      });
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
      aria-labelledby="product-modal-title"
      aria-modal="true"
      className="fixed inset-0 z-[70] grid min-h-dvh place-items-center bg-[#241F14]/35 px-5 py-8 backdrop-blur-sm"
      role="dialog"
    >
      <div className="w-full max-w-[620px] overflow-hidden rounded-lg border border-[#EFE7D8] bg-white shadow-[0_24px_70px_rgba(36,31,20,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#EFE7D8] px-6 py-5">
          <div>
            <p className="text-xs font-extrabold uppercase text-[#34A85B]">Product details</p>
            <h2 id="product-modal-title" className="mt-1 text-2xl font-extrabold text-[#241F14]">
              {isEditing ? "Edit product" : "Add product"}
            </h2>
          </div>
          <button
            aria-label="Close product modal"
            className="grid size-10 shrink-0 place-items-center rounded-lg text-[#6A717F] transition-[background-color,color,transform] duration-150 hover:bg-[#FFF0EE] hover:text-[#D9584A] active:scale-95"
            onClick={onClose}
            type="button"
          >
            <RiCloseLine size={22} />
          </button>
        </div>

        <form className="grid max-h-[78dvh] gap-4 overflow-y-auto px-6 py-5" onSubmit={submit}>
          <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
            <ProductField label="Product Name" onChange={setName} required value={name} />
            <ProductField
              label="Price"
              onChange={setPrice}
              required
              step="0.01"
              type="number"
              value={price}
            />
            <label className="grid gap-2">
              <span className="text-xs font-bold text-[#8A8172]">Category</span>
              <select
                className="min-h-12 w-full rounded-lg border border-[#EFE7D8] bg-white px-3 text-sm font-semibold text-[#241F14] outline-none transition-colors focus:border-[#34A85B]"
                onChange={(event) => setCategoryId(event.target.value)}
                required
                value={categoryId}
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <ProductField
              label="Tags"
              onChange={setTags}
              placeholder="sale, featured"
              value={tags}
            />
          </div>

          <div className="grid gap-3">
            <div className="grid grid-cols-3 gap-3 max-lg:grid-cols-2 max-sm:grid-cols-1">
              <ImageUploadSlot
                currentImageId={imageId}
                file={imageFile}
                label="Product image"
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
                required
              />
              <ImageUploadSlot
                file={secondImageFile}
                currentImageId={imageId1}
                label="Gallery image 2"
                onDrop={(file) => {
                  setSecondImageFile(file);
                  setImageId1("");
                  setUploadError("");
                }}
                onDropRejected={() => setUploadError("Choose one image under 5 MB.")}
                onRemove={() => {
                  setSecondImageFile(null);
                  setImageId1("");
                }}
              />
              <ImageUploadSlot
                file={thirdImageFile}
                currentImageId={imageId2}
                label="Gallery image 3"
                onDrop={(file) => {
                  setThirdImageFile(file);
                  setImageId2("");
                  setUploadError("");
                }}
                onDropRejected={() => setUploadError("Choose one image under 5 MB.")}
                onRemove={() => {
                  setThirdImageFile(null);
                  setImageId2("");
                }}
              />
            </div>
            {uploadError ? (
              <p className="m-0 text-sm font-semibold text-[#D9584A]">{uploadError}</p>
            ) : null}
          </div>

          <label className="grid gap-2">
            <span className="text-xs font-bold text-[#8A8172]">Description</span>
            <textarea
              className="min-h-28 w-full rounded-lg border border-[#EFE7D8] px-3 py-2 text-sm font-semibold text-[#241F14] outline-none transition-colors placeholder:text-[#8A8172] focus:border-[#34A85B]"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="One line per description item"
              value={description}
            />
          </label>

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
              {isSaving || isUploading ? "Saving..." : isEditing ? "Save changes" : "Add product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductField({
  label,
  onChange,
  value,
  placeholder,
  required,
  step,
  type = "text",
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
  placeholder?: string;
  required?: boolean;
  step?: string;
  type?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-bold text-[#8A8172]">{label}</span>
      <input
        className="min-h-12 w-full rounded-lg border border-[#EFE7D8] px-3 text-sm font-semibold text-[#241F14] outline-none transition-colors placeholder:text-[#8A8172] focus:border-[#34A85B]"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder ?? label}
        required={required}
        step={step}
        type={type}
        value={value}
      />
    </label>
  );
}

function ImageUploadSlot({
  currentImageId,
  file,
  label,
  onDrop,
  onDropRejected,
  onRemove,
  required,
}: {
  currentImageId?: string;
  file: File | null;
  label: string;
  onDrop: (file: File) => void;
  onDropRejected: () => void;
  onRemove: () => void;
  required?: boolean;
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
        <span className="text-xs font-bold text-[#8A8172]">
          {label}
          {required ? "" : " (optional)"}
        </span>
        {hasImage ? (
          <button
            aria-label={`Remove ${label.toLowerCase()}`}
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
        className={`grid min-h-36 cursor-pointer place-items-center rounded-lg border border-dashed px-3 py-4 text-center transition-colors ${
          isDragActive ? "border-[#34A85B] bg-[#EAF5EC]" : "border-[#D8CFBE] bg-[#FBF8F2]"
        }`}
      >
        <input {...getInputProps()} />
        {previewUrl ? (
          <img alt={label} className="max-h-32 rounded-lg object-contain" src={previewUrl} />
        ) : currentImageUrl ? (
          <img alt={label} className="max-h-32 rounded-lg object-contain" src={currentImageUrl} />
        ) : (
          <div className="grid justify-items-center gap-2">
            <span className="grid size-11 place-items-center rounded-lg bg-[#EAF5EC] text-[#34A85B]">
              <RiImageAddLine size={22} />
            </span>
            <p className="m-0 text-xs font-semibold leading-5 text-[#6A717F]">
              Drop image here, or click to choose.
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

function toList(value: string, separator: "," | "\n") {
  return value
    .split(separator)
    .map((item) => item.trim())
    .filter(Boolean);
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
