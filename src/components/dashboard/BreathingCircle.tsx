
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const BreathingCircle: React.FC = () => {
    const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
    const [instruction, setInstruction] = useState('Breathe in...');

    useEffect(() => {
        const timer = setInterval(() => {
            setPhase((prev) => (prev === 'inhale' ? 'exhale' : 'inhale'));
        }, 4000); // 4 seconds inhale, 4 seconds exhale

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        setInstruction(phase === 'inhale' ? 'Breathe in...' : 'Breathe out...');
    }, [phase]);

    return (
        <div className="flex flex-col items-center justify-center space-y-8 py-12">
            <div className="relative flex items-center justify-center">
                {/* Outer Circle (Background Pulse) */}
                <motion.div
                    animate={{
                        scale: phase === 'inhale' ? 1.2 : 1,
                        opacity: phase === 'inhale' ? 0.2 : 0.1,
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className="absolute w-64 h-64 rounded-full bg-emerald-300"
                />

                <motion.div
                    animate={{
                        scale: phase === 'inhale' ? 1.1 : 1,
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className="absolute w-48 h-48 rounded-full bg-white/30 backdrop-blur-sm border border-white/40"
                />

                {/* Inner Circle (The Main Breathing Circle) */}
                <motion.div
                    animate={{
                        scale: phase === 'inhale' ? 1.1 : 0.9,
                    }}
                    transition={{ duration: 4, ease: "easeInOut" }}
                    className="relative w-40 h-40 rounded-full bg-gradient-to-br from-emerald-100 to-sky-100 flex items-center justify-center shadow-inner border border-white/50"
                >
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={instruction}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="text-violet-600 font-medium text-lg pointer-events-none select-none"
                        >
                            {instruction}
                        </motion.p>
                    </AnimatePresence>
                </motion.div>
            </div>

            <p className="text-emerald-900/40 text-sm font-medium tracking-wide">
                FOLLOW THE CIRCLE
            </p>
        </div>
    );
};
