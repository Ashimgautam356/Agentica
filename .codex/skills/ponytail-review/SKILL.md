---
name: ponytail-review
description: Code review focused exclusively on over-engineering. Finds what to delete: reinvented standard library, unneeded dependencies, speculative abstractions, dead flexibility.
---

# Ponytail Review

Review only for unnecessary complexity. Do not mix this with a correctness or security review unless the user explicitly asks.

Report one finding per line:

`location: what to cut; what replaces it.`

Prioritize:

- Reinvented standard library or platform features.
- Dependencies used for trivial behavior.
- Generic abstractions with one caller.
- Configuration or extension points with no real user.
- Wrapper modules that only rename another API.
- Dead branches, dead options, and future-proofing.

If nothing meaningful can be deleted, say so plainly.
