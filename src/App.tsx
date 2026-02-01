import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { UserProvider } from "@/contexts/UserContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Onboarding from "./pages/Onboarding";
import StressTest from "./pages/StressTest";
import Chat from "./pages/Chat";
import MentalHealthChat from "./pages/MentalHealthChat";
import Tools from "./pages/Tools";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import TalkWithFriend from "./pages/TalkWithFriend";
import AudioAssessment from "./pages/AudioAssessment";
import ChatWithTestAssessment from "./pages/ChatWithTestAssessment";
import SereneRoom from "./pages/SereneRoom";
import { useEffect } from "react";
import { GoogleOAuthProvider } from '@react-oauth/google';

// Google Client ID - Configure in environment
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

const queryClient = new QueryClient();

const ScrollToHash = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [hash]);

  return null;
};

const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <UserProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToHash />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/stress-test" element={<StressTest />} />

                {/* Consolidated Assessment Routes */}
                <Route path="/assessment/audio" element={<AudioAssessment />} />
                <Route path="/assessment/chat-test" element={<ChatWithTestAssessment />} />
                <Route path="/assessment/test" element={<StressTest />} />

                {/* Friend Chat Route */}
                <Route path="/talk-with-your-friend" element={<TalkWithFriend />} />

                <Route path="/chat" element={<Chat />} />
                <Route path="/mental-health-chat" element={<MentalHealthChat />} />
                <Route path="/tools" element={<Tools />} />
                <Route path="/tools/serene-room" element={<SereneRoom />} />
                <Route path="/about" element={<About />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </GoogleOAuthProvider>
);

export default App;
