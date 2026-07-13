import io
import os
import re
import hashlib
import logging
from typing import List

logger = logging.getLogger("forttrace.extraction")


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Parses PDF bytes and extracts text page-by-page.
    """
    try:
        from pypdf import PdfReader
        pdf_file = io.BytesIO(file_bytes)
        reader = PdfReader(pdf_file)
        
        text_pages = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_pages.append(page_text)
                
        full_text = "\n\n".join(text_pages)
        return full_text.strip()
    except Exception as e:
        logger.error(f"Error parsing PDF file: {e}")
        raise RuntimeError(f"PDF extraction failed: {str(e)}")


def extract_text_from_image(file_bytes: bytes) -> str:
    """
    Extracts text from image bytes using pytesseract.
    Raises RuntimeError if Tesseract OCR fails or is not configured.
    """
    try:
        from PIL import Image
        import pytesseract
        
        # Auto-detect Tesseract executable on standard Windows paths
        tesseract_default_paths = [
            r"C:\Program Files\Tesseract-OCR\tesseract.exe",
            r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"
        ]
        for p in tesseract_default_paths:
            if os.path.exists(p):
                pytesseract.pytesseract.tesseract_cmd = p
                break
        
        image = Image.open(io.BytesIO(file_bytes))
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        logger.error(f"Tesseract OCR failed: {e}")
        raise RuntimeError(f"Tesseract OCR engine failed: {str(e)}")


def transcribe_audio(file_bytes: bytes) -> str:
    """
    Transcribes audio bytes using Groq's high-speed remote Whisper API.
    Bypasses local torch/whisper downloads and ffmpeg path dependency.
    """
    try:
        from groq import Groq
        
        # Load API key from environment
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            from dotenv import load_dotenv
            load_dotenv()
            api_key = os.getenv("GROQ_API_KEY")
            
        if not api_key:
            raise ValueError("GROQ_API_KEY not found in environment.")
            
        client = Groq(api_key=api_key)
        
        # Call Groq's Whisper API using memory bytes tuple
        transcription = client.audio.transcriptions.create(
            file=("audio.mp3", file_bytes),
            model="whisper-large-v3-turbo",
            response_format="json",
            temperature=0.0
        )
        return transcription.text.strip()
    except Exception as e:
        logger.error(f"Groq Whisper STT failed: {e}")
        raise RuntimeError(f"Whisper STT transcription failed: {str(e)}")



def chunk_text(text: str, chunk_size: int = 512, overlap: int = 64) -> List[str]:
    """
    Splits text into chunks of approximately chunk_size words,
    preserving sentence boundaries where possible.
    Includes a sliding window overlap between consecutive chunks.
    """
    if not text:
        return []
        
    # Split text into sentences using simple boundary detection
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    
    chunks = []
    current_chunk = []
    current_word_count = 0
    
    for sentence in sentences:
        words = sentence.split()
        if not words:
            continue
            
        sentence_word_count = len(words)
        
        # If a single sentence exceeds chunk_size, split it by words
        if sentence_word_count > chunk_size:
            if current_chunk:
                chunks.append(" ".join(current_chunk))
                current_chunk = []
                current_word_count = 0
            
            # Split long sentence
            for i in range(0, sentence_word_count, chunk_size - overlap):
                sub_words = words[i:i + chunk_size]
                chunks.append(" ".join(sub_words))
            continue
            
        # If adding this sentence exceeds chunk_size, dump current chunk
        if current_word_count + sentence_word_count > chunk_size:
            chunks.append(" ".join(current_chunk))
            
            # Retain last 'overlap' words for the next chunk's context overlap
            flat_chunk = " ".join(current_chunk).split()
            overlap_words = flat_chunk[-overlap:] if len(flat_chunk) > overlap else flat_chunk
            current_chunk = list(overlap_words)
            current_word_count = len(current_chunk)
            
        current_chunk.append(sentence)
        current_word_count += sentence_word_count
        
    if current_chunk:
        chunks.append(" ".join(current_chunk))
        
    return chunks
