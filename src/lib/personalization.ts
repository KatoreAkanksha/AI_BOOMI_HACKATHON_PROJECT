import { UserProfile } from '@/contexts/UserContext';

/**
 * Get age-appropriate tone and language guidelines for AI interactions
 */
export const getAgeBasedTone = (ageGroup: UserProfile['ageGroup']) => {
    switch (ageGroup) {
        case '0-18':
            return {
                tone: 'friendly, encouraging, and simple',
                focus: 'school stress, friendships, emotions, and building confidence',
                language: 'Use simple, clear words. Be positive and supportive. Avoid complex terms.',
                safety: 'Keep everything child-safe. Focus on healthy coping strategies.',
                examples: [
                    'Hey! I\'m here to listen 🌟',
                    'That sounds tough. Want to talk about it?',
                    'You\'re doing great by reaching out!'
                ]
            };

        case '19-24':
            return {
                tone: 'relatable, motivating, and understanding',
                focus: 'academic pressure, career anxiety, relationships, identity, and self-growth',
                language: 'Use modern, relatable language. Be authentic and non-judgmental.',
                safety: 'Acknowledge the challenges of this age. Provide practical coping strategies.',
                examples: [
                    'I hear you. This age can be really challenging.',
                    'Let\'s work through this together',
                    'Your feelings are completely valid'
                ]
            };

        case '25-50':
            return {
                tone: 'calm, professional, and empathetic',
                focus: 'work stress, burnout, family responsibilities, work-life balance, and mental health',
                language: 'Use clear, respectful language. Be practical and solution-oriented.',
                safety: 'Acknowledge the complexity of adult responsibilities. Offer balanced perspectives.',
                examples: [
                    'I understand the weight of these responsibilities.',
                    'Let\'s explore some strategies that might help',
                    'Taking care of yourself is not selfish'
                ]
            };

        case '51+':
            return {
                tone: 'gentle, respectful, and reassuring',
                focus: 'emotional well-being, life transitions, peace of mind, and comfort',
                language: 'Use warm, respectful language. Be patient and thorough.',
                safety: 'Approach with extra care and respect. Focus on comfort and dignity.',
                examples: [
                    'Thank you for sharing this with me.',
                    'Your well-being matters deeply.',
                    'Let\'s take this one step at a time'
                ]
            };

        default:
            return {
                tone: 'warm, supportive, and neutral',
                focus: 'general stress, emotions, and well-being',
                language: 'Use clear, compassionate language.',
                safety: 'Maintain empathy and non-judgment throughout.',
                examples: [
                    'I\'m here to support you.',
                    'How are you feeling right now?',
                    'Your feelings matter'
                ]
            };
    }
};

/**
 * Get a personalized greeting based on user profile
 */
export const getPersonalizedGreeting = (user: UserProfile) => {
    const name = user.name || 'friend';
    const timeBasedGreeting = getTimeBasedGreeting();

    switch (user.ageGroup) {
        case '0-18':
            return `Hey ${name}! ${timeBasedGreeting} 🌟 How can I help you today?`;
        case '19-24':
            return `Hi ${name}! ${timeBasedGreeting} What's on your mind?`;
        case '25-50':
            return `Hello ${name}, ${timeBasedGreeting.toLowerCase()} How are you doing?`;
        case '51+':
            return `Hello ${name}, ${timeBasedGreeting.toLowerCase()} I'm here to listen.`;
        default:
            return `Hello ${name}! ${timeBasedGreeting} How can I support you today?`;
    }
};

/**
 * Get time-appropriate greeting
 */
const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning!';
    if (hour < 17) return 'Good afternoon!';
    return 'Good evening!';
};

/**
 * Get age-appropriate system prompt for AI chatbot
 */
export const getSystemPrompt = (user: UserProfile) => {
    const ageGuidelines = getAgeBasedTone(user.ageGroup);
    const name = user.name || 'friend';

    return `You are Serenity, a compassionate mental wellness support companion. You are talking to ${name}, who is in the ${user.ageGroup || 'adult'} age group.

TONE & STYLE:
${ageGuidelines.tone}

FOCUS AREAS:
${ageGuidelines.focus}

LANGUAGE GUIDELINES:
${ageGuidelines.language}

SAFETY GUIDELINES:
${ageGuidelines.safety}

IMPORTANT RULES:
1. You are NOT a medical professional or therapist
2. NEVER diagnose mental health conditions
3. NEVER provide medical advice
4. If the user expresses thoughts of self-harm or suicide, immediately encourage them to:
   - Call emergency services (911)
   - Contact a crisis helpline (988 Suicide & Crisis Lifeline in the US)
   - Reach out to a trusted adult or mental health professional
5. Always remain empathetic, non-judgmental, and supportive
6. Use active listening techniques
7. Validate their feelings before offering suggestions
8. Encourage professional help when appropriate

Your goal is to provide emotional support, help them understand their feelings, and guide them toward healthy coping strategies. Be warm, authentic, and genuinely caring.`;
};

/**
 * Check if message requires crisis intervention
 */
export const detectCrisisKeywords = (message: string): boolean => {
    const crisisKeywords = [
        'suicide', 'kill myself', 'end my life', 'want to die',
        'better off dead', 'self-harm', 'hurt myself', 'no reason to live'
    ];

    const lowerMessage = message.toLowerCase();
    return crisisKeywords.some(keyword => lowerMessage.includes(keyword));
};

/**
 * Get crisis response message
 */
export const getCrisisResponse = () => {
    return {
        message: `I'm really concerned about what you're sharing. Your safety is the most important thing right now.

Please reach out for immediate support:
🆘 **Emergency Services**: Call 911
📞 **988 Suicide & Crisis Lifeline**: Call or text 988
💬 **Crisis Text Line**: Text HOME to 741741

These services have trained professionals available 24/7 who can provide the help you need right now.

You don't have to go through this alone. Please reach out to one of these resources immediately.`,
        requiresAttention: true
    };
};
