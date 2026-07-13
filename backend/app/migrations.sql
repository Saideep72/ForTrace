-- =====================================================================
-- FortTrace Database Migrations: Auth Completion & Asset/Document Metadata
-- Execute this script in your Supabase SQL Editor
-- =====================================================================

-- 1. Create refresh_tokens table (for JWT refresh token persistence)
CREATE TABLE IF NOT EXISTS refresh_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_revoked BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast token lookups
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

-- 2. Create revoked_tokens table (for JWT access token blacklisting)
CREATE TABLE IF NOT EXISTS revoked_tokens (
    token TEXT PRIMARY KEY,
    revoked_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast revocation checks
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_token ON revoked_tokens(token);

-- 3. Update assets table with soft-delete support
ALTER TABLE public.assets ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 4. Ensure documents table is configured with required columns for Phase 3 upload & soft delete
CREATE TABLE IF NOT EXISTS public.documents (
    doc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uat TEXT REFERENCES public.assets(uat) ON DELETE SET NULL,
    title TEXT NOT NULL,
    doc_type TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_hash TEXT UNIQUE NOT NULL,
    revision TEXT DEFAULT '1.0',
    compliance_scope TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID REFERENCES public.users(user_id) ON DELETE SET NULL
);

-- Index for fast document lookups by linked asset UAT
CREATE INDEX IF NOT EXISTS idx_documents_uat ON public.documents(uat);
CREATE INDEX IF NOT EXISTS idx_documents_file_hash ON public.documents(file_hash);

-- 5. Create match_embeddings database function for pgvector similarity search
CREATE OR REPLACE FUNCTION public.match_embeddings(
  query_embedding vector(1024),
  match_threshold float,
  match_count int,
  filter_uat text DEFAULT NULL
)
RETURNS TABLE (
  embedding_id uuid,
  doc_id uuid,
  chunk_index int,
  chunk_text text,
  chunk_metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    document_embeddings.embedding_id,
    document_embeddings.doc_id,
    document_embeddings.chunk_index,
    document_embeddings.chunk_text,
    document_embeddings.chunk_metadata,
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity
  FROM document_embeddings
  WHERE 
    (document_embeddings.embedding IS NOT NULL)
    AND (1 - (document_embeddings.embedding <=> query_embedding) > match_threshold)
    AND (filter_uat IS NULL OR (document_embeddings.chunk_metadata->>'uat') = filter_uat)
  ORDER BY document_embeddings.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;


-- =====================================================================
-- 6. Create extracted_entities table for Phase 5 NER
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.extracted_entities (
    entity_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doc_id UUID REFERENCES public.documents(doc_id) ON DELETE CASCADE,
    entity_type VARCHAR(50) NOT NULL,
    entity_value TEXT NOT NULL,
    start_char INT NOT NULL,
    end_char INT NOT NULL,
    confidence FLOAT DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast document lookups
CREATE INDEX IF NOT EXISTS idx_extracted_entities_doc ON public.extracted_entities(doc_id);
-- Index for entity type filtering
CREATE INDEX IF NOT EXISTS idx_extracted_entities_type ON public.extracted_entities(entity_type);
