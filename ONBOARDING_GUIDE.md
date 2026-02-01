# Serenity Onboarding Flow - Testing Guide

## 🎯 Overview
I've successfully implemented a comprehensive onboarding flow for Serenity that warmly welcomes users and collects personalization data while ensuring privacy and safety compliance.

## ✅ What Has Been Implemented

### 1. **User Context System** (`src/contexts/UserContext.tsx`)
- Manages user profile data (name, age group, gender, onboarding status)
- Persists data to localStorage for session continuity
- Provides React hooks for easy access throughout the app

### 2. **4-Step Onboarding Flow** (`src/pages/Onboarding.tsx`)

#### Step 1: Name Collection
- Warm welcome message with Heart icon
- Single input field for name/nickname
- Explanation of why we ask for a name
- Validation: Must enter a name to continue
- Visual: Purple primary themed card with Heart icon

#### Step 2: Age Group Selection
- Personalized greeting using the name from Step 1
- 4 card-style options:
  - 0-18 (Teen & Young)
  - 19-24 (Young Adult)
  - 25-50 (Adult)
  - 51+ (Mature Adult)
- Interactive cards with hover effects
- Validation: Must select an age group
- Visual: Sparkles icon, grid layout

#### Step 3: Gender (Optional)
- Clear indication that this step is optional
- 5 inclusive options:
  - Male
  - Female
  - Non-binary
  - Prefer not to say
  - Other
- "Skip this step" button available
- No validation required
- Visual: Highlight color theme

#### Step 4: Privacy & Consent
- Shield icon to emphasize security
- Clear bullet points explaining:
  - Data privacy and security
  - Not a replacement for medical care
  - User control over data
  - Crisis support guidance
- Required checkbox for Terms & Privacy Policy
- Links to privacy policy and terms (placeholder)
- Cannot proceed without consent
- Final "Complete Setup" button

### 3. **Navigation Updates**
- All "Sign In" and "Get Started" buttons now route to `/onboarding`
- Dashboard automatically redirects to onboarding if not completed
- Protected routes ensure users complete onboarding first

### 4. **Personalized Dashboard** (Updated `src/pages/Dashboard.tsx`)
- Displays user's actual name from onboarding
- Age-appropriate greeting messages:
  - **0-18**: "How are you feeling today? 🌟"
  - **19-24**: "How's your day going so far?"
  - **25-50**: "How are you feeling today?"
  - **51+**: "How are you feeling today, dear friend?"
- Age-appropriate CTA messages:
  - **0-18**: "Ready for your daily mood check? 🎯" + encouraging description
  - **19-24**: Focus on mental wellness journey
  - **25-50**: Professional, progress-focused
  - **51+**: Gentle, reflective tone

### 5. **Personalized Chat System** (Updated `src/pages/Chat.tsx`)
- **Age-Based Tone Adaptation** (see `src/lib/personalization.ts`)
  - Each age group has specific language guidelines
  - Examples of appropriate responses for each age
  - Focus areas tailored to age-related challenges
  
- **Crisis Detection**
  - Monitors for crisis keywords (suicide, self-harm, etc.)
  - Displays prominent red alert banner when detected
  - Provides emergency resources:
    - 988 Suicide & Crisis Lifeline
    - Crisis Text Line (HOME to 741741)
  - Specialized crisis response messaging

- **Personalized Greetings**
  - Time-based greeting (Good morning/afternoon/evening)
  - Uses user's name from onboarding
  - Adapted to age group tone

### 6. **Safety & Privacy Features**
- Clear privacy disclaimers throughout
- Crisis intervention system
- Non-medical disclaimer on chat interface
- User data control messaging
- Consent tracking

## 🎨 Design Features

### Visual Polish
- ✅ Smooth animations with Framer Motion
- ✅ Progress indicator with 4-step tracker
- ✅ Gradient backgrounds and themed colors
- ✅ Interactive card hover effects
- ✅ Responsive design (mobile & desktop)
- ✅ Consistent design language across all steps
- ✅ Icon-based visual hierarchy

### UX Enhancements
- ✅ Back navigation on steps 2-4
- ✅ Clear validation indicators
- ✅ Disabled buttons when form incomplete
- ✅ Loading states during transitions
- ✅ Calm, supportive tone throughout
- ✅ No rush pressure - users can skip optional steps

## 📝 Testing Instructions

### Manual Testing Flow

1. **Start Fresh**
   ```
   - Clear localStorage in browser dev tools (Application > Local Storage)
   - Navigate to http://localhost:5173
   ```

2. **Landing Page**
   - Click "Get Started" in header OR
   - Click "Get Started" in hero section OR
   - Click "Sign In" (all route to onboarding)

