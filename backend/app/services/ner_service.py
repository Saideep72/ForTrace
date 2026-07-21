"""
ForTrace NER Service - Phase 5: Named Entity Recognition
Architecture: 2-Tier Hybrid
  Tier 1: Groq LLM API (high accuracy, cloud-based)
  Tier 2: Regex Engine (zero API calls, offline, unlimited, fallback)

If Groq is unavailable (rate limit / timeout / no key), Tier 2 kicks in automatically.
"""
import os
import re
import json
import logging
from typing import List, Dict, Any
from supabase import Client

logger = logging.getLogger("fortrace.ner")


# ===========================================================================
# REGEX PATTERNS - Tier 2 Fallback (Zero API calls, runs forever)
# ===========================================================================
REGEX_PATTERNS = {
    "EQUIPMENT_TAG": [
        # E-201, R-101, P-201-A, V-123, TR-101, CW-101, T-401, R-101D
        r'\b([A-Z]{1,3}-\d{2,4}[A-Z]?(?:-[A-Z0-9]+)?)\b',
        # Pump P101, Reactor R101 (no dash)
        r'\b([A-Z]{1,3}\d{3,4}[A-Z]?)\b',
    ],
    "TEMPERATURE": [
        # 480°C, 150°F, 300K, 20 °C
        r'\b(\d+(?:\.\d+)?\s*°\s*[CF])\b',
        r'\b(\d+(?:\.\d+)?\s*K)\b(?!\s*(?:m|g|Pa|Hz|N|W|V|A))',
    ],
    "PRESSURE": [
        # 150 bar, 2000 psi, 10 MPa, 8 bar(g), 1 bar to 10 bar
        r'\b(\d+(?:\.\d+)?\s*bar(?:\(g\))?)\b',
        r'\b(\d+(?:\.\d+)?\s*psi)\b',
        r'\b(\d+(?:\.\d+)?\s*(?:MPa|kPa|KPa))\b',
    ],
    "FLOW_RATE": [
        # 150 m³/hr, 50 GPM, 500 m³/h, 1000 liters per minute
        r'\b(\d+(?:\.\d+)?\s*m³/h(?:r)?)\b',
        r'\b(\d+(?:\.\d+)?\s*GPM)\b',
        r'\b(\d+(?:\.\d+)?\s*L/min)\b',
        r'\b(\d+(?:,\d+)?(?:\.\d+)?\s*liters?\s*per\s*minute)\b',
    ],
    "PART_NUMBER": [
        # SKF-6314, Shell-N3, specific coded parts
        r'\b([A-Z]{2,5}-\d{4,})\b',
        r'\b([A-Z]{2,5}-[A-Z0-9]{2,})\b',
    ],
    "DATE": [
        # 2025-04-12, 2026-05-15
        r'\b(\d{4}-\d{2}-\d{2})\b',
        # January 10th, 2024 / April 12, 2025
        r'\b((?:January|February|March|April|May|June|July|August|September|October|November|December)'
        r'\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})\b',
    ],
    "REGULATION": [
        # ISO 9001:2015, OISD-144, API-650, ASME B31.3
        r'\b(ISO\s+\d{3,5}(?::\d{4})?)\b',
        r'\b(OISD[-\s]\d{2,4})\b',
        r'\b((?:ANSI|API|ASME|IS)\s*[-/]?\s*[A-Z0-9.-]+)\b',
        r'\b(Factory\s+Act\s+\d{4})\b',
    ],
    "MANUFACTURER": [
        # Known industrial manufacturers
        r'\b(Alfa\s+Laval)\b',
        r'\b(Larsen\s+[&and]+\s+Toubro|L&T)\b',
        r'\b(KSB\s+Pumps?)\b',
        r'\b(Flowserve)\b',
        r'\b(SPX\s+Cooling)\b',
        r'\b(Grundfos)\b',
        r'\b(Sulzer)\b',
        r'\b(ITT\s+Corporation)\b',
    ],
}

REGEX_CONFIDENCE = {
    "EQUIPMENT_TAG": 0.90,
    "TEMPERATURE": 0.95,
    "PRESSURE": 0.93,
    "FLOW_RATE": 0.92,
    "PART_NUMBER": 0.88,
    "DATE": 0.97,
    "REGULATION": 0.91,
    "MANUFACTURER": 0.89,
}


def _regex_extract(text: str) -> List[Dict[str, Any]]:
    """
    Tier 2: Pure regex-based NER. Zero API calls, unlimited usage, works fully offline.
    Identifies industrial entity types using curated regex patterns.
    """
    results = []
    seen_spans = set()  # Avoid duplicate spans

    for entity_type, patterns in REGEX_PATTERNS.items():
        confidence = REGEX_CONFIDENCE.get(entity_type, 0.85)
        for pattern in patterns:
            try:
                for m in re.finditer(pattern, text, re.IGNORECASE):
                    start, end = m.span()
                    # Skip if this span already captured (dedup)
                    if (start, end) in seen_spans:
                        continue
                    seen_spans.add((start, end))
                    results.append({
                        "entity_type": entity_type,
                        "entity_value": m.group(0).strip(),
                        "start_char": start,
                        "end_char": end,
                        "confidence": confidence,
                    })
            except Exception as pattern_err:
                logger.warning(f"Regex pattern error ({entity_type}): {pattern_err}")

    logger.info(f"Regex NER extracted {len(results)} entities.")
    return results


