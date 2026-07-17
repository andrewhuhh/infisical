# Frontend Design Engineering

This document is the permanent implementation contract for product UI in the
Infisical frontend. It translates the principles in [`../DESIGN.md`](../DESIGN.md)
into supported frontend patterns without freezing the design system at a
particular component generation.

Temporary legacy-migration rules live in
[`COMPONENT_SYSTEM_MIGRATION.md`](COMPONENT_SYSTEM_MIGRATION.md).
Independent review process and readiness criteria live in
[`REVIEWING.md`](REVIEWING.md).

## 1. Sources of truth

Use this order when building or reviewing UI:

1. [`../DESIGN.md`](../DESIGN.md) for product semantics and experience.
2. This document for frontend implementation rules.
3. Component Storybook stories for supported variants and compositions.
4. Component source for the exact API and behavior.
5. Production pages for domain behavior, but not as automatic visual precedent.

Production code contains legacy and transitional patterns. Repetition alone
does not make a pattern canonical.

## 2. Current frontend stack

The shared system is built with:

- React and TypeScript
- Tailwind CSS v4 with theme variables in [`src/index.css`](src/index.css)
- Radix primitives for accessible interaction behavior
- `cva` for variants
- `clsx` and `tailwind-merge` through `cn()` for class composition
- Lucide for general product icons
- React Hook Form and Zod for forms
- TanStack Router, Query, Table, and Virtual where appropriate
- Sonner through `createNotification` for transient notifications

Use shared components before consuming their underlying library directly.
Direct use is appropriate when building the shared component itself or when a
specialized interaction cannot be expressed by an existing component.

## 3. Component generations and lifecycle

`src/components/v3` is the current preferred implementation for new product UI.
`src/components/v2` is legacy and remains in production during migration. Follow
[`COMPONENT_SYSTEM_MIGRATION.md`](COMPONENT_SYSTEM_MIGRATION.md) when working in
a legacy surface.

A component's lifecycle is:

- **Experimental:** API may change; usage is limited to named adopters.
- **Stable:** exported through the supported barrel, documented, and suitable
  for new work.
- **Deprecated:** has a documented replacement and receives only compatibility
  or security fixes.
- **Removed:** no longer exported or used in production.

The folder name alone does not prove maturity. Story coverage, accessibility,
real usage, and known migration blockers determine status.

### Current shared inventory

Generic v3 families:

- Accordion, Alert, AlertDialog, Badge, Breadcrumb
- Button, ButtonGroup, IconButton, CopyButton
- Calendar, ColorPicker
- Card, Detail, Empty, Item, Separator, Skeleton
- Checkbox, Field, Input, InputGroup, Label, RadioGroup, ReactSelect, Select,
  Switch, TextArea
- Command, Dropdown, HoverCard, Popover, Tooltip
- Dialog, Sheet, Sidebar
- DataGrid, Pagination, Table
- Stepper, Tabs, Toast

Platform v3 families:

- DateRangeFilter
- DocumentationLinkBadge
- GatewayPicker
- IdentityRoleBadges
- PageLoader
- PasswordGenerator
- SecretInput
- SecretPathInput
- Scope icons and permission-oriented selectors exported directly from the
  platform barrel

This list is an index, not an API reference. Storybook and source remain
canonical.

## 4. Placement and promotion

Choose the narrowest ownership boundary that fits:

- **Page-local component:** used by one route or feature.
- **View:** a reusable page-level composition with domain behavior.
- **Platform component:** reusable across multiple surfaces in one domain or
  product concept.
- **Generic component:** domain-neutral primitive or composition with a stable,
  broadly reusable contract.

Do not place a component in `generic` in anticipation of reuse. Promote it after
at least two real consumers demonstrate the same semantic contract.

A generic component must not import page code, feature contexts, API hooks, or
domain types. A platform component may understand domain concepts but should not
own route-level data fetching unless that is its explicit contract.

## 5. Tokens and styling

### Theme contract

`src/index.css` is the source of truth for Tailwind theme tokens. Prefer
semantic roles over palette values:

- Surfaces: `background`, `card`, `popover`, `container`,
  `container-hover`
- Content: `foreground`, `accent`, `muted`, `label`
- Structure: `border`, `ring`
- Status: `success`, `info`, `warning`, `danger`, `neutral`
- Scope: `org`, `sub-org`, `project`, `admin`
- Product: established `product-*` tokens
- Resource types: `folder`, `secret`, `dynamic-secret`, `import`,
  `secret-rotation`, `override`

Legacy palette scales such as `mineshaft`, `bunker`, and `primary` remain
available during migration. Do not use them for new shared-component APIs when
a semantic role exists.

Never use a Tailwind semantic utility unless its token exists in `@theme`.
Undefined names copied from another component system are not implicit aliases.

### Literal and dynamic colors

