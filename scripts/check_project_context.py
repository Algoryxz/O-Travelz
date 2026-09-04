#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/check_project_context.py

Verifies that required O-TRAVELZ context and documentation files exist
and that cross-references between them are internally consistent.

Usage:
    python scripts/check_project_context.py

Returns exit code 0 if all checks pass, 1 if any required file is missing,
2 if any optional check fails (warnings only, exit 0).
"""
from __future__ import annotations

import sys
from pathlib import Path

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

REPO_ROOT = Path(__file__).resolve().parent.parent

REQUIRED_FILES: list[tuple[str, str]] = [
    ("PROJECT_CONTEXT.md", "Primary canonical context — must always exist"),
    ("AGENTS.md", "Coding agent operating rules — must always exist"),
    ("docs/archive/ROUND2_TEAM.md", "Historical team roles, ownership, and regional research assignments (archived)"),
    ("ROUND2_PLAN.md", "Implementation checkpoint tracker — must always exist"),
    ("SYSTEM_DESIGN.md", "Service boundary documentation"),
    ("DATA_QUALITY.md", "Publishability and image pipeline rules"),
    ("TRANSIT_DATA.md", "Transit data model and canonical stop specification"),
    ("DEMO_RUNBOOK.md", "Demo startup and fallback procedures"),
    ("CLAUDE.md", "Claude/Claude Code entry point"),
    ("GEMINI.md", "Gemini/Antigravity entry point"),
    (".github/copilot-instructions.md", "GitHub Copilot / Cursor / Windsurf entry point"),
    ("project-map.yaml", "Canonical project map"),
    ("docs/v4/PRODUCT.md", "Authoritative PRD & Anti-vibe-code rules"),
    ("docs/v4/ARCHITECTURE.md", "System architecture & boundaries"),
    ("docs/v4/DATA_AND_CONTRACTS.md", "Canonical data model & source of truth"),
    ("docs/v4/DESIGN.md", "Modern Odisha Cultural Atlas design system"),
    ("docs/v4/MAPS_AND_TRANSPORT.md", "Maps, routing & transit specifications"),
    ("docs/v4/MEDIA_LANGUAGE_VOICE.md", "Media pipelines & localization"),
    ("docs/v4/SKILLS_AND_TOOLING.md", "Approved agent skills & tooling"),
    ("docs/v4/RELEASE_AND_QA.md", "Release readiness & test suites"),
    ("docs/v4/ROADMAP.md", "Master implementation roadmap"),
    ("docs/v4/adr/ADR-001_MAP_STACK_DECISION.md", "ADR-001 Map Stack Decision"),
    ("data/research/round2/schema/candidate.schema.json", "Round 2 research candidate schema"),
    ("data/research/round2/schema/source.schema.json", "Round 2 research source schema"),
]

OPTIONAL_CROSS_REFERENCES: list[tuple[str, str, str]] = [
    # (source_file, expected_string_in_file, description)
    ("AGENTS.md", "PROJECT_CONTEXT.md", "AGENTS.md should reference PROJECT_CONTEXT.md"),
    ("CLAUDE.md", "PROJECT_CONTEXT.md", "CLAUDE.md should reference PROJECT_CONTEXT.md"),
    ("GEMINI.md", "PROJECT_CONTEXT.md", "GEMINI.md should reference PROJECT_CONTEXT.md"),
    (".github/copilot-instructions.md", "PROJECT_CONTEXT.md", "Copilot instructions should reference PROJECT_CONTEXT.md"),
    ("ROUND2_PLAN.md", "Checkpoint 1", "ROUND2_PLAN.md should contain checkpoint structure"),
    ("TRANSIT_DATA.md", "VERIFIED_GEOSPATIAL", "TRANSIT_DATA.md should document verification statuses"),
    ("DATA_QUALITY.md", "NO VERIFIED IMAGE", "DATA_QUALITY.md should contain the hard publishability rule"),
]


# ---------------------------------------------------------------------------
# Checks
# ---------------------------------------------------------------------------

def check_required_files() -> list[str]:
    """Return a list of error messages for missing required files."""
    errors: list[str] = []
    for rel_path, description in REQUIRED_FILES:
        full_path = REPO_ROOT / rel_path
        if not full_path.exists():
            errors.append(f"MISSING: {rel_path}  ({description})")
        elif full_path.stat().st_size == 0:
            errors.append(f"EMPTY:   {rel_path}  ({description})")
    return errors


def check_cross_references() -> list[str]:
    """Return a list of warning messages for missing cross-references."""
    warnings: list[str] = []
    for rel_path, expected_string, description in OPTIONAL_CROSS_REFERENCES:
        full_path = REPO_ROOT / rel_path
        if not full_path.exists():
            continue  # already caught by required-files check
        content = full_path.read_text(encoding="utf-8", errors="replace")
        if expected_string not in content:
            warnings.append(f"WARN: '{expected_string}' not found in {rel_path}  ({description})")
    return warnings


def check_no_content_duplication() -> list[str]:
    """
    Heuristic: tool-specific entry files (CLAUDE.md, GEMINI.md, copilot-instructions.md)
    should be short pointer files, not duplicates of PROJECT_CONTEXT.md.
    Warn if any entry file exceeds 200 lines.
    """
    warnings: list[str] = []
    pointer_files = ["CLAUDE.md", "GEMINI.md", ".github/copilot-instructions.md"]
    for rel_path in pointer_files:
        full_path = REPO_ROOT / rel_path
        if not full_path.exists():
            continue
        lines = full_path.read_text(encoding="utf-8", errors="replace").splitlines()
        if len(lines) > 200:
            warnings.append(
                f"WARN: {rel_path} has {len(lines)} lines — "
                "tool-specific entry files should be concise pointers, not full context copies."
            )
    return warnings


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main() -> int:
    print("=" * 60)
    print("O-TRAVELZ Context File Check")
    print(f"Repository root: {REPO_ROOT}")
    print("=" * 60)

    errors = check_required_files()
    warnings = check_cross_references()
    warnings += check_no_content_duplication()

    # Report errors
    if errors:
        print(f"\n[FAIL] ERRORS ({len(errors)}) -- required files missing or empty:\n")
        for e in errors:
            print(f"  {e}")
    else:
        print(f"\n[OK] All {len(REQUIRED_FILES)} required context files present.\n")

    # Report warnings
    if warnings:
        print(f"[WARN] ({len(warnings)}) -- optional checks failed:\n")
        for w in warnings:
            print(f"  {w}")
    else:
        print("[OK] All cross-reference checks passed.")

    print("\n" + "=" * 60)

    if errors:
        print("RESULT: FAIL -- fix missing files before committing.")
        return 1

    if warnings:
        print("RESULT: PASS WITH WARNINGS -- review warnings above.")
    else:
        print("RESULT: PASS -- all checks succeeded.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
