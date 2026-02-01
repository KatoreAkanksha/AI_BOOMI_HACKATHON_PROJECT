import { Link } from "react-router-dom";
import { Heart, Mail, Shield, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#111C44] border-t border-white/5 py-12 relative z-20">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <div className="w-10 h-10 rounded-xl bg-[#0075FF]/10 flex items-center justify-center border border-[#0075FF]/20 group-hover:scale-110 transition-transform duration-300">
                <Heart className="w-5 h-5 text-[#0075FF] fill-[#0075FF]" />
              </div>
              <span className="font-bold text-xl tracking-wide text-white group-hover:text-[#00E0FF] transition-colors">MindEase</span>
            </Link>
            <p className="text-sm text-[#A0AEC0] leading-relaxed">
              Your calm, intelligent companion for stress assessment and mental wellness support.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Features</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/stress-test" className="text-[#A0AEC0] hover:text-[#0075FF] transition-colors">
                  Stress Assessment
                </Link>
              </li>
              <li>
                <Link to="/talk-with-your-friend" className="text-[#A0AEC0] hover:text-[#0075FF] transition-colors">
                  Talk with Friend
                </Link>
              </li>
              <li>
                <Link to="/tools" className="text-[#A0AEC0] hover:text-[#0075FF] transition-colors">
                  Relief Tools
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-[#A0AEC0] hover:text-[#0075FF] transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-white mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="text-[#A0AEC0] hover:text-[#0075FF] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-[#A0AEC0] hover:text-[#0075FF] transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-[#A0AEC0] hover:text-[#0075FF] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white mb-4">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/privacy" className="text-[#A0AEC0] hover:text-[#0075FF] transition-colors flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-[#A0AEC0] hover:text-[#0075FF] transition-colors flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/disclaimer" className="text-[#A0AEC0] hover:text-[#0075FF] transition-colors flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  Disclaimer
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#A0AEC0]">
          <p>© 2024 MindEase. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-4 h-4 text-[#0075FF] fill-[#0075FF]" /> for your well-being
          </p>
        </div>
      </div>
    </footer>
  );
}
