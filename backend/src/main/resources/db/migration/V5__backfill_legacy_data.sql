-- =============================================
-- V5: Backfill legacy data
--
-- For any existing applications or memberships that
-- were created before the role_id FK was required,
-- create a "General Contributor" fallback role per project
-- and assign orphans to it.
-- =============================================

-- Step 1: Create a "General Contributor" role for every project that has
-- applications or memberships without a role assignment.
-- On a fresh database this is a no-op (no orphan rows exist).

INSERT INTO project_roles (id, project_id, title, description, openings_count, filled_count)
SELECT
    gen_random_uuid(),
    p.id,
    'General Contributor',
    'Auto-created role for legacy members/applicants who joined before roles were introduced.',
    GREATEST(
        (SELECT COUNT(*) FROM project_applications pa WHERE pa.project_id = p.id AND pa.role_id IS NULL) +
        (SELECT COUNT(*) FROM memberships m WHERE m.project_id = p.id AND m.project_role_id IS NULL),
        1
    ),
    (SELECT COUNT(*) FROM memberships m WHERE m.project_id = p.id AND m.project_role_id IS NULL AND m.status = 'ACTIVE')
FROM projects p
WHERE EXISTS (
    SELECT 1 FROM project_applications pa WHERE pa.project_id = p.id AND pa.role_id IS NULL
)
OR EXISTS (
    SELECT 1 FROM memberships m WHERE m.project_id = p.id AND m.project_role_id IS NULL
);

-- Step 2: Assign orphan applications to the fallback role
UPDATE project_applications pa
SET role_id = (
    SELECT pr.id FROM project_roles pr
    WHERE pr.project_id = pa.project_id
      AND pr.title = 'General Contributor'
    LIMIT 1
)
WHERE pa.role_id IS NULL;

-- Step 3: Assign orphan memberships to the fallback role
UPDATE memberships m
SET project_role_id = (
    SELECT pr.id FROM project_roles pr
    WHERE pr.project_id = m.project_id
      AND pr.title = 'General Contributor'
    LIMIT 1
)
WHERE m.project_role_id IS NULL;
