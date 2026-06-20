import React, { createContext, useContext, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';
import { Database } from '../types/database';

type StudentProfile = Database['public']['Tables']['students']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  studentProfile: StudentProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (data: { email: string; password: any }) => Promise<{ error: any }>;
  signUp: (data: { email: string; password: any; full_name: string; phone: string; college: string; city: string }) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'shahid.aspivox@zohomail.in'.toLowerCase();

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const clearAuth = () => {
    setUser(null);
    setSession(null);
    setStudentProfile(null);
    setIsAdmin(false);
  };

  const syncAuth = async (currSession: Session | null) => {
    if (!currSession?.user) {
      clearAuth();
      setLoading(false);
      return;
    }

    const currUser = currSession.user;
    setUser(currUser);
    setSession(currSession);
    setIsAdmin(currUser.email?.toLowerCase() === ADMIN_EMAIL);

    try {
      const { data } = await supabase
        .from('students')
        .select('*')
        .eq('id', currUser.id)
        .single();
      setStudentProfile(data);
    } catch (err) {
      console.error('Profile sync error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) {
      clearAuth();
      setLoading(false);
      return;
    }

    // Initial sync
    supabase.auth.getSession().then(({ data: { session } }) => {
      syncAuth(session);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      syncAuth(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (data: { email: string; password: any }) => {
    if (!isSupabaseConfigured) {
      return { error: { message: 'Supabase is not configured.' } };
    }

    return await supabase.auth.signInWithPassword(data);
  };

  const signUp = async (data: { email: string; password: any; full_name: string; phone: string; college: string; city: string }) => {
    if (!isSupabaseConfigured) {
      return { error: { message: 'Supabase is not configured.' } };
    }

    const { email, password, ...metadata } = data;
    return await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      clearAuth();
      return;
    }

    await supabase.auth.signOut();
    clearAuth();
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, session, studentProfile, loading, isAdmin, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
