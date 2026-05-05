import { motion } from "framer-motion";
import { Target, Lightbulb } from "lucide-react";

const VisionMissionSection = () => (
  <section className="py-24 lg:py-32 bg-background">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-card border border-border p-10 rounded-3xl shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transition-transform group-hover:scale-110" />
          <Target className="w-12 h-12 text-primary mb-6" />
          <h3 className="text-3xl font-bold font-display uppercase tracking-tight mb-4 text-foreground">Our Vision</h3>
          <p className="text-muted-foreground text-lg font-light leading-relaxed">
            To become India's most trusted platform for student tech education, where every learner has the guidance they need to succeed in the digital economy.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="bg-card border border-border p-10 rounded-3xl shadow-xl relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan/5 rounded-bl-full transition-transform group-hover:scale-110" />
          <Lightbulb className="w-12 h-12 text-cyan mb-6" />
          <h3 className="text-3xl font-bold font-display uppercase tracking-tight mb-4 text-foreground">Our Mission</h3>
          <p className="text-muted-foreground text-lg font-light leading-relaxed">
            To empower students by providing industry-aligned tech education that is mentored, practical, and highly affordable for everyone.
          </p>
        </motion.div>
      </div>
    </div>
  </section>
);

export default VisionMissionSection;
