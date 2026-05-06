-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.certificates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  certificate_code text NOT NULL UNIQUE,
  enrollment_id uuid,
  student_name text NOT NULL,
  course_name text NOT NULL,
  issued_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT certificates_pkey PRIMARY KEY (id),
  CONSTRAINT certificates_enrollment_id_fkey FOREIGN KEY (enrollment_id) REFERENCES public.enrollments(id)
);
CREATE TABLE public.contact_submissions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text,
  message text NOT NULL,
  submitted_at timestamp with time zone DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  CONSTRAINT contact_submissions_pkey PRIMARY KEY (id)
);
CREATE TABLE public.courses (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  duration_weeks integer,
  price numeric DEFAULT 0,
  is_free boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT courses_pkey PRIMARY KEY (id)
);
CREATE TABLE public.enrollments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  course_id uuid,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'active'::text, 'completed'::text, 'cancelled'::text])),
  enrolled_at timestamp with time zone DEFAULT now(),
  revocation_reason text,
  revoked_at timestamp with time zone,
  CONSTRAINT enrollments_pkey PRIMARY KEY (id),
  CONSTRAINT enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id),
  CONSTRAINT enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id)
);
CREATE TABLE public.instructors (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  full_name text NOT NULL,
  designation text,
  bio text,
  image_url text,
  created_at timestamp with time zone DEFAULT now(),
  password text,
  CONSTRAINT instructors_pkey PRIMARY KEY (id)
);
CREATE TABLE public.internship_applications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  student_id uuid,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  college text NOT NULL,
  duration integer NOT NULL CHECK (duration = ANY (ARRAY[15, 30, 45, 60, 90])),
  preferred_domain text,
  message text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'reviewing'::text, 'accepted'::text, 'rejected'::text])),
  submitted_at timestamp with time zone DEFAULT now(),
  CONSTRAINT internship_applications_pkey PRIMARY KEY (id),
  CONSTRAINT internship_applications_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.students(id)
);
CREATE TABLE public.lms_classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid,
  title text NOT NULL,
  scheduled_at timestamp with time zone NOT NULL,
  meeting_link text NOT NULL,
  notes_link text,
  recording_link text,
  created_at timestamp with time zone DEFAULT now(),
  is_completed boolean DEFAULT false,
  instructor_name text,
  instructor_role text,
  instructor_id uuid,
  CONSTRAINT lms_classes_pkey PRIMARY KEY (id),
  CONSTRAINT lms_classes_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(id),
  CONSTRAINT lms_classes_instructor_id_fkey FOREIGN KEY (instructor_id) REFERENCES public.instructors(id)
);
CREATE TABLE public.site_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  created_at timestamp with time zone DEFAULT now(),
  action text NOT NULL,
  details text,
  user_email text,
  ip_address text,
  CONSTRAINT site_logs_pkey PRIMARY KEY (id)
);
CREATE TABLE public.site_stats (
  key text NOT NULL,
  value integer NOT NULL,
  label text NOT NULL,
  suffix text DEFAULT ''::text,
  CONSTRAINT site_stats_pkey PRIMARY KEY (key)
);
CREATE TABLE public.students (
  id uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  college text,
  city text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT students_pkey PRIMARY KEY (id),
  CONSTRAINT students_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.team_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  designation text NOT NULL,
  display_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  bio text,
  image_url text,
  email text,
  CONSTRAINT team_members_pkey PRIMARY KEY (id)
);

CREATE TABLE public.domains (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT domains_pkey PRIMARY KEY (id)
);