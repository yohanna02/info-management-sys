import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const studentGenders = v.union(
  v.literal("male"),
  v.literal("female"),
  v.literal("other"),
);

const studentStatuses = v.union(
  v.literal("active"),
  v.literal("graduated"),
  v.literal("suspended"),
  v.literal("withdrawn"),
);

const studentLevels = v.union(
  v.literal("ND1"),
  v.literal("ND2"),
);

export default defineSchema({
  ...authTables,

  students: defineTable({
    matricNumber: v.string(),
    firstName: v.string(),
    lastName: v.string(),
    middleName: v.optional(v.string()),
    email: v.string(),
    phone: v.string(),
    gender: studentGenders,
    dateOfBirth: v.string(),
    level: studentLevels,
    program: v.string(),
    entryYear: v.number(),
    graduationYear: v.optional(v.number()),
    address: v.optional(v.string()),
    stateOfOrigin: v.optional(v.string()),
    guardianName: v.string(),
    guardianPhone: v.string(),
    guardianEmail: v.optional(v.string()),
    guardianRelationship: v.optional(v.string()),
    status: studentStatuses,
    notes: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
    searchText: v.string(),
  })
    .index("by_matricNumber", ["matricNumber"])
    .index("by_email", ["email"])
    .index("by_level", ["level"])
    .index("by_status", ["status"])
    .index("by_lastName", ["lastName"])
    .searchIndex("search_students", {
      searchField: "searchText",
      filterFields: ["level", "status", "program"],
    }),
});
