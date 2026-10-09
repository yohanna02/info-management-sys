import { type Id } from "../../convex/_generated/dataModel";

/**
 * Upload a single file to Convex storage and return the resulting storage id.
 *
 * Throws on network/upload failure with the server's error message when one
 * is returned by Convex.
 */
export async function uploadToConvexStorage(
  generateUploadUrl: () => Promise<string>,
  file: File,
): Promise<Id<"_storage">> {
  const uploadUrl = await generateUploadUrl();
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Upload failed (${response.status}): ${text || response.statusText}`,
    );
  }
  const json = (await response.json()) as { storageId?: Id<"_storage"> };
  if (!json.storageId) {
    throw new Error("Upload succeeded but no storageId was returned.");
  }
  return json.storageId;
}

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

export function isAcceptedImage(file: File): boolean {
  return ACCEPTED_IMAGE_TYPES.includes(file.type);
}

export function isWithinSizeLimit(file: File): boolean {
  return file.size <= MAX_PHOTO_BYTES;
}
