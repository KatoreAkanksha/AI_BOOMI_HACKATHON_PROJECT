//madhav,s code
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const crypto = require("crypto");
const { OAuth2Client } = require('google-auth-library');
const path = require("path");
require("dotenv").config();

// OAuth Clients
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();

/* ================= CONFIG ================= */
const PORT = process.env.PORT || 5001;
const BASE_JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

console.log(`🛡️ Auth Service Active`);

if (GROQ_API_KEY) {
    console.log("✅ Groq API Key loaded:", GROQ_API_KEY.substring(0, 10) + "...");
} else {
    console.warn("⚠️ Groq API Key NOT found in .env");
}

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= DATABASE ================= */
// WARNING: SQLite files are read-only in Vercel serverless environment.
// Writes will not persist and may error. Consider using Turso, Neon, or Supabase.
const dbPath = path.resolve(__dirname, "users.db");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error("DB Error:", err.message);
    else console.log("✅ SQLite connected at", dbPath);
});

db.serialize(() => {
    // Users Table
    db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      age INTEGER,
      gender TEXT,
      profile_picture TEXT,
      created_at TEXT
    )
  `);

    // Assessments Table
    db.run(`
    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      stress_score INTEGER,
      depression_score INTEGER,
      anxiety_score INTEGER,
      stress_label TEXT,
      depression_label TEXT,
      anxiety_label TEXT,
      date TEXT,
      notes TEXT,
      FOREIGN KEY(user_id) REFERENCES users(user_id)
    )
  `);

    // Chat History Table
    db.run(`
    CREATE TABLE IF NOT EXISTS chat_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      role TEXT,
      content TEXT,
      emotion TEXT,
      timestamp TEXT,
      FOREIGN KEY(user_id) REFERENCES users(user_id)
    )
  `);

    // Chat Sessions Summary Table
    db.run(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      primary_mood TEXT,
      mood_trend TEXT,
      themes TEXT, -- JSON string
      positive_triggers TEXT, -- JSON string
      timestamp TEXT,
      FOREIGN KEY(user_id) REFERENCES users(user_id)
    )
  `);

    // Migrations
    const addColumn = (table, col) => {
        db.run(`ALTER TABLE ${table} ADD COLUMN ${col}`, (err) => { });
    };
    addColumn("chat_history", "emotion TEXT");
    addColumn("users", "age INTEGER");
    addColumn("users", "gender TEXT");
    addColumn("users", "profile_picture TEXT");
    addColumn("users", "provider TEXT DEFAULT 'email'");
    addColumn("users", "provider_user_id TEXT");
    addColumn("users", "last_login TEXT");
    addColumn("assessments", "stress_label TEXT");
    addColumn("assessments", "depression_label TEXT");
    addColumn("assessments", "anxiety_label TEXT");
});

/* ================= AUTH ================= */
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Auth token missing" });
    }

    const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
        return res.status(401).json({ error: "Invalid auth format" });
    }

    // Allow mock_token for development/testing
    if (token === 'mock_token') {
        req.user = { id: req.body.user_id || req.params.userId || 'mock_user' };
        return next();
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = { id: decoded.id };
        next();
    } catch (err) {
        return res.status(401).json({ error: "Token expired or invalid" });
    }
};

const generateUserId = () => crypto.randomUUID();

/* ================= PROMPT ================= */
const FRIEND_SYSTEM_PROMPT = `You are an emotional support AI designed to behave like a trusted, warm, and encouraging best friend.
Your purpose is to support users experiencing stress, anxiety, sadness, loneliness, or emotional overload.

STRICT RESPONSE FORMATTING:
- Responses MUST be concise and human.
- Start with a short, empathetic opener (1 line).
- Follow with exactly 2 to 4 bullet points max.
- Bullet points must be short, helpful thoughts or suggestions.
- Use friendly emojis sparingly and only where emotionally appropriate (💙 😌 🌱 ✨ 🫂).
- NO LONG PARAGRAPH BLOCKS. NO ROBOTIC OR CLINICAL TONE.

EXAMPLE RESPONSE:
“That sounds like a tough day 💙”
• Take a slow breath with me 😌
• You handled more than you realize 🌱
• Want a small mood boost or a new topic? ✨

SCOPE AND BOUNDARIES:
- Focus ONLY on emotional well-being.
- If the user asks something outside emotional support, gently redirect without mentioning the rejected topic.
- Acknowledge and validate feelings first.`;

