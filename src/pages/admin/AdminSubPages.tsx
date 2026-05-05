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
    setLoading(true);
    const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
    if (error) toast.error(error.message);
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
    if (!confirm('Are you sure?')) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) toast.error(error.message);
    else fetchCourses();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, close: () => void) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      price: parseFloat(formData.get('price') as string),
      is_active: formData.get('is_active') === 'true',
      description: formData.get('description'),
    };

    const { error } = editingCourse 
      ? await supabase.from('courses').update(payload).eq('id', editingCourse.id)
      : await supabase.from('courses').insert([payload]);

    if (error) toast.error(error.message);
    else {
      toast.success('Saved');
      close();
      setEditingCourse(null);
      fetchCourses();
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Loading courses...</div>;

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6 flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-display uppercase">Manage Courses</CardTitle>
        <MorphingPopover>
          <MorphingPopoverTrigger asChild>
            <Button className="bg-primary text-primary-foreground font-bold h-10 rounded-xl px-6 uppercase tracking-widest transition-all">
              <Plus className="w-4 h-4 mr-2" /> Add Course
            </Button>
          </MorphingPopoverTrigger>
          <MorphingPopoverContent className="bg-popover border-border text-popover-foreground sm:max-w-[500px] rounded-3xl p-6">
            {({ close }: { close: () => void }) => (
              <form onSubmit={(e) => handleSubmit(e, close)} className="space-y-6">
                <h3 className="text-xl font-display uppercase mb-4">{editingCourse ? 'Edit' : 'Add'} Course</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Title</Label>
                    <Input name="title" defaultValue={editingCourse?.title} required className="bg-background border-border rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Slug</Label>
                    <Input name="slug" defaultValue={editingCourse?.slug} required className="bg-background border-border rounded-xl" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Price (₹)</Label>
                    <Input name="price" type="number" defaultValue={editingCourse?.price} required className="bg-background border-border rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Status</Label>
                    <Select name="is_active" defaultValue={editingCourse?.is_active?.toString() || 'true'}>
                      <SelectTrigger className="bg-background border-border rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Description</Label>
                  <Textarea name="description" defaultValue={editingCourse?.description} className="bg-background border-border rounded-xl h-24" />
                </div>
                <Button type="submit" className="bg-primary text-primary-foreground w-full rounded-xl font-bold uppercase h-12 shadow-lg shadow-primary/20">
                  Save Changes
                </Button>
              </form>
            )}
          </MorphingPopoverContent>
        </MorphingPopover>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Title</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Price</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.map((course) => (
              <TableRow key={course.id} className="border-border hover:bg-accent/50">
                <TableCell className="text-foreground font-medium">{course.title}</TableCell>
                <TableCell className="text-muted-foreground">₹{course.price}</TableCell>
                <TableCell>
                  <Badge className={cn("rounded-full", course.is_active ? "bg-primary/20 text-primary border-primary/20" : "bg-muted text-muted-foreground")}>
                    {course.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingCourse(course); }} className="h-8 px-3 text-[10px] font-bold uppercase text-primary">
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(course.id)} className="h-8 px-3 text-[10px] font-bold uppercase text-destructive">
                    <Trash2 className="w-3 h-3 mr-1" /> Delete
                  </Button>
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
    const fetch = async () => {
      const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false });
      setStudents(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="p-20 text-center">Loading students...</div>;

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6">
        <CardTitle className="text-2xl font-display uppercase">Students</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Name</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Email</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id} className="border-border hover:bg-accent/50">
                <TableCell className="font-medium text-foreground">{student.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{student.email}</TableCell>
                <TableCell className="text-right text-muted-foreground">{new Date(student.created_at).toLocaleDateString()}</TableCell>
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

  const fetch = async () => {
    const { data } = await supabase.from('enrollments').select('*, students(*), courses(*)').order('enrolled_at', { ascending: false });
    setEnrollments(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('enrollments').update({ status }).eq('id', id);
    fetch();
  };

  if (loading) return <div className="p-20 text-center">Loading enrollments...</div>;

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6">
        <CardTitle className="text-2xl font-display uppercase">Enrollments</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Student</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Course</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {enrollments.map((enr) => (
              <TableRow key={enr.id} className="border-border hover:bg-accent/50">
                <TableCell className="text-foreground">{enr.students?.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{enr.courses?.title}</TableCell>
                <TableCell className="text-right">
                  <Select onValueChange={(val) => updateStatus(enr.id, val)} defaultValue={enr.status}>
                    <SelectTrigger className="w-[120px] ml-auto bg-background h-8 text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
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

  const fetch = async () => {
    const { data } = await supabase.from('internship_applications').select('*').order('submitted_at', { ascending: false });
    setApps(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('internship_applications').update({ status }).eq('id', id);
    fetch();
  };

  if (loading) return <div className="p-20 text-center">Loading applications...</div>;

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6">
        <CardTitle className="text-2xl font-display uppercase">Internship Apps</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Name</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Domain</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apps.map((app) => (
              <TableRow key={app.id} className="border-border hover:bg-accent/50">
                <TableCell className="text-foreground">{app.full_name}</TableCell>
                <TableCell className="text-muted-foreground">{app.preferred_domain}</TableCell>
                <TableCell className="text-right">
                  <Select onValueChange={(val) => updateStatus(app.id, val)} defaultValue={app.status}>
                    <SelectTrigger className="w-[120px] ml-auto bg-background h-8 text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="pending">Pending</SelectItem>
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
    const fetch = async () => {
      const { data } = await supabase.from('contact_submissions').select('*').order('submitted_at', { ascending: false });
      setContacts(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  if (loading) return <div className="p-20 text-center">Loading messages...</div>;

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6">
        <CardTitle className="text-2xl font-display uppercase">Messages</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Name</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Subject</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id} className="border-border">
                <TableCell className="text-foreground font-medium">{contact.name}</TableCell>
                <TableCell className="text-muted-foreground">{contact.subject}</TableCell>
                <TableCell className="text-right text-muted-foreground">{new Date(contact.submitted_at).toLocaleDateString()}</TableCell>
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

  const fetch = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('site_stats').select('*');
      if (error) throw error;
      setStats(data || []);
    } catch (err: any) {
      toast.error('Error fetching stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleUpdate = async (key: string, value: string, suffix: string) => {
    try {
      const { error } = await supabase.from('site_stats').update({ 
        value: parseInt(value),
        suffix: suffix
      }).eq('key', key);
      
      if (error) throw error;
      toast.success('Updated');
      fetch();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse">Loading stats...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display uppercase tracking-tight text-foreground">Site Statistics</h2>
        <Button variant="outline" size="sm" className="border-border rounded-xl" onClick={fetch}>Refresh</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {stats.map((s) => (
          <Card key={s.key} className="bg-card border-border rounded-3xl shadow-xl overflow-hidden">
            <CardHeader className="bg-primary/5 border-b border-border pb-4">
              <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary">{s.label}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Value</label>
                  <Input 
                    type="number" 
                    id={`val-${s.key}`}
                    defaultValue={s.value} 
                    className="bg-background border-border rounded-xl h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground">Suffix (e.g. +)</label>
                  <Input 
                    id={`suf-${s.key}`}
                    defaultValue={s.suffix} 
                    className="bg-background border-border rounded-xl h-12"
                  />
                </div>
              </div>
              <Button 
                className="w-full mt-6 bg-primary text-primary-foreground font-bold rounded-xl h-12"
                onClick={() => {
                  const val = (document.getElementById(`val-${s.key}`) as HTMLInputElement).value;
                  const suf = (document.getElementById(`suf-${s.key}`) as HTMLInputElement).value;
                  handleUpdate(s.key, val, suf);
                }}
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const TeamManager = () => {
  const [team, setTeam] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<any>(null);

  const fetch = async () => {
    const { data } = await supabase.from('team_members').select('*').order('display_order', { ascending: true });
    setTeam(data || []);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await supabase.from('team_members').delete().eq('id', id);
    fetch();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, close: () => void) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get('name'),
      designation: formData.get('designation'),
      display_order: parseInt(formData.get('display_order') as string),
      is_active: formData.get('is_active') === 'true',
    };

    const { error } = editingMember
      ? await supabase.from('team_members').update(payload).eq('id', editingMember.id)
      : await supabase.from('team_members').insert([payload]);

    if (error) toast.error(error.message);
    else {
      toast.success('Saved');
      close();
      setEditingMember(null);
      fetch();
    }
  };

  if (loading) return <div className="p-20 text-center">Loading team...</div>;

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden">
      <CardHeader className="border-b border-border pb-6 flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-display uppercase">Manage Team</CardTitle>
        <MorphingPopover>
          <MorphingPopoverTrigger asChild>
            <Button className="bg-primary text-primary-foreground font-bold h-10 rounded-xl px-6 uppercase tracking-widest transition-all">
              <UserPlus className="w-4 h-4 mr-2" /> Add Member
            </Button>
          </MorphingPopoverTrigger>
          <MorphingPopoverContent className="bg-popover border-border text-popover-foreground sm:max-w-[400px] rounded-3xl p-6">
            {({ close }: { close: () => void }) => (
              <form onSubmit={(e) => handleSubmit(e, close)} className="space-y-6">
                <h3 className="text-xl font-display uppercase mb-4">{editingMember ? 'Edit' : 'Add'} Member</h3>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Name</Label>
                  <Input name="name" defaultValue={editingMember?.name} required className="bg-background border-border rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Designation</Label>
                  <Input name="designation" defaultValue={editingMember?.designation} required className="bg-background border-border rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Order</Label>
                    <Input name="display_order" type="number" defaultValue={editingMember?.display_order || (team.length + 1)} required className="bg-background border-border rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Status</Label>
                    <Select name="is_active" defaultValue={editingMember?.is_active?.toString() || 'true'}>
                      <SelectTrigger className="bg-background border-border rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        <SelectItem value="true">Active</SelectItem>
                        <SelectItem value="false">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" className="bg-primary text-primary-foreground w-full rounded-xl font-bold h-12 shadow-lg shadow-primary/20">
                  Save Changes
                </Button>
              </form>
            )}
          </MorphingPopoverContent>
        </MorphingPopover>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Name</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Designation</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {team.map((m) => (
              <TableRow key={m.id} className="border-border">
                <TableCell className="text-foreground font-medium">{m.name}</TableCell>
                <TableCell className="text-muted-foreground">{m.designation}</TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingMember(m); }} className="h-8 text-primary uppercase text-[10px] font-bold">Edit</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)} className="h-8 text-destructive uppercase text-[10px] font-bold">Delete</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
