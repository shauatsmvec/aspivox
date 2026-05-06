import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Clock, Award, FolderGit2, CalendarDays, X } from "lucide-react";
import { MorphingPopover, MorphingPopoverTrigger, MorphingPopoverContent } from "./ui/morphing-popover";
import InternshipForm from "./InternshipForm";
import { useState } from "react";

const durations = ["15 Days", "30 Days", "45 Days", "60 Days", "90 Days"];
const highlights = [
  { icon: Clock, text: "Free & Paid options available" },
  { icon: FolderGit2, text: "Mandatory project work" },
  { icon: Award, text: "Certificate on completion" },
  { icon: CalendarDays, text: "Flexible start dates" },
];

const InternshipSection = () => {
  return (
    <section id="internship" className="py-24 lg:py-32 relative bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold font-display mb-4 text-foreground uppercase tracking-tight">
            <span className="text-primary">Internship</span> Programs
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6 shadow-[0_0_10px_hsl(var(--primary))]" />
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-light">
            Gain real experience, earn a certificate, and build your portfolio.
          </p>
        </motion.div>

        {/* Duration cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap justify-center gap-6 mb-16"
        >
          {durations.map((d, i) => (
            <motion.div
              key={d}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              className="bg-card backdrop-blur-sm rounded-2xl px-10 py-8 border border-border hover:border-primary/30 hover:bg-accent/50 transition-all text-center group shadow-xl"
            >
              <p className="text-4xl font-bold text-primary group-hover:scale-110 transition-transform">{d.split(" ")[0]}</p>
              <p className="text-sm text-muted-foreground uppercase tracking-widest mt-1">Days</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Highlights */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {highlights.map((h, i) => (
            <motion.div
              key={h.text}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-center gap-4 bg-card backdrop-blur-sm rounded-2xl p-6 border border-border"
            >
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <h.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground tracking-wide">{h.text}</span>
            </motion.div>
          ))}
        </div>

        <div className="text-center flex justify-center">
          <MorphingPopover>
            <MorphingPopoverTrigger asChild>
              <Button size="lg" className="bg-primary text-primary-foreground font-bold px-12 py-7 text-lg rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/20">
                Apply for Internship
              </Button>
            </MorphingPopoverTrigger>
            <MorphingPopoverContent className="max-w-2xl w-[90vw] bg-popover border-border text-popover-foreground p-8 rounded-3xl">
              {({ close }) => (
                <>
                  <div className="mb-8">
                    <h3 className="text-2xl font-display uppercase tracking-tight text-foreground">Internship Application</h3>
                    <p className="text-muted-foreground text-sm mt-1">Fill out the form below to apply for our internship program.</p>
                  </div>
                  <InternshipForm onSuccess={close} />
                </>
              )}
            </MorphingPopoverContent>
          </MorphingPopover>
        </div>
      </div>
    </section>
  );
};

export default InternshipSection;
