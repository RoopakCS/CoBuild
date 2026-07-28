CREATE TABLE IF NOT EXISTS project_workspace_links (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL,
    added_by_id UUID NOT NULL,
    title VARCHAR(200) NOT NULL,
    url VARCHAR(2000) NOT NULL,
    category VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT fk_workspace_links_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    CONSTRAINT fk_workspace_links_added_by FOREIGN KEY (added_by_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_workspace_links_project_id ON project_workspace_links(project_id);
