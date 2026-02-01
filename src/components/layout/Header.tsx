import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useTranslation } from "react-i18next";
import { AuthModal } from "@/components/auth/AuthModal";

import { useUser } from "@/contexts/UserContext";

export function Header() {
  const { t } = useTranslation();
  const { user, clearUser } = useUser();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isSignedin = user.hasCompletedOnboarding;

  const navLinks = isSignedin
    ? [
      { href: "/dashboard", label: t('dashboard') },
      { href: "/stress-test", label: t('assessment') },
      { href: "/#how-it-works", label: t('howItWorks') },
      { href: "/talk-with-your-friend", label: "Talk with Your Friend" },
      { href: "/tools", label: t('tools') },
      { href: "/about", label: t('about') },
    ]
    : [
      { href: "/#welcome", label: t('welcome') },
      { href: "/#how-it-works", label: t('howItWorks') },
      { href: "/about", label: t('about') },
    ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B1437]/70 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-[#0075FF]/10 flex items-center justify-center border border-[#0075FF]/20 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(0,117,255,0.3)]">
              <Heart className="w-5 h-5 text-[#0075FF] fill-[#0075FF]" />
            </div>
            <span className="font-bold text-xl tracking-wide text-white group-hover:text-[#00E0FF] transition-colors">MindEase</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-all duration-300 ${location.pathname === link.href
                  ? "bg-[#0075FF] text-white shadow-lg shadow-[#0075FF]/20"
                  : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
              >
                {link.label.toUpperCase()}
              </Link>
            ))}
          </nav>

          {/* Desktop Nav Actions */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageToggle />
            <ThemeToggle />
            {!isSignedin ? (
              <>
                <AuthModal>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 font-bold tracking-wide">
                    {t('signIn').toUpperCase()}
                  </Button>
                </AuthModal>
                <AuthModal>
                  <Button size="sm" className="bg-[#0075FF] hover:bg-[#0061D5] text-white font-bold tracking-wide shadow-lg shadow-[#0075FF]/30 border-0 rounded-lg h-9 px-6">
                    {t('getStarted').toUpperCase()}
                  </Button>
                </AuthModal>
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 font-bold" onClick={() => {
                  clearUser();
                  navigate("/");
                }}>
                  LOG OUT
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-white hover:bg-white/10"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0B1437] border-b border-white/10"
          >
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-colors ${location.pathname === link.href
                    ? "bg-[#0075FF] text-white"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {link.label.toUpperCase()}
                </Link>
              ))}
              <div className="flex gap-4 mt-4 pt-4 border-t border-white/10">
                <div className="flex gap-2">
                  <LanguageToggle />
                  <ThemeToggle />
                </div>
                {!isSignedin ? (
                  <AuthModal>
                    <Button size="sm" className="flex-1 bg-[#0075FF] text-white font-bold" onClick={() => setIsOpen(false)}>
                      {t('getStarted').toUpperCase()}
                    </Button>
                  </AuthModal>
                ) : (
                  <Button size="sm" variant="ghost" className="text-red-400 flex-1 font-bold" onClick={() => {
                    clearUser();
                    setIsOpen(false);
                    navigate("/");
                  }}>
                    LOG OUT
                  </Button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
