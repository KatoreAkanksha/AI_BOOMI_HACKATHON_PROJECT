# 🔐 Complete OAuth Configuration Guide - Production Ready

## 🚨 CRITICAL: Why Your OAuth is Failing

### **Root Causes Identified:**

1. **HTTP instead of HTTPS** - Google OAuth REQUIRES secure origins
2. **Client ID Misconfiguration** - Wrong type or missing setup
3. **Redirect URI Mismatch** - Configured URIs don't match actual URLs
4. **Testing Mode Restrictions** - App only allows specific test users

---

## ✅ STEP 1: Enable HTTPS for Local Development (REQUIRED)

### **Why HTTPS is Mandatory:**

OAuth tokens are sensitive and can be intercepted on HTTP. Google **blocks** OAuth on insecure origins.

### **Quick Setup with mkcert:**

```powershell
# 1. Install mkcert (Run PowerShell as Administrator)
choco install mkcert

# 2. Generate SSL certificates
.\generate-ssl.ps1

# 3. Restart dev server
npm run dev

# 4. Access at: https://localhost:5173 (not http://)
```

### **Verify HTTPS is Working:**

1. Open browser to `https://localhost:5173` (note HTTPS)
2. Browser shows 🔒 lock icon (not "Not Secure")
3. No certificate warnings

**⚠️ If you see certificate warning:**
- Click "Advanced" → "Proceed to localhost"
- OR run `mkcert -install` to trust local CA

---

## ✅ STEP 2: Google Cloud Console Configuration

### **A. Create OAuth 2.0 Credentials (Correct Way)**

1. **Go to:** https://console.cloud.google.com/
2. **Select your project** (or create new one)
3. **Navigate to:** APIs & Services → Credentials
4. **Click:** Create Credentials → OAuth 2.0 Client ID

### **B. Application Type Selection**

**CRITICAL:** Select **"Web application"** (NOT Desktop/iOS/Android)

### **C. Configure Authorized JavaScript Origins**

Add **ALL** of these:

```
https://localhost:5173
https://localhost:3000
https://127.0.0.1:5173
http://localhost:5173
http://localhost:3000
```

**Note:** Include both HTTP and HTTPS for development flexibility, but **OAuth will only work on HTTPS**.

### **D. Configure Authorized Redirect URIs**

Add **ALL** of these:

```
https://localhost:5173
https://localhost:5173/
https://localhost:5173/auth/callback
https://localhost:3000
https://localhost:3000/
http://localhost:5173
http://localhost:5173/
```

### **E. OAuth Consent Screen Configuration**

1. **Navigate to:** OAuth consent screen
2. **User Type:** 
   - **Testing:** Select "Internal" or "External" + add test users
   - **Production:** Select "External" + submit for verification
3. **App Information:**
   - App name: "Mental Wellness Platform" (or your app name)
   - User support email: your-email@gmail.com
   - Developer contact: your-email@gmail.com
4. **Scopes:**
   - Add: `./auth/userinfo.email`
   - Add: `./auth/userinfo.profile`
   - Add: `openid`
5. **Test Users (if in Testing mode):**
   - Click "Add Users"
   - Add YOUR Google email
   - Add any other test user emails
   
**⚠️ CRITICAL:** If app is in "Testing" mode, ONLY test users can sign in!

### **F. Copy Your Credentials**

After creating, you'll see:
- **Client ID:** `123456789-abc123.apps.googleusercontent.com`
- **Client Secret:** `GOCSPX-abc123xyz` (keep secret!)

---

## ✅ STEP 3: Update Environment Variables (EXACT FORMAT)

### **Frontend (`.env` in project root):**

```bash
# Google OAuth - PRODUCTION FORMAT
VITE_GOOGLE_CLIENT_ID=123456789-abc123def456ghi789.apps.googleusercontent.com

# Facebook OAuth
VITE_FACEBOOK_APP_ID=1234567890123456

# API Endpoints
VITE_API_URL=https://localhost:5001
VITE_ASSESSMENT_API_URL=https://localhost:5002
```

