const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;

export function cloudinaryImageUrl(
  publicId: string | null | undefined,
  transformation = "f_auto,q_auto,c_fill,w_96,h_96",
) {
  if (!publicId) {
    return "";
  }

  if (/^https?:\/\//i.test(publicId)) {
    return publicId;
  }

  if (!cloudName) {
    return "";
  }

  const encodedPublicId = publicId.split("/").map(encodeURIComponent).join("/");

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${encodedPublicId}`;
}
