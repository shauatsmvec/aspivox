import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

const getInitials = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const TeamSection = () => {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching team members:', error);
      } else {
        setTeam(data || []);
      }
      setLoading(false);
    };

    fetchTeam();
  }, []);

  return (
    <section id="team" className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold font-display mb-4 text-foreground uppercase tracking-tight">
            Meet the <span className="text-primary">Team</span>
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group bg-card backdrop-blur-sm rounded-3xl border border-border p-8 text-center hover:border-primary/30 hover:bg-accent/50 transition-all duration-500 shadow-xl"
              >
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary text-2xl font-bold shadow-lg group-hover:scale-110 transition-transform duration-500 border border-primary/20">
                  {getInitials(member.name)}
                </div>
                <h3 className="font-bold text-foreground text-lg sm:text-xl font-display uppercase tracking-tight">{member.name}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm mt-2 font-medium uppercase tracking-widest">{member.designation}</p>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TeamSection;
