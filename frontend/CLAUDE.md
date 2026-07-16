# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This is the **frontend** package of the Infisical monorepo — a React 18 SPA built with Vite 6, TanStack Router, React Query, and Tailwind CSS v4.

## Essential Commands

All commands run from the `frontend/` directory:

- `npm run dev` — start dev server on port 3000
- `npm run build` — TypeScript check + Vite production build
- `npm run lint:fix` — ESLint autofix (double quotes, simple-import-sort with 7 groups)
- `npm run type:check` — TypeScript type check only (`tsconfig.app.json`)
- `make reviewable-ui` (from repo root) — runs `lint:fix` + `type:check` (run before PRs)
- `npm run storybook` — Storybook on port 6006

Path alias: `@app/*` maps to `./src/*`.

## Architecture Overview

### Routing (TanStack Router v1)

Virtual file routes defined in `src/routes.ts` using a functional DSL (`route()`, `index()`, `layout()`, `middleware()`). The generated route tree is in `src/routeTree.gen.ts` (do not edit manually — regenerated on dev server start or when `src/routes.ts` changes).

Each page directory has a `route.tsx` that defines its route:
```tsx
createFileRoute(path)({ component, validateSearch: zodValidator(schema), beforeLoad })
```

Route middleware chain: root → `authenticate` → `inject-org-details` → org-layout → product-specific layouts (secret-manager-layout, cert-manager-layout, kms-layout, ssh-layout, etc.).

Middleware pages in `src/pages/middlewares/`: `authenticate.tsx` (auth guard + redirect), `inject-org-details.tsx` (org context), `restrict-login-signup.tsx` (prevents auth pages when logged in).

### Pages / Views / Components Hierarchy

- **`src/pages/`** — Route-level components organized by product feature (secret-manager, cert-manager, kms, ssh, pam, organization, project, admin, auth, ai). Each has `route.tsx` + page component + local `components/`.
- **`src/views/`** — Reusable page-level UI composed into multiple pages. Pages import views with configuration props.
- **`src/components/v3/`** — Current preferred shared UI component library. Contains `generic/` domain-neutral components and `platform/` domain-aware components. Use a ready v3 component for new work.
- **`src/components/v2/`** — Legacy shared UI components retained during migration. Do not add new visual capabilities to v2. Follow [`COMPONENT_SYSTEM_MIGRATION.md`](COMPONENT_SYSTEM_MIGRATION.md) when the v3 target is partial or blocked.

### Design Guidance

Read these before producing or materially changing UI:

1. [`../DESIGN.md`](../DESIGN.md) — product-design principles and content voice.
2. [`DESIGN_ENGINEERING.md`](DESIGN_ENGINEERING.md) — frontend implementation
   contract, component lifecycle, accessibility, and definition of done.
3. Storybook and component source — exact supported APIs and compositions.
4. [`COMPONENT_SYSTEM_MIGRATION.md`](COMPONENT_SYSTEM_MIGRATION.md) — temporary
   v2 migration, audit, and remediation rules.

Use [`REVIEWING.md`](REVIEWING.md) for the independent review protocol. Use the
`designing-frontend-ui` skill for implementation, `testing-frontend-ui` for
builder-side acceptance validation, and `reviewing-frontend-ui` for independent
readiness review.

### API Layer (React Query + Axios)

Each API domain in `src/hooks/api/` (100+ domain folders) follows this structure:
- **`queries.tsx`** — Query key factory pattern: keys return `[{ params }, "domain-label"]`. Export named query hooks (`useGetSecrets`, etc.) and raw fetch functions.
- **`mutations.tsx`** — `useMutation` hooks that invalidate relevant query keys on success via `queryClient.invalidateQueries()`.
- **`types.tsx`** — Request/response DTOs.

HTTP client in `src/config/request.ts`: Axios instance with automatic token injection and 401/403 interceptors.

#### React Query Global Defaults (`src/hooks/api/reactQuery.tsx`)

The `QueryClient` sets these global defaults for all queries:
- **`staleTime: 60_000`** (60 seconds) — data fetched within the last 60s is considered fresh and won't be refetched on component mount/remount. This prevents redundant API calls during normal page navigation. Queries that need real-time data (e.g., identity auth configs, dynamic secret leases) override this with `staleTime: 0`.
- **`refetchOnWindowFocus: false`** — queries do not refetch when the browser tab regains focus.
- **`retry: 1`** — failed queries retry once.

When adding new queries, consider whether the default 60s staleTime is appropriate:
- For data that changes only on explicit user action (secrets, folders, org metadata): the 60s default is fine or could be longer.
- For data that must always be fresh (auth configs, lease TTLs): override with `staleTime: 0, gcTime: 0`.
- For rarely-changing data (server config, user profile): use `staleTime: Infinity` as the context providers do.

### State Management

- **Server state**: TanStack React Query (query key factories in each API domain)
- **Global app state**: React Context providers in `src/context/` — User, Organization, Project, OrgPermission, ProjectPermission, ServerConfig, Subscription
- **Local component state**: Zustand stores

### Permissions

CASL-based (`@casl/ability`). Contexts: `OrgPermissionContext` and `ProjectPermissionContext` in `src/context/`. Access via `useOrgPermission()` / `useProjectPermission()` hooks. HOC gates: `src/hoc/withPermission/` and `withProjectPermission/`.

### Styling

Tailwind CSS v4 with PostCSS. The dark theme and semantic tokens are configured
in `src/index.css` (`@theme`). The custom `dashboard` breakpoint is 1400px.
Inter is the product font. Prefer semantic surface, content, status, scope, and
product tokens; legacy `mineshaft`, `bunker`, and `primary` scales remain during
migration.

### Layouts

13 layout components in `src/layouts/` — `AdminLayout`, `OrganizationLayout`, `SecretManagerLayout`, `CertManagerLayout`, `KmsLayout`, `SshLayout`, `PamLayout`, etc. Layouts handle sidebar navigation and page chrome for their product area.

## Conventions

- ESLint flat config (ESLint 9+) with airbnb-typescript + prettier. Double quotes enforced.
- Import ordering via `simple-import-sort`: node builtins → react/external packages → `@app/` → internal → relative → styles.
- Forms use `react-hook-form` with `@hookform/resolvers` (Zod schemas).
- Search params validated with `zodValidator()` from `@tanstack/zod-adapter`.
- Toasts: call `createNotification({ title?, text, type, callToAction?, copyActions? })` from `@app/components/notifications`. Backed by **sonner** (the v3 `Toaster` in `components/v3/generic/Toast`), mounted once via `NotificationContainer` in `pages/root.tsx`. `react-toastify` has been removed, so do not reintroduce it.
