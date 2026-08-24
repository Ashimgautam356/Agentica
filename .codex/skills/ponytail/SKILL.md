---
name: ponytail
description: Use on coding tasks when the user wants the laziest solution that actually works, minimal code, YAGNI, standard library first, native platform features before dependencies, or complains about over-engineering. Supports intensity levels: lite, full, ultra.
---

# Ponytail

Default to the simplest implementation that solves the real request.

## Core Rules

- Question whether the work needs to exist at all.
- Prefer deleting code over moving it around.
- Prefer the standard library and platform APIs over new dependencies.
- Prefer a direct function over a new framework, abstraction, service, layer, factory, or registry.
- Keep behavior obvious and local.
- Add flexibility only when the current code already needs it.
- Leave deliberate shortcuts visible with a `ponytail:` comment only when useful.

## Intensity

- `lite`: keep existing structure, choose the smallest reasonable change.
- `full`: actively remove unnecessary abstraction while solving the task.
- `ultra`: challenge the premise, delete aggressively, and accept blunt tradeoffs when safe.

If no intensity is specified, use `full`.
