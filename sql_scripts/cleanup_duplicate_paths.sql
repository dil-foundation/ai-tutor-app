-- =============================================================================
-- Cleanup Script: Remove Duplicate Hierarchy Paths
-- =============================================================================
-- This script safely removes duplicate records from the 'ai_tutor_content_hierarchy'
-- table based on the 'hierarchy_path' column.
--
-- For each set of duplicates, it keeps the row with the lowest 'id' (the
-- original entry) and deletes all subsequent copies.
-- =============================================================================

WITH duplicates AS (
    SELECT
        id,
        ROW_NUMBER() OVER(PARTITION BY hierarchy_path ORDER BY id) as row_num
    FROM
        public.ai_tutor_content_hierarchy
)
DELETE FROM
    public.ai_tutor_content_hierarchy
WHERE
    id IN (SELECT id FROM duplicates WHERE row_num > 1);

-- Verification
SELECT 'Duplicate rows have been successfully removed.' as result;