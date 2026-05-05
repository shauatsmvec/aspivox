import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Check, 
  X as CloseIcon,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { MorphingPopover, MorphingPopoverTrigger, MorphingPopoverContent } from "@/components/ui/morphing-popover";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const CoursesManager = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  const fetchCourses = async () => {
    const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    setCourses(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('courses').update({ is_active: !current }).eq('id', id);
    if (error) toast.error(error.message);
    else fetchCourses();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Course deleted');
      fetchCourses();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, close: () => void) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      price: parseFloat(formData.get('price') as string),
      is_active: formData.get('is_active') === 'true',
      description: formData.get('description'),
    };

    let error;
    if (editingCourse) {
      const { error: err } = await supabase.from('courses').update(data).eq('id', editingCourse.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('courses').insert([data]);
      error = err;
    }

    if (error) toast.error(error.message);
    else {
      toast.success(editingCourse ? 'Course updated' : 'Course added');
      close();
      setEditingCourse(null);
      fetchCourses();
    }
  };

  if (loading) return <div className="text-gray-500 font-light text-center py-20">Loading courses...</div>;

  return (
    <Card className="bg-card border-border text-foreground rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6 flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-display uppercase tracking-tight">Manage Courses</CardTitle>
        <MorphingPopover>
          <MorphingPopoverTrigger asChild>
            <Button className="bg-primary text-primary-foreground font-bold h-10 rounded-xl px-6 text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
              <Plus className="w-4 h-4 mr-2" /> Add New Course
            </Button>
          </MorphingPopoverTrigger>
          <MorphingPopoverContent className="bg-popover border-border text-popover-foreground sm:max-w-[500px] rounded-3xl p-6">
            {({ close }: { close: () => void }) => (
              <>
                <h3 className="text-xl font-display uppercase mb-4">{editingCourse ? 'Edit Course' : 'Add New Course'}</h3>
                <form onSubmit={(e) => handleSubmit(e, close)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Title</Label>
                      <Input name="title" defaultValue={editingCourse?.title} required className="bg-background border-border rounded-xl text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Slug (URL)</Label>
                      <Input name="slug" defaultValue={editingCourse?.slug} required className="bg-background border-border rounded-xl text-sm" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Price (₹)</Label>
                      <Input name="price" type="number" defaultValue={editingCourse?.price} required className="bg-background border-border rounded-xl text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Status</Label>
                      <Select name="is_active" defaultValue={editingCourse?.is_active?.toString() || 'true'}>
                        <SelectTrigger className="bg-background border-border rounded-xl text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Description</Label>
                    <Textarea name="description" defaultValue={editingCourse?.description} className="bg-background border-border rounded-xl text-sm h-24" />
                  </div>
                  <Button type="submit" className="bg-primary text-primary-foreground w-full rounded-xl font-bold uppercase tracking-widest text-xs h-12 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                    {editingCourse ? 'Save Changes' : 'Create Course'}
                  </Button>
                </form>
              </>
            )}
          </MorphingPopoverContent>
        </MorphingPopover>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent text-left">
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Title</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Price</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Status</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id} className="border-border hover:bg-accent/50 transition-colors">
                <TableCell className="text-foreground font-medium">{course.title}</TableCell>
                <TableCell className="text-muted-foreground">₹{course.price}</TableCell>
                <TableCell>
                  <Badge className={cn(
                    "rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                    course.is_active ? "bg-cyan text-black" : "bg-muted text-muted-foreground"
                  )}>
                    {course.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => toggleActive(course.id, course.is_active)} className="h-8 w-8 p-0 text-cyan hover:bg-accent/50">
                      <div className={cn("w-2 h-2 rounded-full", course.is_active ? "bg-cyan" : "bg-muted-foreground")} />
                    </Button>
                    <MorphingPopover>
                      <MorphingPopoverTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setEditingCourse(course)} className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-accent/50">
                          <Pencil className="w-3 h-3 mr-1" /> Edit
                        </Button>
                      </MorphingPopoverTrigger>
                      <MorphingPopoverContent className="bg-popover border-border text-popover-foreground sm:max-w-[500px] rounded-3xl p-6">
                        {({ close }: { close: () => void }) => (
                          <>
                            <h3 className="text-xl font-display uppercase mb-4">Edit Course</h3>
                            <form onSubmit={(e) => handleSubmit(e, close)} className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Title</Label>
                                  <Input name="title" defaultValue={editingCourse?.title} required className="bg-background border-border rounded-xl text-sm" />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Slug (URL)</Label>
                                  <Input name="slug" defaultValue={editingCourse?.slug} required className="bg-background border-border rounded-xl text-sm" />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Price (₹)</Label>
                                  <Input name="price" type="number" defaultValue={editingCourse?.price} required className="bg-background border-border rounded-xl text-sm" />
                                </div>
                                <div className="space-y-2">
                                  <Label className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Status</Label>
                                  <Select name="is_active" defaultValue={editingCourse?.is_active?.toString() || 'true'}>
                                    <SelectTrigger className="bg-background border-border rounded-xl text-sm">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-popover border-border text-popover-foreground">
                                      <SelectItem value="true">Active</SelectItem>
                                      <SelectItem value="false">Inactive</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Description</Label>
                                <Textarea name="description" defaultValue={editingCourse?.description} className="bg-background border-border rounded-xl text-sm h-24" />
                              </div>
                              <Button type="submit" className="bg-primary text-primary-foreground w-full rounded-xl font-bold uppercase tracking-widest text-xs h-12 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                                Save Changes
                              </Button>
                            </form>
                          </>
                        )}
                      </MorphingPopoverContent>
                    </MorphingPopover>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(course.id)} className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};


