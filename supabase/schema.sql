-- 1. CLEANUP (Drop existing tables to ensure a fresh start)
DROP TABLE IF EXISTS site_stats, team_members, contact_submissions, internship_applications, enrollments, students, courses CASCADE;

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

-- 6. POLICIES

-- Public Read Access
CREATE POLICY "Public view courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Public view team" ON team_members FOR SELECT USING (true);
CREATE POLICY "Public view stats" ON site_stats FOR SELECT USING (true);

-- Anonymous Submissions
CREATE POLICY "Anyone can submit contact" ON contact_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can apply internship" ON internship_applications FOR INSERT WITH CHECK (true);

-- Student Policies
CREATE POLICY "Students read own profile" ON students FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Students update own profile" ON students FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Students view own enrollments" ON enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students create enrollment" ON enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Admin Policies (shahid.aspivox@zohomail.in)
-- These use auth.jwt() which is the most secure way to check identity in RLS
CREATE POLICY "Admin students" ON students FOR ALL USING (auth.jwt() ->> 'email' = 'shahid.aspivox@zohomail.in');
CREATE POLICY "Admin enrollments" ON enrollments FOR ALL USING (auth.jwt() ->> 'email' = 'shahid.aspivox@zohomail.in');
CREATE POLICY "Admin applications" ON internship_applications FOR ALL USING (auth.jwt() ->> 'email' = 'shahid.aspivox@zohomail.in');
CREATE POLICY "Admin contacts" ON contact_submissions FOR ALL USING (auth.jwt() ->> 'email' = 'shahid.aspivox@zohomail.in');
CREATE POLICY "Admin stats" ON site_stats FOR ALL USING (auth.jwt() ->> 'email' = 'shahid.aspivox@zohomail.in');

-- NOTE: If you are having trouble with admin access, ensure your email is confirmed in Supabase.
-- You can manually confirm a user in the Supabase Dashboard: Authentication > Users > (User) > Confirm User.
-- Or disable email confirmation: Authentication > Settings > Email Auth > Confirm email (toggle off).
