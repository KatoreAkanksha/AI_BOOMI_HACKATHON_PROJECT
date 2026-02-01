import { UserProfile } from '@/contexts/UserContext';

/**
 * Enhanced chatbot response generator with age-appropriate personalities
 */
export const generateAgeAppropriateResponse = (
    userMessage: string,
    ageGroup: UserProfile['ageGroup'],
    userName: string
): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Detect message intent
    const isGreeting = /^(hi|hello|hey|good morning|good afternoon|good evening)/i.test(userMessage);
    const isFeeling = /(feel|feeling|emotions?|mood)/i.test(lowerMessage);
    const isStress = /(stress|anxious|anxiety|worried|overwhelm)/i.test(lowerMessage);
    const isSchool = /(school|class|homework|teacher|exam|test|study)/i.test(lowerMessage);
    const isWork = /(work|job|career|boss|office|meeting|deadline)/i.test(lowerMessage);
    const isFamily = /(family|parent|mom|dad|sibling|brother|sister)/i.test(lowerMessage);
    const isRelationship = /(relationship|partner|boyfriend|girlfriend|friend|lonely)/i.test(lowerMessage);
    const isSad = /(sad|depressed|down|crying|upset|hurt)/i.test(lowerMessage);
    const isAngry = /(angry|mad|frustrated|annoyed|irritated)/i.test(lowerMessage);
    const isHelp = /(help|support|advice|what should i do)/i.test(lowerMessage);

    // Age-specific response generation
    switch (ageGroup) {
        case '0-18':
            if (isGreeting) {
                return `Hey ${userName}! 🌟 I'm so happy you're here! What's going on today?`;
            }
            if (isSchool) {
                return `School stuff can be tough sometimes! 📚 Want to tell me what's challenging you? Remember, everyone learns at their own pace, and that's totally okay!`;
            }
            if (isSad) {
                return `I'm really sorry you're feeling sad right now ${userName}. 💙 It's brave to share how you feel. What happened that made you feel this way? Remember, feelings come and go like clouds in the sky.`;
            }
            if (isAngry) {
                return `Feeling angry is totally normal! 😤 Everyone gets mad sometimes. Let's take a deep breath together - breathe in for 4 counts... and out for 4 counts. Feel a little better? Want to tell me what made you angry?`;
            }
            if (isStress) {
                return `Feeling stressed is no fun! 😔 You know what? You're already doing something super smart by talking about it! What's stressing you out? Let's figure it out together! 🌈`;
            }
            if (isFamily) {
                return `Family can be complicated sometimes, right? 👨‍👩‍👧 It's okay to have all kinds of feelings about your family. What's going on with them?`;
            }
            if (isFeeling) {
                return `I'm glad you want to talk about your feelings! That's really mature of you! 🌟 All feelings are okay - happy, sad, scared, excited - they're all important. What are you feeling right now?`;
            }
            if (isHelp) {
                return `I'm here to help you! 💪 Let's work through this together. First, take a deep breath. Now, tell me exactly what's going on, and we'll figure out some ways to make things better!`;
            }
            return `I hear you, ${userName}! 🌟 That sounds like a lot to deal with. You're really brave for talking about it. Can you tell me more about what's on your mind? Remember, I'm here to listen, not to judge!`;

        case '19-24':
            if (isGreeting) {
                return `Hey ${userName}! Good to see you. What's been on your mind lately?`;
            }
            if (isWork || isSchool) {
                const context = isWork ? 'career' : 'academic';
                return `I totally get it - ${context} pressure in your early 20s hits different. It feels like everyone expects you to have it all figured out, right? But here's the thing: you're allowed to explore, make mistakes, and change direction. What specific ${context === 'career' ? 'work situation' : 'school challenge'} is weighing on you?`;
            }
            if (isRelationship) {
                return `Relationships at this stage are complex - you're figuring out who you are while connecting with others. That's not easy. Want to share what's going on? No judgment here, just real talk.`;
            }
            if (isStress) {
                return `The pressure you're under right now is real, ${userName}. Quarter-life stress is legit - balancing identity, independence, and expectations is exhausting. Let's break down what's overwhelming you. What's the biggest source right now?`;
            }
            if (isSad) {
                return `I'm really sorry you're going through this, ${userName}. Depression and sadness in your 20s can feel isolating because everyone pretends they have it together. But you're being real right now, and that takes courage. What's been bringing you down?`;
            }
            if (isHelp) {
                return `I appreciate you reaching out for support - that's actually a sign of strength, not weakness. Let's work through this. What area of your life needs the most attention right now? We can break it down into manageable steps.`;
            }
            return `I hear you, ${userName}. Your feelings are completely valid - this age comes with unique challenges. Tell me more about what's going on. I'm here to listen and support you through this.`;

        case '25-50':
            if (isGreeting) {
                return `Hello ${userName}. I hope you're finding a moment of peace today. What brought you here?`;
            }
            if (isWork) {
                return `Work stress and burnout are serious concerns, ${userName}. The demands on professionals today are unsustainable, and it affects everything - health, relationships, well-being. You deserve better balance. What aspects of work are impacting you most right now?`;
            }
            if (isFamily) {
                return `Balancing family responsibilities with personal well-being is one of the most challenging aspects of this life stage. You're managing multiple roles, and it's natural to feel stretched. What's weighing most heavily on you regarding family?`;
            }
            if (isStress) {
                return `Chronic stress at this stage often comes from managing multiple competing priorities. It's important to acknowledge that you cannot pour from an empty cup. Let's identify what's causing the most stress and explore sustainable strategies for managing it.`;
            }
            if (isSad) {
                return `I'm sorry you're experiencing this, ${userName}. Adult depression often gets overlooked because you're expected to "handle it" while managing responsibilities. Your mental health matters just as much as your obligations. What has been contributing to these feelings?`;
            }
            if (isHelp) {
                return `Seeking support is a sign of wisdom and self-awareness. Let's approach this systematically. What area of your life needs the most attention right now - work, relationships, health, or something else? We can develop practical strategies together.`;
            }
            return `Thank you for sharing, ${userName}. You're managing significant responsibilities, and it's important to acknowledge when you need support. I'm here to listen and help you explore solutions. What's most pressing for you right now?`;

        case '51+':
            if (isGreeting) {
                return `Hello ${userName}, it's wonderful to hear from you. How are you feeling today, dear friend?`;
            }
            if (isFamily) {
                return `Family relationships evolve so much over time, don't they? Whether it's adult children, grandchildren, or other family members, these connections remain deeply important. I'm here to listen. What's on your heart regarding your family?`;
            }
            if (isSad || isFeeling) {
                return `Dear ${userName}, I'm so glad you're sharing your feelings with me. Your emotions are important and deserving of attention and care. Sometimes life brings challenges we never expected, and it's okay to need support. What has been troubling you?`;
            }
            if (isStress) {
                return `Stress can affect our well-being in so many ways, especially as we get older. You deserve peace and comfort, ${userName}. Let's talk about what's causing you stress. Please take all the time you need - there's no rush here.`;
            }
            if (isHelp) {
                return `I'm honored that you've reached out for support, ${userName}. You deserve to feel heard and cared for. Let's take this slowly and gently. What would help you feel most supported right now?`;
            }
            return `Thank you for sharing with me, ${userName}. Your thoughts and feelings matter deeply. I'm here to listen with patience and care. Please, tell me more about what's on your mind. Take all the time you need.`;

        default:
            if (isGreeting) {
                return `Hi ${userName}! How can I support you today?`;
            }
            if (isStress) {
                return `Stress can be overwhelming. I'm here to help you work through it. What's causing you the most stress right now?`;
            }
            if (isSad) {
                return `I'm sorry you're feeling sad, ${userName}. Your feelings are valid. Would you like to talk about what's been bothering you?`;
            }
            if (isHelp) {
                return `I'm here to support you. Let's work through this together. What do you need help with?`;
            }
            return `I hear you, ${userName}. That sounds like a lot to deal with. Can you tell me more about what's going on?`;
    }
};