**⚠️ CRITICAL RULES:**
- ✅ Use EXACT Client ID from Google Console
- ✅ Must end with `.apps.googleusercontent.com`
- ✅ NO quotes, NO spaces
- ✅ Prefix with `VITE_` for Vite to expose it
- ❌ DO NOT put Client Secret in frontend!

### **Backend (`server/.env`):**

```bash
# Google OAuth (for backend verification)
GOOGLE_CLIENT_ID=123456789-abc123def456ghi789.apps.googleusercontent.com

# Facebook OAuth
FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=your_facebook_app_secret_here

# JWT & Security
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
PORT=5001

# Other APIs
GROQ_API_KEY=your_groq_api_key
```

**Security Notes:**
- ✅ Client Secret stays ONLY in backend
- ✅ Use same Client ID in frontend and backend
- ✅ Change JWT_SECRET to strong random value

---

## ✅ STEP 4: Verify OAuth Flow (Testing Checklist)

### **Pre-Flight Checks:**

```powershell
# 1. Check HTTPS is enabled
# Access: https://localhost:5173
# Should show 🔒 in browser

# 2. Verify environment variables loaded
# Open browser console:
console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID)
# Should output your Client ID

# 3. Check backend has credentials
cd server
type .env | findstr GOOGLE
# Should show GOOGLE_CLIENT_ID=...
```

### **OAuth Flow Testing:**

1. **Open:** `https://localhost:5173` (HTTPS!)
2. **Click:** "Get Started" or "Sign In"
3. **Expected:** Google Sign-In button appears (blue with Google logo)
4. **Click:** Google Sign-In button
5. **Expected:** Google popup opens (NOT blocked)
6. **Select:** Your Google account (must be test user if app in Testing mode)
7. **Expected:** Consent screen (first time only)
8. **Click:** "Continue" or "Allow"
9. **Expected:** Popup closes, redirected to dashboard/onboarding
10. **Verify:** Check browser console for "✅ Google auth successful"

### **Database Verification:**

```powershell
# Check user was saved
cd server
sqlite3 users.db

SELECT user_id, name, email, provider, last_login FROM users WHERE provider='google';
# Should show your user record
```

---

## ✅ STEP 5: Common Errors & Solutions

### **Error: "Access blocked: Authorization Error"**

**Cause:** App in "Testing" mode, your email not in test users list

**Fix:**
1. Go to OAuth consent screen
2. Scroll to "Test users"
3. Click "Add Users"
4. Add your Google email
5. Save and try again

---

### **Error: "401 invalid_client"**

**Causes & Fixes:**

1. **Wrong Client ID:**
   ```bash
   # Check frontend .env
   echo %VITE_GOOGLE_CLIENT_ID%
   # Must match Google Console exactly
   ```

2. **Client deleted/expired:**
   - Go to Google Console → Credentials
   - Verify OAuth 2.0 Client still exists
   - If deleted, create new one

3. **Wrong application type:**
   - Must be "Web application" not "Desktop"
   - Delete and recreate if wrong

4. **Redirect URI mismatch:**
   - Check authorized URIs include `https://localhost:5173`
   - Include trailing slash: `https://localhost:5173/`

---

### **Error: "Popup blocked"**

**Cause:** Browser blocks popup on insecure origin (HTTP)

**Fix:**
1. Ensure using HTTPS: `https://localhost:5173`
2. Restart browser after installing certificates
3. Check browser popup blocker settings

---

### **Error: "Not Secure" warning**

**Cause:** Accessing via HTTP instead of HTTPS

**Fix:**
1. Run `.\generate-ssl.ps1`
2. Restart dev server
3. Access `https://localhost:5173` (not `http://`)
4. Trust certificate if prompted

---

### **Error: "Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID"**

**Cause:** Self-signed certificate not trusted

**Fix:**
```powershell
# Run as Administrator
mkcert -install
# Restart browser
```

---

## ✅ STEP 6: Production Deployment

### **For Production (Vercel/Netlify/AWS):**

1. **Update Authorized Origins:**
   ```
   https://yourdomain.com
   https://www.yourdomain.com
   ```

2. **Update Redirect URIs:**
   ```
   https://yourdomain.com
   https://yourdomain.com/auth/callback
   ```

