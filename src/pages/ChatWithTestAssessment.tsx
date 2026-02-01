import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Heart, RefreshCw, Loader2, AlertCircle, FileDown, Download } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import AssessmentDashboard from '@/components/assessment/AssessmentDashboard';
import { useUser } from '@/contexts/UserContext';
import { apiFetch } from '@/lib/api';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';

interface Message {
    id: string;
    role: 'bot' | 'user';
    content: string;
}

interface ReportData {
    raw_scores: { anxiety: number; depression: number; stress: number };
    labels: { anxiety: string; depression: string; stress: string };
}

const ChatWithTestAssessment = () => {
    const { user, token } = useUser();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [questionIndex, setQuestionIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [scores, setScores] = useState<ReportData | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Dynamic API Base (Points to Python backend on port 8000)
    const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:8000' : `http://${window.location.hostname}:8000`;

    // 1. Initialize Session
    useEffect(() => {
        const startSession = async () => {
            if (!user.user_id) return; // Wait for user

            setIsTyping(true);
            try {
                // Secure call with JWT
                const res = await fetch(`${API_BASE}/chat/start`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token || ''}` }
                });

                if (!res.ok) throw new Error("Service unavailable");

                const data = await res.json();
                setSessionId(data.session_id);
                const botMsg: Message = {
                    id: Date.now().toString(),
                    role: 'bot',
                    content: `Welcome back, ${user.name || 'friend'} 💙. Let's check in.\n\n${data.first_question}`
                };
                setMessages([botMsg]);
            } catch (err) {
                console.error(err);
                setError("Service temporarily unavailable. Please try again later.");
            } finally {
                setIsTyping(false);
            }
        };
        startSession();
    }, [user.name, user.user_id, token]); // added dependencies

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 2. Handle Answer Submission
    const handleSend = async () => {
        if (!input.trim() || !sessionId || isTyping) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim()
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);
        setError(null);

        try {
            const res = await fetch(`${API_BASE}/chat/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token || ''}`
                },
                body: JSON.stringify({
                    session_id: sessionId,
                    question_index: questionIndex,
                    user_answer: userMsg.content
                })
            });

            if (!res.ok) throw new Error("Failed to send answer");

            const data = await res.json();

            if (data.status === 'next') {
                setQuestionIndex(prev => prev + 1);
                const botMsg: Message = {
                    id: Date.now().toString(),
                    role: 'bot',
                    content: data.next_question
                };
                setMessages(prev => [...prev, botMsg]);
            } else if (data.status === 'completed') {
                const reportRes = await fetch(`${API_BASE}/chat/report`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token || ''}`
                    },
                    body: JSON.stringify({ session_id: sessionId })
                });
                const reportData = await reportRes.json();

                if (!reportData.success) throw new Error("Report generation failed");

                // Backend saves to DB automatically now.
                setScores({
                    raw_scores: reportData.raw_scores,
                    labels: reportData.labels
                });
                toast.success("Assessment complete. Results saved! ✨");
            }
        } catch (err) {
            setError("Connection lost. Please check your internet or try again.");
        } finally {
            setIsTyping(false);
        }
    };

    const generatePDF = () => {
        if (!scores) return;
        const doc = new jsPDF();

        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text("Personalized Wellness Report", 20, 20);

        doc.setFontSize(12);
        doc.text(`User: ${user.name}`, 20, 35);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 42);

        doc.setLineWidth(0.5);
        doc.line(20, 48, 190, 48);

        doc.setFontSize(16);
        doc.text("Assessment Results", 20, 60);

        doc.setFontSize(12);
        doc.text(`- Anxiety Level: ${scores.labels.anxiety} (${scores.raw_scores.anxiety}/100)`, 25, 70);
        doc.text(`- Depression Level: ${scores.labels.depression} (${scores.raw_scores.depression}/100)`, 25, 78);
        doc.text(`- Stress Level: ${scores.labels.stress} (${scores.raw_scores.stress}/100)`, 25, 86);

        doc.setFontSize(16);
        doc.text("Gentle Reflection", 20, 105);
        doc.setFontSize(11);
        const reflection = "Based on our conversation, it's clear you've been carrying quite a bit lately. These scores are a snapshot of your current feelings and serve as a starting point for self-care. Remember to be kind to yourself—healing is not a linear journey, but you're already taking the most important steps.";
        const splitRef = doc.splitTextToSize(reflection, 160);
        doc.text(splitRef, 20, 115);

        doc.setFontSize(16);
        doc.text("Practical Steps Forward", 20, 145);
        doc.setFontSize(11);
        doc.text("1. Practice grounding techniques like 5-4-3-2-1 during high stress.", 25, 155);
        doc.text("2. Maintain a consistent sleep schedule to support emotional resilience.", 25, 163);
        doc.text("3. Dedicate 10 minutes daily to quiet reflection or mindfulness.", 25, 171);

        doc.save("MindEase_Wellness_Report.pdf");
    };

    const generateDoc = () => {
        if (!scores) return;
        const content = `
            MindEase Wellness Report
            -----------------------
            User: ${user.name}
            Date: ${new Date().toLocaleDateString()}

            Assessment Results:
            - Anxiety Level: ${scores.labels.anxiety} (${scores.raw_scores.anxiety}/100)
            - Depression Level: ${scores.labels.depression} (${scores.raw_scores.depression}/100)
            - Stress Level: ${scores.labels.stress} (${scores.raw_scores.stress}/100)

            Gentle Reflection:
            Based on our conversation, it's clear you've been carrying quite a bit lately. These scores are a snapshot of your current feelings and serve as a starting point for self-care.

            Practical Steps Forward:
            1. Practice grounding techniques like 5-4-3-2-1 during high stress.
            2. Maintain a consistent sleep schedule to support emotional resilience.
            3. Dedicate 10 minutes daily to quiet reflection or mindfulness.
        `;
        const blob = new Blob([content], { type: "application/msword" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "MindEase_Wellness_Report.doc";
        link.click();
    };

    if (scores) {
        return (
            <div className="min-h-screen bg-[#0B1437] text-white overflow-x-hidden font-sans flex flex-col pt-24 pb-12 items-center px-4">
                <Header />
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full flex flex-col items-center">
                    <AssessmentDashboard scores={{ anxiety: scores.raw_scores.anxiety, depression: scores.raw_scores.depression, stress: scores.raw_scores.stress }} />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-12 w-full max-w-3xl px-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={generatePDF}
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-[2rem] font-semibold transition-all backdrop-blur-md"
                        >
                            <FileDown className="w-5 h-5 text-[#00E0FF]" />
                            Download PDF
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={generateDoc}
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-[2rem] font-semibold transition-all backdrop-blur-md"
                        >
                            <Download className="w-5 h-5 text-purple-400" />
                            Download DOC
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => window.location.reload()}
                            className="flex items-center justify-center gap-3 px-6 py-4 bg-[#0075FF] hover:bg-[#0052cc] text-white rounded-[2rem] font-semibold shadow-lg shadow-[#0075FF]/20 transition-all"
                        >
                            <RefreshCw className="w-5 h-5" />
                            Restart
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0B1437] text-white selection:bg-[#0075FF] overflow-x-hidden font-sans flex flex-col relative">
            <Header />

            <main className="flex-1 pt-24 pb-4 flex flex-col">
                <div className="container mx-auto px-4 max-w-2xl flex-1 flex flex-col relative">

                    {/* Header Area */}
                    <div className="py-4 border-b border-white/10 mb-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#0075FF]/20 flex items-center justify-center border border-[#0075FF]/30">
                                <Heart className="w-5 h-5 text-[#00E0FF] fill-[#00E0FF]" />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg text-white leading-tight">Mental Wellness Test</h1>
                                <p className="text-xs text-slate-400">Step {questionIndex + 1} of 7</p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
                        <AnimatePresence initial={false}>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`p-4 rounded-3xl max-w-[85%] ${message.role === 'user'
                                        ? "bg-[#0075FF] text-white rounded-br-none"
                                        : "bg-[#111C44]/80 border border-white/10 text-white rounded-bl-none backdrop-blur-md"
                                        }`}>
                                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isTyping && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                <div className="bg-[#111C44]/80 border border-white/10 p-4 rounded-3xl rounded-bl-none flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-[#00E0FF]" />
                                    <span className="text-xs text-slate-400">Analyzing your response...</span>
                                </div>
                            </motion.div>
                        )}

                        {error && !isTyping && (
                            <div className="flex justify-center">
                                <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl text-red-400 text-xs flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    {error}
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="pb-6 h-36">
                        <div className="bg-[#111C44]/80 border border-white/10 p-3 rounded-[2rem] backdrop-blur-lg focus-within:ring-2 focus-within:ring-[#0075FF]/30 transition-all">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Share your thoughts here..."
                                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-slate-500 text-sm resize-none px-4 py-2 custom-scrollbar"
                                rows={2}
                            />
                            <div className="flex justify-end p-1">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSend}
                                    disabled={!input.trim() || isTyping}
                                    className="bg-[#0075FF] hover:bg-[#0052cc] p-3 rounded-2xl transition-all disabled:opacity-50 disabled:scale-100 disabled:bg-slate-700"
                                >
                                    <Send className="w-5 h-5 text-white" />
                                </motion.button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default ChatWithTestAssessment;
