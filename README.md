# Venn Onboarding Form

A multi-step onboarding form built with React, TypeScript and Vite.

## Run

Requires Node `>=22.13.0` (see `.nvmrc`).

Before running, rename `.env.example` to `.env` and set `VITE_API_BASE_URL`
to the API's base URL (see [Environment](#environment)):

```bash
mv .env.example .env
```

Then install and start the dev server:

```bash
npm install
npm run dev
```

## Environment

Config is read from `.env`.

| Variable            | Description                    |
| ------------------- | ------------------------------ |
| `VITE_API_BASE_URL` | Base URL of the onboarding API |

`VITE_*` variables are embedded in the client bundle, so never put secrets there.

## Scripts

- `npm run dev` – start the dev server
- `npm run build` – type-check and build for production
- `npm run preview` – preview the production build
- `npm test` – run tests (Vitest)
- `npm run lint` – lint the code
- `npm run typecheck` – type-check only

## Stack

- TanStack Form + Zod for form state and validation
- TanStack Query for API calls
- Base UI and CSS Modules for UI

## Structure

```
src/
  app/        app root and global styles
  features/   onboarding feature (form, schema, hooks)
  shared/     reusable UI components and form helpers
```
