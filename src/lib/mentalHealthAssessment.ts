
export interface MentalHealthScore {
    anxiety: number;
    depression: number;
    stress: number;
    totalDistress: number;
}

export interface MentalHealthResult {
    anxietyLevel: 'Minimal' | 'Mild' | 'Moderate' | 'High';
    depressionLevel: 'Minimal' | 'Mild' | 'Moderate' | 'High';
    stressLevel: 'Minimal' | 'Mild' | 'Moderate' | 'High';
    overallDistress: string;
    interpretation: string;
    tips: string[];
    crisisMode: boolean;
}

export const assessmentQuestions = [
    {
        id: 'q1',
        text: 'Over the last two weeks, how often have you been feeling nervous, anxious, or on edge?',
        category: 'anxiety'
    },
    {
        id: 'q2',
        text: 'Have you found yourself unable to stop or control worrying lately?',
        category: 'anxiety'
    },
    {
        id: 'q3',
        text: 'In the past two weeks, how often have you been feeling down, depressed, or hopeless?',
        category: 'depression'
    },
    {
        id: 'q4',
        text: 'How often have you had little interest or pleasure in doing things?',
        category: 'depression'
    },
    {
        id: 'q5',
        text: 'Have you been feeling overwhelmed or unable to cope with your daily responsibilities?',
        category: 'stress'
    }
];

export const inferScore = (input: string): number => {
    const low = input.toLowerCase();

    // Severity keywords
    const highKeywords = ['always', 'every day', 'everyday', 'constantly', 'all the time', 'nearly every', 'daily', 'very often', '3'];
    const moderateKeywords = ['often', 'many days', 'frequently', 'half the days', 'most days', '2'];
    const mildKeywords = ['sometimes', 'few days', 'several days', 'occasionally', 'bit', 'slightly', '1'];
    const minimalKeywords = ['never', 'not at all', 'none', 'fine', 'okay', 'good', 'no', 'rarely', '0'];

    if (highKeywords.some(k => low.includes(k))) return 3;
    if (moderateKeywords.some(k => low.includes(k))) return 2;
    if (mildKeywords.some(k => low.includes(k))) return 1;
    if (minimalKeywords.some(k => low.includes(k))) return 0;

    // Default to 1 (mild) if we can't be sure but it's not minimal
    return 1;
};

export const isOffTopic = (input: string, questionText: string): boolean => {
    const low = input.toLowerCase();
    if (low.length < 2) return true; // Too short to be meaningful

    // Crisis keywords should NOT be treated as off-topic, they trigger safety
    if (detectCrisis(input)) return false;

    const mentalHealthKeywords = [
        'feel', 'felt', 'feeling', 'worry', 'worried', 'nervous', 'anxious', 'edge',
        'down', 'depressed', 'hopeless', 'interest', 'pleasure', 'cope', 'overwhelmed',
        'stress', 'daily', 'lately', 'never', 'always', 'sometimes', 'often', 'no', 'yes', 'fine', 'okay'
    ];

    const hasRelevance = mentalHealthKeywords.some(k => low.includes(k));
    const isDirectAnswer = ['0', '1', '2', '3'].some(n => low === n);

    return !hasRelevance && !isDirectAnswer && low.split(' ').length > 4; // Long responses without relevant keywords
};

export const detectCrisis = (input: string): boolean => {
    const low = input.toLowerCase();
    const crisisKeywords = [
        'suicide', 'kill myself', 'end my life', 'harm myself', 'don\'t want to live',
        'self-harm', 'better off dead', 'hopelessness', 'no way out', 'hurting myself',
        'ending it all', 'want to die'
    ];
    return crisisKeywords.some(keyword => low.includes(keyword));
};

const getLevel = (score: number, max: number): 'Minimal' | 'Mild' | 'Moderate' | 'High' => {
    const ratio = score / max;
    if (ratio <= 0.2) return 'Minimal';
    if (ratio <= 0.5) return 'Mild';
    if (ratio <= 0.8) return 'Moderate';
    return 'High';
};

export const calculateResults = (answers: number[]): MentalHealthResult => {
    const anxiety = answers[0] + answers[1]; // max 6
    const depression = answers[2] + answers[3]; // max 6
    const stress = answers[4]; // max 3

    const total = answers.reduce((a, b) => a + b, 0); // max 15

    const anxietyLevel = getLevel(anxiety, 6);
    const depressionLevel = getLevel(depression, 6);
    const stressLevel = getLevel(stress, 3);

    let interpretation = '';
    let tips: string[] = [];

    if (total <= 4) {
        interpretation = "You seem to be managing your emotional well-being quite well. While you may experience occasional challenges, your overall distress level is minimal.";
        tips = ["Maintain your current positive routines", "Practice mindfulness even when feeling good", "Stay connected with your support system"];
    } else if (total <= 8) {
        interpretation = "You're experiencing some mild emotional pressure. This is a good time to focus on self-care and small adjustments to find more balance.";
        tips = ["Try 5-minute daily meditation", "Prioritize consistent sleep patterns", "Engage in light physical activity like walking"];
    } else if (total <= 12) {
        interpretation = "Your responses suggest a moderate level of emotional distress. It's important to acknowledge these feelings and take intentional steps toward recovery.";
        tips = ["Practice deep breathing when feeling overwhelmed", "Set firm boundaries for work and social life", "Consider speaking with a supportive professional"];
    } else {
        interpretation = "You are carrying a heavy emotional burden right now. Please remember that you don't have to face this alone, and help is available.";
        tips = ["Reach out to a mental health professional immediately", "Connect with a trusted friend or family member", "Utilize support helplines for guided assistance"];
    }

    return {
        anxietyLevel,
        depressionLevel,
        stressLevel,
        overallDistress: getLevel(total, 15),
        interpretation,
        tips,
        crisisMode: false
    };
};
