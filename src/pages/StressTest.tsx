import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useUser } from "@/contexts/UserContext";
import { getAgeTheme } from "@/lib/ageThemes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";
import { apiFetch } from "@/lib/api";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  MessageCircle,
  Wind,
  Headphones,
  ClipboardList,
  Sparkles
} from "lucide-react";

// Categorized Questions
// Q1, Q5 -> Anxiety
// Q2, Q4 -> Depression
// Q3 -> Stress
const questions = [
  {
    id: 1,
    question: "How often have you felt nervous or anxious in the past week?",
    category: "anxiety",
    type: "scale",
    options: [
      { label: "Never", value: 0, emoji: "😊" },
      { label: "Rarely", value: 1, emoji: "🙂" },
      { label: "Sometimes", value: 2, emoji: "😐" },
      { label: "Often", value: 3, emoji: "😟" },
      { label: "Very Often", value: 4, emoji: "😰" },
    ],
  },
  {
    id: 2,
    question: "How well have you been sleeping lately?",
    category: "depression",
    type: "scale",
    options: [
      { label: "Very Well", value: 0, emoji: "😴" },
      { label: "Well", value: 1, emoji: "🙂" },
      { label: "Okay", value: 2, emoji: "😐" },
      { label: "Poorly", value: 3, emoji: "😔" },
      { label: "Very Poorly", value: 4, emoji: "😫" },
    ],
  },
  {
    id: 3,
    question: "How often do you feel overwhelmed by your responsibilities?",
    category: "stress",
    type: "scale",
    options: [
      { label: "Never", value: 0, emoji: "😌" },
      { label: "Rarely", value: 1, emoji: "🙂" },
      { label: "Sometimes", value: 2, emoji: "😐" },
      { label: "Often", value: 3, emoji: "😓" },
      { label: "Always", value: 4, emoji: "😵" },
    ],
  },
  {
    id: 4,
    question: "How would you rate your energy levels?",
    category: "depression",
    type: "scale",
    options: [
      { label: "Energetic", value: 0, emoji: "⚡" },
      { label: "Good", value: 1, emoji: "💪" },
      { label: "Average", value: 2, emoji: "😐" },
      { label: "Low", value: 3, emoji: "😔" },
      { label: "Exhausted", value: 4, emoji: "😴" },
    ],
  },
  {
    id: 5,
    question: "How easy is it for you to relax and unwind?",
    category: "anxiety",
    type: "scale",
    options: [
      { label: "Very Easy", value: 0, emoji: "🧘" },
      { label: "Easy", value: 1, emoji: "😊" },
      { label: "Moderate", value: 2, emoji: "😐" },
      { label: "Difficult", value: 3, emoji: "😟" },
      { label: "Very Difficult", value: 4, emoji: "😫" },
    ],
  },
];

function getStressLevel(score: number) {
  const percentage = (score / (questions.length * 4)) * 100;
  if (percentage <= 25) return { level: "Low", color: "text-emerald-500", description: "You're managing well! Keep up the good practices.", suggestion: "Consider maintaining your current wellness routine." };
  if (percentage <= 50) return { level: "Moderate", color: "text-amber-500", description: "You're doing okay, but there's room for improvement.", suggestion: "Try some relaxation techniques to help manage stress." };
  if (percentage <= 75) return { level: "Elevated", color: "text-orange-500", description: "You're experiencing significant stress. Take time for self-care.", suggestion: "Consider talking to someone and using our relief tools." };
  return { level: "High", color: "text-rose-500", description: "Your stress levels are high. Please prioritize your wellbeing.", suggestion: "We recommend speaking with a professional and using our support tools." };
}

