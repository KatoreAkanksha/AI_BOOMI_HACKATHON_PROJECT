import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { useUser } from "@/contexts/UserContext";
import { getAgeTheme } from "@/lib/ageThemes";
import { getPersonalizedGreeting, detectCrisisKeywords, getCrisisResponse } from "@/lib/personalization";
import { generateAgeAppropriateResponse } from "@/lib/chatResponses";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Send, Mic, Video, Heart, Sparkles, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { assessmentQuestions, analyzeAssessment, AssessmentReport } from "@/lib/assessmentFlow";

interface Message {
  id: string;
  role: "user" | "bot";
  content: string;
  timestamp: Date;
  isCrisis?: boolean;
}

export default function Chat() {
  const { t } = useTranslation();
  const { user } = useUser();
  const navigate = useNavigate();
  const theme = getAgeTheme(user.ageGroup);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCrisisAlert, setShowCrisisAlert] = useState(false);
  const location = useLocation();
  const [isAssessmentMode, setIsAssessmentMode] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1);
  const [assessmentAnswers, setAssessmentAnswers] = useState<string[]>([]);
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (!user.hasCompletedOnboarding) {
      navigate('/onboarding');
    } else {
      // Set personalized initial message
      const startAssessment = location.state?.startAssessment;

      if (startAssessment) {
        setIsAssessmentMode(true);
        const initialMessage: Message = {
          id: "1",
          role: "bot",
          content: `Hi ${user.name || 'friend'}! I'm your calm wellness assistant. I'd love to help you understand how you're feeling today. Let's go through 10 simple questions together, one by one. Ready?`,
          timestamp: new Date(),
        };
        setMessages([initialMessage]);

        // Ask first question after a short delay
        setTimeout(() => {
          setCurrentQuestionIndex(0);
          const firstQuestion: Message = {
            id: "2",
            role: "bot",
            content: assessmentQuestions[0],
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, firstQuestion]);
        }, 1500);
      } else {
        const initialMessage: Message = {
          id: "1",
          role: "bot",
          content: getPersonalizedGreeting(user),
          timestamp: new Date(),
        };
        setMessages([initialMessage]);
      }
    }
  }, [user.hasCompletedOnboarding, navigate, location.state]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Check for crisis keywords
    const isCrisis = detectCrisisKeywords(input);
    if (isCrisis) {
      setShowCrisisAlert(true);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      isCrisis,
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      if (isAssessmentMode) {
        setIsTyping(false);
        const finalAnswers = [...assessmentAnswers, currentInput];
        const nextIndex = currentQuestionIndex + 1;

        if (nextIndex < assessmentQuestions.length) {
          setAssessmentAnswers(finalAnswers);
          setCurrentQuestionIndex(nextIndex);

          const nextQuestion: Message = {
            id: (Date.now() + 1).toString(),
            role: "bot",
            content: assessmentQuestions[nextIndex],
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, nextQuestion]);
        } else {
          // Assessment complete
          const results = analyzeAssessment(finalAnswers);
          setReport(results);
          setIsAssessmentMode(false);

          const reportMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: "bot",
            content: "Thank you for sharing with me. I've put together a small report to help you understand your feelings better today.",
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, reportMessage]);
        }
      } else {
        let botContent: string;

        if (isCrisis) {
          const crisisResponse = getCrisisResponse();
          botContent = crisisResponse.message;
        } else {
          // Use intelligent age-appropriate response generation
          botContent = generateAgeAppropriateResponse(
            currentInput,
            user.ageGroup,
            user.name || 'friend'
          );
        }

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "bot",
          content: botContent,
          timestamp: new Date(),
          isCrisis,
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsTyping(false);
      }
    }, 1000 + Math.random() * 500); // Slightly faster response for assessment
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1437] text-white selection:bg-[#0075FF] overflow-x-hidden font-sans flex flex-col relative">
      {/* Dark Background Gradients - Consistent with Welcome Page */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0075FF]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00E0FF]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <Header />

        <main className="flex-1 pt-20 pb-4 flex flex-col">
          <div className="container mx-auto px-4 max-w-3xl flex-1 flex flex-col">
            {/* Chat Header */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-4 border-b border-border mb-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full gradient-calm flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="font-semibold text-foreground">{t('chatCompanionName')}</h1>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    {t('activeListening')}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Crisis Alert */}
            {showCrisisAlert && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    <strong>Crisis Support Available</strong>
                    <br />
                    If you're in crisis, please reach out immediately:
                    <br />
                    <strong>988 Suicide & Crisis Lifeline</strong> (Call/Text 988) | <strong>Crisis Text Line</strong> (Text HOME to 741741)
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${message.role === "user"
                        ? "gradient-calm text-primary-foreground rounded-br-md"
                        : "bg-card border border-border shadow-card rounded-bl-md"
                        }`}
                    >
                      <p className={message.role === "user" ? "text-primary-foreground" : "text-foreground"}>
                        {message.content}
                      </p>
                      <p className={`text-xs mt-2 ${message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                        }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Assessment Report */}
              {report && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-start w-full"
                >
                  <Card className="max-w-[90%] p-6 rounded-2xl bg-card border-2 border-primary/20 shadow-elevated">
                    <div className="flex items-center gap-2 mb-4">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      <h2 className="font-bold text-lg text-foreground">Your Wellness Update</h2>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Overall State</p>
                        <p className="text-foreground">{report.emotionalState}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Dominant Feeling</p>
                          <p className="text-foreground capitalize">{report.dominantEmotion}</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Stress Level</p>
                          <p className="text-foreground capitalize">{report.stressLevel}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">A Message for You</p>
                        <p className="text-foreground italic">"{report.supportiveMessage}"</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Gentle Suggestions</p>
                        <ul className="list-disc list-inside text-foreground space-y-1 mt-1">
                          {report.suggestions.map((s, i) => (
                            <li key={i}>{s}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-border text-center">
                      <p className="font-medium text-primary">You’re doing your best, and that’s enough for today.</p>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="bg-card border border-border p-4 rounded-2xl rounded-bl-md shadow-card">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                      <span className="text-muted-foreground text-sm">{t('thinking')}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <Card className="p-4 shadow-card border-border/50">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                >
                  <Mic className="w-5 h-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-accent hover:bg-accent/10"
                >
                  <Video className="w-5 h-5" />
                </Button>
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t('typeMessage')}
                  className="flex-1 border-0 bg-muted focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isTyping}
                  className="gradient-calm text-primary-foreground"
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-3">
                {t('aiNotice')}
              </p>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
