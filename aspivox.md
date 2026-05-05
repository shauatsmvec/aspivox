You are a senior full-stack developer. I have an existing React + Tailwind CSS frontend project (built with Lovable/Vite) for "Aspivox" — an EduTech company. The project currently has NO backend — everything is hardcoded static data.

Your job is to convert this into a complete, production-ready full-stack system using Supabase as the backend. The final output must be deployable as static files on cPanel shared hosting (no Node.js server, no Django, no PHP — just the Vite build output uploaded to public_html).

---

TECH STACK:
- Frontend: React + Vite + Tailwind CSS (already exists)
- Backend: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- Supabase JS Client: @supabase/supabase-js
- Forms: React Hook Form + Zod validation
- State: React Context API (no Redux needed)
- Routing: React Router v6
- Notifications: react-hot-toast
- Deployment: Vite static build → cPanel public_html via FTP

---

STEP 1 — SUPABASE SETUP

Create a file called `supabase/schema.sql` with the complete SQL to set up the database. Include all of these tables:
```sql
-- Courses table
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

-- Insert the 9 default courses
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

-- Students (extends Supabase auth.users)
CREATE TABLE students (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  college TEXT,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments
CREATE TABLE enrollments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- Internship applications
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

-- Contact form submissions
CREATE TABLE contact_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team members (so admin can update without code changes)
CREATE TABLE team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  designation TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

INSERT INTO team_members (name, designation, display_order) VALUES
('Vishnu Prasad M', 'Founder & CEO', 1),
('Shahid Khan N', 'Chief Operating Officer', 2),
('Velu M', 'Chief Technology Officer', 3),
('Sofiamehake', 'Chief Human Resources Officer', 4),
('Sairam', 'Director of Marketing', 5),
('Jeeva S', 'Marketing Manager', 6),
('Rajalakshmi S', 'Engineering Manager', 7),
('Jawahira Banu S', 'Team Lead', 8);

-- Site stats (dynamic counter data)
CREATE TABLE site_stats (
  key TEXT PRIMARY KEY,
  value INTEGER NOT NULL,
  label TEXT NOT NULL
);

INSERT INTO site_stats (key, value, label) VALUES
('students_trained', 70, 'Students Trained'),
('courses_offered', 9, 'Courses Offered'),
('internship_options', 5, 'Internship Duration Options'),
('years_active', 1, 'Year of Impact');

-- Row Level Security policies
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_stats ENABLE ROW LEVEL SECURITY;

-- Public read access for courses, team, stats
CREATE POLICY "Public can view courses" ON courses FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view team" ON team_members FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view stats" ON site_stats FOR SELECT TO anon USING (true);

-- Students can read/update their own profile
CREATE POLICY "Students read own profile" ON students FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Students update own profile" ON students FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Students insert own profile" ON students FOR INSERT WITH CHECK (auth.uid() = id);

-- Students can read their own enrollments
CREATE POLICY "Students view own enrollments" ON enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students create enrollment" ON enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);

-- Anyone can submit contact/internship forms
CREATE POLICY "Anyone can submit contact" ON contact_submissions FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anyone can apply internship" ON internship_applications FOR INSERT TO anon WITH CHECK (true);
```

---

STEP 2 — SUPABASE CLIENT SETUP

