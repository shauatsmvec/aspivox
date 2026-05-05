import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BookOpen, Clock, Award, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const CourseDetail = () => {
  const { slug } = useParams<{ slug: string }>();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('slug', slug)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!slug
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-muted-foreground font-display uppercase tracking-widest text-sm">Loading course...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center text-center p-4">
          <div>
            <h1 className="text-4xl font-display uppercase tracking-tight text-foreground mb-4">Course Not Found</h1>
            <p className="text-muted-foreground mb-8">The course you are looking for does not exist or is currently unavailable.</p>
            <Button asChild className="bg-primary text-primary-foreground font-bold rounded-xl h-12">
              <Link to="/courses">Browse All Courses</Link>
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan/10 blur-[100px] rounded-full pointer-events-none" />

      <Navbar />

      <main className="flex-grow container mx-auto px-6 py-12 relative z-10">
        <Button asChild variant="ghost" className="mb-8 hover:bg-accent text-muted-foreground hover:text-foreground -ml-4">
          <Link to="/courses" className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Technology
                </Badge>
                {!course.is_active && (
                  <Badge variant="destructive" className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Closed
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display uppercase tracking-tight text-foreground mb-6 leading-tight">
                {course.title}
              </h1>
              <p className="text-xl text-muted-foreground font-light leading-relaxed">
                {course.description || "Master the fundamentals and advanced concepts in this comprehensive, industry-aligned course designed for modern developers."}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-8 border-y border-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Duration</p>
                  <p className="font-medium text-foreground">12 Weeks</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-cyan/10 flex items-center justify-center text-cyan">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Modules</p>
                  <p className="font-medium text-foreground">24 Lessons</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">Certificate</p>
                  <p className="font-medium text-foreground">Included</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-display uppercase tracking-tight text-foreground mb-6">What you'll learn</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['Industry-standard best practices', 'Hands-on practical projects', 'Advanced debugging techniques', 'System architecture basics'].map((item, i) => (
                  <div key={i} className="flex items-start space-x-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar / Enrollment Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <Card className="bg-card/50 backdrop-blur-xl border-border shadow-2xl rounded-3xl sticky top-24 overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-primary to-cyan"></div>
              <CardContent className="p-8 space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest mb-1">Course Investment</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold font-display text-foreground">₹{course.price}</span>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <Button 
                    className="w-full bg-primary text-primary-foreground font-bold rounded-xl h-14 text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                    disabled={!course.is_active}
                  >
                    {course.is_active ? 'Enroll Now' : 'Enrollments Closed'}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground font-light">
                    7-day money-back guarantee. No questions asked.
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CourseDetail;
