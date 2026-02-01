import { UserProfile } from '@/contexts/UserContext';

export interface AgeTheme {
    // Visual styling
    accentColor: string;
    gradientClass: string;
    fontSize: {
        heading: string;
        body: string;
        small: string;
    };
    cardStyle: string;
    emojiStyle: string;

    // Dashboard content emphasis
    primaryFeatures: string[];
    secondaryFeatures: string[];
    hiddenFeatures: string[];

    // Tone and messaging
    welcomeEmoji: string;
    encouragementStyle: string;
    ctaVerb: string; // "Try", "Start", "Explore", "Begin"

    // Recommended actions
    recommendedTools: {
        icon: string;
        title: string;
        description: string;
        link: string;
    }[];
}

export const getAgeTheme = (ageGroup: UserProfile['ageGroup']): AgeTheme => {
    switch (ageGroup) {
        case '0-18':
            return {
                accentColor: 'text-cyan-400',
                gradientClass: 'from-[#0075FF]/20 to-[#00E0FF]/10',
                fontSize: {
                    heading: 'text-3xl md:text-4xl font-semibold',
                    body: 'text-lg',
                    small: 'text-base'
                },
                cardStyle: 'rounded-[2rem] border-white/10 shadow-xl bg-white/5 backdrop-blur-xl transition-all hover:bg-white/10 ring-1 ring-white/20',
                emojiStyle: 'text-6xl',
                primaryFeatures: ['breathing', 'mood-check', 'calm-actions'],
                secondaryFeatures: ['reflection', 'sounds'],
                hiddenFeatures: ['stress-test', 'analytics', 'reports', 'goals'],
                welcomeEmoji: '✨',
                encouragementStyle: 'gentle-supportive',
                ctaVerb: 'Explore',
                recommendedTools: [
                    {
                        icon: '🌬️',
                        title: 'Just Breathe',
                        description: 'A moment of calm for you',
                        link: '/breathing'
                    },
                    {
                        icon: '🎵',
                        title: 'Gentle Sounds',
                        description: 'Soft music to help you relax',
                        link: '/tools'
                    },
                    {
                        icon: '✨',
                        title: 'Kind Thoughts',
                        description: 'A safe space for reflection',
                        link: '/tools'
                    }
                ]
            };

        case '19-24':
            return {
                accentColor: 'text-blue-400',
                gradientClass: 'from-[#0075FF]/30 to-[#A020F0]/10',
                fontSize: {
                    heading: 'text-3xl md:text-4xl',
                    body: 'text-base',
                    small: 'text-sm'
                },
                cardStyle: 'rounded-2xl shadow-2xl border border-white/20 bg-[#111C44]/60 backdrop-blur-2xl transition-all hover:border-blue-500/50',
                emojiStyle: 'text-4xl',
                primaryFeatures: ['stress-test', 'chat', 'goals'],
                secondaryFeatures: ['mood-check', 'meditation', 'journal'],
                hiddenFeatures: [],
                welcomeEmoji: '🚀',
                encouragementStyle: 'motivational-real',
                ctaVerb: 'Start',
                recommendedTools: [
                    {
                        icon: '📊',
                        title: 'Track Your Progress',
                        description: 'See your growth and identify patterns',
                        link: '/stress-test'
                    },
                    {
                        icon: '🎯',
                        title: 'Goal Setting',
                        description: 'Set and achieve your wellness goals',
                        link: '/tools'
                    },
                    {
                        icon: '💬',
                        title: 'Talk It Through',
                        description: 'Work through challenges with support',
                        link: '/chat'
                    }
                ]
            };

        case '25-50':
            return {
                accentColor: 'text-indigo-400',
                gradientClass: 'from-[#111C44] to-[#0B1437]',
                fontSize: {
                    heading: 'text-2xl md:text-3xl',
                    body: 'text-base',
                    small: 'text-xs'
                },
                cardStyle: 'rounded-xl shadow-lg border border-white/10 bg-[#1A234A]/80 backdrop-blur-md transition-all hover:bg-white/5',
                emojiStyle: 'text-3xl',
                primaryFeatures: ['stress-test', 'analytics', 'meditation'],
                secondaryFeatures: ['chat', 'breathing', 'journal'],
                hiddenFeatures: [],
                welcomeEmoji: '🧘',
                encouragementStyle: 'professional-calm',
                ctaVerb: 'Begin',
                recommendedTools: [
                    {
                        icon: '📈',
                        title: 'Wellness Analytics',
                        description: 'Track burnout and recovery patterns',
                        link: '/stress-test'
                    },
                    {
                        icon: '⚖️',
                        title: 'Work-Life Balance',
                        description: 'Tools for sustainable productivity',
                        link: '/tools'
                    },
                    {
                        icon: '🧠',
                        title: 'Guided Support',
                        description: 'Professional-grade stress management',
                        link: '/chat'
                    }
                ]
            };

        case '51+':
            return {
                accentColor: 'text-amber-400',
                gradientClass: 'from-[#0B1437] via-[#111C44] to-[#0B1437]',
                fontSize: {
                    heading: 'text-3xl md:text-4xl font-medium',
                    body: 'text-lg',
                    small: 'text-base'
                },
                cardStyle: 'rounded-2xl shadow-xl border border-white/20 bg-white/5 backdrop-blur-xl transition-all',
                emojiStyle: 'text-5xl',
                primaryFeatures: ['chat', 'breathing', 'meditation'],
                secondaryFeatures: ['mood-check', 'music'],
                hiddenFeatures: ['stress-test', 'analytics', 'goals'],
                welcomeEmoji: '🌸',
                encouragementStyle: 'gentle-warm',
                ctaVerb: 'Explore',
                recommendedTools: [
                    {
                        icon: '☮️',
                        title: 'Peace & Calm',
                        description: 'Gentle exercises for inner peace',
                        link: '/tools'
                    },
                    {
                        icon: '💝',
                        title: 'Comforting Chat',
                        description: 'A patient listener, always here for you',
                        link: '/chat'
                    },
                    {
                        icon: '🎵',
                        title: 'Soothing Sounds',
                        description: 'Relaxing music and nature sounds',
                        link: '/tools'
                    }
                ]
            };

        default:
            return {
                accentColor: 'text-primary',
                gradientClass: 'from-[#0075FF] via-[#00E0FF] to-[#0075FF]',
                fontSize: {
                    heading: 'text-3xl md:text-4xl',
                    body: 'text-base',
                    small: 'text-sm'
                },
                cardStyle: 'rounded-2xl shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl',
                emojiStyle: 'text-4xl',
                primaryFeatures: ['stress-test', 'chat', 'meditation'],
                secondaryFeatures: ['mood-check', 'breathing', 'journal'],
                hiddenFeatures: [],
                welcomeEmoji: '💙',
                encouragementStyle: 'supportive-neutral',
                ctaVerb: 'Start',
                recommendedTools: [
                    {
                        icon: '📊',
                        title: 'Stress Assessment',
                        description: 'Understand your stress levels',
                        link: '/stress-test'
                    },
                    {
                        icon: '💬',
                        title: 'Supportive Chat',
                        description: 'Talk through what\'s on your mind',
                        link: '/chat'
                    },
                    {
                        icon: '🧘',
                        title: 'Relief Tools',
                        description: 'Explore wellness exercises',
                        link: '/tools'
                    }
                ]
            };
    }
};

