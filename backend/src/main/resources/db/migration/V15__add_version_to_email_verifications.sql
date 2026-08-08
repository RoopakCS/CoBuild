-- =============================================
-- V15: Add optimistic locking version column to email_verifications
--
-- Required by the @Version field added to EmailVerification.java
-- to prevent OTP brute-force race conditions.
-- =============================================

ALTER TABLE email_verifications
  ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0;
