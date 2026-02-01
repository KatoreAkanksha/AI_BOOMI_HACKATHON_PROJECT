import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { useUser } from "@/contexts/UserContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Mic,
    Square,
    RefreshCcw,
    CheckCircle,
    ArrowLeft,
    Download,
    Loader2,
    Play,
    Pause
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import jsPDF from "jspdf";

export default function AudioAssessment() {
    const { user, token, clearUser } = useUser();
    const navigate = useNavigate();

    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [results, setResults] = useState<any>(null);
    const [volume, setVolume] = useState(0);

    // Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Clean up
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, []);

    const startRecording = async () => {
        // Microphone API availability check
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            toast.error("Microphone API is not available. Note: Most browsers require 'localhost' or 'HTTPS' to access the microphone.");
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Audio Visualization Setup
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);
            analyserRef.current.fftSize = 256;

            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateVolume = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                setVolume(average / 128); // Normalize to 0-1 range
                animationFrameRef.current = requestAnimationFrame(updateVolume);
            };
            updateVolume();

            // Media Recorder Setup
            const recorder = new MediaRecorder(stream);
            const chunks: BlobPart[] = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setAudioBlob(blob);
                setAudioUrl(URL.createObjectURL(blob));
                stopVisualization();
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start();
            mediaRecorderRef.current = recorder;
            setIsRecording(true);
            setRecordingDuration(0);

            timerRef.current = setInterval(() => {
                setRecordingDuration(prev => {
                    if (prev >= 60) {
                        stopRecording();
                        return 60;
                    }
                    return prev + 1;
                });
            }, 1000);

            toast.info("Recording started. Please speak naturally.");
        } catch (err) {
            console.error("Mic Error:", err);
            toast.error("Could not access microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const stopVisualization = () => {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        setVolume(0);
    };

    const handleReset = () => {
        setAudioBlob(null);
        setAudioUrl(null);
        setResults(null);
        setRecordingDuration(0);
    };

    const processAudio = async () => {
        if (!audioBlob) {
            toast.error("No audio recorded yet.");
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Validation & Conversion (16kHz Mono WAV)
            const audioData = await audioBlob.arrayBuffer();
            if (audioData.byteLength < 1000) {
                throw new Error("Audio recording too short or silent.");
            }

            const audioBuffer = await audioContextRef.current!.decodeAudioData(audioData);
            const offlineCtx = new OfflineAudioContext(1, audioBuffer.duration * 16000, 16000);
            const source = offlineCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(offlineCtx.destination);
            source.start();
            const resampledBuffer = await offlineCtx.startRendering();

            const wavBlob = bufferToWav(resampledBuffer);

            const formData = new FormData();
            formData.append('audio', wavBlob, 'assessment.wav');

            // 2. Send to Python ML service with JWT
            const apiBase = window.location.hostname === 'localhost' ? 'http://localhost:8000' : `http://${window.location.hostname}:8000`;
            const res = await fetch(`${apiBase}/predict_audio`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (res.status === 401) {
                toast.error("Session expired. Please login again.");
                clearUser();
                navigate('/login');
                return;
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || "Audio analysis failed on the server.");
            }

            const data = await res.json();

            // Prediction results are now saved to DB by the backend automatically
            setResults(data);
            toast.success("Vocal analysis complete!");

            // Scroll to results
            window.scrollTo({ top: 0, behavior: 'smooth' });

        } catch (err: any) {
            console.error("Processing Error:", err);
            toast.error(err.message || "Something went wrong while processing your audio.");
        } finally {
            setIsProcessing(false);
        }
    };

    // Helper: Simple WAV Encoder
    function bufferToWav(abuffer: AudioBuffer) {
        let numOfChan = abuffer.numberOfChannels;
        let length = abuffer.length * numOfChan * 2 + 44;
        let buffer = new ArrayBuffer(length);
        let view = new DataView(buffer);
        let channels: Float32Array[] = [];
        let i: number;
        let sample: number;
        let offset = 0;
        let pos = 0;

        // write WAVE header
        setUint32(0x46464952);                         // "RIFF"
        setUint32(length - 8);                         // file length - 8
        setUint32(0x45564157);                         // "WAVE"

        setUint32(0x20746d66);                         // "fmt " chunk
        setUint32(16);                                 // length = 16
        setUint16(1);                                  // PCM (uncompressed)
        setUint16(numOfChan);
        setUint32(abuffer.sampleRate);
        setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
        setUint16(numOfChan * 2);                      // block-align
        setUint16(16);                                 // 16-bit (hardcoded)

        setUint32(0x61746164);                         // "data" - chunk
        setUint32(length - pos - 4);                   // chunk length

        // write interleaved data
        for (i = 0; i < abuffer.numberOfChannels; i++)
            channels.push(abuffer.getChannelData(i));

        while (pos < length) {
            for (i = 0; i < numOfChan; i++) {             // interleave channels
                sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
                sample = (sample < 0 ? sample * 0x8000 : sample * 0x7FFF) | 0; // scale to 16-bit signed int
                view.setInt16(pos, sample, true);          // write 16-bit sample
                pos += 2;
            }
            offset++;                                     // next source sample
        }

        return new Blob([buffer], { type: "audio/wav" });

        function setUint16(data: any) {
            view.setUint16(pos, data, true);
            pos += 2;
        }

        function setUint32(data: any) {
            view.setUint32(pos, data, true);
            pos += 4;
        }
    }

    const generatePDF = () => {
        if (!results) return;

        const doc = new jsPDF();

        // Colors from theme
        const primaryColor = [11, 20, 55]; // #0B1437
        const accentColor = [0, 117, 255]; // #0075FF

        // Header
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text("MindEase - Personalized Wellness Report", 20, 25);

        // User Info
        doc.setTextColor(50, 50, 50);
        doc.setFontSize(12);
        doc.text(`User: ${user.name || 'Valued Friend'}`, 20, 55);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 62);
        doc.text(`Assessment Type: Audio-based Emotion Prediction`, 20, 69);

        // Results Section
        doc.setFontSize(18);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text("Your Assessment Results", 20, 85);

        doc.line(20, 88, 190, 88);

        doc.setTextColor(50, 50, 50);
        doc.setFontSize(14);

        const categories = [
            { label: "Anxiety", score: results.raw_scores.anxiety, level: results.labels.anxiety },
            { label: "Depression", score: results.raw_scores.depression, level: results.labels.depression },
            { label: "Stress", score: results.raw_scores.stress, level: results.labels.stress }
        ];

        let startY = 100;
        categories.forEach(cat => {
            doc.setFont("helvetica", "bold");
            doc.text(`${cat.label}:`, 20, startY);
            doc.setFont("helvetica", "normal");
            doc.text(`${cat.level} (Score: ${cat.score}/100)`, 70, startY);
            startY += 10;
        });

        // Insights
        doc.setFontSize(16);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text("Personal Reflections", 20, 150);

        doc.setTextColor(50, 50, 50);
        doc.setFontSize(11);
        const reflection = "Based on your voice patterns, our AI detected subtle emotional cues. " +
            "It's normal to have varying emotional states throughout the week. " +
            "Take these results as a gentle nudge to prioritize your inner peace.";

        const splitText = doc.splitTextToSize(reflection, 170);
        doc.text(splitText, 20, 160);

        // Steps Forward
        doc.setFontSize(16);
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text("Recommended Steps", 20, 190);

        doc.setTextColor(50, 50, 50);
        doc.setFontSize(11);
        const steps = [
            "• Practice 5 minutes of mindful breathing today.",
            "• Reflect on one thing you are grateful for this evening.",
            "• Take a 10-minute walk in a quiet environment.",
            "• Listen to your favorite calming music session on MindEase."
        ];

        startY = 200;
        steps.forEach(step => {
            doc.text(step, 20, startY);
            startY += 8;
        });

        // Footer
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("This report is for wellness purposes and is not a clinical diagnosis.", 20, 280);

        doc.save(`MindEase_Report_${new Date().getTime()}.pdf`);
        toast.success("Report downloaded!");
    };

    return (
        <div className="min-h-screen bg-[#0B1437] text-white selection:bg-[#0075FF] overflow-x-hidden font-sans relative">
            {/* Background Gradients */}
            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0075FF]/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00E0FF]/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10">
                <Header />

                <main className="pt-24 pb-12">
                    <div className="container mx-auto px-4 max-w-4xl">
                        {!results ? (
                            <div className="text-center">
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mb-12"
                                >
                                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                                        Voice Wellness Assessment
                                    </h1>
                                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                                        Take a deep breath and share how you're feeling. Our AI analyzes your vocal patterns to help you understand your emotional state.
                                    </p>
                                </motion.div>

                                <Card className="p-12 bg-[#111C44]/60 backdrop-blur-2xl border-white/10 rounded-[3rem] shadow-2xl relative overflow-hidden">
                                    <div className="relative z-10">
                                        <div className="mb-12">
                                            <p className="text-lg text-slate-300 font-medium mb-2 uppercase tracking-[0.2em]">Current Reflection</p>
                                            <h2 className="text-2xl md:text-3xl font-bold text-white italic">
                                                “How have you been feeling emotionally over the past few days?”
                                            </h2>
                                        </div>

                                        {/* Visualization / Aura */}
                                        <div className="relative flex justify-center items-center py-20">
                                            <AnimatePresence>
                                                {isRecording && (
                                                    <motion.div
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{
                                                            scale: [1, 1.2 + volume * 0.5, 1],
                                                            opacity: [0.3, 0.6, 0.3],
                                                        }}
                                                        exit={{ scale: 0.8, opacity: 0 }}
                                                        transition={{ repeat: Infinity, duration: 2 }}
                                                        className="absolute w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"
                                                    />
                                                )}
                                            </AnimatePresence>

                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={isRecording ? stopRecording : startRecording}
                                                className={`relative z-10 w-32 h-32 rounded-full flex items-center justify-center transition-colors shadow-2xl ${isRecording
                                                    ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/40"
                                                    : "bg-[#0075FF] hover:bg-[#1185FF] shadow-[#0075FF]/40"
                                                    }`}
                                            >
                                                {isRecording ? (
                                                    <Square className="w-12 h-12 text-white fill-white" />
                                                ) : (
                                                    <Mic className="w-12 h-12 text-white" />
                                                )}
                                            </motion.button>
                                        </div>

                                        <div className="mt-8">
                                            {isRecording ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <p className="text-rose-400 font-bold animate-pulse">RECORDING</p>
                                                    <p className="text-4xl font-mono text-white">00:{recordingDuration.toString().padStart(2, '0')}</p>
                                                </div>
                                            ) : audioBlob ? (
                                                <div className="flex flex-col items-center gap-6">
                                                    <p className="text-emerald-400 font-bold">READY TO ANALYZE</p>
                                                    <div className="flex gap-4">
                                                        <Button
                                                            variant="outline"
                                                            onClick={handleReset}
                                                            className="h-14 px-8 rounded-xl border-white/10 text-white hover:bg-white/5"
                                                        >
                                                            <RefreshCcw className="mr-2 w-5 h-5" /> RETAKE
                                                        </Button>
                                                        <Button
                                                            onClick={processAudio}
                                                            disabled={isProcessing}
                                                            className="h-14 px-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/20"
                                                        >
                                                            {isProcessing ? (
                                                                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                                                            ) : (
                                                                <CheckCircle className="mr-2 w-5 h-5" />
                                                            )}
                                                            {isProcessing ? "ANALYZING..." : "START ANALYSIS"}
                                                        </Button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p className="text-slate-400">Tap to start your emotional expression</p>
                                            )}
                                        </div>
                                    </div>
                                </Card>

                                <div className="mt-12">
                                    <Button variant="ghost" asChild className="text-slate-500 hover:text-white">
                                        <Link to="/assessment/test" className="flex items-center gap-2">
                                            <ArrowLeft size={18} /> Switch to Written Test
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="max-w-2xl mx-auto"
                            >
                                <Card className="p-10 bg-[#111C44]/60 backdrop-blur-2xl border-white/10 rounded-[3rem] text-center shadow-2xl">
                                    <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                                        <CheckCircle className="w-12 h-12 text-emerald-400" />
                                    </div>

                                    <h2 className="text-3xl font-bold text-white mb-2">Assessment Results</h2>
                                    <p className="text-slate-400 mb-10">Based on your vocal pattern analysis</p>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                                        {['Anxiety', 'Depression', 'Stress'].map((type) => (
                                            <div key={type} className="p-6 rounded-2xl bg-white/5 border border-white/5">
                                                <p className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-bold">{type}</p>
                                                <p className={`text-xl font-bold ${results.labels[type.toLowerCase()] === 'Severe' ? 'text-rose-400' :
                                                    results.labels[type.toLowerCase()] === 'Moderate' ? 'text-orange-400' :
                                                        'text-emerald-400'
                                                    }`}>
                                                    {results.labels[type.toLowerCase()]}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <Button
                                            onClick={generatePDF}
                                            className="w-full h-16 rounded-2xl bg-[#0075FF] hover:bg-[#0061D5] text-white font-bold text-lg shadow-lg shadow-[#0075FF]/20"
                                        >
                                            <Download className="mr-2" /> DOWNLOAD WELLNESS REPORT
                                        </Button>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Button
                                                variant="outline"
                                                onClick={handleReset}
                                                className="h-14 rounded-2xl border-white/10 text-white hover:bg-white/5"
                                            >
                                                RE-ASSESS
                                            </Button>
                                            <Button
                                                asChild
                                                className="h-14 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10"
                                            >
                                                <Link to="/dashboard">DASHBOARD</Link>
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
