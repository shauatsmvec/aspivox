import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BookOpen, User as UserIcon, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, studentProfile, loading } = useAuth();
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }

    const fetchEnrollments = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('enrollments')
          .select('*, courses(*)')
          .eq('student_id', user.id);
        
        if (error) {
          console.error('Error fetching enrollments:', error);
        } else {
          setEnrollments(data || []);
        }
      }
    };

    fetchEnrollments();
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <div className="flex-grow pt-32 pb-24 px-4 max-w-7xl mx-auto w-full relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="mb-12 relative z-10">
          <h1 className="text-4xl sm:text-5xl font-bold font-display uppercase tracking-tight text-foreground">
            Welcome back, <span className="text-primary">{studentProfile?.full_name?.split(' ')[0] || user?.email?.split('@')[0]}</span>!
          </h1>
          <p className="text-muted-foreground mt-2 font-light text-lg tracking-wide">Manage your learning and applications here.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
          <div className="lg:col-span-1 space-y-8">
            <Card className="bg-card backdrop-blur-sm border-border text-foreground rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="flex flex-row items-center space-x-3 border-b border-border pb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-xl font-display uppercase tracking-tight">Profile Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Email</label>
                  <p className="font-medium text-foreground">{user?.email}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">College</label>
                  <p className="font-medium text-foreground">{studentProfile?.college || 'Not set'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">City</label>
                  <p className="font-medium text-foreground">{studentProfile?.city || 'Not set'}</p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-widest">Phone</label>
                  <p className="font-medium text-foreground">{studentProfile?.phone || 'Not set'}</p>
                </div>
                <Button variant="outline" className="w-full mt-4 border-border text-foreground hover:bg-accent rounded-xl h-12 font-bold uppercase tracking-wider text-xs transition-all">Edit Profile</Button>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground rounded-3xl overflow-hidden shadow-2xl shadow-primary/20 group">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold font-display uppercase tracking-tight mb-3">Ready for an Internship?</h3>
                <p className="text-primary-foreground/80 text-base font-light mb-6 leading-relaxed">Apply for our exclusive internship program and get real-world experience.</p>
                <Button asChild variant="secondary" className="w-full bg-background text-foreground hover:bg-accent font-bold h-12 rounded-xl transition-transform group-hover:scale-[1.02]">
                  <Link to="/internship">Apply Now</Link>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-card backdrop-blur-sm border-border text-foreground rounded-3xl overflow-hidden shadow-xl">
              <CardHeader className="flex flex-row items-center space-x-3 border-b border-border pb-6">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-xl font-display uppercase tracking-tight">My Courses</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {enrollments.map((enrollment) => (
                      <div key={enrollment.id} className="flex items-center justify-between p-6 bg-muted/50 border border-border rounded-2xl hover:bg-accent/50 transition-all group">
                        <div className="flex items-center space-x-5">
                          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <GraduationCap className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xl font-display uppercase tracking-tight text-foreground">{enrollment.courses?.title}</h4>
                            <p className="text-sm text-muted-foreground font-light mt-1">Enrolled on: {new Date(enrollment.enrolled_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Badge className={`${enrollment.status === 'active' ? 'bg-cyan text-black' : 'bg-muted text-muted-foreground border border-border'} rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest`}>
                          {enrollment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                      <BookOpen className="w-10 h-10 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground mb-8 font-light text-lg">You haven't enrolled in any courses yet.</p>
                    <Button asChild className="bg-primary text-primary-foreground font-bold px-10 py-6 rounded-xl transition-all shadow-lg shadow-primary/20">
                      <Link to="/courses">Browse Courses</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