3. **Environment Variables:**
   - Set `VITE_GOOGLE_CLIENT_ID` in hosting dashboard
   - Set `GOOGLE_CLIENT_ID` in backend environment
   - Use production domain in API URLs

4. **SSL Certificate:**
   - Hosting providers auto-provision SSL (Let's Encrypt)
   - No manual cert needed

5. **OAuth Consent Screen:**
   - Submit app for verification
   - Switch from "Testing" to "Published"

---

## ✅ STEP 7: Security Best Practices

### **DO:**
- ✅ Always use HTTPS in production
- ✅ Verify Google ID tokens on backend
- ✅ Store Client Secret only in backend
- ✅ Use httpOnly cookies for session tokens
- ✅ Implement CSRF protection
- ✅ Rotate JWT secrets regularly
- ✅ Log OAuth failures for monitoring

### **DON'T:**
- ❌ Expose Client Secret in frontend code
- ❌ Trust frontend tokens without backend verification
- ❌ Use HTTP in production
- ❌ Store sensitive data in localStorage (use httpOnly cookies)
- ❌ Skip token expiration checks
- ❌ Allow wildcard redirect URIs

---

## ✅ STEP 8: Data Persistence Architecture

### **User Storage (database):**

```sql
CREATE TABLE users (
  user_id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT,
  provider TEXT,           -- 'google' | 'facebook' | 'email'
  provider_user_id TEXT,   -- Google/Facebook ID
  profile_picture TEXT,
  last_login TEXT,
  created_at TEXT
);
```

### **Assessment Storage:**

```sql
CREATE TABLE assessments (
  id INTEGER PRIMARY KEY,
  user_id TEXT,
  anxiety_score INTEGER,
  stress_score INTEGER,
  depression_score INTEGER,
  anxiety_label TEXT,
  stress_label TEXT,
  depression_label TEXT,
  date TEXT,
  FOREIGN KEY(user_id) REFERENCES users(user_id)
);
```

### **Dashboard Data Loading:**

```typescript
// On login success:
1. Backend verifies Google token
2. Backend creates/updates user in database
3. Backend returns app JWT token
4. Frontend stores JWT in httpOnly cookie
5. Frontend fetches user assessments
6. Dashboard displays real historical data
```

---

## 📋 Final Checklist

Before testing OAuth:

- [ ] HTTPS enabled (certificates generated)
- [ ] Accessing `https://localhost:5173` (not http://)
- [ ] Browser shows 🔒 lock icon
- [ ] Google OAuth Client created (Web application type)
- [ ] Client ID added to frontend `.env`
- [ ] Client ID added to backend `server/.env`
- [ ] Authorized JavaScript origins configured
- [ ] Authorized redirect URIs configured
- [ ] Test users added (if app in Testing mode)
- [ ] Frontend and backend servers restarted
- [ ] Environment variables verified in browser console

After OAuth success:

- [ ] User saved in database
- [ ] Provider set to 'google'
- [ ] Profile picture loaded
- [ ] Assessment scores link to user_id
- [ ] Dashboard shows real data (not dummy data)
- [ ] Logout clears session
- [ ] Re-login loads same user data

---

## 🚀 Quick Start Commands

```powershell
# 1. Generate SSL certificates (once)
.\generate-ssl.ps1

# 2. Configure .env files (see templates above)

# 3. Restart servers
npm run dev                    # Terminal 1
cd server && node index.js     # Terminal 2
python app.py                  # Terminal 3

# 4. Test OAuth
# Open: https://localhost:5173
# Click: Get Started → Google Sign-In
```

---

## 🎯 Success Criteria

After implementation:

✅ Accessing `https://localhost:5173` shows 🔒  
✅ No "Not Secure" warning  
✅ Google Sign-In button appears  
✅ Clicking button opens Google popup (not blocked)  
✅ Selecting account succeeds  
✅ Redirected to dashboard  
✅ User saved in database  
✅ Dashboard shows real assessment data  
✅ No console errors  
✅ Privacy maintained (HTTPS, secure tokens)  

---

**Your OAuth authentication is now production-ready and secure!** 🔐
