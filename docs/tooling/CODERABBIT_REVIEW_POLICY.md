# CodeRabbit Review Policy & Integration — O-TRAVELZ

## Overview

CodeRabbit operates as an **Independent Automated PR Review Gate** for O-TRAVELZ. It enforces codebase safety, architecture integrity, and truth contracts on all incoming pull requests and branch diffs.

---

## Integration Baseline

- **VS Code Extension**: `coderabbit.coderabbit-vscode` (v0.21.6)
- **Antigravity Extension**: `coderabbit.coderabbit-vscode-0.21.6-universal`
- **Repository Configuration**: `.coderabbit.yaml`
- **Integration Role**: PR Review Gate (Advisory & Static Analysis), NOT primary implementation agent.

---

## Core Review Focus Areas

CodeRabbit reviews pull requests against the following domain criteria:

1. **Deterministic Truth Contracts**:
   - Verify that bus fares are strictly `null` unless backed by official ingested fare matrices.
   - Ensure timetable data is never described as "live GPS tracking" or "real-time telemetry".
   - Confirm coordinates and transit stops match canonical sources in `data/transport/canonical/`.
   - Block any attempt to introduce synthetic reviews, fake ratings, or AI-generated tourist imagery.

2. **Mobile Architecture & Safety (KMP, Android & iOS)**:
   - **Kotlin / Jetpack Compose**: Recomposition churn, unremembered state, MainThread disk/network I/O, coroutine cancellation leaks.
   - **Swift / SwiftUI**: Retain cycles, `@Observable` churn, MainActor isolation, Swift Concurrency race conditions.
   - **Persistence**: Room / SwiftData schema migration safety, non-destructive fallback handling.
   - **Networking**: Ktor / URLSession timeout configuration, offline caching, idempotent retry logic.

3. **Code Quality & Ponytail Simplicity**:
   - Detect dead code, unused abstractions, over-engineered wrapper patterns, and speculative complexity.
   - Prefer Kotlin/Swift standard library primitives over redundant external libraries.

4. **Security & Secrets Hygiene**:
   - Enforce zero leaked API keys, tokens, or private credentials in diffs.

---

## Reconciling CodeRabbit Suggestions

- **Proposals, Not Automatic Commits**: CodeRabbit suggestions are advisory findings. They do not automatically override project architecture or truth contracts.
- **Verification Rule**: A human engineer or active primary agent must reconcile each comment against repository ground truth before adopting diffs.