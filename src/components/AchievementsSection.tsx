import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

const Counter = ({ target, suffix }: { target: number; suffix: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1500;
          const steps = 40;
          const increment = target / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
              setCount(target);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <div ref={ref} className="text-5xl sm:text-6xl font-bold text-foreground">
      {count}
      {suffix}
    </div>
  );
};

const AchievementsSection = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const { data, error } = await supabase
        .from('site_stats')
        .select('*');
      
      if (error) {
        console.error('Error fetching stats:', error);
      } else {
        // Fetch real student count as a fallback/sync check
        const { count: realCount } = await supabase
          .from('students')
          .select('*', { count: 'exact', head: true });

        const updatedStats = data?.map(s => {
          if (s.key === 'students_trained') {
            return { ...s, value: Math.max(s.value, realCount || 0) };
          }
          return s;
        });

        const sortedStats = updatedStats?.sort((a, b) => {
          const order = ['students_trained', 'courses_offered', 'internship_options', 'years_active'];
          return order.indexOf(a.key) - order.indexOf(b.key);
        });
        setStats(sortedStats || []);
      }
      setLoading(false);
    };

    fetchStats();
  }, []);

  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold font-display text-foreground mb-4 uppercase tracking-tight">
            Our Growing <span className="text-primary">Community</span>
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            {stats.map((s, i) => (
              <motion.div
                key={s.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center group"
              >
                <div className="text-primary group-hover:scale-110 transition-transform duration-500">
                  <Counter target={s.value} suffix={s.suffix || ""} />
                </div>
                <p className="text-muted-foreground mt-4 text-sm sm:text-base font-medium uppercase tracking-widest">{s.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed text-lg font-light"
        >
          Since 2025, Aspivox has trained students from multiple colleges across India through word-of-mouth, student satisfaction, and online visibility. We're MSME registered and growing.
        </motion.p>
      </div>
    </section>
  );
};

export default AchievementsSection;
