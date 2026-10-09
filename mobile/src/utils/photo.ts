import { File } from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import type { Id } from "@convex/_generated/dataModel";

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_PHOTO_MB = MAX_PHOTO_BYTES / 1024 / 1024;

export interface PickedPhoto {
  /** Local URI of the picked image (`file://` or Android `content://`). */
  uri: string;
  /** MIME type sent to Convex storage. */
  mimeType: string;
  /** Size in bytes when the picker reported it, otherwise null. */
  fileSize: number | null;
}

const EXTENSION_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

function mimeFromFileName(fileName: string | null | undefined): string | null {
  if (!fileName) return null;
  const extension = fileName.split(".").pop()?.toLowerCase();
  if (!extension) return null;
  return EXTENSION_MIME[extension] ?? null;
}

export function assertAcceptablePhoto(photo: PickedPhoto): void {
  if (!ACCEPTED_IMAGE_TYPES.includes(photo.mimeType)) {
    throw new Error(
      `Unsupported image type "${photo.mimeType}". Accepted: ${ACCEPTED_IMAGE_TYPES.map((type) => type.replace("image/", "").toUpperCase()).join(", ")}.`,
    );
  }
  if (photo.fileSize !== null && photo.fileSize > MAX_PHOTO_BYTES) {
    throw new Error(
      `Image is ${(photo.fileSize / 1024 / 1024).toFixed(1)} MB, max ${MAX_PHOTO_MB} MB.`,
    );
  }
}

/**
 * Opens the photo library and returns the picked image, or null if the user
 * cancelled. Throws with a user-facing message when permission is denied or
 * the image is not an accepted type/size.
 */
export async function pickPhotoFromLibrary(): Promise<PickedPhoto | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error(
      permission.canAskAgain
        ? "Photo library access is required to attach a photo."
        : "Photo library access is denied. Enable it in your device settings to attach a photo.",
    );
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    // A quality below 1 makes iOS re-encode HEIC library photos as JPEG,
    // which keeps them inside the accepted types.
    quality: 0.9,
  });
  if (result.canceled) return null;

  const asset = result.assets[0];
  if (!asset) return null;

  const photo: PickedPhoto = {
    uri: asset.uri,
    mimeType: asset.mimeType ?? mimeFromFileName(asset.fileName) ?? "image/jpeg",
    fileSize: asset.fileSize ?? null,
  };
  assertAcceptablePhoto(photo);
  return photo;
}

/**
 * Uploads a picked photo to Convex storage and returns the resulting storage
 * id, which is then passed to `students.create` / `students.update`.
 *
 * The local file is read through `expo-file-system` (works for both `file://`
 * and Android `content://` URIs) and posted as a Blob so the runtime's
 * `fetch` sends it with a known content type. The photo must be a JPEG, PNG,
 * WEBP, or GIF under 5 MB.
 */
export async function uploadPhotoToConvexStorage(
  generateUploadUrl: () => Promise<string>,
  photo: PickedPhoto,
): Promise<Id<"_storage">> {
  assertAcceptablePhoto(photo);

  // An ArrayBuffer (rather than a typed array) is passed to Blob because that
  // is the part type React Native's Blob implementation is guaranteed to read.
  const buffer = await new File(photo.uri).arrayBuffer();
  if (buffer.byteLength > MAX_PHOTO_BYTES) {
    throw new Error(
      `Image is ${(buffer.byteLength / 1024 / 1024).toFixed(1)} MB, max ${MAX_PHOTO_MB} MB.`,
    );
  }

  const uploadUrl = await generateUploadUrl();
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": photo.mimeType },
    body: new Blob([buffer], { type: photo.mimeType }),
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
