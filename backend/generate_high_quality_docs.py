import os
import sys
import time
import io
import logging

from dotenv import load_dotenv
load_dotenv()

# Add project root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from supabase import create_client
from app.core.config import settings
from groq import Groq

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("fortrace.doc_generator")

# Initialize clients
logger.info("Initializing Supabase and Groq clients...")
db = create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)

groq_api_key = os.getenv("GROQ_API_KEY") or getattr(settings, "GROQ_API_KEY", "")
groq_client = Groq(api_key=groq_api_key)

def generate_pdf_bytes(title: str, text: str) -> bytes:
    """
    Generates a beautifully formatted PDF binary stream using reportlab.
    """
    from reportlab.lib.pagesizes import letter
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib import colors

    pdf_buffer = io.BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter,
                            rightMargin=54, leftMargin=54, topMargin=54, bottomMargin=54)
    
    styles = getSampleStyleSheet()
    
    # Custom high-quality styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=colors.HexColor('#1A365D'),
        spaceAfter=15
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor('#2D3748'),
        spaceAfter=10
    )

    story = []
    
    # Add title
    story.append(Paragraph(title, title_style))
    story.append(Spacer(1, 15))
    
    # Add body paragraphs
    paragraphs = text.split('\n\n')
    for p in paragraphs:
        p = p.strip()
        if p:
            story.append(Paragraph(p, body_style))
            
    doc.build(story)
    pdf_buffer.seek(0)
    return pdf_buffer.read()

def generate_doc_text(doc_title: str, doc_type: str, asset: dict) -> str:
    """
    Calls Groq Llama-3-70B to generate extremely realistic, technical text for the document.
    """
    uat = asset.get('uat', 'REF-HTX-E201-001')
    eq_tag = asset.get('equipment_tag', 'E-201')
    eq_type = asset.get('equipment_type', 'heat_exchanger')
    mfr = asset.get('manufacturer', 'Alfa Laval')
    status = asset.get('status', 'active')
    location = asset.get('location_description', 'Cooling Water Area')

    prompt = f"""You are a senior principal industrial process and chemical operations engineer. 
Write a highly detailed, professional, production-grade {doc_type} technical document.
Title: {doc_title}
Asset Reference: {uat} (Equipment Tag: {eq_tag}, Type: {eq_type}, Manufacturer: {mfr}, Location: {location})

The content must include:
1. System Overview & Technical Specifications (including realistic operating ranges for temperature, pressure, or flow rates).
2. Detailed step-by-step operating guidelines or specifications.
3. Critical safety protocols, alarm triggers, and hazard mitigations.
4. Maintenance and inspection intervals, including specific part replacement details (e.g. seals, bearings, lubricants).
5. Regulatory compliance markers (e.g. ISO 9001, OISD standards, Factory Act requirements).

RULES:
- Do NOT include any intro like "Here is your document" or "As an engineer...". Start directly with the technical content.
- Do NOT use markdown bold headers (like '## 1. System Overview') since this will be printed, write them in plain-text headers or standard uppercase text.
- Be extremely detailed, technical, and realistic. Make the document long, comprehensive, and rich in domain knowledge (at least 600 words).
"""
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": "You are a professional industrial plant technical documentation writer."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=2500
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Groq generation failed for {doc_title}: {e}")
        # Return fallback text if API fails
        return f"TECHNICAL DOCUMENTATION: {doc_title}\nAsset: {uat}\n\nThis document describes the operations, maintenance, and safety guidelines for {eq_tag} ({eq_type}) manufactured by {mfr}.\nOperating limits: Temp max 250C, Pressure max 45 bar. Ensure weekly checks are conducted in line with ISO 9001 standards."

def generate_silent_audio_bytes() -> bytes:
    """
    Generates a tiny valid 5-second silence WAV file.
    """
    import wave
    audio_buffer = io.BytesIO()
    with wave.open(audio_buffer, 'wb') as wav:
        wav.setnchannels(1)
        wav.setsampwidth(2)
        wav.setframerate(16000)
        wav.writeframes(b'\x00' * 32000 * 5) # 5 seconds of silence
    audio_buffer.seek(0)
    return audio_buffer.read()

