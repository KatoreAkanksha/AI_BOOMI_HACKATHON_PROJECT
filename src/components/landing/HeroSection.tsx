import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Brain, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BreathingCircle } from "@/components/ui/breathing-circle";

import { useTranslation } from "react-i18next";

export function HeroSection() {
  const { t } = useTranslation();

  return (
    <section id="welcome" className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-transparent">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 rounded-full bg-[#0075FF]/20 blur-[100px]"
          animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-[#00E0FF]/10 blur-[100px]"
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111C44] border border-[#0075FF]/30 text-[#00E0FF] text-sm font-medium mb-6 shadow-[0_0_20px_rgba(0,117,255,0.2)]"
            >
              <Heart className="w-4 h-4" />
              {t('tagline')}
            </motion.div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 text-balance">
              {t('welcomePart1')}{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0075FF] to-[#00E0FF]">{t('welcomePart2')}</span>
            </h1>

            <p className="text-lg md:text-xl text-[#A0AEC0] mb-8 max-w-xl mx-auto lg:mx-0 text-balance">
              {t('heroDesc')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Button size="lg" className="bg-[#0075FF] hover:bg-[#0061D5] text-white rounded-xl shadow-[0_0_20px_rgba(0,117,255,0.4)] text-base px-8 border-0" asChild>
                <Link to="/onboarding">
                  {t('getStarted')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base px-8 border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl" asChild>
                <Link to="/about">{t('about')}</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span>Privacy-First</span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <span>AI-Assisted</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-primary" />
                <span>Human-Centered</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right - Breathing Circle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="flex justify-center items-center"
          >
            <BreathingCircle size="lg" />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-primary/30 flex items-start justify-center p-2">
          <motion.div
            className="w-1.5 h-1.5 rounded-full bg-primary"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
}
