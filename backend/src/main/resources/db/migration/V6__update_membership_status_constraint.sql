-- =============================================
-- V6: Update Membership Status Constraint
-- =============================================

-- Drop the existing constraint if it exists (which prevents LEAVE_PENDING from being inserted)
ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_status_check;

-- Re-add the constraint with the new LEAVE_PENDING status
ALTER TABLE memberships ADD CONSTRAINT memberships_status_check 
    CHECK (status IN ('ACTIVE', 'LEFT', 'REMOVED', 'LEAVE_PENDING'));
