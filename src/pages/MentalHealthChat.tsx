
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useUser } from "@/contexts/UserContext";
import { getAgeTheme } from "@/lib/ageThemes";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Heart, Sparkles, AlertTriangle, CheckCircle2, FileText, Download, RefreshCw } from "lucide-react";
import { apiFetch } from "@/lib/api";
import {
    assessmentQuestions,
    inferScore,
    isOffTopic,
    detectCrisis,
    calculateResults,
    MentalHealthResult
} from "@/lib/mentalHealthAssessment";
import { generatePDF, generateDOC } from "@/lib/reportGenerator";

interface Message {
    id: string;
    role: "user" | "bot";
    content: string;
    timestamp: Date;
    isCrisis?: boolean;
}

export default function MentalHealthChat() {
    const { user, token } = useUser();
    const theme = getAgeTheme(user.ageGroup);

    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [currentStep, setCurrentStep] = useState<'assessment' | 'result' | 'crisis'>('assessment');
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [result, setResult] = useState<MentalHealthResult | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

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

    // Automatic Start
    useEffect(() => {
        const firstQuestion = assessmentQuestions[0].text;
        const initialMessage: Message = {
            id: "1",
            role: "bot",
            content: `Hello ${user.name || 'Friend'}. I'm here to support you in exploring your mental well-being. Let's talk for a moment. \n\n${firstQuestion}`,
            timestamp: new Date(),
        };
        setMessages([initialMessage]);
    }, [user.name]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const addBotMessage = (content: string, isCrisis = false) => {
        const newMessage: Message = {
            id: Date.now().toString(),
            role: "bot",
            content,
            timestamp: new Date(),
            isCrisis
        };
        setMessages(prev => [...prev, newMessage]);
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userInput = input.trim();
        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: userInput,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");

        if (detectCrisis(userInput)) {
            handleCrisis();
            return;
        }

        processConversationalInput(userInput);
    };

    const processConversationalInput = (userInput: string) => {
        setIsTyping(true);

        setTimeout(() => {
            setIsTyping(false);

            const currentQuestion = assessmentQuestions[currentQuestionIdx];

            // Check for off-topic or irrelevant response
            if (isOffTopic(userInput, currentQuestion.text)) {
                addBotMessage(`I hear you — that sounds like a lot to hold. To help me understand your well-being better, could you tell me more about this: ${currentQuestion.text}`);
                return;
            }

            // Infer score internally (hidden)
            const score = inferScore(userInput);
            const newAnswers = [...answers, score];
            setAnswers(newAnswers);

            if (currentQuestionIdx < assessmentQuestions.length - 1) {
                const nextIdx = currentQuestionIdx + 1;
                setCurrentQuestionIdx(nextIdx);

                // Empathetic transition + next question
                const transitions = [
                    "Thank you for sharing that with me.",
                    "I appreciate your honesty.",
                    "I'm listening. Tell me...",
                    "That's helpful to know."
                ];
                const transition = transitions[Math.floor(Math.random() * transitions.length)];

                addBotMessage(`${transition} ${assessmentQuestions[nextIdx].text}`);
            } else {
                finishAssessment(newAnswers);
            }
        }, 1500);
    };

    const finishAssessment = async (finalAnswers: number[]) => {
        const results = calculateResults(finalAnswers);
        setResult(results);
        setCurrentStep('result');
        addBotMessage("Thank you for talking with me today. I've put together a summary of our conversation and some suggestions that might help you find more balance.");

        if (user.user_id && token) {
            try {
                // scores are roughly mapped to categories in finalAnswers as per lib logic
                // anxiety: answers[0]+[1], depression: [2]+[3], stress: [4]
                const anxiety = finalAnswers[0] + finalAnswers[1];
                const depression = finalAnswers[2] + finalAnswers[3];
                const stress = finalAnswers[4];

                await apiFetch("/api/assessments", {
                    method: 'POST',
                    body: JSON.stringify({
                        user_id: user.user_id,
                        stress_score: stress,
                        depression_score: depression,
                        anxiety_score: anxiety,
                        notes: results.interpretation
                    })
                });
            } catch (err) {
                console.error("Failed to save assessment results", err);
            }
        }
    };

    const handleCrisis = () => {
        setCurrentStep('crisis');
        addBotMessage("I'm hearing how much pain you're in right now, and I want you to know that you're not alone. Please reach out to someone who can help immediately.", true);
    };

    const handleDownloadPDF = () => {
        if (result) generatePDF(result, user.name || 'Friend');
    };

    const handleDownloadDOC = () => {
        if (result) generateDOC(result, user.name || 'Friend');
    };

    return (
        <div className="min-h-screen bg-[#0B1437] text-white selection:bg-[#0075FF] overflow-x-hidden font-sans relative">
            {/* Dark Background Gradients - Consistent with Welcome Page */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0075FF]/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00E0FF]/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 flex flex-col min-h-screen">
                <Header />

                <main className="flex-1 pt-20 pb-4 flex flex-col">
                    <div className="container mx-auto px-4 max-w-3xl flex-1 flex flex-col">
                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="py-4 border-b border-white/10 mb-4 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-[#0075FF]/20 flex items-center justify-center shadow-soft">
                                    <Sparkles className="w-6 h-6 text-[#00E0FF]" />
                                </div>
                                <div>
                                    <h1 className="font-bold text-white">Guided Wellness Check</h1>
                                    <p className="text-xs text-slate-400 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-[#00E0FF] animate-pulse" />
                                        Conversational Assessment
                                    </p>
                                </div>
                            </div>
                            {currentStep === 'result' && (
                                <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="gap-2 rounded-xl border-white/10 hover:bg-white/5">
                                    <RefreshCw className="w-4 h-4" /> RESET
                                </Button>
                            )}
                        </motion.div>

                        {/* Progress Bar */}
                        {currentStep === 'assessment' && (
                            <div className="mb-6 px-1">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Progress</span>
                                    <span className="text-[10px] font-bold text-[#00E0FF]">{Math.round((currentQuestionIdx / assessmentQuestions.length) * 100)}%</span>
                                </div>
                                <Progress
                                    value={(currentQuestionIdx / assessmentQuestions.length) * 100}
                                    className="h-1 bg-white/5"
                                    indicatorClassName="bg-gradient-to-r from-[#0075FF] to-[#00E0FF]"
                                />
                            </div>
                        )}

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                            <AnimatePresence initial={false}>
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                                    >
                                        <div
                                            className={`max-w-[85%] p-4 rounded-3xl shadow-sm ${message.role === "user"
                                                ? "bg-primary text-primary-foreground rounded-br-none"
                                                : message.isCrisis
                                                    ? "bg-red-50 border-2 border-red-200 text-red-900 rounded-bl-none"
                                                    : "bg-card border border-border/50 text-foreground rounded-bl-none"
                                                }`}
                                        >
                                            <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                                                {message.content}
                                            </p>
                                            <p className={`text-[10px] mt-2 opacity-50 ${message.role === "user" ? "text-right" : "text-left"}`}>
                                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="bg-card border border-border/50 p-4 rounded-3xl rounded-bl-none shadow-sm flex items-center gap-2">
                                        <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                        <span className="text-xs text-muted-foreground">Thinking...</span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Crisis UI */}
                            {currentStep === 'crisis' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mt-4"
                                >
                                    <Alert variant="destructive" className="border-2 border-red-500 bg-red-50 dark:bg-red-950/20 rounded-2xl">
                                        <AlertTriangle className="h-5 w-5" />
                                        <AlertDescription className="text-red-900 dark:text-red-100 font-medium">
                                            <p className="mb-2"><strong>Please reach out for help:</strong></p>
                                            <ul className="list-disc list-inside space-y-1 text-sm">
                                                <li><strong>988 Suicide & Crisis Lifeline:</strong> Call or text 988</li>
                                                <li><strong>Crisis Text Line:</strong> Text HOME to 741741</li>
                                                <li><strong>Local Emergency Services:</strong> Call 911 (or your local equivalent)</li>
                                            </ul>
                                        </AlertDescription>
                                    </Alert>
                                </motion.div>
                            )}

                            {/* Result UI */}
                            {currentStep === 'result' && result && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6"
                                >
                                    <Card className="p-6 rounded-3xl border-2 border-primary/20 shadow-elevated overflow-hidden bg-card/50 backdrop-blur-sm">
                                        <div className="flex items-center justify-between mb-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                    <CheckCircle2 className="w-6 h-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-foreground">Your Wellness Summary</h2>
                                                    <p className="text-sm text-muted-foreground">Private and secure observation</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            {/* Insights Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                {[
                                                    { label: 'Anxiety', level: result.anxietyLevel },
                                                    { label: 'Depression', level: result.depressionLevel },
                                                    { label: 'Stress', level: result.stressLevel }
                                                ].map((item) => (
                                                    <div key={item.label} className="p-4 rounded-2xl bg-muted/30 border border-border/50">
                                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">{item.label}</span>
                                                        <span className={`text-lg font-bold ${item.level === 'High' ? 'text-red-500' :
                                                            item.level === 'Moderate' ? 'text-orange-500' :
                                                                'text-emerald-500'
                                                            }`}>
                                                            {item.level}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                                                    <Heart className="w-4 h-4 text-primary" />
                                                    A Gentle Reflection
                                                </h3>
                                                <p className="text-muted-foreground text-sm leading-relaxed italic border-l-4 border-primary/20 pl-4 py-1">
                                                    "{result.interpretation}"
                                                </p>
                                            </div>

                                            <div>
                                                <h3 className="text-sm font-bold text-foreground mb-4">Practical Steps Forward</h3>
                                                <div className="space-y-3">
                                                    {result.tips.map((tip, i) => (
                                                        <div key={i} className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors border border-primary/10">
                                                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                                                                <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                                                            </div>
                                                            <span className="text-sm text-foreground/80 leading-relaxed">{tip}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Report Download Buttons */}
                                            <div className="pt-8 border-t border-border flex flex-col sm:flex-row gap-3">
                                                <Button onClick={handleDownloadPDF} className="flex-1 rounded-2xl py-6 gap-2 gradient-calm text-primary-foreground shadow-soft">
                                                    <FileText className="w-4 h-4" /> Download Report (PDF)
                                                </Button>
                                                <Button onClick={handleDownloadDOC} variant="outline" className="flex-1 rounded-2xl py-6 gap-2 border-primary/20 hover:bg-primary/5">
                                                    <Download className="w-4 h-4" /> Download Report (DOC)
                                                </Button>
                                            </div>

                                            <div className="text-center">
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">
                                                    This is not a medical diagnosis. If you're feeling overwhelmed or unsafe, please seek professional support.
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        {currentStep === 'assessment' && (
                            <Card className="p-3 shadow-elevated border-border/50 rounded-[2rem] bg-background/50 backdrop-blur-md">
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 relative">
                                        <Input
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                            placeholder="Type your thoughts here..."
                                            className="w-full border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-4 text-base h-12"
                                        />
                                    </div>
                                    <Button
                                        onClick={handleSend}
                                        disabled={!input.trim() || isTyping}
                                        className="rounded-2xl w-12 h-12 p-0 gradient-calm text-primary-foreground shadow-soft shrink-0"
                                    >
                                        <Send className="w-5 h-5" />
                                    </Button>
                                </div>
                            </Card>
                        )}

                        {currentStep === 'crisis' && (
                            <div className="mt-4 flex justify-center">
                                <Button onClick={() => window.location.reload()} variant="outline" className="rounded-full px-8 py-6">
                                    Return to Safety
                                </Button>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
