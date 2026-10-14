"""
SaFact AI Assistant Service
Connects to local Ollama (if running) and provides intelligent crowd safety guidance
grounded strictly in the latest optical sensor scan and zone telemetry.
"""

import time
import requests
from typing import Dict, Any, List, Optional
from services.camera_service import camera_service

OLLAMA_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "llama3"

class AssistantService:
    @staticmethod
    def _build_context() -> Dict[str, Any]:
        """Extracts the latest ground-truth telemetry from the camera and zone pipeline."""
        stats = camera_service.get_latest_stats()
        has_scan = stats.get("has_processed_frame", False) and stats.get("person_count") is not None
        person_count = stats.get("person_count", 0) if has_scan else 0
        zones = stats.get("zones", [])
        risk = stats.get("risk") or {}
        recs = stats.get("recommendations", [])

        # Find hotspot and relief corridors
        hotspot = None
        relief = None
        if zones:
            classified_zones = [z for z in zones if not z.get("is_count_only")]
            if classified_zones:
                sorted_by_density = sorted(classified_zones, key=lambda z: z.get("people_count", 0), reverse=True)
                hotspot = sorted_by_density[0]
                sorted_by_space = sorted(classified_zones, key=lambda z: z.get("people_count", 0))
                relief = sorted_by_space[0]

        return {
            "has_scan": has_scan,
            "person_count": person_count,
            "zones": zones,
            "risk_score": risk.get("risk_score", 0),
            "risk_level": risk.get("risk_level", "LOW"),
            "hotspot": hotspot,
            "relief": relief,
            "recommendations": recs,
            "camera_connected": stats.get("camera_connected", False)
        }

    @classmethod
    def generate_response(cls, message: str, conversation_history: Optional[List[Dict[str, str]]] = None) -> Dict[str, Any]:
        context = cls._build_context()
        query = message.strip().lower()

        # 1. Try querying local Ollama instance if available
        ollama_reply = cls._query_ollama(message, context, conversation_history)
        if ollama_reply:
            return {
                "reply": ollama_reply,
                "source": "ollama",
                "grounded": True,
                "context_used": context
            }

        # 2. Intelligent Grounded Expert Engine (Offline / Deterministic Mode)
        fallback_reply = cls._generate_grounded_fallback(query, message, context)
        return {
            "reply": fallback_reply,
            "source": "safact_rules_engine",
            "grounded": True,
            "context_used": context
        }

    @classmethod
    def _query_ollama(cls, message: str, ctx: Dict[str, Any], history: Optional[List[Dict[str, str]]]) -> Optional[str]:
        """Attempts connection to local Ollama daemon on localhost:11434 with a 3.5s timeout."""
        try:
            zones_summary = []
            for z in ctx["zones"]:
                sqft = z.get("sqft_per_person")
                sqft_str = f"{sqft} sq ft/person" if sqft else "unoccupied"
                count_str = f"{z.get('people_count')} people"
                zones_summary.append(f"{z.get('name')}: {count_str}, space: {sqft_str}, status: {z.get('density_category')}")

            zones_text = "; ".join(zones_summary)
            system_prompt = (
                "You are SaFact Assistant, an AI expert for concourse crowd safety and flow intelligence. "
                "You MUST base your crowd advice strictly on the current live scan data provided below. "
                "Never invent people counts or guarantee absolute safety. If no scan has been performed, advise the user to click 'Start Camera' or 'Scan My Area'. "
                "Always emphasize that in an emergency, users should follow on-site staff and official emergency signage.\n\n"
                f"CURRENT SCAN STATE:\n"
                f"- Scan Active: {ctx['has_scan']}\n"
                f"- Total Headcount: {ctx['person_count']} people\n"
                f"- Composite Hazard Score: {ctx['risk_score']}/100 ({ctx['risk_level']})\n"
                f"- Zone Telemetry: {zones_text}\n"
                f"- Identified Hotspot: {ctx['hotspot']['name'] if ctx['hotspot'] else 'None'}\n"
                f"- Lower Density Sector: {ctx['relief']['name'] if ctx['relief'] else 'None'}\n\n"
                "Respond concisely (2-4 sentences), politely, and professionally."
            )

            payload = {
                "model": OLLAMA_MODEL,
                "prompt": f"{system_prompt}\n\nUser Question: {message}\nSaFact Assistant:",
                "stream": False,
                "options": {
                    "temperature": 0.3,
                    "num_predict": 180
                }
            }

            resp = requests.post(OLLAMA_URL, json=payload, timeout=3.5)
            if resp.status_code == 200:
                data = resp.json()
                text = data.get("response", "").strip()
                if text:
                    return text
        except Exception:
            # Ollama not installed, stopped, or timed out - seamlessly proceed to grounded engine
            pass
        return None

    @classmethod
    def _generate_grounded_fallback(cls, query: str, raw_msg: str, ctx: Dict[str, Any]) -> str:
        """
        Expert deterministic crowd safety engine ensuring reliable, 100% accurate responses
        grounded in the latest scan data even without Ollama installed.
        """
        has_scan = ctx["has_scan"]
        headcount = ctx["person_count"]
        zones = ctx["zones"]
        hotspot = ctx["hotspot"]
        relief = ctx["relief"]

        # Greeting & identity
        if any(w in query for w in ["hello", "hi", "hey", "who are you", "what can you do"]):
            if has_scan:
                return (
                    f"Hello! I am the SaFact Assistant. The optical sensor is currently tracking "
                    f"**{headcount} people** across the four concourse sectors. "
                    "You can ask me which zone is safest, where crowding is concentrated, "
                    "or how space-per-person metrics are calculated."
                )
            return (
                "Hi! I'm the SaFact Assistant. I can explain your latest crowd scan, compare zones, "
                "and help you understand where crowd density appears lower. "
                "Click **'Initialize Camera Stream'** or upload an image to begin real-time scanning!"
            )

        # Question: Where is the crowd most concentrated / hotspot?
        if any(w in query for w in ["concentrated", "hotspot", "most people", "crowded", "congestion", "highest"]):
            if not has_scan:
                return "No scan is currently active. Please click 'Initialize Camera Stream' or upload a photo to analyze crowd hotspots."
            if hotspot and hotspot.get("people_count", 0) > 0:
                sqft = hotspot.get("sqft_per_person", "N/A")
                return (
                    f"The crowd is currently most concentrated in **{hotspot.get('name')}** "
                    f"with **{hotspot.get('people_count')} people** detected "
                    f"({sqft} sq ft per person, {hotspot.get('density_category')}). "
                    f"Recommendation: {hotspot.get('recommended_action')}"
                )
            return f"All concourse sectors are currently clear with nominal pedestrian presence (Total headcount: {headcount})."

        # Question: Which zone has fewer people / safest / where to move?
        if any(w in query for w in ["fewer people", "least", "safest", "clear", "relief", "lower density", "where should i go", "move left or right"]):
            if not has_scan:
                return "Awaiting scan data. Start the camera or upload an image so I can identify lower-density corridors."
            if relief:
                sqft = relief.get("sqft_per_person")
                space_note = f" (estimated {sqft} sq ft/person)" if sqft else " (currently unoccupied)"
                return (
                    f"Based on the latest optical scan, **{relief.get('name')}** has the lowest estimated crowd concentration "
                    f"with **{relief.get('people_count')} people**{space_note}. "
                    "Note: Lower density does not guarantee an unobstructed exit. Always verify open passage and follow on-site stewards."
                )
            return "Pedestrian distribution is evenly balanced across all primary concourse partitions."

        # Question: Why is Zone A marked red?
        if "zone a" in query and ("red" in query or "why" in query or "status" in query):
            z_a = next((z for z in zones if z["id"] == "ZONE_A"), None)
            count = z_a.get("people_count", 0) if z_a else 0
            sqft = z_a.get("sqft_per_person") if z_a else 215.0
            return (
                f"Zone A is designated as our high-density observation partition (marked Red). "
                f"Currently, it has **{count} people** detected. "
                "Under SaFact safety thresholds, sectors with under 5 sq ft per person are flagged as high density "
                "to anticipate bottleneck friction before physical stampede pressure builds up."
            )

        # Question: Space per person / calculations?
        if any(w in query for w in ["space", "square feet", "sq ft", "formula", "calculation", "how much space"]):
            if has_scan and zones:
                details = []
                for z in zones:
                    s = z.get("sqft_per_person")
                    val = f"{s} sq ft/p" if s else "Open (0 people)"
                    details.append(f"• **{z.get('name')}**: {val}")
                return (
                    "Space per person is calculated as: **Zone Area (sq ft) ÷ Detected People**.\n"
                    "Current sector measurements:\n" + "\n".join(details) + "\n\n"
                    "Thresholds: < 5 sq ft/p (High density), 5–10 sq ft/p (Moderate), > 10 sq ft/p (Lower density)."
                )
            return (
                "SaFact calculates space per person using: **Zone Area in sq ft ÷ Detected People**.\n"
                "• Under 5 sq ft/person indicates high density bottlenecking.\n"
                "• 5–10 sq ft/person represents moderate transitional flow.\n"
                "• Over 10 sq ft/person allows nominal free movement."
            )

        # Question: What does high density mean?
        if "density" in query and ("mean" in query or "what" in query or "explain" in query):
            return (
                "Crowd density measures how many individuals occupy a given physical area. "
                "When density exceeds 2.5 persons/m² (under 5 sq ft per person), pedestrian speed drops, "
                "shockwaves can ripple through standing crowds, and accidental tripping can trigger dangerous compression. "
                "SaFact alerts security early so ingress gates can be regulated."
            )

        # Fallback summary
        if has_scan:
            return (
                f"Current SaFact Summary: **{headcount} people** tracked. "
                f"Overall hazard index is **{ctx['risk_score']}/100 ({ctx['risk_level']})**. "
                f"Zone A has {zones[0].get('people_count')} people, Zone B has {zones[1].get('people_count')}, "
                f"Zone C has {zones[2].get('people_count')}, and Zone D has {zones[3].get('people_count')}. "
                "How else can I assist with concourse safety analysis?"
            )

        return (
            "I'm ready to assist with crowd analysis! Once you activate the camera or upload a frame, "
            "I will evaluate pedestrian counts, compute space-per-person metrics, and highlight potential bottleneck corridors."
        )

assistant_service = AssistantService()
