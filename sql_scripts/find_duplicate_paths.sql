-- =============================================================================
-- Diagnostic Script: Find Duplicate Hierarchy Paths
-- =============================================================================
-- This script identifies duplicate values in the 'hierarchy_path' column
-- of the 'ai_tutor_content_hierarchy' table. A UNIQUE constraint cannot be
-- added until these duplicates are resolved.
--
-- Please run this script and share the output.
-- =============================================================================

-- Query 1: Show which 'hierarchy_path' values are duplicated and their counts.
SELECT
    hierarchy_path,
    COUNT(*) as duplicate_count
FROM
    public.ai_tutor_content_hierarchy
GROUP BY
    hierarchy_path
HAVING
    COUNT(*) > 1
ORDER BY
    duplicate_count DESC,
    hierarchy_path;

-- Query 2: Show the full details of the rows that have duplicate paths.
-- This will help you decide which rows to keep, modify, or delete.
SELECT
    id,
    level,
    hierarchy_path,
    parent_id,
    title,
    created_at
FROM
    public.ai_tutor_content_hierarchy
WHERE
    hierarchy_path IN (
        SELECT hierarchy_path
        FROM public.ai_tutor_content_hierarchy
        GROUP BY hierarchy_path
        HAVING COUNT(*) > 1
    )
ORDER BY
    hierarchy_path,
    id;
