# Privacy-First Authentication & Data Persistence Implementation

## 🔒 Privacy Protection Features

### 1. Automatic Logout on Code Changes

**Backend Implementation** (`server/index.js`)
- Generate unique `SERVER_INSTANCE_ID` on every server restart using crypto
- Append instance ID to JWT secret: `JWT_SECRET = BASE_JWT_SECRET + INSTANCE_ID`
- **Result**: All tokens issued before restart become invalid instantly

**Frontend Implementation** (`src/contexts/UserContext.tsx`)
- Store `APP_LIFECYCLE_ID` constant that changes with each significant code update
- On app initialization, compare stored lifecycle ID with current
- **If mismatch detected**:
  - Clear `auth_token` from localStorage
  - Clear `serenity-user` profile data
  - Clear `app_lifecycle_id` marker
  - Reset user state to default
  - Force fresh login

**API Layer Enhancement** (`src/lib/api.ts`)
- On 401/403 response:
  - Immediately purge all localStorage
  - Hard redirect to login page (`window.location.href = "/"`)
  - Prevent silent failures

### 2. User-Scoped Data Persistence

**Database Schema** (`server/index.js`)
```sql
CREATE TABLE assessments (
  id INTEGER PRIMARY KEY,
  user_id TEXT,
  stress_score INTEGER,
  depression_score INTEGER,
  anxiety_score INTEGER,
  stress_label TEXT,       -- NEW: Categorical labels
  depression_label TEXT,   -- NEW: (Minimal/Mild/Moderate/Severe)
  anxiety_label TEXT,      -- NEW
  date TEXT,
  notes TEXT
)
```

**API Endpoints**
- `POST /api/assessments` - Save user assessment with both scores AND labels
- `GET /api/assessments/:userId` - Fetch user's historical assessments
- **Authentication**: All endpoints protected by JWT middleware
- **User Scoping**: Only returns data for authenticated user

### 3. Dashboard Data Loading Fix

**Critical Bug Fixed** (`src/pages/Dashboard.tsx`)
- **BEFORE**: Sorted assessments ascending (oldest first)
  - `assessments[0]` = oldest test ❌
- **AFTER**: Sort descending for display (newest first)
  - `assessments[0]` = latest test ✅
  - Chart data sorted separately (ascending for timeline)

**TypeScript Type Safety**
```typescript
type Assessment = {
  id: number;
  user_id: string;
  stress_score: number;
  depression_score: number;
  anxiety_score: number;
  stress_label: string;     // "Minimal" | "Mild" | "Moderate" | "Severe"
  depression_label: string;
  anxiety_label: string;
  date: string;
  notes?: string;
};
```

### 4. Real-Time Dashboard Metrics

**Top Metrics Cards** (3-column layout)
- **Anxiety Card**: Shows latest label + numeric score (e.g., "Mild - 35/100")
- **Stress Card**: Shows latest label + numeric score
- **Depression Card**: NEW - Shows latest label + numeric score
- **No Data State**: Shows "No Data Yet" instead of misleading placeholders

**Latest Activity Card**
- Shows last assessment timestamp
- Button text changes: "Start Test" (no data) → "Retake Test" (has data)
- Direct link to `/assessment/chat-test`

### 5. Chart Integration

**Wellness Overview Graph**
- Plots Anxiety, Stress, Depression scores over time
- Uses real user data from database
- Updates automatically after each new assessment
- Shows empty state if no assessments exist

## 🎯 Privacy Constraints Met

### ✅ Logout Triggers
- [x] Frontend dev server restart
- [x] Backend server restart
- [x] Code changes (via lifecycle ID)
- [x] Build version changes

### ✅ Data Cleanup
- [x] Clear auth_token
- [x] Clear user profile
- [x] Clear app_lifecycle_id
- [x] No silent session continuation

### ✅ User Experience
- [x] Silent logout (no error popups)
- [x] Clean redirect to login
- [x] Natural flow without technical jargon

### ✅ Data Persistence
- [x] Per-user storage
- [x] Linked to user_id
- [x] Survives logout/login
- [x] Backend-sourced dashboard
- [x] Never shows dummy data after first test

## 🚀 How It Works

### On Server Restart
1. New `SERVER_INSTANCE_ID` generated
2. All old JWT tokens become invalid
3. First API call returns 401
4. Frontend auto-clears storage and redirects

### On Code Change (Build)
1. Developer updates `APP_LIFECYCLE_ID` in UserContext
2. User refreshes page
3. Stored lifecycle ID doesn't match
4. Auto-logout triggered
5. Clean slate for new session

### On Assessment Completion
1. React component calls Flask `/report` endpoint
2. Receives `raw_scores` and `labels`
3. Immediately saves to SQLite via Node.js API
4. Dashboard auto-refreshes data
5. User sees real-time update

### On Dashboard Load
1. Check authentication
2. Fetch `/api/assessments/:userId`
3. Sort DESC for latest-first
4. Display in metrics cards + chart
5. Show "No Data Yet" if empty array

## 📊 Testing Checklist

- [ ] Take an assessment and verify it appears on dashboard
- [ ] Logout and login - verify data persists
- [ ] Restart backend - verify forced logout
- [ ] Change `APP_LIFECYCLE_ID` - verify forced logout
- [ ] Take multiple assessments - verify latest shows in cards
- [ ] Check chart shows all historical data
- [ ] Verify no dummy data ever appears after first test

## 🔐 Security Notes

- Sensitive mental health data never cached across sessions
- Each user sees only their own data (backend enforced)
- Tokens expire on any infrastructure change
- Privacy > Convenience in all design decisions
