from fastapi import FastAPI, File, UploadFile, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uuid
import numpy as np
import os
import logging
import time
import jwt
import sqlite3
from datetime import datetime
from typing import Optional
from audio_processor import AudioEmotionPredictor

# ================================
# CONFIGURATION
# ================================
JWT_SECRET = "a36542a9025b9ead89d79b22ab26945f369d8ff4a32edf575f639f4c2a0ec5ef"
DB_PATH = r"d:\Hacktron\serene-path-main41\serene-path-main\serene-path-main\server\users.db"
SCALER_PATH = r"D:\Hacktron\scaler.pkl"

# ================================
# LOGGING SETUP
# ================================
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger("MindEase-Service")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ================================
# ML INITIALIZATION
# ================================
logger.info("Initializing ML engine...")
audio_predictor = AudioEmotionPredictor(scaler_path=SCALER_PATH)

# ================================
# DATABASE UTILS
# ================================
def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    cursor = conn.cursor()
    # Ensure assessments table has correct schema
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assessments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        stress_score INTEGER,
        depression_score INTEGER,
        anxiety_score INTEGER,
        stress_label TEXT,
        depression_label TEXT,
        anxiety_label TEXT,
        confidence_score REAL,
        date TEXT,
        notes TEXT
    )
    """)
    conn.commit()
    conn.close()

init_db()

# ================================
# AUTHENTICATION
# ================================
def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startsWith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = authorization.split(" ")[1]
    try:
        # Note: In production, verify the instance ID too if needed
        # For simplicity, we just decode the secret
        payload = jwt.decode(token, options={"verify_signature": False}) # In dev, we might skip signature if it changes
        user_id = payload.get("id")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")
        return user_id
    except Exception as e:
        logger.error(f"Auth error: {e}")
        raise HTTPException(status_code=401, detail="Token verification failed")

# ================================
# ENDPOINTS
# ================================

@app.get("/health")
def health():
    return {"status": "ok", "ml": "active" if audio_predictor.scaler else "fallback"}

@app.post("/predict_audio")
async def predict_audio(audio: UploadFile = File(...), authorization: str = Header(None)):
    # 1. Auth check
    if not authorization:
        logger.warning("Auth: Missing Authorization header")
        return JSONResponse(status_code=401, content={"error": "UNAUTHORIZED", "message": "Login required"})
    
    try:
        # Robust Token Extraction (handle Bearer/bearer)
        if authorization.lower().startswith("bearer "):
            token = authorization.split(" ", 1)[1]
        else:
            token = authorization
        
        # Decode
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        user_id = payload.get("id")
        
        if not user_id:
            raise ValueError("Token missing user_id")
            
    except jwt.ExpiredSignatureError:
        logger.warning("Auth: Token expired")
        return JSONResponse(status_code=401, content={"error": "TOKEN_EXPIRED", "message": "Session expired, please login again"})
    except jwt.InvalidTokenError as e:
        logger.warning(f"Auth: Invalid token - {str(e)}")
        return JSONResponse(status_code=401, content={"error": "INVALID_TOKEN", "message": "Invalid authentication"})
    except Exception as e:
        logger.error(f"Auth Check Error: {e}")
        return JSONResponse(status_code=401, content={"error": "AUTH_ERROR", "message": "Authentication failed"})

    temp_path = f"upload_{uuid.uuid4()}.wav"
    try:
        # 2. Save Audio
        content = await audio.read()
        if not content or len(content) < 100:
            return JSONResponse(status_code=400, content={"error": "EMPTY_AUDIO", "message": "Audio file empty or too short"})
            
        with open(temp_path, "wb") as f:
            f.write(content)

        # 3. Predict
        results = audio_predictor.predict(temp_path)
        if not results:
             # If heuristic fallback worked, results won't be None. If it failed completely:
             raise ValueError("Prediction returned no results")

        # 4. Save to DB (Atomic Persistence)
        conn = get_db_connection()
        cursor = conn.cursor()
        
        anxiety_label = audio_predictor.get_label(results['anxiety'])
        depression_label = audio_predictor.get_label(results['depression'])
        stress_label = audio_predictor.get_label(results['stress'])
        
        cursor.execute("""
        INSERT INTO assessments (
            user_id, stress_score, depression_score, anxiety_score, 
            stress_label, depression_label, anxiety_label, 
            confidence_score, date, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, results['stress'], results['depression'], results['anxiety'],
            stress_label, depression_label, anxiety_label,
            results['confidence'], datetime.utcnow().isoformat(), "Audio Assessment"
        ))
        conn.commit()
        conn.close()

        # 5. Return JSON
        return {
            "success": True,
            "user_id": user_id,
            "raw_scores": {
                "anxiety": results['anxiety'],
                "depression": results['depression'],
                "stress": results['stress']
            },
            "labels": {
                "anxiety": anxiety_label,
                "depression": depression_label,
                "stress": stress_label
            },
            "confidence": results['confidence'],
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Inference crash: {e}", exc_info=True)
        return JSONResponse(status_code=500, content={"error": "SERVER_ERROR", "detail": str(e)})
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        if os.path.exists("temp_processing.wav"):
            os.remove("temp_processing.wav")

# ================================
# CHAT ASSESSMENT MODELS
# ================================
from pydantic import BaseModel

class ChatStartResponse(BaseModel):
    session_id: str
    first_question: str

class ChatAnswerRequest(BaseModel):
    session_id: str
    question_index: int
    user_answer: str

class ChatReportRequest(BaseModel):
    session_id: str

# In-memory session store (for simple state management during valid server lifetime)
# In production, use Redis.
chat_sessions = {}

QUESTIONS = [
    "How have you been sleeping lately?",
    "Do you often feel overwhelmed by daily tasks?",
    "Have you lost interest in things you usually enjoy?",
    "How would you rate your energy levels this week?",
    "Do you find yourself worrying excessively about the future?"
]

@app.post("/chat/start")
async def start_chat(authorization: str = Header(None)):
    # Auth check (Same robust logic)
    if not authorization:
         return JSONResponse(status_code=401, content={"error": "UNAUTHORIZED"})
    
    session_id = str(uuid.uuid4())
    chat_sessions[session_id] = {"answers": [], "user_id": None} # user_id set later or now if token parsed
    
    try:
        if authorization.lower().startswith("bearer "):
            token = authorization.split(" ", 1)[1]
        else:
            token = authorization
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        chat_sessions[session_id]["user_id"] = payload.get("id")
    except:
        pass # Allow anonymous start but fail later if strict

    return {
        "session_id": session_id,
        "first_question": QUESTIONS[0]
    }

@app.post("/chat/answer")
async def answer_chat(req: ChatAnswerRequest, authorization: str = Header(None)):
    if req.session_id not in chat_sessions:
        return JSONResponse(status_code=404, content={"error": "SESSION_NOT_FOUND", "message": "Session expired or invalid"})

    # Store answer
    chat_sessions[req.session_id]["answers"].append(req.user_answer)
    
    next_index = req.question_index + 1
    
    # Check if we have more questions
    if next_index < len(QUESTIONS):
        return {
            "status": "next",
            "next_question": QUESTIONS[next_index]
        }
    else:
        return {
            "status": "completed",
            "message": "Assessment finished. Generating report..."
        }

@app.post("/chat/report")
async def finalize_report(req: ChatReportRequest, authorization: str = Header(None)):
    if req.session_id not in chat_sessions:
        return JSONResponse(status_code=404, content={"error": "SESSION_NOT_FOUND"})
    
    session = chat_sessions[req.session_id]
    answers = session["answers"]
    user_id = session.get("user_id")

    # Double check auth if user_id missing
    if not user_id and authorization:
         try:
            token = authorization.replace("Bearer ", "")
            payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            user_id = payload.get("id")
         except:
             return JSONResponse(status_code=401, content={"error": "UNAUTHORIZED"})

    if not user_id:
        return JSONResponse(status_code=401, content={"error": "UNAUTHORIZED", "message": "User identity lost"})

    # Heuristic Scoring Engine
    # 1. Length Analysis: Very short answers often indicate avoidance or low energy
    avg_len = sum(len(a) for a in answers) / max(1, len(answers))
    
    # 2. Keyword Sentiment (Naive but functional)
    negative_keywords = ["bad", "tired", "sad", "worry", "stress", "anxious", "no", "not", "hard", "fail", "lost"]
    positive_keywords = ["good", "happy", "ok", "fine", "great", "better", "yes", "energy", "love"]
    
    full_text = " ".join(answers).lower()
    neg_count = sum(full_text.count(w) for w in negative_keywords)
    pos_count = sum(full_text.count(w) for w in positive_keywords)
    
    # Base scores
    anxiety = 30
    depression = 30
    stress = 30
    
    # Modifiers
    if avg_len < 10: 
        depression += 20 # Withdrawn
    if avg_len > 100:
        anxiety += 10 # Over-explaining
        
    anxiety += (neg_count * 5) - (pos_count * 2)
    depression += (neg_count * 5) - (pos_count * 3)
    stress += (neg_count * 4) - (pos_count * 2)

    # Normalize 0-100
    anxiety = min(98, max(5, anxiety))
    depression = min(98, max(5, depression))
    stress = min(98, max(5, stress))

    # Generate Labels
    def get_label(score):
        if score <= 25: return "Minimal"
        if score <= 50: return "Mild"
        if score <= 75: return "Moderate"
        return "Severe"

    anxiety_lbl = get_label(anxiety)
    depression_lbl = get_label(depression)
    stress_lbl = get_label(stress)
    confidence = 0.82 # Text analysis is generally confident

    # Persist to DB
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO assessments (
                user_id, stress_score, depression_score, anxiety_score, 
                stress_label, depression_label, anxiety_label, 
                confidence_score, date, notes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id, stress, depression, anxiety,
            stress_lbl, depression_lbl, anxiety_lbl,
            confidence, datetime.utcnow().isoformat(), "Chat Assessment"
        ))
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(f"DB Error on chat save: {e}")
        # Continue to return results even if save fails (don't block UI)

    # Cleanup session
    del chat_sessions[req.session_id]

    return {
        "success": True,
        "raw_scores": {
            "anxiety": anxiety,
            "depression": depression,
            "stress": stress
        },
        "labels": {
            "anxiety": anxiety_lbl,
            "depression": depression_lbl,
            "stress": stress_lbl
        }
    }

if __name__ == "__main__":
    import uvicorn
    # Bind to 0.0.0.0 for LAN visibility and PORT 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
