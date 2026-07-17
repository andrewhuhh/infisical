---
name: reviewing-frontend-ui
description: Independently review Infisical frontend changes against their requirements, rendered behavior, design contract, migration rules, accessibility, permissions, and verification evidence.
---

# Reviewing Frontend UI

Use this skill for an independent review after frontend implementation and
builder-side testing. Do not use the builder's rationale as proof that a choice
or behavior is correct.

## 1. Establish independent context

Read:

1. The original request and acceptance criteria
2. The diff against the intended base
3. `DESIGN.md`
4. `frontend/DESIGN_ENGINEERING.md`
5. Relevant component stories and source
6. `frontend/COMPONENT_SYSTEM_MIGRATION.md` for legacy work
7. `frontend/REVIEWING.md`

Read builder verification only after reconstructing the expected behavior.
Treat every claim as evidence to confirm.

## 2. Build the acceptance matrix

List:

- Requested user tasks and explicit non-goals
- Default, loading, empty, no-results, error, retry, disabled, pending, success,
  read-only, and permission states that can occur
- Sensitive information and destructive actions
- URL-backed state and browser-navigation expectations
- Changed overlays and nested interactions
- Narrow and standard viewports
- Pointer and keyboard paths
- Evidence required for each material criterion

Mark each criterion proven, failed, or unproven as the review proceeds.

## 3. Inspect scope and ownership

Check the three-dot diff against the correct base.

- Reject unrelated redesign, migration, dependency, API, or routing changes.
- Confirm state and behavior use the narrowest appropriate owner.
- Confirm shared abstractions have real consumers.
- Check new v2 imports, mixed-generation primitives, compatibility wrappers, and
  the target status for legacy migrations.
- Check semantic tokens, direct controls, shared primitives, forms, query state,
  permissions, notifications, and icon sources.
- Inspect consumers when a shared component contract changes.

Classify historical issues as migration debt rather than defects unless the
change worsens them or they create a critical risk.

## 4. Run deterministic checks

Run the checks required by the changed boundary:

```bash
cd frontend
npm run lint
npm run type:check
```

For shared-component or Storybook changes, also run:

```bash
npm run build-storybook
```

Inspect the diff for undefined semantic utilities, unapproved literal colors,
sensitive values, generated-file drift, and missing stories. Static results are
candidates until behavior confirms their impact.

## 5. Review rendered states

Use the `testing-frontend-ui` skill for the mechanics of application, Storybook,
keyboard, responsive, permission, and accessibility validation. Select and
execute the tests independently from the builder.

Always inspect high-risk details directly:

- Read visible overlay titles, descriptions, primary actions, cancel actions,
  errors, and notifications. Wrapper defaults can contradict the requested
  mutation.
- Submit changed mutations with pointer and keyboard input. Confirm both paths
  prevent duplicate requests while pending.
- Exercise empty collections and no matching results separately. Check table
  chrome, explanation, and recovery actions.
- Exercise failure and retry rather than inferring them from branches in code.
- Refresh and navigate back and forward for URL-backed state. Confirm unrelated
  search parameters survive updates.
- Check narrow viewport overflow and every changed interaction without a
  pointer.

Capture screenshots or recordings without exposing sensitive values.

## 6. Review accessibility and security

Confirm:

- Labels, descriptions, errors, headings, and table headers are programmatic.
- Focus is visible, trapped when modal, and returned predictably.
- Icon-only and hidden-on-hover actions have accessible names and keyboard
  access.
- Meaning does not rely on color, hover, or motion.
- Allowed and denied permissions produce the intended UI.
- Sensitive values begin masked and never enter URLs, notifications, analytics,
  logs, screenshots, or recordings.
- Approval submission is not presented as a completed mutation.

Automated accessibility output does not replace keyboard and focus inspection.

## 7. Report findings

Follow the classification, severity, and finding schema in
`frontend/REVIEWING.md`.

For each finding provide:

- Stable ID
- Severity and classification
- Requirement or rule
- Concrete evidence
- User impact
- Smallest safe correction
- Verification required

Keep findings independent and actionable. Do not report preferences, unrelated
debt, or speculative failures as defects.

## 8. Decide readiness

Report findings first, then:

- Proven, failed, and unproven acceptance criteria
- Workflows, states, viewports, permissions, and input methods exercised
- Automated and manual evidence
- Intentional differences and exceptions
- Result: ready, not ready, or blocked on a decision

Do not return `No findings` while a material criterion is unproven. Lint,
type-check, a Storybook build, screenshots, or builder claims are insufficient
alone.

Do not silently fix findings during an independent review. If assigned a
review-and-fix workflow, record the findings before editing and re-run the
affected acceptance checks afterward.
