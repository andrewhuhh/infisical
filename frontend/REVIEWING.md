# Frontend Reviewing

This document defines the independent review protocol for frontend product
changes. It does not introduce new product or implementation rules. Reviewers
apply the existing design contract, the original requirement, and observed
behavior to decide whether a change is ready.

Implementation guidance lives in [`../DESIGN.md`](../DESIGN.md) and
[`DESIGN_ENGINEERING.md`](DESIGN_ENGINEERING.md). Temporary migration rules live
in [`COMPONENT_SYSTEM_MIGRATION.md`](COMPONENT_SYSTEM_MIGRATION.md).

## 1. Review inputs

Start with:

- The original request and explicit acceptance criteria
- The diff against the intended base branch
- Builder-provided verification evidence
- Screenshots or recordings for changed visual workflows
- Relevant Storybook stories and shared-component source
- Migration status for every affected legacy boundary

Treat builder summaries and test claims as leads to verify, not proof. If an
input is missing, reconstruct what is practical and report the evidence gap.

The reviewer should begin from fresh context. Do not inherit the builder's
reasoning as an assumption about correctness, scope, or intent.

## 2. Governing order

Apply:

1. The original requirement for requested behavior and non-goals
2. [`../DESIGN.md`](../DESIGN.md) for product semantics and experience
3. [`DESIGN_ENGINEERING.md`](DESIGN_ENGINEERING.md) for frontend implementation
4. Component stories and source for supported contracts
5. [`COMPONENT_SYSTEM_MIGRATION.md`](COMPONENT_SYSTEM_MIGRATION.md) for temporary
   legacy decisions

This document governs how to review those sources. It does not override them.
When sources conflict, identify the standard gap instead of choosing whichever
source matches the implementation.

## 3. Review scope

Review:

- Every requested user task and state
- The smallest coherent UI boundary changed by the diff
- Permissions, sensitive data, routing, and overlays affected by the change
- Shared components or contracts changed for other consumers
- Adjacent behavior that the implementation necessarily alters

Report new or materially worsened defects. Do not block focused work on
unrelated historical migration debt unless it creates a critical risk.

Classify each candidate as:

- **Defect:** behavior violates a permanent requirement or the acceptance
  criteria.
- **Migration debt:** stable legacy behavior differs from the target but was not
  made worse by this change.
- **Standard gap:** the requirement or supported target is ambiguous or
  contradictory.
- **Sanctioned exception:** the divergence is necessary, bounded, and
  documented.
- **False positive:** static evidence does not represent a real violation.

## 4. Reconstruct acceptance

Before judging the implementation, create an acceptance matrix containing:

- Requirement or user task
- Relevant data and interaction states
- Permission or security variants
- Viewports and input methods
- Evidence needed to prove the behavior
- Status: proven, failed, or unproven

Do not infer completeness from the happy path. Include loading, background
refresh, empty collection, no matching results, error, retry, disabled, pending,
read-only, permission denied, long content, and narrow viewport when they are
possible.

An unproven acceptance criterion is an evidence gap. It is not automatically a
code defect, but the change is not ready when the missing evidence covers a
material workflow or risk.

## 5. Inspect the diff

Check:

- The change solves the request without unrelated redesign or migration.
- State and behavior live at the narrowest appropriate ownership boundary.
- Shared abstractions have real consumers and a stable semantic contract.
- New UI uses a ready target; legacy retention follows the migration matrix.
- No new v2 capability, undocumented compatibility wrapper, or mixed version of
  the same primitive was introduced without a recorded blocker.
- Forms, server state, routing, permissions, notifications, tokens, and icons
  use established systems.
- Literal colors, arbitrary values, and direct primitive-library use have an
  approved boundary reason.
- Generated files, dependencies, analytics, and API behavior changed only when
  required.
- Tests and stories cover the contract at the level where it is owned.

Static matches identify review candidates. Inspect the actual composition and
behavior before reporting a finding.

## 6. Inspect rendered behavior

