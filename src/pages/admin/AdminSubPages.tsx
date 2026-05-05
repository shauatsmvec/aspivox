import React, { useState } from 'react';
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
  UserPlus,
  Video,
  Search
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MorphingPopover, MorphingPopoverTrigger, MorphingPopoverContent } from "@/components/ui/morphing-popover";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const TableSkeleton = ({ cols }: { cols: number }) => (
  <TableBody>
    {[1, 2, 3, 4, 5].map(i => (
      <TableRow key={i} className="animate-pulse border-border">
        {Array.from({ length: cols }).map((_, j) => (
          <TableCell key={j}><div className="h-4 bg-muted rounded w-full"></div></TableCell>
        ))}
      </TableRow>
    ))}
  </TableBody>
);

export const CourseLmsManager = ({ courseId }: { courseId: string }) => {
  const [editingClass, setEditingClass] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: classes = [], isLoading: loading } = useQuery({
    queryKey: ['admin_lms_classes', courseId],
    queryFn: async () => {
      const { data, error } = await supabase.from('lms_classes').select('*, instructors(full_name)').eq('course_id', courseId).order('scheduled_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const { data: instructors = [] } = useQuery({
    queryKey: ['admin_instructors_list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('instructors').select('id, full_name').order('full_name', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    await supabase.from('lms_classes').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['admin_lms_classes', courseId] });
  };

  const LmsSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    scheduled_at: z.string().min(1, "Schedule time is required"),
    meeting_link: z.string().url("Invalid meeting link URL"),
    notes_link: z.string().url("Invalid notes link URL").optional().or(z.literal("")),
    recording_link: z.string().url("Invalid recording link URL").optional().or(z.literal("")),
    instructor_name: z.string().min(2, "Instructor name is required"),
    instructor_role: z.string().optional(),
    instructor_id: z.string().uuid("Invalid instructor selection").optional().or(z.literal("")),
    is_completed: z.boolean().optional(),
  });

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const dbPayload = {
        ...payload,
        course_id: courseId,
        notes_link: payload.notes_link || null,
        recording_link: payload.recording_link || null,
        instructor_name: payload.instructor_name,
        instructor_role: payload.instructor_role || null,
        instructor_id: payload.instructor_id === "none" ? null : (payload.instructor_id || null),
        is_completed: payload.is_completed || false,
      };

      if (editingClass?.id) {
        return supabase.from('lms_classes').update(dbPayload).eq('id', editingClass.id);
      }
      return supabase.from('lms_classes').insert([dbPayload]);
    },
    onSuccess: (res) => {
      if (res.error) throw res.error;
      toast.success('Saved Class');
      setEditingClass(null);
      queryClient.invalidateQueries({ queryKey: ['admin_lms_classes', courseId] });
    },
    onError: (error: any) => toast.error(error.message)
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawPayload = {
      title: formData.get('title'),
      scheduled_at: formData.get('scheduled_at'),
      meeting_link: formData.get('meeting_link'),
      notes_link: formData.get('notes_link') || "",
      recording_link: formData.get('recording_link') || "",
      instructor_name: formData.get('instructor_name'),
      instructor_role: formData.get('instructor_role'),
      instructor_id: formData.get('instructor_id'),
      is_completed: formData.get('is_completed') === 'true',
    };

    const result = LmsSchema.safeParse(rawPayload);
    if (!result.success) {
      result.error.errors.forEach(err => toast.error(err.message));
      return;
    }

    mutation.mutate(result.data);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold uppercase tracking-wider text-muted-foreground text-xs">Classes List</h3>
        <Button onClick={() => setEditingClass({})} size="sm" className="bg-primary text-primary-foreground font-bold rounded-lg h-9">
          <Plus className="w-4 h-4 mr-2" /> Add Class
        </Button>
      </div>

      {editingClass && (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-muted/50 rounded-2xl border border-border">
          <h4 className="font-bold text-foreground text-sm uppercase">{editingClass.id ? 'Edit Class' : 'New Class'}</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Class Title</Label>
              <Input name="title" defaultValue={editingClass.title} required className="bg-background border-border rounded-lg h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Date & Time</Label>
              <Input name="scheduled_at" type="datetime-local" defaultValue={editingClass.scheduled_at ? new Date(editingClass.scheduled_at).toISOString().slice(0, 16) : ""} required className="bg-background border-border rounded-lg h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Meeting Link</Label>
              <Input name="meeting_link" defaultValue={editingClass.meeting_link} placeholder="https://meet.google.com/..." required className="bg-background border-border rounded-lg h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Notes Link</Label>
              <Input name="notes_link" defaultValue={editingClass.notes_link || ""} placeholder="Optional" className="bg-background border-border rounded-lg h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Recording Link</Label>
              <Input name="recording_link" defaultValue={editingClass.recording_link || ""} placeholder="Optional" className="bg-background border-border rounded-lg h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Assigned Instructor Account</Label>
              <Select name="instructor_id" defaultValue={editingClass.instructor_id}>
                <SelectTrigger className="bg-background border-border rounded-lg h-10">
                  <SelectValue placeholder="Select Instructor Profile" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="none">None / External</SelectItem>
                  {instructors.map((ins: any) => (
                    <SelectItem key={ins.id} value={ins.id}>{ins.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Instructor Name (Display)</Label>
              <Input name="instructor_name" defaultValue={editingClass.instructor_name} required className="bg-background border-border rounded-lg h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Instructor Role (Display)</Label>
              <Input name="instructor_role" defaultValue={editingClass.instructor_role} placeholder="e.g. Lead Developer" className="bg-background border-border rounded-lg h-10" />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-bold uppercase text-muted-foreground">Status</Label>
              <Select name="is_completed" defaultValue={editingClass.is_completed?.toString() || 'false'}>
                <SelectTrigger className="bg-background border-border rounded-lg h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="false">Scheduled / Live</SelectItem>
                  <SelectItem value="true">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setEditingClass(null)} className="h-10 rounded-lg">Cancel</Button>
              <Button disabled={mutation.isPending} type="submit" className="bg-primary text-primary-foreground h-10 rounded-lg font-bold">
                {mutation.isPending ? 'Saving...' : 'Save Class'}
              </Button>
            </div>
          </div>
        </form>
      )}

      <div className="border border-border rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
        <Table>
          <TableHeader className="bg-muted/50 sticky top-0 z-10">
            <TableRow className="border-border">
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Title / Instructor</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Scheduled / Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={3} className="text-center py-8"><div className="animate-pulse">Loading classes...</div></TableCell></TableRow>
            ) : classes.length === 0 ? (
              <TableRow><TableCell colSpan={3} className="text-center py-8 text-muted-foreground">No classes scheduled yet.</TableCell></TableRow>
            ) : (
              classes.map((cls: any) => (
                <TableRow key={cls.id} className="border-border hover:bg-accent/50">
                  <TableCell>
                    <div className="font-medium text-foreground">{cls.title}</div>
                    <div className="text-[10px] text-muted-foreground">
                      {cls.instructor_name} {cls.instructor_role && `(${cls.instructor_role})`}
                      {cls.instructors?.full_name && <Badge variant="outline" className="ml-2 text-[8px] h-3 px-1 border-primary/20 text-primary">Linked</Badge>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-muted-foreground text-sm">{new Date(cls.scheduled_at).toLocaleString()}</div>
                    <Badge variant="outline" className={cn("text-[9px] h-4 mt-1 px-1 uppercase tracking-tighter", cls.is_completed ? "bg-muted text-muted-foreground" : "bg-cyan/10 text-cyan border-cyan/20")}>
                      {cls.is_completed ? 'Completed' : 'Upcoming'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditingClass(cls)} className="h-8 text-primary uppercase text-[10px] font-bold">Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(cls.id)} className="h-8 text-destructive uppercase text-[10px] font-bold">Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export const CoursesManager = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading: loading } = useQuery({
    queryKey: ['admin_courses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const filteredCourses = courses.filter((c: any) => 
    (c.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleActive = async (id: string, current: boolean) => {
    const { error } = await supabase.from('courses').update({ is_active: !current }).eq('id', id);
    if (error) toast.error(error.message);
    else queryClient.invalidateQueries({ queryKey: ['admin_courses'] });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) toast.error(error.message);
    else queryClient.invalidateQueries({ queryKey: ['admin_courses'] });
  };

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingCourse?.id) {
        return supabase.from('courses').update(payload).eq('id', editingCourse.id);
      }
      return supabase.from('courses').insert([payload]);
    },
    onSuccess: (res) => {
      if (res.error) throw res.error;
      toast.success('Saved Course');
      setEditingCourse(null);
      queryClient.invalidateQueries({ queryKey: ['admin_courses'] });
    },
    onError: (error: any) => toast.error(error.message)
  });

  const CourseSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
    price: z.number().min(0, "Price cannot be negative"),
    is_active: z.boolean(),
    description: z.string().optional(),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, close: () => void) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawPayload = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      price: parseInt(formData.get('price') as string),
      is_active: formData.get('is_active') === 'true',
      description: formData.get('description'),
    };

    const result = CourseSchema.safeParse(rawPayload);
    if (!result.success) {
      result.error.errors.forEach(err => toast.error(err.message));
      return;
    }

    mutation.mutate(result.data, {
      onSuccess: () => {
        close();
      }
    });
  };

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
          <CardTitle className="text-2xl font-display uppercase">Courses</CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search courses..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border rounded-xl h-10"
            />
          </div>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCourse(null)} className="bg-primary text-primary-foreground font-bold h-10 rounded-xl px-6 uppercase tracking-widest transition-all">
              <Plus className="w-4 h-4 mr-2" /> Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground sm:max-w-[500px] rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-display uppercase mb-4">{editingCourse?.id ? 'Edit' : 'Add'} Course</DialogTitle>
            </DialogHeader>
            <form key={editingCourse?.id || 'new'} onSubmit={(e) => { e.preventDefault(); handleSubmit(e, () => setIsFormOpen(false)); }} className="space-y-6">
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
              <Button disabled={mutation.isPending} type="submit" className="bg-primary text-primary-foreground w-full rounded-xl font-bold uppercase h-12 shadow-lg shadow-primary/20">
                {mutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
          {loading ? <TableSkeleton cols={4} /> : (
            <TableBody>
              {filteredCourses.map((course: any) => (
                <TableRow key={course.id} className="border-border hover:bg-accent/50">
                  <TableCell className="text-foreground font-medium">{course.title}</TableCell>
                  <TableCell className="text-muted-foreground">₹{course.price}</TableCell>
                  <TableCell>
                    <Badge className={cn("rounded-full cursor-pointer", course.is_active ? "bg-primary/20 text-primary border-primary/20" : "bg-muted text-muted-foreground")} onClick={() => toggleActive(course.id, course.is_active)}>
                      {course.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-bold uppercase text-cyan">
                          <Video className="w-3 h-3 mr-1" /> Classes
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border sm:max-w-[700px] rounded-3xl">
                        <DialogHeader>
                          <DialogTitle className="font-display uppercase text-xl">Manage Classes for {course.title}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4">
                          <CourseLmsManager courseId={course.id} />
                        </div>
                      </DialogContent>
                    </Dialog>
                     <Button variant="ghost" size="sm" onClick={() => { setEditingCourse(course); setIsFormOpen(true); }} className="h-8 px-3 text-[10px] font-bold uppercase text-primary">
                      <Pencil className="w-3 h-3 mr-1" /> Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(course.id)} className="h-8 px-3 text-[10px] font-bold uppercase text-destructive">
                      <Trash2 className="w-3 h-3 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </CardContent>
    </Card>
  );
};


const StudentProfileView = ({ student }: { student: any }) => {
  const { data: enrollments = [], isLoading: eLoading } = useQuery({
    queryKey: ['student_enrollments', student.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('enrollments').select('*, courses(title)').eq('student_id', student.id);
      if (error) throw error;
      return data || [];
    }
  });

  const { data: applications = [], isLoading: aLoading } = useQuery({
    queryKey: ['student_applications', student.id],
    queryFn: async () => {
      const { data, error } = await supabase.from('internship_applications').select('*').eq('email', student.email);
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground">College</Label>
          <div className="text-foreground">{student.college || 'N/A'}</div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground">City</Label>
          <div className="text-foreground">{student.city || 'N/A'}</div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Phone</Label>
          <div className="text-foreground">{student.phone || 'N/A'}</div>
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] font-bold uppercase text-muted-foreground">Joined At</Label>
          <div className="text-foreground">{new Date(student.created_at).toLocaleDateString()}</div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-display uppercase text-sm border-b border-border pb-2">Registered Courses</h4>
        {eLoading ? <div className="h-20 bg-muted animate-pulse rounded-xl"></div> : enrollments.length === 0 ? <p className="text-xs text-muted-foreground">No courses enrolled.</p> : (
          <div className="grid grid-cols-1 gap-2">
            {enrollments.map((e: any) => (
              <div key={e.id} className="p-3 bg-muted/30 rounded-xl flex justify-between items-center border border-border">
                <span className="text-sm font-medium">{e.courses?.title}</span>
                <Badge variant="outline" className="text-[9px]">{e.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h4 className="font-display uppercase text-sm border-b border-border pb-2">Internship Applications</h4>
        {aLoading ? <div className="h-20 bg-muted animate-pulse rounded-xl"></div> : applications.length === 0 ? <p className="text-xs text-muted-foreground">No applications found.</p> : (
          <div className="grid grid-cols-1 gap-2">
            {applications.map((a: any) => (
              <div key={a.id} className="p-3 bg-muted/30 rounded-xl flex justify-between items-center border border-border">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{a.preferred_domain}</span>
                  <span className="text-[9px] text-muted-foreground">{new Date(a.submitted_at).toLocaleDateString()}</span>
                </div>
                <Badge variant="outline" className="text-[9px]">{a.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const StudentsList = () => {
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const { data: students = [], isLoading: loading } = useQuery({
    queryKey: ['admin_students'],
    queryFn: async () => {
      const { data: studentsData, error: sError } = await supabase.from('students').select('*').order('created_at', { ascending: false });
      const { data: instructorsData, error: iError } = await supabase.from('instructors').select('email');
      
      if (sError || iError) throw sError || iError;
      
      const instructorEmails = new Set((instructorsData || []).map(i => i.email));
      return (studentsData || []).filter(s => !instructorEmails.has(s.email));
    }
  });

  const filteredStudents = students.filter((s: any) => 
    (s.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await supabase.from('students').update(payload).eq('id', editingStudent.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Student profile updated');
      setIsEditOpen(false);
      setEditingStudent(null);
      queryClient.invalidateQueries({ queryKey: ['admin_students'] });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!confirm('Are you sure you want to delete this student?')) return;
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Student deleted');
      queryClient.invalidateQueries({ queryKey: ['admin_students'] });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      full_name: formData.get('full_name'),
      college: formData.get('college'),
      city: formData.get('city'),
      phone: formData.get('phone'),
    });
  };

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <CardTitle className="text-2xl font-display uppercase">Students</CardTitle>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search students..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border rounded-xl h-10"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Name</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Email</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? <TableSkeleton cols={3} /> : (
            <TableBody>
              {filteredStudents.map((student: any) => (
                <TableRow key={student.id} className="border-border hover:bg-accent/50">
                  <TableCell className="font-medium text-foreground">{student.full_name}</TableCell>
                  <TableCell className="text-muted-foreground">{student.email}</TableCell>
                   <TableCell className="text-right flex justify-end gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 text-primary uppercase text-[10px] font-bold">
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border sm:max-w-[700px] rounded-3xl">
                        <DialogHeader>
                          <DialogTitle className="font-display uppercase text-xl">Student Profile: {student.full_name}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-6">
                          <StudentProfileView student={student} />
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { setEditingStudent(student); setIsEditOpen(true); }}
                      className="h-8 text-cyan uppercase text-[10px] font-bold"
                    >
                      Edit
                    </Button>
                     <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => deleteMutation.mutate(student.id)}
                      className="h-8 text-destructive uppercase text-[10px] font-bold"
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="bg-card border-border sm:max-w-[400px] rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="font-display uppercase text-xl">Edit Student Profile</DialogTitle>
            </DialogHeader>
            <form key={editingStudent?.id} onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Full Name</Label>
                <Input name="full_name" defaultValue={editingStudent?.full_name} required className="bg-background border-border rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">College</Label>
                <Input name="college" defaultValue={editingStudent?.college} className="bg-background border-border rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">City</Label>
                <Input name="city" defaultValue={editingStudent?.city} className="bg-background border-border rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Phone</Label>
                <Input name="phone" defaultValue={editingStudent?.phone} className="bg-background border-border rounded-xl" />
              </div>
              <Button disabled={mutation.isPending} type="submit" className="w-full bg-primary text-primary-foreground font-bold rounded-xl h-12 uppercase tracking-wider mt-4">
                {mutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export const EnrollmentsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: enrollments = [], isLoading: loading } = useQuery({
    queryKey: ['admin_enrollments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('enrollments').select('*, courses(title), students(full_name, email)').order('enrolled_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const filteredEnrollments = enrollments.filter((e: any) => {
    const matchesSearch = (e.courses?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (e.students?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (e.students?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('enrollments').update({ status }).eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['admin_enrollments'] });
  };

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <CardTitle className="text-2xl font-display uppercase">Enrollments</CardTitle>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search enrollments..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border rounded-xl h-10 text-xs"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32 bg-background border-border rounded-xl h-10 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Course</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Student</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? <TableSkeleton cols={4} /> : (
            <TableBody>
              {filteredEnrollments.map((enr: any) => (
                <TableRow key={enr.id} className="border-border hover:bg-accent/50">
                  <TableCell className="text-muted-foreground">{enr.courses?.title}</TableCell>
                  <TableCell className="text-foreground">{enr.students?.full_name}</TableCell>
                  <TableCell>
                    <Select onValueChange={(val) => updateStatus(enr.id, val)} defaultValue={enr.status}>
                      <SelectTrigger className="w-[120px] bg-background h-8 text-[10px]">
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
                  <TableCell className="text-right"></TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </CardContent>
    </Card>
  );
};

export const ApplicationsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading: loading } = useQuery({
    queryKey: ['admin_applications'],
    queryFn: async () => {
      const { data, error } = await supabase.from('internship_applications').select('*').order('submitted_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const filteredApplications = applications.filter((a: any) => {
    const matchesSearch = (a.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (a.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (a.preferred_domain || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (id: string, status: string) => {
    await supabase.from('internship_applications').update({ status }).eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['admin_applications'] });
  };

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <CardTitle className="text-2xl font-display uppercase">Internship Apps</CardTitle>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search applications..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border rounded-xl h-10 text-xs"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32 bg-background border-border rounded-xl h-10 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Name</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Domain</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? <TableSkeleton cols={3} /> : (
            <TableBody>
              {filteredApplications.map((app: any) => (
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
          )}
        </Table>
      </CardContent>
    </Card>
  );
};

export const ContactsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: contacts = [], isLoading: loading } = useQuery({
    queryKey: ['admin_contacts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contact_submissions').select('*').order('submitted_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const filteredContacts = contacts.filter((c: any) => 
    (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.message || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <CardTitle className="text-2xl font-display uppercase">Messages</CardTitle>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search messages..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-background border-border rounded-xl h-10 text-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Name</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Subject</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? <TableSkeleton cols={3} /> : (
            <TableBody>
              {filteredContacts.map((contact: any) => (
                <TableRow key={contact.id} className="border-border">
                  <TableCell className="text-foreground font-medium">{contact.name}</TableCell>
                  <TableCell className="text-muted-foreground">{contact.subject}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{new Date(contact.submitted_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </CardContent>
    </Card>
  );
};

export const StatsManager = () => {
  const queryClient = useQueryClient();

  const { data: stats = [], isLoading: loading, refetch } = useQuery({
    queryKey: ['admin_stats'],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_stats').select('*');
      if (error) throw error;
      return data || [];
    }
  });

  const { data: courseCount = 0 } = useQuery({
    queryKey: ['admin_course_count'],
    queryFn: async () => {
      const { count, error } = await supabase.from('courses').select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  React.useEffect(() => {
    const offeredCoursesStat = stats.find(s => s.key === 'offered_courses');
    if (offeredCoursesStat && courseCount !== offeredCoursesStat.value) {
      handleUpdate('offered_courses', courseCount.toString(), '+');
    }
  }, [courseCount, stats]);

  const handleUpdate = async (key: string, value: string, suffix: string) => {
    try {
      const { error } = await supabase.from('site_stats').update({ 
        value: parseInt(value),
        suffix: suffix
      }).eq('key', key);
      
      if (error) throw error;
      toast.success('Updated');
      queryClient.invalidateQueries({ queryKey: ['admin_stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin_dashboard_stats'] });
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display uppercase tracking-tight text-foreground">Site Statistics</h2>
        <Button variant="outline" size="sm" className="border-border rounded-xl" onClick={() => refetch()}>Refresh</Button>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map(i => (
            <Card key={i} className="bg-card border-border rounded-3xl shadow-xl h-48 animate-pulse"></Card>
          ))}
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {stats.map((s: any) => (
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
      )}
    </div>
  );
};

export const TeamManager = () => {
  const [editingMember, setEditingMember] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  const { data: team = [], isLoading: loading } = useQuery({
    queryKey: ['admin_team'],
    queryFn: async () => {
      const { data, error } = await supabase.from('team_members').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await supabase.from('team_members').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['admin_team'] });
  };

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingMember?.id) {
        return supabase.from('team_members').update(payload).eq('id', editingMember.id);
      }
      return supabase.from('team_members').insert([payload]);
    },
    onSuccess: (res) => {
      if (res.error) throw res.error;
      toast.success('Saved Member');
      setEditingMember(null);
      queryClient.invalidateQueries({ queryKey: ['admin_team'] });
    },
    onError: (error: any) => toast.error(error.message)
  });

  const TeamMemberSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    designation: z.string().min(2, "Designation must be at least 2 characters"),
    display_order: z.number().int("Order must be an integer").min(1, "Order must be 1 or greater"),
    is_active: z.boolean(),
    bio: z.string().optional(),
    image_url: z.string().url("Invalid image URL").optional().or(z.literal("")),
    email: z.string().email("Invalid email").optional().or(z.literal("")),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, close: () => void) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let imageUrl = editingMember?.image_url || '';

    if (selectedFile) {
      setUploading(true);
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `team/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('team-photos')
        .upload(filePath, selectedFile);

      if (uploadError) {
        toast.error('Image upload failed');
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('team-photos')
        .getPublicUrl(filePath);
      
      imageUrl = publicUrl;
    }

    const rawPayload = {
      name: formData.get('name'),
      designation: formData.get('designation'),
      display_order: parseInt(formData.get('display_order') as string),
      is_active: formData.get('is_active') === 'true',
      bio: formData.get('bio'),
      image_url: imageUrl,
      email: formData.get('email'),
    };

    const result = TeamMemberSchema.safeParse(rawPayload);
    if (!result.success) {
      result.error.errors.forEach(err => toast.error(err.message));
      setUploading(false);
      return;
    }

    mutation.mutate(result.data, {
      onSuccess: () => {
        setIsFormOpen(false);
        setSelectedFile(null);
        setUploading(false);
      },
      onError: () => setUploading(false)
    });
  };

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden">
      <CardHeader className="border-b border-border pb-6 flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-display uppercase">Manage Team</CardTitle>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingMember(null)} className="bg-primary text-primary-foreground font-bold h-10 rounded-xl px-6 uppercase tracking-widest transition-all">
              <UserPlus className="w-4 h-4 mr-2" /> Add Member
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground sm:max-w-[600px] rounded-3xl p-0 overflow-hidden">
            <DialogHeader className="p-6 border-b border-border bg-muted/20">
              <DialogTitle className="text-xl font-display uppercase">{editingMember?.id ? 'Edit' : 'Add'} Member</DialogTitle>
            </DialogHeader>
            <form key={editingMember?.id || 'new'} onSubmit={(e) => { e.preventDefault(); handleSubmit(e, () => setIsFormOpen(false)); }} className="flex flex-col max-h-[85vh]">
              <div className="p-6 overflow-y-auto space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Name</Label>
                      <Input name="name" defaultValue={editingMember?.name} required className="bg-background border-border rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Designation</Label>
                      <Input name="designation" defaultValue={editingMember?.designation} required className="bg-background border-border rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Email</Label>
                      <Input name="email" type="email" defaultValue={editingMember?.email} className="bg-background border-border rounded-xl" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase text-muted-foreground">Profile Photo</Label>
                      <div className="flex flex-col items-center gap-3 p-4 border border-dashed border-border rounded-2xl bg-muted/10">
                        {(selectedFile || editingMember?.image_url) && (
                          <img 
                            src={selectedFile ? URL.createObjectURL(selectedFile) : editingMember.image_url} 
                            className="w-20 h-20 rounded-2xl object-cover shadow-md"
                            alt="Preview"
                          />
                        )}
                        <Input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                          className="text-xs bg-background border-border rounded-lg cursor-pointer" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Bio / About</Label>
                  <Textarea name="bio" defaultValue={editingMember?.bio} className="bg-background border-border rounded-xl h-24 resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Display Order</Label>
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
              </div>
              
              <div className="p-6 bg-muted/20 border-t border-border">
                <Button disabled={mutation.isPending || uploading} type="submit" className="bg-primary text-primary-foreground w-full rounded-xl font-bold h-12 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                  {mutation.isPending || uploading ? 'Processing...' : 'Save Member Details'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
          {loading ? <TableSkeleton cols={3} /> : (
            <TableBody>
              {team.map((m: any) => (
                <TableRow key={m.id} className="border-border">
                  <TableCell>
                    <div className="text-foreground font-medium">{m.name}</div>
                    <div className="text-[10px] text-muted-foreground">{m.email}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.designation}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                     <Button variant="ghost" size="sm" onClick={() => { setEditingMember(m); setIsFormOpen(true); }} className="h-8 text-primary uppercase text-[10px] font-bold">Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)} className="h-8 text-destructive uppercase text-[10px] font-bold">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </CardContent>
    </Card>
  );
};

export const BackupManager = () => {
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const tables = ['courses', 'enrollments', 'students', 'internship_applications', 'lms_classes', 'site_stats', 'team_members'];
      const backupData: any = {};

      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw error;
        backupData[table] = data;
      }

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `aspivox_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Backup downloaded successfully');
    } catch (err: any) {
      toast.error('Backup failed: ' + err.message);
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6">
        <CardTitle className="text-2xl font-display uppercase">Data Management</CardTitle>
      </CardHeader>
      <CardContent className="pt-8 space-y-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-muted/30 border border-border rounded-2xl">
          <div className="space-y-1">
            <h4 className="font-bold text-foreground uppercase tracking-tight">System Backup</h4>
            <p className="text-sm text-muted-foreground font-light">Download a complete snapshot of your platform data in JSON format.</p>
          </div>
          <Button 
            onClick={handleBackup} 
            disabled={isBackingUp}
            className="bg-primary text-primary-foreground font-bold rounded-xl px-8 h-12 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]"
          >
            {isBackingUp ? 'Preparing...' : 'Export All Data'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export const InstructorManager = () => {
  const [editingInstructor, setEditingInstructor] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [foundUser, setFoundUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();

  const handleSearch = async () => {
    if (!searchEmail) return;
    const { data, error } = await supabase.from('students').select('*').eq('email', searchEmail).single();
    if (error) {
      toast.error('User not found in students list. Ask them to sign up first.');
      setFoundUser(null);
    } else {
      setFoundUser(data);
      toast.success('User found!');
    }
  };

  const promoteUser = async () => {
    if (!foundUser) return;
    const payload = {
      email: foundUser.email,
      full_name: foundUser.full_name,
      designation: 'Instructor',
      bio: 'New Instructor Profile',
    };
    
    const { error } = await supabase.from('instructors').insert([payload]);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('User promoted to Instructor!');
      setFoundUser(null);
      setSearchEmail('');
      queryClient.invalidateQueries({ queryKey: ['admin_instructors'] });
    }
  };

  const { data: instructors = [], isLoading: loading } = useQuery({
    queryKey: ['admin_instructors'],
    queryFn: async () => {
      const { data, error } = await supabase.from('instructors').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const filteredInstructors = instructors.filter((ins: any) => 
    (ins.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (ins.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingInstructor?.id) {
        return supabase.from('instructors').update(payload).eq('id', editingInstructor.id);
      }
      return supabase.from('instructors').insert([payload]);
    },
    onSuccess: (res) => {
      if (res.error) throw res.error;
      toast.success('Instructor Saved');
      setIsFormOpen(false);
      setEditingInstructor(null);
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['admin_instructors'] });
    },
    onError: (error: any) => toast.error(error.message)
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setUploading(true);

    let imageUrl = editingInstructor?.image_url || '';
    if (selectedFile) {
      try {
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `instructors/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('team-photos').upload(filePath, selectedFile);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('team-photos').getPublicUrl(filePath);
        imageUrl = publicUrl;
      } catch (err: any) {
        toast.error('Image upload failed: ' + err.message);
        setUploading(false);
        return;
      }
    }

    const payload = {
      full_name: formData.get('full_name'),
      email: formData.get('email'),
      designation: formData.get('designation'),
      bio: formData.get('bio'),
      image_url: imageUrl,
      password: formData.get('password'), // Saving password to table
    };

    mutation.mutate(payload);
    setUploading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    await supabase.from('instructors').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['admin_instructors'] });
  };

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-2xl font-display uppercase">Instructors</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search instructors..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border rounded-xl h-10 text-xs"
              />
            </div>
            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingInstructor(null)} className="bg-primary text-primary-foreground font-bold h-10 rounded-xl px-6 uppercase tracking-widest">
                  <Plus className="w-4 h-4 mr-2" /> Add Profile
                </Button>
              </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground sm:max-w-[500px] rounded-3xl p-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-display uppercase mb-4">{editingInstructor?.id ? 'Edit' : 'Add'} Instructor Profile</DialogTitle>
              </DialogHeader>
              <form key={editingInstructor?.id} onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Full Name</Label>
                  <Input name="full_name" defaultValue={editingInstructor?.full_name} required className="bg-background border-border rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Email (Must match Auth email)</Label>
                  <Input name="email" type="email" defaultValue={editingInstructor?.email} required className="bg-background border-border rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Initial Password</Label>
                  <Input name="password" type="password" placeholder="••••••••" required={!editingInstructor?.id} className="bg-background border-border rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Profile Photo</Label>
                  <div className="flex items-center gap-4">
                    {(selectedFile || editingInstructor?.image_url) && (
                      <img src={selectedFile ? URL.createObjectURL(selectedFile) : editingInstructor.image_url} className="w-10 h-10 rounded-xl object-cover border border-border" alt="Preview" />
                    )}
                    <Input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} className="bg-background border-border rounded-xl flex-1 text-xs" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Bio</Label>
                  <Textarea name="bio" defaultValue={editingInstructor?.bio} className="bg-background border-border rounded-xl h-24" />
                </div>
                <Button disabled={mutation.isPending || uploading} type="submit" className="w-full bg-primary text-primary-foreground font-bold rounded-xl h-12 uppercase">
                  {mutation.isPending || uploading ? 'Processing...' : 'Save Profile'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-4">
          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Quick Escalation (Promote existing user)</p>
          <div className="flex gap-2">
            <Input 
              placeholder="Enter student email..." 
              value={searchEmail} 
              onChange={(e) => setSearchEmail(e.target.value)}
              className="bg-background border-border rounded-xl h-10"
            />
            <Button onClick={handleSearch} variant="secondary" className="rounded-xl h-10 font-bold uppercase text-[10px]">Search</Button>
          </div>
          {foundUser && (
            <div className="flex items-center justify-between p-3 bg-primary/10 border border-primary/20 rounded-xl animate-in fade-in slide-in-from-top-2">
              <div className="text-xs">
                <p className="font-bold text-foreground uppercase">{foundUser.full_name}</p>
                <p className="text-muted-foreground">{foundUser.email}</p>
              </div>
              <Button onClick={promoteUser} size="sm" className="bg-primary text-primary-foreground font-bold rounded-lg text-[10px] uppercase">Escalate to Instructor</Button>
            </div>
          )}
        </div>
      </div>
    </CardHeader>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-[10px] font-bold uppercase">Name</TableHead>
              <TableHead className="text-[10px] font-bold uppercase">Email</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? <TableSkeleton cols={3} /> : (
            <TableBody>
              {filteredInstructors.map((ins: any) => (
                <TableRow key={ins.id} className="border-border">
                  <TableCell className="font-medium">{ins.full_name}</TableCell>
                  <TableCell>{ins.email}</TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => { setEditingInstructor(ins); setIsFormOpen(true); }} className="text-primary uppercase text-[10px] font-bold">Edit</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(ins.id)} className="text-destructive uppercase text-[10px] font-bold">Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </CardContent>
    </Card>
  );
};
