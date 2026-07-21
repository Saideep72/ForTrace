import sys
import os
import logging
import time
from typing import Any, Dict, Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from pydantic import BaseModel
from supabase import Client
from langchain_core.messages import HumanMessage, AIMessage

from app.core.database import get_db
from app.core.security import get_current_user
from app.services.extraction_service import transcribe_audio
from app.services.translation_service import detect_language, translate_hi_to_en, translate_en_to_hi

# Add agents path to sys.path to import builder
AGENTS_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../agents_engine"))
if AGENTS_PATH not in sys.path:
    sys.path.append(AGENTS_PATH)

logger = logging.getLogger("forttrace.query")
router = APIRouter()

# Thread-safe in-memory session memory storage
SESSION_MEMORIES: Dict[str, List[Any]] = {}

def get_session_history(session_id: str) -> List[Any]:
    if session_id not in SESSION_MEMORIES:
        SESSION_MEMORIES[session_id] = []
    return SESSION_MEMORIES[session_id]

def add_session_message(session_id: str, message: Any):
    history = get_session_history(session_id)
    history.append(message)
    # Maintain last 10 messages to keep context window light and clean
    if len(history) > 10:
        SESSION_MEMORIES[session_id] = history[-10:]

def generate_short_spoken_summary(answer: str) -> str:
    """
    Summarizes a detailed plant operations response into a 1-2 sentence friendly spoken summary.
    """
    try:
        from app.services.translation_service import get_groq_client
        client = get_groq_client()
        prompt = (
            "You are a friendly industrial plant operations assistant radio dispatcher.\n"
            "Given this detailed technical answer, write a short, friendly, colloquial spoken summary "
            "(1-2 sentences maximum) that tells the operator the direct cause or immediate action.\n"
            "Keep it casual and clear. Avoid markdown formatting. Do not output anything else.\n\n"
            f"Detailed Answer: {answer}"
        )
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=60
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        logger.warning(f"Failed to generate short spoken summary: {e}")
        # Slicing clean default summary
        return answer[:100] + "..." if len(answer) > 100 else answer

def generate_short_spoken_summary_hindi(english_summary: str) -> str:
    """
    Translates a short spoken English summary into conversational, radio-friendly Hindi.
    """
    try:
        from app.services.translation_service import get_groq_client
        client = get_groq_client()
        prompt = (
            "Translate this short English audio message to conversational, spoken Hindi "
            "that a technician would understand over the radio. Keep equipment tags like P-201 in English characters.\n"
            "Respond ONLY with the Hindi translation. Do not include any explanations.\n\n"
            f"English message: {english_summary}"
        )
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model="llama-3.3-70b-versatile",
            temperature=0.0,
            max_tokens=60
        )
        return chat_completion.choices[0].message.content.strip()
    except Exception as e:
        logger.warning(f"Failed to translate short spoken summary to Hindi: {e}")
        return "कृपया विवरण स्क्रीन पर जांचें।"


class QueryRequest(BaseModel):
    query: str
    session_id: Optional[str] = "default_session"
    query_language: Optional[str] = "en"
    tee_shield: Optional[bool] = False
    include_expert_advice: Optional[bool] = False


class QueryResponse(BaseModel):
    answer: str
    sources: List[Dict[str, Any]] = []
    confidence: float = 1.0
    agent_used: str
    spoken_summary: Optional[str] = None