export default function StressTest() {
  const { t } = useTranslation();
  const { user, token } = useUser();
  const theme = getAgeTheme(user.ageGroup);
  const [view, setView] = useState<'menu' | 'questions' | 'results'>('menu');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.user_id) {
      navigate('/');
      return;
    }
    if (!user.hasCompletedOnboarding) {
      navigate('/onboarding');
      return;
    }
  }, [user.user_id, user.hasCompletedOnboarding, navigate]);

  // Trigger Save on Complete
  useEffect(() => {
    if (view === 'results' && user.user_id && !isSaving) {
      saveResults();
    }
  }, [view, user.user_id]);

  const saveResults = async () => {
    setIsSaving(true);

    // Calculate category scores
    let totalAnxiety = 0; // Max 8
    let totalDepression = 0; // Max 8
    let totalStress = 0; // Max 4

    questions.forEach(q => {
      const val = answers[q.id] || 0;
      if (q.category === 'anxiety') totalAnxiety += val;
      if (q.category === 'depression') totalDepression += val;
      if (q.category === 'stress') totalStress += val;
    });

    // Normalize to 0-100 for storage/display consistency
    const anxietyScore = Math.round((totalAnxiety / 8) * 100);
    const depressionScore = Math.round((totalDepression / 8) * 100);
    const stressScore = Math.round((totalStress / 4) * 100);

    try {
      await apiFetch("/api/assessments", {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.user_id,
          stress_score: stressScore,
          depression_score: depressionScore,
          anxiety_score: anxietyScore,
          date: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error("Assessment save error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnswer = (value: number) => {
    setAnswers({ ...answers, [questions[currentQuestion].id]: value });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setView('results');
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    } else {
      setView('menu');
    }
  };

  const totalScore = Object.values(answers).reduce((sum, val) => sum + val, 0);
  const stressResult = getStressLevel(totalScore);
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const currentAnswer = answers[questions[currentQuestion]?.id];

  const assessmentMenuOptions = [
    {
      id: "audio",
      title: "Audio Assessment",
      icon: Headphones,
      gradient: "from-[#0075FF]/20 to-[#00E0FF]/10",
      accent: "text-[#00E0FF]",
      link: "/assessment/audio",
      state: undefined
    },
    {
      id: "chat",
      title: "Chat with Test",
      icon: MessageCircle,
      gradient: "from-[#0075FF]/30 to-[#A020F0]/10",
      accent: "text-[#0075FF]",
      link: "/assessment/chat-test",
      state: { startAssessment: true }
    },
    {
      id: "test",
      title: "Test Only",
      icon: ClipboardList,
      gradient: "from-[#0075FF]/40 to-transparent",
      accent: "text-[#00E0FF]",
      action: () => setView('questions'),
      link: undefined,
      state: undefined
    }
  ];

  return (
    <div className="min-h-screen bg-[#0B1437] text-white selection:bg-[#0075FF] overflow-x-hidden font-sans relative">
      {/* Dark Background Gradients - Consistent with Welcome Page */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0075FF]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00E0FF]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Header />

        <main className="pt-24 pb-12">
          <div className="container mx-auto px-4 max-w-5xl">
            <AnimatePresence mode="wait">
              {view === 'menu' && (
                <motion.div
                  key="menu"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex flex-col items-center justify-center min-h-[60vh]"
                >
                  <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                      {t('assessmentMenuTitle')}
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                      Choose the path that feels most comfortable for you today. We're here to listen and help you find clarity.
                    </p>
                  </div>

                  <div className="w-full bg-[#111C44]/60 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-soft relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#0075FF]/10 rounded-full blur-3xl" />
                    <div className="grid md:grid-cols-3 gap-8 relative z-10">
                      {assessmentMenuOptions.map((option, idx) => (
                        <motion.div
                          key={option.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          {option.link ? (
                            <Link to={option.link} state={option.state} className="block h-full">
                              <MenuCard option={option} />
                            </Link>
                          ) : (
                            <div onClick={option.action} className="cursor-pointer h-full">
                              <MenuCard option={option} />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {view === 'questions' && (
                <motion.div
                  key="questions"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="max-w-2xl mx-auto"
                >
                  {/* Progress */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">
                        Question {currentQuestion + 1} of {questions.length}
                      </span>
                      <span className="text-sm font-bold text-[#00E0FF]">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <Progress value={progress} className="h-2 bg-white/5" indicatorClassName="bg-gradient-to-r from-[#0075FF] to-[#00E0FF]" />
                  </div>

                  {/* Question Card */}
                  <Card className="p-8 backdrop-blur-2xl bg-[#111C44]/60 border-white/10 rounded-[2rem] shadow-soft">
                    <motion.h2
                      key={currentQuestion}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="text-xl md:text-2xl font-bold text-white mb-8 text-center"
                    >
                      {questions[currentQuestion].question}
                    </motion.h2>

                    {/* Options */}
                    <div className="space-y-3">
                      {questions[currentQuestion].options.map((option, index) => (
                        <motion.button
                          key={option.value}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => handleAnswer(option.value)}
                          className={`w-full p-5 rounded-2xl border transition-all flex items-center gap-4 ${currentAnswer === option.value
                            ? "border-[#0075FF] bg-[#0075FF]/10 shadow-[0_0_20px_rgba(0,117,255,0.2)]"
                            : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
                            }`}
                        >
                          <span className="text-3xl">{option.emoji}</span>
                          <span className={`font-semibold ${currentAnswer === option.value ? "text-white" : "text-slate-300"}`}>{option.label}</span>
                          {currentAnswer === option.value && (
                            <CheckCircle className="w-6 h-6 text-[#00E0FF] ml-auto" />
                          )}
                        </motion.button>
                      ))}
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-10">
                      <Button
                        variant="ghost"
                        onClick={handleBack}
                        className="text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-bold"
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        BACK
                      </Button>
                      <Button
                        onClick={handleNext}
                        disabled={currentAnswer === undefined}
                        className="bg-[#0075FF] hover:bg-[#0061D5] text-white rounded-xl px-10 h-12 shadow-lg shadow-[#0075FF]/30 font-bold border-0"
                      >
                        {currentQuestion === questions.length - 1 ? "SEE RESULTS" : "NEXT"}
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              )}

              {view === 'results' && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="max-w-2xl mx-auto"
                >
                  {/* Results Card */}
                  <Card className="p-10 backdrop-blur-2xl bg-[#111C44]/60 border-white/10 text-center rounded-[2.5rem] shadow-elevated">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-gradient-to-r from-[#0075FF] to-[#00E0FF] flex items-center justify-center shadow-lg shadow-[#0075FF]/30"
                    >
                      <CheckCircle className="w-12 h-12 text-white" />
                    </motion.div>

                    <h2 className="text-3xl font-bold text-white mb-2">
                      Assessment Complete
                    </h2>

                    <div className="my-10 p-6 rounded-2xl bg-white/5 border border-white/10">
                      <p className="text-slate-400 mb-2 uppercase tracking-widest text-xs font-bold">Your Status</p>
                      <p className={`text-5xl font-black tracking-tight ${stressResult.color}`}>
                        {stressResult.level}
                      </p>
                    </div>

                    <p className="text-slate-300 text-lg mb-4">{stressResult.description}</p>
                    <p className="text-[#00E0FF] font-bold text-lg mb-10">{stressResult.suggestion}</p>

                    {/* Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Button className="bg-[#0075FF] hover:bg-[#0061D5] text-white rounded-xl h-12 font-bold shadow-lg shadow-[#0075FF]/20 border-0" asChild>
                        <Link to="/talk-with-your-friend">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          TALK TO FRIEND
                        </Link>
                      </Button>
                      <Button className="bg-white/5 hover:bg-white/10 text-white rounded-xl h-12 font-bold border-white/10" variant="outline" asChild>
                        <Link to="/dashboard">
                          VIEW DASHBOARD
                        </Link>
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      className="mt-8 text-slate-500 hover:text-white hover:bg-white/5 font-bold"
                      onClick={() => {
                        setCurrentQuestion(0);
                        setAnswers({});
                        setView('menu');
                      }}
                    >
                      {t('returnToMenu').toUpperCase()}
                    </Button>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

function MenuCard({ option }: { option: any }) {
  return (
    <Card className={`h-full p-8 flex flex-col items-center text-center gap-6 border-transparent bg-gradient-to-br ${option.gradient} rounded-[2rem] shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group`}>
      <div className={`w-16 h-16 rounded-2xl bg-white/40 dark:bg-black/20 flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
        <option.icon className={`w-8 h-8 ${option.accent}`} />
      </div>
      <h3 className="text-lg font-medium text-foreground leading-snug">
        {option.title}
      </h3>
      <div className="mt-auto pt-4">
        <Sparkles className={`w-4 h-4 ${option.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
      </div>
    </Card>
  );
}
