import { type Id } from "../../convex/_generated/dataModel";

export type StudentStatus = "active" | "graduated" | "suspended" | "withdrawn";
export type StudentLevel = "ND1" | "ND2";
export type StudentGender = "male" | "female" | "other";

export const STUDENT_LEVELS: StudentLevel[] = [
  "ND1",
  "ND2",
];

export const STUDENT_STATUSES: StudentStatus[] = [
  "active",
  "graduated",
  "suspended",
  "withdrawn",
];

export const STUDENT_GENDERS: StudentGender[] = ["male", "female", "other"];

export interface Student {
  _id: Id<"students">;
  _creationTime: number;
  matricNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  gender: StudentGender;
  dateOfBirth: string;
  level: StudentLevel;
  program: string;
  entryYear: number;
  graduationYear?: number;
  address?: string;
  stateOfOrigin?: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  guardianRelationship?: string;
  status: StudentStatus;
  notes?: string;
  photoStorageId?: Id<"_storage">;
  /**
   * Signed URL for the photo, or null if no photo / storage record missing.
   * This is attached by the backend (`list` / `getById` / `getByMatricNumber`)
   * so the client does not have to fire a separate query per row.
   */
  photoUrl: string | null;
}

export type StudentInput = Omit<Student, "_id" | "_creationTime" | "photoUrl">;

export function statusBadgeClass(status: StudentStatus): string {
  switch (status) {
    case "active":
      return "badge badge-active";
    case "graduated":
      return "badge badge-graduated";
    case "suspended":
      return "badge badge-suspended";
    case "withdrawn":
      return "badge badge-withdrawn";
  }
}

export function fullName(student: {
  firstName: string;
  middleName?: string;
  lastName: string;
}): string {
  const parts = [student.firstName, student.middleName, student.lastName].filter(
    Boolean,
  );
  return parts.join(" ");
}
