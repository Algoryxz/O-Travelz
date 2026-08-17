import sys
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parents[2] / "scripts"
if str(SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPTS_DIR))

from data_validation import validate_transport_fare, validate_transport_schedule  # noqa: E402


def test_schedule_preflight_uses_schedule_shape():
    report = validate_transport_schedule(
        {
            "provider": "AMA Bus / Mo Bus",
            "source": "https://example.test/schedule",
            "verified_on": "2026-08-17",
            "data_tier": "scheduled",
            "routes": [],
        },
        "ama_bus_schedule.json",
    )
    assert report.valid


def test_fare_preflight_allows_explicitly_unknown_amount():
    report = validate_transport_fare(
        {
            "provider": "AMA Bus / Mo Bus",
            "fare_type": "dynamic_rule",
            "amount_inr": None,
            "source": "https://example.test/fare",
            "verified_on": "2026-08-17",
        },
        "ama_bus_fares.json",
    )
    assert report.valid
