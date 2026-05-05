import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { BookOpen, User as UserIcon, GraduationCap, Video, Calendar, ExternalLink, Search } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';

const CourseLmsView = ({ courseId }: { courseId: string }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['course_classes', courseId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lms_classes')
        .select('*')
        .eq('course_id', courseId)
        .order('scheduled_at', { ascending: true });
      
      if (error) throw error;
      return data || [];
    }
  });

  if (isLoading) return <div className="space-y-4"><div className="h-20 bg-muted animate-pulse rounded-2xl"></div></div>;

  if (classes.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground font-light">No classes scheduled for this course yet.</p>
      </div>
    );
  }

  const filteredClasses = classes.filter((cls: any) => 
    (cls.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (cls.instructor_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input 
          placeholder="Search lessons..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-background border-border rounded-xl h-10 text-xs"
        />
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
        {filteredClasses.map((cls: any) => (
        <div key={cls.id} className={cn("p-5 border rounded-2xl space-y-4 transition-all", cls.is_completed ? "bg-muted/10 border-border opacity-75" : "bg-muted/30 border-border shadow-sm")}>
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-foreground font-display uppercase tracking-tight">{cls.title}</h4>
              <div className="text-[10px] text-primary font-bold uppercase tracking-wider mt-1">
                Instructor: {cls.instructor_name} {cls.instructor_role && <span className="text-muted-foreground font-normal">({cls.instructor_role})</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-2 flex items-center font-light">
                <Calendar className="w-3 h-3 mr-1" />
                {new Date(cls.scheduled_at).toLocaleString()}
              </p>
            </div>
            <Badge variant="outline" className={cn("text-[10px] uppercase tracking-tighter", cls.is_completed ? "bg-muted text-muted-foreground" : "bg-cyan/10 text-cyan border-cyan/20")}>
              {cls.is_completed ? 'Finished' : (new Date(cls.scheduled_at) > new Date() ? 'Upcoming' : 'Live')}
            </Badge>
          </div>
          <div className="flex gap-2">
            {!cls.is_completed ? (
              <Button asChild size="sm" className="bg-primary text-primary-foreground font-bold rounded-xl flex-1 uppercase text-[10px] tracking-widest h-10 shadow-lg shadow-primary/20">
                <a href={cls.meeting_link} target="_blank" rel="noopener noreferrer">
                  <Video className="w-3 h-3 mr-1" /> Join Class
                </a>
              </Button>
            ) : (
              <Button disabled size="sm" className="bg-muted text-muted-foreground font-bold rounded-xl flex-1 uppercase text-[10px] tracking-widest h-10 cursor-not-allowed">
                <Video className="w-3 h-3 mr-1" /> Class Ended
              </Button>
            )}
            {(cls.recording_link || cls.notes_link) && (
              <div className="flex gap-2 flex-1">
                {cls.recording_link && (
                  <Button asChild variant="outline" size="sm" className="rounded-xl flex-1 uppercase text-[10px] tracking-widest border-border h-10">
                    <a href={cls.recording_link} target="_blank" rel="noopener noreferrer">
                      <Video className="w-3 h-3 mr-1" /> Record
                    </a>
                  </Button>
                )}
                {cls.notes_link && (
                  <Button asChild variant="outline" size="sm" className="rounded-xl flex-1 uppercase text-[10px] tracking-widest border-border h-10">
                    <a href={cls.notes_link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3 mr-1" /> Notes
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, studentProfile, loading } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  // Redirect instructors to their dashboard
  const { data: isInstructor } = useQuery({
    queryKey: ['check_is_instructor', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase.from('instructors').select('id').eq('email', user?.email).single();
      return !!data;
    },
    enabled: !!user?.email
  });

  useEffect(() => {
    if (isInstructor) {
      navigate('/instructor-dashboard');
    }
  }, [isInstructor, navigate]);

  const { data: enrollments = [], isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['enrollments', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('enrollments')
        .select('id, status, enrolled_at, course_id, courses(title)')
        .eq('student_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase
        .from('students')
        .update(payload)
        .eq('id', user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Profile updated successfully');
      setIsDialogOpen(false);
      window.location.reload(); // Refresh to update AuthContext
    },
    onError: (error: any) => {
      toast.error(error.message);
    }
  });

  const handleProfileUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateProfileMutation.mutate({
      full_name: formData.get('full_name'),
      college: formData.get('college'),
      city: formData.get('city'),
      phone: formData.get('phone'),
    });
  };

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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mt-4 border-border text-foreground hover:bg-accent rounded-xl h-12 font-bold uppercase tracking-wider text-xs transition-all">Edit Profile</Button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border sm:max-w-[425px] rounded-3xl">
                    <DialogHeader>
                      <DialogTitle className="font-display uppercase tracking-tight text-xl">Edit Profile</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleProfileUpdate} className="space-y-4 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name" className="text-xs font-bold uppercase text-muted-foreground">Full Name</Label>
                        <Input id="full_name" name="full_name" defaultValue={studentProfile?.full_name} required className="bg-background border-border rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="college" className="text-xs font-bold uppercase text-muted-foreground">College</Label>
                        <Input id="college" name="college" defaultValue={studentProfile?.college} className="bg-background border-border rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-xs font-bold uppercase text-muted-foreground">City</Label>
                        <Input id="city" name="city" defaultValue={studentProfile?.city} className="bg-background border-border rounded-xl h-12" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-xs font-bold uppercase text-muted-foreground">Phone</Label>
                        <Input id="phone" name="phone" defaultValue={studentProfile?.phone} className="bg-background border-border rounded-xl h-12" />
                      </div>
                      <Button type="submit" disabled={updateProfileMutation.isPending} className="w-full bg-primary text-primary-foreground font-bold rounded-xl h-12 uppercase tracking-wider mt-4">
                        {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle className="text-xl font-display uppercase tracking-tight">My Courses</CardTitle>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search courses..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-background border-border rounded-xl h-10 text-xs"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {enrollmentsLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center p-6 bg-muted/50 border border-border rounded-2xl animate-pulse">
                        <div className="w-14 h-14 bg-muted rounded-xl mr-5"></div>
                        <div className="space-y-2 flex-grow">
                          <div className="h-5 bg-muted rounded w-1/3"></div>
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                        </div>
                        <div className="w-16 h-6 bg-muted rounded-full"></div>
                      </div>
                    ))}
                  </div>
                ) : enrollments.length > 0 ? (
                  <div className="space-y-4">
                    {enrollments.filter((e: any) => (e.courses?.title || '').toLowerCase().includes(searchTerm.toLowerCase())).map((enrollment: any) => (
                      <div key={enrollment.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 bg-muted/50 border border-border rounded-2xl hover:bg-accent/50 transition-all group gap-4">
                        <div className="flex items-center space-x-5">
                          <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <GraduationCap className="w-8 h-8" />
                          </div>
                          <div>
                            <h4 className="font-bold text-xl font-display uppercase tracking-tight text-foreground">{enrollment.courses?.title}</h4>
                            <p className="text-sm text-muted-foreground font-light mt-1">Enrolled on: {new Date(enrollment.enrolled_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <Badge className={`${enrollment.status === 'active' ? 'bg-cyan text-black' : 'bg-muted text-muted-foreground border border-border'} rounded-full px-4 py-1 text-xs font-bold uppercase tracking-widest`}>
                            {enrollment.status}
                          </Badge>
                          {enrollment.status === 'active' && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="sm" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground rounded-xl text-xs font-bold uppercase tracking-widest">
                                  <Video className="w-4 h-4 mr-2" /> LMS
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-card border-border sm:max-w-[600px] rounded-3xl">
                                <DialogHeader>
                                  <DialogTitle className="font-display uppercase text-2xl tracking-tight">Learning Hub: {enrollment.courses?.title}</DialogTitle>
                                </DialogHeader>
                                <div className="mt-6">
                                  <CourseLmsView courseId={enrollment.course_id} />
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
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
