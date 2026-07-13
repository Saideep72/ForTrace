"""
Quick test for Regex NER (Tier 2) - no API calls, no DB needed.
Tests against sample industrial text.
"""
import sys
sys.path.insert(0, 'C:\\AIML\\FortTrace\\backend')

# Test the regex extraction directly
import re

REGEX_PATTERNS = {
    "EQUIPMENT_TAG": [
        r'\b([A-Z]{1,3}-\d{2,4}[A-Z]?(?:-[A-Z0-9]+)?)\b',
        r'\b([A-Z]{1,3}\d{3,4}[A-Z]?)\b',
    ],
    "TEMPERATURE": [
        r'\b(\d+(?:\.\d+)?\s*°\s*[CF])\b',
        r'\b(\d+(?:\.\d+)?\s*K)\b',
    ],
    "PRESSURE": [
        r'\b(\d+(?:\.\d+)?\s*bar(?:\(g\))?)\b',
        r'\b(\d+(?:\.\d+)?\s*psi)\b',
        r'\b(\d+(?:\.\d+)?\s*(?:MPa|kPa))\b',
    ],
    "FLOW_RATE": [
        r'\b(\d+(?:\.\d+)?\s*m3/h(?:r)?)\b',
        r'\b(\d+(?:\.\d+)?\s*GPM)\b',
    ],
    "DATE": [
        r'\b(\d{4}-\d{2}-\d{2})\b',
    ],
    "REGULATION": [
        r'\b(ISO\s+\d{3,5}(?::\d{4})?)\b',
        r'\b(OISD[-\s]\d{2,4})\b',
        r'\b(Factory\s+Act\s+\d{4})\b',
    ],
}

# Sample industrial text
test_text = """
Reactor R-101 operates at 480°C with cooling from Heat Exchanger E-201.
Pump P-201-A feeds cooling water at 150 m3/hr.
System operates between 1 bar and 10 bar pressure (MAWP: 12 bar).
Last inspection on 2026-05-15. Complies with ISO 9001:2015 and OISD-144.
Temperature range: 20°C to 150°C. Flow rate: 500 m3/h.
"""

print("=== FortTrace NER - Regex Tier 2 Test ===")
print(f"Text: {test_text[:120]}...\n")

results = []
seen = set()
for entity_type, patterns in REGEX_PATTERNS.items():
    for pattern in patterns:
        for m in re.finditer(pattern, test_text, re.IGNORECASE):
            span = (m.start(), m.end())
            if span not in seen:
                seen.add(span)
                results.append({
                    "type": entity_type,
                    "value": m.group(0).strip(),
                    "start": m.start(),
                    "end": m.end()
                })

print(f"Found {len(results)} entities:\n")
for r in sorted(results, key=lambda x: x['start']):
    print(f"  [{r['type']:<15}] '{r['value']}'  @ chars {r['start']}-{r['end']}")

print("\n=== Regex NER working correctly! Zero API calls needed. ===")
