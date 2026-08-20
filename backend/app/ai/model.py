"""Provider-neutral model adapter returning structured claims."""
from __future__ import annotations

import re
from typing import Any

from app.ai.schemas import AIIntent, Clarification, IntentKind, PlanningConstraints


class ModelAdapter:
    def parse_intent(self, user_message: str, existing_constraints: PlanningConstraints | None = None) -> Any:
        raise NotImplementedError

    def generate_response(self, context: Any) -> Any:
        raise NotImplementedError


class FakeModelAdapter(ModelAdapter):
    """Deterministic adapter used by unit and orchestration tests."""

    def __init__(
        self,
        intent: dict[str, Any] | None = None,
        final_response: dict[str, Any] | None = None,
        raw_intent: dict[str, Any] | None = None,
        raw_response: dict[str, Any] | None = None,
    ):
        self.raw_intent = intent if intent is not None else (raw_intent or {
            "kind": IntentKind.PLANNING.value,
            "constraints": {"days": 1, "interests": ["heritage"]},
            "tool_calls": [{"name": "build_itinerary", "arguments": {}}],
        })
        self.raw_response = final_response if final_response is not None else (raw_response or {
            "framing": "grounded_result",
            "claims": [
                {"fact_id": "stop:1:name", "value": "Lingaraj Temple"},
                {"fact_id": "hop:1:mode", "value": "walk"},
            ],
        })

    def parse_intent(self, user_message: str, existing_constraints: PlanningConstraints | None = None) -> Any:
        return self.raw_intent

    def generate_response(self, context: Any) -> Any:
        return self.raw_response


