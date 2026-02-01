import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B1437] text-white overflow-x-hidden font-sans relative">
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#0075FF]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-[#00E0FF]/10 rounded-full blur-[120px]" />
      </div>
      <div className="text-center relative z-10">
        <h1 className="mb-4 text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0075FF] to-[#00E0FF]">404</h1>
        <p className="mb-8 text-xl text-slate-300">Oops! Page not found</p>
        <a href="/" className="px-6 py-3 bg-[#0075FF] hover:bg-[#0061D5] rounded-xl font-bold transition-all shadow-lg shadow-[#0075FF]/30">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
