-- 1. CLEANUP
DROP TABLE IF EXISTS site_logs, lms_classes, instructors, certificates, site_stats, team_members, contact_submissions, internship_applications, enrollments, students, courses CASCADE;

-- 2. CREATE TABLES

CREATE TABLE courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  duration_weeks INTEGER,
  price DECIMAL(10,2) DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE students (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  college TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

CREATE TABLE internship_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  college TEXT NOT NULL,
  duration INTEGER NOT NULL CHECK (duration IN (15, 30, 45, 60, 90)),
  preferred_domain TEXT,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'accepted', 'rejected')),
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved')),
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE site_stats (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL,
  label TEXT NOT NULL,
  suffix TEXT DEFAULT ''
);

CREATE TABLE instructors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  designation TEXT,
  bio TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE lms_classes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  meeting_link TEXT NOT NULL,
  notes_link TEXT,
  recording_link TEXT,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE site_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  details TEXT,
  user_email TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  certificate_code TEXT NOT NULL UNIQUE,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  issued_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE domains (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. INSERT INITIAL DATA

INSERT INTO courses (title, slug, description, is_free, is_active) VALUES
('Python Programming', 'python', 'Master Python from basics to advanced with real projects.', false, true),
('Java', 'java', 'Build robust applications with Java under expert guidance.', false, true),
('C & C#', 'c-csharp', 'Strong programming fundamentals for every developer.', false, true),
('React JS', 'react', 'Build dynamic frontends with the world''s most popular library.', false, true),
('MERN Stack', 'mern', 'Full-stack web development: MongoDB, Express, React, Node.', false, true),
('Data Science', 'data-science', 'Learn data analysis, visualization, and ML basics.', false, true),
('IoT', 'iot', 'Connect the physical world with smart technology.', false, true),
('Generative AI', 'generative-ai', 'Explore the future of AI with hands-on GenAI projects.', false, true),
('PHP & Web Basics', 'php', 'Build web apps and understand server-side programming.', false, true);

INSERT INTO team_members (name, designation, display_order) VALUES
('Vishnu Prasad M', 'Founder & CEO', 1),
('Shahid Khan N', 'Chief Operating Officer', 2),
('Velu M', 'Chief Technology Officer', 3),
('Sofiamehake', 'Chief Human Resources Officer', 4),
('Sairam', 'Director of Marketing', 5),
('Jeeva S', 'Marketing Manager', 6),
('Rajalakshmi S', 'Engineering Manager', 7),
('Jawahira Banu S', 'Team Lead', 8);

INSERT INTO site_stats (key, value, label, suffix) VALUES
('students_trained', 70, 'Students Trained', '+'),
('courses_offered', 9, 'Courses Offered', ''),
('internship_options', 5, 'Internship Duration Options', ''),
('years_active', 1, 'Year of Impact', '');

-- 4. AUTOMATIC PROFILE TRIGGER (This fixes the Foreign Key Error)

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.students (id, full_name, email, phone, college, city)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', 'New Student'), 
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'college',
    new.raw_user_meta_data->>'city'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. ENABLE ROW LEVEL SECURITY (RLS)

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE lms_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;

-- 6. MASTER POLICIES

-- PUBLIC READ (No Auth)
CREATE POLICY "Public select courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public select team" ON team_members FOR SELECT USING (true);
CREATE POLICY "Public select stats" ON site_stats FOR SELECT USING (true);

-- PUBLIC INSERT (No Auth)
CREATE POLICY "Public insert contact" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public insert applications" ON internship_applications FOR INSERT WITH CHECK (true);

-- STUDENT SELF-SERVICE
CREATE POLICY "Students manage profile" ON students FOR ALL USING (auth.uid() = id);
CREATE POLICY "Students manage enrollments" ON enrollments FOR ALL USING (auth.uid() = student_id);

-- UNIVERSAL ADMIN (shahid.aspivox@zohomail.in)
-- This grants full power based on the lowercased email in the JWT.
CREATE POLICY "Admin master students" ON students FOR ALL USING (LOWER(auth.jwt() ->> 'email') = 'shahid.aspivox@zohomail.in');
CREATE POLICY "Admin master enrollments" ON enrollments FOR ALL USING (LOWER(auth.jwt() ->> 'email') = 'shahid.aspivox@zohomail.in');
CREATE POLICY "Admin master applications" ON internship_applications FOR ALL USING (LOWER(auth.jwt() ->> 'email') = 'shahid.aspivox@zohomail.in');
CREATE POLICY "Admin master contacts" ON contact_submissions FOR ALL USING (LOWER(auth.jwt() ->> 'email') = 'shahid.aspivox@zohomail.in');
CREATE POLICY "Admin master stats" ON site_stats FOR ALL USING (LOWER(auth.jwt() ->> 'email') = 'shahid.aspivox@zohomail.in');
CREATE POLICY "Admin master team" ON team_members FOR ALL USING (LOWER(auth.jwt() ->> 'email') = 'shahid.aspivox@zohomail.in');
CREATE POLICY "Admin master courses" ON courses FOR ALL USING (LOWER(auth.jwt() ->> 'email') = 'shahid.aspivox@zohomail.in');
CREATE POLICY "Admin master logs" ON site_logs FOR ALL USING (LOWER(auth.jwt() ->> 'email') = 'shahid.aspivox@zohomail.in');
CREATE POLICY "Admin master classes" ON lms_classes FOR ALL USING (LOWER(auth.jwt() ->> 'email') = 'shahid.aspivox@zohomail.in');
CREATE POLICY "Admin master instructors" ON instructors FOR ALL USING (LOWER(auth.jwt() ->> 'email') = 'shahid.aspivox@zohomail.in');
CREATE POLICY "Admin master certificates" ON certificates FOR ALL USING (LOWER(auth.jwt() ->> 'email') = 'shahid.aspivox@zohomail.in');
CREATE POLICY "Admin master domains" ON domains FOR ALL USING (LOWER(auth.jwt() ->> 'email') = 'shahid.aspivox@zohomail.in');
CREATE POLICY "Public read domains" ON domains FOR SELECT USING (true);

-- ADDITIONAL ACCESS
CREATE POLICY "Instructors read own classes" ON lms_classes FOR SELECT USING (instructor_id IN (SELECT id FROM instructors WHERE LOWER(email) = LOWER(auth.jwt() ->> 'email')));
CREATE POLICY "Instructors update own classes" ON lms_classes FOR UPDATE USING (instructor_id IN (SELECT id FROM instructors WHERE LOWER(email) = LOWER(auth.jwt() ->> 'email')));
CREATE POLICY "Public read certificates" ON certificates FOR SELECT USING (true);
CREATE POLICY "Public read classes" ON lms_classes FOR SELECT USING (true);
CREATE POLICY "System insert logs" ON site_logs FOR INSERT WITH CHECK (true);