3. **Onboarding Step 1: Name**
   - Try clicking Continue without entering name (should be disabled)
   - Enter a name like "Alex"
   - Click Continue
   - Verify smooth transition to Step 2

4. **Onboarding Step 2: Age**
   - Should see "Nice to meet you, Alex!" 
   - Try each age group card (should highlight when selected)
   - Click Back (should return to Step 1 with name preserved)
   - Click Continue again, select "19-24"
   - Click Continue

5. **Onboarding Step 3: Gender**
   - Notice "This is completely optional" message
   - Try selecting a gender
   - OR click "Skip this step"
   - Continue to Step 4

6. **Onboarding Step 4: Privacy**
   - Read privacy information
   - Try clicking "Complete Setup" without checking (should be disabled)
   - Check the consent checkbox
   - Click "Complete Setup"

7. **Dashboard Verification**
   - Should be redirected to `/dashboard`
   - Should see "Hi Alex 👋" (or your entered  name)
   - Should see age-appropriate greeting
   - Should see age-appropriate CTA message
   - **Test age adaptation**: Clear localStorage, repeat onboarding with different ages

8. **Chat Verification**
   - Navigate to Chat page
   - Should see personalized greeting: "Hi Alex! Good [morning/afternoon/evening]! What's on your mind?"
   - Type a normal message - should get age-appropriate response
   - **Test crisis detection**: Type "I want to hurt myself"
   - Should see red alert banner appear
   - Bot should respond with crisis resources

9. **Persistence Testing**
   - Refresh the page
   - Should remain on dashboard (data persisted)
   - Check that name is still shown
   - Navigate to chat - greeting should still be personalized

10. **Protection Testing**
    - Clear localStorage
    - Try navigating directly to `/dashboard`
    - Should redirect to `/onboarding`
    - Try navigating to `/chat`
    - Should redirect to `/onboarding`

## 🔧 Age Group Behavior Matrix

| Age Group | Dashboard Greeting | Chat Tone | Focus Areas | Sample Response |
|-----------|-------------------|-----------|-------------|-----------------|
| **0-18** | "How are you feeling today? 🌟" | Friendly, encouraging, simple | School stress, friendships, emotions | "Hey! I'm here to listen 🌟" |
| **19-24** | "How's your day going so far?" | Relatable, motivating | Career, studies, relationships | "I hear you. This age can be really challenging." |
| **25-50** | "How are you feeling today?" | Calm, professional, empathetic | Work stress, burnout, balance | "I understand the weight of these responsibilities." |
| **51+** | "How are you feeling today, dear friend?" | Gentle, respectful, reassuring | Well-being, peace of mind | "Thank you for sharing this with me." |

## 🚨 Crisis Detection Keywords
The system monitors for:
- suicide, kill myself, end my life, want to die
- better off dead, self-harm, hurt myself
- no reason to live

When detected:
1. Red alert banner appears immediately
2. Emergency resources displayed
3. Bot responds with urgent help information

## 📁 **Files Created/Modified**

### New Files:
1. `src/contexts/UserContext.tsx` - User state management
2. `src/pages/Onboarding.tsx` - 4-step onboarding flow
3. `src/lib/personalization.ts` - Age-based adaptation utilities

### Modified Files:
1. `src/App.tsx` - Added UserProvider and onboarding route
2. `src/pages/Dashboard.tsx` - Personalized greetings and CTAs
3. `src/pages/Chat.tsx` - Crisis detection and personalized chat
4. `src/components/layout/Header.tsx` - Updated button links
5. `src/components/landing/HeroSection.tsx` - Updated CTA buttons

## 🎯 Success Criteria

- [x] Warm, welcoming onboarding experience
- [x] 4-step flow with clear progression
- [x] Name collection with personalization
- [x] Age group selection (4 options)
- [x] Optional gender selection
- [x] Privacy & consent agreement
- [x] Age-based conversation adaptation
- [x] Personalized dashboard experience
- [x] Personalized chat greetings
- [x] Crisis detection and intervention
- [x] Data persistence with localStorage
- [x] Protected routes (redirect if not onboarded)
- [x] Smooth animations and transitions
- [x] Responsive design
- [x] No medical advice disclaimers
- [x] Emergency resources for crisis situations

## 💡 Extension Ideas

1. **Profile Settings Page**: Allow users to edit their information
2. **Data Export**: Let users download their data
3. **Data Deletion**: Implement account deletion
4. **Advanced AI Integration**: Connect to real AI API (OpenAI, Anthropic)
5. **Mood Tracking**: Save mood selections over time
6. **Progress Dashboard**: Show wellness trends
7. **Notification System**: Gentle check-in reminders

---

**Everything is ready for testing!** 🎉

Navigate to http://localhost:5173 and click "Get Started" to experience the full onboarding flow!
