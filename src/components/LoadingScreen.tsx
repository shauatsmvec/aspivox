import React, { useState, useEffect } from "react";
import { VaporizeTextCycle, Tag } from "@/components/ui/vapour-text-effect";
import { motion, AnimatePresence } from "framer-motion";

export const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Show the loading screen for 5 seconds total
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    const cleanupTimer = setTimeout(() => {
      setShouldRender(false);
    }, 6500);

    return () => {
      clearTimeout(timer);
      clearTimeout(cleanupTimer);
    };
  }, []);

  if (!shouldRender) return null;

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="loading-screen-v6"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, ease: "easeInOut" }}
          className="fixed inset-0 z-[999999] bg-black flex flex-col justify-center items-center overflow-hidden"
          style={{ backgroundColor: 'black' }}
        >
          {/* Slogan Container */}
          <div className="relative w-full max-w-[90vw] h-[200px] flex justify-center items-center px-4">
            <VaporizeTextCycle
              texts={["Start Today, State Tomorrow"]}
              font={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: "36px", // Fixed pixel size to avoid Canvas calculation issues
                fontWeight: 800
              }}
              color="rgb(255, 255, 255)"
              spread={4}
              density={7}
              animation={{
                vaporizeDuration: 2.5,
                fadeInDuration: 1.5,
                waitDuration: 0.8
              }}
              direction="left-to-right"
              alignment="center"
              tag={Tag.H1}
            />
          </div>
          
          {/* Footer Branding */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="absolute bottom-12 flex flex-col items-center gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-2xl shadow-primary/40 animate-pulse">
                <span className="text-primary-foreground font-black text-sm">A</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white text-sm font-black uppercase tracking-[0.4em] leading-tight">Aspivox</span>
                <span className="text-white/40 text-[8px] uppercase tracking-[0.2em] font-medium mt-1">Elevating Education</span>
              </div>
            </div>
          </motion.div>

          <div className="absolute inset-0 bg-black -z-10" />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
