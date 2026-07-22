-- =============================================
-- V3: Application table with role FK
-- =============================================

CREATE TABLE IF NOT EXISTS project_applications (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id      UUID          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    applicant_id    UUID          NOT NULL REFERENCES users(id),
    role_id         UUID          NOT NULL REFERENCES project_roles(id),
    message         TEXT,
    status          VARCHAR(50)   NOT NULL DEFAULT 'PENDING',
    created_at      TIMESTAMP     NOT NULL DEFAULT now(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT now(),

    -- Prevent duplicate active applications for the same user+project
    CONSTRAINT uq_application_user_project UNIQUE (applicant_id, project_id)
);

-- Index for looking up applications by project
CREATE INDEX IF NOT EXISTS idx_application_project_id ON project_applications(project_id);

-- Index for looking up applications by applicant
CREATE INDEX IF NOT EXISTS idx_application_applicant_id ON project_applications(applicant_id);

-- Index for looking up applications by role
CREATE INDEX IF NOT EXISTS idx_application_role_id ON project_applications(role_id);
