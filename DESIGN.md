# Infisical Product Design

This document defines the durable product-design principles for Infisical. It
describes the intended experience independently of any component generation or
frontend implementation.

## Guidance hierarchy

Use these references in order:

1. **This document** defines product character, semantics, interaction
   principles, accessibility, security UX, and content.
2. [`frontend/DESIGN_ENGINEERING.md`](frontend/DESIGN_ENGINEERING.md) defines
   how those principles are implemented in the frontend.
3. Storybook and component source define the supported APIs and canonical
   component compositions.
4. [`frontend/COMPONENT_SYSTEM_MIGRATION.md`](frontend/COMPONENT_SYSTEM_MIGRATION.md)
   contains temporary rules for moving legacy UI to the normalized system. It
   is not a product-design reference and is deleted when migration is complete.

When references disagree, fix the lower-level reference. Do not preserve an
implementation accident by promoting it into a product principle.

## 1. Product character

Infisical is a security tool for operators. The interface should read like
infrastructure: dense, calm, precise, and legible.

- **Technical, not ornamental.** Decoration must not compete with operational
  information.
- **Dense, not cramped.** Prefer compact controls and tables while preserving
  readable grouping and target sizes.
- **Calm, not passive.** Important states are clear without using alarmist
  language or excessive motion.
- **Semantic, not decorative.** Color communicates scope, status, or resource
  type before brand.
- **Explicit, not surprising.** Sensitive, destructive, or permissioned actions
  disclose their effect before execution.
- **Dark-native.** Dark is the current product medium. A future theme may change
  values, but not the semantic roles defined here.

## 2. Semantic foundations

### Color

Choose color by intent. Implementation tokens and values live in
[`frontend/src/index.css`](frontend/src/index.css); the semantic roles are
stable even when their values evolve.

#### Scope

Scope colors reinforce where the user is operating:

- Organization
- Sub-organization
- Project
- Instance administration
- Product-specific scopes when a product has an established accent

Do not reuse a scope color as a generic accent. Doing so creates false
hierarchy.

#### Status

- **Success:** healthy or completed
- **Info:** informational or externally referenced
- **Warning:** attention is warranted, but the state is not yet a failure
- **Danger:** destructive, failed, expired, or blocked
- **Neutral:** disabled, absent, inactive, or unclassified

Status must never rely on color alone. Pair color with text, an icon, position,
or another programmatic cue.

#### Resource types

Product-area colors may distinguish established resource types such as folders,
secrets, imports, rotations, and overrides. They are not generic accents.

#### Dynamic-color exceptions

Not every meaningful color belongs in the product token palette. The following
may use controlled dynamic or literal values:

- User-configured branding and tag colors
- Provider or country artwork that must preserve an external identity
- Data visualization series generated from an approved chart palette
- Third-party graph, editor, terminal, or media surfaces that require a value
  through an API

Keep the surrounding product chrome tokenized, validate user-provided colors,
and preserve readable contrast. An exception for data is not permission to add
literal colors to ordinary product UI.

### Typography

Inter is the product typeface. Use hierarchy sparingly:

- Page titles identify location and scope.
- Section and card titles identify a coherent unit of work.
- Body text is the default for operational content.
- Labels and metadata are compact but remain readable.
- Monospace is reserved for values whose exact characters matter, such as
  identifiers, commands, paths, and secret keys.

Avoid using font size or weight as decoration. Prefer a small number of
repeatable roles.

### Spacing and density

Use spacing to communicate relationship:

- Tight spacing binds an icon, label, badge, or helper text.
- Standard spacing separates adjacent controls and fields.
- Section spacing separates distinct tasks or information groups.

Dense tables and forms are expected, but unrelated concepts should not be
compressed into a single visual block. Repeated one-off spacing values indicate
that a shared composition is missing.

### Depth

Depth is conveyed primarily by surface tone and borders. Shadows are reserved
for genuinely floating layers such as dialogs, sheets, popovers, dropdowns, and
tooltips. Cards, table rows, and badges do not need decorative shadows.

### Motion

Motion clarifies state change, hierarchy, or spatial origin. It is not
decoration.

- Prefer short transitions and established component motion.
- Do not add page-specific motion when an existing primitive owns the
  transition.
- Avoid springs, large travel, and chained entrance effects in operational
  workflows.
- Respect reduced-motion preferences. Essential state changes must remain clear
  without animation.

## 3. Page archetypes

Choose a page structure before choosing individual components.

### List and management pages

Use for collections of records. The page normally contains a scoped header,
search and filters, a primary action, the collection, pagination when needed,
and explicit loading, empty, error, and permission states.

### Settings pages

Group settings by user intent rather than backend model. Each section should
have a clear title, short description, current state, and a local action.
Independent settings should not share a save action unless they form one
transaction.

### Detail pages

Lead with identity and status, then group related details and actions. Avoid
turning a detail page into an unstructured list of label/value pairs.

### Dashboards

Start with the operational questions the dashboard must answer. Summary metrics
should lead to inspectable source data. Charts require text labels, accessible
summaries, stable color meaning, loading states, and an empty state distinct
from a zero value.

### Workflows and wizards

Use for multi-step tasks with meaningful progress or validation dependencies.
Preserve entered data when moving between steps. State what will happen before
the final action.

### Authentication and public pages

These surfaces have reduced application chrome and may support customer
branding, but they retain the same accessibility, security, content, and
interaction standards.

## 4. Interaction principles

### Actions

- One surface should have one visually dominant next action.
- Label actions with a precise verb and object where useful.
- Icon-only actions require an accessible name and should use established
  symbols.
- Destructive actions use danger semantics only when the action is destructive,
  not merely important.
