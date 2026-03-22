const HEIF_FAMILY_EXT = /\.(heic|heif)$/i;

const HEIF_FAMILY_MIMES = new Set([
  "image/heic",
  "image/heif",
  "image/heic-sequence",
  "image/heif-sequence",
]);

function baseMimeType(type: string): string {
  return type.toLowerCase().trim().split(";")[0]?.trim() ?? "";
}

function stemFromHeifName(name: string): string {
  return name.replace(/\.(heic|heif)$/i, "") || "photo";
}

function toJpegFile(blob: Blob, originalName: string): File {
  const stem = stemFromHeifName(originalName);
  const safeStem = stem.replace(/[^\w.-]+/g, "_").slice(0, 120) || "photo";
  return new File([blob], `${safeStem}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

/** True when the file is HEIC/HEIF (same container) by MIME or by extension; iOS often omits MIME. */
export function isHeicLike(file: File): boolean {
  const t = baseMimeType(file.type);
  if (t && HEIF_FAMILY_MIMES.has(t)) return true;
  return HEIF_FAMILY_EXT.test(file.name);
}

/**
 * Accept browser image MIME types, HEIC/HEIF (with or without MIME), and common
 * extensions when the OS leaves `file.type` empty.
 */
export function isLikelyRasterImage(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  if (isHeicLike(file)) return true;
  if (!file.type) {
    const m = file.name.toLowerCase().match(/\.([a-z0-9]+)$/);
    if (
      m &&
      ["jpg", "jpeg", "png", "gif", "webp", "heic", "heif"].includes(m[1])
    )
      return true;
  }
  return false;
}

/**
 * Safari / WebKit can decode many HEIF files natively; Chrome often cannot.
 */
async function tryDecodeHeifWithImageBitmap(file: File): Promise<File | null> {
  if (typeof createImageBitmap === "undefined" || typeof document === "undefined") {
    return null;
  }
  let bitmap: ImageBitmap | undefined;
  try {
    bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.92);
    });
    if (!blob || blob.size === 0) return null;
    return toJpegFile(blob, file.name);
  } catch {
    return null;
  } finally {
    bitmap?.close();
  }
}

async function convertWithHeic2any(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;
  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
  });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  return toJpegFile(blob, file.name);
}

async function convertWithServer(file: File): Promise<File | null> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/forge/convert-heif", {
    method: "POST",
    body: fd,
    credentials: "same-origin",
  });
  if (!res.ok) return null;
  const blob = await res.blob();
  if (!blob.size) return null;
  return toJpegFile(blob, file.name);
}

const CONVERSION_FAILED_HINT =
  "If this keeps happening, open the photo in Preview or Photos and export a copy as JPEG, or use Safari on iPhone.";

/**
 * Claude vision only supports JPEG/PNG/GIF/WebP. Convert HEIC/HEIF to JPEG using
 * (1) native decode where the browser supports it, (2) heic2any WASM, (3) server sharp.
 */
export async function ensureVisionCompatibleImage(file: File): Promise<File> {
  if (!isHeicLike(file)) return file;

  const fromBitmap = await tryDecodeHeifWithImageBitmap(file);
  if (fromBitmap) return fromBitmap;

  try {
    return await convertWithHeic2any(file);
  } catch {
    /* try server */
  }

  const fromServer = await convertWithServer(file);
  if (fromServer) return fromServer;

  throw new Error(
    `Could not convert this HEIF/HEIC photo. ${CONVERSION_FAILED_HINT}`
  );
}
