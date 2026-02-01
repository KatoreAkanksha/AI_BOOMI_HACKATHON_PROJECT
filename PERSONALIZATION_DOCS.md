# Serenity Personalization System Documentation

## Overview
The Serenity app uses age-based personalization to adapt its tone, language, and support approach to each user's developmental stage and life challenges.

## Architecture

### Core Components

```
src/
├── contexts/
│   └── UserContext.tsx          # User state management & persistence
├── lib/
│   └── personalization.ts       # Age-based adaptation logic
└── pages/
    ├── Onboarding.tsx          # Collects user data
    ├── Dashboard.tsx           # Personalized home screen
    └── Chat.tsx                # Adaptive conversational AI
```

## User Data Structure

```typescript
interface UserProfile {
  name: string;                  // User's preferred name/nickname
  ageGroup: '0-18' | '19-24' | '25-50' | '51+' | null;
  gender?: string;               // Optional, user can skip
  hasCompletedOnboarding: boolean;
  consentGiven: boolean;         // Required for legal compliance
}
```

## Personalization Utilities

### 1. `getAgeBasedTone(ageGroup)`
Returns adaptation guidelines for each age group:

```typescript
{
  tone: string;           // Overall conversational tone
  focus: string;          // Key life challenges for this age
  language: string;       // Language complexity guidelines
  safety: string;         // Age-specific safety considerations
  examples: string[];     // Sample responses
}
```

**Example Output for 19-24:**
```javascript
{
  tone: 'relatable, motivating, and understanding',
  focus: 'academic pressure, career anxiety, relationships, identity, self-growth',
  language: 'Use modern, relatable language. Be authentic and non-judgmental.',
  safety: 'Acknowledge the challenges of this age. Provide practical coping strategies.',
  examples: [
    'I hear you. This age can be really challenging.',
    'Let\'s work through this together',
    'Your feelings are completely valid'
  ]
}
```

### 2. `getPersonalizedGreeting(user)`
Generates time and age-appropriate greetings:

```typescript
// Morning greeting for 19-24 year old named Alex:
"Hi Alex! Good morning! What's on your mind?"

// Evening greeting for 51+ user named Maria:
"Hello Maria, good evening. I'm here to listen."
```

### 3. `getSystemPrompt(user)`
Creates comprehensive AI system prompts that include:
- User's name and age group
- Tone and style guidelines
- Focus areas appropriate to age
- Language complexity rules
- Safety protocols
- Crisis intervention instructions

**This can be sent to real AI APIs like OpenAI or Anthropic**

### 4. `detectCrisisKeywords(message)`
Scans user messages for crisis indicators:
```javascript
Keywords: ['suicide', 'kill myself', 'end my life', 'want to die',
           'better off dead', 'self-harm', 'hurt myself', 'no reason to live']
           
Returns: boolean
```

### 5. `getCrisisResponse()`
Returns structured crisis intervention:
```javascript
{
  message: "I'm really concerned about what you're sharing...",
  requiresAttention: true
}
```

## Age Group Profiles

### 🧒 Ages 0-18 (Teen & Young)

**Characteristics:**
- Simplified language
- Encouraging and positive tone
- Focus on school, friendships, emotions
- Extra safety considerations

**Dashboard Greeting:** 
> "How are you feeling today? 🌟"

**Chat Examples:**
- "Hey! I'm here to listen 🌟"
- "That sounds tough. Want to talk about it?"
- "You're doing great by reaching out!"

**Safety Notes:**
- All content is child-safe
- Emphasis on healthy coping strategies
- Encourage talking to trusted adults

---

### 🎓 Ages 19-24 (Young Adult)

**Characteristics:**
- Modern, relatable language
- Motivating and understanding
- Focus on academic/career pressure
- Identity and self-growth support

**Dashboard Greeting:**
> "How's your day going so far?"

**Chat Examples:**
- "I hear you. This age can be really challenging."
- "Let's work through this together"
- "Your feelings are completely valid"

**Safety Notes:**
- Acknowledge quarter-life challenges
- Provide practical coping strategies
- Normalize mental health struggles

---

### 💼 Ages 25-50 (Adult)

**Characteristics:**
- Calm, professional language
- Empathetic and solution-oriented
- Focus on work-life balance
- Address burnout and responsibilities

**Dashboard Greeting:**
> "How are you feeling today?"

**Chat Examples:**
- "I understand the weight of these responsibilities."
- "Let's explore some strategies that might help"
- "Taking care of yourself is not selfish"

**Safety Notes:**
- Acknowledge complex adult responsibilities
- Offer balanced, practical perspectives
- Respect for professional expertise

---

### 🌸 Ages 51+ (Mature Adult)

