/*
  # Add vector search capabilities to tasks

  1. Changes
    - Enable the pgvector extension for vector similarity search
    - Add embedding column to tasks table to store vector embeddings
    - Create index on embedding column for faster similarity searches
    
  2. New Columns
    - `embedding` (vector(384)) - Vector embedding of task title for semantic search
    
  3. Important Notes
    - Uses pgvector extension for vector operations
    - Embedding dimension is 384 (compatible with gte-small model)
    - Index enables fast similarity searches using cosine distance
*/

CREATE EXTENSION IF NOT EXISTS vector;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'embedding'
  ) THEN
    ALTER TABLE tasks ADD COLUMN embedding vector(384);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS tasks_embedding_idx ON tasks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
