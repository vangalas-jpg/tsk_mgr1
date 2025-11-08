/*
  # Create search_tasks function for vector similarity search

  1. New Functions
    - `search_tasks` - Performs vector similarity search on tasks
      - Parameters:
        - query_embedding (text) - JSON string of the query embedding vector
        - match_threshold (float) - Minimum similarity threshold (0-1)
        - match_count (int) - Maximum number of results to return
        - filter_user_id (uuid) - User ID to filter results
      - Returns: List of tasks with similarity scores above threshold
      
  2. Important Notes
    - Uses cosine similarity (1 - cosine distance) for matching
    - Only returns tasks belonging to the specified user
    - Results are ordered by similarity (highest first)
    - Filters out tasks without embeddings
*/

CREATE OR REPLACE FUNCTION search_tasks(
  query_embedding text,
  match_threshold float DEFAULT 0.8,
  match_count int DEFAULT 2,
  filter_user_id uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  title text,
  priority text,
  status text,
  user_id uuid,
  created_at timestamptz,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    tasks.id,
    tasks.title,
    tasks.priority,
    tasks.status,
    tasks.user_id,
    tasks.created_at,
    1 - (tasks.embedding <=> query_embedding::vector) AS similarity
  FROM tasks
  WHERE tasks.embedding IS NOT NULL
    AND tasks.user_id = filter_user_id
    AND 1 - (tasks.embedding <=> query_embedding::vector) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;