// Helper to get age-appropriate encouragement messages
export const getEncouragementMessage = (ageGroup: UserProfile['ageGroup'], context: 'morning' | 'afternoon' | 'evening' | 'general'): string => {
    const hour = new Date().getHours();
    const timeContext = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

    const messages = {
        '0-18': {
            morning: "Good morning! 🌅 Ready to make today awesome?",
            afternoon: "Hey there! Hope your day is going well! 🌞",
            evening: "Hi! How was your day? Let's wind down together 🌙",
            general: "You're doing great! Remember, it's okay to take breaks 💪"
        },
        '19-24': {
            morning: "Good morning! Let's tackle today with intention 🌅",
            afternoon: "Hope you're staying balanced today 💪",
            evening: "Evening! Time to reflect and recharge 🌙",
            general: "You're navigating a challenging time - be proud of your progress 🚀"
        },
        '25-50': {
            morning: "Good morning. Let's prioritize your well-being today 🌅",
            afternoon: "Remember to pause and breathe - you've got this ⚖️",
            evening: "Evening. Time to decompress and restore balance 🌙",
            general: "Your well-being is as important as your responsibilities 🧘"
        },
        '51+': {
            morning: "Good morning, dear friend. Wishing you a peaceful day 🌅",
            afternoon: "I hope this afternoon finds you well 🌸",
            evening: "Good evening. Time for gentle rest and reflection 🌙",
            general: "Your peace of mind is precious. Take all the time you need 💝"
        }
    };

    return messages[ageGroup || '25-50']?.[timeContext] || messages['25-50'][timeContext];
};
