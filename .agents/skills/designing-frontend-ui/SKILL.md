---
name: designing-frontend-ui
description: Plan and implement Infisical frontend UI using the product design principles, supported component system, accessibility contract, and migration rules.
---

# Designing Frontend UI

Use this skill when adding or materially changing product UI.

## 1. Read the governing guidance

Read in order:

1. `DESIGN.md`
2. `frontend/DESIGN_ENGINEERING.md`
3. `frontend/COMPONENT_SYSTEM_MIGRATION.md` when the affected surface uses
   legacy components
4. Stories and source for every shared component being used

Production repetition is not proof that a pattern is canonical.

## 2. Define the surface

Before editing, identify:

- Product scope: organization, sub-organization, project, admin, or established
  product scope
- Page archetype: list, settings, detail, dashboard, workflow, auth, or public
- Primary user task
- Primary action
- Information that is sensitive
- Permission gates
- State that belongs in the URL
- Narrow-viewport behavior

If the surface has several reasonable interaction models with material product
tradeoffs, checkpoint before implementation.

## 3. Inventory required states

Account for:

- Default, hover, focus, active, disabled
- Pending and duplicate-submission prevention
- Initial loading and background refresh
- Empty collection and no matching results
- Error and retry
- Read-only and permission denied
- Long, missing, malformed, and overflowing content
- Narrow viewport

Do not add placeholder UI for impossible states. Do not leave possible states to
accidental browser behavior.

## 4. Choose ownership and components

Use the narrowest ownership boundary:

- Page-local component for one feature
- View for reusable page-level domain UI
- Platform component for a reusable domain contract
- Generic component for a domain-neutral stable contract

Prefer the current ready shared component. If a target is partial or blocked,
follow the migration rulebook instead of implementing an undocumented local
substitute.

Choose Dialog, Sheet, page, or inline based on task shape and context—not only
field count.

## 5. Implement with established systems

- React Hook Form and Zod for validated forms
- `Field` composition for ordinary form controls
- TanStack Router search parameters for linkable state
- React Query for server state
- Established permission guards and contexts
- `createNotification` for transient feedback
- Semantic tokens and scope-aware variants
- Lucide for general product icons
- `cn()` and `cva` for shared component styling

Preserve sensitive-data masking and keep secret values out of copy, URLs,
analytics, logs, and notifications.

## 6. Content pass

Check:

- Title Case for page, major section, Dialog, and Sheet titles
- Sentence case for actions, tabs, menu items, labels, table headers, helper
  text, errors, and notifications
- Precise verbs and named resources
- Explicit consequences for destructive actions
- Distinct copy for approval submission versus completed mutation
- Existing translation conventions

## 7. Accessibility pass

Confirm:

- Native semantics or an accessible primitive
- Programmatic labels
- Visible focus and complete keyboard operation
- Predictable focus when overlays open and close
- Associated descriptions and errors
- No color-only or hover-only meaning
- Correct heading and table structure
- Accessible icon-only actions
- Usable narrow viewport and overflow
- Reduced-motion behavior for custom motion

## 8. Shared-component changes

When changing or adding a shared component:

- Identify real consumers before generalizing.
- Decide its lifecycle status.
- Keep the API semantic and smaller than repeated local composition.
- Add or update Storybook anatomy, variants, states, and realistic examples.
- Validate accessibility.
- Document migration behavior for a breaking or replacement API.

## 9. Completion

Run lint and type-check. Exercise the affected workflow in Storybook or the
application. Use the `testing-frontend-ui` skill for acceptance validation and
record the workflows, states, viewports, input methods, and evidence checked.
Independent readiness review uses the `reviewing-frontend-ui` skill.
