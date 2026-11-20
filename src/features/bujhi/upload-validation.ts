/** Local photo format gate; not medical extraction or a security scanner. */
export type ReportMediaKind = "photo";
export const PHOTO_LIMIT_BYTES = 10 * 1024 * 1024;

export async function validateReportFile(file: File, kind: ReportMediaKind): Promise<{ en: string; bn: string } | null> {
  if (kind !== "photo") return { en: "Only photos are supported.", bn: "শুধু ছবি দেওয়া যাবে।" };
  if (file.size === 0) return { en: "This file is empty. Choose a photo that has content.", bn: "ফাইলটি খালি। ছবি আছে এমন ফাইল বাছুন।" };
  if (file.size > PHOTO_LIMIT_BYTES) return { en: "This photo is too large. Choose one under 10 MiB.", bn: "ছবিটি খুব বড়। ১০ MiB-এর কম আকারের ছবি বাছুন।" };
  const extension = file.name.split(".").pop()?.toLowerCase();
  const formats: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp" };
  const mime = extension && Object.hasOwn(formats, extension) ? formats[extension] : undefined;
  if (!mime || (file.type !== "" && file.type.toLowerCase() !== mime)) return { en: "Unsupported file type. Use a JPG, PNG or WebP photo.", bn: "এই ধরনের ফাইল চলবে না। JPG, PNG বা WebP ছবি দিন।" };
  const bytes = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const matches = (offset: number, signature: number[]) => signature.every((byte, index) => bytes[offset + index] === byte);
  const ascii = (offset: number, value: string) => matches(offset, Array.from(value, (character) => character.charCodeAt(0)));
  const valid = mime === "image/jpeg" ? matches(0, [255, 216, 255])
    : mime === "image/png" ? matches(0, [137, 80, 78, 71, 13, 10, 26, 10])
    : ascii(0, "RIFF") && ascii(8, "WEBP");
  return valid ? null : { en: "This file is not a valid photo. Choose a JPG, PNG or WebP photo.", bn: "ফাইলটি সঠিক ছবি নয়। JPG, PNG বা WebP ছবি বাছুন।" };
}
