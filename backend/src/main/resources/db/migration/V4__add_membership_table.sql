-- =============================================
-- V4: Membership table with role FK
-- =============================================

CREATE TABLE IF NOT EXISTS memberships (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id        UUID          NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id           UUID          NOT NULL REFERENCES users(id),
    project_role_id   UUID          NOT NULL REFERENCES project_roles(id),
    membership_role   VARCHAR(50)   NOT NULL DEFAULT 'MEMBER',
    status            VARCHAR(50)   NOT NULL DEFAULT 'ACTIVE',
    joined_at         TIMESTAMP     NOT NULL DEFAULT now(),

    -- Prevent duplicate active memberships for same user+project
    CONSTRAINT uq_membership_user_project UNIQUE (user_id, project_id)
);

-- Index for looking up memberships by project
CREATE INDEX IF NOT EXISTS idx_membership_project_id ON memberships(project_id);

-- Index for looking up memberships by user
CREATE INDEX IF NOT EXISTS idx_membership_user_id ON memberships(user_id);