class RuleBasedModelAdapter(ModelAdapter):
    """Deterministic intent parser recognizing Whole-Odisha destinations and travel themes."""

    _INTERESTS = (
        "heritage",
        "temple",
        "culture",
        "nature",
        "wildlife",
        "beach",
        "waterfall",
        "food",
        "shopping",
        "monument",
        "lake",
    )

    _KNOWN_PLACES: tuple[tuple[str, tuple[str, ...]], ...] = (
        ("Lingaraj Temple", ("lingaraj", "lingaraja")),
        ("Mukteswar Temple", ("mukteswar", "muktesvara")),
        ("Rajarani Temple", ("rajarani", "raja rani")),
        ("Dhauli Shanti Stupa", ("dhauli", "shanti stupa", "peace pagoda")),
        ("Udayagiri and Khandagiri Caves", ("udayagiri", "khandagiri", "caves")),
        ("Nandankanan Zoological Park", ("nandankanan", "zoo")),
        ("Odisha State Museum", ("state museum", "bhubaneswar museum")),
        ("Ekamra Haat", ("ekamra haat", "crafts market")),
        ("Bindu Sagar Lake", ("bindu sagar", "bindusagar")),
        ("Bhubaneswar", ("bhubaneswar", "capital", "old town")),
        ("Puri Golden Beach", ("puri beach", "golden beach", "puri sea beach")),
        ("Jagannath Temple, Puri", ("jagannath", "puri temple", "shree jagannath")),
        ("Gundicha Temple, Puri", ("gundicha",)),
        ("Swargadwar Beach", ("swargadwar",)),
        ("Puri", ("puri",)),
        ("Konark Sun Temple", ("konark sun temple", "black pagoda", "sun temple")),
        ("Chandrabhaga Beach", ("chandrabhaga", "konark beach")),
        ("Ramachandi Beach & Temple", ("ramachandi",)),
        ("Konark Archaeological Museum", ("konark museum",)),
        ("Konark", ("konark",)),
        ("Chilika Lake - Satapada", ("chilika", "satapada", "dolphin sanctuary")),
        ("Kalijai Island, Chilika", ("kalijai", "kalijai temple")),
        ("Mangalajodi Bird Sanctuary", ("mangalajodi", "bird sanctuary")),
        ("Barabati Fort", ("barabati", "barabati fort")),
        ("Cuttack Chandi Temple", ("cuttack chandi", "chandi temple")),
        ("Netaji Birthplace Museum", ("netaji museum", "netaji birthplace")),
        ("Odisha Maritime Museum", ("maritime museum", "cuttack maritime")),
        ("Cuttack", ("cuttack", "silver city")),
        ("Gopalpur Beach", ("gopalpur", "gopalpur-on-sea")),
        ("Tara Tarini Temple", ("tara tarini", "taratarini")),
        ("Tampara Lake", ("tampara", "tampara lake")),
        ("Daringbadi Hill Station", ("daringbadi hill station", "kashmir of odisha")),
        ("Coffee Gardens, Daringbadi", ("coffee garden", "coffee gardens")),
        ("Midubanda Waterfall", ("midubanda", "daringbadi waterfall")),
        ("Belghar Nature Camp", ("belghar", "belghar sanctuary")),
        ("Daringbadi", ("daringbadi", "kandhamal")),
        ("Samaleswari Temple, Sambalpur", ("samaleswari", "samaleswari temple")),
        ("Hirakud Dam & Reservoir", ("hirakud", "hirakud dam")),
        ("Huma Leaning Temple", ("huma", "leaning temple")),
        ("Debrigarh Wildlife Sanctuary", ("debrigarh",)),
        ("Sambalpur", ("sambalpur",)),
        ("Hanuman Vatika, Rourkela", ("hanuman vatika",)),
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
        ("Koraput", ("koraput",)),
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

        day_match = re.search(r"(\d+)\s*[- ]?day", text)
        found_interests = [word for word in self._INTERESTS if word in text]

        refinement_words = (
            "refine",
            "more",
            "add",
            "focused",
            "extend",
            "change",
            "switch",
            "reduce",
            "budget",
            "less",
        )

        # 1. Existing constraints present -> conversational refinement
        if existing_constraints is not None:
            # Check for general Q&A / ambiguous questions that are not modifications
            if text in ("tell me about nature", "tell me about puri", "what is daringbadi", "help", "hello", "hi"):
                return {
                    "kind": IntentKind.CLARIFICATION.value,
                    "clarification": {
                        "question": "How many days should I plan, and which Odisha region or themes (e.g. Puri, Konark, Chilika, Daringbadi, Sambalpur, Koraput, Heritage, Beaches, Nature) would you like to explore?",
                        "reason": "The request does not include enough supported planning detail.",
                    },
                }

            update_payload: dict[str, Any] = {}
            if day_match:
                update_payload["days"] = int(day_match.group(1))

            if detected_start and detected_start != existing_constraints.start:
                update_payload["start"] = detected_start

            if "change" in text or "switch" in text or "only" in text:
                if found_interests:
                    update_payload["interests"] = found_interests
            elif found_interests:
                merged = list(existing_constraints.interests or [])
                for theme in found_interests:
                    if theme not in merged:
                        merged.append(theme)
                update_payload["interests"] = merged

            # If user explicitly used refinement words or modified parameters
            is_refinement = (
                bool(update_payload)
                or any(w in text for w in refinement_words)
                or bool(day_match)
                or bool(detected_start)
            )

            if is_refinement:
                if not update_payload:
                    update_payload = {"interests": list(existing_constraints.interests or [])}
                return {
                    "kind": IntentKind.REFINEMENT.value,
                    "constraint_update": update_payload,
                    "tool_calls": [{"name": "build_itinerary", "arguments": {}}],
                }

        # 2. No existing constraints -> check if user is asking to refine without context
        if any(w in text for w in refinement_words) and not day_match and not detected_start:
            return {
                "kind": IntentKind.CLARIFICATION.value,
                "clarification": {
                    "question": "Which existing itinerary should I refine?",
                    "reason": "A refinement needs current constraints.",
                },
            }

        # 3. New planning request from scratch
        if day_match or detected_start or found_interests:
            days = int(day_match.group(1)) if day_match else 2
            constraints: dict[str, Any] = {"days": days, "interests": found_interests}
            if detected_start:
                constraints["start"] = detected_start

            return {
                "kind": IntentKind.PLANNING.value,
                "constraints": constraints,
                "tool_calls": [{"name": "build_itinerary", "arguments": {}}],
            }

        # 4. Handle Q&A / Clarification about Odisha destinations
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
