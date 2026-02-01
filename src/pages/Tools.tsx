
import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { useUser } from "@/contexts/UserContext";
import { getAgeTheme } from "@/lib/ageThemes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BreathingCircle } from "@/components/ui/breathing-circle";
import { Wind, Music, BookOpen, Sparkles, Heart, Play, Pause, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

export default function Tools() {
  const { user } = useUser();
  const theme = getAgeTheme(user.ageGroup);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState(0);

  const tools = [
    {
      id: "breathing",
      icon: Wind,
      title: t('guidedBreathing'),
      description: t('guidedBreathingDesc'),
      color: "bg-primary/10 text-primary",
    },
    {
      id: "music",
      icon: Music,
      title: t('calmingSounds'),
      description: t('calmingSoundsDesc'),
      color: "bg-accent/20 text-accent-foreground",
    },
    {
      id: "journal",
      icon: BookOpen,
      title: t('mindfulJournal'),
      description: t('mindfulJournalDesc'),
      color: "bg-highlight text-highlight-foreground",
    },
    {
      id: "affirmations",
      icon: Heart,
      title: t('affirmations'),
      description: t('affirmationsDesc'),
      color: "bg-warm/20 text-warm-foreground",
    },
  ];

  const affirmations = [
    "I am capable of handling whatever comes my way.",
    "I choose peace over worry.",
    "My feelings are valid, and I give myself permission to feel them.",
    "I am worthy of love and kindness.",
    "Every breath I take fills me with calm.",
    "I trust in my ability to navigate challenges.",
    "I am stronger than my anxiety.",
    "Today, I choose to focus on what I can control.",
  ];

  const sounds = [
    { name: "Rain", emoji: "🌧️" },
    { name: "Ocean Waves", emoji: "🌊" },
    { name: "Forest", emoji: "🌲" },
    { name: "Fireplace", emoji: "🔥" },
  ];

  const nextAffirmation = () => {
    setCurrentAffirmation((prev) => (prev + 1) % affirmations.length);
  };

  const handleToolClick = (toolId: string) => {
    if (toolId === 'music') {
      navigate('/tools/serene-room');
    } else {
      setActiveTool(activeTool === toolId ? null : toolId);
    }
  };

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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {t('toolsIntroTitle')}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('toolsIntroDesc')}
              </p>
            </motion.div>

            {/* Tool Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {tools.map((tool, index) => (
                <motion.div
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={`p-6 cursor-pointer transition-all border-2 ${activeTool === tool.id
                      ? "border-primary shadow-elevated"
                      : "border-transparent shadow-card hover:shadow-elevated"
                      }`}
                    onClick={() => handleToolClick(tool.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl ${tool.color} flex items-center justify-center`}>
                        <tool.icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground mb-1">{tool.title}</h3>
                        <p className="text-sm text-muted-foreground">{tool.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Active Tool Content */}
            {activeTool && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="p-8 shadow-elevated border-border/50">
                  {activeTool === "breathing" && (
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-foreground mb-6">
                        {t('breathingRitual')}
                      </h3>
                      <div className="flex justify-center py-8">
                        <BreathingCircle size="lg" />
                      </div>
                      <p className="text-muted-foreground">
                        {t('breathingDuration')}
                      </p>
                    </div>
                  )}

                  {activeTool === "music" && (
                    // Placeholder - should trigger nav before getting here usually, 
                    // but if logic changes, we keep this as fallback or remove.
                    // Since we handle nav in click, this might not be reached for music.
                    // Leaving it for safety or future use.
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
                        {t('chooseSound')}
                      </h3>
                      <p>Redirecting to Serene Room...</p>
                    </div>
                  )}

                  {activeTool === "journal" && (
                    <div>
                      <h3 className="text-xl font-semibold text-foreground mb-2 text-center">
                        {t('whatsOnMind')}
                      </h3>
                      <p className="text-muted-foreground text-center mb-6">
                        {t('journalDesc')}
                      </p>
                      <textarea
                        className="w-full h-48 p-4 rounded-xl bg-muted border-0 focus:ring-2 focus:ring-primary resize-none text-foreground placeholder:text-muted-foreground"
                        placeholder={t('startWriting')}
                      />
                      <div className="flex justify-end mt-4">
                        <Button className="gradient-calm text-primary-foreground">
                          <Sparkles className="w-4 h-4 mr-2" />
                          {t('saveEntry')}
                        </Button>
                      </div>
                    </div>
                  )}

                  {activeTool === "affirmations" && (
                    <div className="text-center">
                      <Sun className="w-12 h-12 mx-auto text-warm mb-6" />
                      <motion.p
                        key={currentAffirmation}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-2xl md:text-3xl font-medium text-foreground mb-8 leading-relaxed"
                      >
                        "{affirmations[currentAffirmation]}"
                      </motion.p>
                      <Button
                        size="lg"
                        className="gradient-warm text-warm-foreground"
                        onClick={nextAffirmation}
                      >
                        <Heart className="w-5 h-5 mr-2" />
                        {t('nextAffirmation')}
                      </Button>
                    </div>
                  )}
                </Card>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
