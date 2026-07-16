---
name: testing-frontend-ui
description: Validate Infisical frontend UI for visual consistency, interaction states, accessibility, responsiveness, permissions, and sensitive-data safety.
---

# Testing Frontend UI

Use this skill after adding, migrating, or materially changing frontend UI.

## 1. Establish the acceptance surface

Read:

- `DESIGN.md`
- `frontend/DESIGN_ENGINEERING.md`
- The relevant component stories
- `frontend/COMPONENT_SYSTEM_MIGRATION.md` for migration work

List the changed user tasks, permissions, data states, and overlays. Test the
smallest real workflow that proves them.

## 2. Static checks

From `frontend/` run:

```bash
npm run lint
npm run type:check
```

For shared-component or Storybook changes also run:

```bash
npm run build-storybook
```

Inspect the diff for:

- New v2 imports
- Undefined semantic utilities
- Literal colors without an approved boundary reason
- Direct controls that bypass a ready primitive
- Sensitive values in copy, URLs, logs, analytics, or notifications

## 3. Component validation

In Storybook check:

- Supported variants and sizes
- Default, hover, focus, active, disabled, pending, error, and selected states
- Long and missing content
- Keyboard behavior
- Accessible names and descriptions
- Narrow container behavior
- Light/dark assumptions are not accidentally introduced

Run the Storybook accessibility check for changed stories. Treat serious
violations as implementation failures, not documentation notes.

## 4. Workflow validation

In the application exercise:

- Successful action
- Recoverable and unrecoverable failure
- Duplicate-submission prevention through pointer and keyboard submission
- Initial loading and background refresh where visible
- Empty collection and no-results as separate states, including table chrome and
  an obvious recovery action
- Read-only and permission-denied variants
- Browser back/forward, refresh, and unrelated search-parameter preservation for
  URL-backed state
- Overlay open, nested interaction, close, and focus return
- Toast or inline feedback

For every changed confirmation, Dialog, or Sheet, inspect the rendered title,
description, primary action, cancel action, pending state, and error. Confirm the
primary action uses the exact mutation verb; do not assume a wrapper's default
copy is correct.

Use feature-specific skills when they provide deeper setup and assertions. For
secret CRUD, also use `testing-secrets-ui`.

## 5. Keyboard and focus

Without relying on the pointer:

- Reach every interactive element.
- Identify the focused element visually.
- Operate menus, Tabs, selects, disclosures, dialogs, and sheets.
- Escape dismissible overlays.
- Confirm modal focus is trapped and returns to the trigger.
- Confirm row interactions do not block child controls.
- Confirm hidden hover actions appear on focus.

## 6. Responsive and overflow

Check at least:

- A narrow mobile-sized viewport
- A standard laptop-sized viewport
- The relevant wide/dashboard layout when applicable

Verify:

- Actions wrap, stack, or move to overflow intentionally.
- Dialogs and sheets fit without unreachable content.
- Tables retain access to all columns.
- Long names, paths, identifiers, and localized copy do not break layout.
- Fixed elements do not cover actions or feedback.

## 7. Accessibility

Check:

- Labels, descriptions, errors, headings, and table headers
- Icon-only accessible names
- Status not communicated by color alone
- Contrast for content and meaningful boundaries
- Announced async error/status where needed
- Zoom and text reflow
- Reduced-motion behavior for custom animation
- Pointer target usability

Prefer automated evidence plus keyboard inspection; neither replaces the other.

## 8. Permissions and security

Test representative allowed and denied permissions.

- Hidden actions do not leak protected capability.
- Disabled actions explain the restriction when appropriate.
- Request-access paths are accurate.
- Approval submission is not presented as completed mutation.
- Sensitive values start masked.
- Reveal and copy require explicit activation.
- Notifications and errors never include the sensitive value.
- One-time credentials explain their retrieval constraint.

Mask sensitive content in screenshots and recordings.

## 9. Migration comparison

For component migration:

- Compare behavior before and after.
- Confirm every legacy capability in the migrated boundary has a target.
- Record intentional visual or interaction differences.
- Check portal layering and nested overlays.
- Confirm no relevant legacy imports remain in the boundary.
- Remove temporary adaptation that no longer has a consumer.

## 10. Report

Report:

- Acceptance criteria proven, failed, or left unproven
- User workflows exercised
- Viewports and permission states checked
- Pointer and keyboard submission paths checked
- Accessibility or keyboard findings
- Intentional differences
- Remaining blockers or untested states

Do not claim the UI is ready based only on lint, type-check, or a successful
Storybook build. Builder-side testing does not replace independent review with
the `reviewing-frontend-ui` skill.
