import os
import logging
from typing import List
from sentence_transformers import SentenceTransformer

logger = logging.getLogger("forttrace.embedding")

# Model configurations - resolves to the locally downloaded model directory
MODEL_NAME = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "model_bge_large")
_model_instance: SentenceTransformer | None = None

def get_model() -> SentenceTransformer:
    """
    Lazy loader for SentenceTransformer to prevent overhead at application startup.
    """
    global _model_instance
    if _model_instance is None:
        logger.info(f"Loading SentenceTransformer model '{MODEL_NAME}' into memory...")
        # Auto-detects device internally (uses CUDA if available, else CPU)
        _model_instance = SentenceTransformer(MODEL_NAME)
        logger.info("SentenceTransformer model loaded successfully.")
    return _model_instance

def get_embedding(text: str) -> List[float]:
    """
    Encodes a single text chunk into a 1024-dimensional vector embedding.
    """
    if not text:
        return []
    
    try:
        model = get_model()
        embedding = model.encode(text, normalize_embeddings=True)
        return embedding.tolist()
    except Exception as e:
        logger.error(f"Failed to generate embedding: {e}")
        raise RuntimeError(f"Embedding generation failed: {str(e)}")

def get_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Encodes a list of texts for optimized batch vector generation.
    """
    if not texts:
        return []
        
    try:
        model = get_model()
        embeddings = model.encode(texts, normalize_embeddings=True, show_progress_bar=False)
        return [emb.tolist() for emb in embeddings]
    except Exception as e:
        logger.error(f"Failed to generate batch embeddings: {e}")
        raise RuntimeError(f"Batch embedding generation failed: {str(e)}")
