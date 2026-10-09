import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/button";
import { DateField, SelectField, TextField } from "@/components/field";
import { LoadingView } from "@/components/loading-view";
import { Notice } from "@/components/notice";
import { SectionCard } from "@/components/section-card";
import { StudentPhoto } from "@/components/student-photo";
import { DEFAULT_PROGRAM, ENTRY_YEAR_MIN } from "@/constants";
import { colors, fontSize, spacing } from "@/theme";
import {
  MAX_PHOTO_MB,
  pickPhotoFromLibrary,
  uploadPhotoToConvexStorage,
  type PickedPhoto,
} from "@/utils/photo";
import {
  STUDENT_GENDERS,
  STUDENT_LEVELS,
  STUDENT_STATUSES,
  type StudentGender,
  type StudentInput,
  type StudentLevel,
  type StudentStatus,
} from "@/utils/student";

export interface StudentFormScreenProps {
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
    program: DEFAULT_PROGRAM,
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

function toNumberOrUndefined(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

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
  const [pendingPhoto, setPendingPhoto] = useState<PickedPhoto | null>(null);
  const [removedPhoto, setRemovedPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const insets = useSafeAreaInsets();

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleChoosePhoto() {
    try {
      const photo = await pickPhotoFromLibrary();
      if (!photo) return;
      setError(null);
      setPendingPhoto(photo);
      setRemovedPhoto(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not open the photo library.");
    }
  }

  function handleRemovePhoto() {
    setPendingPhoto(null);
    setRemovedPhoto(true);
  }

  const previewUrl = pendingPhoto?.uri ?? existingPhotoUrl;
  const showRemoveButton = Boolean(previewUrl) && !pendingPhoto && !removedPhoto;

  async function handleSubmit() {
    setError(null);

    if (!form.matricNumber.trim() || !form.firstName.trim() || !form.lastName.trim()) {
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
      // Upload the photo first, if one was picked. The backend moves the
      // previous photo to trash once the new storage id is patched in.
      let photoStorageId: Id<"_storage"> | undefined = form.photoStorageId;
      if (pendingPhoto) {
        photoStorageId = await uploadPhotoToConvexStorage(generateUploadUrl, pendingPhoto);
      } else if (removedPhoto) {
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
      setSubmitting(false);
    }
  }

  const twoUp = { width: "48%" } as const;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {error ? <Notice>{error}</Notice> : null}

        <SectionCard title="Photo">
          <View style={styles.photoRow}>
            <StudentPhoto
              url={previewUrl}
              name={`${form.firstName} ${form.lastName}`.trim() || "?"}
              size="lg"
            />
            <View style={styles.photoControls}>
              <Button
                label={pendingPhoto ? "Replace photo" : "Choose photo"}
                variant="secondary"
                onPress={() => void handleChoosePhoto()}
                disabled={submitting}
              />
              {pendingPhoto ? (
                <Button
                  label="Cancel new photo"
                  variant="secondary"
                  size="sm"
                  onPress={() => setPendingPhoto(null)}
                  disabled={submitting}
                />
              ) : null}
              {showRemoveButton ? (
                <Button
                  label="Remove photo"
                  variant="danger"
                  size="sm"
                  onPress={handleRemovePhoto}
                  disabled={submitting}
                />
              ) : null}
              <Text style={styles.hint}>
                JPEG, PNG, WEBP, or GIF. Max {MAX_PHOTO_MB} MB. The photo is
                uploaded when you save.
              </Text>
            </View>
          </View>
        </SectionCard>

        <SectionCard title="Identity">
          <View style={styles.pairs}>
            <TextField
              label="Matric number *"
              value={form.matricNumber}
              onChangeText={(value) => updateField("matricNumber", value)}
              placeholder="e.g. CPE/2023/001"
              autoCapitalize="characters"
              style={twoUp}
            />
            <DateField
              label="Date of birth *"
              value={form.dateOfBirth}
              onChange={(value) => updateField("dateOfBirth", value)}
              required
              maximumDate={new Date()}
              style={twoUp}
            />
            <TextField
              label="First name *"
              value={form.firstName}
              onChangeText={(value) => updateField("firstName", value)}
              autoComplete="name"
              style={twoUp}
            />
            <TextField
              label="Last name *"
              value={form.lastName}
              onChangeText={(value) => updateField("lastName", value)}
              style={twoUp}
            />
            <TextField
              label="Middle name"
              value={form.middleName ?? ""}
              onChangeText={(value) => updateField("middleName", value)}
              style={twoUp}
            />
            <SelectField
              label="Gender *"
              value={form.gender}
              onChange={(value) => updateField("gender", value as StudentGender)}
              options={STUDENT_GENDERS.map((value) => ({ value, label: value }))}
              style={twoUp}
            />
          </View>
        </SectionCard>

        <SectionCard title="Contact">
          <View style={styles.pairs}>
            <TextField
              label="Email *"
              value={form.email}
              onChangeText={(value) => updateField("email", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              style={twoUp}
            />
            <TextField
              label="Phone *"
              value={form.phone}
              onChangeText={(value) => updateField("phone", value)}
              keyboardType="phone-pad"
              autoComplete="tel"
              style={twoUp}
            />
            <TextField
              label="Address"
              value={form.address ?? ""}
              onChangeText={(value) => updateField("address", value)}
              style={styles.full}
            />
            <TextField
              label="State of origin"
              value={form.stateOfOrigin ?? ""}
              onChangeText={(value) => updateField("stateOfOrigin", value)}
              style={twoUp}
            />
          </View>
        </SectionCard>

        <SectionCard title="Academic">
          <View style={styles.pairs}>
            <SelectField
              label="Level *"
              value={form.level}
              onChange={(value) => updateField("level", value as StudentLevel)}
              options={STUDENT_LEVELS.map((value) => ({ value, label: value }))}
              style={twoUp}
            />
            <TextField
              label="Program *"
              value={form.program}
              onChangeText={(value) => updateField("program", value)}
              style={twoUp}
            />
            <TextField
              label="Entry year *"
              value={String(form.entryYear)}
              onChangeText={(value) =>
                updateField(
                  "entryYear",
                  toNumberOrUndefined(value) ?? new Date().getFullYear(),
                )
              }
              keyboardType="number-pad"
              style={twoUp}
            />
            <TextField
              label="Graduation year"
              value={form.graduationYear === undefined ? "" : String(form.graduationYear)}
              onChangeText={(value) =>
                updateField("graduationYear", toNumberOrUndefined(value))
              }
              keyboardType="number-pad"
              style={twoUp}
            />
            <SelectField
              label="Status *"
              value={form.status}
              onChange={(value) => updateField("status", value as StudentStatus)}
              options={STUDENT_STATUSES.map((value) => ({ value, label: value }))}
              style={twoUp}
            />
          </View>
          <Text style={styles.hint}>
            Entry year must be {ENTRY_YEAR_MIN} or later.
          </Text>
        </SectionCard>

        <SectionCard title="Guardian / Next of kin">
          <View style={styles.pairs}>
            <TextField
              label="Name *"
              value={form.guardianName}
              onChangeText={(value) => updateField("guardianName", value)}
              style={twoUp}
            />
            <TextField
              label="Relationship"
              value={form.guardianRelationship ?? ""}
              onChangeText={(value) => updateField("guardianRelationship", value)}
              placeholder="e.g. Father, Mother, Uncle"
              style={twoUp}
            />
            <TextField
              label="Phone *"
              value={form.guardianPhone}
              onChangeText={(value) => updateField("guardianPhone", value)}
              keyboardType="phone-pad"
              style={twoUp}
            />
            <TextField
              label="Email"
              value={form.guardianEmail ?? ""}
              onChangeText={(value) => updateField("guardianEmail", value)}
              keyboardType="email-address"
              autoCapitalize="none"
              style={twoUp}
            />
          </View>
        </SectionCard>

        <SectionCard title="Notes">
          <TextField
            label="Internal notes"
            value={form.notes ?? ""}
            onChangeText={(value) => updateField("notes", value)}
            placeholder="Optional remarks about this student."
            multiline
            autoCorrect
          />
        </SectionCard>
      </ScrollView>

      <View
        style={[
          styles.actionBar,
          { paddingBottom: Math.max(insets.bottom, spacing.md) },
        ]}
      >
        <Button
          label="Cancel"
          variant="secondary"
          onPress={onCancel}
          disabled={submitting}
          style={styles.flex1}
        />
        <Button
          label={isEdit ? "Save changes" : "Create student"}
          loading={submitting}
          onPress={() => void handleSubmit()}
          style={styles.flex1}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

export function StudentFormScreen({ id, onDone, onCancel }: StudentFormScreenProps) {
  const isEdit = id !== undefined;
  const existing = useQuery(api.students.getById, id ? { id } : "skip");
  const create = useMutation(api.students.create);
  const update = useMutation(api.students.update);
  const generateUploadUrl = useMutation(api.students.generateUploadUrl);

  if (isEdit) {
    if (existing === undefined) {
      return <LoadingView label="Loading student…" />;
    }
    if (existing === null) {
      return (
        <View style={styles.missing}>
          <SectionCard>
            <Text style={styles.missingTitle}>Student not found</Text>
            <Text style={styles.hint}>
              The student you are trying to edit does not exist.
            </Text>
            <Button label="Back" variant="secondary" onPress={onCancel} />
          </SectionCard>
        </View>
      );
    }
  }

  const initial: FormState =
    isEdit && existing ? { ...emptyForm(), ...existing } : emptyForm();
  const existingPhotoUrl = isEdit && existing ? (existing.photoUrl ?? null) : null;

  return (
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
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
    backgroundColor: colors.bg,
  },
  pairs: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -spacing.xs,
  },
  full: {
    width: "100%",
  },
  photoRow: {
    flexDirection: "row",
    gap: spacing.lg,
    alignItems: "flex-start",
  },
  photoControls: {
    flex: 1,
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  hint: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  actionBar: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  flex1: {
    flex: 1,
  },
  missing: {
    flex: 1,
    padding: spacing.lg,
    gap: spacing.lg,
    backgroundColor: colors.bg,
  },
  missingTitle: {
    fontSize: fontSize.title,
    color: colors.text,
    marginBottom: spacing.sm,
  },
});
