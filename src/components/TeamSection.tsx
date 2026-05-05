import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mail, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

const getInitials = (name: string) =>
  name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

const TeamSection = () => {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

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

  useEffect(() => {
    if (loading || team.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [loading, team, isPaused]);

  return (
    <section id="team" className="py-24 lg:py-32 bg-background relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.05),transparent)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
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
          <p className="mt-6 text-muted-foreground font-light max-w-2xl mx-auto tracking-wide">The brilliant minds driving innovation and excellence at Aspivox.</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-primary"></div>
          </div>
        ) : (
          <div 
            className="relative group/carousel"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <motion.div 
              ref={scrollRef}
              className="flex gap-8 overflow-x-auto pb-12 px-4 no-scrollbar cursor-grab active:cursor-grabbing snap-x snap-mandatory"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              drag="x"
              dragConstraints={{ right: 0, left: -((team.length * 320) - window.innerWidth + 100) }}
              onDragStart={() => setIsPaused(true)}
            >
              {team.map((member, i) => (
                <motion.div
                  key={member.id}
                  whileHover={{ y: -10 }}
                  onClick={() => setSelectedMember(member)}
                  className="min-w-[280px] sm:min-w-[320px] bg-card backdrop-blur-sm rounded-3xl border border-border p-8 text-center hover:border-primary/50 hover:bg-accent/50 transition-all duration-500 shadow-2xl snap-center group cursor-pointer relative overflow-hidden"
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Info className="w-4 h-4 text-primary" />
                  </div>
                  
                  <div className="w-28 h-28 rounded-full overflow-hidden mx-auto mb-8 border-2 border-primary/20 p-1 group-hover:border-primary transition-colors duration-500">
                    {member.image_url ? (
                      <img src={member.image_url} alt={member.name} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold font-display">
                        {getInitials(member.name)}
                      </div>
                    )}
                  </div>
                  
                  <h3 className="font-bold text-foreground text-xl font-display uppercase tracking-tight">{member.name}</h3>
                  <p className="text-primary text-[10px] font-bold mt-2 uppercase tracking-widest bg-primary/10 inline-block px-3 py-1 rounded-full">{member.designation}</p>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Visual hint for scrolling */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 items-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-50">
              <span>{isPaused ? 'Paused' : 'Auto-rotating'} • Drag to explore</span>
            </div>
          </div>
        )}
      </div>

      <Dialog open={!!selectedMember} onOpenChange={() => setSelectedMember(null)}>
        <DialogContent className="bg-card border-border sm:max-w-[500px] rounded-[2rem] p-0 overflow-hidden shadow-2xl">
          <AnimatePresence>
            {selectedMember && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative"
              >
                <div className="h-32 bg-primary/10 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent" />
                </div>
                
                <div className="px-8 pb-10 -mt-16 text-center relative z-10">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden mx-auto mb-6 border-4 border-card shadow-2xl">
                    {selectedMember.image_url ? (
                      <img src={selectedMember.image_url} alt={selectedMember.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-primary/20 flex items-center justify-center text-primary text-4xl font-bold font-display">
                        {getInitials(selectedMember.name)}
                      </div>
                    )}
                  </div>

                  <h2 className="text-3xl font-bold font-display uppercase tracking-tight text-foreground">{selectedMember.name}</h2>
                  <p className="text-primary font-bold uppercase tracking-[0.2em] text-xs mt-2">{selectedMember.designation}</p>
                  
                  {selectedMember.email && (
                    <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground hover:text-primary transition-colors cursor-pointer group/email">
                      <div className="p-2 bg-muted rounded-xl group-hover/email:bg-primary/10">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">{selectedMember.email}</span>
                    </div>
                  )}

                  {selectedMember.bio && (
                    <div className="mt-8 text-left">
                      <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                        <div className="w-4 h-[1px] bg-primary" /> About
                      </h4>
                      <p className="text-foreground/80 font-light leading-relaxed tracking-wide">
                        {selectedMember.bio}
                      </p>
                    </div>
                  )}
                </div>
                
                <button 
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-all z-20"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default TeamSection;
