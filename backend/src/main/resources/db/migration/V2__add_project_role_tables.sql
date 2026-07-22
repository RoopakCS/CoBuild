-- =============================================
-- V2: Project Role tables
-- =============================================

CREATE TABLE IF NOT EXISTS project_roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title           VARCHAR(255)  NOT NULL,
    description     TEXT,
    openings_count  INTEGER       NOT NULL DEFAULT 1,
    filled_count    INTEGER       NOT NULL DEFAULT 0,

    -- Constraints from checklist
    CONSTRAINT chk_openings_count_min CHECK (openings_count >= 1),
    CONSTRAINT chk_filled_lte_openings CHECK (filled_count <= openings_count),
    CONSTRAINT chk_filled_count_min CHECK (filled_count >= 0)
);

CREATE TABLE IF NOT EXISTS role_skills (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id     UUID NOT NULL REFERENCES project_roles(id) ON DELETE CASCADE,
    skill_name  VARCHAR(255) NOT NULL
);

-- Index for looking up roles by project
CREATE INDEX IF NOT EXISTS idx_project_role_project_id ON project_roles(project_id);

-- Index for looking up skills by role
CREATE INDEX IF NOT EXISTS idx_role_skill_role_id ON role_skills(role_id);
