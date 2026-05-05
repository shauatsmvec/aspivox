import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ adminOnly = false }) => {
  const { user, isAdmin, loading } = useAuth();
  
  console.log('ProtectedRoute Check:', { 
    path: window.location.pathname, 
    userEmail: user?.email, 
    isAdmin, 
    loading,
    adminOnly 
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: No user found, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    console.log('ProtectedRoute: User is not admin, redirecting to /');
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
