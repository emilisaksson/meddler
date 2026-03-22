# Architecture

This document describes the general coding, file, folder, and architectural patterns used in this application. It is intentionally application-agnostic so it can be used as the basis for a boilerplate project with the same structure and development style.

## Purpose

The architecture is designed for a backend-oriented TypeScript application that:

- groups code by runtime responsibility instead of by technical library alone
- keeps business logic separate from transport, scheduling, and infrastructure concerns
- uses small helper and integration modules to compose larger workflows
- favors explicit file placement and naming over deep framework magic

## High-Level Structure

The codebase is organized around a `src` root with server-side code grouped by execution context and responsibility.

Typical structure:

```text
src/
  server/
    api/
    helpers/
    integrations/
    scheduled-workers/
      frequent/
      hourly/
      daily/
    services/
    utils/
    test/
```

Exact folder names may differ, but the key pattern is stable: runtime entrypoints live near orchestration code, while reusable logic is extracted into focused modules.

## Architectural Style

The application follows a pragmatic layered architecture.

### 1. Entrypoint Layer

This layer contains code that is triggered by an external runtime:

- HTTP handlers
- scheduled workers
- queue consumers
- CLI jobs

Responsibilities:

- receive input from the runtime
- perform validation, normalization, and lightweight setup
- call reusable domain or workflow helpers
- translate results into runtime-specific output
- handle logging and failure boundaries appropriate to the runtime

This layer should stay thin. It coordinates work but should not contain substantial business rules.

### 2. Workflow / Orchestration Layer

This layer coordinates multi-step operations.

Responsibilities:

- call multiple helpers or service modules in sequence
- manage branching flows
- map external data to internal structures
- coordinate retries, progress updates, or state transitions

Files in this layer often live in folders such as `helpers`, `services`, or feature-specific modules under `server/`.

This is where most application behavior is assembled, but it should still prefer composition over large monolithic functions.

### 3. Integration Layer

This layer isolates communication with external systems.

Responsibilities:

- HTTP clients
- SDK wrappers
- database adapters
- storage access
- third-party APIs

Rules:

- keep external protocol details contained here
- return predictable internal data shapes
- centralize authentication, headers, retries, and serialization concerns
- do not spread raw third-party response handling throughout the codebase

### 4. Shared Utility Layer

This layer contains small, generic helpers with low business context.

Examples:

- formatting
- parsing
- date helpers
- object helpers
- generic type guards

Utilities should remain broadly reusable. If a helper starts encoding workflow or domain rules, it belongs in a higher-level module instead.

## Folder Patterns

### `src/server/`

The main backend runtime root.

Use this folder for code that executes on the server and should not be mixed with client concerns.

### `src/server/helpers/`

Focused workflow modules.

Use this folder for:

- reusable orchestration logic
- feature-level operations
- multi-step business processes

A helper is usually more specific than a utility and more reusable than an entrypoint.

### `src/server/scheduled-workers/`

Time-driven background jobs.

Organize workers by cadence or execution group, for example:

- `frequent/`
- `hourly/`
- `daily/`

Each worker should have a clear entry file, usually `index.ts`, that:

- defines the runtime trigger
- invokes the relevant workflow module
- handles logging and operational error behavior

Cadence-based folders make operational intent obvious and simplify maintenance.

### Feature-Named Subfolders

When a workflow is large enough, group it under a dedicated feature folder rather than continuing to grow a single file.

Example shape:

```text
src/server/helpers/<feature>/
  index.ts
  types.ts
  mapper.ts
  client.ts
  constants.ts
```

This keeps related logic colocated without mixing it into unrelated features.

## File Patterns

### `index.ts`

Used as a module or runtime entrypoint.

Typical uses:

- expose the public surface of a folder
- act as the execution entry for a scheduled worker or feature module

Use `index.ts` when the folder itself is the unit of meaning.

### `<feature>.ts`

Use a direct descriptive filename when the module represents a single concrete workflow or responsibility.

Examples of good patterns:

- one file per business operation
- one file per integration client
- one file per mapper or parser

### Supporting Files

Split files when a module starts mixing concerns.

Common supporting files:

- `types.ts` for shared module-local types
- `constants.ts` for stable configuration values local to a module
- `mapper.ts` for translation between external and internal shapes
- `client.ts` for external API access
- `test.ts` or `*.test.ts` for tests

