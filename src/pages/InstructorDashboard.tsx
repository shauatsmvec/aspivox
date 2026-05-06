import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { supabase, logActivity } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Video, FileText, CheckCircle2, Clock, Calendar, LogOut, LayoutDashboard, Search } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const InstructorDashboard = () => {
  const { user, signOut } = useAuth();
  const queryClient = useQueryClient();
  const [editingClass, setEditingClass] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed'>('upcoming');

  // Fetch instructor details
  const { data: instructor, isLoading: isInstructorLoading } = useQuery({
    queryKey: ['instructor_profile', user?.email],
    queryFn: async () => {
      const { data, error } = await supabase.from('instructors').select('*').eq('email', user?.email).single();
      if (error) return null;
      return data;
    },
    enabled: !!user?.email
  });

  // Fetch assigned classes
  const { data: classes = [], isLoading: loading } = useQuery({
    queryKey: ['instructor_classes', instructor?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('lms_classes').select('*, courses(title)').eq('instructor_id', instructor?.id).order('scheduled_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!instructor?.id
  });

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { data, error } = await supabase.from('lms_classes').update(payload).eq('id', editingClass.id).select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Update failed: You might not have database permissions to edit this class.");
    },
    onSuccess: () => {
      toast.success('Class details updated');
      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ['instructor_classes'] });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, current, title }: { id: string, current: boolean, title: string }) => {
      const { data, error } = await supabase.from('lms_classes').update({ is_completed: !current }).eq('id', id).select();
      if (error) throw error;
      if (!data || data.length === 0) throw new Error("Permission denied or class not found.");
      return { id, current, title };
    },
    onSuccess: ({ current, title }) => {
      toast.success(`Class marked as ${!current ? 'completed' : 'upcoming'}`);
      logActivity('toggle_class_status', `Marked class "${title}" as ${!current ? 'completed' : 'upcoming'}`, user?.email);
      queryClient.invalidateQueries({ queryKey: ['instructor_classes'] });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let meetingLink = formData.get('meeting_link')?.toString().trim();
    let notesLink = formData.get('notes_link')?.toString().trim();
    
    if (meetingLink && !meetingLink.startsWith('http')) meetingLink = 'https://' + meetingLink;
    if (notesLink && !notesLink.startsWith('http')) notesLink = 'https://' + notesLink;

    updateMutation.mutate({
      meeting_link: meetingLink || null,
      notes_link: notesLink || null,
    });
  };

  if (loading || isInstructorLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Card className="max-w-md bg-card border-border p-8 text-center rounded-3xl shadow-2xl">
          <CardTitle className="text-2xl font-display uppercase text-destructive mb-4">Access Denied</CardTitle>
          <CardDescription className="mb-6">
            You are not registered as an instructor. Please contact the administrator.
          </CardDescription>
          <Button onClick={() => signOut()} className="w-full rounded-xl">Sign Out</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <div className="bg-card border-b border-border py-8 mb-10 sticky top-0 z-30 backdrop-blur-xl bg-card/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold font-display uppercase truncate">Instructor Portal</h1>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest truncate">{instructor?.full_name}</p>
            </div>
          </div>
          <Button onClick={() => signOut()} variant="ghost" className="rounded-xl gap-2 hover:bg-destructive/10 hover:text-destructive px-2 sm:px-4">
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Assigned Classes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-display">{classes.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Ongoing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-display text-primary">{classes.filter((c: any) => !c.is_completed).length}</div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold font-display text-green-500">{classes.filter((c: any) => c.is_completed).length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 border-b border-border pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <h3 className="text-lg sm:text-xl font-bold font-display uppercase flex items-center gap-2 mr-4">
              <Calendar className="w-5 h-5 text-primary" /> Schedule & Management
            </h3>
            <div className="flex bg-muted/30 p-1 rounded-xl w-full sm:w-auto">
              <button 
                onClick={() => setActiveTab('upcoming')}
                className={cn("flex-1 sm:flex-none px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all", activeTab === 'upcoming' ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                Upcoming
              </button>
              <button 
                onClick={() => setActiveTab('completed')}
                className={cn("flex-1 sm:flex-none px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all", activeTab === 'completed' ? "bg-green-500 text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                Completed
              </button>
            </div>
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search assigned classes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border rounded-xl h-12 shadow-sm"
            />
          </div>
        </div>

        <div className="space-y-10">
          {(() => {
            const filteredClasses = classes.filter((cls: any) => {
              const matchesSearch = (cls.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                                    (cls.courses?.title || '').toLowerCase().includes(searchTerm.toLowerCase());
              const matchesTab = activeTab === 'upcoming' ? !cls.is_completed : cls.is_completed;
              return matchesSearch && matchesTab;
            });

            const groupedClasses = filteredClasses.reduce((acc: any, cls: any) => {
              const courseTitle = cls.courses?.title || 'Unknown Course';
              if (!acc[courseTitle]) acc[courseTitle] = [];
              acc[courseTitle].push(cls);
              return acc;
            }, {});

            if (Object.keys(groupedClasses).length === 0) {
              return (
                <div className="p-20 text-center bg-card border border-dashed border-border rounded-[3rem]">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold font-display uppercase text-muted-foreground">No Classes Found</h3>
                  <p className="text-muted-foreground mt-2 font-light">
                    {activeTab === 'upcoming' ? "You don't have any upcoming sessions scheduled." : "You haven't completed any sessions yet."}
                  </p>
                </div>
              );
            }

            return Object.entries(groupedClasses).map(([courseTitle, courseClasses]: [string, any]) => (
              <div key={courseTitle} className="space-y-4">
                <h4 className="text-xl font-display uppercase tracking-tight text-primary border-b border-border pb-2 flex items-center justify-between">
                  {courseTitle}
                  <Badge variant="outline" className="text-muted-foreground text-[10px] tracking-widest">{courseClasses.length} Session{courseClasses.length !== 1 ? 's' : ''}</Badge>
                </h4>
                <div className="grid grid-cols-1 gap-4">
                  {courseClasses.map((cls: any) => (
                    <Card key={cls.id} className="bg-card border-border rounded-2xl overflow-hidden shadow-sm hover:border-primary/20 hover:shadow-md transition-all group">
                      <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded-md">{new Date(cls.scheduled_at).toLocaleString()}</span>
                          </div>
                          <h5 className="text-lg font-bold font-display uppercase text-foreground leading-tight">{cls.title}</h5>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            disabled={statusMutation.isPending}
                            className={cn("rounded-xl gap-2", cls.is_completed ? "border-green-500/50 text-green-500 bg-green-500/5 hover:bg-green-500/10 hover:text-green-600" : "border-border text-muted-foreground hover:bg-muted")}
                            onClick={() => statusMutation.mutate({ id: cls.id, current: cls.is_completed, title: cls.title })}
                          >
                            <CheckCircle2 className={cn("w-4 h-4", statusMutation.isPending && "animate-spin")} /> {cls.is_completed ? "Completed" : "Mark Done"}
                          </Button>
                          
                          <Button 
                            variant="default" 
                            size="sm"
                            className="rounded-xl gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20"
                            onClick={() => { setEditingClass(cls); setIsEditOpen(true); }}
                          >
                            <Video className="w-4 h-4" /> Manage Links
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ));
          })()}
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card border-border sm:max-w-[500px] rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display uppercase mb-2">Class Links</DialogTitle>
            <CardDescription>Update the live meeting link and shared resources for this session.</CardDescription>
          </DialogHeader>
          <form key={editingClass?.id} onSubmit={handleUpdate} className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Meeting Link (Zoom/Meet)</Label>
              <Input name="meeting_link" defaultValue={editingClass?.meeting_link} placeholder="https://zoom.us/j/..." className="bg-background border-border rounded-xl h-12" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Notes/Resources Link (GDrive)</Label>
              <Input name="notes_link" defaultValue={editingClass?.notes_link} placeholder="https://drive.google.com/..." className="bg-background border-border rounded-xl h-12" />
            </div>
            <Button disabled={updateMutation.isPending} type="submit" className="w-full bg-primary text-primary-foreground font-bold h-12 rounded-xl shadow-lg shadow-primary/20 uppercase tracking-widest">
              {updateMutation.isPending ? 'Updating...' : 'Save Details'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstructorDashboard;
