"""Provider-neutral model adapter returning structured claims."""
from __future__ import annotations

import re
from typing import Any

from app.ai.multilingual import (
    detect_language,
    extract_multilingual_days,
    extract_multilingual_interests,
    extract_multilingual_preferences,
    is_refinement_query,
    resolve_multilingual_location,
)
from app.ai.schemas import AIIntent, Clarification, IntentKind, PlanningConstraints
from app.data.odisha_districts import ODISHA_DISTRICTS
from app.services.search.search_normalizer import VERIFIED_ALIASES, extract_search_intent, normalize_text




class ModelAdapter:
    def parse_intent(
        self,
        user_message: str,
        existing_constraints: PlanningConstraints | None = None,
        app_context: Any = None,
    ) -> Any:
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

    def parse_intent(
        self,
        user_message: str,
        existing_constraints: PlanningConstraints | None = None,
        app_context: Any = None,
    ) -> Any:
        return self.raw_intent

    def generate_response(self, context: Any) -> Any:
        return self.raw_response



class RuleBasedModelAdapter(ModelAdapter):
    """Deterministic intent parser recognizing Whole-Odisha destinations and canonical travel themes."""

    _CANONICAL_INTERESTS: tuple[str, ...] = (
        "heritage",
        "spirituality",
        "architecture",
        "food",
        "culture",
        "nature",
        "beach",
        "wildlife",
        "waterfall",
        "relaxation",
        "adventure",
        "shopping",
    )

    _INTEREST_KEYWORD_MAPPINGS: tuple[tuple[str, tuple[str, ...]], ...] = (
        ("heritage", ("heritage", "historic", "historical", "monument", "monuments", "aitihasika", "ଐତିହାସିକ", "ऐतिहासिक")),
        ("spirituality", ("spirituality", "spiritual", "temple", "temples", "mandir", "shrine", "shrines", "pilgrimage", "ଦେବସ୍ଥାନ", "ମନ୍ଦିର", "मंदिर", "तीर्थ")),
        ("architecture", ("architecture", "architectural", "ଶିଳ୍ପକଳା", "ସ୍ଥାପତ୍ୟ")),
        ("food", ("food", "cuisine", "culinary", "sweets", "lunch", "dinner", "breakfast", "snacks", "restaurant", "restaurants", "dhaba", "rasgulla", "chhena poda", "kora khai", "khaja", "odisha food", "odia food", "ଖାଦ୍ୟ", "ମଧ୍ୟାହ୍ନ ଭୋଜନ", "ଭୋଜନ", "ରସଗୋଲା", "ଛେନାପୋଡ଼", "खाना", "लंच", "भोजन", "मिठाई")),
        ("culture", ("culture", "cultural", "museum", "museums", "arts", "tradition", "traditional", "ସଂସ୍କୃତି", "କଳା", "संस्कृति")),
        ("nature", ("nature", "natural", "hill station", "hills", "forest", "lake", "lakes", "ପ୍ରକୃତି", "ପ୍ରାକୃତିକ", "प्रकृति")),
        ("beach", ("beach", "beaches", "coast", "coastal", "sea", "sea beach", "ବେଳାଭୂମି", "ସମୁଦ୍ର", "तट", "समुद्र तट")),
        ("wildlife", ("wildlife", "safari", "sanctuary", "zoo", "animals", "birds", "ବନ୍ୟଜନ୍ତୁ", "ପଶୁପକ୍ଷୀ", "वन्यजीव")),
        ("waterfall", ("waterfall", "waterfalls", "falls", "cascade", "ଜଳପ୍ରପାତ", "झरना")),
        ("relaxation", ("relaxation", "relaxing", "relax", "peaceful", "leisure", "ବିଶ୍ରାମ", "ଶାନ୍ତ", "विश्राम")),
        ("adventure", ("adventure", "trekking", "hiking", "ସାହସିକ", "रोमांच")),
        ("shopping", ("shopping", "market", "markets", "crafts", "bazaar", "handlooms", "କିଣାକିଣି", "ହାଟ", "बाज़ार")),
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
        ("Pahala Rasgulla Hub", ("pahala", "pahala rasgulla", "rasgulla")),
        ("Bhubaneswar", ("bbsr", "bhubaneswar", "capital", "old town")),
        ("Puri Golden Beach", ("puri beach", "golden beach", "puri sea beach")),
        ("Jagannath Temple, Puri", ("jagannath", "puri temple", "shree jagannath")),
        ("Gundicha Temple, Puri", ("gundicha",)),
        ("Swargadwar Beach", ("swargadwar",)),
        ("Puri", ("puri", "poori", "shrikhetra", "jagannath dham")),
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
        ("Cuttack", ("ctc", "cuttack", "silver city")),
        ("Gopalpur Beach", ("gopalpur", "gopalpur-on-sea")),
        ("Tara Tarini Temple", ("tara tarini", "taratarini")),
        ("Tampara Lake", ("tampara", "tampara lake")),
        ("Sambalpur", ("sambalpur", "samalpur", "hirakud")),

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

    def _extract_interests(self, text: str) -> list[str]:
        found: list[str] = []
        for canonical_id, keywords in self._INTEREST_KEYWORD_MAPPINGS:
            for kw in keywords:
                pattern = r"\b" + re.escape(kw) + r"\b"
                if re.search(pattern, text):
                    if canonical_id not in found:
                        found.append(canonical_id)
                    break

        # Also extract multilingual interests (Odia, Hindi, mixed)
        for theme in extract_multilingual_interests(text):
            if theme not in found:
                found.append(theme)

        return found

    def _resolve_start_location(self, text: str) -> str | None:
        text_norm = normalize_text(text)

        # 1. Exact canonical district match (all 30 districts)
        for district in ODISHA_DISTRICTS:
            pattern = r"\b" + re.escape(normalize_text(district)) + r"\b"
            if re.search(pattern, text_norm):
                return district

        # 2. Check known places & aliases
        for canonical_name, aliases in self._KNOWN_PLACES:
            if any(re.search(r"\b" + re.escape(normalize_text(alias)) + r"\b", text_norm) for alias in aliases):
                return canonical_name

        # 3. Check dedicated multilingual location resolver
        resolved = resolve_multilingual_location(text)
        if resolved:
            return resolved

        # 4. Check known aliases
        for alias_key, expansions in VERIFIED_ALIASES.items():
            if normalize_text(alias_key) in text_norm:
                return expansions[0]

        return None



    def parse_intent(
        self,
        user_message: str,
        existing_constraints: PlanningConstraints | None = None,
        app_context: Any = None,
    ) -> Any:
        text = user_message.strip()
        text_lower = text.lower()
        lang = detect_language(user_message)

        # Extract untrusted context hints safely
        ctx_dest = None
        ctx_map = None
        ctx_planner = None
        ctx_loc = None
        ctx_saved = None
        if app_context is not None:
            if hasattr(app_context, "destination"):
                ctx_dest = app_context.destination
                ctx_map = app_context.map
                ctx_planner = app_context.planner
                ctx_loc = app_context.location
                ctx_saved = app_context.saved
            elif isinstance(app_context, dict):
                ctx_dest = app_context.get("destination")
                ctx_map = app_context.get("map")
                ctx_planner = app_context.get("planner")
                ctx_loc = app_context.get("location")
                ctx_saved = app_context.get("saved")

        dest_name = (getattr(ctx_dest, "name", None) or (ctx_dest.get("name") if isinstance(ctx_dest, dict) else None)) if ctx_dest else None
        dest_district = (getattr(ctx_dest, "district", None) or (ctx_dest.get("district") if isinstance(ctx_dest, dict) else None)) if ctx_dest else None
        dest_cat = (getattr(ctx_dest, "category", None) or (ctx_dest.get("category") if isinstance(ctx_dest, dict) else None)) if ctx_dest else None

        loc_city = (getattr(ctx_loc, "city", None) or (ctx_loc.get("city") if isinstance(ctx_loc, dict) else None)) if ctx_loc else None
        loc_district = (getattr(ctx_loc, "district", None) or (ctx_loc.get("district") if isinstance(ctx_loc, dict) else None)) if ctx_loc else None

        map_mode = (getattr(ctx_map, "mode", None) or (ctx_map.get("mode") if isinstance(ctx_map, dict) else None)) if ctx_map else None
        map_route_name = (getattr(ctx_map, "selected_route_name", None) or (ctx_map.get("selected_route_name") if isinstance(ctx_map, dict) else None)) if ctx_map else None

        planner_days = (getattr(ctx_planner, "days", None) or (ctx_planner.get("days") if isinstance(ctx_planner, dict) else None)) if ctx_planner else None
        planner_start = (getattr(ctx_planner, "start", None) or (ctx_planner.get("start") if isinstance(ctx_planner, dict) else None)) if ctx_planner else None
        planner_interests = (getattr(ctx_planner, "interests", None) or (ctx_planner.get("interests") if isinstance(ctx_planner, dict) else None)) if ctx_planner else []

        saved_sample_places = (getattr(ctx_saved, "sample_places", None) or (ctx_saved.get("sample_places") if isinstance(ctx_saved, dict) else None)) if ctx_saved else []

        # Extract structured travel preferences (avoid_crowds, low_walking, vegetarian, budget_conscious, public_transport_preferred, travel_party)
        detected_prefs = extract_multilingual_preferences(text)

        # Context-aware: Medical / Emergency query or Medical map mode
        is_medical_query = any(w in text_lower for w in ("hospital", "emergency", "medical", "doctor", "ambulance", "ଡାକ୍ତରଖାନା", "ଚିକିତ୍ସା", "ଅସ୍ପତାଲ", "अस्पताल", "इमरजेंसी", "चिकित्सा"))
        if is_medical_query or map_mode == "medical":
            med_query = dest_district or loc_city or loc_district or "Puri"
            return {
                "kind": IntentKind.PLANNING.value,
                "constraints": {"days": 1, "interests": [], **detected_prefs},
                "tool_calls": [
                    {
                        "name": "search_places",
                        "arguments": {
                            "query": med_query,
                            "district": dest_district or loc_district,
                            "is_medical": True,
                            "limit": 5,
                        },
                    }
                ],
            }

        # Context-aware: Local Single-Stop Replacement
        is_replacement_query = any(w in text_lower for w in ("replace", "swap", "something quieter instead", "quieter instead", "no temples for this stop", "change this stop", "change stop")) or (
            "ବଦଳାନ୍ତୁ" in text or "ସ୍ଥାନ ବଦଳ" in text or "बदलें" in text or "की जगह" in text
        )
        if is_replacement_query:
            # Check for ambiguous target
            cleaned_text = re.sub(r"[^\w\s]", "", text_lower).strip()
            if cleaned_text in ("replace a stop", "replace stop", "change a stop", "swap stop", "replace one stop", "change stop", "swap a stop", "ସ୍ଥାନ ବଦଳାନ୍ତୁ", "एक स्टॉप बदलें"):
                return {
                    "kind": IntentKind.CLARIFICATION.value,
                    "clarification": {
                        "question": "Which stop would you like to replace? Please specify the stop number or name.",
                        "reason": "ambiguous_stop_target",
                    },
                }

            # Determine stop sequence
            seq = 1
            if any(w in text_lower for w in ("second", "2nd", "stop 2", "ଦ୍ୱିତୀୟ", "दूसरा")):
                seq = 2
            elif any(w in text_lower for w in ("third", "3rd", "stop 3", "ତୃତୀୟ", "तीसरा")):
                seq = 3
            elif any(w in text_lower for w in ("first", "1st", "stop 1", "ପ୍ରଥମ", "पहला")):
                seq = 1
            elif "beach" in text_lower or "outdoor" in text_lower:
                seq = 2  # default outdoor stop index

            # Determine reason
            reason = "user_request"
            if any(w in text_lower for w in ("rain", "weather", "raining", "ବାଦଲ", "ବର୍ଷା", "बारिश", "मौसम")):
                reason = "weather"
            elif any(w in text_lower for w in ("quiet", "quieter", "crowd", "crowded", "less crowd", "ଶାନ୍ତ", "ଭିଡ଼", "भीड़", "शांत")):
                reason = "crowd"
            elif any(w in text_lower for w in ("walking", "tiring", "less walking", "walk", "ଚାଲିବା", "थकाऊ", "पैदल")):
                reason = "walking"
            elif any(w in text_lower for w in ("temple", "no temples", "culture", "ମନ୍ଦିର", "मंदिर")):
                reason = "interest"

            return {
                "kind": IntentKind.PLANNING.value,
                "constraints": {"days": 1, "interests": [], **detected_prefs},
                "tool_calls": [
                    {
                        "name": "replace_itinerary_stop",
                        "arguments": {
                            "day_number": 1,
                            "stop_sequence": seq,
                            "reason": reason,
                        },
                    }
                ],
            }

        # Resolve starting location if mentioned
        detected_start = self._resolve_start_location(text)

        # Context-aware: Weather query ("Will it rain in Puri?", "Weather in Bhubaneswar", "ପାଣିପାଗ", "मौसम")
        is_weather_query = any(w in text_lower for w in ("weather", "rain", "temperature", "forecast", "climate", "hot outside", "sunny", "ବାଦଲ", "ପାଣିପାଗ", "ବର୍ଷା", "ତାପମାତ୍ରା", "मौसम", "बारिश", "तापमान"))
        if is_weather_query:
            weather_loc = detected_start or dest_name or dest_district or loc_city or loc_district or "Puri"
            return {
                "kind": IntentKind.PLANNING.value,
                "constraints": {"days": 1, "interests": [], **detected_prefs},
                "tool_calls": [
                    {
                        "name": "get_weather",
                        "arguments": {"location": weather_loc},
                    }
                ],
            }

        # Context-aware: Crowd estimation query ("Is Konark crowded?", "Crowd level at Jagannath Temple", "ଭିଡ଼ କେମିତି", "क्या भीड़ होगी")
        has_crowd_term = any(w in text_lower for w in ("crowd", "crowded", "rush", "busy", "rush hour")) or ("ଭିଡ଼" in text) or ("भीड़" in text)
        is_avoid_only = any(p in text_lower for p in ("avoid crowd", "avoid crowds", "no crowd", "without crowd", "peaceful", "quiet", "ଭିଡ଼ କମ", "ଭିଡ଼ ଏଡାନ୍ତୁ", "भीड़ से बचें", "कम भीड़")) and not any(q in text_lower for q in ("is", "how", "what", "level", "when", "?", "କେମିତି", "କି", "କେତେ", "कैसी", "कितनी", "क्या"))
        is_crowd_query = has_crowd_term and not is_avoid_only
        if is_crowd_query:
            crowd_place = dest_name or detected_start or "Konark Sun Temple"
            return {
                "kind": IntentKind.PLANNING.value,
                "constraints": {"days": 1, "interests": [], **detected_prefs},
                "tool_calls": [
                    {
                        "name": "estimate_crowd",
                        "arguments": {
                            "place_name": crowd_place,
                            "arrival_time": "12:00",
                            "avoid_crowds": detected_prefs.get("avoid_crowds", False),
                        },
                    }
                ],
            }

        # Resolve starting location if mentioned
        detected_start = self._resolve_start_location(text)

        # Contextual fallback for starting location if not explicitly stated in query
        if not detected_start:
            if dest_name:
                detected_start = self._resolve_start_location(dest_name) or dest_name
            elif dest_district:
                detected_start = self._resolve_start_location(dest_district) or dest_district
            elif planner_start:
                detected_start = self._resolve_start_location(planner_start) or planner_start
            elif loc_city:
                detected_start = self._resolve_start_location(loc_city) or loc_city
            elif saved_sample_places:
                detected_start = self._resolve_start_location(saved_sample_places[0]) or saved_sample_places[0]

        detected_days = extract_multilingual_days(text)
        found_interests = self._extract_interests(text)

        # Planning Intent Priority: Queries asking to plan trips/itineraries must take priority over incidental transit keywords
        is_planning_query = any(w in text_lower for w in ("plan", "trip", "itinerary", "day trip", "1 day", "one day", "tour", "daytour", "day-tour", "guide me", "ଯୋଜନା", "ଭ୍ରମଣ", "ଦିନ", "यात्रा", "योजना")) or (detected_days is not None and bool(detected_start or found_interests))

        # Check if user query is a specific food/dish discovery query ("Where can I get Pahala Rasgulla?", "Where to eat Dahibara?")
        is_food_search = any(w in text_lower for w in ("where can i get", "where to get", "where to eat", "where is", "famous for", "best place for", "କେଉଁଠି", "କେଉଁଠାରେ", "कहाँ मिलेगा", "कहाँ मिलता")) and any(w in text_lower for w in ("rasgulla", "rasagola", "chhena poda", "kora khai", "khaja", "dahibara", "sweets", "food", "cuisine", "sweet", "ପାହାଳ", "ରସଗୋଲା", "ଛେନାପୋଡ଼"))
        if is_food_search:
            search_query = "Pahala" if any(w in text_lower for w in ("rasgulla", "rasagola", "pahala", "ରସଗୋଲା")) else "food"
            return {
                "kind": IntentKind.PLANNING.value,
                "constraints": {"days": 1, "interests": ["food"], **detected_prefs},
                "tool_calls": [
                    {
                        "name": "search_places",
                        "arguments": {
                            "query": search_query,
                            "limit": 5,
                        },
                    }
                ],
            }


        # Context-aware: Point-to-point transit routing query ("Can I take Mo Bus from X to Y?", "How to go from Puri to Konark by bus?")
        transit_keywords = ("bus", "mo bus", "transit", "train", "route", "ରୁଟ", "ବସ", "ମୋ ବସ", "बस", "रूट")
        is_point_to_point_transit = not is_planning_query and any(w in text_lower for w in transit_keywords) and (
            ("from" in text_lower and "to" in text_lower)
            or ("ରୁ" in text and "କୁ" in text)
            or ("से" in text and "तक" in text or "से" in text and "के लिए" in text)
        )
        if is_point_to_point_transit:
            # Extract origin / destination heuristics
            orig = "from_place"
            dest = "to_place"
            match_en = re.search(r"from\s+([A-Za-z\s]+?)\s+to\s+([A-Za-z\s]+)", text_lower)
            if match_en:
                orig = match_en.group(1).strip()
                dest = match_en.group(2).strip()
                # Clean filler words
                for f_word in ("by bus", "by mo bus", "bus", "today", "now"):
                    dest = dest.replace(f_word, "").strip()
            elif detected_start:
                orig = detected_start
                dest = dest_name or "Konark"

            return {
                "kind": IntentKind.PLANNING.value,
                "constraints": {"days": 1, "interests": [], **detected_prefs},
                "tool_calls": [
                    {
                        "name": "get_transit_options",
                        "arguments": {
                            "origin_id": orig,
                            "destination_id": dest,
                            "origin_name": orig,
                            "destination_name": dest,
                        },
                    }
                ],
            }

        # Context-aware: General Transit / Provider status query (only if not an itinerary planning query)
        is_transit_query = not is_planning_query and (
            any(w in text_lower for w in ("explain this route", "mo bus", "bus", "transit", "bus route", "bus timetable", "nearest stop", "transit schedule", "provider", "providers", "provider status", "ରୁଟ", "ବସ", "ରୁଟ୍", "बस", "रूट", "समय सारिणी"))
            or map_mode == "transit"
        )
        if is_transit_query:
            return {
                "kind": IntentKind.PLANNING.value,
                "constraints": {"days": 1, "interests": [], **detected_prefs},
                "tool_calls": [
                    {
                        "name": "get_provider_status",
                        "arguments": {"provider_id": "ama-bus"},
                    }
                ],
            }

        # Context-aware: Nearby Places query ("What is nearby?", "Explore nearby", "ପାଖରେ କ’ଣ ଅଛି?")
        is_nearby_query = not is_planning_query and any(w in text_lower for w in ("nearby", "near by", "near here", "around here", "explore nearby", "what is nearby", "what is near me", "near me", "what's nearby", "ପାଖରେ", "ଆଖପାଖ", "ଏଠାରେ ପାଖରେ", "पास में", "आस-पास", "निकट"))
        if is_nearby_query:
            search_target = dest_name or dest_district or loc_city or loc_district or "Bhubaneswar"
            return {
                "kind": IntentKind.PLANNING.value,
                "constraints": {"days": 1, "interests": [], **detected_prefs},
                "tool_calls": [
                    {
                        "name": "search_places",
                        "arguments": {
                            "query": search_target,
                            "district": dest_district or loc_district,
                            "limit": 6,
                        },
                    }
                ],
            }

        if ("start from" in text_lower or "start at" in text_lower or "hotel" in text_lower) and not detected_start:
            return {
                "kind": IntentKind.CLARIFICATION.value,
                "clarification": {
                    "question": (
                        "ଆପଣ କେଉଁ ଯାଞ୍ଚିତ ସ୍ଥାନରୁ ଯାତ୍ରା ଆରମ୍ଭ କରିବାକୁ ଚାହାଁନ୍ତି? (ଯଥା: ଭୁବନେଶ୍ୱର, ପୁରୀ, କୋଣାର୍କ, ଦାରିଙ୍ଗବାଡ଼ି, ସମ୍ବଲପୁର)"
                        if lang == "or"
                        else "आप किस सत्यापित स्थान से यात्रा शुरू करना चाहते हैं? (जैसे: भुवनेश्वर, पुरी, कोणार्क, दारिंगबाड़ी, संबलपुर)"
                        if lang == "hi"
                        else "Which verified hotel or Odisha location would you like to start from? (e.g. Bhubaneswar, Puri, Konark, Daringbadi, Sambalpur, Koraput)"
                    ),
                    "reason": "The requested starting location could not be resolved to a verified place in our database.",
                },
            }
        refinement_words = (
            "refine", "more", "add", "focused", "extend", "change", "switch", "reduce", "budget", "less", "optimize", "also",
            "ଆହୁରି", "ଯୋଡ଼ନ୍ତୁ", "ଯୋଡ଼", "ବଦଳାନ୍ତୁ", "ଅଧିକ", "ସଂଶୋଧନ",
            "और", "जोड़ो", "बदलो", "अधिक", "शामिल", "संशोधन", "भी",
        )

        # If existing_constraints is None but planner_ctx is present and user asks for refinement
        if existing_constraints is None and (planner_days or planner_start or planner_interests):
            if any(w in text_lower for w in refinement_words) or is_refinement_query(text):
                existing_constraints = PlanningConstraints(
                    days=planner_days or 2,
                    start=planner_start or "Bhubaneswar",
                    interests=planner_interests or [],
                )

        # 1. Existing constraints present -> conversational refinement
        if existing_constraints is not None:
            # Check for general Q&A / ambiguous questions that are not modifications
            if text_lower in ("tell me about nature", "tell me about puri", "what is daringbadi", "help", "hello", "hi"):
                return {
                    "kind": IntentKind.CLARIFICATION.value,
                    "clarification": {
                        "question": (
                            "ମୁଁ କେତେ ଦିନ ପାଇଁ ଯୋଜନା କରିବି, ଏବଂ ଆପଣ କେଉଁ ଅଞ୍ଚଳ କିମ୍ବା ଥିମ୍ ଦେଖିବାକୁ ଚାହାଁନ୍ତି?"
                            if lang == "or"
                            else "मुझे कितने दिनों के लिए योजना बनानी चाहिए, और आप कौन से क्षेत्र या थीम देखना चाहते हैं?"
                            if lang == "hi"
                            else "How many days should I plan, and which Odisha region or themes (e.g. Puri, Konark, Chilika, Daringbadi, Sambalpur, Koraput, Heritage, Beaches, Nature) would you like to explore?"
                        ),
                        "reason": "The request does not include enough supported planning detail.",
                    },
                }

            update_payload: dict[str, Any] = {}
            if detected_days:
                update_payload["days"] = detected_days

            if detected_start and detected_start != existing_constraints.start:
                update_payload["start"] = detected_start

            if "change" in text_lower or "switch" in text_lower or "only" in text_lower or "ବଦଳାନ୍ତୁ" in text or "बदलो" in text:
                if found_interests:
                    update_payload["interests"] = found_interests
            elif found_interests:
                merged = list(existing_constraints.interests or [])
                for theme in found_interests:
                    if theme not in merged:
                        merged.append(theme)
                update_payload["interests"] = merged

            # Merge newly extracted preferences into refinement update
            update_payload.update(detected_prefs)

            # If user explicitly used refinement words or modified parameters
            is_refinement = (
                bool(update_payload)
                or any(w in text_lower for w in refinement_words)
                or is_refinement_query(text)
                or bool(detected_days)
                or bool(detected_start)
                or bool(detected_prefs)
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
        if (any(w in text_lower for w in refinement_words) or is_refinement_query(text)) and not detected_days and not detected_start and not detected_prefs:
            return {
                "kind": IntentKind.CLARIFICATION.value,
                "clarification": {
                    "question": (
                        "ମୁଁ କେଉଁ ପୂର୍ବ ଯାତ୍ରା ଯୋଜନାକୁ ସଂଶୋଧନ କରିବି?"
                        if lang == "or"
                        else "मैं किस मौजूदा यात्रा कार्यक्रम को संशोधित करूँ?"
                        if lang == "hi"
                        else "Which existing itinerary should I refine?"
                    ),
                    "reason": "A refinement needs current constraints.",
                },
            }

        # 3. New planning request from scratch (or via context)
        if detected_days or detected_start or found_interests:
            days = detected_days if detected_days else 2
            constraints: dict[str, Any] = {"days": days, "interests": found_interests, **detected_prefs}
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
                "question": (
                    "ମୁଁ କେତେ ଦିନ ପାଇଁ ଯୋଜନା କରିବି, ଏବଂ ଆପଣ କେଉଁ ଅଞ୍ଚଳ କିମ୍ବା ଥିମ୍ (ଯଥା: ପୁରୀ, କୋଣାର୍କ, ଚିଲିକା, ଦାରିଙ୍ଗବାଡ଼ି, ସମ୍ବଲପୁର, କୋରାପୁଟ, ଐତିହ୍ୟ, ବେଳାଭୂମି, ପ୍ରକୃତି) ଦେଖିବାକୁ ଚାହାଁନ୍ତି?"
                    if lang == "or"
                    else "मुझे कितने दिनों के लिए योजना बनानी चाहिए, और आप ओडिशा के कौन से क्षेत्र या थीम (जैसे: पुरी, कोणार्क, चिल्का, दारिंगबाड़ी, संबलपुर, कोरापुट, विरासत, समुद्र तट, प्रकृति) देखना चाहते हैं?"
                    if lang == "hi"
                    else "How many days should I plan, and which Odisha region or themes (e.g. Puri, Konark, Chilika, Daringbadi, Sambalpur, Koraput, Heritage, Beaches, Nature) would you like to explore?"
                ),
                "reason": "The request does not include enough supported planning detail.",
            },
        }


    def generate_response(self, context: Any) -> Any:
        claims = [{"fact_id": fact_id, "value": fact.value} for fact_id, fact in context.facts.items()]
        return {"framing": "grounded_result", "claims": claims}
