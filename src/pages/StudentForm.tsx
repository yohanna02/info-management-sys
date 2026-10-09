import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { type Id } from "../../convex/_generated/dataModel";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  STUDENT_GENDERS,
  STUDENT_LEVELS,
  STUDENT_STATUSES,
  type StudentGender,
  type StudentInput,
  type StudentLevel,
  type StudentStatus,
} from "@/lib/student";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_PHOTO_BYTES,
  isAcceptedImage,
  isWithinSizeLimit,
  uploadToConvexStorage,
} from "@/lib/storage";

export interface StudentFormProps {
  id?: Id<"students">;
  onDone: () => void;
  onCancel: () => void;
}

type FormState = StudentInput;

function emptyForm(): FormState {
  return {
    matricNumber: "",
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    phone: "",
    gender: "male",
    dateOfBirth: "",
    level: "ND1",
    program: "B.Eng. Computer Engineering",
    entryYear: new Date().getFullYear(),
    graduationYear: undefined,
    address: "",
    stateOfOrigin: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    guardianRelationship: "",
    status: "active",
    notes: "",
    photoStorageId: undefined,
  };
}

function toNumberOrUndefined(v: string): number | undefined {
  if (v === "" || v === undefined || v === null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

interface PhotoState {
  /** Signed URL for the existing photo (backend already resolved). */
  existingUrl: string | null;
  /** Newly picked file that has not yet been uploaded. */
  pendingFile: File | null;
  /** Local object URL for the pending file (preview before upload). */
  pendingPreviewUrl: string | null;
  /** True when the user clicked "Remove photo". */
  removed: boolean;
}

const EMPTY_PHOTO: PhotoState = {
  existingUrl: null,
  pendingFile: null,
  pendingPreviewUrl: null,
  removed: false,
};

interface InnerFormProps {
  initial: FormState;
  isEdit: boolean;
  existingPhotoUrl: string | null;
  generateUploadUrl: () => Promise<string>;
  onSubmit: (payload: StudentInput) => Promise<void>;
  onCancel: () => void;
}

function InnerForm({
  initial,
  isEdit,
  existingPhotoUrl,
  generateUploadUrl,
  onSubmit,
  onCancel,
}: InnerFormProps) {
  const [form, setForm] = useState<FormState>(initial);
  const [photo, setPhoto] = useState<PhotoState>({
    ...EMPTY_PHOTO,
    existingUrl: existingPhotoUrl,
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Revoke any object URL we created when the component unmounts so we don't
  // leak memory. The pendingPreviewUrl is captured in a ref so we don't
  // depend on changing state.
  const pendingPreviewUrlRef = useRef<string | null>(
    photo.pendingPreviewUrl,
  );
  useEffect(() => {
    pendingPreviewUrlRef.current = photo.pendingPreviewUrl;
  }, [photo.pendingPreviewUrl]);
  useEffect(() => {
    return () => {
      if (pendingPreviewUrlRef.current) {
        URL.revokeObjectURL(pendingPreviewUrlRef.current);
      }
    };
  }, []);

  function updateField<K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isAcceptedImage(file)) {
      setError(
        `Unsupported image type "${file.type || "unknown"}". Accepted: JPEG, PNG, WEBP, GIF.`,
      );
      e.target.value = "";
      return;
    }
    if (!isWithinSizeLimit(file)) {
      setError(
        `Image is ${(file.size / 1024 / 1024).toFixed(1)} MB, max ${MAX_PHOTO_BYTES / 1024 / 1024} MB.`,
      );
      e.target.value = "";
      return;
    }

    setError(null);
    if (photo.pendingPreviewUrl) {
      URL.revokeObjectURL(photo.pendingPreviewUrl);
    }
    setPhoto((prev) => ({
      ...prev,
      pendingFile: file,
      pendingPreviewUrl: URL.createObjectURL(file),
      removed: false,
    }));
  }

  function handleRemovePhoto() {
    if (photo.pendingPreviewUrl) {
      URL.revokeObjectURL(photo.pendingPreviewUrl);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPhoto({
      existingUrl: null,
      pendingFile: null,
      pendingPreviewUrl: null,
      removed: true,
    });
  }

  function handleClearPending() {
    if (photo.pendingPreviewUrl) {
      URL.revokeObjectURL(photo.pendingPreviewUrl);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setPhoto((prev) => ({
      ...prev,
      pendingFile: null,
      pendingPreviewUrl: null,
      removed: false,
    }));
  }

  const previewUrl = photo.pendingPreviewUrl ?? photo.existingUrl;
  const showRemoveButton =
    !!previewUrl && !photo.pendingFile;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (
      !form.matricNumber.trim() ||
      !form.firstName.trim() ||
      !form.lastName.trim()
    ) {
      setError("Matric number, first name, and last name are required.");
      return;
    }
    if (!form.email.trim()) {
      setError("Email is required.");
      return;
    }
    if (!form.guardianName.trim() || !form.guardianPhone.trim()) {
      setError("Guardian name and phone are required.");
      return;
    }
    if (
      form.graduationYear !== undefined &&
      form.graduationYear < form.entryYear
    ) {
      setError("Graduation year cannot be earlier than entry year.");
      return;
    }

    setSubmitting(true);
    try {
      // Upload the photo first, if one was picked. The backend will move any
      // previous photo to trash once the new storage id is patched in.
      let photoStorageId: Id<"_storage"> | undefined = form.photoStorageId;
      if (photo.pendingFile) {
        photoStorageId = await uploadToConvexStorage(
          generateUploadUrl,
          photo.pendingFile,
        );
      } else if (photo.removed) {
        photoStorageId = undefined;
      }

      const payload: StudentInput = {
        ...form,
        photoStorageId,
        graduationYear:
          form.graduationYear === undefined || Number.isNaN(form.graduationYear)
            ? undefined
            : form.graduationYear,
        middleName: form.middleName?.trim() ? form.middleName.trim() : undefined,
        address: form.address?.trim() ? form.address.trim() : undefined,
        stateOfOrigin: form.stateOfOrigin?.trim()
          ? form.stateOfOrigin.trim()
          : undefined,
        guardianEmail: form.guardianEmail?.trim()
          ? form.guardianEmail.trim()
          : undefined,
        guardianRelationship: form.guardianRelationship?.trim()
          ? form.guardianRelationship.trim()
          : undefined,
        notes: form.notes?.trim() ? form.notes.trim() : undefined,
      };
      await onSubmit(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save student.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card">
      {error && <div className="notice notice-error">{error}</div>}

      <div className="form-section">
        <h3>Photo</h3>
        <div className="photo-picker">
          <div className="photo-preview">
            {previewUrl ? (
              <img src={previewUrl} alt="Student photo preview" />
            ) : (
              <div className="photo-placeholder">
                <span>No photo</span>
              </div>
            )}
          </div>
          <div className="photo-controls">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              onChange={handleFileChange}
              disabled={submitting}
            />
            {photo.pendingFile && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleClearPending}
                disabled={submitting}
              >
                Cancel new photo
              </button>
            )}
            {showRemoveButton && (
              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={handleRemovePhoto}
                disabled={submitting}
              >
                Remove photo
              </button>
            )}
            <p className="muted photo-hint">
              JPEG, PNG, WEBP, or GIF. Max {MAX_PHOTO_BYTES / 1024 / 1024} MB.
              The photo is uploaded when you save.
            </p>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Identity</h3>
        <div className="form-grid">
          <div>
            <label htmlFor="matricNumber">Matric number *</label>
            <input
              id="matricNumber"
              value={form.matricNumber}
              onChange={(e) => updateField("matricNumber", e.target.value)}
              placeholder="e.g. CPE/2023/001"
              required
            />
          </div>
          <div>
            <label htmlFor="dateOfBirth">Date of birth *</label>
            <input
              id="dateOfBirth"
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => updateField("dateOfBirth", e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="firstName">First name *</label>
            <input
              id="firstName"
              value={form.firstName}
              onChange={(e) => updateField("firstName", e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="lastName">Last name *</label>
            <input
              id="lastName"
              value={form.lastName}
              onChange={(e) => updateField("lastName", e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="middleName">Middle name</label>
            <input
              id="middleName"
              value={form.middleName ?? ""}
              onChange={(e) => updateField("middleName", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="gender">Gender *</label>
            <select
              id="gender"
              value={form.gender}
              onChange={(e) =>
                updateField("gender", e.target.value as StudentGender)
              }
            >
              {STUDENT_GENDERS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Contact</h3>
        <div className="form-grid">
          <div>
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="phone">Phone *</label>
            <input
              id="phone"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              required
            />
          </div>
          <div className="full">
            <label htmlFor="address">Address</label>
            <input
              id="address"
              value={form.address ?? ""}
              onChange={(e) => updateField("address", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="stateOfOrigin">State of origin</label>
            <input
              id="stateOfOrigin"
              value={form.stateOfOrigin ?? ""}
              onChange={(e) => updateField("stateOfOrigin", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Academic</h3>
        <div className="form-grid">
          <div>
            <label htmlFor="level">Level *</label>
            <select
              id="level"
              value={form.level}
              onChange={(e) =>
                updateField("level", e.target.value as StudentLevel)
              }
            >
              {STUDENT_LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="program">Program *</label>
            <input
              id="program"
              value={form.program}
              onChange={(e) => updateField("program", e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="entryYear">Entry year *</label>
            <input
              id="entryYear"
              type="number"
              value={form.entryYear}
              onChange={(e) =>
                updateField(
                  "entryYear",
                  toNumberOrUndefined(e.target.value) ??
                    new Date().getFullYear(),
                )
              }
              min={1990}
              max={new Date().getFullYear() + 1}
              required
            />
          </div>
          <div>
            <label htmlFor="graduationYear">Graduation year</label>
            <input
              id="graduationYear"
              type="number"
              value={form.graduationYear ?? ""}
              onChange={(e) =>
                updateField("graduationYear", toNumberOrUndefined(e.target.value))
              }
              min={1990}
              max={2100}
            />
          </div>
          <div>
            <label htmlFor="status">Status *</label>
            <select
              id="status"
              value={form.status}
              onChange={(e) =>
                updateField("status", e.target.value as StudentStatus)
              }
            >
              {STUDENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Guardian / Next of kin</h3>
        <div className="form-grid">
          <div>
            <label htmlFor="guardianName">Name *</label>
            <input
              id="guardianName"
              value={form.guardianName}
              onChange={(e) => updateField("guardianName", e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="guardianRelationship">Relationship</label>
            <input
              id="guardianRelationship"
              value={form.guardianRelationship ?? ""}
              onChange={(e) =>
                updateField("guardianRelationship", e.target.value)
              }
              placeholder="e.g. Father, Mother, Uncle"
            />
          </div>
          <div>
            <label htmlFor="guardianPhone">Phone *</label>
            <input
              id="guardianPhone"
              value={form.guardianPhone}
              onChange={(e) => updateField("guardianPhone", e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="guardianEmail">Email</label>
            <input
              id="guardianEmail"
              type="email"
              value={form.guardianEmail ?? ""}
              onChange={(e) => updateField("guardianEmail", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Notes</h3>
        <div className="form-grid">
          <div className="full">
            <label htmlFor="notes">Internal notes</label>
            <textarea
              id="notes"
              value={form.notes ?? ""}
              onChange={(e) => updateField("notes", e.target.value)}
              placeholder="Optional remarks about this student."
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </button>
        <button type="submit" className="btn" disabled={submitting}>
          {submitting && <span className="spinner" />}
          {isEdit ? "Save changes" : "Create student"}
        </button>
      </div>
    </form>
  );
}

export function StudentForm({ id, onDone, onCancel }: StudentFormProps) {
  const isEdit = id !== undefined;
  const existing = useQuery(api.students.getById, id ? { id } : "skip");
  const create = useMutation(api.students.create);
  const update = useMutation(api.students.update);
  const generateUploadUrl = useMutation(api.students.generateUploadUrl);

  if (isEdit) {
    if (existing === undefined) {
      return <p className="muted">Loading student…</p>;
    }
    if (existing === null) {
      return (
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Student not found</h2>
          <p className="muted">
            The student you are trying to edit does not exist.
          </p>
          <button className="btn btn-secondary" onClick={onCancel}>
            Back
          </button>
        </div>
      );
    }
  }

  const initial: FormState =
    isEdit && existing ? { ...emptyForm(), ...existing } : emptyForm();
  const existingPhotoUrl =
    isEdit && existing ? existing.photoUrl ?? null : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{isEdit ? "Edit student" : "Add student"}</h1>
          <p>
            {isEdit
              ? "Update the student record."
              : "Create a new student record for the Computer Engineering department."}
          </p>
        </div>
      </div>
      <InnerForm
        key={id ?? "new"}
        initial={initial}
        isEdit={isEdit}
        existingPhotoUrl={existingPhotoUrl}
        generateUploadUrl={generateUploadUrl}
        onCancel={onCancel}
        onSubmit={async (payload) => {
          if (isEdit && id) {
            await update({ id, ...payload });
          } else {
            await create(payload);
          }
          onDone();
        }}
      />
    </div>
  );
}
