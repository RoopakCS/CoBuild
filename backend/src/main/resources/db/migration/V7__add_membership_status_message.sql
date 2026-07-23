-- =============================================
-- V7: Add status_message to memberships
-- =============================================

ALTER TABLE memberships ADD COLUMN status_message TEXT;
