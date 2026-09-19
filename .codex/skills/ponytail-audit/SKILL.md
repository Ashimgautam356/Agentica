---
name: ponytail-audit
description: Whole-repo audit for over-engineering. Scans the entire codebase and returns a ranked list of what to delete, simplify, or replace with standard/native equivalents. One-shot report, does not apply fixes.
---

# Ponytail Audit

Run a repo-wide complexity audit without changing files.

Look for:

- Unused or redundant dependencies.
- Repeated wrappers over framework APIs.
- Speculative architecture.
- Large utilities with tiny usage.
- Custom implementations of built-in behavior.
- Dead code, unused configuration, and stale scripts.

Return a ranked list with:

- Location.
- What is overbuilt.
- The smaller replacement.
- Expected impact or risk.

Keep the report compact and deletion-oriented.
