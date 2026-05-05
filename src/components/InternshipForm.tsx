import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  college: z.string().min(2, "College name must be at least 2 characters"),
  duration: z.string().refine((val) => ["15", "30", "45", "60", "90"].includes(val), {
    message: "Please select a valid duration",
  }),
  preferred_domain: z.string().min(1, "Please select a domain"),
  message: z.string().optional(),
});

const InternshipForm = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { user, studentProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: studentProfile?.full_name || "",
      email: user?.email || "",
      phone: studentProfile?.phone || "",
      college: studentProfile?.college || "",
      duration: "30",
      preferred_domain: "",
      message: "",
    },
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data, error } = await supabase.from('courses').select('title').eq('is_active', true);
        if (error) console.error('Error fetching courses for form:', error);
        else setCourses(data || []);
      } catch (err) {
        console.error('fetchCourses error:', err);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (studentProfile || user) {
      form.reset({
        full_name: studentProfile?.full_name || "",
        email: user?.email || "",
        phone: studentProfile?.phone || "",
        college: studentProfile?.college || "",
        duration: "30",
        preferred_domain: "",
        message: "",
      });
    }
  }, [studentProfile, user, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('internship_applications')
        .insert([{
          ...values,
          duration: parseInt(values.duration),
          student_id: user?.id || null
        }]);

      if (error) {
        toast.error("Application failed: " + error.message);
      } else {
        toast.success("Application submitted! We'll reach out within 2 business days.");
        form.reset();
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john@example.com" {...field} className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+91 0000000000" {...field} className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="college"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground font-medium uppercase tracking-widest text-xs">College Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your College" {...field} className="bg-background border-border text-foreground placeholder:text-muted-foreground h-12 rounded-xl focus:ring-primary" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Duration (Days)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background border-border text-foreground h-12 rounded-xl focus:ring-primary">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    <SelectItem value="15">15 Days</SelectItem>
                    <SelectItem value="30">30 Days</SelectItem>
                    <SelectItem value="45">45 Days</SelectItem>
                    <SelectItem value="60">60 Days</SelectItem>
                    <SelectItem value="90">90 Days</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="preferred_domain"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Preferred Domain</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background border-border text-foreground h-12 rounded-xl focus:ring-primary">
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-popover border-border text-popover-foreground">
                    {courses.map((course) => (
                      <SelectItem key={course.title} value={course.title}>
                        {course.title}
                      </SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-muted-foreground font-medium uppercase tracking-widest text-xs">Message (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us why you want to join..." {...field} rows={4} className="bg-background border-border text-foreground placeholder:text-muted-foreground rounded-xl focus:ring-primary resize-none" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary text-primary-foreground hover:opacity-90 font-bold h-12 rounded-xl transition-all shadow-lg shadow-primary/20 mt-4" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Submitting...
            </>
          ) : "Submit Application"}
        </Button>
      </form>
    </Form>
  );
};

export default InternshipForm;
