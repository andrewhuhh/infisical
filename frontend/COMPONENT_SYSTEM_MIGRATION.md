# Component System Migration

> **Temporary document.** This rulebook exists only while legacy component
> generations are being moved to the normalized design system. Delete it when
> the sunset conditions at the end are met.

Permanent product principles live in [`../DESIGN.md`](../DESIGN.md). Permanent
frontend rules live in [`DESIGN_ENGINEERING.md`](DESIGN_ENGINEERING.md).

## 1. Migration metadata

- **Source:** `src/components/v2` and older local/shared UI patterns
- **Current preferred implementation:** `src/components/v3`
- **Final target:** upgraded v3 or a new generation, decided through the gate in
  this document
- **Strategy:** normalize foundations, close shared parity gaps, then migrate
  coherent feature boundaries
- **Non-goal:** redesigning every legacy surface while fixing unrelated product
  behavior

This document records transitional exceptions. Do not copy them into permanent
design guidance.

## 2. Target decision: upgrade v3 or create a new generation

Do not choose a new generation based on version age or incomplete adoption.
Use evidence from the baseline audit.

### Upgrade v3 in place when

- Product semantics and token roles remain valid.
- Component contracts can remain compatible or deprecate gradually.
- Missing work is primarily parity, accessibility, stories, variants, or
  internal implementation.
- Feature surfaces can migrate independently.
- Compatibility code remains small and temporary.

### Create a new generation when

- Foundational token meaning, composition, or component contracts must break.
- A large share of consumers require coordinated API changes.
- v3 and the target must coexist for an extended period.
- Preserving compatibility would require pervasive branching or ambiguous APIs.
- Representative surfaces cannot reach the permanent standard without
  rethinking the shared architecture.

### Evidence required

Before selecting v4, document:

- The v3 contracts that cannot be retained
- Representative affected call sites across product areas
- Accessibility and behavior improvements unlocked by the break
- Expected coexistence period
- Migration and rollback strategy
- Why additive or deprecated v3 APIs are insufficient

Until that decision is made, new shared work should improve v3 without
introducing avoidable breaking changes.

## 3. Status vocabulary

Use these statuses in the parity matrix and audit ledger:

- **Ready:** target replacement supports the required behavior.
- **Partial:** target exists but lacks documented behavior used by real
  consumers.
- **Blocked:** no supported target or a foundational decision is outstanding.
- **Retain:** source is not a design primitive or remains intentionally shared.
- **Migrated:** production consumers in the named boundary have moved.

An exported component is not automatically ready. Readiness requires behavior,
accessibility, and validation parity for the consumer being migrated.

## 4. Initial parity matrix

This is a starting point. Update it with evidence before each migration wave.

| Legacy pattern | Preferred target | Initial status | Notes |
| --- | --- | --- | --- |
| v2 `Button` | v3 `Button` | Ready | Adapt `leftIcon`/`rightIcon` to children and verify loading behavior. |
| v2 `IconButton` | v3 `IconButton` | Ready | Add an accessible name and map intent/size deliberately. |
| v2 `Card` | v3 `Card` composition | Ready | Migrate the whole local Card composition, not only the root. |
| v2 `Input` | v3 `Input` | Ready | Use the v3 Field contract in forms. |
| v2 `TextArea` | v3 `TextArea` | Ready | Preserve resize, rows, and error semantics. |
| v2 `FormControl` | v3 `Field` composition | Partial | API is intentionally different; migrate label, description, and error together. |
| v2 `Select` | v3 `Select` | Ready | Verify width, controlled value, portal, and placeholder behavior. |
| v2 `FilterableSelect` | v3 `FilterableSelect` | Partial | Check async loading, custom option rendering, portals, and create behavior. |
| v2 `Checkbox` | v3 `Checkbox` | Ready | Preserve indeterminate state and label activation. |
| v2 `Switch` | v3 `Switch` | Ready | Preserve immediate vs submit-on-save semantics. |
| v2 `Tooltip` | v3 `Tooltip` | Ready | Ensure trigger composition and disabled-control behavior work. |
| v2 `Dropdown`/`Menu` | v3 `DropdownMenu` | Partial | Validate nested items, links, disabled reasons, and portal layering. |
| v2 `Table` | v3 `Table` | Partial | Migrate empty, loading, sorting, row actions, and pagination as one composition. |
| v2 `Pagination` | v3 `Pagination` | Ready | Preserve server-side page and per-page state. |
| v2 `EmptyState` | v3 `Empty` | Ready | Distinguish empty collection from filtered/no-permission states. |
| v2 `Tabs` | v3 `Tabs` | Partial | API and responsive/vertical behavior differ; migrate a full tab group. |
| v2 `Modal` | v3 `Dialog`, `Sheet`, or page | Partial | Choose the correct task container rather than mechanically mapping Modal to Dialog. |
| v2 `Drawer` | v3 `Sheet` | Ready | Validate side, width, nested overlays, and focus return. |
| v2 `DeleteActionModal` | v3 `AlertDialog` | Partial | Preserve typed confirmation, pending state, resource naming, and consequences. |
| v2 `ConfirmActionModal` | v3 `AlertDialog` | Partial | Confirm whether the action is consequential enough to require interruption. |
| v2 `PageHeader` | normalized page-header component | Blocked | Current implementation is still v2 and widely used; define the stable target before broad page migration. |
| v2 `Spinner` | pending Button, `Skeleton`, or `PageLoader` | Partial | Choose by loading scope; no single spinner replacement is correct. |
| v2 `SecretInput` | v3 platform `SecretInput` | Partial | Validate references, reveal behavior, masking, and dense table usage. |
| v2 `CopyButton` | v3 `CopyButton` or `IconButton` composition | Partial | Add canonical Storybook guidance before broad migration. |
| v2 `Lottie` | retained utility or normalized loader | Retain | v3 currently consumes it; decide independently from visual component migration. |

