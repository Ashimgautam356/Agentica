import { createHash } from "node:crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxImageSize = 2 * 1024 * 1024;
const allowedImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const folder = process.env.CLOUDINARY_UPLOAD_FOLDER;

  if (!cloudName || !apiKey || !apiSecret) {
    return NextResponse.json({ error: "Cloudinary env values are missing." }, { status: 500 });
  }

  if (!authHeader || !(await isSignedInCustomer(authHeader))) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Image file is required." }, { status: 400 });
  }

  if (!allowedImageTypes.has(file.type)) {
    return NextResponse.json({ error: "Use a JPG, PNG, or WEBP image." }, { status: 400 });
  }

  if (file.size > maxImageSize) {
    return NextResponse.json({ error: "Image must be 2MB or smaller." }, { status: 400 });
  }

  const timestamp = Math.floor(Date.now() / 1000).toString();
  const paramsToSign: Record<string, string> = { timestamp };

  if (folder) {
    paramsToSign.folder = folder;
  }

  const uploadForm = new FormData();
  uploadForm.append("file", file);
  uploadForm.append("api_key", apiKey);
  uploadForm.append("timestamp", timestamp);
  uploadForm.append("signature", signCloudinaryParams(paramsToSign, apiSecret));

  if (folder) {
    uploadForm.append("folder", folder);
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: uploadForm,
  });
  const body = (await response.json()) as { public_id?: string; error?: { message?: string } };

  if (!response.ok || !body.public_id) {
    return NextResponse.json(
      { error: body.error?.message ?? "Cloudinary upload failed." },
      { status: 502 },
    );
  }

  return NextResponse.json({ publicId: body.public_id });
}

async function isSignedInCustomer(authHeader: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
  const response = await fetch(`${apiUrl}/auth/me`, {
    headers: { authorization: authHeader },
    cache: "no-store",
  });

  return response.ok;
}

function signCloudinaryParams(params: Record<string, string>, apiSecret: string) {
  const payload = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(`${payload}${apiSecret}`).digest("hex");
}