- Do not make a badge behave like a button unless the interaction is explicit
  and keyboard accessible.

### Choosing a container

Choose based on task shape, not field count alone:

- **Inline:** fast, reversible editing where context is essential, such as a
  dense secret table.
- **Dialog:** a short, focused task or confirmation that blocks the current
  workflow.
- **Sheet:** a longer secondary task, detail view, or edit flow where the
  underlying page should remain visible.
- **Page:** an addressable workflow, complex configuration, or task that needs
  substantial space, navigation, or recovery.

Do not force a complex workflow into an overlay to satisfy a component rule.

### Feedback

- Show pending state on the initiating action and prevent duplicate submission.
- Use inline feedback when the user must act on it in context.
- Use a toast for transient confirmation or failure after an action.
- Preserve user input after a recoverable failure.
- Distinguish no data, no matching results, no permission, and failed loading.

### Required states

Every interactive surface must account for:

- Default, hover, focus, active, and disabled
- Pending or saving
- Loading, empty, error, and retry
- Read-only and permission denied
- Long, missing, and malformed content where applicable
- Narrow viewport and overflow behavior

Not every state needs unique UI, but none should occur accidentally.

## 5. Accessibility

Accessibility is part of component correctness.

- Use native semantics or accessible primitives before recreating behavior.
- Every control has a programmatic name.
- Forms associate labels, descriptions, and errors with their controls.
- Keyboard users can reach, operate, and leave every interaction.
- Focus remains visible and moves predictably when overlays open and close.
- Dynamic status and errors are announced when needed.
- Tables use real headers and descriptions when visual context is insufficient.
- Contrast is checked for text, icons, focus indicators, borders that carry
  meaning, and user-configured themes.
- Touch and pointer targets remain usable on narrow viewports.
- Reduced motion does not obscure state changes.

Hover-only disclosure is insufficient for required information or actions.

## 6. Security UX

### Sensitive values

- Secret values, tokens, and private keys are masked by default.
- Reveal is an explicit action and must not happen on hover.
- Copy is explicit and confirms success without repeating the sensitive value.
- Never include a secret value in UI copy, toasts, errors, logs, analytics,
  audit descriptions, screenshots, or documentation.
- Newly created credentials that cannot be retrieved later must say so before
  dismissal.

### Permissions

Explain unavailable actions without exposing protected data.

- Hide an action when its existence reveals a capability or resource the user
  must not know about.
- Disable an action with an explanation when seeing it helps the user understand
  the workflow or request access.
- Use a dedicated permission state when an entire surface is unavailable.
- Never imply an action succeeded when it was submitted for approval.

### Destructive actions

Name the resource, action, and consequence. Confirm destructive actions when
they are difficult to reverse, have broad impact, or affect security posture.
Do not add confirmation friction to ordinary reversible actions.

## 7. Voice and content

Write as an engineer speaking to another engineer: direct, technical, specific,
and calm.

### Style

- Use active voice.
- Prefer precise verbs such as “rotate,” “revoke,” “import,” or “delete.”
- Avoid exclamation marks, emoji, vague reassurance, and marketing claims.
- Do not describe a feature as seamless, powerful, easy, or blazing-fast.
- Use contractions when they make a sentence more natural.

### Capitalization

- Use **Title Case** for page, dialog, sheet, and major section titles.
- Use **sentence case** for buttons, menu items, tabs, labels, table headers,
  descriptions, helper text, errors, empty states, and toasts.
- Preserve established capitalization for product names, protocols, acronyms,
  and user-provided values.

### Common content shapes

- **Action:** imperative and specific — “Add secret,” “Revoke access.”
- **Description:** one short sentence explaining purpose or consequence.
- **Empty state:** state what is absent, then give the relevant next action.
- **Error:** name the failure and, when known, the remedy.
- **Success:** past tense and specific — `Secret "API_KEY" created`.
- **Destructive confirmation:** name the resource and consequence, ending with
  “This cannot be undone” only when that statement is true.
- **Documentation link:** label it “Documentation,” not “Learn more.”

Do not expose sensitive values while making copy more specific.

## 8. Evolution of the design system

The design system is expected to evolve. These principles do not freeze a
component generation.

### Component lifecycle

- **Experimental:** API and visuals may change; not a default dependency.
- **Stable:** supported, documented, accessible, and suitable for new work.
- **Deprecated:** supported temporarily with a documented replacement.
- **Removed:** no longer exported or used in production.

### Change levels

- **Routine:** internal fixes, accessibility improvements, documentation, and
  compatible variants.
- **Additive:** a new primitive, composition, semantic token, or supported
  capability.
- **Breaking:** changes to semantics, component contracts, token meaning, or
  composition that require coordinated migration.

Routine changes do not need a design proposal. Additive changes require real
product use cases and Storybook validation. Breaking changes require a short
design-engineering proposal, migration strategy, and explicit review.

### Upgrade in place or create a new generation

Upgrade the current system in place when semantics remain valid and consumers
can move independently. Create a new generation only when foundational
contracts must break, long-lived coexistence is necessary, or compatibility
layers would make the system harder to understand than a migration.

A new version is not a substitute for finishing documentation, accessibility,
or adoption work.

## 9. Product-design review

Before considering a UI ready, confirm:

- The page archetype and scope are clear.
- Color and hierarchy communicate meaning rather than decoration.
- The primary action and consequences are unambiguous.
- Loading, empty, error, permission, and narrow-view states are designed.
- Keyboard, focus, contrast, and reduced motion have been considered.
- Sensitive data remains protected.
- Copy follows the product voice and capitalization rules.
- The implementation uses supported components and patterns described in the
  design-engineering guide.
