# Computer Engineering Department — Student Records

A web app for managing student records for the Computer Engineering
department. Built with React, Vite, and Convex. Authentication is
provided by Convex Auth (email + password).

## Features

- Admin sign in / sign up (Convex Auth).
- Student records with full identity, contact, academic, and guardian
  fields, scoped to the Computer Engineering department.
- Search, filter by level and status, and paginated lists.
- Create, edit, and delete student records.
- Dashboard with totals by level and status.

## Local development

```bash
npm install
npm run dev          # Vite dev server on http://localhost:5173
npx convex dev       # Convex dev (separate terminal)
```

The first time you sign in you will need to create an admin account
with the "Create account" tab on the login screen.

## Scripts

| Script            | What it does                            |
| ----------------- | --------------------------------------- |
| `npm run dev`     | Vite dev server                         |
| `npm run build`   | Type-check and produce a production build |
| `npm run preview` | Preview the production build locally    |
| `npm run lint`    | Run ESLint                              |

## Mobile app (React Native)

`mobile/` holds an Expo (React Native) app with the same features and the same
Convex backend. See `mobile/README.md` for setup.

```bash
npx convex dev       # from the repository root
cd mobile && npm install && npx expo start
```

## Project layout

```
convex/          Convex schema, queries, mutations, auth
mobile/          Expo + Expo Router app (shared convex/ backend)
src/
  components/    Shared layout, NotFound
  lib/           Router helpers, student types/helpers
  pages/         Login, Dashboard, StudentsList, StudentForm, StudentDetail
  types/         Bundler stubs
src/App.tsx      Top-level router + auth gate
src/main.tsx     ConvexAuthProvider + React entry point
```

## Notes

- The Convex CLI only emits `dataModel.d.ts` (no `.js`), but Vite still
  tries to resolve a runtime module for the `Id<...>` brand. A small
  Vite plugin in `vite.config.ts` redirects those imports to
  `src/types/convex-dataModel-stub.js`.
- Convex Auth requires the `auth.config.ts` providers block to be
  configured against `CONVEX_SITE_URL`, which is already set in
  `.env.local`.
