
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function CTASection() {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-transparent border-t border-white/5">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl bg-[#111C44] border border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)] p-8 md:p-16"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[#0075FF]/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#00E0FF]/10 blur-3xl" />
          </div>

          <div className="relative z-10 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#0075FF]/20 text-[#00E0FF] mb-6 shadow-lg"
            >
              <Heart className="w-8 h-8" />
            </motion.div>

            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t('ctaTitle')}
            </h2>
            <p className="text-lg text-[#A0AEC0] max-w-2xl mx-auto mb-8">
              {t('ctaDesc')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-[#0075FF] hover:bg-[#0061D5] text-white shadow-lg text-base px-8 border-0"
                asChild
              >
                <Link to="/stress-test">
                  {t('takeAssessment')}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-base px-8"
                asChild
              >
                <Link to="/about">{t('about')}</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
