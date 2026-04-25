/** Max width/height for stored avatar; keeps localStorage usage reasonable. */
const MAX_EDGE = 256;
const JPEG_QUALITY = 0.82;
/** Reject absurd payloads (base64 data URLs). */
export const MAX_AVATAR_DATA_URL_CHARS = 400_000;

/**
 * Decode an image file, scale down, and return a JPEG data URL for local profile storage.
 */
export async function imageFileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Image is too large (max 8 MB).");
  }

  const bitmap = await createImageBitmap(file);
  try {
    const { width, height } = bitmap;
    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Could not process image.");
    ctx.drawImage(bitmap, 0, 0, w, h);
    const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
    if (dataUrl.length > MAX_AVATAR_DATA_URL_CHARS) {
      throw new Error("Processed image is still too large; try a smaller file.");
    }
    return dataUrl;
  } finally {
    bitmap.close();
  }
}

export function isSafeAvatarDataUrl(value: string | null | undefined): value is string {
  if (value == null || typeof value !== "string") return false;
  if (!value.startsWith("data:image/")) return false;
  if (value.length > MAX_AVATAR_DATA_URL_CHARS) return false;
  return true;
}
