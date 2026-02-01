-- Mental Wellness Platform Database Schema
-- SQLite3 (Production-ready for current scale)

-- ==========================================
-- USERS TABLE (Enhanced for OAuth)
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  password TEXT,                    -- NULL for OAuth users
  provider TEXT DEFAULT 'email',    -- 'email' | 'google' | 'facebook'
  provider_user_id TEXT,            -- OAuth provider's user ID
  profile_picture TEXT,
  age INTEGER,
  gender TEXT,
  created_at TEXT NOT NULL,
  last_login TEXT,
  UNIQUE(email, provider)           -- Prevents duplicate OAuth accounts
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_provider ON users(provider);
CREATE INDEX idx_users_last_login ON users(last_login);

-- ==========================================
-- ASSESSMENTS TABLE (Mental Health Scores)
-- ==========================================
CREATE TABLE IF NOT EXISTS assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  stress_score INTEGER NOT NULL CHECK(stress_score >= 0 AND stress_score <= 100),
  depression_score INTEGER NOT NULL CHECK(depression_score >= 0 AND depression_score <= 100),
  anxiety_score INTEGER NOT NULL CHECK(anxiety_score >= 0 AND anxiety_score <= 100),
  stress_label TEXT CHECK(stress_label IN ('Minimal', 'Mild', 'Moderate', 'Severe')),
  depression_label TEXT CHECK(depression_label IN ('Minimal', 'Mild', 'Moderate', 'Severe')),
  anxiety_label TEXT CHECK(anxiety_label IN ('Minimal', 'Mild', 'Moderate', 'Severe')),
  date TEXT NOT NULL DEFAULT (datetime('now')),
  notes TEXT,
  FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Indexes for dashboard queries
CREATE INDEX idx_assessments_user ON assessments(user_id);
CREATE INDEX idx_assessments_date ON assessments(date DESC);
CREATE INDEX idx_assessments_user_date ON assessments(user_id, date DESC);

-- ==========================================
-- CHAT HISTORY TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS chat_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'bot')),
  content TEXT NOT NULL,
  emotion TEXT,
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_chat_user ON chat_history(user_id);
CREATE INDEX idx_chat_timestamp ON chat_history(timestamp DESC);

-- ==========================================
-- CHAT SESSIONS TABLE (Mood Summaries)
-- ==========================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  primary_mood TEXT,
  mood_trend TEXT,
  themes TEXT,                -- JSON string
  positive_triggers TEXT,     -- JSON string
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE INDEX idx_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_sessions_timestamp ON chat_sessions(timestamp DESC);

-- ==========================================
-- MIGRATION SCRIPT (Run after schema changes)
-- ==========================================

-- Add OAuth fields to existing users table
ALTER TABLE users ADD COLUMN provider TEXT DEFAULT 'email';
ALTER TABLE users ADD COLUMN provider_user_id TEXT;
ALTER TABLE users ADD COLUMN last_login TEXT;

-- Add assessment labels
ALTER TABLE assessments ADD COLUMN stress_label TEXT;
ALTER TABLE assessments ADD COLUMN depression_label TEXT;
ALTER TABLE assessments ADD COLUMN anxiety_label TEXT;

-- Update existing users with default provider
UPDATE users SET provider = 'email' WHERE provider IS NULL;

-- ==========================================
-- SAMPLE QUERIES (For Dashboard & Analytics)
-- ==========================================

-- Get latest assessment for user
SELECT 
  anxiety_score, anxiety_label,
  stress_score, stress_label,
  depression_score, depression_label,
  date
FROM assessments
WHERE user_id = ?
ORDER BY date DESC
LIMIT 1;

-- Get assessment trend (last 30 days)
SELECT 
  date,
  anxiety_score,
  stress_score,
  depression_score
FROM assessments
WHERE user_id = ?
  AND date >= datetime('now', '-30 days')
ORDER BY date ASC;

-- Get user profile with last login
SELECT 
  user_id,
  name,
  email,
  provider,
  profile_picture,
  last_login,
  created_at
FROM users
WHERE user_id = ?;

-- Count assessments by user
SELECT 
  user_id,
  COUNT(*) as total_assessments,
  MAX(date) as last_assessment
FROM assessments
GROUP BY user_id;

-- ==========================================
-- DATA INTEGRITY CHECKS
-- ==========================================

-- Ensure no orphaned assessments
DELETE FROM assessments
WHERE user_id NOT IN (SELECT user_id FROM users);

-- Find duplicate OAuth accounts (should be empty)
SELECT email, provider, COUNT(*)
FROM users
GROUP BY email, provider
HAVING COUNT(*) > 1;

-- Verify score ranges
SELECT 
  COUNT(*) as invalid_scores
FROM assessments
WHERE anxiety_score NOT BETWEEN 0 AND 100
   OR stress_score NOT BETWEEN 0 AND 100
   OR depression_score NOT BETWEEN 0 AND 100;
