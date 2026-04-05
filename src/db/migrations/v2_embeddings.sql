-- Migration: Upgrade embeddings from 1536d (text-embedding-3-small) to 3072d (text-embedding-3-large)
--
-- Run this in Supabase SQL Editor or via psql:
--   psql $SUPABASE_DB_URL -f src/db/migrations/v2_embeddings.sql
--
-- After running this SQL, re-embed templates with:
--   python -m src.db.migrate_v2_embeddings
--
-- WARNING: This nullifies existing embeddings. They must be regenerated.

BEGIN;

-- 1. Backup existing table
DROP TABLE IF EXISTS task_templates_backup;
CREATE TABLE task_templates_backup AS SELECT * FROM task_templates;

-- 2. Drop the old IVF-flat vector index (references 1536 dims)
DROP INDEX IF EXISTS idx_templates_embedding;

-- 3. Temporarily drop the NOT NULL constraint so we can alter the type
--    (pgvector cannot cast 1536-dim vectors to 3072-dim in place)
ALTER TABLE task_templates ALTER COLUMN embedding DROP NOT NULL;
UPDATE task_templates SET embedding = NULL;

-- 4. Change column type to 3072 dimensions
ALTER TABLE task_templates ALTER COLUMN embedding TYPE vector(3072);

-- 5. Restore NOT NULL after re-embedding (commented out — run after re-embedding)
-- ALTER TABLE task_templates ALTER COLUMN embedding SET NOT NULL;

-- 6. No ANN index needed at <100 templates — exact scan with <=> is faster.
--    Uncomment below if you grow past ~500 templates:
-- CREATE INDEX idx_templates_embedding ON task_templates
--     USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);

COMMIT;

-- Verify
SELECT
    COUNT(*) AS template_count,
    (SELECT column_name || ' ' || udt_name
     FROM information_schema.columns
     WHERE table_name = 'task_templates' AND column_name = 'embedding') AS embedding_column
FROM task_templates;