Exercise the smallest real workflow that proves the acceptance matrix. Use
Storybook for component contracts and the application for behavior involving
data, permissions, routing, or multiple overlays.

For changed workflows, verify:

- Default, hover, focus, active, disabled, pending, success, and failure
- Initial loading and visible background refresh
- Empty collection and no matching results as separate states
- Error recovery and duplicate-submission prevention
- Browser back, forward, refresh, and unrelated search-parameter preservation
- Overlay open, nested interaction, close, and focus return
- A narrow mobile-sized viewport and a standard laptop-sized viewport
- Keyboard-only operation and visible focus

Inspect what is rendered, not only the props passed to a wrapper:

- Read the visible title, description, primary action, cancel action, errors,
  and notifications for every changed overlay.
- Confirm the primary action uses the exact mutation verb and names the affected
  resource.
- Submit mutations through pointer and keyboard paths and confirm pending state
  blocks both.
- When a collection has no rows, confirm empty table chrome is hidden unless
  retaining it communicates necessary structure.
- When filtering returns no matches, confirm the state differs from an empty
  collection and provides an obvious recovery action.

## 7. Accessibility, permissions, and security

Independently verify:

- Native semantics or an accessible shared primitive
- Programmatic labels, descriptions, errors, headings, and table headers
- Complete keyboard operation, focus containment, and focus return
- Status and actions that do not rely on color, hover, or pointer input
- Announced asynchronous status when needed
- Usable zoom, text reflow, narrow viewport, and overflow
- Representative allowed and denied permission states
- Correct hide, disable, permission-state, or request-access behavior
- Masked sensitive values and explicit reveal or copy activation
- No sensitive value in URLs, notifications, analytics, logs, screenshots, or
  recordings

Automated accessibility evidence and manual keyboard inspection are both
required for materially changed interactions.

## 8. Severity and disposition

- **P0 — Critical:** sensitive-data exposure, authorization failure,
  inaccessible critical workflow, destructive-action failure, or security-
  relevant misleading state.
- **P1 — High leverage:** shared primitive, token, guidance, or cross-surface
  contract defect likely to affect many users or consumers.
- **P2 — Surface:** bounded requested-workflow, functional, accessibility,
  responsive, content, or design-contract defect in the changed surface.
- **P3 — Debt:** stable legacy behavior or low-impact inconsistency outside the
  required correction.

Open P0, P1, and P2 defects block readiness until fixed or explicitly accepted
by the responsible human. P3 migration debt does not block by default.

A standard gap requires a decision before implementation proceeds when choosing
incorrectly would create material product or migration cost. A sanctioned
exception must name its scope and removal condition.

## 9. Finding format

Each finding contains:

- Stable finding ID
- Severity and classification
- Requirement or rule
- Concrete code or rendered evidence
- User or consumer impact
- Smallest safe correction
- Verification required after the correction

Use one finding per root cause. Do not report a style preference without a
requirement, observable consequence, or supported component contract. Do not
inflate severity to make a suggestion actionable.

## 10. Review result

Report:

- Findings ordered by severity
- Acceptance criteria that are proven, failed, or unproven
- Workflows, viewports, permissions, and input methods exercised
- Automated and manual evidence inspected
- Intentional differences and sanctioned exceptions
- Remaining evidence gaps
- Result: ready, not ready, or blocked on a product or standard decision

`No findings` is appropriate only when every material acceptance criterion is
proven and no blocking evidence gap remains. Passing lint, type-check, Storybook,
or an automated reviewer alone does not establish readiness.

After a correction, re-run the affected workflow and checks. Do not mark a
finding resolved from the patch description alone.

## 11. Definition of reviewed

A frontend change is reviewed when:

- The diff matches the requested behavior and non-goals.
- Every material acceptance criterion has evidence.
- No P0, P1, or P2 defect remains open.
- Migration decisions follow the current target status.
- Keyboard, focus, responsive, permission, and sensitive-data behavior are
  proven where applicable.
- Shared-component changes have representative Storybook and accessibility
  evidence.
- Required static checks pass.
- Remaining debt, exceptions, and untested states are explicit.
