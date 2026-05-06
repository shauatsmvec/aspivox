import React, { useState } from 'react';
import { supabase, logActivity } from '@/lib/supabase';
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
  Search,
  Activity
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MorphingPopover, MorphingPopoverTrigger, MorphingPopoverContent } from "@/components/ui/morphing-popover";
import { z } from "zod";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

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
    const { error } = await supabase.from('lms_classes').delete().eq('id', id);
    if (!error) {
      logActivity('delete_class', `Deleted class ID: ${id}`, user?.email);
      queryClient.invalidateQueries({ queryKey: ['admin_lms_classes', courseId] });
    }
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
  const [isCourseFree, setIsCourseFree] = useState(false);
  const queryClient = useQueryClient();

  const { data: courses = [], isLoading: loading } = useQuery({
    queryKey: ['admin_courses'],
    queryFn: async () => {
      const { data, error } = await supabase.from('courses').select('*, lms_classes(id, is_completed)').order('created_at', { ascending: false });
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
    is_free: z.boolean(),
    is_active: z.boolean(),
    description: z.string().optional(),
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, close: () => void) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const rawPayload = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      is_free: formData.get('is_free') === 'true',
      price: formData.get('is_free') === 'true' ? 0 : parseInt(formData.get('price') as string || '0'),
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
            <Button onClick={() => { setEditingCourse(null); setIsCourseFree(false); }} className="bg-primary text-primary-foreground font-bold h-10 rounded-xl px-6 uppercase tracking-widest transition-all">
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
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Pricing Type</Label>
                  <Select name="is_free" value={isCourseFree ? 'true' : 'false'} onValueChange={(val) => setIsCourseFree(val === 'true')}>
                    <SelectTrigger className="bg-background border-border rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      <SelectItem value="false">Paid</SelectItem>
                      <SelectItem value="true">Free</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {!isCourseFree && (
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Price (₹)</Label>
                    <Input name="price" type="number" defaultValue={editingCourse?.price || 0} required className="bg-background border-border rounded-xl" />
                  </div>
                )}
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Title</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Price</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Classes</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            {loading ? <TableSkeleton cols={5} /> : (
              <TableBody>
                {filteredCourses.map((course: any) => (
                  <TableRow key={course.id} className="border-border hover:bg-accent/50">
                    <TableCell className="text-foreground font-medium">{course.title}</TableCell>
                    <TableCell className="text-muted-foreground">{course.is_free ? 'Free' : `₹${course.price}`}</TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground font-mono bg-muted/50 inline-block px-2 py-1 rounded-md">
                        <span className="text-green-500 font-bold">{course.lms_classes?.filter((c:any) => c.is_completed).length || 0}</span> / {course.lms_classes?.length || 0}
                      </div>
                    </TableCell>
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
                      <Button variant="ghost" size="sm" onClick={() => { setEditingCourse(course); setIsCourseFree(course.is_free); setIsFormOpen(true); }} className="h-8 px-3 text-[10px] font-bold uppercase text-primary">
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
        </div>
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
      logActivity('delete_student', `Permanently deleted student profile`, user?.email);
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
        <div className="overflow-x-auto">
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
        </div>

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
  const [activeTab, setActiveTab] = useState<'pending' | 'active' | 'completed' | 'cancelled'>('pending');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionConfig, setActionConfig] = useState<{type: 'complete' | 'cancel' | 'delete' | 'active' | 'revoke', ids: string[]} | null>(null);
  const [password, setPassword] = useState('');
  const [revocationReason, setRevocationReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: enrollments = [], isLoading: loading } = useQuery({
    queryKey: ['admin_enrollments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('enrollments').select('*, courses(title), students(full_name, email), certificates(certificate_code)').order('enrolled_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const filteredEnrollments = enrollments.filter((e: any) => {
    const matchesSearch = (e.courses?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (e.students?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (e.students?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = e.status === activeTab;

    return matchesSearch && matchesTab;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(filteredEnrollments.map((enr: any) => enr.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) setSelectedIds(prev => [...prev, id]);
    else setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const executeAction = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!actionConfig) return;
    setActionLoading(true);

    try {
      // 1. Password Verification for destructive actions
      if (actionConfig.type === 'cancel' || actionConfig.type === 'delete') {
        const { error } = await supabase.auth.signInWithPassword({
          email: user?.email || '',
          password: password,
        });
        if (error) throw new Error('Invalid Admin Password. Action aborted.');
      }

      // 2. Execution
      if (actionConfig.type === 'delete') {
        const { error } = await supabase.from('enrollments').delete().in('id', actionConfig.ids);
        if (error) throw error;
        toast.success(`Successfully deleted ${actionConfig.ids.length} enrollment(s).`);
      } 
      else if (actionConfig.type === 'cancel') {
        const { error } = await supabase.from('enrollments').update({ status: 'cancelled' }).in('id', actionConfig.ids);
        if (error) throw error;
        toast.success(`Successfully cancelled ${actionConfig.ids.length} enrollment(s).`);
      }
      else if (actionConfig.type === 'active') {
        const { error } = await supabase.from('enrollments').update({ status: 'active' }).in('id', actionConfig.ids);
        if (error) throw error;
        toast.success(`Successfully confirmed ${actionConfig.ids.length} enrollment(s) to Active.`);
      }
      else if (actionConfig.type === 'complete') {
        const now = new Date();
        for (const id of actionConfig.ids) {
          const enr = enrollments.find((e:any) => e.id === id);
          if (!enr) continue;

          // Cooldown check
          if (enr.revoked_at) {
            const revokedTime = new Date(enr.revoked_at);
            const diffHours = Math.abs(now.getTime() - revokedTime.getTime()) / 3600000;
            if (diffHours < 1) {
              throw new Error(`Cannot complete enrollment for ${enr.students?.full_name}. Cooldown active (${Math.ceil(60 - diffHours*60)} mins remaining).`);
            }
          }

          // Check if certificate exists
          const { data: existing } = await supabase.from('certificates').select('*').eq('enrollment_id', enr.id).maybeSingle();
          if (!existing) {
            const code = `ASP-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${new Date().getFullYear()}`;
            const { error: certErr } = await supabase.from('certificates').insert([{
              certificate_code: code,
              enrollment_id: enr.id,
              student_name: enr.students?.full_name || 'Student',
              course_name: enr.courses?.title || 'Course'
            }]);
            if (certErr) throw certErr;
          }
          const { error: updErr } = await supabase.from('enrollments').update({ status: 'completed' }).eq('id', enr.id);
          if (updErr) throw updErr;
        }
        
        // Increment site stats for Students Trained
        const { data: stats, error: statsGetErr } = await supabase.from('site_stats').select('value').eq('key', 'students_trained').maybeSingle();
        if (statsGetErr) throw statsGetErr;
        if (stats) {
          const { error: statsUpdErr } = await supabase.from('site_stats').update({ value: stats.value + actionConfig.ids.length }).eq('key', 'students_trained');
          if (statsUpdErr) throw statsUpdErr;
        }

        toast.success(`Successfully completed ${actionConfig.ids.length} enrollment(s). Certificates generated.`);
        logActivity('complete_enrollment', `Completed ${actionConfig.ids.length} enrollment(s). IDs: ${actionConfig.ids.join(', ')}`, user?.email);
      }
      else if (actionConfig.type === 'revoke') {
        if (!revocationReason.trim()) throw new Error("A revocation reason is required.");
        
        for (const id of actionConfig.ids) {
          const enr = enrollments.find((e:any) => e.id === id);
          if (!enr) continue;

          // Delete certificates
          const { error: delErr } = await supabase.from('certificates').delete().eq('enrollment_id', enr.id);
          if (delErr) throw delErr;
          
          // Update enrollment
          const { error: updErr } = await supabase.from('enrollments').update({ 
            status: 'active', 
            revocation_reason: revocationReason,
            revoked_at: new Date().toISOString()
          }).eq('id', enr.id);
          if (updErr) throw updErr;
        }

        // Decrement site stats safely
        const { data: stats, error: statsGetErr } = await supabase.from('site_stats').select('value').eq('key', 'students_trained').maybeSingle();
        if (statsGetErr) throw statsGetErr;
        if (stats) {
          const { error: statsUpdErr } = await supabase.from('site_stats').update({ value: Math.max(0, stats.value - actionConfig.ids.length) }).eq('key', 'students_trained');
          if (statsUpdErr) throw statsUpdErr;
        }

        toast.success(`Successfully revoked ${actionConfig.ids.length} enrollment(s). Certificates destroyed.`);
        logActivity('revoke_enrollment', `Revoked ${actionConfig.ids.length} enrollment(s) for reason: ${revocationReason}. IDs: ${actionConfig.ids.join(', ')}`, user?.email);
      }

      // Clean up
      queryClient.invalidateQueries({ queryKey: ['admin_enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['student_enrollments'] });
      queryClient.invalidateQueries({ queryKey: ['admin_stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin_dashboard_stats'] });
      setSelectedIds([]);
      setActionConfig(null);
      setPassword('');
      setRevocationReason('');
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const renderActionDialog = () => {
    if (!actionConfig) return null;
    const isDestructive = actionConfig.type === 'cancel' || actionConfig.type === 'delete' || actionConfig.type === 'revoke';

    return (
      <Dialog open={!!actionConfig} onOpenChange={(open) => {
        if (!open) {
          setActionConfig(null);
          setPassword('');
          setRevocationReason('');
        }
      }}>
        <DialogContent className="bg-card border-border sm:max-w-[425px] rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-display uppercase tracking-tight text-xl">
              {actionConfig.type === 'complete' && 'Mark as Completed'}
              {actionConfig.type === 'cancel' && 'Cancel Enrollments'}
              {actionConfig.type === 'delete' && 'Delete Enrollments'}
              {actionConfig.type === 'active' && 'Activate Enrollments'}
              {actionConfig.type === 'revoke' && 'Revoke Completion'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={executeAction} className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              {actionConfig.type === 'complete' && `Are you sure you want to mark ${actionConfig.ids.length} student(s) as completed? This will automatically generate their certificates.`}
              {actionConfig.type === 'cancel' && `Are you sure you want to cancel ${actionConfig.ids.length} enrollment(s)?`}
              {actionConfig.type === 'delete' && `Are you sure you want to permanently delete ${actionConfig.ids.length} enrollment(s)? This action cannot be undone.`}
              {actionConfig.type === 'active' && `Are you sure you want to confirm ${actionConfig.ids.length} enrollment(s)? This will grant them access to the LMS.`}
              {actionConfig.type === 'revoke' && `Are you sure you want to revoke ${actionConfig.ids.length} student(s)? Their certificates will be destroyed and they will be moved back to Active status.`}
            </p>

            {actionConfig.type === 'revoke' && (
              <div className="space-y-2 mt-4">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Reason for Revocation</Label>
                <Textarea 
                  value={revocationReason} 
                  onChange={e => setRevocationReason(e.target.value)} 
                  required 
                  className="bg-background border-border rounded-xl min-h-[100px]" 
                  placeholder="Provide a reason. The student will see this on their dashboard."
                />
              </div>
            )}

            {isDestructive && (
              <div className="space-y-2 mt-4">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Admin Password Required</Label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="bg-background border-border rounded-xl h-12" 
                  placeholder="Enter your password to confirm"
                />
              </div>
            )}

            <Button disabled={actionLoading || (isDestructive && !password)} type="submit" className={cn("w-full font-bold rounded-xl h-12 uppercase tracking-wider mt-4", isDestructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground")}>
              {actionLoading ? 'Processing...' : 'Confirm Action'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-2xl font-display uppercase">Enrollments</CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search enrollments..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background border-border rounded-xl h-10 text-xs"
            />
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-px overflow-x-auto scrollbar-hide">
          {(['pending', 'active', 'completed', 'cancelled'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedIds([]); }}
              className={cn(
                "px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap",
                activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 relative">
        {selectedIds.length > 0 && (
          <div className="absolute top-0 left-0 right-0 bg-accent/80 backdrop-blur border-b border-border p-3 flex items-center justify-between z-10 animate-in fade-in slide-in-from-top-4">
            <span className="text-sm font-bold text-foreground px-4">{selectedIds.length} Selected</span>
            <div className="flex gap-2 pr-4">
              {activeTab === 'pending' && (
                <Button size="sm" onClick={() => setActionConfig({type: 'active', ids: selectedIds})} className="h-8 bg-cyan/20 text-cyan hover:bg-cyan/30 text-[10px] uppercase font-bold tracking-widest rounded-lg">Confirm Active</Button>
              )}
              {activeTab === 'active' && (
                <Button size="sm" onClick={() => setActionConfig({type: 'complete', ids: selectedIds})} className="h-8 bg-green-500/20 text-green-500 hover:bg-green-500/30 text-[10px] uppercase font-bold tracking-widest rounded-lg">Mark Completed</Button>
              )}
              {activeTab !== 'cancelled' && (
                <Button size="sm" onClick={() => setActionConfig({type: 'cancel', ids: selectedIds})} className="h-8 bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 text-[10px] uppercase font-bold tracking-widest rounded-lg">Cancel</Button>
              )}
              <Button size="sm" onClick={() => setActionConfig({type: 'delete', ids: selectedIds})} className="h-8 bg-destructive/20 text-destructive hover:bg-destructive/30 text-[10px] uppercase font-bold tracking-widest rounded-lg">Delete</Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table className={cn(selectedIds.length > 0 && "mt-12 transition-all")}>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="w-12">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                  checked={filteredEnrollments.length > 0 && selectedIds.length === filteredEnrollments.length}
                  onChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Course</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Student</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Status</TableHead>
              <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          {loading ? <TableSkeleton cols={5} /> : (
            <TableBody>
              {filteredEnrollments.map((enr: any) => (
                <TableRow key={enr.id} className="border-border hover:bg-accent/50">
                  <TableCell>
                     <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                      checked={selectedIds.includes(enr.id)}
                      onChange={(e) => handleSelectOne(enr.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {enr.courses?.title}
                    {enr.status === 'completed' && enr.certificates && enr.certificates[0] && (
                      <div className="text-[10px] text-green-500/80 mt-1 font-mono">{enr.certificates[0].certificate_code}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-foreground">{enr.students?.full_name}</TableCell>
                  <TableCell>
                    <Badge className={cn("rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest border-none", 
                      enr.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                      enr.status === 'active' ? 'bg-cyan/20 text-cyan' :
                      enr.status === 'cancelled' ? 'bg-destructive/20 text-destructive' :
                      'bg-muted/50 text-muted-foreground'
                    )}>
                      {enr.status}
                    </Badge>
                  </TableCell>
                   <TableCell className="text-right">
                     <div className="flex justify-end gap-2">
                       {activeTab === 'pending' && (
                         <Button variant="ghost" size="sm" onClick={() => setActionConfig({type: 'active', ids: [enr.id]})} className="h-8 text-cyan uppercase text-[10px] font-bold hover:bg-cyan/10">Confirm</Button>
                       )}
                       {activeTab === 'active' && (
                         <Button variant="ghost" size="sm" onClick={() => setActionConfig({type: 'complete', ids: [enr.id]})} className="h-8 text-primary uppercase text-[10px] font-bold hover:bg-primary/10">Complete</Button>
                       )}
                       {activeTab === 'completed' && (
                         <Button variant="ghost" size="sm" onClick={() => setActionConfig({type: 'revoke', ids: [enr.id]})} className="h-8 text-destructive uppercase text-[10px] font-bold hover:bg-destructive/10">Revoke</Button>
                       )}
                       <Button variant="ghost" size="sm" onClick={() => setActionConfig({type: 'delete', ids: [enr.id]})} className="h-8 text-destructive uppercase text-[10px] font-bold hover:bg-destructive/10">Delete</Button>
                     </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          )}
        </Table>
      </div>

        {renderActionDialog()}
      </CardContent>
    </Card>
  );
};

export const ApplicationsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const queryClient = useQueryClient();
  const { user } = useAuth();

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

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      // Password verification
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: confirmPassword,
      });
      if (authError) throw new Error('Invalid Admin Password');

      const { error } = await supabase.from('internship_applications').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      toast.success(`Successfully deleted ${ids.length} application(s)`);
      logActivity('delete_applications', `Deleted ${ids.length} applications`, user?.email);
      queryClient.invalidateQueries({ queryKey: ['admin_applications'] });
      setSelectedIds([]);
      setShowDeleteDialog(false);
      setConfirmPassword('');
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(filteredApplications.map((a: any) => a.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) setSelectedIds(prev => [...prev, id]);
    else setSelectedIds(prev => prev.filter(i => i !== id));
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
      <CardContent className="pt-6 relative">
        {selectedIds.length > 0 && (
          <div className="absolute top-0 left-0 right-0 bg-accent/80 backdrop-blur border-b border-border p-3 flex items-center justify-between z-10">
            <span className="text-sm font-bold text-foreground px-4">{selectedIds.length} Selected</span>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="h-8 uppercase text-[10px] font-bold tracking-widest rounded-lg mr-4"
            >
              <Trash2 className="w-3 h-3 mr-2" /> Delete Selected
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table className={cn(selectedIds.length > 0 && "mt-12 transition-all")}>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-12">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                    checked={filteredApplications.length > 0 && selectedIds.length === filteredApplications.length}
                    onChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Name</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Domain</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            {loading ? <TableSkeleton cols={4} /> : (
              <TableBody>
                {filteredApplications.map((app: any) => (
                  <TableRow key={app.id} className="border-border hover:bg-accent/50">
                    <TableCell>
                       <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                        checked={selectedIds.includes(app.id)}
                        onChange={(e) => handleSelectOne(app.id, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell className="text-foreground">{app.full_name}</TableCell>
                    <TableCell className="text-muted-foreground">{app.preferred_domain}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Select onValueChange={(val) => updateStatus(app.id, val)} defaultValue={app.status}>
                          <SelectTrigger className="w-[100px] bg-background h-8 text-[9px] uppercase font-bold">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => { setSelectedIds([app.id]); setShowDeleteDialog(true); }}
                          className="h-8 text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </div>

        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="bg-card border-border sm:max-w-[400px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-display uppercase text-xl text-destructive">Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete {selectedIds.length} application(s)? This action is permanent.
              </p>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Admin Password</Label>
                <Input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="Enter password to confirm"
                  className="bg-background border-border rounded-xl h-12"
                />
              </div>
              <Button 
                variant="destructive" 
                className="w-full h-12 rounded-xl font-bold uppercase tracking-widest"
                disabled={deleteMutation.isPending || !confirmPassword}
                onClick={() => deleteMutation.mutate(selectedIds)}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Permanently Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export const ContactsList = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'resolved'>('active');
  const [viewingMessage, setViewingMessage] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: contacts = [], isLoading: loading } = useQuery({
    queryKey: ['admin_contacts'],
    queryFn: async () => {
      const { data, error } = await supabase.from('contact_submissions').select('*').order('submitted_at', { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const resolveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contact_submissions').update({ status: 'resolved' }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: (_, id) => {
      toast.success('Message marked as resolved');
      logActivity('resolve_contact', `Marked message ID: ${id} as resolved`, user?.email);
      queryClient.invalidateQueries({ queryKey: ['admin_contacts'] });
    },
    onError: (err: any) => toast.error(err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: confirmPassword,
      });
      if (authError) throw new Error('Invalid Admin Password');

      const { error } = await supabase.from('contact_submissions').delete().in('id', ids);
      if (error) throw error;
    },
    onSuccess: (_, ids) => {
      toast.success(`Successfully deleted ${ids.length} message(s)`);
      logActivity('delete_contacts', `Deleted ${ids.length} contact messages`, user?.email);
      queryClient.invalidateQueries({ queryKey: ['admin_contacts'] });
      setSelectedIds([]);
      setShowDeleteDialog(false);
      setConfirmPassword('');
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedIds(filteredContacts.map((c: any) => c.id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) setSelectedIds(prev => [...prev, id]);
    else setSelectedIds(prev => prev.filter(i => i !== id));
  };

  const filteredContacts = contacts.filter((c: any) => {
    const matchesSearch = 
      (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (c.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.subject || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.message || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = c.status || 'active';
    return matchesSearch && status === activeTab;
  });

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6 flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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
        </div>

        <div className="flex items-center gap-2 border-b border-border pb-px overflow-x-auto scrollbar-hide">
          {(['active', 'resolved'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSelectedIds([]); }}
              className={cn(
                "px-4 py-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-all whitespace-nowrap",
                activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="pt-6 relative">
        {selectedIds.length > 0 && (
          <div className="absolute top-0 left-0 right-0 bg-accent/80 backdrop-blur border-b border-border p-3 flex items-center justify-between z-10">
            <span className="text-sm font-bold text-foreground px-4">{selectedIds.length} Selected</span>
            <Button 
              size="sm" 
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
              className="h-8 uppercase text-[10px] font-bold tracking-widest rounded-lg mr-4"
            >
              <Trash2 className="w-3 h-3 mr-2" /> Delete Selected
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table className={cn(selectedIds.length > 0 && "mt-12 transition-all")}>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="w-12">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                    checked={filteredContacts.length > 0 && selectedIds.length === filteredContacts.length}
                    onChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">From</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Subject / Message</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            {loading ? <TableSkeleton cols={4} /> : (
              <TableBody>
                {filteredContacts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground italic">
                      No {activeTab} messages found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredContacts.map((contact: any) => (
                    <TableRow key={contact.id} className="border-border hover:bg-accent/30 transition-colors">
                      <TableCell>
                         <input 
                          type="checkbox" 
                          className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                          checked={selectedIds.includes(contact.id)}
                          onChange={(e) => handleSelectOne(contact.id, e.target.checked)}
                        />
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <div className="text-foreground font-bold text-sm">{contact.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-tight">{contact.email}</div>
                        <div className="text-[9px] text-muted-foreground/60 mt-1">{new Date(contact.submitted_at).toLocaleString()}</div>
                      </TableCell>
                      <TableCell className="align-top py-4">
                        <div className="text-foreground font-semibold text-sm mb-1">{contact.subject || '(No Subject)'}</div>
                        <div className="text-muted-foreground text-xs line-clamp-2 max-w-md">
                          {contact.message}
                        </div>
                      </TableCell>
                      <TableCell className="text-right align-top py-4">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setViewingMessage(contact)}
                            className="h-8 text-primary uppercase text-[10px] font-bold"
                          >
                            View
                          </Button>
                          {activeTab === 'active' && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              disabled={resolveMutation.isPending}
                              onClick={() => resolveMutation.mutate(contact.id)}
                              className="h-8 text-green-500 uppercase text-[10px] font-bold hover:bg-green-500/10"
                            >
                              <Check className="w-3 h-3 mr-1" /> Done
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => { setSelectedIds([contact.id]); setShowDeleteDialog(true); }}
                            className="h-8 text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            )}
          </Table>
        </div>

        <Dialog open={showDeleteDialog} onOpenChange={(open) => {
          setShowDeleteDialog(open);
          if (!open && selectedIds.length === 1) setSelectedIds([]);
        }}>
          <DialogContent className="bg-card border-border sm:max-w-[400px] rounded-3xl">
            <DialogHeader>
              <DialogTitle className="font-display uppercase text-xl text-destructive">Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Are you sure you want to delete {selectedIds.length} message(s)? This action is permanent.
              </p>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-muted-foreground">Admin Password</Label>
                <Input 
                  type="password" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)} 
                  placeholder="Enter password to confirm"
                  className="bg-background border-border rounded-xl h-12"
                />
              </div>
              <Button 
                variant="destructive" 
                className="w-full h-12 rounded-xl font-bold uppercase tracking-widest"
                disabled={deleteMutation.isPending || !confirmPassword}
                onClick={() => deleteMutation.mutate(selectedIds)}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Permanently Delete'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={!!viewingMessage} onOpenChange={(open) => !open && setViewingMessage(null)}>
          <DialogContent className="bg-card border-border sm:max-w-[500px] rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="font-display uppercase text-xl mb-4">Message Detail</DialogTitle>
            </DialogHeader>
            {viewingMessage && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">From</Label>
                    <div className="text-sm font-medium">{viewingMessage.name}</div>
                    <div className="text-[10px] text-muted-foreground">{viewingMessage.email}</div>
                  </div>
                  <div className="space-y-1 text-right">
                    <Label className="text-[10px] font-bold uppercase text-muted-foreground">Received</Label>
                    <div className="text-[10px] text-muted-foreground">{new Date(viewingMessage.submitted_at).toLocaleString()}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Subject</Label>
                  <div className="text-sm font-bold bg-muted/30 p-3 rounded-xl border border-border">
                    {viewingMessage.subject || '(No Subject)'}
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-[10px] font-bold uppercase text-muted-foreground">Message</Label>
                  <div className="text-sm leading-relaxed text-foreground bg-muted/10 p-4 rounded-xl border border-border whitespace-pre-wrap">
                    {viewingMessage.message}
                  </div>
                </div>

                <div className="flex gap-4">
                  {viewingMessage.status !== 'resolved' && (
                    <Button 
                      className="flex-1 bg-green-500 text-white font-bold h-12 rounded-xl uppercase tracking-widest"
                      onClick={() => {
                        resolveMutation.mutate(viewingMessage.id);
                        setViewingMessage(null);
                      }}
                    >
                      Mark Resolved
                    </Button>
                  )}
                  <Button 
                    variant="destructive"
                    className="flex-1 font-bold h-12 rounded-xl uppercase tracking-widest"
                    onClick={() => {
                      setSelectedIds([viewingMessage.id]);
                      setShowDeleteDialog(true);
                      setViewingMessage(null);
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
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
      logActivity('promote_instructor', `Promoted user ${foundUser.email} to Instructor role`, user?.email);
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
    const { error } = await supabase.from('instructors').delete().eq('id', id);
    if (!error) {
      logActivity('delete_instructor', `Removed instructor profile ID: ${id}`, user?.email);
      queryClient.invalidateQueries({ queryKey: ['admin_instructors'] });
    }
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
        <div className="overflow-x-auto">
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
                    <TableCell className="text-muted-foreground">{ins.email}</TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingInstructor(ins); setIsFormOpen(true); }} className="h-8 text-primary uppercase text-[10px] font-bold">Edit</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(ins.id)} className="h-8 text-destructive uppercase text-[10px] font-bold">Delete</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

// --- ACTIVITY LOGS ---
export const ActivityLogs = () => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin_site_logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('site_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) {
        console.error('Error fetching logs:', error);
        return [];
      }
      return data || [];
    }
  });

  return (
    <Card className="bg-card border-border rounded-[2rem] overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6 flex flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl font-display uppercase tracking-tight text-foreground">Activity Logs</CardTitle>
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">System-wide audit trail</p>
          </div>
        </div>
        <Badge variant="outline" className="bg-muted text-muted-foreground uppercase text-[10px] tracking-widest font-bold">{logs.length} Recent</Badge>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">User / Entity</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Action</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Details</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            {isLoading ? <TableSkeleton cols={4} /> : (
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20">
                      <div className="max-w-xs mx-auto space-y-4">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-20">
                          <Activity className="w-8 h-8" />
                        </div>
                        <p className="text-muted-foreground font-light text-sm italic">No logs found. Ensure the 'site_logs' table is initialized in Supabase.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log: any) => (
                    <TableRow key={log.id} className="border-border hover:bg-accent/50 group transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-sm truncate max-w-[150px]">{log.user_email || 'System'}</span>
                          {log.ip_address && <span className="text-[10px] text-muted-foreground font-mono">{log.ip_address}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "text-[9px] uppercase tracking-tighter font-black",
                          log.action?.includes('delete') ? "bg-destructive/10 text-destructive" :
                          log.action?.includes('create') || log.action?.includes('insert') ? "bg-green-500/10 text-green-500" :
                          log.action?.includes('update') ? "bg-cyan/10 text-cyan" : "bg-muted text-muted-foreground"
                        )}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground/80 text-xs font-light">{log.details}</TableCell>
                      <TableCell className="text-right text-[10px] text-muted-foreground font-mono">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export const DomainsManager = () => {
  const [editingDomain, setEditingDomain] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: domains = [], isLoading: loading } = useQuery({
    queryKey: ['admin_domains'],
    queryFn: async () => {
      const { data, error } = await supabase.from('domains').select('*').order('name', { ascending: true });
      if (error) throw error;
      return data || [];
    }
  });

  const mutation = useMutation({
    mutationFn: async (payload: any) => {
      if (editingDomain?.id) {
        return supabase.from('domains').update(payload).eq('id', editingDomain.id);
      }
      return supabase.from('domains').insert([payload]);
    },
    onSuccess: (res) => {
      if (res.error) throw res.error;
      toast.success('Domain Saved');
      setIsFormOpen(false);
      setEditingDomain(null);
      queryClient.invalidateQueries({ queryKey: ['admin_domains'] });
      logActivity(editingDomain?.id ? 'update_domain' : 'create_domain', `Managed domain: ${editingDomain?.name || 'New Domain'}`, user?.email);
    },
    onError: (error: any) => toast.error(error.message)
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure? This might affect existing applications.')) return;
    const { error } = await supabase.from('domains').delete().eq('id', id);
    if (!error) {
      toast.success('Domain deleted');
      queryClient.invalidateQueries({ queryKey: ['admin_domains'] });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    mutation.mutate({
      name: formData.get('name'),
      is_active: formData.get('is_active') === 'true'
    });
  };

  return (
    <Card className="bg-card border-border rounded-3xl overflow-hidden shadow-2xl">
      <CardHeader className="border-b border-border pb-6 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-display uppercase">Internship Domains</CardTitle>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest mt-1">Manage selectable areas for interns</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingDomain(null)} className="bg-primary text-primary-foreground font-bold h-10 rounded-xl px-6 uppercase tracking-widest">
              <Plus className="w-4 h-4 mr-2" /> Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border text-foreground sm:max-w-[400px] rounded-3xl p-6">
            <DialogHeader>
              <DialogTitle className="text-xl font-display uppercase mb-4">{editingDomain?.id ? 'Edit' : 'Add'} Domain</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Domain Name</Label>
                <Input name="name" defaultValue={editingDomain?.name} placeholder="e.g. Web Development" required className="bg-background border-border rounded-xl h-12" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase text-muted-foreground">Status</Label>
                <Select name="is_active" defaultValue={editingDomain?.is_active?.toString() || 'true'}>
                  <SelectTrigger className="bg-background border-border rounded-xl h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="true">Active (Visible)</SelectItem>
                    <SelectItem value="false">Inactive (Hidden)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button disabled={mutation.isPending} type="submit" className="w-full bg-primary text-primary-foreground font-bold rounded-xl h-12 uppercase tracking-widest shadow-lg shadow-primary/20">
                {mutation.isPending ? 'Saving...' : 'Save Domain'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border">
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Name</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground">Status</TableHead>
                <TableHead className="text-[10px] font-bold uppercase text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            {loading ? <TableSkeleton cols={3} /> : (
              <TableBody>
                {domains.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12 text-muted-foreground italic">No domains added yet.</TableCell>
                  </TableRow>
                ) : (
                  domains.map((d: any) => (
                    <TableRow key={d.id} className="border-border hover:bg-accent/30 transition-colors">
                      <TableCell className="font-bold text-foreground">{d.name}</TableCell>
                      <TableCell>
                        <Badge variant={d.is_active ? "default" : "secondary"} className={cn(
                          "text-[9px] uppercase font-black",
                          d.is_active ? "bg-green-500/10 text-green-500 hover:bg-green-500/20" : "bg-muted text-muted-foreground"
                        )}>
                          {d.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => { setEditingDomain(d); setIsFormOpen(true); }} className="h-8 text-primary uppercase text-[10px] font-bold">Edit</Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(d.id)} className="h-8 text-destructive uppercase text-[10px] font-bold">Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            )}
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