Do not mark a row globally ready based on one simple call site if advanced
consumers still require unsupported behavior. Add scoped notes where necessary.

## 5. Rules for new work

- New product UI uses the current ready target.
- Do not add new visual variants or capabilities to v2.
- A v2 dependency is allowed only when the matrix marks the target partial,
  blocked, or retained for the required behavior.
- Record the blocker in this document rather than hiding it in a local wrapper.
- New page-local components follow the permanent design-engineering guide even
  when the surrounding page is legacy.
- Do not introduce a new component generation outside an approved target
  decision.

## 6. Rules for touched legacy work

A small product fix does not require migrating an entire page.

Migrate when the requested change already crosses one of these boundaries:

- The component's interaction or state model
- Its form label, validation, and error composition
- Its overlay container or focus behavior
- Its table loading, empty, filtering, or row-action composition
- A shared primitive being changed for multiple consumers

Avoid migration when:

- The edit is isolated business logic with no UI-contract change.
- The target is partial or blocked for the used behavior.
- A local replacement would leave a less coherent or less accessible surface.
- Validation cannot cover the affected workflow.

Do not mix v2 and v3 versions of the same primitive inside one local composition
unless a documented blocker requires it. Existing mixed pages are not a reason
to deepen the mixture.

## 7. Minimal-change rules

- Prefer a direct replacement with an existing target.
- Preserve behavior, permissions, query state, routing, analytics, and copy
  unless the standard explicitly requires correction.
- Migrate the smallest coherent boundary: field, action group, overlay, section,
  or page.
- Do not mass-replace legacy palette classes during unrelated work.
- Do not introduce a compatibility wrapper for a single call site.
- Add a wrapper only when several consumers need the same meaningful
  adaptation and the wrapper has a clear sunset.
- Missing target capability belongs in the shared component, not in repeated
  page-local reimplementations.
- Do not rename domain concepts as part of visual migration.
- Do not combine migration with API, data model, or routing redesign without a
  separate requirement.

The objective is normalized behavior with the least production risk, not the
largest possible diff.

## 8. Baseline audit

Freeze the permanent standard before classifying existing code. Otherwise the
audit measures against a moving target.

The first pass is read-only and produces a ledger. Do not open one issue per
static match.

### Ledger fields

Record:

- Stable finding ID
- Product area and surface
- File or component boundary
- Standard or migration rule involved
- Category
- Classification
- Severity
- User impact
- Smallest safe correction
- Target status and blockers
- Required verification
- Disposition and owner when scheduled

### Classifications

- **Defect:** current behavior violates a permanent requirement and affects
  users.
- **Migration debt:** legacy implementation is stable but differs from the
  target.
- **Standard gap:** permanent guidance or target behavior is undefined.
- **Sanctioned exception:** divergence is necessary and documented.
- **False positive:** static evidence does not represent a real violation.

Migration debt is not automatically a defect.

### Audit categories

1. Broken, stale, or contradictory guidance
2. Undefined semantic tokens
3. Literal colors outside approved exceptions
4. Incorrect use of status, scope, or product color
5. v2 use where a ready target exists
6. Mixed-generation local compositions
7. Missing loading, empty, error, retry, read-only, or permission states
8. Incorrect choice of inline, Dialog, Sheet, or page
9. Keyboard, focus, labeling, semantics, contrast, or reduced-motion defects
10. Direct HTML controls that unnecessarily bypass a shared primitive
11. Copy, capitalization, and notification inconsistencies
12. Missing or misleading Storybook coverage
13. Sensitive reveal, copy, toast, analytics, URL, or screenshot behavior
14. Responsive overflow and narrow-viewport defects

