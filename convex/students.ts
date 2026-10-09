import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

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

export const studentInputFields = {
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
};

type StudentInputFields = {
  matricNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string;
  level: "ND1" | "ND2";
  program: string;
  entryYear: number;
  graduationYear?: number;
  address?: string;
  stateOfOrigin?: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  guardianRelationship?: string;
  status: "active" | "graduated" | "suspended" | "withdrawn";
  notes?: string;
  photoStorageId?: Id<"_storage">;
};

function buildSearchText(args: {
  matricNumber: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  email: string;
  program: string;
  guardianName: string;
}) {
  return [
    args.matricNumber,
    args.firstName,
    args.lastName,
    args.middleName ?? "",
    args.email,
    args.program,
    args.guardianName,
  ]
    .join(" ")
    .trim();
}

async function requireAdmin(ctx: {
  auth: { getUserIdentity: () => Promise<unknown> };
}) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Unauthenticated: admin sign-in required.");
  }
  return identity;
}

// ---------------------------------------------------------------------------
// Shared helpers (use ctx.runQuery/ctx.runMutation from your own queries or
// actions when you need to call them; the helpers below are inlined into the
// query handlers because they need the `QueryCtx` to read from `db` and
// `storage`.)
// ---------------------------------------------------------------------------

// The list/getById handlers enrich each row with the public URL for its photo
// (or null) so the client doesn't need to fire N storage lookups.
async function enrichWithPhotoUrl<T extends { photoStorageId?: Id<"_storage"> }>(
  ctx: {
    storage: { getUrl: (id: Id<"_storage">) => Promise<string | null> };
  },
  doc: T | null,
): Promise<(T & { photoUrl: string | null }) | null> {
  if (!doc) return null;
  const photoUrl = doc.photoStorageId
    ? await ctx.storage.getUrl(doc.photoStorageId)
    : null;
  return { ...doc, photoUrl };
}

// Async map helper that preserves the input shape when rows are non-null.
async function enrichRows<
  T extends { photoStorageId?: Id<"_storage"> },
>(
  ctx: {
    storage: { getUrl: (id: Id<"_storage">) => Promise<string | null> };
  },
  rows: T[],
): Promise<Array<T & { photoUrl: string | null }>> {
  return await Promise.all(
    rows.map(async (doc) => {
      const photoUrl = doc.photoStorageId
        ? await ctx.storage.getUrl(doc.photoStorageId)
        : null;
      return { ...doc, photoUrl };
    }),
  );
}

// -----------------------------------------------------------------------------
// Queries
// -----------------------------------------------------------------------------

export const list = query({
  args: {
    paginationOpts: paginationOptsValidator,
    level: v.optional(studentLevels),
    status: v.optional(studentStatuses),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const search = args.search?.trim();

    let page;
    if (search && search.length > 0) {
      page = await ctx.db
        .query("students")
        .withSearchIndex("search_students", (q) => {
          let s = q.search("searchText", search);
          if (args.level) {
            s = s.eq("level", args.level);
          }
          if (args.status) {
            s = s.eq("status", args.status);
          }
          return s;
        })
        .paginate(args.paginationOpts);
    } else if (args.level) {
      page = await ctx.db
        .query("students")
        .withIndex("by_level", (q) => q.eq("level", args.level!))
        .order("desc")
        .paginate(args.paginationOpts);
    } else if (args.status) {
      page = await ctx.db
        .query("students")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .paginate(args.paginationOpts);
    } else {
      page = await ctx.db
        .query("students")
        .order("desc")
        .paginate(args.paginationOpts);
    }

    const enrichedPage = await enrichRows(ctx, page.page);

    return { ...page, page: enrichedPage };
  },
});

export const getById = query({
  args: { id: v.id("students") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const student = await ctx.db.get("students", args.id);
    return await enrichWithPhotoUrl(ctx, student);
  },
});

export const getByMatricNumber = query({
  args: { matricNumber: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const student = await ctx.db
      .query("students")
      .withIndex("by_matricNumber", (q) =>
        q.eq("matricNumber", args.matricNumber),
      )
      .unique();
    return await enrichWithPhotoUrl(ctx, student);
  },
});

export const counts = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);

    const all = await ctx.db.query("students").collect();
    const byLevel: Record<string, number> = {};
    const byStatus: Record<string, number> = {};

    for (const s of all) {
      byLevel[s.level] = (byLevel[s.level] ?? 0) + 1;
      byStatus[s.status] = (byStatus[s.status] ?? 0) + 1;
    }

    return {
      total: all.length,
      byLevel,
      byStatus,
    };
  },
});

// -----------------------------------------------------------------------------
// Mutations
// -----------------------------------------------------------------------------

