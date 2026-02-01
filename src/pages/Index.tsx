import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/landing/HeroSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { CTASection } from "@/components/landing/CTASection";

import { useUser } from "@/contexts/UserContext";
// import { getAgeTheme } from "@/lib/ageThemes"; // Overriding theme for consistent Dark Design

import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const Index = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  // const theme = getAgeTheme(user.ageGroup); // Disabling dynamic age theme for Landing to enforce Dark Vision UI

  // Removed auto-redirect to allow users to navigate back to Home
  // useEffect(() => {
  //   if (user.hasCompletedOnboarding) {
  //     navigate('/dashboard', { replace: true });
  //   }
  // }, [user.hasCompletedOnboarding, navigate]);

  return (
    <div className="min-h-screen bg-[#0B1437] text-white selection:bg-[#0075FF] overflow-x-hidden font-sans">
      {/* Dark Background Gradients */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0075FF]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00E0FF]/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Header />
        <main className="space-y-0">
          <HeroSection />
          <FeaturesSection />
          <HowItWorks />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Index;