/* ================= ROUTES ================= */

app.get("/", (req, res) => {
    res.json({ status: "Server is running" });
});

app.get("/api", (req, res) => {
    res.json({ status: "API is running" });
});

// Auth
app.post("/api/auth/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: "Missing fields" });

        const hashed = await bcrypt.hash(password, 10);
        const user_id = generateUserId();
        const now = new Date().toISOString();

        db.run(
            `INSERT INTO users (user_id, name, email, password, created_at) VALUES (?, ?, ?, ?, ?)`,
            [user_id, name, email, hashed, now],
            (err) => {
                if (err) return res.status(400).json({ error: err.message });
                const token = jwt.sign({ id: user_id }, JWT_SECRET, { expiresIn: "7d" });
                res.json({ token, user: { user_id, name, email, created_at: now } });
            }
        );
    } catch { res.status(500).json({ error: "Signup failed" }); }
});

app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (!user) return res.status(401).json({ error: "Invalid credentials" });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: user.user_id }, JWT_SECRET, { expiresIn: "7d" });
        res.json({ token, user: { user_id: user.user_id, name: user.name, email: user.email, created_at: user.created_at, age: user.age, gender: user.gender, profile_picture: user.profile_picture } });
    });
});

// 🔐 OAUTH: Google Sign-In
app.post("/api/auth/google", async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) return res.status(400).json({ error: "Missing Google credential" });

        // Verify Google token
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture } = payload;

        if (!email) return res.status(400).json({ error: "Email not provided by Google" });

        const now = new Date().toISOString();

        // Check if user exists
        db.get(`SELECT * FROM users WHERE email = ? AND provider = 'google'`, [email], (err, user) => {
            if (user) {
                // Update last login
                db.run(`UPDATE users SET last_login = ?, name = ?, profile_picture = ? WHERE user_id = ?`,
                    [now, name, picture, user.user_id],
                    () => {
                        const token = jwt.sign({ id: user.user_id }, JWT_SECRET, { expiresIn: "7d" });
                        res.json({
                            token,
                            user: {
                                user_id: user.user_id,
                                name,
                                email,
                                profile_picture: picture,
                                provider: 'google',
                                created_at: user.created_at,
                                last_login: now
                            }
                        });
                    }
                );
            } else {
                // Create new user
                const user_id = generateUserId();
                db.run(
                    `INSERT INTO users (user_id, name, email, provider, provider_user_id, profile_picture, created_at, last_login) VALUES (?, ?, ?, 'google', ?, ?, ?, ?)`,
                    [user_id, name, email, googleId, picture, now, now],
                    (err) => {
                        if (err) return res.status(400).json({ error: err.message });
                        const token = jwt.sign({ id: user_id }, JWT_SECRET, { expiresIn: "7d" });
                        res.json({
                            token,
                            user: {
                                user_id,
                                name,
                                email,
                                profile_picture: picture,
                                provider: 'google',
                                created_at: now,
                                last_login: now
                            }
                        });
                    }
                );
            }
        });
    } catch (error) {
        console.error("Google Auth Error:", error);
        res.status(401).json({ error: "Invalid Google token" });
    }
});

