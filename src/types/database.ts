export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      courses: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          duration_weeks: number | null
          price: number
          is_free: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          duration_weeks?: number | null
          price?: number
          is_free?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          duration_weeks?: number | null
          price?: number
          is_free?: boolean
          is_active?: boolean
          created_at?: string
        }
      }
      students: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          college: string | null
          city: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          phone?: string | null
          college?: string | null
          city?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string | null
          college?: string | null
          city?: string | null
          created_at?: string
        }
      }
      enrollments: {
        Row: {
          id: string
          student_id: string
          course_id: string
          status: 'pending' | 'active' | 'completed' | 'cancelled'
          enrolled_at: string
          revocation_reason: string | null
          revoked_at: string | null
        }
        Insert: {
          id?: string
          student_id: string
          course_id: string
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          enrolled_at?: string
          revocation_reason?: string | null
          revoked_at?: string | null
        }
        Update: {
          id?: string
          student_id?: string
          course_id?: string
          status?: 'pending' | 'active' | 'completed' | 'cancelled'
          enrolled_at?: string
          revocation_reason?: string | null
          revoked_at?: string | null
        }
      }
      internship_applications: {
        Row: {
          id: string
          student_id: string | null
          full_name: string
          email: string
          phone: string
          college: string
          duration: 15 | 30 | 45 | 60 | 90
          preferred_domain: string | null
          message: string | null
          status: 'pending' | 'reviewing' | 'accepted' | 'rejected'
          submitted_at: string
        }
        Insert: {
          id?: string
          student_id?: string | null
          full_name: string
          email: string
          phone: string
          college: string
          duration: 15 | 30 | 45 | 60 | 90
          preferred_domain?: string | null
          message?: string | null
          status?: 'pending' | 'reviewing' | 'accepted' | 'rejected'
          submitted_at?: string
        }
        Update: {
          id?: string
          student_id?: string | null
          full_name?: string
          email?: string
          phone?: string
          college?: string
          duration?: 15 | 30 | 45 | 60 | 90
          preferred_domain?: string | null
          message?: string | null
          status?: 'pending' | 'reviewing' | 'accepted' | 'rejected'
          submitted_at?: string
        }
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          subject: string | null
          message: string
          submitted_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          subject?: string | null
          message: string
          submitted_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          subject?: string | null
          message?: string
          submitted_at?: string
        }
      }
      team_members: {
        Row: {
          id: string
          name: string
          designation: string
          display_order: number
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          designation: string
          display_order?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          designation?: string
          display_order?: number
          is_active?: boolean
        }
      }
      site_stats: {
        Row: {
          key: string
          value: number
          label: string
        }
        Insert: {
          key: string
          value: number
          label: string
        }
        Update: {
          key?: string
          value?: number
          label?: string
        }
      }
      certificates: {
        Row: {
          id: string
          certificate_code: string
          enrollment_id: string
          student_name: string
          course_name: string
          issued_at: string
        }
        Insert: {
          id?: string
          certificate_code: string
          enrollment_id: string
          student_name: string
          course_name: string
          issued_at?: string
        }
        Update: {
          id?: string
          certificate_code?: string
          enrollment_id?: string
          student_name?: string
          course_name?: string
          issued_at?: string
        }
      }
      lms_classes: {
        Row: {
          id: string
          course_id: string
          title: string
          scheduled_at: string
          meeting_link: string
          notes_link: string | null
          recording_link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          scheduled_at: string
          meeting_link: string
          notes_link?: string | null
          recording_link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          course_id?: string
          title?: string
          scheduled_at?: string
          meeting_link?: string
          notes_link?: string | null
          recording_link?: string | null
          created_at?: string
        }
      }
    }
  }
}