export const StudentsList = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false });
      setStudents(data || []);
      setLoading(false);
    };
    fetchStudents();
  }, []);

  if (loading) return <div className="text-muted-foreground font-light">Loading students...</div>;

  return (
    <Card className="bg-card border-border text-foreground rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6">
        <CardTitle className="text-2xl font-display uppercase tracking-tight">Registered Students</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Name</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Email</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">College</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Phone</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} className="border-border hover:bg-accent/50 transition-colors">
                <TableCell className="font-medium text-foreground">{student.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{student.email}</TableCell>
                <TableCell className="text-muted-foreground">{student.college}</TableCell>
                <TableCell className="text-muted-foreground">{student.phone}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(student.created_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const EnrollmentsList = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEnrollments = async () => {
    const { data } = await supabase.from('enrollments').select('*, students(*), courses(*)').order('enrolled_at', { ascending: false });
    setEnrollments(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('enrollments').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Status updated');
      fetchEnrollments();
    }
  };

  if (loading) return <div className="text-muted-foreground font-light">Loading enrollments...</div>;

  return (
    <Card className="bg-card border-border text-foreground rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6">
        <CardTitle className="text-2xl font-display uppercase tracking-tight">Course Enrollments</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Student</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Course</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Status</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Date</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((enr) => (
              <TableRow key={enr.id} className="border-border hover:bg-accent/50 transition-colors">
                <TableCell className="text-foreground font-medium">{enr.students?.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{enr.courses?.title}</TableCell>
                <TableCell>
                  <Badge className={cn(
                    "rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                    enr.status === 'active' ? "bg-cyan text-black" : "bg-muted text-muted-foreground"
                  )}>{enr.status}</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{new Date(enr.enrolled_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Select onValueChange={(val) => updateStatus(enr.id, val)} defaultValue={enr.status}>
                    <SelectTrigger className="w-[120px] ml-auto bg-background border-border text-foreground rounded-xl h-9 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const ApplicationsList = () => {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchApps = async () => {
    const { data } = await supabase.from('internship_applications').select('*').order('submitted_at', { ascending: false });
    setApps(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('internship_applications').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Status updated');
      fetchApps();
    }
  };

  if (loading) return <div className="text-muted-foreground font-light">Loading applications...</div>;

  return (
    <Card className="bg-card border-border text-foreground rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6">
        <CardTitle className="text-2xl font-display uppercase tracking-tight">Internship Applications</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Name</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Domain</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Duration</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Status</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apps.map((app) => (
              <TableRow key={app.id} className="border-border hover:bg-accent/50 transition-colors">
                <TableCell className="text-foreground font-medium">{app.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{app.preferred_domain}</TableCell>
                <TableCell className="text-muted-foreground">{app.duration} Days</TableCell>
                <TableCell>
                  <Badge className={cn(
                    "rounded-full px-3 py-0.5 text-[10px] font-bold uppercase tracking-widest",
                    app.status === 'accepted' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>{app.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Select onValueChange={(val) => updateStatus(app.id, val)} defaultValue={app.status}>
                    <SelectTrigger className="w-[120px] ml-auto bg-background border-border text-foreground rounded-xl h-9 text-xs">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border text-popover-foreground">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="reviewing">Reviewing</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const ContactsList = () => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContacts = async () => {
      const { data } = await supabase.from('contact_submissions').select('*').order('submitted_at', { ascending: false });
      setContacts(data || []);
      setLoading(false);
    };
    fetchContacts();
  }, []);

  if (loading) return <div className="text-muted-foreground font-light">Loading messages...</div>;

  return (
    <Card className="bg-card border-border text-foreground rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6">
        <CardTitle className="text-2xl font-display uppercase tracking-tight">Contact Messages</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Name</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Email</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Subject</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Message</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id} className="border-border hover:bg-accent/50 transition-colors">
                <TableCell className="text-foreground font-medium">{contact.name}</TableCell>
                <TableCell className="text-muted-foreground">{contact.email}</TableCell>
                <TableCell className="text-muted-foreground">{contact.subject}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground">{contact.message}</TableCell>
                <TableCell className="text-muted-foreground">{new Date(contact.submitted_at).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const StatsManager = () => {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    const { data } = await supabase.from('site_stats').select('*');
    setStats(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleUpdate = async (key: string, value: string) => {
    const { error } = await supabase.from('site_stats').update({ value: parseInt(value) }).eq('key', key);
    if (error) toast.error(error.message);
    else toast.success('Stat updated');
  };

  if (loading) return <div className="text-muted-foreground font-light">Loading stats...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {stats.map((s) => (
        <Card key={s.key} className="bg-card border-border text-foreground rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{s.label}</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Input 
              type="number" 
              defaultValue={s.value} 
              onBlur={(e) => handleUpdate(s.key, e.target.value)}
              className="bg-background border-border text-foreground rounded-xl h-12 focus:ring-primary"
            />
            <Button variant="outline" className="border-border hover:bg-accent/50 h-12 px-8 rounded-xl font-bold uppercase tracking-widest text-[10px]">Update</Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export const TeamManager = () => {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<any>(null);

  const fetchTeam = async () => {
    const { data } = await supabase.from('team_members').select('*').order('display_order', { ascending: true });
    setTeam(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team member?')) return;
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) toast.error(error.message);
    else {
      toast.success('Member deleted');
      fetchTeam();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, close: () => void) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      designation: formData.get('designation'),
      display_order: parseInt(formData.get('display_order') as string),
      is_active: formData.get('is_active') === 'true',
    };

    let error;
    if (editingMember) {
      const { error: err } = await supabase.from('team_members').update(data).eq('id', editingMember.id);
      error = err;
    } else {
      const { error: err } = await supabase.from('team_members').insert([data]);
      error = err;
    }

    if (error) toast.error(error.message);
    else {
      toast.success(editingMember ? 'Member updated' : 'Member added');
      close();
      setEditingMember(null);
      fetchTeam();
    }
  };

  if (loading) return <div className="text-muted-foreground font-light text-center py-20">Loading team...</div>;

  return (
    <Card className="bg-card border-border text-foreground rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6 flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-display uppercase tracking-tight">Manage Team</CardTitle>
        <MorphingPopover>
          <MorphingPopoverTrigger asChild>
            <Button className="bg-primary text-primary-foreground font-bold h-10 rounded-xl px-6 text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-all">
              <UserPlus className="w-4 h-4 mr-2" /> Add Member
            </Button>
          </MorphingPopoverTrigger>
          <MorphingPopoverContent className="bg-popover border-border text-popover-foreground sm:max-w-[400px] rounded-3xl p-6">
            {({ close }: { close: () => void }) => (
              <>
                <h3 className="text-xl font-display uppercase mb-4">{editingMember ? 'Edit Member' : 'Add Member'}</h3>
                <form onSubmit={(e) => handleSubmit(e, close)} className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Full Name</Label>
                    <Input name="name" defaultValue={editingMember?.name} required className="bg-background border-border rounded-xl text-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Designation</Label>
                    <Input name="designation" defaultValue={editingMember?.designation} required className="bg-background border-border rounded-xl text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Display Order</Label>
                      <Input name="display_order" type="number" defaultValue={editingMember?.display_order || (team.length + 1)} required className="bg-background border-border rounded-xl text-sm" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Status</Label>
                      <Select name="is_active" defaultValue={editingMember?.is_active?.toString() || 'true'}>
                        <SelectTrigger className="bg-background border-border rounded-xl text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground">
                          <SelectItem value="true">Active</SelectItem>
                          <SelectItem value="false">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="bg-primary text-primary-foreground w-full rounded-xl font-bold uppercase tracking-widest text-xs h-12 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                    {editingMember ? 'Save Changes' : 'Add Member'}
                  </Button>
                </form>
              </>
            )}
          </MorphingPopoverContent>
        </MorphingPopover>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent text-left">
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Order</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Name</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Designation</TableHead>
              <TableHead className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {team.map((member) => (
              <TableRow key={member.id} className="border-border hover:bg-accent/50 transition-colors">
                <TableCell className="text-muted-foreground font-mono text-[10px]">{member.display_order}</TableCell>
                <TableCell className="text-foreground font-medium">{member.name}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{member.designation}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <MorphingPopover>
                      <MorphingPopoverTrigger asChild>
                        <Button variant="ghost" size="sm" onClick={() => setEditingMember(member)} className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-accent/50">
                          <Pencil className="w-3 h-3 mr-1" /> Edit
                        </Button>
                      </MorphingPopoverTrigger>
                      <MorphingPopoverContent className="bg-popover border-border text-popover-foreground sm:max-w-[400px] rounded-3xl p-6">
                        <h3 className="text-xl font-display uppercase mb-4">Edit Member</h3>
                        {({ close }: { close: () => void }) => (
                          <form onSubmit={(e) => handleSubmit(e, close)} className="space-y-6">
                            <div className="space-y-2">
                              <Label className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Full Name</Label>
                              <Input name="name" defaultValue={editingMember?.name} required className="bg-background border-border rounded-xl text-sm" />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Designation</Label>
                              <Input name="designation" defaultValue={editingMember?.designation} required className="bg-background border-border rounded-xl text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Display Order</Label>
                                <Input name="display_order" type="number" defaultValue={editingMember?.display_order || (team.length + 1)} required className="bg-background border-border rounded-xl text-sm" />
                              </div>
                              <div className="space-y-2">
                                <Label className="text-muted-foreground uppercase tracking-widest text-[10px] font-bold">Status</Label>
                                <Select name="is_active" defaultValue={editingMember?.is_active?.toString() || 'true'}>
                                  <SelectTrigger className="bg-background border-border rounded-xl text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-popover border-border text-popover-foreground">
                                    <SelectItem value="true">Active</SelectItem>
                                    <SelectItem value="false">Inactive</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <Button type="submit" className="bg-primary text-primary-foreground w-full rounded-xl font-bold uppercase tracking-widest text-xs h-12 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                              Save Changes
                            </Button>
                          </form>
                        )}
                      </MorphingPopoverContent>
                    </MorphingPopover>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(member.id)} className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
