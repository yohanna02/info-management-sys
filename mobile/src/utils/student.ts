import { v } from "convex/values";
import type { Id } from "@convex/_generated/dataModel";

export type StudentStatus = "active" | "graduated" | "suspended" | "withdrawn";
export type StudentLevel = "ND1" | "ND2";
export type StudentGender = "male" | "female" | "other";

export const STUDENT_LEVELS: StudentLevel[] = ["ND1", "ND2"];
export const STUDENT_STATUSES: StudentStatus[] = [
  "active",
  "graduated",
  "suspended",
  "withdrawn",
];
export const STUDENT_GENDERS: StudentGender[] = ["male", "female", "other"];

/**
 * A student document as returned by the Convex queries. The backend
 * (`students.list` / `students.getById`) attaches `photoUrl` so the client
 * does not have to resolve storage ids itself.
 */
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
  photoUrl: string | null;
}

export type StudentInput = Omit<Student, "_id" | "_creationTime" | "photoUrl">;

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

const studentIdValidator = v.id("students") as unknown as {
  is(value: unknown): unknown;
};

/**
 * Narrow a route param to a `students` document id before querying with it.
 * `convex/values` has no public id-validation helper, so this leans on the
 * `Id` validator, whose `is()` throws for anything that is not a well-formed
 * id. The cast is needed because `is` is missing from the published type.
 */
export function isValidStudentId(value: unknown): value is Id<"students"> {
  if (typeof value !== "string") return false;
  try {
    studentIdValidator.is(value);
    return true;
  } catch {
    return false;
  }
}