Literal colors require one of these reasons:

- External artwork or brand identity
- User-configured branding or resource color
- Data visualization palette
- Third-party API that accepts only a color value

Keep the exception close to the boundary that needs it. Do not move literal
colors into the global theme unless they have a stable product meaning.

### Class composition

Use `cn()` for conditional class composition in v3 components. Use `cva` when a
component has a supported semantic variant or size API.

- Variants describe meaning or established presentation, not arbitrary style
  escape hatches.
- Avoid boolean variants whose only purpose is a one-off call site.
- Consumer `className` may adjust layout, width, or composition. It should not
  routinely restyle a component's semantic state.
- Use `data-slot`, `data-state`, and `data-variant` for composition and
  state-aware styling.
- Arbitrary values are acceptable for real geometry constraints, not as a
  substitute for shared spacing or tokens.

### Responsive behavior

The custom `dashboard` breakpoint is defined in `src/index.css`. Standard
Tailwind breakpoints remain available.

Design from the narrowest supported viewport:

- Controls may wrap, stack, or move into an overflow menu.
- Tables preserve access to all data through horizontal scrolling or an
  intentional alternate presentation.
- Dialog and sheet actions stack when horizontal space is insufficient.
- Fixed widths require a responsive maximum.
- Hover affordances also work with focus and touch.

Do not add a new global breakpoint for one page.

### Motion

Shared primitives own standard overlay, focus, disclosure, and loading motion.
Page code should normally compose those primitives rather than adding
independent animation.

Any new motion must:

- Clarify a state or spatial relationship
- Avoid delaying the user's next action
- Work with reduced motion
- Preserve focus and screen-reader behavior

## 6. Choosing components

### Actions

- Use `Button` for a text-bearing action.
- Use `IconButton` for a compact icon-only action and provide `aria-label`.
- Use `ButtonGroup` for controls that form one visual unit.
- Use `DropdownMenu` for contextual or overflow actions.
- Use `Badge` for status, scope, or metadata. If it is interactive, the
  underlying element must be a link or button with a clear interaction.

Choose button variants by scope or intent. Do not use danger styling for a
non-destructive primary action.

### Forms

Use React Hook Form with a Zod resolver for forms with validation or submission
state.

Compose fields from:

- `Field`
- `FieldLabel`
- `FieldContent`
- `FieldDescription`
- `FieldError`

Labels, descriptions, and errors must be programmatically associated with the
control. Use `Controller` for controlled third-party or shared components.

Use:

- `Input` or `TextArea` for text
- `Select` for a bounded list
- `FilterableSelect` for a searchable list
- `CreatableSelect` only when creating a value is part of the workflow
- `Checkbox` for independent choices
- `RadioGroup` for one choice from a visible set
- `Switch` for an immediately understandable on/off setting
- `SecretInput` for sensitive values and secret references

Do not render a bare control in an ordinary form to avoid the field contract.
Specialized editors and dense inline editing may implement equivalent semantics
directly.

### Dialog, sheet, page, or inline

- **Inline:** quick editing where retaining row or page context is essential.
- **Dialog:** short focused task or confirmation.
- **Sheet:** longer secondary task or detail view that benefits from retained
  page context.
- **Page:** complex, addressable, recoverable, or navigation-heavy workflow.

Field count is a signal, not the decision rule. Account for nested overlays,
file selection, long validation, and mobile behavior.

Use `AlertDialog` for consequential confirmations. Use its action and cancel
components rather than recreating close behavior.

### Data display

- Use `Table` for read-mostly records with a stable column schema.
- Use `DataGrid` only for spreadsheet-like editing, selection, copy/paste, or
  keyboard navigation.
- Use `Item` for a list without meaningful columns.
- Use `Detail` for read-only label/value information.
- Pair collections with `Pagination` when the backing operation is paginated.

When no records exist, hide empty table chrome and show `Empty`. Distinguish an
empty collection from no search results, failed loading, and unavailable
permission.

### Feedback and loading

- Use `Skeleton` when preserving layout improves perceived progress.
- Use `PageLoader` for route or full-surface loading when no useful structure
  can be shown.
- Use a pending Button for a local mutation.
- Use `Alert` for persistent contextual information or failure.
- Use `createNotification` for transient post-action feedback.

Do not show a success toast for a mutation that is still awaiting approval.
State the approval outcome explicitly.

## 7. Page composition

The normal authenticated page boundary is:

1. A centered, width-constrained container.
2. A scoped page header with title, description, and optional page-level
   actions.
3. Optional scope-level tabs or alerts.
4. One or more coherent sections.

Use `Card` for a section when the border and surface improve grouping. A page
does not need a Card around every sentence or chart.

Within a Card:

- `CardHeader` owns title, description, filters that govern the whole section,
  and `CardAction`.
- `CardContent` owns the primary data or form.
- `CardFooter` owns pagination or actions that semantically conclude the
  section.