function normalizeStudentInput(args: StudentInputFields) {
  const matricTrimmed = args.matricNumber.trim();
  const emailNormalized = args.email.trim().toLowerCase();
  return {
    doc: {
      ...args,
      matricNumber: matricTrimmed,
      firstName: args.firstName.trim(),
      lastName: args.lastName.trim(),
      middleName: args.middleName?.trim() || undefined,
      email: emailNormalized,
      phone: args.phone.trim(),
      program: args.program.trim(),
      guardianName: args.guardianName.trim(),
      guardianPhone: args.guardianPhone.trim(),
      guardianEmail: args.guardianEmail?.trim().toLowerCase() || undefined,
      stateOfOrigin: args.stateOfOrigin?.trim() || undefined,
      address: args.address?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
    },
    searchText: buildSearchText({
      matricNumber: matricTrimmed,
      firstName: args.firstName,
      lastName: args.lastName,
      middleName: args.middleName,
      email: args.email,
      program: args.program,
      guardianName: args.guardianName,
    }),
  };
}

export const create = mutation({
  args: studentInputFields,
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const matricTrimmed = args.matricNumber.trim();
    if (!matricTrimmed) {
      throw new Error("Matric number is required.");
    }

    const existing = await ctx.db
      .query("students")
      .withIndex("by_matricNumber", (q) => q.eq("matricNumber", matricTrimmed))
      .unique();
    if (existing) {
      throw new Error(
        `A student with matric number ${matricTrimmed} already exists.`,
      );
    }

    const emailNormalized = args.email.trim().toLowerCase();
    const existingEmail = await ctx.db
      .query("students")
      .withIndex("by_email", (q) => q.eq("email", emailNormalized))
      .unique();
    if (existingEmail) {
      throw new Error(
        `A student with email ${emailNormalized} already exists.`,
      );
    }

    const { doc, searchText } = normalizeStudentInput(args);

    return await ctx.db.insert("students", {
      ...doc,
      searchText,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("students"),
    ...studentInputFields,
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, photoStorageId, ...rest } = args;

    const existing = await ctx.db.get("students", id);
    if (!existing) {
      throw new Error("Student not found.");
    }

    const matricTrimmed = rest.matricNumber.trim();
    if (matricTrimmed !== existing.matricNumber) {
      const dup = await ctx.db
        .query("students")
        .withIndex("by_matricNumber", (q) =>
          q.eq("matricNumber", matricTrimmed),
        )
        .unique();
      if (dup && dup._id !== id) {
        throw new Error(
          `A student with matric number ${matricTrimmed} already exists.`,
        );
      }
    }

    const newEmail = rest.email.trim().toLowerCase();
    if (newEmail !== existing.email) {
      const dupEmail = await ctx.db
        .query("students")
        .withIndex("by_email", (q) => q.eq("email", newEmail))
        .unique();
      if (dupEmail && dupEmail._id !== id) {
        throw new Error(`A student with email ${newEmail} already exists.`);
      }
    }

    const { doc, searchText } = normalizeStudentInput({
      ...rest,
      photoStorageId,
    });

    await ctx.db.patch("students", id, {
      ...doc,
      searchText,
    });
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("students") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get("students", args.id);
    if (!existing) {
      throw new Error("Student not found.");
    }
    if (existing.photoStorageId) {
      await ctx.storage.delete(existing.photoStorageId);
    }
    await ctx.db.delete("students", args.id);
    return args.id;
  },
});

/**
 * Returns a one-time URL the client uses to upload a file to Convex storage.
 *
 * Use flow:
 *   1. Browser calls this mutation to obtain a `uploadUrl`.
 *   2. Browser POSTs the file to `uploadUrl` (as the request body).
 *   3. Browser reads the returned `storageId` from the upload response,
 *      then passes it to `students.create` / `students.update` as the
 *      `photoStorageId` field.
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Replace a student's photo with a freshly uploaded one. Deletes the previous
 * photo from storage when one exists.
 */
export const updatePhoto = mutation({
  args: {
    id: v.id("students"),
    photoStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get("students", args.id);
    if (!existing) {
      throw new Error("Student not found.");
    }
    if (existing.photoStorageId && existing.photoStorageId !== args.photoStorageId) {
      await ctx.storage.delete(existing.photoStorageId);
    }
    await ctx.db.patch("students", args.id, {
      photoStorageId: args.photoStorageId,
    });
    return args.photoStorageId;
  },
});

/**
 * Remove a student's photo (clears the storage id field and deletes the
 * underlying file from storage).
 */
export const clearPhoto = mutation({
  args: { id: v.id("students") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.get("students", args.id);
    if (!existing) {
      throw new Error("Student not found.");
    }
    if (existing.photoStorageId) {
      await ctx.storage.delete(existing.photoStorageId);
    }
    await ctx.db.patch("students", args.id, { photoStorageId: undefined });
    return args.id;
  },
});