# ===========================================================================
# LLM NER PROMPT - Tier 1 (Groq LLM, high accuracy)
# ===========================================================================
NER_SYSTEM_PROMPT = """You are a precise Named Entity Recognition (NER) system specialized in industrial documents.

Extract ALL instances of these entity types from the text:
1. EQUIPMENT_TAG: E.g., R-101, E-201, P-201-A, V-123, TR-101, T-401
2. TEMPERATURE: E.g., 480°C, 150°F, 20°C to 150°C
3. PRESSURE: E.g., 150 bar, 2000 psi, 10 MPa, 8 bar(g)
4. FLOW_RATE: E.g., 150 m³/hr, 50 GPM, 500 m³/h
5. PART_NUMBER: E.g., SKF-6314, Shell-N3
6. MANUFACTURER: E.g., Larsen & Toubro, Alfa Laval, KSB Pumps
7. DATE: E.g., 2025-04-12, January 10th 2024
8. PERSON: E.g., Rajesh Kumar, Anil Sharma, Imran
9. REGULATION: E.g., Factory Act 1948, OISD-144, ISO 9001:2015

Return ONLY a valid JSON object:
{"entities": [{"type": "EQUIPMENT_TAG", "value": "R-101", "confidence": 0.98}, ...]}

No explanations, no markdown, only raw JSON."""


def _llm_extract(text: str) -> List[Dict[str, Any]]:
    """
    Tier 1: Groq LLM-based extraction — high accuracy including PERSON entities.
    Returns empty list on any failure so Tier 2 can take over.
    """
    try:
        from groq import Groq, RateLimitError

        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            from dotenv import load_dotenv
            load_dotenv()
            api_key = os.getenv("GROQ_API_KEY")

        if not api_key:
            logger.warning("GROQ_API_KEY not set, skipping LLM NER tier.")
            return []

        client = Groq(api_key=api_key)

        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": NER_SYSTEM_PROMPT},
                {"role": "user", "content": f"Extract entities:\n\n{text}"}
            ],
            model="llama-3.3-70b-versatile",
            response_format={"type": "json_object"},
            temperature=0.0,
            timeout=15.0
        )

        raw = json.loads(response.choices[0].message.content)
        raw_entities = raw.get("entities", [])

        results = []
        for entity in raw_entities:
            entity_type = entity.get("type", "").strip().upper()
            entity_value = entity.get("value", "").strip()
            confidence = float(entity.get("confidence", 1.0))

            if not entity_value or not entity_type or confidence < 0.7:
                continue

            # Map exact offsets in text
            escaped_val = re.escape(entity_value)
            matches = list(re.finditer(escaped_val, text, re.IGNORECASE))
            if not matches:
                # Try without punctuation
                clean_val = re.sub(r'[^\w\s-]', '', entity_value).strip()
                if clean_val:
                    matches = list(re.finditer(re.escape(clean_val), text, re.IGNORECASE))

            for m in matches:
                results.append({
                    "entity_type": entity_type,
                    "entity_value": text[m.start():m.end()],
                    "start_char": m.start(),
                    "end_char": m.end(),
                    "confidence": confidence,
                })

        logger.info(f"LLM NER (Tier 1) extracted {len(results)} entities.")
        return results

    except Exception as e:
        err_str = str(e)
        if "rate_limit" in err_str.lower() or "429" in err_str or "RateLimit" in err_str:
            logger.warning("Groq rate limit hit — falling back to Regex NER (Tier 2).")
        else:
            logger.warning(f"Groq LLM NER failed ({e}) — falling back to Regex NER (Tier 2).")
        return []


# ===========================================================================
# PUBLIC API
# ===========================================================================
def extract_entities(text: str) -> List[Dict[str, Any]]:
    """
    2-Tier hybrid NER:
    - Tier 1: Groq LLM (tries first — includes PERSON entities)
    - Tier 2: Regex engine (fallback — zero API calls, offline, unlimited)
    """
    if not text or not text.strip():
        return []

    # Try Tier 1 (LLM)
    entities = _llm_extract(text)

    # If LLM failed or returned nothing, run Tier 2 (Regex)
    if not entities:
        logger.info("Using Regex NER (Tier 2) as primary extraction.")
        entities = _regex_extract(text)

    return entities


def save_entities(db: Client, doc_id: str, entities: List[Dict[str, Any]]) -> int:
    """
    Clears pre-existing entities for the document and bulk-inserts new ones.
    Returns the count of saved entities.
    """
    try:
        db.table("extracted_entities").delete().eq("doc_id", doc_id).execute()

        if not entities:
            return 0

        insert_payloads = [
            {
                "doc_id": doc_id,
                "entity_type": ent["entity_type"],
                "entity_value": ent["entity_value"],
                "start_char": ent["start_char"],
                "end_char": ent["end_char"],
                "confidence": ent["confidence"],
            }
            for ent in entities
        ]

        db.table("extracted_entities").insert(insert_payloads).execute()
        logger.info(f"Saved {len(insert_payloads)} entities for doc_id={doc_id}")
        return len(insert_payloads)

    except Exception as e:
        logger.error(f"Failed to save entities for doc_id='{doc_id}': {e}")
        return 0
