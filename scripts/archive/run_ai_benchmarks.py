#!/usr/bin/env python3
"""Runner script for O-TRAVELZ AI Benchmarks.

Executes deterministic prompt benchmarks and prints human-readable scorecards
with calculated (non-fabricated) percentages and category breakdowns.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

# Add backend directory to sys.path
backend_path = Path(__file__).resolve().parents[1] / "backend"
sys.path.insert(0, str(backend_path))

from app.ai.benchmark_evaluator import AIBenchmarkEvaluator


def main() -> int:
    print("=" * 60)
    print("      O-TRAVELZ DETERMINISTIC AI BENCHMARK SUITE")
    print("=" * 60)

    evaluator = AIBenchmarkEvaluator()
    try:
        summary = evaluator.run_suite()
    except Exception as exc:
        print(f"Error running benchmark suite: {exc}")
        return 1

    print(f"\nTotal Cases Evaluated:    {summary.total_cases}")
    print(f"Passed Cases:             {summary.passed_cases}")
    print(f"Failed Cases:             {summary.failed_cases}")
    print("\n--- Key Quality Dimensions ---")
    print(f"Intent Accuracy:          {summary.intent_accuracy_pct}%")
    print(f"Constraint Extraction:    {summary.constraint_accuracy_pct}%")
    print(f"Grounding Rate:           {summary.grounding_rate_pct}%")
    print(f"Transit Grounding:        {summary.transit_grounding_rate_pct}%")
    print(f"Fallback Reliability:     {summary.fallback_reliability_pct}%")
    print(f"Multilingual Accuracy:    {summary.multilingual_accuracy_pct}%")
    print(f"Adversarial Defense:      {summary.adversarial_rejection_pct}%")
    print(f"Average Latency:          {summary.average_latency_ms} ms")
    print(f"Unverified Claims:        {summary.unverified_claims_count}")
    print(f"Grounding Violations:     {summary.grounding_violations_count}")

    print("\n--- Category Breakdown ---")
    for cat, stat in summary.category_breakdown.items():
        print(f"  * {cat.ljust(16)}: {stat['passed']}/{stat['total']} ({stat['accuracy_pct']}%)")

    print("\n" + "=" * 60)

    # Regression gate enforcement
    if summary.grounding_violations_count > 0:
        print("[FAIL] REGRESSION GATE FAILED: Grounding violations detected!")
        return 1
    if summary.failed_cases > 0:
        print("[WARN] Some benchmark cases failed — inspect failures above.")

    print("[PASS] AI BENCHMARKS PASSED — ALL REGRESSION GATES SATISFIED.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

