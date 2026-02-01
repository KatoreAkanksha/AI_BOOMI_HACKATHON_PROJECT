import { motion } from "framer-motion";
import { ClipboardCheck, MessageSquare, TrendingUp, Smile } from "lucide-react";
import { useTranslation } from "react-i18next";

export function HowItWorks() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: ClipboardCheck,
      step: "01",
      title: t('step1Title'),
      description: t('step1Desc'),
    },
    {
      icon: MessageSquare,
      step: "02",
      title: t('step2Title'),
      description: t('step2Desc'),
    },
    {
      icon: TrendingUp,
      step: "03",
      title: t('step3Title'),
      description: t('step3Desc'),
    },
    {
      icon: Smile,
      step: "04",
      title: t('step4Title'),
      description: t('step4Desc'),
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-transparent">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {t('howItWorksTitle')}
          </h2>
          <p className="text-lg text-[#A0AEC0] max-w-2xl mx-auto">
            {t('howItWorksSubtitle')}
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#0075FF]/30 to-transparent" />
              )}

              <div className="relative bg-[#111C44] rounded-2xl p-6 shadow-lg border border-white/5 h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-[#0075FF]/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,117,255,0.3)]">
                    <step.icon className="w-7 h-7 text-[#0075FF]" />
                  </div>
                  <span className="text-4xl font-bold text-white/10">{step.step}</span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-[#A0AEC0] text-sm">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
