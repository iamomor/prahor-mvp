/** Local photo format gate; not medical extraction or a security scanner. */
export type ReportMediaKind = "photo";
export const PHOTO_LIMIT_BYTES = 10 * 1024 * 1024;

export async function validateReportFile(file: File, kind: ReportMediaKind): Promise<string | null> {
  if (kind !== "photo") return "Only photo selection is supported.";
  if (file.size === 0) return "This file is empty. Choose a non-empty photo.";
  if (file.size > PHOTO_LIMIT_BYTES) return "This file is too large. Choose a photo no larger than 10 MiB.";
  const extension = file.name.split(".").pop()?.toLowerCase();
  const formats: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
  const mime = extension && Object.hasOwn(formats, extension) ? formats[extension] : undefined;
  if (!mime || (file.type !== "" && file.type.toLowerCase() !== mime)) return "Unsupported file type. Photos must be JPG/JPEG, PNG, or WebP.";
  const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const matches = (offset: number, signature: number[]) => signature.every((byte, index) => bytes[offset + index] === byte);
  const ascii = (offset: number, value: string) => matches(offset, Array.from(value, (character) => character.charCodeAt(0)));
  const valid = mime === "image/jpeg" ? matches(0, [255, 216, 255])
    : mime === "image/png" ? matches(0, [137, 80, 78, 71, 13, 10, 26, 10])
    : ascii(0, "RIFF") && ascii(8, "WEBP");
  return valid ? null : "This file's contents do not match the selected media format. Choose a supported photo.";
}
