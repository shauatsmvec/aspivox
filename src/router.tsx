import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Courses = lazy(() => import("./pages/Courses"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const Internship = lazy(() => import("./pages/Internship"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const CertificateValidator = lazy(() => import("./pages/CertificateValidator"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));

// Admin SubPages
const StudentsList = lazy(() => import("./pages/admin/AdminSubPages").then(m => ({ default: m.StudentsList })));
const EnrollmentsList = lazy(() => import("./pages/admin/AdminSubPages").then(m => ({ default: m.EnrollmentsList })));
const ApplicationsList = lazy(() => import("./pages/admin/AdminSubPages").then(m => ({ default: m.ApplicationsList })));
const ContactsList = lazy(() => import("./pages/admin/AdminSubPages").then(m => ({ default: m.ContactsList })));
const StatsManager = lazy(() => import("./pages/admin/AdminSubPages").then(m => ({ default: m.StatsManager })));
const CoursesManager = lazy(() => import("./pages/admin/AdminSubPages").then(m => ({ default: m.CoursesManager })));
const TeamManager = lazy(() => import("./pages/admin/AdminSubPages").then(m => ({ default: m.TeamManager })));
const InstructorManager = lazy(() => import("./pages/admin/AdminSubPages").then(m => ({ default: m.InstructorManager })));
const ActivityLogs = lazy(() => import("./pages/admin/AdminSubPages").then(m => ({ default: m.ActivityLogs })));
const DomainsManager = lazy(() => import("./pages/admin/AdminSubPages").then(m => ({ default: m.DomainsManager })));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const InstructorDashboard = lazy(() => import("./pages/InstructorDashboard"));

// A simple fallback loader to show while the chunk is downloading
const SuspenseFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<SuspenseFallback />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(Index),
  },
  {
    path: "/courses",
    element: withSuspense(Courses),
  },
  {
    path: "/courses/:slug",
    element: withSuspense(CourseDetail),
  },
  {
    path: "/internship",
    element: withSuspense(Internship),
  },
  {
    path: "/about",
    element: withSuspense(About),
  },
  {
    path: "/contact",
    element: withSuspense(Contact),
  },
  {
    path: "/login",
    element: withSuspense(Login),
  },
  {
    path: "/signup",
    element: withSuspense(Signup),
  },
  {
    path: "/forgot-password",
    element: withSuspense(ForgotPassword),
  },
  {
    path: "/reset-password",
    element: withSuspense(ResetPassword),
  },
  {
    path: "/verify",
    element: withSuspense(CertificateValidator),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: withSuspense(Dashboard),
      },
      {
        path: "/instructor-dashboard",
        element: withSuspense(InstructorDashboard),
      },
    ],
  },
  {
    element: <ProtectedRoute adminOnly />,
    children: [
      {
        path: "/admin",
        element: withSuspense(AdminLayout),
        children: [
          {
            index: true,
            element: withSuspense(AdminDashboard),
          },
          {
            path: "courses",
            element: withSuspense(CoursesManager),
          },
          {
            path: "students",
            element: withSuspense(StudentsList),
          },
          {
            path: "enrollments",
            element: withSuspense(EnrollmentsList),
          },
          {
            path: "applications",
            element: withSuspense(ApplicationsList),
          },
          {
            path: "contacts",
            element: withSuspense(ContactsList),
          },
           {
            path: "team",
            element: withSuspense(TeamManager),
          },
          {
            path: "instructors",
            element: withSuspense(InstructorManager),
          },
          {
            path: "domains",
            element: withSuspense(DomainsManager),
          },
          {
            path: "logs",
            element: withSuspense(ActivityLogs),
          },
          {
            path: "stats",
            element: withSuspense(StatsManager),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: withSuspense(NotFound),
  },
]);
