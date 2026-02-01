# AI_BOOMI_HACKATHON_PROJECT

# MindEase: AI-Driven Therapeutic Emotion Assistant 🧘‍♂️🎤

MindEase Path is a professional-grade mental wellness application that uses **Real-Time Voice Analysis** and **Machine Learning** to detect emotional states and provide mathematically justified therapeutic music recommendations.

![Vision UI Dashboard](https://img.shields.io/badge/UI-Vision_Dashboard-blue?style=for-the-badge)
![ML Engine](https://img.shields.io/badge/ML-TensorFlow_&_Librosa-orange?style=for-the-badge)
![Backend](https://img.shields.io/badge/Backend-Node.js_&_SQLite-green?style=for-the-badge)

## 🚀 Key Features

### 1. ML-Driven Voice Analysis
*   **Deep Feature Extraction**: Analyzes 164 unique audio features including MFCCs, Zero Crossing Rate, and RMSE.
*   **Mixed Emotion Intelligence**: Unlike standard single-label classifiers, Serenity Path detects overlapping emotions (e.g., Happy yet Sad) and provides AI-driven validation for emotional depth.
*   **Accuracy Refinement**: Implements Pre-emphasis filtering and Signal Normalization to capture subtle vocal nuances.

### 2. Mathematical Music Recommender
*   **Cosine Similarity Engine**: Uses a vector space model to match user voice features (Pitch, Tempo, Energy) against a therapeutic song embedding matrix.
*   **No Randomness**: Every recommendation is mathematically justified (e.g., selection based on low arousal and high valence vectors).
*   **Anti-Repetition Logic**: Ensures a fresh experience by tracking session history and preventing duplicate recommendations.

### 3. Advanced Emotional Dashboard
*   **Emotional Complexity Timeline**: A layered area chart visualizing primary and secondary emotions over time.
*   **Technical Metadata**: Displays raw auditory data like detected BPM (Tempo) and Energy % directly to the user.
*   **Secure History**: Persistent SQLite-backed storage for long-term emotional tracking.

## 🛠 Tech Stack

**Frontend:**
*   React 18 + Vite (TypeScript)
*   **Styling**: Custom Glassmorphism UI (Vision UI inspired)
*   **Animations**: Framer Motion
*   **Charts**: Recharts (Custom Dual-Axis Area Charts)
*   **Icons**: Lucide React

**Backend:**
*   Node.js & Express
*   **Database**: SQLite3 (Local, Privacy-First)
*   **Auth**: JWT (Json Web Tokens) with stable session management

**ML Engine (Python):**
*   TensorFlow / Keras (CNN-based Emotion Model)
*   Librosa (Advanced DSP & Feature Extraction)
*   NumPy & Scikit-learn (Scaler & Vector Processing)

## 🏁 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python 3.10+
*   NPM or Yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/serenity-path.git
   cd serenity-path
   ```

2. **Frontend Setup**
   ```bash
   npm install
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd server
   npm install
   # Create a .env file with your JWT_SECRET
   node index.js
   ```

4. **Python ML Environment**
   ```bash
   cd server/python_engine
   pip install -r requirements.txt
   ```

## 🛡 Privacy & Security
Serenity Path is designed with a **Privacy-First** approach. Voice recordings are processed as temporary segments and analyzed locally via the Python engine. No voice data is uploaded to permanent cloud storage, and only the derived metadata (emotion scores) is stored in your secure, user-scoped SQLite database.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
*Developed with ❤️ for Mental Wellness.*
