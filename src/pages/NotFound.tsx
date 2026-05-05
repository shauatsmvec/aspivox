import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#050505] text-white">
      <div className="text-center">
        <h1 className="mb-6 text-8xl font-display font-bold text-violet shadow-[0_0_20px_rgba(139,92,246,0.3)]">404</h1>
        <p className="mb-8 text-2xl font-light text-gray-500 uppercase tracking-widest">Oops! Page not found</p>
        <a href="/" className="bg-violet text-white px-10 py-4 rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-violet/20 inline-block">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
