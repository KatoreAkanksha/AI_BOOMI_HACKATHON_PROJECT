
import { motion } from "framer-motion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { useUser } from "@/contexts/UserContext";
import { getAgeTheme } from "@/lib/ageThemes";
import { Card } from "@/components/ui/card";
import { Heart, Shield, Brain, Users, Sparkles, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function About() {
  const { user } = useUser();
  const theme = getAgeTheme(user.ageGroup);
  const { t } = useTranslation();

  const values = [
    {
      icon: Heart,
      title: "Empathy First",
      description: "Every interaction is designed with compassion and understanding at its core.",
    },
    {
      icon: Shield,
      title: "Privacy Protected",
      description: "Your data is encrypted and never shared. Your mental health journey stays private.",
    },
    {
      icon: Brain,
      title: "Science-Backed",
      description: "Our assessments and tools are inspired by established psychological research.",
    },
    {
      icon: Users,
      title: "Human-Centered",
      description: "AI assists, but the focus is always on your unique human experience.",
    },
  ];

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
          {/* Hero Section */}
          <section className="py-16 gradient-hero">
            <div className="container mx-auto px-4 max-w-4xl text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-calm mb-6">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                  {t('aboutTitle')}
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                  {t('aboutTagline')}
                </p>
              </motion.div>
            </div>
          </section>

          {/* Mission Section */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-4xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid md:grid-cols-2 gap-12 items-center"
              >
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-4">
                    {t('missionTitle')}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {t('missionDesc1')}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('missionDesc2')}
                  </p>
                </div>
                <Card className="p-8 shadow-elevated bg-white/10 backdrop-blur-md border-white/20">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Lock className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground">100% Private</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-accent" />
                      <span className="font-medium text-foreground">Non-judgmental Support</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Brain className="w-5 h-5 text-warm" />
                      <span className="font-medium text-foreground">Research-Inspired</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-highlight-foreground" />
                      <span className="font-medium text-foreground">Available 24/7</span>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </section>

          {/* Values Section */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-5xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <h2 className="text-3xl font-bold text-foreground mb-4">{t('valuesTitle')}</h2>
                <p className="text-muted-foreground">
                  {t('valuesSubtitle')}
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {values.map((value, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={`p-6 shadow-card border-border/50 h-full ${theme.cardStyle}`}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <value.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground mb-2">
                            {value.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {value.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Disclaimer */}
          <section className="py-16">
            <div className="container mx-auto px-4 max-w-3xl">
              <Card className="p-8 border-warm/30 bg-warm/5">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-warm" />
                  {t('disclaimerTitle')}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('disclaimerDesc')}
                </p>
              </Card>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