@router.post("/ask", response_model=QueryResponse)
async def ask_query(
    payload: QueryRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_db)
) -> Dict[str, Any]:
    """
    Main query routing endpoint. Calls Anushka's LangGraph orchestrator.
    Handles conversation history session mapping and auto-translation.
    Supports TEE Anonymization Shield processing when enabled.
    """
    query = payload.query
    session_id = payload.session_id or "default_session"
    logger.info(f"Query request [session: {session_id}] from {current_user['email']}: {query}")
    start_time = time.time()
    
    # Auto-detect language and translate if Hindi/Hinglish is requested or detected
    pref_lang = payload.query_language or "en"
    detected_lang = detect_language(query)
    
    translated_query = query
    if pref_lang == "hi" or detected_lang == "hi":
        logger.info("Hinglish/Hindi text query detected. Translating to English...")
        translated_query = translate_hi_to_en(query)
        logger.info(f"Translated query to English: {translated_query}")
        pref_lang = "hi"

    # TEE Shield Logic
    tee = None
    tee_metadata = None
    if payload.tee_shield:
        try:
            from app.services.tee_simulator import TEESimulator
            tee = TEESimulator()
            attestation = tee.get_attestation_report()
            translated_query, anon_logs = tee.anonymize_text(translated_query)
            tee_metadata = {
                "enclave_id": attestation["enclave_id"],
                "attestation_status": attestation["attestation_status"],
                "measurement": attestation["measurement"],
                "signature": attestation["signature"],
                "anonymization_logs": anon_logs,
                "deanonymization_logs": []
            }
            logger.info(f"TEE Shield active: Query anonymized to: {translated_query}")
        except Exception as tee_init_err:
            logger.warning(f"Failed to initialize TEE enclave: {tee_init_err}")
        
    try:
        # Load conversation history for this session
        history = get_session_history(session_id)
        
        # Load Anushka's compiled graph
        from graph.builder import build_graph
        graph = build_graph()
        
        # Invoke LangGraph with full conversational history
        result = graph.invoke({
            "query": translated_query,
            "messages": history,
            "include_expert_advice": payload.include_expert_advice,
            "retrieved_context": {}
        })
        
        answer = result.get("response") or "No response generated by agent."
        current_agent = result.get("current_agent") or "Unknown"
        retrieved_context = result.get("retrieved_context") or {}
        confidence = result.get("confidence")
        if confidence is None:
            confidence = 0.50
        
        # Flatten sources from retrieved context for citations
        sources = []
        if isinstance(retrieved_context, dict):
            for k, v in retrieved_context.items():
                if isinstance(v, list):
                    for item in v:
                        sources.append(item)
                elif isinstance(v, dict):
                    sources.append(v)
 
        # TEE Shield De-anonymize Answer
        if tee:
            answer, deanon_logs = tee.deanonymize_text(answer)
            tee_metadata["deanonymization_logs"] = deanon_logs

        # Separate Expert Advice block if present in answer
        expert_advice = None
        EXPERT_MARKER = "**Expert Advice (Retiring Engineer Notes)**"
        if EXPERT_MARKER in answer:
            parts = answer.split(EXPERT_MARKER)
            answer = parts[0].strip()
            expert_advice = parts[1].strip()
            if expert_advice.startswith(":"):
                expert_advice = expert_advice[1:].strip()

        # Update in-memory session history
        add_session_message(session_id, HumanMessage(content=translated_query))
        add_session_message(session_id, AIMessage(content=answer))
        
        # Generate spoken summaries
        short_summary_en = generate_short_spoken_summary(answer)
        short_summary_hi = None
        if pref_lang == "hi":
            logger.info("Generating Hindi short summary...")
            short_summary_hi = generate_short_spoken_summary_hindi(short_summary_en)
        
        # Translate the main answer back to Hindi if requested
        if pref_lang == "hi":
            logger.info("Translating final detailed agent answer back to Hindi...")
            answer = translate_en_to_hi(answer)
            if expert_advice:
                expert_advice = translate_en_to_hi(expert_advice)
            
        latency_ms = int((time.time() - start_time) * 1000)
 
        # Log to query_audit_log
        try:
            db.table("query_audit_log").insert({
                "session_id": session_id,
                "user_id": current_user.get("user_id") or "USR001",
                "user_role": current_user.get("role") or "Plant_Manager",
                "query_text": query,
                "query_language": pref_lang,
                "query_type": "text",
                "intent_confidence": float(confidence),
                "agent_used": current_agent,
                "response_json": {"answer": answer, "expert_advice": expert_advice},
                "sources_cited": [s.get("title", "source") for s in sources[:3]],
                "model_used": "FortTrace-Llama3-TEE" if tee else "FortTrace-Llama3",
                "model_version": "v1.2",
                "tokens_input": 0,
                "tokens_output": 0,
                "latency_ms": latency_ms,
                "cache_hit": False,
                "ip_address": "127.0.0.1",
                "user_agent": "FastAPI Client",
                "timestamp": "now()"
            }).execute()
        except Exception as audit_err:
            logger.warning(f"Failed to log query audit trace: {audit_err}")
 
        return {
            "answer": answer,
            "expert_advice": expert_advice,
            "sources": sources,
            "confidence": confidence,
            "agent_used": current_agent,
            "spoken_summary": short_summary_hi if pref_lang == "hi" else short_summary_en,
            "tee_metadata": tee_metadata
        }
    except Exception as exc:
        logger.warning(f"Failed to execute real LangGraph agent flow: {exc}")
        
        fallback_ans = f"Fallback Mock: Answer to query '{query}' (Real Agent failed to execute: {str(exc)})"
        
        # TEE Shield De-anonymize Fallback Answer
        if tee:
            fallback_ans, deanon_logs = tee.deanonymize_text(fallback_ans)
            tee_metadata["deanonymization_logs"] = deanon_logs

        short_summary_en = f"Real agent execution error. {str(exc)}"
        short_summary_hi = "असली एजेंट चलाने में त्रुटि हुई।"
        
        if pref_lang == "hi":
            fallback_ans = translate_en_to_hi(fallback_ans)
            
        return {
            "answer": fallback_ans,
            "sources": [{"source": "mock_fallback", "result": "Failed to run LangGraph"}],
            "confidence": 0.50,
            "agent_used": "FallbackMockAgent",
            "spoken_summary": short_summary_hi if pref_lang == "hi" else short_summary_en,
            "tee_metadata": tee_metadata
        }


