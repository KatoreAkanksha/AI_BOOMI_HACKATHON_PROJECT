# OAuth Authentication & Data Persistence Implementation Guide

## 🔐 OAuth Implementation Complete

### Backend Implementation ✅

**File: `server/index.js`**

1. **OAuth Endpoints Added:**
   - `POST /api/auth/google` - Verifies Google ID tokens
   - `POST /api/auth/facebook` - Verifies Facebook access tokens

2. **Database Schema Enhanced:**
   - Added `provider` field (email/google/facebook)
   - Added `provider_user_id` for OAuth identities  
   - Added `last_login` timestamp tracking
   - Modified `UNIQUE` constraint: `(email, provider)` to prevent duplicates

3. **Token Verification:**
   - Google: Uses `google-auth-library` to verify ID tokens
   - Facebook: Uses Graph API to validate access tokens
   - Prevents token spoofing and XSS attacks

4. **User Management:**
   - Existing users: Updates `last_login`, name, and profile picture
   - New users: Creates record with provider-specific ID
   - No duplicate accounts for same email+provider combo

### Frontend Implementation ✅

**File: `src/components/auth/AuthModal.tsx`**

1. **Google OAuth:**
   - Added `@react-oauth/google` integration
   - `handleGoogleSuccess()` function sends credential to backend
   - Proper error handling and toast notifications

2. **Facebook OAuth:**
   - `handleFacebookLogin()` initializes Facebook SDK
   - `handleFacebookSuccess()` sends access token to backend
   - Scope: `public_profile,email`

3. **User Profile Synchronization:**
   - Stores authenticated user in UserContext
   - Saves JWT token to localStorage
   - Redirects to onboarding for new OAuth users

### Environment Configuration Required

**File: `server/.env`**

```bash
# Add these values from your OAuth providers:
GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
FACEBOOK_APP_ID=your_facebook_app_id_here
FACEBOOK_APP_SECRET=your_facebook_app_secret_here
```

**How to get credentials:**

1. **Google:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create project → Enable "Google+ API"
   - Create OAuth 2.0 Client ID
   - Add authorized origins: `http://localhost:3000`, `http://localhost:5173`
   - Copy Client ID

