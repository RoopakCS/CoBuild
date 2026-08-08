-- =============================================
-- V14: Add ON DELETE CASCADE to role foreign keys
--
-- Discovers the real FK constraint names at runtime from
-- information_schema so this works regardless of how
-- Supabase/PostgreSQL auto-named them.
-- =============================================

DO $$
DECLARE
    v_app_constraint  TEXT;
    v_mem_constraint  TEXT;
BEGIN
    -- Find the FK from project_applications.role_id -> project_roles
    SELECT tc.constraint_name
      INTO v_app_constraint
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema    = kcu.table_schema
      JOIN information_schema.referential_constraints rc
        ON tc.constraint_name = rc.constraint_name
       AND tc.table_schema    = rc.constraint_schema
      JOIN information_schema.table_constraints tc2
        ON rc.unique_constraint_name = tc2.constraint_name
     WHERE tc.constraint_type = 'FOREIGN KEY'
       AND tc.table_name      = 'project_applications'
       AND kcu.column_name    = 'role_id'
       AND tc2.table_name     = 'project_roles'
     LIMIT 1;

    IF v_app_constraint IS NOT NULL THEN
        EXECUTE format(
            'ALTER TABLE project_applications
               DROP CONSTRAINT %I,
               ADD CONSTRAINT %I
                 FOREIGN KEY (role_id) REFERENCES project_roles(id) ON DELETE CASCADE',
            v_app_constraint, v_app_constraint
        );
    END IF;

    -- Find the FK from memberships.project_role_id -> project_roles
    SELECT tc.constraint_name
      INTO v_mem_constraint
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
       AND tc.table_schema    = kcu.table_schema
      JOIN information_schema.referential_constraints rc
        ON tc.constraint_name = rc.constraint_name
       AND tc.table_schema    = rc.constraint_schema
      JOIN information_schema.table_constraints tc2
        ON rc.unique_constraint_name = tc2.constraint_name
     WHERE tc.constraint_type = 'FOREIGN KEY'
       AND tc.table_name      = 'memberships'
       AND kcu.column_name    = 'project_role_id'
       AND tc2.table_name     = 'project_roles'
     LIMIT 1;

    IF v_mem_constraint IS NOT NULL THEN
        EXECUTE format(
            'ALTER TABLE memberships
               DROP CONSTRAINT %I,
               ADD CONSTRAINT %I
                 FOREIGN KEY (project_role_id) REFERENCES project_roles(id) ON DELETE CASCADE',
            v_mem_constraint, v_mem_constraint
        );
    END IF;
END;
$$;