Static searches identify candidates, not conclusions. Inspect the composition
and user behavior before assigning a classification.

## 9. Severity and prioritization

- **P0 — Critical:** sensitive-data exposure, inaccessible critical workflow,
  destructive-action failure, or security-relevant misleading state.
- **P1 — High leverage:** shared primitive, token, or guidance defect affecting
  many surfaces.
- **P2 — Surface defect:** incoherent or inaccessible composition with a ready,
  bounded correction.
- **P3 — Migration debt:** stable legacy implementation or low-impact
  inconsistency.

Within a priority, prefer work that:

- Removes a blocker for many consumers
- Reduces future exceptions
- Has focused verification
- Avoids combining unrelated product behavior

## 10. Remediation stages

### Stage A — Guidance corrections

Correct broken links, inventories, contradictions, lifecycle status, and target
decisions. These changes should not alter production behavior.

### Stage B — Foundations

Resolve:

- Undefined or ambiguous semantic tokens
- Shared focus, disabled, pending, portal, and reduced-motion behavior
- Storybook environment parity
- Missing stories for target primitives
- Shared component defects blocking migration

Fix the shared source when doing so safely eliminates repeated findings.

### Stage C — Mechanical replacements

Migrate isolated ready components where behavior maps directly. Keep each batch
small enough for a reviewer to understand without learning the entire page.

### Stage D — Composition migrations

Migrate a coherent Card/table/form/overlay boundary. Validate every state owned
by that composition.

### Stage E — Page migrations

Migrate a whole page only when smaller changes would deepen inconsistency or
when the page is being established as a canonical reference.

### Stage F — Cleanup

Remove unused exports, compatibility wrappers, legacy tokens, and migration
exceptions only after consumers are gone.

## 11. Recommended migration waves

### Wave 1 — Shared blockers

- Token normalization and undefined-token resolution
- Stable page-header contract
- Loading and pending-state guidance
- AlertDialog parity for confirmation flows
- Dialog/Sheet layering and nested-overlay behavior
- Field migration recipes
- Tabs parity and responsive behavior

### Wave 2 — Repeated compositions

- Settings sections
- Search/filter/table/pagination sections
- CRUD Dialog and Sheet flows
- Permission-gated action groups
- Empty, error, and no-results states

### Wave 3 — Product slices

Choose bounded product surfaces with active ownership. Migrate one coherent
slice, verify it in the application, and use the result to refine—not silently
override—the rulebook.

### Wave 4 — Residual cleanup

Address low-use legacy surfaces, remove dead components, and close sanctioned
exceptions that no longer have consumers.

## 12. Verification for migration changes

At minimum:

- Compare behavior before and after.
- Exercise default, focus, disabled, pending, success, and failure states.
- Check loading, empty, no-results, and permission variants when applicable.
- Verify keyboard interaction and focus return.
- Check a narrow and standard desktop viewport.
- Confirm portal layering for nested menus, selects, dialogs, and sheets.
- Confirm sensitive values remain masked and absent from notifications.
- Run lint and type-check.
- Exercise the real application workflow when data, permissions, routing, or
  multiple overlays are involved.

Storybook proves the component contract; it does not replace feature acceptance
testing.

## 13. Temporary enforcement

Introduce checks gradually after the baseline is classified:

- Prevent new v2 imports outside an exception allowlist.
- Detect undefined semantic token utilities.
- Detect literal colors and allow approved boundary files.
- Validate documentation links and component inventories.
- Build Storybook in CI.
- Make accessibility checks blocking for stable stories.
- Enable targeted accessibility lint rules as existing violations are reduced.

Do not add a blocking check that fails on unclassified historical debt. Baseline
or scope it first.

## 14. Migration definition of done

A migrated boundary:

- Uses no relevant legacy visual primitive.
- Preserves required business behavior and routing state.
- Uses normalized tokens and supported target APIs.
- Handles loading, empty, error, disabled, pending, read-only, and permission
  states that apply.
- Meets keyboard, focus, labeling, responsive, and security requirements.
- Adds target Storybook coverage when shared capability changed.
- Removes temporary local adaptation that no longer has consumers.
- Passes lint, type-check, and workflow verification.

## 15. Sunset conditions

Delete this document when:

- The target generation decision is complete.
- The parity matrix has no active migration blockers.
- Production visual code no longer imports v2, except explicitly retained
  non-visual utilities with permanent ownership.
- Temporary compatibility wrappers and enforcement allowlists are removed.
- Canonical pages and Storybook represent the normalized system.
- Remaining design-system evolution follows the permanent lifecycle in
  `DESIGN_ENGINEERING.md`.

Move any still-valid product or engineering principle to its permanent document
before deletion. Do not retain migration history as active guidance.
