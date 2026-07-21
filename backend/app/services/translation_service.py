import os
import logging
from groq import Groq

logger = logging.getLogger("fortrace.translation")

def get_groq_client() -> Groq:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        from dotenv import load_dotenv
        load_dotenv()
        api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY is not configured.")
    return Groq(api_key=api_key)

def detect_language(text: str) -> str:
    """
    Detects if the input text is primarily in Hindi ('hi') or English ('en').
    Returns 'hi' or 'en' based on LLM output.
    """
    if not text.strip():
        return "en"
    try:
        client = get_groq_client()
        prompt = (
            "Analyze the following text and determine if it is primarily written in Hindi (using either Devanagari script or Romanized/Hinglish text) "
            "or English.\n"
            "Respond with exactly one of these two-letter codes: 'hi' or 'en'. Do not include any other words or punctuation.\n\n"
            f"Text: {text}"
        )
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.0,
            max_tokens=5
        )
        result = chat_completion.choices[0].message.content.strip().lower()
        if "hi" in result:
            return "hi"
        return "en"
    except Exception as e:
        logger.error(f"Language detection failed: {e}")
        # Default fallback to 'en'
        return "en"

def translate_hi_to_en(text: str) -> str:
    """
    Translates Hindi (Devanagari or Hinglish) text to English.
    """
    if not text.strip():
        return ""
    try:
        client = get_groq_client()
        prompt = (
            "You are a professional translator specializing in industrial/chemical plant terminology.\n"
            "Translate the following Hindi text (which might be in Devanagari script or Romanized Hinglish script) to clean, standard English.\n"
            "Keep technical tags like 'R-101', 'P-201', 'E-201' exactly as they are.\n"
            "Respond ONLY with the translated English text. Do not write any explanations or metadata.\n\n"
            f"Hindi Text: {text}"
        )
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.0
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Translation to English failed: {e}")
        return text

def translate_en_to_hi(text: str) -> str:
    """
    Translates English text to standard Devanagari Hindi.
    """
    if not text.strip():
        return ""
    try:
        client = get_groq_client()
        prompt = (
            "You are a professional translator specializing in industrial/chemical plant terminology.\n"
            "Translate the following English text to clear, standard Devanagari Hindi.\n"
            "Keep technical equipment tags like 'R-101', 'P-201', 'E-201' exactly as they are in English characters (e.g. write 'R-101' instead of translating the letters).\n"
            "Respond ONLY with the translated Hindi text. Do not write any explanations or metadata.\n\n"
            f"English Text: {text}"
        )
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.0
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Translation to Hindi failed: {e}")
        return text
