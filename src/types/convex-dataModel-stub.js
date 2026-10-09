// Runtime stub for the convex `_generated/dataModel` module.
//
// The Convex CLI emits only a `dataModel.d.ts` declaration file, because the
// module is type-only. Some bundlers (Vite/Rolldown) still try to resolve a
// runtime file when the frontend imports it for the `Id` brand. This stub
// lives outside `convex/_generated/` so the Convex CLI never overwrites it,
// and a Vite alias redirects the original import path here.
export {};