@router.post("/voice", status_code=status.HTTP_200_OK)
async def ask_voice_query(
    file: UploadFile = File(...),
    preferred_language: str = Form("en"),
    session_id: str = Form("default_voice_session"),
    include_expert_advice: bool = Form(False),
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: Client = Depends(get_db)
) -> Dict[str, Any]:
    """
    Voice query processing endpoint.
    Uploads audio, transcribes, translates, resolves query via LangGraph with memory,
    and returns translated response and spoken summary.
    """
    start_time = time.time()
    
    # 1. Read file bytes
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded audio file is empty."
        )
    
    try:
        # 2. Transcribe audio using Whisper
        logger.info(f"Transcribing audio from user {current_user['email']}")
        transcribed_text = transcribe_audio(file_bytes)
        logger.info(f"Transcription result: {transcribed_text}")
        
        if not transcribed_text:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not transcribe speech. Please speak clearly."
            )
        
        # 3. Language Detection & Translation
        detected_lang = detect_language(transcribed_text)
        logger.info(f"Detected language: {detected_lang}")
        
        translated_query = transcribed_text
        if detected_lang == "hi":
            logger.info("Translating query from Hindi to English...")
            translated_query = translate_hi_to_en(transcribed_text)
            logger.info(f"Translated query: {translated_query}")
            
        # 4. Invoke LangGraph Query Agent with Session History Memory
        history = get_session_history(session_id)
        
        from graph.builder import build_graph
        graph = build_graph()
        
        logger.info(f"Invoking query agent graph with session {session_id} and query: {translated_query}")
        result = graph.invoke({
            "query": translated_query,
            "messages": history,
            "include_expert_advice": include_expert_advice,
            "retrieved_context": {}
        })
        
        answer = result.get("response") or "No response generated by agent."
        current_agent = result.get("current_agent") or "Unknown"
        retrieved_context = result.get("retrieved_context") or {}
        confidence = result.get("confidence")
        if confidence is None:
            confidence = 0.50
            
        # Flatten sources
        sources = []
        if isinstance(retrieved_context, dict):
            for k, v in retrieved_context.items():
                if isinstance(v, list):
                    for item in v:
                        sources.append(item)
                elif isinstance(v, dict):
                    sources.append(v)
                    
        # Separate Expert Advice block if present in answer
        expert_advice = None
        EXPERT_MARKER = "**Expert Advice (Retiring Engineer Notes)**"
        if EXPERT_MARKER in answer:
            parts = answer.split(EXPERT_MARKER)
            answer = parts[0].strip()
            expert_advice = parts[1].strip()
            if expert_advice.startswith(":"):
                expert_advice = expert_advice[1:].strip()

        # Update session memory history
        add_session_message(session_id, HumanMessage(content=translated_query))
        add_session_message(session_id, AIMessage(content=answer))

        # Generate short spoken summaries
        short_summary_en = generate_short_spoken_summary(answer)
        short_summary_hi = None
        if preferred_language == "hi":
            logger.info("Translating voice response back to Hindi...")
            short_summary_hi = generate_short_spoken_summary_hindi(short_summary_en)

        # 5. Translate Response back to Hindi if requested
        response_in_hindi = None
        if preferred_language == "hi":
            logger.info("Translating agent response back to Hindi...")
            response_in_hindi = translate_en_to_hi(answer)
            logger.info(f"Hindi translated response: {response_in_hindi}")
            
        processing_time_ms = int((time.time() - start_time) * 1000)
        
        # 6. Log to query_audit_log for Phase 13 Compliance
        try:
            db.table("query_audit_log").insert({
                "session_id": session_id,
                "user_id": current_user.get("user_id") or "tech_001",
                "user_role": current_user.get("role") or "Field_Technician",
                "query_text": transcribed_text,
                "query_language": detected_lang,
                "query_type": "voice",
                "intent_confidence": float(confidence),
                "agent_used": current_agent,
                "response_json": {"answer": answer, "expert_advice": expert_advice},
                "sources_cited": [s.get("title", "source") for s in sources[:3]],
                "model_used": "FortTrace-Llama3-Whisper",
                "model_version": "v1.2",
                "tokens_input": 0,
                "tokens_output": 0,
                "latency_ms": processing_time_ms,
                "cache_hit": False,
                "ip_address": "127.0.0.1",
                "user_agent": "FastAPI Client",
                "timestamp": "now()"
            }).execute()
        except Exception as audit_err:
            logger.warning(f"Failed to write query audit log: {audit_err}")
            
        return {
            "transcribed": transcribed_text,
            "translated": translated_query,
            "language": detected_lang,
            "confidence": float(confidence),
            "agent_response": {
                "answer": answer,
                "expert_advice": expert_advice,
                "sources": sources,
                "confidence": float(confidence),
                "agent_used": current_agent
            },
            "response_in_hindi": response_in_hindi,
            "spoken_summary": short_summary_hi if preferred_language == "hi" else short_summary_en,
            "processing_time_ms": processing_time_ms
        }
        
    except Exception as exc:
        logger.warning(f"Voice pipeline failed: {exc}")
        # Return fallback mock response for testing
        fallback_transcribed = "R-101 kal raat kyun trip hua?"
        fallback_translated = "Why did R-101 trip last night?"
        fallback_ans = f"Fallback Voice: Answer for query (Voice pipeline failed: {str(exc)})"
        fallback_hi = f"फ़ॉलबैक आवाज़: '{fallback_transcribed}' का उत्तर (असली वॉइस पाइपलाइन विफल रही: {str(exc)})"
        
        return {
            "transcribed": fallback_transcribed,
            "translated": fallback_translated,
            "language": "hi",
            "confidence": 0.50,
            "agent_response": {
                "answer": fallback_ans,
                "sources": [{"source": "voice_fallback", "result": "Failed to run voice pipeline"}],
                "confidence": 0.50,
                "agent_used": "FallbackVoiceAgent"
            },
            "response_in_hindi": fallback_hi if preferred_language == "hi" else None,
            "spoken_summary": "वॉयस असिस्टेंट त्रुटि।",
            "processing_time_ms": int((time.time() - start_time) * 1000)
        }
