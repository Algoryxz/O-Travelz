"""Provider-neutral model boundary and deterministic test implementations."""
from __future__ import annotations

import re
from typing import Any, Protocol

from app.ai.schemas import IntentKind
from app.schemas.common import PlanningConstraints


class ModelAdapter(Protocol):
    """The only interface the orchestrator needs from a model provider."""

    def parse_intent(
        self,
        user_message: str,
        existing_constraints: PlanningConstraints | None = None,
    ) -> Any: ...

    def generate_response(self, context: Any) -> Any: ...


class FakeModelAdapter:
    """Scriptable, network-free model used by transcript tests.

    Values are intentionally returned without pre-validation so tests can
    reproduce malformed provider output and verify the orchestrator boundary.
    """

    def __init__(
        self,
        intent: Any | None = None,
        final_response: Any | None = None,
        *,
        intents: list[Any] | None = None,
        responses: list[Any] | None = None,
    ):
        self._intents = list(intents or ([] if intent is None else [intent]))
        self._responses = list(responses or ([] if final_response is None else [final_response]))

    def parse_intent(self, user_message: str, existing_constraints: PlanningConstraints | None = None) -> Any:
        if self._intents:
            return self._intents.pop(0)
        return {
            "kind": IntentKind.CLARIFICATION.value,
            "clarification": {
                "question": "What itinerary would you like me to plan?",
                "reason": "The test model has no scripted intent.",
            },
        }

    def generate_response(self, context: Any) -> Any:
        if self._responses:
            return self._responses.pop(0)
        return {"framing": "grounded_result", "claims": []}


