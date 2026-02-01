# 🚀 OAuth Quick Start

## ⚡ 3-Minute Setup

### 1. Get Credentials (2 min)

**Google:**
- https://console.cloud.google.com/ → OAuth 2.0 Client
- Authorized origin: `http://localhost:5173`
- Copy Client ID

**Facebook:**
- https://developers.facebook.com/apps/ → Create App
- Copy App ID & Secret
- Switch to "Live" mode

### 2. Configure (30 sec)

**`.env` (frontend root):**
```bash
VITE_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
VITE_FACEBOOK_APP_ID=your_app_id
```

**`server/.env` (backend):**
```bash
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
```

### 3. Restart (30 sec)

```bash
# Stop all terminals (Ctrl+C)
npm run dev              # Terminal 1
cd server && node index.js    # Terminal 2  
python app.py           # Terminal 3
```

## ✅ Test

1. Open `http://localhost:5173`
2. Click "Get Started"
3. Try Google login → Should redirect to onboarding
4. Try Facebook login → Should redirect to onboarding
5. Check `server/users.db` → Users should be saved

## 🐛 Issues?

**Google button missing:**
- Verify `VITE_GOOGLE_CLIENT_ID` in `.env`
- Restart frontend: `npm run dev`

**Facebook error:**
- Check app is "Live" (not Development)
- Verify `VITE_FACEBOOK_APP_ID` in `.env`

**Backend 401:**
- Update `server/.env` with credentials
- Restart backend: `cd server && node index.js`

## 📚 Full Docs

- Setup Guide: `OAUTH_SETUP_GUIDE.md`
- Fix Summary: `OAUTH_FIX_SUMMARY.md`
- Implementation: `.gemini/OAUTH_IMPLEMENTATION_GUIDE.md`
