
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
    en: {
        translation: {
            // Hero
            welcomePart1: "Understand Your Stress.",
            welcomePart2: "Heal at Your Pace.",
            tagline: "Your AI-powered mental wellness companion",
            heroDesc: "A calm, intelligent companion that helps you assess stress levels, provides personalized support, and guides you toward inner peace.",
            getStarted: "Get Started",
            learnMore: "Learn More",

            // Nav
            dashboard: "Dashboard",
            chat: "Chat with AI",
            tools: "Wellness Tools",
            about: "About Us",
            assessment: "Assessment",
            howItWorks: "How It Works",

            // UI
            darkMode: "Dark Mode",
            lightMode: "Light Mode",
            language: "Language",
            home: "Back",
            welcome: "Welcome",
            welcomeToMindEase: "Welcome to MindEase",
            everythingOkay: "Everything is okay. Let's take a moment together.",
            howFeeling: "What is your name?",
            thanksSharing: "Thanks for sharing. You're doing great! ✨",
            breathe: "Breathe",
            sounds: "Sounds",
            reflect: "Reflect",
            privacyPolicy: "Privacy Policy",
            termsOfService: "Terms of Service",
            backToHome: "Back to Home",
            back: "Back",
            continue: "Continue",
            completeSetup: "Complete Setup",
            skipStep: "Skip this step",

            // Features
            featuresTitle: "Everything You Need for Mental Wellness",
            featuresSubtitle: "A complete toolkit designed to help you understand, manage, and improve your mental health.",
            assessmentTitle: "Smart Stress Assessment",
            assessmentDesc: "Take our scientifically-inspired test to understand your stress levels with personalized insights.",
            aiCompanionTitle: "Friendly AI Companion",
            aiCompanionDesc: "Chat with our empathetic bot through text, voice, or video. It listens without judgment.",
            reliefToolsTitle: "Relief Tools",
            reliefToolsDesc: "Access guided breathing, mindfulness exercises, calming music, and journaling spaces.",
            assessmentMenuTitle: "Mental Wellness Assessment",
            assessmentMenuDesc: "Choose how you'd like to check in with yourself today.",
            audioCard: "Audio",
            chatCard: "Chat to test your mental health level",
            testCard: "Test",
            returnToMenu: "Return to Assessment Menu",

            // How it works
            howItWorksTitle: "How It Works",
            howItWorksSubtitle: "Simple steps to start your journey toward better mental wellness.",
            step1Title: "Take the Assessment",
            step1Desc: "Answer simple, friendly questions to help us understand your current stress levels.",
            step2Title: "Talk to Our Bot",
            step2Desc: "Have a judgment-free conversation with our AI companion through text, voice, or video.",
            step3Title: "Get Insights",
            step3Desc: "Receive personalized stress scores and actionable recommendations tailored to you.",
            step4Title: "Practice & Heal",
            step4Desc: "Use our curated relief tools and track your progress over time.",

            // CTA
            ctaTitle: "Ready to Start Your Wellness Journey?",
            ctaDesc: "Join thousands of people who have taken the first step toward understanding and managing their stress. It's free, private, and takes just 5 minutes.",
            takeAssessment: "Take Free Assessment",

            // About
            aboutTitle: "About MindEase",
            aboutTagline: "We believe everyone deserves access to mental wellness support. MindEase is your calm, intelligent companion on the journey to understanding and managing stress.",
            missionTitle: "Our Mission",
            missionDesc1: "Stress affects everyone differently. Our mission is to provide accessible, judgment-free mental wellness support that meets you where you are.",
            missionDesc2: "Through scientifically-inspired assessments, an empathetic AI companion, and practical relief tools, we help you understand your stress patterns and develop healthier coping strategies.",
            valuesTitle: "Our Values",
            valuesSubtitle: "The principles that guide everything we build",
            disclaimerTitle: "Important Disclaimer",
            disclaimerDesc: "MindEase is designed to provide general wellness support and is not a replacement for professional mental health care. If you're experiencing a mental health crisis, please contact a healthcare provider or call your local emergency services. Our AI companion provides supportive conversation but is not a licensed therapist or counselor.",

            // Chat
            chatCompanionName: "MindEase Companion",
            activeListening: "Active & listening",
            thinking: "Thinking...",
            typeMessage: "Type your message...",
            aiNotice: "I'm an AI companion, not a medical professional. For emergencies, please contact a healthcare provider.",

            // Wellness Tools
            guidedBreathing: "Guided Breathing",
            guidedBreathingDesc: "Focus on your breath with our rhythm guide.",
            calmingSounds: "Calming Sounds",
            calmingSoundsDesc: "Immerse yourself in peaceful nature sounds.",
            mindfulJournal: "Mindful Journal",
            mindfulJournalDesc: "Write down your thoughts in a safe space.",
            affirmations: "Daily Affirmations",
            affirmationsDesc: "Positive messages to boost your mood.",
            toolsIntroTitle: "Your Wellness Toolkit",
            toolsIntroDesc: "Choose a tool that feels right for you today. Every small step matters.",

            // Tool Details
            breathingRitual: "Follow the rhythm - Breathe in as it expands, out as it contracts",
            breathingDuration: "Continue for 2-5 minutes for best results",
            chooseSound: "Choose a calming Sound",
            whatsOnMind: "What's on your mind?",
            journalDesc: "Writing can help process emotions and reduce stress",
            startWriting: "Start writing here... This is a safe space for your thoughts.",
            saveEntry: "Save Entry",
            nextAffirmation: "Next Affirmation",
            signIn: "Sign In",
        }
    },
    hi: {
        translation: {
            // Hero
            welcomePart1: "अपने तनाव को समझें।",
            welcomePart2: "अपनी गति से ठीक हों।",
            tagline: "आपका एआई-संचालित मानसिक कल्याण साथी",
            heroDesc: "एक शांत, बुद्धिमान साथी जो आपको तनाव के स्तर का आकलन करने में मदद करता है, व्यक्तिगत सहायता प्रदान करता है, और आपको आंतरिक शांति की ओर ले जाता है।",
            getStarted: "शुरू करें",
            learnMore: "अधिक जानें",

            // Nav
            dashboard: "डैशबोर्ड",
            chat: "एआई के साथ चैट करें",
            tools: "कल्याण उपकरण",
            about: "हमारे बारे में",
            assessment: "मूल्यांकन",
            howItWorks: "यह कैसे काम करता है",

            // UI
            darkMode: "डार्क मोड",
            lightMode: "लाइट मोड",
            language: "भाषा",
            home: "नमस्ते",
            welcome: "नमस्ते",
            welcomeToMindEase: "MindEase में आपका स्वागत है",
            everythingOkay: "सब कुछ ठीक है। आइए एक साथ एक पल बिताएं।",
            howFeeling: "आपका नाम क्या है?",
            thanksSharing: "साझा करने के लिए धन्यवाद। आप बहुत अच्छा कर रहे हैं! ✨",
            breathe: "सांस लें",
            sounds: "ध्वनियाँ",
            reflect: "चिंतन करें",
            privacyPolicy: "गोपनीयता नीति",
            termsOfService: "सेवा की शर्तें",
            backToHome: "मुखपृष्ठ पर वापस",
            back: "पीछे",
            continue: "जारी रखें",
            completeSetup: "सेटअप पूरा करें",
            skipStep: "इस चरण को छोड़ें",

            // Features
            featuresTitle: "मानसिक कल्याण के लिए आपकी ज़रूरत की हर चीज़",
            featuresSubtitle: "एक संपूर्ण टूलकिट जो आपको अपने मानसिक स्वास्थ्य को समझने, प्रबंधित करने और सुधारने में मदद करने के लिए डिज़ाइन किया गया है।",
            assessmentTitle: "स्मार्ट तनाव मूल्यांकन",
            assessmentDesc: "व्यक्तिगत अंतर्दृष्टि के साथ अपने तनाव के स्तर को समझने के लिए हमारा वैज्ञानिक रूप से प्रेरित परीक्षण लें।",
            aiCompanionTitle: "अनुकूल एआई साथी",
            aiCompanionDesc: "पाठ, आवाज या वीडियो के माध्यम से हमारे सहानुभूतिपूर्ण बॉट के साथ चैट करें। यह बिना किसी निर्णय के सुनता है।",
            reliefToolsTitle: "राहत उपकरण",
            reliefToolsDesc: "निर्देशित श्वास, माइंडफुलनेस अभ्यास, शांत संगीत और जर्नलिंग स्थानों तक पहुंचें।",
            assessmentMenuTitle: "मानसिक कल्याण मूल्यांकन",
            assessmentMenuDesc: "चुनें कि आप आज खुद को कैसे चेक करना चाहते हैं।",
            audioCard: "ऑडियो",
            chatCard: "मानसिक स्वास्थ्य स्तर की जांच के लिए चैट करें",
            testCard: "परीक्षण",
            returnToMenu: "मूल्यांकन मेनू पर लौटें",

            // How it works
            howItWorksTitle: "यह कैसे काम करता है",
            howItWorksSubtitle: "बेहतर मानसिक स्वास्थ्य की ओर अपनी यात्रा शुरू करने के लिए सरल कदम।",
            step1Title: "मूल्यांकन करें",
            step1Desc: "हमें आपके वर्तमान तनाव स्तरों को समझने में मदद करने के लिए सरल, मित्रवत प्रश्नों के उत्तर दें।",
            step2Title: "हमारे बॉट से बात करें",
            step2Desc: "पाठ, आवाज या वीडियो के माध्यम से हमारे एआई साथी के साथ निर्णय मुक्त बातचीत करें।",
            step3Title: "अंतर्दृष्टि प्राप्त करें",
            step3Desc: "व्यक्तिगत तनाव स्कोर और आपके लिए तैयार की गई कार्रवाई योग्य सिफारिशें प्राप्त करें।",
            step4Title: "अभ्यास करें और बेहतर बनें",
            step4Desc: "हमारे क्यूरेटेड राहत उपकरणों का उपयोग करें और समय के साथ अपनी प्रगति को ट्रैक करें।",

            // CTA
            ctaTitle: "अपनी कल्याण यात्रा शुरू करने के लिए तैयार हैं?",
            ctaDesc: "उन हजारों लोगों में शामिल हों जिन्होंने अपने तनाव को समझने और प्रबंधित करने की दिशा में पहला कदम उठाया है। यह मुफ़्त, निजी है और इसमें केवल 5 मिनट लगते हैं।",
            takeAssessment: "नि:शुल्क मूल्यांकन लें",

            // About
            aboutTitle: "MindEase के बारे में",
            aboutTagline: "हमारा मानना है कि हर कोई मानसिक कल्याण सहायता तक पहुंच का हकदार है। तनाव को समझने और प्रबंधित करने की यात्रा में MindEase आपका शांत, बुद्धिमान साथी है।",
            missionTitle: "हमारा मिशन",
            missionDesc1: "तनाव हर किसी को अलग तरह से प्रभावित करता है। हमारा मिशन सुलभ, निर्णय-मुक्त मानसिक कल्याण सहायता प्रदान करना है जो आपसे वहां मिलती है जहां आप हैं।",
            missionDesc2: "वैज्ञानिक रूप से प्रेरित आकलन, एक सहानुभूतिपूर्ण एआई साथी और व्यावहारिक राहत उपकरणों के माध्यम से, हम आपको अपने तनाव के पैटर्न को समझने और स्वस्थ मुकाबला रणनीतियों को विकसित करने में मदद करते हैं।",
            valuesTitle: "हमारे मूल्य",
            valuesSubtitle: "सिद्धांत जो हमारे द्वारा बनाई गई हर चीज का मार्गदर्शन करते हैं",
            disclaimerTitle: "महत्वपूर्ण अस्वीकरण",
            disclaimerDesc: "MindEase सामान्य कल्याण सहायता प्रदान करने के लिए डिज़ाइन किया गया है और यह पेशेवर मानसिक स्वास्थ्य देखभाल का विकल्प नहीं है। यदि आप मानसिक स्वास्थ्य संकट का अनुभव कर रहे हैं, तो कृपया स्वास्थ्य सेवा प्रदाता से संपर्क करें या अपनी स्थानीय आपातकालीन सेवाओं को कॉल करें। हमारा एआई साथी सहायक बातचीत प्रदान करता है लेकिन एक लाइसेंस प्राप्त चिकित्सक या परामर्शदाता नहीं है।",

            // Chat
            chatCompanionName: "MindEase साथी",
            activeListening: "सक्रिय और सुन रहा है",
            thinking: "सोच रहा है...",
            typeMessage: "अपना संदेश टाइप करें...",
            aiNotice: "मैं एक एआई साथी हूं, चिकित्सा पेशेवर नहीं। आपात स्थिति के लिए, कृपया स्वास्थ्य सेवा प्रदाता से संपर्क करें।",
        }
    }
};

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        }
    });

export default i18n;
