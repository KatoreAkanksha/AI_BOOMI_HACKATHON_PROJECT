import { motion } from "framer-motion";
import { Brain, MessageCircle, Activity, Headphones, Shield, Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";

export function FeaturesSection() {
  const { t } = useTranslation();

  const features = [
    {
      icon: Activity,
      title: t('assessmentTitle'),
      description: t('assessmentDesc'),
      color: "bg-primary/10 text-primary",
    },
    {
      icon: MessageCircle,
      title: t('aiCompanionTitle'),
      description: t('aiCompanionDesc'),
      color: "bg-accent/20 text-accent-foreground",
    },
    {
      icon: Headphones,
      title: t('reliefToolsTitle'),
      description: t('reliefToolsDesc'),
      color: "bg-highlight text-highlight-foreground",
    },
    {
      icon: Brain,
      title: "Personalized Dashboard",
      description: "Track your progress, view mood history, and get tailored recommendations.",
      color: "bg-warm/20 text-warm-foreground",
    },
    {
      icon: Shield,
      title: "Privacy Protected",
      description: "Your data stays yours. We prioritize security and ethical AI practices.",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: Sparkles,
      title: "Daily Check-ins",
      description: "Simple mood tracking that helps you build awareness of your emotional patterns.",
      color: "bg-accent/20 text-accent-foreground",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-24 bg-transparent border-t border-white/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('featuresTitle')}
          </h2>
          <p className="text-lg text-[#A0AEC0] max-w-2xl mx-auto">
            {t('featuresSubtitle')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="group p-6 rounded-2xl bg-[#111C44] border border-white/5 shadow-lg hover:shadow-[0_4px_20px_0px_rgba(0,0,0,0.5)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl transition-transform group-hover:scale-110 flex items-center justify-center mb-4 bg-[#0075FF]/10 text-[#0075FF]`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-[#A0AEC0] text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
