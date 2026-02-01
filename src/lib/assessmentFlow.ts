
export interface AssessmentReport {
    emotionalState: string;
    dominantEmotion: 'calm' | 'happy' | 'tired' | 'sad' | 'anxious' | 'irritated';
    stressLevel: 'low' | 'moderate' | 'high';
    supportiveMessage: string;
    suggestions: string[];
}

export const assessmentQuestions = [
    "How are you feeling in your heart right now—happy, sad, or just okay?",
    "Did you sleep well last night, or was it a bit hard to drift off?",
    "Was it easy to focus on your toys, school, or work today, or did your mind wander?",
    "Has your body felt relaxed today, or a little tight and jumpy?",
    "Do you have any big worries on your mind today, or are they just tiny ones?",
    "Do you feel full of energy today, or do you feel a little tired?",
    "When things get a bit tricky, do you feel calm or do you get frustrated easily?",
    "Have you had a nice moment today that made you smile or laugh?",
    "Does today feel like a 'fast' day where everything is happening at once, or a 'slow' and peaceful day?",
    "If today was a color, what color would it be?"
];

export const analyzeAssessment = (answers: string[]): AssessmentReport => {
    const allAnswers = answers.join(' ').toLowerCase();

    // Simple keyword-based analysis
    let happyCount = (allAnswers.match(/happy|good|great|okay|well|easy|relaxed|calm|smile|laugh|bright|peaceful/g) || []).length;
    let sadCount = (allAnswers.match(/sad|bad|hard|difficult|heavy|tired|grey|struggle|cry/g) || []).length;
    let stressCount = (allAnswers.match(/anxious|worried|tight|jumpy|big|fast|overwhelmed|tight|frustrated/g) || []).length;

    let dominantEmotion: AssessmentReport['dominantEmotion'] = 'calm';
    if (happyCount > sadCount && happyCount > stressCount) dominantEmotion = 'happy';
    else if (sadCount > happyCount && sadCount > stressCount) dominantEmotion = 'sad';
    else if (stressCount > happyCount && stressCount > sadCount) {
        if (allAnswers.includes('frustrated') || allAnswers.includes('cross')) dominantEmotion = 'irritated';
        else dominantEmotion = 'anxious';
    }
    else if (allAnswers.includes('tired') || allAnswers.includes('sleepy')) dominantEmotion = 'tired';

    let stressLevel: AssessmentReport['stressLevel'] = 'moderate';
    if (stressCount <= 2 && happyCount > 5) stressLevel = 'low';
    else if (stressCount > 5) stressLevel = 'high';

    const emotionalState = stressLevel === 'low'
        ? "You seem to be in a gentle and balanced place."
        : stressLevel === 'moderate'
            ? "You're handling things as they come, step by step."
            : "You're carrying a lot right now, and that's okay to acknowledge.";

    const messages = {
        low: "It's wonderful to see you finding moments of peace.",
        moderate: "You're doing a great job navigating your day.",
        high: "I'm so proud of you for being so brave and sharing how you feel."
    };

    const suggestionsMap = {
        low: ["Keep doing what makes you smile", "Share your joy with a friend", "Take a moment to enjoy the sunshine"],
        moderate: ["Try a 2-minute breathing exercise", "Listen to your favorite happy song", "Draw how you feel in your journal"],
        high: ["Rest your body in a cozy spot", "Gentle deep breathing", "Maybe talk to a grown-up you trust about your big worries"]
    };

    return {
        emotionalState,
        dominantEmotion,
        stressLevel,
        supportiveMessage: messages[stressLevel],
        suggestions: suggestionsMap[stressLevel],
    };
};
