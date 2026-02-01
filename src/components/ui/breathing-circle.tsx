import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface BreathingCircleProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { outer: 160, inner: 100 },
  md: { outer: 260, inner: 180 },
  lg: { outer: 380, inner: 280 },
};

export function BreathingCircle({ size = "md", className = "" }: BreathingCircleProps) {
  const { outer, inner } = sizes[size];
  const [breathText, setBreathText] = useState("In");

  useEffect(() => {
    // 6 second total cycle (3s expanding/In, 3s contracting/Out)
    const interval = setInterval(() => {
      setBreathText(prev => prev === "In" ? "Out" : "In");
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* 1. Large Outer Glow - Soft & Atmospheric */}
      <motion.div
        className="absolute rounded-full bg-[#0075FF]/20 blur-[100px]"
        style={{ width: outer * 2, height: outer * 2 }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 2. Rotating Sacred Geometry Rings */}
      {[1.6, 1.4, 1.2].map((scale, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-[#0075FF]/30 backdrop-blur-[1px]"
          style={{ width: outer * scale, height: outer * scale }}
          animate={{
            rotate: i % 2 === 0 ? 360 : -360,
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            rotate: { duration: 20 + i * 5, repeat: Infinity, ease: "linear" },
            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          }}
        />
      ))}

      {/* 3. Pulsing Energy Waves */}
      <motion.div
        className="absolute rounded-full border-2 border-[#00E0FF]/50"
        style={{ width: outer, height: outer }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.8, 0, 0.8],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 4. Main Glass Circle */}
      <motion.div
        className="absolute rounded-full bg-[#111C44]/30 backdrop-blur-md border border-white/20 shadow-[0_0_50px_rgba(0,117,255,0.3)]"
        style={{ width: outer, height: outer }}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* 5. Inner Vibrant Interactive Core */}
      <motion.div
        className="relative rounded-full bg-gradient-to-br from-[#0075FF] via-[#0075FF] to-[#00E0FF] flex items-center justify-center shadow-[0_0_80px_rgba(0,117,255,0.8)]"
        style={{ width: inner, height: inner }}
        animate={{
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        {/* Dynamic Light Reflection */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/40 to-transparent blur-sm"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        {/* The Breathe Text */}
        <div className="relative flex flex-col items-center z-10">
          <motion.span
            className="text-white font-black text-2xl lg:text-3xl tracking-[0.2em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
            animate={{
              opacity: [0.8, 1, 0.8],
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            Breathe
          </motion.span>

          <motion.span
            key={breathText}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-white/90 font-bold text-xl lg:text-2xl mt-1 tracking-widest uppercase drop-shadow-lg"
          >
            {breathText}
          </motion.span>

          <motion.div
            className="w-12 h-1 bg-white/60 mt-3 rounded-full shadow-[0_0_10px_white]"
            animate={{ width: [20, 60, 20], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
}
