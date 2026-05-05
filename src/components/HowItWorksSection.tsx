import { motion } from "framer-motion";
import { BookOpen, MousePointer2, UserCheck } from "lucide-react";

const steps = [
  { icon: BookOpen, title: "Pick a Course", text: "Browse our list of industry-relevant courses." },
  { icon: MousePointer2, title: "Enroll & Pay", text: "Quick enrollment process with secure payment." },
  { icon: UserCheck, title: "Start Learning", text: "Get access to live mentor sessions and projects." },
];

const HowItWorksSection = () => {
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
          <h2 className="text-4xl sm:text-5xl font-bold font-display mb-4 text-foreground uppercase tracking-tight">
            How it <span className="text-cyan">Works</span>
          </h2>
          <div className="w-24 h-1 bg-cyan mx-auto rounded-full" />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="text-center group"
            >
              <div className="w-20 h-20 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6 border border-border group-hover:bg-cyan/10 group-hover:border-cyan/30 transition-all duration-500 shadow-lg">
                <step.icon className="w-8 h-8 text-cyan" />
              </div>
              <h3 className="text-2xl font-bold font-display uppercase tracking-tight mb-4 text-foreground">{step.title}</h3>
              <p className="text-muted-foreground font-light leading-relaxed">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
