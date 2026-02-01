
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Play, Pause, CloudRain, Waves, Trees, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Sound Assets (Mix of Google Sounds & Pixabay for reliability)
const SOUNDS = [
    {
        id: "rain",
        label: "Rain",
        icon: CloudRain,
        color: "from-blue-400 to-indigo-500",
        glow: "shadow-blue-500/50",
        src: "/sounds/rain.mp3"
    },
    {
        id: "ocean",
        label: "Ocean Waves",
        icon: Waves,
        color: "from-cyan-400 to-blue-500",
        glow: "shadow-cyan-500/50",
        src: "/sounds/oceanwaves.mp3"
    },
    {
        id: "forest",
        label: "Forest",
        icon: Trees,
        color: "from-emerald-400 to-green-600",
        glow: "shadow-emerald-500/50",
        // Switched to a standard MP3 with birds for maximum compatibility
        src: "/sounds/forest.mp3"
    },

    {
        id: "fireplace",
        label: "Fireplace",
        icon: Flame,
        color: "from-orange-400 to-red-600",
        glow: "shadow-orange-500/50",
        src: "/sounds/fireplace.mp3"
    }
];

const ParticleBackground = () => {
    const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number }[]>([]);

    useEffect(() => {
        // Generate particles only on client to avoid hydration mismatch
        const p = Array.from({ length: 25 }).map((_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 20 + 10
        }));
        setParticles(p);
    }, []);

    return (
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute bg-white/10 rounded-full blur-[1px]"
                    style={{
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size
                    }}
                    animate={{
                        y: [0, -100, 0],
                        opacity: [0, 0.4, 0]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />
            ))}
        </div>
    );
};

export default function SereneRoom() {
    const navigate = useNavigate();
    const [activeSound, setActiveSound] = useState(SOUNDS[0]); // Default to Rain
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Handle Audio Playback
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const playAudio = async () => {
            try {
                if (isPlaying) {
                    await audio.play();
                } else {
                    audio.pause();
                }
            } catch (err) {
                console.warn("Audio playback interrupted:", err);
            }
        };

        playAudio();
    }, [isPlaying, activeSound]);

    // When changing sound, keep playing if already playing
    const handleSoundChange = (sound: typeof SOUNDS[0]) => {
        if (activeSound.id === sound.id) return;
        setActiveSound(sound);
        // If playing, the useEffect will trigger play on the new source
    };

    return (
        <div className="min-h-screen w-full relative overflow-hidden bg-slate-900 font-sans text-white">
            {/* --- Antigravity Background --- */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0F172A] via-[#1E1B4B] to-[#312E81] z-0" />

            {/* Ambient Animated Orbs */}
            <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-indigo-500/20 rounded-full blur-[120px] z-0"
            />
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-[-10%] right-[-10%] w-[35rem] h-[35rem] bg-violet-600/20 rounded-full blur-[100px] z-0"
            />

            <ParticleBackground />

            {/* --- Audio Element --- */}
            <audio
                ref={audioRef}
                src={activeSound.src}
                loop
                onError={(e) => console.error("Audio Load Error:", e)}
                className="hidden"
            />

            {/* --- Content --- */}
            <div className="relative z-10 container mx-auto px-4 h-full min-h-screen flex flex-col items-center justify-center py-12">

                {/* Navigation */}
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigate('/tools')}
                    className="absolute top-6 left-6 md:top-10 md:left-10 p-3 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md transition-colors border border-white/5 text-slate-300 group"
                >
                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                </motion.button>

                {/* Title Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-extralight mb-4 tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-indigo-200 drop-shadow-lg">
                        Serene Space
                    </h1>
                    <p className="text-lg md:text-xl text-blue-200/60 font-light tracking-wide">
                        Close your eyes and feel the music
                    </p>
                </motion.div>


                {/* --- Floating Sound Cards --- */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 lg:flex lg:justify-center gap-6 md:gap-8 w-full max-w-5xl px-4"
                >
                    {SOUNDS.map((sound) => {
                        const isActive = activeSound.id === sound.id;
                        const Icon = sound.icon;

                        return (
                            <motion.button
                                key={sound.id}
                                onClick={() => handleSoundChange(sound)}
                                whileHover={{ y: -5, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`
                                    relative group flex flex-col items-center justify-center 
                                    w-full aspect-square md:w-40 md:h-48 lg:w-44 lg:h-52 
                                    rounded-[2.5rem] transition-all duration-500
                                    ${isActive
                                        ? 'bg-white/10 border-white/20 shadow-[0_0_40px_rgba(59,130,246,0.3)]'
                                        : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10 shadow-lg'
                                    }
                                    backdrop-blur-xl border
                                `}
                            >
                                {/* Active Glow Background */}
                                <AnimatePresence>
                                    {isActive && (
                                        <motion.div
                                            layoutId="active-glow"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className={`absolute inset-0 rounded-[2.5rem] bg-gradient-to-b ${sound.color} opacity-10`}
                                        />
                                    )}
                                </AnimatePresence>

                                <div className={`relative z-10 p-4 rounded-2xl transition-all duration-500 ${isActive ? 'bg-white/10 shadow-inner' : 'bg-transparent'}`}>
                                    <Icon
                                        size={36}
                                        strokeWidth={1.5}
                                        className={`transition-colors duration-300 ${isActive ? 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'text-slate-400 group-hover:text-blue-200'}`}
                                    />
                                </div>

                                <span className={`relative z-10 text-sm mt-4 font-medium tracking-wide transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                                    {sound.label}
                                </span>
                            </motion.button>
                        )
                    })}
                </motion.div>

                {/* --- Central Play Button --- */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-20 relative"
                >
                    {/* Pulsing Rings */}
                    {isPlaying && (
                        <>
                            <motion.div
                                animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 bg-blue-500/30 rounded-full blur-md"
                            />
                            <motion.div
                                animate={{ scale: [1, 2.5], opacity: [0.2, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                                className="absolute inset-0 bg-indigo-500/20 rounded-full blur-lg"
                            />
                        </>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsPlaying(!isPlaying)}
                        className={`
                            relative z-10 w-24 h-24 rounded-full flex items-center justify-center cursor-pointer
                            backdrop-blur-md border transition-all duration-500 shadow-2xl
                            ${isPlaying
                                ? 'bg-white/10 border-white/30 shadow-[0_0_50px_rgba(59,130,246,0.4)]'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                            }
                        `}
                    >
                        {isPlaying ? (
                            <Pause size={32} fill="currentColor" className="text-white drop-shadow-md" />
                        ) : (
                            <Play size={32} fill="currentColor" className="text-white drop-shadow-md ml-1" />
                        )}
                    </motion.button>

                    <motion.p
                        animate={{ opacity: isPlaying ? 0.5 : 0.3 }}
                        className="mt-6 text-center text-xs text-blue-200 uppercase tracking-[0.2em] font-medium"
                    >
                        {isPlaying ? 'Relaxing' : 'Begin'}
                    </motion.p>
                </motion.div>

            </div>
        </div>
    );
}
