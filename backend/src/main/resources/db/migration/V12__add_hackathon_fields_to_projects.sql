-- V12: Add hackathon support fields to the projects table
-- projectType discriminates between SIDE_PROJECT and HACKATHON entries.
-- All hackathon-specific columns are nullable so existing SIDE_PROJECT rows
-- remain fully valid with no data migration needed.

ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS project_type       VARCHAR(20)  NOT NULL DEFAULT 'SIDE_PROJECT',
    ADD COLUMN IF NOT EXISTS event_start_date   DATE,
    ADD COLUMN IF NOT EXISTS event_end_date     DATE,
    ADD COLUMN IF NOT EXISTS registration_deadline DATE,
    ADD COLUMN IF NOT EXISTS prize_pool         VARCHAR(255),
    ADD COLUMN IF NOT EXISTS organizer_name     VARCHAR(255),
    ADD COLUMN IF NOT EXISTS hackathon_url      VARCHAR(500);