class RuleBasedModelAdapter:
    """Grounded local model adapter for Odisha travel planning and conversational refinement.

    Recognizes travel durations, destinations, starting points, and themes across
    all supported regions of Odisha (Coastal, Central, Southern, Western, Northern,
    and Tribal Highlands).
    """

    _INTERESTS = (
        "heritage",
        "food",
        "temple",
        "history",
        "culture",
        "nature",
        "beach",
        "wildlife",
        "waterfall",
        "monument",
        "lake",
        "park",
        "sports",
        "market",
        "museum",
    )

    _KNOWN_PLACES = (
        ("Lingaraj Temple", ("lingaraj", "lingaraj temple")),
        ("Mukteswar Temple", ("mukteswar", "mukteshwar")),
        ("Rajarani Temple", ("rajarani",)),
        ("Udayagiri and Khandagiri Caves", ("khandagiri", "udayagiri", "caves")),
        ("Dhauli Shanti Stupa", ("dhauli", "peace pagoda", "shanti stupa")),
        ("Nandankanan Zoological Park", ("nandankanan", "zoo")),
        ("Odisha State Museum", ("state museum",)),
        ("Odisha Crafts Museum Kala Bhoomi", ("kala bhoomi", "crafts museum")),
        ("Ekamra Haat", ("ekamra haat",)),
        ("Kalinga Stadium", ("kalinga stadium",)),
        ("Jagannath Temple, Puri", ("jagannath", "jagannatha", "puri temple")),
        ("Puri Golden Beach", ("puri beach", "golden beach", "puri")),
        ("Gundicha Temple", ("gundicha",)),
        ("Swargadwar Beach", ("swargadwar",)),
        ("Konark Sun Temple", ("konark", "sun temple", "black pagoda")),
        ("Chandrabhaga Beach", ("chandrabhaga",)),
        ("Ramachandi Beach & Temple", ("ramachandi",)),
        ("Barabati Fort", ("barabati", "cuttack fort")),
        ("Cuttack Chandi Temple", ("cuttack chandi", "chandi temple")),
        ("Odisha State Maritime Museum", ("maritime museum",)),
        ("Netaji Birth Place Museum", ("netaji museum", "netaji birth place")),
        ("Chilika Lake - Satapada", ("chilika", "satapada", "dolphin sanctuary")),
        ("Kalijai Island Temple, Chilika", ("kalijai", "kalijai island")),
        ("Mangalajodi Bird Sanctuary", ("mangalajodi", "bird sanctuary")),
        ("Gopalpur-on-Sea Beach", ("gopalpur", "gopalpur beach")),
        ("Tara Tarini Temple", ("tara tarini", "taratarini")),
        ("Daringbadi Hill Station", ("daringbadi", "kashmir of odisha")),
        ("Midubanda Waterfall, Daringbadi", ("midubanda", "daringbadi waterfall")),
        ("Coffee Gardens, Daringbadi", ("coffee garden", "coffee plantations")),
        ("Belghar Nature Camp", ("belghar",)),
        ("Hirakud Dam & Reservoir", ("hirakud", "hirakud dam")),
        ("Samaleswari Temple, Sambalpur", ("samaleswari", "samaleswari temple", "sambalpur")),
        ("Huma Leaning Temple", ("huma", "leaning temple")),
        ("Debrigarh Wildlife Sanctuary", ("debrigarh",)),
        ("Hanuman Vatika, Rourkela", ("hanuman vatika", "rourkela")),
        ("Mandira Dam, Sundargarh", ("mandira dam", "sundargarh")),
        ("Khandadhar Waterfall, Sundargarh", ("khandadhar",)),
        ("Similipal National Park", ("similipal", "mayurbhanj tiger reserve")),
        ("Barehipani & Joranda Falls", ("barehipani", "joranda")),
        ("Chandipur Beach", ("chandipur", "balasore beach")),
        ("Bhitarkanika National Park", ("bhitarkanika", "mangrove", "crocodiles")),
        ("Gupteswar Cave Temple, Koraput", ("gupteswar", "gupteswar cave")),
        ("Duduma Waterfall", ("duduma", "machkund")),
        ("Deomali Peak, Koraput", ("deomali", "highest peak")),
        ("Tribal Museum, Koraput", ("koraput tribal museum", "koraput museum")),
        ("Kolab Reservoir & Botanical Garden", ("kolab", "kolab dam", "jeypore")),
        ("Maa Majhigouri Temple, Rayagada", ("majhigouri", "rayagada")),
    )

    def parse_intent(self, user_message: str, existing_constraints: PlanningConstraints | None = None) -> Any:
        text = user_message.strip().lower()

        # Handle unsupported preferences
        if "less walking" in text or "avoid walking" in text or ("walking" in text and "less" in text):
            return {
                "kind": IntentKind.UNSUPPORTED.value,
                "reason": "The current planner cannot optimize walking distance yet.",
            }

        # Resolve starting location if mentioned
        detected_start: str | None = None
        for canonical_name, aliases in self._KNOWN_PLACES:
            if any(alias in text for alias in aliases):
                if any(kw in text for kw in ("start from", "start at", "from", "around", "near", "in")):
                    detected_start = canonical_name
                    break

        if ("start from" in text or "start at" in text or "hotel" in text) and not detected_start:
            return {
                "kind": IntentKind.CLARIFICATION.value,
                "clarification": {
                    "question": "Which verified hotel or Odisha location would you like to start from? (e.g. Bhubaneswar, Puri, Konark, Daringbadi, Sambalpur, Koraput)",
                    "reason": "The requested starting location could not be resolved to a verified place in our database.",
                },
            }

        # Handle conversational refinements
        refinement_triggers = (
            "refine",
            "more food",
            "food focused",
            "food-focused",
            "add nature",
            "more nature",
            "add temples",
            "more temples",
            "add beach",
            "more beach",
            "add heritage",
            "change interest",
            "switch to",
        )
        if any(trigger in text for trigger in refinement_triggers) or (existing_constraints and detected_start and "day" not in text):
            if existing_constraints is None:
                return {
                    "kind": IntentKind.CLARIFICATION.value,
                    "clarification": {
                        "question": "Which existing itinerary should I refine?",
                        "reason": "A refinement needs current constraints.",
                    },
                }

            # Determine updated interests or starting point
            new_interests = list(existing_constraints.interests or [])
            for theme in self._INTERESTS:
                if theme in text and theme not in new_interests:
                    new_interests.append(theme)

            update_payload: dict[str, Any] = {}
            if new_interests:
                update_payload["interests"] = new_interests
            if detected_start:
                update_payload["start"] = detected_start

            return {
                "kind": IntentKind.REFINEMENT.value,
                "constraint_update": update_payload,
                "tool_calls": [{"name": "build_itinerary", "arguments": {}}],
            }

        # Handle planning intent (e.g. "2 days in Koraput", "3 day heritage trip around Puri")
        day_match = re.search(r"(\d+)\s*[- ]?day", text)
        interests = [word for word in self._INTERESTS if word in text]

        if day_match:
            days = int(day_match.group(1))
            constraints: dict[str, Any] = {"days": days, "interests": interests}
            if detected_start:
                constraints["start"] = detected_start

            return {
                "kind": IntentKind.PLANNING.value,
                "constraints": constraints,
                "tool_calls": [{"name": "build_itinerary", "arguments": {}}],
            }

        if detected_start:
            constraints = {"days": 2, "interests": interests, "start": detected_start}
            return {
                "kind": IntentKind.PLANNING.value,
                "constraints": constraints,
                "tool_calls": [{"name": "build_itinerary", "arguments": {}}],
            }

        # Handle Q&A / Clarification about Odisha destinations
        return {
            "kind": IntentKind.CLARIFICATION.value,
            "clarification": {
                "question": "How many days should I plan, and which Odisha region or themes (e.g. Puri, Konark, Chilika, Daringbadi, Sambalpur, Koraput, Heritage, Beaches, Nature) would you like to explore?",
                "reason": "The request does not include enough supported planning detail.",
            },
        }

    def generate_response(self, context: Any) -> Any:
        claims = [{"fact_id": fact_id, "value": fact.value} for fact_id, fact in context.facts.items()]
        return {"framing": "grounded_result", "claims": claims}
