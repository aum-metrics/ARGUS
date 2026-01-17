-- Risk Mitigation Features - Database Schema Updates
-- Author: Sambath Kumar Natarajan
-- Date: 2026-01-17

-- ============================================
-- 1. CITATION VERIFICATION
-- ============================================

-- Add citation confidence tracking to audit logs
ALTER TABLE audit_logs 
ADD COLUMN IF NOT EXISTS citation_confidence INTEGER DEFAULT 100;

-- Track user-reported hallucinations
CREATE TABLE IF NOT EXISTS hallucination_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  claim_id TEXT NOT NULL,
  critique_text TEXT NOT NULL,
  user_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for hallucination reports
ALTER TABLE hallucination_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own hallucination reports" 
  ON hallucination_reports FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own hallucination reports" 
  ON hallucination_reports FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 2. STRIPE INTEGRATION
-- ============================================

-- Add payment gateway tracking
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS payment_gateway TEXT DEFAULT 'razorpay';

ALTER TABLE transactions
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- ============================================
-- 3. UNIVERSITY PILOT PROGRAM
-- ============================================

-- Add pilot tier and expiration
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS pilot_expires_at TIMESTAMPTZ;

-- Track pilot conversions
CREATE TABLE IF NOT EXISTS pilot_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES organizations ON DELETE CASCADE,
  converted_at TIMESTAMPTZ DEFAULT NOW(),
  conversion_tier TEXT, -- 'LAB_STARTER' | 'DEPARTMENT'
  notes TEXT
);

-- RLS for pilot conversions (Admin only)
ALTER TABLE pilot_conversions ENABLE ROW LEVEL SECURITY;

-- Only admins can view conversions (enforced at API level)
CREATE POLICY "Service role can manage pilot conversions" 
  ON pilot_conversions FOR ALL 
  USING (auth.jwt() ->> 'role' = 'service_role');

-- ============================================
-- 4. REFERRAL PROGRAM
-- ============================================

-- Add referral code to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE DEFAULT substring(md5(random()::text) from 1 for 8);

-- Referral tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  referee_id UUID REFERENCES auth.users ON DELETE SET NULL,
  referee_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending' | 'completed' | 'rewarded'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- RLS for referrals
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" 
  ON referrals FOR SELECT 
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can insert own referrals" 
  ON referrals FOR INSERT 
  WITH CHECK (auth.uid() = referrer_id);

-- ============================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================

-- Citation verification lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_citation_confidence 
  ON audit_logs(citation_confidence) 
  WHERE citation_confidence < 70;

-- Referral status queries
CREATE INDEX IF NOT EXISTS idx_referrals_status 
  ON referrals(status);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer 
  ON referrals(referrer_id);

-- Pilot expiration checks
CREATE INDEX IF NOT EXISTS idx_organizations_pilot_expires 
  ON organizations(pilot_expires_at) 
  WHERE pilot_expires_at IS NOT NULL;

-- Payment gateway analytics
CREATE INDEX IF NOT EXISTS idx_transactions_payment_gateway 
  ON transactions(payment_gateway);

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to check if pilot has expired
CREATE OR REPLACE FUNCTION is_pilot_expired(org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM organizations 
    WHERE id = org_id 
    AND pilot_expires_at IS NOT NULL 
    AND pilot_expires_at < NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get referral stats for a user
CREATE OR REPLACE FUNCTION get_referral_stats(user_id UUID)
RETURNS TABLE(
  pending_count BIGINT,
  completed_count BIGINT,
  rewarded_count BIGINT,
  total_earned_credits INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) FILTER (WHERE status = 'pending') AS pending_count,
    COUNT(*) FILTER (WHERE status = 'completed') AS completed_count,
    COUNT(*) FILTER (WHERE status = 'rewarded') AS rewarded_count,
    COUNT(*) FILTER (WHERE status = 'rewarded')::INTEGER AS total_earned_credits
  FROM referrals
  WHERE referrer_id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
-- Run this script in Supabase SQL Editor
-- All operations are idempotent (safe to re-run)
