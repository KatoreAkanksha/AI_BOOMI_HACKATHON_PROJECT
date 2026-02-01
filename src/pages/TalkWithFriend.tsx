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
import { Send, Mic, Video, Heart, Sparkles, AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";

interface Message {
    id: string;
    role: "user" | "bot";
    content: string;
    timestamp: Date;
    videoData?: {
        url: string;
        emotion: string;
        reason: string;
    };
    isCrisis?: boolean;
}

const VIDEO_CATALOG: Record<string, { url: string; reason: string }> = {
    anxious: {
        url: "https://www.youtube.com/embed/ZToicY62f1U", // Box Breathing
        reason: "Since you're feeling a bit anxious, I thought this box breathing exercise might help you ground yourself."
    },
    stressed: {
        url: "https://www.youtube.com/embed/5qap5aO4i9A", // Lofi Girl
        reason: "I hear that things are feeling heavy. Sometimes some calming background music can help quiet the noise."
    },
    low: {
        url: "https://www.youtube.com/embed/177n9M-qOTo", // Relaxing Piano
        reason: "I'm sorry you're having a hard time. This gentle music is here to keep you company."
    },
    happy: {
        url: "https://www.youtube.com/embed/ZbZSe6N_BXs", // Upbeat
        reason: "I love that you're feeling good! Here's something to match that positive energy."
    }
};

export default function TalkWithFriend() {
    const { t } = useTranslation();
    const { user, token, clearUser } = useUser();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [showCrisisAlert, setShowCrisisAlert] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const analyzeIntent = (text: string) => {
        const lowerText = text.toLowerCase();

        // Reset check
        if (
            lowerText.includes("start a new topic") ||
            lowerText.includes("new topic") ||
            lowerText.includes("not interested") ||
            lowerText.includes("stop that") ||
            lowerText.includes("ignore")
        ) {
            return { type: "reset" as const };
        }

        // Emotion check
        if (lowerText.includes("anxious") || lowerText.includes("panic") || lowerText.includes("anxiety") || lowerText.includes("scared")) {
            return { type: "video" as const, emotion: "anxious" };
        }
        if (lowerText.includes("stress") || lowerText.includes("overwhelmed") || lowerText.includes("frustrated") || lowerText.includes("angry")) {
            return { type: "video" as const, emotion: "stressed" };
        }
        if (lowerText.includes("sad") || lowerText.includes("lonely") || lowerText.includes("low") || lowerText.includes("depressed")) {
            return { type: "video" as const, emotion: "low" };
        }

        // Happy/Neutral: No video unless requested
        if (lowerText.includes("mood boost") || lowerText.includes("video") || lowerText.includes("music") || lowerText.includes("song")) {
            if (lowerText.includes("happy") || lowerText.includes("good") || lowerText.includes("great") || lowerText.includes("excited")) {
                return { type: "video" as const, emotion: "happy" };
            }
            // Default boost for neutral request
            return { type: "video" as const, emotion: "happy" };
        }

        return { type: "text" as const };
    };

    // Redirect to onboarding if not completed
    useEffect(() => {
        if (!user.user_id) {
            navigate('/');
            return;
        }
        if (!user.hasCompletedOnboarding) {
            navigate('/onboarding');
            return;
        }

        const loadHistory = async () => {
            if (!user.user_id) return;
            try {
                const historyPromise = apiFetch(`/api/chat/history/${user.user_id}`);
                const summaryPromise = apiFetch(`/api/chat/last-summary/${user.user_id}`);

                const [history, lastSummary] = await Promise.all([historyPromise, summaryPromise]);

                if (history.length > 0) {
                    setMessages(history.map((m: any) => ({
                        ...m,
                        timestamp: new Date(m.timestamp)
                    })));
                } else {
                    let greeting = `Hey ${user.name || 'friend'}! I'm so glad you're here. How are you feeling today? I'm all ears.`;

                    if (lastSummary) {
                        const trigger = lastSummary.positive_triggers[0] || "talking";
                        greeting = `Welcome back ${user.name || 'friend'}! 💙 I remember last time we talked about ${lastSummary.themes[0] || 'your feelings'} and ${trigger} really helped you. Just wanted to say I'm still here for you. ✨\n\nHow are you feeling right now?`;
                    }

                    setMessages([{
                        id: "1",
                        role: "bot",
                        content: greeting,
                        timestamp: new Date(),
                    }]);
                }
            } catch (err: any) {
                console.error("Initialization error:", err);
            }
        };
        loadHistory();

        // 🧠 Summarize on exit
        return () => {
            // Use a separate variable to capture messages state is tricky in cleanup
            // In a real app, you'd send current session messages
        };
    }, [user.hasCompletedOnboarding, navigate, user.user_id, token, user.name]);

    // 🧠 Trigger summary when messages change or component unmounts
    const lastMessages = useRef<Message[]>([]);
    useEffect(() => {
        lastMessages.current = messages;
    }, [messages]);

    useEffect(() => {
        const summarize = async () => {
            if (lastMessages.current.length > 2) {
                try {
                    await apiFetch("/api/chat/session/summarize", {
                        method: "POST",
                        body: JSON.stringify({
                            history: lastMessages.current.map(m => ({
                                role: m.role === "bot" ? "assistant" : "user",
                                content: m.content
                            }))
                        })
                    });
                } catch (e) {
                    console.error("Summarization failed", e);
                }
            }
        };

        window.addEventListener("beforeunload", summarize);
        return () => {
            window.removeEventListener("beforeunload", summarize);
            summarize(); // Also summarize on component unmount
        };
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const isCrisis = detectCrisisKeywords(input);
        if (isCrisis) setShowCrisisAlert(true);

        const intent = analyzeIntent(input);

        // Handle Reset Intent: Clear ALL video suggestions from view
        if (intent.type === "reset") {
            setMessages(prev => prev.map(m => ({ ...m, videoData: undefined })));
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
            isCrisis,
        };

        setMessages(prev => [...prev, userMessage]);

        const currentInput = input;
        setInput("");
        setIsTyping(true);

        try {
            const history = [...messages, userMessage];
            const data = await apiFetch("/api/chat/friend", {
                method: "POST",
                body: JSON.stringify({
                    message: currentInput,
                    emotion: intent.type === "video" ? intent.emotion : "neutral",
                    history: history.map(m => ({
                        role: m.role === "bot" ? "assistant" : "user",
                        content: m.content,
                    })),
                }),
            });

            // Determine if we should attach a video based on the intent detected in USER message
            const videoData = (intent.type === "video" && intent.emotion && VIDEO_CATALOG[intent.emotion])
                ? { ...VIDEO_CATALOG[intent.emotion], emotion: intent.emotion }
                : undefined;

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "bot",
                content: data.reply,
                timestamp: new Date(),
                videoData
            };

            setMessages(prev => [...prev, botMessage]);

        } catch (err: any) {
            console.error("Chat error:", err);

            setMessages(prev => [
                ...prev,
                {
                    id: Date.now().toString(),
                    role: "bot",
                    content: "I’m still here with you. Let’s keep going.",
                    timestamp: new Date(),
                },
            ]);

            // 🔴 SHOW ACTUAL BACKEND ERROR
            toast.error(err.message || "Connection issue. Your session is still active.");
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="min-h-screen bg-[#0B1437] text-white selection:bg-[#0075FF] overflow-x-hidden font-sans flex flex-col relative">
            <Header />
            <main className="flex-1 pt-24 pb-4 flex flex-col">
                <div className="container mx-auto px-4 max-w-2xl flex-1 flex flex-col relative">
                    <div className="py-4 border-b border-white/10 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0075FF]/20 flex items-center justify-center border border-[#0075FF]/30">
                                <Heart className="w-5 h-5 text-[#00E0FF] fill-[#00E0FF]" />
                            </div>
                            <h1 className="font-bold text-lg text-white">Your Supportive Friend</h1>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                        <AnimatePresence initial={false}>
                            {messages.map((message) => (
                                <motion.div key={message.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                    <div className="max-w-[90%] w-full flex flex-col gap-2">
                                        <div className={`p-4 rounded-3xl ${message.role === "user" ? "bg-[#0075FF] text-white rounded-br-none ml-auto max-w-[90%]" : "bg-[#111C44]/80 border border-white/10 text-white rounded-bl-none backdrop-blur-md mr-auto max-w-[90%]"}`}>
                                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {message.content.split('\n').map((line, i) => {
                                                    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                                                        return (
                                                            <div key={i} className="flex gap-2 ml-1 mt-1">
                                                                <span className="text-[#00E0FF]">•</span>
                                                                <span>{line.trim().substring(1).trim()}</span>
                                                            </div>
                                                        );
                                                    }
                                                    return <p key={i}>{line}</p>;
                                                })}
                                            </div>
                                        </div>

                                        {message.videoData && (
                                            <div className="max-w-[90%] w-full mt-1">
                                                <div className="bg-[#111C44]/80 border border-white/10 p-4 rounded-3xl rounded-bl-none backdrop-blur-md">
                                                    <p className="text-sm font-medium text-[#00E0FF] mb-2 flex items-center gap-2">
                                                        <Video className="w-4 h-4" />
                                                        Supportive Suggestion
                                                    </p>
                                                    <p className="text-xs text-slate-300 mb-3">{message.videoData.reason}</p>
                                                    <div className="aspect-video rounded-2xl overflow-hidden border border-white/5 shadow-xl">
                                                        <iframe
                                                            width="100%"
                                                            height="100%"
                                                            src={`${message.videoData.url}?autoplay=0`}
                                                            title="Support Video"
                                                            frameBorder="0"
                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                            allowFullScreen
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-[#111C44]/80 border border-white/10 p-3 rounded-3xl flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-[#00E0FF] animate-pulse" />
                                    <span className="text-xs text-slate-400">Listening...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <Card className="p-2 bg-[#111C44]/60 border-white/10 rounded-[2rem] shadow-2xl backdrop-blur-xl mb-2">
                        <div className="flex items-center gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Talk to me..."
                                className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-white h-10 px-4"
                            />
                            <Button onClick={handleSend} disabled={!input.trim() || isTyping} className="bg-[#0075FF] hover:bg-[#0061D5] rounded-2xl w-10 h-10 p-0 shadow-lg shadow-[#0075FF]/30 border-0">
                                <Send className="w-5 h-5 text-white" />
                            </Button>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