2. **Facebook:**
   - Go to [Facebook Developers](https://developers.facebook.com/)
   - Create App → Select "Consumer" type
   - Settings → Basic → Copy App ID and App Secret
   - Add domain: `localhost`

## 📊 Assessment Data Persistence

### Data Flow

1. **User completes assessment** → `ChatWithTestAssessment.tsx`
2. **Scores calculated** → Flask `/report` endpoint (port 5002)
3. **Data saved to DB** → Node.js `/api/assessments` endpoint (port 5001)
4. **Dashboard loads data** → `/api/assessments/:userId` endpoint

### Database Schema

```sql
CREATE TABLE assessments (
  id INTEGER PRIMARY KEY,
  user_id TEXT,                    -- Links to users.user_id
  stress_score INTEGER,            -- 0-100
  depression_score INTEGER,        -- 0-100
  anxiety_score INTEGER,           -- 0-100
  stress_label TEXT,               -- Minimal/Mild/Moderate/Severe
  depression_label TEXT,
  anxiety_label TEXT,
  date TEXT,                       -- ISO timestamp
  notes TEXT,
  FOREIGN KEY(user_id) REFERENCES users(user_id)
);
```

### Privacy Guarantees

✅ **User Scoping:**
- All API endpoints require JWT authentication
- Data fetched only for `req.user.id`
- No cross-user data leakage

✅ **Session Invalidation:**
- Server restart generates new `SERVER_INSTANCE_ID`
- All old JWT tokens become invalid
- Frontend detects 401 → auto-logout

✅ **Storage Cleanup:**
- Logout clears: `auth_token`, `serenity-user`, cached assessments
- No sensitive data persists across sessions

## 🎯 Dashboard Implementation

### Real-Time Data Loading

**File: `src/pages/Dashboard.tsx`**

```typescript
// Fetch user-specific assessments
useEffect(() => {
  if (user.user_id) {
    apiFetch(`/api/assessments/${user.user_id}`)
      .then(data => {
        // Sort DESC (newest first)
        const sortedDesc = data.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setAssessments(sortedDesc);
      });
  }
}, [user.user_id]);
```

### Metrics Cards Display

- **Anxiety Card:** `assessments[0].anxiety_label` + score
- **Stress Card:** `assessments[0].stress_label` + score
- **Depression Card:** `assessments[0].depression_label` + score
- **Empty State:** "No Data Yet" if `assessments.length === 0`

### Chart Integration

- Historical trends plotted from `chartData` (sorted ASC)
- Updates automatically after new assessment
- No dummy data after first test

## 🧪 Testing Checklist

### Manual Testing

- [ ] Sign in with Google → Verify user created in DB
- [ ] Sign in with Google again → Verify `last_login` updated
- [ ] Sign in with Facebook → Verify user created
- [ ] Take assessment → Verify scores saved to DB
- [ ] Logout and login → Verify scores persist
- [ ] Dashboard shows latest scores
- [ ] Chart shows historical data
- [ ] Restart backend → Verify forced logout

### TestSprite Integration

Create these test suites:

**1. Authentication Tests**
```javascript
describe('OAuth Authentication', () => {
  test('Google login creates user', async () => {
    // Mock Google credential
    // Call /api/auth/google
    // Verify user in DB
  });
  
  test('Duplicate Google login updates last_login', async () => {
    // Sign in twice with same Google account
    // Verify single user record
    // Verify last_login changed
  });
  
  test('Invalid token rejected', async () => {
    // Send fake credential
    // Expect 401 response
  });
});
```

**2. Data Integrity Tests**
```javascript
describe('Assessment Persistence', () => {
  test('Scores linked to correct user', async () => {
    // Create 2 users
    // Submit assessments for each
    // Verify no data leakage
  });
  
  test('Scores persist after logout', async () => {
    // Login, take assessment, logout
    // Login again, fetch assessments
    // Verify data intact
  });
});
```

**3. Dashboard Tests**
```javascript
describe('Dashboard Data Loading', () => {
  test('Shows latest scores', async () => {
    // Take 3 assessments
    // Load dashboard
    // Verify newest scores displayed
  });
  
  test('Shows empty state for new user', async () => {
    // Login with new account
    // Load dashboard
    // Verify "No Data Yet" message
  });
});
```

## 🚀 Deployment Steps

1. **Install Dependencies:**
```bash
npm install google-auth-library @react-oauth/google --legacy-peer-deps
```

2. **Configure Environment:**
- Update `server/.env` with OAuth credentials
- Restart backend server

3. **Wrap App with GoogleOAuthProvider:**

**File: `src/App.tsx`**
```tsx
import { GoogleOAuthProvider } from '@react-oauth/google';

<GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
  <BrowserRouter>
    <UserProvider>
      {/* ... rest of app */}
    </UserProvider>
  </BrowserRouter>
</GoogleOAuthProvider>
```

4. **Initialize Facebook SDK:**

**File: `public/index.html`**
```html
<script>
  window.fbAsyncInit = function() {
    FB.init({
      appId: 'YOUR_FACEBOOK_APP_ID',
      cookie: true,
      xfbml: true,
      version: 'v18.0'
    });
  };
</script>
<script async defer src="https://connect.facebook.net/en_US/sdk.js"></script>
```

5. **Restart Services:**
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Node Backend
cd server && node index.js

# Terminal 3: Flask Assessment API
python app.py
```

## 📋 Final Verification

After implementation, verify these outcomes:

✅ Google/Facebook users authenticate correctly  
✅ User identity securely stored in database  
✅ Mental health scores persist permanently  
✅ Dashboard reflects real user data  
✅ Privacy maintained across sessions  
✅ No dummy data after first assessment  
✅ No cross-user data leakage  
✅ Forced logout on server restart  

## 🔗 Related Files Modified

- `server/index.js` - OAuth endpoints, user schema
- `server/.env` - OAuth credentials
- `src/components/auth/AuthModal.tsx` - OAuth handlers
- `src/pages/Dashboard.tsx` - Data loading fix
- `src/contexts/UserContext.tsx` - Lifecycle management
- `src/lib/api.ts` - Auth failure handling

## 📚 Documentation

- Google OAuth: https://developers.google.com/identity/gsi/web/guides/overview
- Facebook Login: https://developers.facebook.com/docs/facebook-login/web
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