## Coding Patterns

### Prefer Composition Over Large Classes

The structure favors plain functions and small modules.

Benefits:

- simpler dependency flow
- easier testing
- less framework coupling
- easier reuse in jobs, handlers, and scripts

Classes are appropriate only when they provide real value, such as lifecycle management or stateful adapters.

### Keep Runtime Code Thin

Entrypoints should:

- parse input
- call a helper or service
- return or log the result

They should not duplicate workflow logic that is needed elsewhere.

### Separate Business Logic from I/O

A useful test for module placement:

- if the code mainly decides what should happen, it belongs in a helper or service module
- if the code mainly talks to an external system, it belongs in an integration module
- if the code mainly adapts runtime input and output, it belongs in an entrypoint

### Prefer Explicit Dependencies

Modules should import the collaborators they need directly rather than depending on hidden global behavior.

This improves:

- readability
- testability
- refactoring safety

### Keep Functions Focused

A module may coordinate a complete workflow, but each function inside it should still have a clear purpose.

Good signs:

- descriptive names
- limited parameter lists
- predictable return values
- minimal side effects beyond its stated role

## Dependency Direction

Dependencies should generally flow inward from runtime and infrastructure toward reusable logic.

Preferred direction:

```text
Entrypoints
  -> workflow/helpers/services
    -> integrations/utilities
```

Avoid the reverse.

Examples of undesirable coupling:

- utilities importing scheduled-worker code
- integration clients importing HTTP handler modules
- feature helpers depending on a specific runtime entrypoint

This rule keeps shared logic portable across different execution contexts.

## Naming Conventions

The project favors descriptive, filesystem-friendly names.

Patterns:

- kebab-case for folders and filenames
- concise names that describe responsibility, not implementation detail
- feature-first naming when the file represents a workflow
- suffix-based naming when useful, such as `client`, `mapper`, `types`, or `constants`

Names should make the role of a file obvious without needing to open it.

## Scheduled Work Pattern

Scheduled processing is treated as a first-class runtime.

Recommended pattern for each worker:

1. An `index.ts` file acts as the worker entrypoint.
2. The worker performs minimal runtime setup.
3. Core logic is delegated to a helper or service module.
4. Progress, retries, and failures are handled consistently at the worker boundary.

This keeps recurring jobs easy to reason about and prevents scheduler-specific concerns from leaking into reusable logic.

## Testing Pattern

Tests should mirror runtime responsibilities and module boundaries.

Recommended approach:

- test pure helpers directly
- test orchestration modules with mocked integrations
- test integration modules separately at the boundary where practical
- keep high-value end-to-end tests focused on critical flows

Prefer testing behavior over internal implementation details.

When possible, place tests close to the modules they validate or use a predictable mirrored test structure.

## Error Handling

Error handling should be explicit and layered.

Guidelines:

- integration modules should convert low-level failures into predictable application-level errors or results
- workflow modules should decide whether to stop, retry, skip, or mark partial progress
- entrypoints should handle final logging, reporting, and runtime-specific responses

This avoids mixing transport concerns with business decision-making.

## Configuration and Constants

Configuration should be centralized and injected or imported from clear boundaries.

Guidelines:

- keep environment access near application setup or infrastructure boundaries
- avoid scattering raw environment reads throughout feature code
- keep feature-local constants close to the modules that use them
- separate true configuration from business logic

## Boilerplate Guidance

To create a new application with the same architecture:

1. Start with a `src/server` root.
2. Add folders for runtime entrypoints, helpers, integrations, and utilities.
3. Keep scheduled jobs in `scheduled-workers/<cadence>/index.ts`.
4. Place business workflows in named helper or service modules.
5. Isolate third-party and persistence code behind dedicated adapters or clients.
6. Keep dependency direction one-way from entrypoints toward reusable logic.
7. Use descriptive kebab-case names and small focused files.

## Summary

The defining patterns of this architecture are:

- server-first organization
- thin runtime entrypoints
- reusable workflow modules
- isolated integration boundaries
- explicit folder naming by responsibility
- cadence-based organization for scheduled work
- function-oriented TypeScript modules with focused files

The result is a codebase that is easy to navigate, easy to reuse in a boilerplate, and resilient to growth without requiring a heavy framework-specific structure.
