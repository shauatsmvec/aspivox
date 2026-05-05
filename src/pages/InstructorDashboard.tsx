import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
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
      const { error } = await supabase.from('lms_classes').update(payload).eq('id', editingClass.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Class details updated');
      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ['instructor_classes'] });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const toggleStatus = async (id: string, current: boolean) => {
    const { error } = await supabase.from('lms_classes').update({ is_completed: !current }).eq('id', id);
    if (error) toast.error(error.message);
    else queryClient.invalidateQueries({ queryKey: ['instructor_classes'] });
  };

  const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateMutation.mutate({
      meeting_link: formData.get('meeting_link'),
      notes_link: formData.get('notes_link'),
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
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
              <LayoutDashboard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-display uppercase">Instructor Portal</h1>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{instructor?.full_name}</p>
            </div>
          </div>
          <Button onClick={() => signOut()} variant="ghost" className="rounded-xl gap-2 hover:bg-destructive/10 hover:text-destructive">
            <LogOut className="w-4 h-4" /> Sign Out
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

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h3 className="text-xl font-bold font-display uppercase flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" /> Schedule & Management
          </h3>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search assigned classes..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card border-border rounded-xl h-12 shadow-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {classes.filter((cls: any) => 
            (cls.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
            (cls.courses?.title || '').toLowerCase().includes(searchTerm.toLowerCase())
          ).map((cls: any) => (
            <Card key={cls.id} className="bg-card border-border rounded-3xl overflow-hidden shadow-xl hover:border-primary/20 transition-all group">
              <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={cls.is_completed ? "secondary" : "default"} className="rounded-full px-3 text-[9px] uppercase tracking-tighter">
                      {cls.is_completed ? "Completed" : "Upcoming"}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">{new Date(cls.scheduled_at).toLocaleString()}</span>
                  </div>
                  <h4 className="text-xl font-bold font-display uppercase text-foreground">{cls.title}</h4>
                  <p className="text-sm text-primary font-bold uppercase tracking-widest">{cls.courses?.title}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="outline" 
                    className={cn("rounded-xl gap-2", cls.is_completed ? "border-green-500/50 text-green-500" : "border-border text-muted-foreground")}
                    onClick={() => toggleStatus(cls.id, cls.is_completed)}
                  >
                    <CheckCircle2 className="w-4 h-4" /> {cls.is_completed ? "Completed" : "Mark Done"}
                  </Button>
                  
                  <Button 
                    variant="default" 
                    className="rounded-xl gap-2 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20"
                    onClick={() => { setEditingClass(cls); setIsEditOpen(true); }}
                  >
                    <Video className="w-4 h-4" /> Manage Links
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {classes.length === 0 && (
            <div className="p-20 text-center bg-card border border-dashed border-border rounded-[3rem]">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-2xl font-bold font-display uppercase text-muted-foreground">No Classes Assigned</h3>
              <p className="text-muted-foreground mt-2 font-light">You'll see your assigned sessions here once an admin schedules them.</p>
            </div>
          )}
        </div>
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="bg-card border-border sm:max-w-[500px] rounded-[2rem] p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display uppercase mb-2">Class Links</DialogTitle>
            <CardDescription>Update the live meeting link and shared resources for this session.</CardDescription>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-6 mt-6">
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
