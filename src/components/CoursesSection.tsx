import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Code, Coffee, Terminal, Globe, Layers, BarChart3, Cpu, Sparkles, FileCode, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { MorphingPopover, MorphingPopoverTrigger, MorphingPopoverContent } from "./ui/morphing-popover";

const iconMap: Record<string, any> = {
  "Python Programming": Code,
  "Java": Coffee,
  "C & C#": Terminal,
  "React JS": Globe,
  "MERN Stack": Layers,
  "Data Science": BarChart3,
  "IoT": Cpu,
  "Generative AI": Sparkles,
  "PHP & Web Basics": FileCode,
};

const CoursesSection = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true);
      
      if (error) {
        console.error('Error fetching courses:', error);
      } else {
        setCourses(data || []);
      }
      setLoading(false);
    };

    fetchCourses();
  }, []);

  const handleEnroll = async (courseId: string, close: () => void) => {
    if (!user) {
      toast.error("Please login to enroll");
      navigate('/login');
      return;
    }

    const { data: existingEnrollment } = await supabase
      .from('enrollments')
      .select('id')
      .eq('student_id', user.id)
      .eq('course_id', courseId)
      .single();

    if (existingEnrollment) {
      toast.error("You are already enrolled in this course");
      close();
      return;
    }

    const { error } = await supabase
      .from('enrollments')
      .insert({
        student_id: user.id,
        course_id: courseId,
        status: 'pending'
      });

    if (error) {
      toast.error("Enrollment failed: " + error.message);
    } else {
      toast.success("Enrolled successfully! Check your dashboard.");
      close();
    }
  };

  return (
    <section id="courses" className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl sm:text-5xl font-bold font-display mb-4 text-foreground uppercase tracking-tight">
            What You'll <span className="text-cyan">Learn</span>
          </h2>
          <div className="w-24 h-1 bg-cyan mx-auto rounded-full mb-6 shadow-[0_0_10px_#06b6d4]" />
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-light">
            Industry-relevant courses designed for college students, taught by experienced mentors.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-cyan"></div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, i) => {
              const Icon = iconMap[course.title] || Code;
              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="group bg-card backdrop-blur-sm rounded-3xl border border-border hover:border-cyan/30 hover:bg-accent/50 transition-all duration-500 overflow-hidden shadow-2xl"
                >
                  <div className="h-1.5 bg-cyan/20 group-hover:bg-cyan transition-colors" />
                  <div className="p-8">
                    <div className="w-16 h-16 bg-cyan/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                      <Icon className="w-8 h-8 text-cyan" />
                    </div>
                    <h3 className="font-bold text-2xl text-foreground mb-3 font-display uppercase tracking-tight">{course.title}</h3>
                    <p className="text-muted-foreground text-sm mb-8 font-light leading-relaxed h-20 line-clamp-3">{course.description}</p>
                    
                    <MorphingPopover>
                      <MorphingPopoverTrigger asChild>
                        <Button 
                          size="lg" 
                          className="w-full bg-primary text-primary-foreground font-bold rounded-2xl transition-all shadow-lg shadow-primary/10"
                        >
                          Enroll Now
                        </Button>
                      </MorphingPopoverTrigger>
                      <MorphingPopoverContent className="w-[300px] bg-popover border-border text-popover-foreground p-6 rounded-2xl">
                        {({ close }: { close: () => void }) => (
                          <div className="text-center">
                            <CheckCircle2 className="w-12 h-12 text-cyan mx-auto mb-4" />
                            <h4 className="text-lg font-bold mb-2 uppercase tracking-tight">Confirm Enrollment</h4>
                            <p className="text-muted-foreground text-xs mb-6 font-light">Are you sure you want to enroll in {course.title}?</p>
                            <Button 
                              className="w-full bg-cyan text-black hover:bg-cyan/90 font-bold rounded-xl h-12"
                              onClick={() => handleEnroll(course.id, close)}
                            >
                              Confirm
                            </Button>
                          </div>
                        )}
                      </MorphingPopoverContent>
                    </MorphingPopover>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CoursesSection;
