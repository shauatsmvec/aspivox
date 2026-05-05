import { createBrowserRouter, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Courses from "./pages/Courses";
import Internship from "./pages/Internship";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import { StudentsList, EnrollmentsList, ApplicationsList, ContactsList, StatsManager, CoursesManager, TeamManager } from "./pages/admin/AdminSubPages";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/courses",
    element: <Courses />,
  },
  {
    path: "/internship",
    element: <Internship />,
  },
  {
    path: "/about",
    element: <About />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
    ],
  },
  {
    element: <ProtectedRoute adminOnly />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout />,
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: "courses",
            element: <CoursesManager />,
          },
          {
            path: "students",
            element: <StudentsList />,
          },
          {
            path: "enrollments",
            element: <EnrollmentsList />,
          },
          {
            path: "applications",
            element: <ApplicationsList />,
          },
          {
            path: "contacts",
            element: <ContactsList />,
          },
          {
            path: "team",
            element: <TeamManager />,
          },
          {
            path: "stats",
            element: <StatsManager />,
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