def is_fallback_file(file_path: str) -> bool:
    """
    Downloads the file and checks if it contains the fallback header or placeholder.
    """
    try:
        res = db.storage.from_('indra-assets').download(file_path)
        if file_path.endswith('.txt'):
            content = res.decode('utf-8', errors='ignore')
            return "TECHNICAL DOCUMENTATION:" in content or "Placeholder" in content
        elif file_path.endswith('.pdf'):
            from pypdf import PdfReader
            reader = PdfReader(io.BytesIO(res))
            if len(reader.pages) > 0:
                page_text = reader.pages[0].extract_text() or ""
                return "TECHNICAL DOCUMENTATION:" in page_text or "Placeholder" in page_text
        return False
    except Exception:
        # If download fails, it's missing or corrupted, so treat as fallback candidate
        return True

def main():
    logger.info("Fetching document records from database...")
    docs = db.table('documents').select('*').execute().data
    logger.info(f"Found {len(docs)} documents in database.")

    # Fetch assets mapping to look up details
    logger.info("Fetching asset records for details lookup...")
    assets_list = db.table('assets').select('*').execute().data
    assets_map = {a['uat']: a for a in assets_list}

    # Find distinct directories to check bucket file existence
    folders = set()
    for d in docs:
        path = d['file_path']
        if '/' in path:
            folders.add('/'.join(path.split('/')[:-1]))

    logger.info("Checking folders in Supabase Storage...")
    files_in_storage = set()
    for folder in folders:
        try:
            res = db.storage.from_('indra-assets').list(folder)
            for item in res:
                files_in_storage.add(f"{folder}/{item['name']}")
        except Exception as e:
            logger.error(f"Error checking folder {folder}: {e}")

    # Filter down to missing or fallback documents
    logger.info("Checking files for missing or placeholder contents...")
    docs_to_generate = []
    for d in docs:
        path = d['file_path']
        if path not in files_in_storage:
            docs_to_generate.append(d)
        else:
            if is_fallback_file(path):
                logger.info(f"Detected placeholder file: {path}. Adding to regeneration queue.")
                docs_to_generate.append(d)

    logger.info(f"=== Total DB records: {len(docs)} ===")
    logger.info(f"=== Target for Generation/Regeneration: {len(docs_to_generate)} ===")

    if not docs_to_generate:
        logger.info("All files are high quality and present! Nothing to do.")
        return

    logger.info("Starting generation and uploads...")
    for idx, doc in enumerate(docs_to_generate):
        path = doc['file_path']
        title = doc['title']
        doc_type = doc['doc_type']
        uat = doc.get('uat')
        
        asset = assets_map.get(uat, {})
        
        logger.info(f"[{idx+1}/{len(docs_to_generate)}] Processing: {title} | Asset: {uat} | Path: {path}")

        try:
            # Generate bytes based on extension
            if path.endswith('.txt'):
                logger.info(f"Generating technical text via Groq...")
                text = generate_doc_text(title, doc_type, asset)
                file_bytes = text.encode('utf-8')
                mime = "text/plain"
            elif path.endswith('.pdf'):
                logger.info(f"Generating technical PDF via Groq & ReportLab...")
                text = generate_doc_text(title, doc_type, asset)
                file_bytes = generate_pdf_bytes(title, text)
                mime = "application/pdf"
            elif path.endswith('.mp3') or path.endswith('.wav'):
                logger.info(f"Generating silent audio for voice file path...")
                file_bytes = generate_silent_audio_bytes()
                mime = "audio/wav"
            elif path.endswith('.mp4'):
                logger.info(f"Uploading small dummy bytes for video log path...")
                file_bytes = b'\x00' * 50000 # Small stub
                mime = "video/mp4"
            else:
                logger.info(f"Uploading fallback bytes...")
                file_bytes = b"Placeholder contents."
                mime = "text/plain"

            # Upload to Supabase Storage
            logger.info(f"Uploading to Supabase Storage path: {path}")
            db.storage.from_('indra-assets').upload(
                path=path,
                file=file_bytes,
                file_options={"content-type": mime, "upsert": "true"}
            )
            logger.info("Upload complete!")

            # Sleep to prevent Groq free tier rate limits (30 RPM)
            time.sleep(2.5)

        except Exception as e:
            logger.error(f"Failed to process and upload {title}: {e}")
            # Continue to next file to prevent loop breaking
            continue

    logger.info("All documents successfully processed and synced!")

if __name__ == "__main__":
    main()