Keep URL-worthy state in TanStack Router search parameters when it should
survive refresh, linking, or browser navigation. Examples include selected
tabs, filters, pagination, and selected records. Ephemeral overlay state may use
local state or `usePopUp`.

## 8. Permissions and security

Use `ProjectPermissionCan`, `OrgPermissionCan`, permission contexts, or the
established domain guard. Do not duplicate authorization logic in visual
conditions.

Choose intentionally:

- **Hide** when awareness would expose protected capability or data.
- **Disable with explanation** when the workflow is useful to understand.
- **Permission state** when the whole section is unavailable.
- **Request access** when a supported access-request flow exists.

Sensitive values:

- Start masked.
- Reveal only on explicit activation.
- Provide explicit copy feedback without repeating the value.
- Keep values out of notifications, analytics, URLs, and logs.
- Explain one-time credential visibility before the user closes it.

## 9. Accessibility contract

New or materially changed UI must meet these requirements:

- Native semantics or an accessible shared primitive
- Programmatic labels for all controls
- Visible focus
- Complete keyboard operation
- Predictable focus on overlay open and close
- Associated field descriptions and errors
- Meaning that does not rely on color or hover
- Correct heading and table structure
- Accessible names for icon-only controls and unlabeled columns
- Announced asynchronous errors or status where necessary
- Usable zoom, narrow viewport, and overflow behavior
- Reduced-motion support for new custom motion

Do not use `role="button"` on a non-button when a native button is possible.
When a row is clickable, interactive descendants must remain independently
operable and the row needs keyboard behavior.

## 10. Content and localization

Follow the voice and capitalization rules in `../DESIGN.md`.

- Reuse existing translation keys where the surrounding surface is localized.
- Do not add an English string to a fully localized workflow without a reason.
- Do not construct sentences from fragments whose order cannot be translated.
- Preserve protocol names, resource names, paths, and user-provided values.
- Format dates and durations with existing helpers or `date-fns`; do not invent
  a local format without product need.

## 11. Specialist libraries

Use the existing specialist system when the interaction requires it:

- TanStack Table/Virtual for complex or virtualized data
- React Select through shared wrappers for advanced selection
- dnd-kit for drag-and-drop
- XYFlow and Dagre for node graphs
- Recharts for charts
- CodeMirror or Xterm for editor and terminal surfaces
- date-fns for date calculation and formatting

Do not use a specialist library to bypass a shared primitive for ordinary
buttons, fields, dialogs, or menus. New dependencies require a capability that
the current stack cannot reasonably provide.

Provider brand icons may continue to use their established icon source. Use
Lucide for general product actions and concepts. Avoid mixing icon families
within one control group.

## 12. Storybook contract

Every stable generic component requires:

- An anatomy or default story
- Every supported semantic variant and size
- Disabled, pending, error, or selected states when applicable
- Keyboard and focus behavior
- Realistic compositions
- Use-when guidance
- An accessibility pass

Platform components require stories when they are reused or define a canonical
domain interaction. Page-local components do not need Storybook by default.

Stories are product examples, not test fixtures filled with arbitrary text.
They must follow the same content, token, and accessibility rules as production
UI.

## 13. Evolving the system

### Add a variant when

- The distinction has stable semantic meaning.
- At least one real product use case exists.
- Existing composition cannot express it clearly.
- The variant can be documented and tested across required states.

Do not add a generic color variant for a single feature.

### Add a component when

- Existing primitives cannot express the behavior without repeated,
  accessibility-sensitive implementation.
- The proposed API is smaller and clearer than copying the composition.
- Ownership and lifecycle are clear.

Start experimental when the API or visual behavior is not established.

### Upgrade in place when

- Semantics and consumer contracts remain valid.
- Changes can be additive or deprecated gradually.
- Consumers can migrate independently.

### Create a new component generation when

- Foundational token, semantic, or composition contracts must break.
- Long-lived coexistence is required.
- Compatibility branches would make the current generation harder to
  understand than a new one.

Breaking work needs a short proposal containing the problem, representative
call-site audit, proposed contract, accessibility impact, migration strategy,
and sunset criteria.

## 14. Definition of done

For new or materially changed UI:

- Product scope and page archetype are correct.
- Supported shared components are used.
- All required states are handled.
- Tokens and variants reflect semantic intent.
- Forms, overlays, routing state, and permissions use established patterns.
- Keyboard, focus, labels, contrast, overflow, and narrow viewports are checked.
- Sensitive values remain protected.
- Copy follows product voice and localization conventions.
- A shared-component change includes Storybook coverage.
- `npm run lint` and `npm run type:check` pass.
- The affected workflow is exercised in the application when Storybook cannot
  prove the behavior.
- Independent review follows [`REVIEWING.md`](REVIEWING.md).