**Characteristics:**
- Gentle, respectful language
- Reassuring and patient
- Focus on emotional well-being
- Life transitions and peace of mind

**Dashboard Greeting:**
> "How are you feeling today, dear friend?"

**Chat Examples:**
- "Thank you for sharing this with me."
- "Your well-being matters deeply."
- "Let's take this one step at a time"

**Safety Notes:**
- Extra care and respect
- Focus on dignity and comfort
- Thorough, patient explanations

## Implementation Examples

### Dashboard Personalization

```typescript
const userName = user.name || "Friend";
const greeting = getAgeBasedGreeting(user.ageGroup);
const ctaContent = getAgeBasedCTA(user.ageGroup);

return (
  <div>
    <h1>Hi {userName} 👋</h1>
    <p>{greeting}</p>
    <Card>
      <h3>{ctaContent.title}</h3>
      <p>{ctaContent.description}</p>
    </Card>
  </div>
);
```

### Chat Personalization

```typescript
const greeting = getPersonalizedGreeting(user);
const ageGuidelines = getAgeBasedTone(user.ageGroup);

// Use for initial bot message
const initialMessage = {
  role: "bot",
  content: greeting,
  timestamp: new Date()
};

// Generate age-appropriate responses
const responses = ageGuidelines.examples;
const response = responses[Math.floor(Math.random() * responses.length)];
```

### Crisis Detection

```typescript
const handleSend = () => {
  const isCrisis = detectCrisisKeywords(input);
  
  if (isCrisis) {
    setShowCrisisAlert(true);
    const crisisResponse = getCrisisResponse();
    // Display crisis resources immediately
  }
};
```

## Extending the System

### Adding a New Age Group
1. Update `UserProfile` type in `UserContext.tsx`
2. Add new case in `getAgeBasedTone()`
3. Add new case in `getAgeBasedGreeting()`
4. Add new case in `getAgeBasedCTA()`
5. Update onboarding UI with new option

### Integrating Real AI

Replace the mock responses with actual API calls:

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const handleSend = async () => {
  const systemPrompt = getSystemPrompt(user);
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: input }
    ],
    temperature: 0.7,
  });
  
  const botResponse = completion.choices[0].message.content;
  // Add to messages
};
```

### Adding More Personalization Dimensions

Beyond age, you could personalize by:
- **Mood history** - Adapt based on recent check-ins
- **Time of day** - Different support types (morning motivation vs. evening calm)
- **User preferences** - Preferred activities, coping strategies
- **Cultural background** - Culturally appropriate references
- **Language preference** - i18n support

## Privacy & Ethics

### Data Handling
- All user data stored in localStorage
- No server transmission (currently)
- User has full control to delete data
- Clear consent obtained upfront

### Ethical Considerations
1. **Never diagnose** - System is support, not medical care
2. **Always redirect crises** - Immediate professional help references
3. **Respect boundaries** - Age-appropriate content
4. **Be transparent** - Clear about AI limitations
5. **Empower users** - Focus on coping skills, not dependency

### Crisis Protocol
When crisis detected:
1. ✅ Immediately show alert banner
2. ✅ Provide emergency hotlines
3. ✅ Encourage immediate professional help
4. ✅ Do not attempt to "solve" the crisis
5. ✅ Log (if implemented) for safety review

## Future Enhancements

### Advanced Personalization
- [ ] Dynamic tone adjustment based on conversation sentiment
- [ ] Learning user's preferred language style
- [ ] Context-aware topic suggestions
- [ ] Personalized coping strategy recommendations

### Analytics & Insights
- [ ] Mood tracking over time
- [ ] Progress visualization
- [ ] Trigger pattern identification
- [ ] Personalized wellness reports

### AI Integration
- [ ] Connect to OpenAI/Anthropic
- [ ] Vector database for conversation memory
- [ ] RAG for mental health resources
- [ ] Fine-tuned models per age group

---

## Quick Reference

### Using UserContext
```typescript
import { useUser } from '@/contexts/UserContext';

const { user, updateUser, clearUser } = useUser();

// Access data
console.log(user.name, user.ageGroup);

// Update data
updateUser({ name: 'New Name' });

// Clear all data
clearUser();
```

### Checking Onboarding Status
```typescript
useEffect(() => {
  if (!user.hasCompletedOnboarding) {
    navigate('/onboarding');
  }
}, [user.hasCompletedOnboarding]);
```

### Getting Age-Appropriate Content
```typescript
import { getAgeBasedTone, getPersonalizedGreeting } from '@/lib/personalization';

const greeting = getPersonalizedGreeting(user);
const guidelines = getAgeBasedTone(user.ageGroup);
```

---

**The personalization system is the heart of what makes Serenity empathetic and effective!** 💜
