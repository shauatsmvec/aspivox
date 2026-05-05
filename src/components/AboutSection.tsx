import { motion } from "framer-motion";
import { MonitorPlay, FolderGit2, Award, IndianRupee } from "lucide-react";

const features = [
  { icon: MonitorPlay, label: "Live Mentor-Led Sessions", color: "text-primary", bg: "bg-primary/10" },
  { icon: FolderGit2, label: "Project-Based Learning", color: "text-cyan", bg: "bg-cyan/10" },
  { icon: Award, label: "Internships with Certification", color: "text-primary", bg: "bg-primary/10" },
  { icon: IndianRupee, label: "Pocket-Friendly Pricing", color: "text-cyan", bg: "bg-cyan/10" },
];

const AboutSection = () => (
  <section id="about" className="py-24 lg:py-32 bg-background">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-20"
      >
        <h2 className="text-4xl sm:text-5xl font-bold font-display mb-4 text-foreground uppercase tracking-tight">
          Why <span className="text-primary">Aspivox</span>?
        </h2>
        <div className="w-24 h-1 bg-primary mx-auto rounded-full shadow-[0_0_10px_hsl(var(--primary))]" />
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-muted-foreground mb-6 leading-relaxed text-lg font-light">
            Aspivox is an emerging Edu-Tech company dedicated to bridging the gap between academic learning and industry needs. We believe education should be accessible, practical, and mentored — not just theoretical.
          </p>
          <p className="text-muted-foreground mb-6 leading-relaxed text-lg font-light">
            Founded in 2025, we've been helping college students across India gain real-world tech skills through live mentor-led sessions, hands-on projects, and internship programs.
          </p>
          <p className="text-muted-foreground leading-relaxed text-lg font-light">
            Our mission is simple: make quality tech education affordable and accessible to every student who dreams of a career in technology.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-2 gap-6"
        >
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="bg-card backdrop-blur-sm rounded-2xl p-8 border border-border hover:border-primary/30 hover:bg-accent/50 transition-all group shadow-xl"
            >
              <div className={`w-14 h-14 ${f.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                <f.icon className={`w-7 h-7 ${f.color}`} />
              </div>
              <p className="font-bold text-base text-foreground leading-snug">{f.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  </section>
);

export default AboutSection;