// 🔐 OAUTH: Facebook Login
app.post("/api/auth/facebook", async (req, res) => {
    try {
        const { accessToken } = req.body;
        if (!accessToken) return res.status(400).json({ error: "Missing Facebook access token" });

        // Verify Facebook token and get user info
        const fbResponse = await axios.get(`https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`);
        const { id: facebookId, name, email, picture } = fbResponse.data;

        if (!email) return res.status(400).json({ error: "Email not provided by Facebook" });

        const now = new Date().toISOString();
        const profilePicture = picture?.data?.url || null;

        // Check if user exists
        db.get(`SELECT * FROM users WHERE email = ? AND provider = 'facebook'`, [email], (err, user) => {
            if (user) {
                // Update last login
                db.run(`UPDATE users SET last_login = ?, name = ?, profile_picture = ? WHERE user_id = ?`,
                    [now, name, profilePicture, user.user_id],
                    () => {
                        const token = jwt.sign({ id: user.user_id }, JWT_SECRET, { expiresIn: "7d" });
                        res.json({
                            token,
                            user: {
                                user_id: user.user_id,
                                name,
                                email,
                                profile_picture: profilePicture,
                                provider: 'facebook',
                                created_at: user.created_at,
                                last_login: now
                            }
                        });
                    }
                );
            } else {
                // Create new user
                const user_id = generateUserId();
                db.run(
                    `INSERT INTO users (user_id, name, email, provider, provider_user_id, profile_picture, created_at, last_login) VALUES (?, ?, ?, 'facebook', ?, ?, ?, ?)`,
                    [user_id, name, email, facebookId, profilePicture, now, now],
                    (err) => {
                        if (err) return res.status(400).json({ error: err.message });
                        const token = jwt.sign({ id: user_id }, JWT_SECRET, { expiresIn: "7d" });
                        res.json({
                            token,
                            user: {
                                user_id,
                                name,
                                email,
                                profile_picture: profilePicture,
                                provider: 'facebook',
                                created_at: now,
                                last_login: now
                            }
                        });
                    }
                );
            }
        });
    } catch (error) {
        console.error("Facebook Auth Error:", error);
        res.status(401).json({ error: "Invalid Facebook token" });
    }
});

// User Profile
app.put('/api/user/update', authenticateToken, (req, res) => {
    const { user_id, name, age, gender, profile_picture } = req.body;
    if (req.user.id !== user_id) return res.status(403).json({ error: 'Forbidden' });
    db.run(`UPDATE users SET name = ?, age = ?, gender = ?, profile_picture = ? WHERE user_id = ?`,
        [name, age, gender, profile_picture, user_id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ user: { user_id, name, age, gender, profile_picture } });
        }
    );
});

// Chat
app.post("/api/chat/friend", authenticateToken, async (req, res) => {
    // 💡 LOGGING FOR DEBUGGING
    console.log("Chat Request from User:", req.user.id);
    console.log("Request Body:", JSON.stringify(req.body, null, 2));

    if (!req.user || !req.user.id) {
        return res.status(401).json({ error: "Unauthorized: User identity not found" });
    }

    const { message, emotion = "neutral", history = [] } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Message field is missing" });
    }

    if (!GROQ_API_KEY) {
        return res.status(503).json({ error: "AI service is not configured (Missing GROQ_API_KEY)" });
    }

    try {
        const validHistory = (history || [])
            .filter(m => m.content && m.content.trim())
            .map(m => ({ role: m.role, content: m.content }));

        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: FRIEND_SYSTEM_PROMPT },
                    ...validHistory.slice(-6),
                    { role: "user", content: message }
                ],
                temperature: 0.7
            },
            {
                headers: {
                    Authorization: `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                timeout: 15000 // 15s timeout
            }
        );

        const reply = response.data.choices[0].message.content;

        // Save to DB (Async but don't wait for response to speed up chat)
        db.run(`INSERT INTO chat_history (user_id, role, content, emotion, timestamp) VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, "user", message, emotion, new Date().toISOString()]);
        db.run(`INSERT INTO chat_history (user_id, role, content, emotion, timestamp) VALUES (?, ?, ?, ?, ?)`,
            [req.user.id, "bot", reply, "neutral", new Date().toISOString()]);

        res.json({ reply });

    } catch (err) {
        if (err.response) {
            console.error("Groq API Error Details:", JSON.stringify(err.response.data, null, 2));
            return res.status(err.response.status || 500).json({
                error: "AI_SERVICE_ERROR",
                message: err.response.data?.error?.message || "Groq failure"
            });
        }

        console.error("Backend Chat Critical Error:", err.message);
        res.status(500).json({
            error: "INTERNAL_SERVER_ERROR",
            message: "Something went wrong on the server while processing your chat."
        });
    }
});

