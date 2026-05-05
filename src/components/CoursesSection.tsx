import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Code, Coffee, Terminal, Globe, Layers, BarChart3, Cpu, Sparkles, FileCode, CheckCircle2, Search, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { MorphingPopover, MorphingPopoverTrigger, MorphingPopoverContent } from "./ui/morphing-popover";
import { Input } from "@/components/ui/input";

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

interface CoursesSectionProps {
  limit?: number;
  isFullView?: boolean;
}

const CoursesSection = ({ limit, isFullView = false }: CoursesSectionProps) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_active', true);
      
      if (error) throw error;
      setCourses(data || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnroll = async (courseId: string, close: () => void) => {
    if (!user) {
      toast.error("Please login to enroll");
      navigate('/login');
      return;
    }

    try {
      const { error } = await supabase
        .from('enrollments')
        .insert({
          student_id: user.id,
          course_id: courseId,
          status: 'pending'
        });

      if (error) {
        if (error.code === '23505') toast.error("You are already enrolled!");
        else toast.error(error.message);
      } else {
        toast.success("Enrolled successfully! Check your dashboard.");
        close();
      }
    } catch (err) {
      toast.error("Enrollment failed.");
    }
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedCourses = limit ? filteredCourses.slice(0, limit) : filteredCourses;

  return (
    <section id="courses" className={isFullView ? "py-10 bg-background" : "py-24 lg:py-32 bg-background"}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {!isFullView && (
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold font-display mb-4 text-foreground uppercase tracking-tight">
              What You'll <span className="text-primary">Learn</span>
            </h2>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full mb-6 shadow-[0_0_10px_hsl(var(--primary))]" />
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-light">
              Industry-relevant courses designed for college students, taught by experienced mentors.
            </p>
          </div>
        )}

        {isFullView && (
          <div className="mb-12 max-w-md mx-auto relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search for a course..."
              className="pl-12 h-14 bg-card border-border rounded-2xl focus:ring-primary shadow-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-primary"></div>
          </div>
        ) : (
          <>
            {displayedCourses.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground italic">No courses found matching your search.</div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayedCourses.map((course, i) => {
                  const Icon = iconMap[course.title] || Code;
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="group bg-card backdrop-blur-sm rounded-3xl border border-border hover:border-primary/30 hover:bg-accent/50 transition-all duration-500 shadow-2xl"
                    >
                      <div className="h-1.5 bg-primary/20 group-hover:bg-primary transition-colors rounded-t-3xl" />
                      <div className="p-8">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                          <Icon className="w-8 h-8 text-primary" />
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
                                <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                                <h4 className="text-lg font-bold mb-2 uppercase tracking-tight">Confirm Enrollment</h4>
                                <p className="text-muted-foreground text-xs mb-6 font-light">Are you sure you want to enroll in {course.title}?</p>
                                <Button 
                                  className="w-full bg-primary text-primary-foreground hover:opacity-90 font-bold rounded-xl h-12"
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

            {!isFullView && courses.length > 6 && (
              <div className="mt-16 text-center">
                <Button asChild variant="outline" className="border-primary text-primary hover:bg-primary/10 rounded-full px-12 h-14 font-bold uppercase tracking-widest shadow-lg transition-all group">
                  <Link to="/courses" className="flex items-center gap-2">
                    View All Courses <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default CoursesSection;
