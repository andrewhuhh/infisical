# andrew-work-trial

A frontend-only redesign of the **Secret Reference** experience in the Infisical Secret Manager.

## Summary

The old flow opened a read-only modal with a visual tree of a secret's references
(`SecretReferenceTree` inside a v2 `Modal`). This branch replaces those entrypoints with a richer,
editable **`SecretReferenceDetailsDialog`**, and adds an at-a-glance icon on secret rows showing
whether a secret references others and/or is referenced by others.

- 6 commits, ~1230 insertions across 13 files.
- No backend changes.

## The three new pieces

### 1. `SecretReferenceDetails.utils.ts` (new) — the logic core

- `hasSecretReference` / `parseSecretReferenceValue` — detect and tokenize `${...}` references in a
  value (splits a value into `text` and `reference` parts for highlighted rendering).
- `getSecretReferenceState` — computes `{ isConsumer, isProvider }` for a secret. *Consumer* = its
  value contains references (or it imports referenced secrets); *Provider* = other secrets reference
  it. This drives the new row icon. It is environment-aware via `visibleEnvironmentSlugs`.
- `getParsedReferenceEntry` — parses a reference string into `{ environment, secretPath, key }`,
  handling three forms: same-folder (`${KEY}`), cross-env/path (`${env.path.KEY}`), and
  cross-project (`${@project.env.path.KEY}`).
- `getIngestedSecretReferences` / `getDraftIngestedSecretReferences` / `getUsedBySecretReferences` —
  build the "Variables" (what this secret uses) and "Used By" (what uses this secret) lists. The
  "draft" variant diffs the edited value against a baseline to flag newly-added references with a
  **Draft** badge before save.

### 2. `SecretReferenceStateIcon.tsx` (new) — the small icon next to a secret key

- `WorkflowIcon` when it's only a consumer or only a provider; `GitBranchIcon` + a dot when it's
  both.
- Color-coded (`text-primary` / `text-secret` / `text-project`), accessible tooltip + `aria-label`,
  renders as a button (opens the dialog) or a static `role="img"`.

### 3. `SecretReferenceDetailsDialog.tsx` (new) — the new v3 dialog replacing the old modal

- **Editable** key + value inline (previously read-only). Save goes through `useUpdateSecretV3`,
  handles approval-workflow responses, and surfaces a "Changed" badge when the value is dirty.
- **Environment switcher** (`Select`) so you can inspect the same secret across environments — gated
  by `getIsOverrideByEnvironment` and disabled while dirty.
- **Rendered value** with reference tokens shown as `project` badges; hovering a token shows its
  resolved value (from `useGetSecretReferenceTree`). Click-to-edit swaps in `InfisicalSecretInput`.
- **Variables / Used By accordions** built from the util functions; clicking an entry navigates to
  that secret on the Overview page.
- Permission-aware (CASL `subject`), value visibility toggle, and an `AlertDialog` guarding unsaved
  changes on close.

## Supporting changes

- **`hooks/api/secrets/queries.tsx`**: `useGetSecretReferenceTree` now accepts an `options.enabled`
  flag so the dialog can defer fetching until it's open and the user can read the value.
- **`components/v3/platform/SecretInput/SecretInput.tsx`**: extracted shared `textLayerClassName`
  padding so the textarea and its highlight overlay line up (previously mismatched `py-1` vs
  `pt-[6px] pb-[4px]`).
- **Row integrations** — `SecretTableRow`, `SecretEditTableRow`, `SecretEditRow`,
  `SecretOverviewTableRow`, `SecretDetailSidebar` all: swap the old `Modal` + `SecretReferenceTree`
  for the new dialog, pass `getIsOverrideByEnvironment`, and render `SecretReferenceStateIcon` next
  to the key. `SecretEditTableRow` also switches from the old `hasSecretReference` to the richer
  `getSecretReferenceState`, and hides the icon while the name field is being edited.
- **`OverviewPage.tsx`** bug fix: the dedup key for reference-deletion warnings changed from just
  `secret.secretId` to `secretId:referencedSecretEnv:referencedSecretKey`, so distinct references to
  the same secret across envs/keys are no longer collapsed into one.
- **`index.tsx` / `SecretReferenceDetails.tsx`**: `hasSecretReference` moved from
  `SecretReferenceDetails.tsx` into the utils file; new exports wired up. The old
  `SecretReferenceTree` is still exported/available.

## Things worth a closer look before merging

- **Naming**: the branch is `andrew-work-trial` and commit messages are somewhat generic
  (`enhance ... utilities and UI components`) — fine for a work trial, but you may want cleaner
  messages for a real PR.
- **`getSecretReferenceState` cost**: in `SecretTableRow` it joins every environment's value with
  `\n` and regex-tests it each render. Probably fine, but worth confirming it's not hot for very
  wide tables.
- **`SecretReferenceTree` is now dead-ish code** at the UI level (still exported, no longer used by
  the main entrypoints) — confirm whether it should be removed.

## Files changed

```
frontend/src/components/secrets/SecretReferenceDetails/SecretReferenceDetails.tsx        (-4)
frontend/src/components/secrets/SecretReferenceDetails/SecretReferenceDetails.utils.ts   (new, +289)
frontend/src/components/secrets/SecretReferenceDetails/SecretReferenceDetailsDialog.tsx  (new, +687)
frontend/src/components/secrets/SecretReferenceDetails/SecretReferenceStateIcon.tsx      (new, +77)
frontend/src/components/secrets/SecretReferenceDetails/index.tsx
frontend/src/components/v3/platform/SecretInput/SecretInput.tsx
frontend/src/hooks/api/secrets/queries.tsx
frontend/src/pages/secret-manager/OverviewPage/OverviewPage.tsx
frontend/src/pages/secret-manager/OverviewPage/components/SecretOverviewTableRow/SecretEditRow.tsx
frontend/src/pages/secret-manager/OverviewPage/components/SecretOverviewTableRow/SecretOverviewTableRow.tsx
frontend/src/pages/secret-manager/OverviewPage/components/SecretTableRow/SecretEditTableRow.tsx
frontend/src/pages/secret-manager/OverviewPage/components/SecretTableRow/SecretTableRow.tsx
frontend/src/pages/secret-manager/SecretDashboardPage/components/SecretListView/SecretDetailSidebar.tsx
```
