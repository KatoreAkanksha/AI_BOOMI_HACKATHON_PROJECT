# MindEase - AI-Powered Mental Health Platform

MindEase is a comprehensive mental health wellness application designed to provide personalized emotional support, stress assessment, and immersive wellness tools. It combines a modern React frontend with a secure Node.js authentication service and a powerful Python FastAPI machine learning engine for real-time audio and text analysis.

## 🌟 Features

### 🧠 **AI Assessments**
*   **Audio Assessment**: Real-time voice analysis using advanced ML models to detect emotional states (Stress, Anxiety, Depression) from speech patterns.
    *   *Tech*: Python, FastAPI, Librosa/SoundFile, Scikit-learn.
*   **Chat Assessment**: Interactive text-based psychological evaluation using a robust heuristic scoring engine.
    *   *Tech*: Keyword sentiment analysis, response length heuristics.
*   **Actionable Reports**: PDF & DOC downloads with detailed scores, labels (Minimal to Severe), and personalized recommendations.

### 🌌 **Serene Space (New)**
*   An **Antigravity-inspired** immersive relaxation room.
*   Features premium glassmorphism UI, floating particle effects, and deep soothing gradients.
*   **Calming Soundscapes**: High-quality looped audio for Rain, Ocean Waves, Forest Birds, and Fireplace.
*   *Tech*: React, Framer Motion, HTML5 Audio.

### 🤖 **Intelligent Chat Companion**
*   **talk-with-friend**: Emotion-aware chat that suggests curated YouTube videos based on detected mood.
*   **Memory & Personality**: Remembers past sessions to provide continuity and personalized greetings.

### 📊 **Personalized Dashboard**
*   Visualizes assessment history (Anxiety, Depression, Stress) over time.
*   Persists data securely across sessions.

### 🛡️ **Security**
*   **JWT Authentication**: Secure, token-based session management across both Node.js and Python services.
*   **Privacy**: Sessions auto-expire, and local data is handled securely.

## 🛠 Tech Stack

### Frontend
*   **Framework**: React (Vite)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS, Framer Motion, Lucide React
*   **Architecture**: Modular Context API for User/Auth state.

### Backend Services
1.  **Auth & Data Service (Node.js)**
    *   **Runtime**: Express.js
    *   **Database**: SQLite (`users.db`)
    *   **Role**: User management, history tracking, text chat AI (Groq).
2.  **ML Inference Service (Python)**
    *   **Runtime**: FastAPI
    *   **Libraries**: `scikit-learn`, `joblib`, `numpy`, `uvicorn`, `PyJWT`.
    *   **Role**: Audio processing, heuristic scoring, direct DB persistence.

## 📂 Project Structure

```
serene-path-main/
├── src/                    # React Frontend
│   ├── pages/              # SereneRoom, AudioAssessment, ChatWithTestAssessment
│   ├── components/         # Reusable UI (AssessmentDashboard, Header)
│   └── contexts/           # UserContext (Auth & State)
├── server/                 # Node.js Backend
│   ├── index.js            # Auth API & Groq Integration
│   └── users.db            # Shared SQLite Database
├── app.py                  # Python FastAPI ML Backend
├── audio_processor.py      # ML Logic & Feature Extraction
└── public/
    └── sounds/             # Local audio assets (rain.mp3, etc.)
```

## 🚀 Getting Started

### Prerequisites
*   **Node.js** (v18+)
*   **Python** (v3.8+)
*   **Groq API Key** (for chat features)

### 1. Environment Configuration
Ensure you have a `.env` file in the root (or `server/` depending on your config) with:
```env
# Shared Secrets
JWT_SECRET=your_consistent_secret_key_here
GROQ_API_KEY=your_groq_api_key

# Frontend Config
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

### 2. Installation & Startup

**Step 1: Start Auth Service (Node)**
```bash
cd server
npm install
node index.js
# Runs on Port 5001
```

**Step 2: Start ML Service (Python)**
```bash
# In root directory
pip install fastapi uvicorn scikit-learn numpy pyjwt joblib librosa soundfile
python -m uvicorn app:app --host 0.0.0.0 --port 8000 --reload
# Runs on Port 8000
```

**Step 3: Start Frontend**
```bash
# In root directory
npm install
npm run dev
# Runs on Port 8080 (or similar)
```

### 3. Local Audio Assets
For the **Serene Room** to work perfectly, ensure the following files exist in `public/sounds/`:
*   `rain.mp3`
*   `oceanwaves.mp3`
*   `forest.mp3`
*   `fireplace.mp3`

## 🔐 Architecture Notes
*   **Dual-Backend**: The frontend communicates with Node (5001) for auth/chat and Python (8000) for heavyweight ML tasks.
*   **Shared DB**: Both backends write to the same `users.db` SQLite file for seamless data consistency.
*   **Unified Auth**: Both backends share the same `JWT_SECRET` to validate user tokens.

## 📄 License
This project is licensed under the ISC License.