app.get('/api/chat/history/:userId', authenticateToken, (req, res) => {
    if (req.user.id !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });
    db.all(`SELECT * FROM chat_history WHERE user_id = ? ORDER BY timestamp ASC`, [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Assessments
app.post('/api/assessments', authenticateToken, (req, res) => {
    const { user_id, stress_score, depression_score, anxiety_score, stress_label, depression_label, anxiety_label, date, notes } = req.body;
    if (req.user.id !== user_id) return res.status(403).json({ error: 'Forbidden' });
    db.run(`INSERT INTO assessments (user_id, stress_score, depression_score, anxiety_score, stress_label, depression_label, anxiety_label, date, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [user_id, stress_score, depression_score, anxiety_score, stress_label, depression_label, anxiety_label, date || new Date().toISOString(), notes],
        (err) => err ? res.status(500).json({ error: err.message }) : res.status(201).json({ success: true }));
});

app.get('/api/assessments/:userId', authenticateToken, (req, res) => {
    if (req.user.id !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });
    db.all(`SELECT * FROM assessments WHERE user_id = ? ORDER BY date DESC`, [req.params.userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// Music
app.post('/api/music/interact', authenticateToken, (req, res) => {
    const { track_name, emotion_context, relief_score } = req.body;
    db.run(`INSERT INTO music_interactions (user_id, track_name, emotion_context, relief_score, timestamp) VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, track_name, emotion_context, relief_score, new Date().toISOString()],
        (err) => err ? res.status(500).json({ error: err.message }) : res.json({ success: true }));
});

// Chat Session Summarization & Mood Tracking
app.post("/api/chat/session/summarize", authenticateToken, async (req, res) => {
    const { history = [] } = req.body;

    if (history.length < 2) {
        return res.json({ skip: true, message: "Too short for summary" });
    }

    if (!GROQ_API_KEY) return res.status(503).json({ error: "AI not configured" });

    try {
        const chatContext = history.slice(-10).map(m => `${m.role}: ${m.content}`).join("\n");

        const summaryResponse = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: `Analyze the provided chat history between a supportive AI and a user.
                        Generate a strictly valid JSON summary with these keys:
                        "primaryMood": (one word: frustrated, sad, anxious, calm, happy)
                        "moodTrend": (one word: improved, declined, stable)
                        "themes": (array of max 3 short strings like "work stress", "loneliness")
                        "positiveTriggers": (array of things that worked like "music", "breathing")
                        `
                    },
                    { role: "user", content: `History:\n${chatContext}` }
                ],
                response_format: { type: "json_object" },
                temperature: 0.2
            },
            {
                headers: { Authorization: `Bearer ${GROQ_API_KEY}`, "Content-Type": "application/json" },
                timeout: 10000
            }
        );

        const summary = JSON.parse(summaryResponse.data.choices[0].message.content);

        db.run(`INSERT INTO chat_sessions (user_id, primary_mood, mood_trend, themes, positive_triggers, timestamp) VALUES (?, ?, ?, ?, ?, ?)`,
            [
                req.user.id,
                summary.primaryMood,
                summary.moodTrend,
                JSON.stringify(summary.themes),
                JSON.stringify(summary.positiveTriggers),
                new Date().toISOString()
            ]);

        res.json({ success: true, summary });

    } catch (err) {
        console.error("Summarization Error:", err.message);
        res.status(500).json({ error: "Failed to summarize session" });
    }
});

app.get('/api/chat/last-summary/:userId', authenticateToken, (req, res) => {
    if (req.user.id !== req.params.userId) return res.status(403).json({ error: 'Forbidden' });

    db.get(`SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY timestamp DESC LIMIT 1`, [req.params.userId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!row) return res.json(null);

        res.json({
            ...row,
            themes: JSON.parse(row.themes || "[]"),
            positive_triggers: JSON.parse(row.positive_triggers || "[]")
        });
    });
});

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

// Only run app.listen if NOT in Vercel environment (module exported)
// In Vercel, this file is imported, so require.main !== module
if (require.main === module) {
    // Bind to 0.0.0.0 for LAN access
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
        console.log(`🏠 Internal LAN: http://192.168.4.239:${PORT}`);
    });
}

// Export app for Vercel
module.exports = app;