Create `src/lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Create `.env` (and add to .gitignore):

VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

---

STEP 3 — AUTH CONTEXT

Create `src/context/AuthContext.jsx` with a complete AuthProvider that:
- Tracks the current user session using supabase.auth.onAuthStateChange
- Exposes: user, studentProfile, loading, signUp, signIn, signOut
- On signup, also inserts a row into the students table with the user's profile data
- Wraps the entire app in App.jsx

The signUp function signature:
```javascript
signUp({ email, password, full_name, phone, college, city })
```

---

STEP 4 — PAGES TO BUILD

Build these pages using React Router. Create `src/router.jsx` with all routes:

**Public pages (no login needed):**
- `/` — Home (existing, but now fetches courses, team, stats from Supabase)
- `/courses` — All courses list page, fetched from Supabase courses table
- `/courses/:slug` — Individual course detail page with an "Enroll" button
- `/internship` — Internship application page with a working form
- `/about` — About page (static content is fine)
- `/contact` — Contact page with working form that saves to contact_submissions
- `/login` — Login page
- `/signup` — Signup page (collects name, email, password, phone, college, city)

**Protected pages (requires login):**
- `/dashboard` — Student dashboard showing enrolled courses, profile
- `/dashboard/enroll/:courseId` — Confirm enrollment flow

**Admin pages (protected, check if user email is admin email):**
- `/admin` — Admin dashboard showing: total students, total enrollments, contact submissions, internship applications
- `/admin/students` — List all students
- `/admin/enrollments` — List all enrollments, change status
- `/admin/applications` — List internship applications, change status
- `/admin/contacts` — View all contact form submissions
- `/admin/stats` — Edit the site_stats values (so admin can update the counter numbers)

Admin check: if the logged-in user's email equals `vishnu@aspivox.in` (hardcoded admin email), show admin nav links.

---

STEP 5 — KEY COMPONENTS TO BUILD OR UPDATE

**src/components/CourseCard.jsx**
- Fetches from Supabase, not hardcoded
- "Enroll Now" button: if not logged in → redirect to /login; if logged in → enroll and show success toast

**src/components/ContactForm.jsx**
- React Hook Form + Zod validation
- On submit: insert into contact_submissions table
- Show success toast: "Message sent! We'll get back to you soon."
- Show error toast if it fails

**src/components/InternshipForm.jsx**
- Fields: full name, email, phone, college, duration (select: 15/30/45/60/90 days), preferred domain (select from course list), message
- On submit: insert into internship_applications
- Success toast: "Application submitted! We'll reach out within 2 business days."

**src/components/StatsCounter.jsx**
- Fetch values from site_stats table in Supabase
- Animate count-up on scroll into view

**src/components/Navbar.jsx**
- If logged in: show student name + "Dashboard" link + "Logout" button
- If not logged in: show "Login" and "Enroll Now" buttons

---

STEP 6 — STUDENT DASHBOARD (src/pages/Dashboard.jsx)

Show:
- Welcome message: "Welcome back, [student name]"
- Profile card: name, email, college, joined date — with an "Edit Profile" button
- "My Courses" section: list enrolled courses with status badges (pending / active / completed)
- "Apply for Internship" CTA card linking to /internship
- Empty state if no enrollments: "You haven't enrolled in any courses yet. Browse Courses →"

---

STEP 7 — ADMIN DASHBOARD (src/pages/Admin.jsx)

Stats overview cards:
- Total students (count from students table)
- Total enrollments (count from enrollments table)
- Pending internship applications (count where status = 'pending')
- New contact messages (count from last 7 days)

Each admin sub-page is a simple table with:
- Sortable columns
- Status dropdown to change status inline (updates Supabase row immediately)
- Search/filter by name or email

---

STEP 8 — REMOVE LOVABLE BADGE

Find any component that renders the "Edit with Lovable" badge or link and delete it completely. Search for "lovable" in all files and remove every reference.

---

STEP 9 — VITE BUILD CONFIG FOR CPANEL

Update `vite.config.js`:
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  base: '/',  // change to '/aspivox/' if hosting in a subdirectory
})
```

Create `public/.htaccess` (critical for React Router to work on cPanel Apache):
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QR,L]
```

Create `DEPLOY.md` with step-by-step cPanel deployment instructions:
1. Run `npm run build`
2. Open cPanel File Manager → navigate to public_html
3. Upload all contents of the `dist/` folder to public_html
4. Make sure `.htaccess` is uploaded (enable "Show Hidden Files" in File Manager)
5. Set environment variables: since this is a static build, the VITE_ env vars are baked into the bundle at build time — never commit the .env file, the keys are already in the bundle

---

STEP 10 — PACKAGE INSTALLS NEEDED

Run these installs:
```bash
npm install @supabase/supabase-js react-router-dom react-hook-form zod @hookform/resolvers react-hot-toast
```

---

STEP 11 — FINAL CHECKLIST

After building everything, verify:
- [ ] Home page stats are fetched from Supabase, not hardcoded
- [ ] All 9 courses are fetched from Supabase courses table
- [ ] Team section is fetched from team_members table
- [ ] Contact form saves to database and shows toast
- [ ] Internship form saves to database and shows toast
- [ ] Signup creates auth user AND student profile row
- [ ] Login redirects to /dashboard
- [ ] Dashboard shows real enrolled courses from Supabase
- [ ] Enrolling in a course checks for duplicate (show "Already enrolled" if so)
- [ ] Admin dashboard shows real counts
- [ ] Admin can change enrollment/application status
- [ ] Lovable badge is completely removed
- [ ] .htaccess is in the public/ folder for cPanel routing
- [ ] npm run build completes without errors
- [ ] No hardcoded data remains anywhere in the JSX

---

IMPORTANT NOTES FOR YOU AS YOU BUILD:
- Never use localStorage for auth — Supabase handles session storage automatically
- Always use Supabase RLS policies for security — never expose the service_role key in frontend code, only use the anon key
- The VITE_SUPABASE_ANON_KEY is safe to expose in frontend code — it's designed for that
- For admin features, the RLS policies above only allow reading. To let admin see all rows (e.g. all students), you'll need to add admin policies like: CREATE POLICY "Admin sees all" ON students FOR SELECT USING (auth.jwt() ->> 'email' = 'vishnu@aspivox.in');
- Run the schema.sql in Supabase SQL Editor before testing anything

Start by reading all existing files in the project, then make changes incrementally. Do not delete any existing UI design — preserve all styling and layout. Only add functionality on top of what exists.