/**
 * Get follow-up questions based on age group
 */
export const getFollowUpQuestion = (ageGroup: UserProfile['ageGroup']): string => {
    switch (ageGroup) {
        case '0-18':
            return "Want to keep talking? I'm here for you! 🌟";
        case '19-24':
            return "What else is on your mind?";
        case '25-50':
            return "Would you like to explore this further?";
        case '51+':
            return "Is there anything else you'd like to share?";
        default:
            return "How else can I support you?";
    }
};

/**
 * Get supportive validation messages
 */
export const getValidationMessage = (ageGroup: UserProfile['ageGroup']): string => {
    const messages = {
        '0-18': [
            "Your feelings are totally valid! 💙",
            "It's really brave to talk about this! 🌟",
            "You're doing an awesome job opening up! 💪",
        ],
        '19-24': [
            "Your feelings are completely valid",
            "Thanks for being real with me",
            "I appreciate your honesty",
        ],
        '25-50': [
            "Your experience is valid and important",
            "Thank you for sharing this with me",
            "I acknowledge the weight of what you're carrying",
        ],
        '51+': [
            "Your feelings are deeply important",
            "Thank you for trusting me with this",
            "I truly appreciate you sharing this with me",
        ]
    };

    const ageMessages = messages[ageGroup || '25-50'];
    return ageMessages[Math.floor(Math.random() * ageMessages.length)];
};
