import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import React, { lazy, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

import Spline from "@splinetool/react-spline";

const HeroSection = () => {
  const [webglSupported, setWebglSupported] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    // Check for WebGL support
    try {
      const canvas = document.createElement('canvas');
      const support = !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
      setWebglSupported(support);
    } catch (e) {
      setWebglSupported(false);
    }
  }, []);

  const { data: studentCount } = useQuery({
    queryKey: ['hero_stats'],
    queryFn: async () => {
      const { data: baseData, error: baseError } = await supabase
        .from('site_stats')
        .select('value, suffix')
        .eq('key', 'students_trained')
        .single();
      
      if (baseError && baseError.code !== 'PGRST116') throw baseError;
      
      const { count: realCount, error: countError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      if (countError) throw countError;

      const baseValue = baseData?.value || 70;
      const finalCount = Math.max(baseValue, realCount || 0);
      const suffix = baseData?.suffix || "+";

      return `${finalCount}${suffix}`;
    },
    initialData: "70+",
    staleTime: 1000 * 60 * 5,
  });

  return (
    <section
      id="home"
      className="relative min-h-screen w-full flex items-center overflow-hidden bg-background pt-20"
    >
      {/* Content Layer */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12 grid grid-cols-1 lg:grid-cols-[1fr_1.3fr] items-center gap-12">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-block px-4 py-1.5 mb-8 border border-primary/30 rounded-full bg-primary/10 backdrop-blur-md">
              <span className="text-xs font-bold text-primary uppercase tracking-[0.3em]">Next-Gen Learning</span>
            </div>

            <h1 className="big-text mb-6 leading-none text-primary">
              Learn Tech.<br />
              <span className="text-foreground">Build Projects.</span><br />
              <span className="gradient-text">Get Hired.</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground mb-10 max-w-lg font-light leading-relaxed">
              Affordable, mentor-led programming courses for students. 
              Join {studentCount} learners building their future with <span className="text-foreground font-medium">Aspivox</span>.
            </p>

            <div className="flex flex-wrap gap-5 mb-12">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground font-bold px-8 py-6 text-base rounded-xl hover:scale-105 transition-all shadow-xl shadow-primary/20"
                onClick={() => document.getElementById("courses")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore Courses
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-border text-foreground hover:bg-accent font-bold px-8 py-6 text-base rounded-xl backdrop-blur-md"
                onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
              >
                Know More
              </Button>
            </div>

            {/* Compact Trust badges */}
            <div className="flex items-center gap-8">
              {[
                { emoji: "💻", text: "Online" },
                { emoji: "✅", text: "MSME" },
              ].map((badge) => (
                <div key={badge.text} className="flex items-center gap-2">
                  <span className="text-xl">{badge.emoji}</span>
                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{badge.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Spline Side Layer - Now part of the grid */}
        <div className="relative w-full h-[500px] lg:h-[700px] pointer-events-none lg:pointer-events-auto overflow-hidden rounded-3xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: 50 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.3 }}
            className="w-full h-full relative"
          >
            {webglSupported ? (
              <SplineErrorBoundary>
                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                  </div>
                }>
                  <Spline 
                    scene="https://prod.spline.design/dXbKN4kUfFQRNx-Q/scene.splinecode" 
                  />
                </Suspense>
              </SplineErrorBoundary>
            ) : (
              <div className="w-full h-full relative flex items-center justify-center bg-muted/5 border border-border/50 overflow-hidden rounded-3xl">
                {/* Premium High-Res Fallback Image */}
                <motion.img 
                  initial={{ scale: 1.1, opacity: 0 }}
                  animate={{ scale: 1, opacity: 0.5 }}
                  transition={{ duration: 1.5 }}
                  src="https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=2000&auto=format&fit=crop" 
                  alt="Aspivox Tech"
                  className="w-full h-full object-cover"
                />
                
                {/* Floating UI Elements */}
                <div className="absolute inset-0 z-10 pointer-events-none">
                  <motion.div 
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/10 rounded-2xl backdrop-blur-xl border border-primary/20 flex items-center justify-center"
                  >
                     <div className="w-12 h-2 bg-primary/40 rounded-full" />
                  </motion.div>
                  <motion.div 
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/10 rounded-full backdrop-blur-xl border border-accent/20"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-transparent z-20" />
                
                <div className="absolute bottom-6 right-6 p-4 bg-background/80 backdrop-blur-md border border-border rounded-xl max-w-[200px] z-30 shadow-2xl">
                   <p className="text-[8px] font-bold uppercase tracking-widest text-primary mb-1 flex items-center gap-1">
                     <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                     Optimized Mode
                   </p>
                   <p className="text-[10px] text-muted-foreground leading-tight">
                     Interactive 3D is unavailable in this browser. Showing high-performance visuals instead.
                   </p>
                </div>
              </div>
            )}
          </motion.div>
          
          {/* Gradients to blend visuals */}
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent z-10 lg:hidden" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        </div>
      </div>

      {/* Ambient background glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
};

export default HeroSection;

class SplineErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn("Spline/WebGL Error handled:", error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl opacity-50" />
      );
    }
    return this.props.children;
  }
}
