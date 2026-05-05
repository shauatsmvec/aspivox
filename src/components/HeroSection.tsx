import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { lazy, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useQuery } from "@tanstack/react-query";

const Spline = lazy(() => import("@splinetool/react-spline"));

const HeroSection = () => {
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
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
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
                { emoji: "🎓", text: `${studentCount} Students` },
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
      </div>

      {/* Spline Side Layer - Pushed to the far right */}
      <div className="absolute top-0 right-[-10%] w-[65%] h-full z-10 pointer-events-none lg:pointer-events-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="w-full h-full"
        >
          <Suspense fallback={<div className="w-full h-full bg-transparent" />}>
            <Spline 
              scene="https://prod.spline.design/dXbKN4kUfFQRNx-Q/scene.splinecode" 
            />
          </Suspense>
        </motion.div>
        
        {/* Gradients to blend Spline */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
      </div>

      {/* Ambient background glow */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
    </section>
  );
};

export default HeroSection;
