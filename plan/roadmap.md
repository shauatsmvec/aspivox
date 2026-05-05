# Aspivox Roadmap & Feature Plan

This document outlines the missing features and required improvements to transition the current Aspivox prototype into a fully functional Ed-Tech platform.

## 1. Frontend (Public Website)
- [ ] **Course Detail Pages (`/courses/:slug`):** Dedicated landing pages for each course showing full syllabus, FAQs, and mentor info.
- [ ] **Payment Gateway Integration:** Integration with Razorpay or Stripe to handle real transactions.
- [ ] **Manual Payment Verification:** Option for students to upload payment receipts for manual admin approval.
- [ ] **Media Integration:** Use Supabase Storage for course thumbnails and real team member photos.
- [ ] **Legal Suite:** Implementation of Privacy Policy, Terms of Service, and Refund Policy pages.
- [ ] **Auth Enhancements:** Password reset flow and email verification status indicators.

## 2. Student Dashboard (Personalized Experience)
- [ ] **Profile Editor:** A form for students to update their personal, college, and contact details.
- [ ] **Learning Modules (LMS):** A section to host live session links, recorded videos, and downloadable resources.
- [ ] **Application Tracker:** Visual status tracking for both course enrollments and internship applications.
- [ ] **Certificate Center:** Automated PDF generation and download for completed courses.
- [ ] **Assignments:** Submission portal for course projects and mentor feedback loop.

## 3. Admin Panel (Control Center)
- [ ] **Asset Management:** Integrated file uploads for courses and team management.
- [ ] **Advanced Data Handling:**
    - Search, filtering, and pagination for all data tables.
    - Export data to CSV/Excel for marketing and reporting.
- [ ] **Enhanced CRUD:** Ability to manually edit or delete student records and applications.
- [ ] **Communication Hub:**
    - Integrated email notifications (via Resend/SendGrid) for status updates.
    - Bulk email tool for course announcements.
- [ ] **Finance Overview:** A simple dashboard to track total revenue and pending payments.

## 4. Technical Debt & DX
- [ ] **Error Boundaries:** Custom error pages to prevent full app crashes.
- [ ] **Form Validation:** Stricter Zod schemas for all admin inputs.
- [ ] **Performance:** Optimization of Spline 3D assets and image lazy loading.

---
*Created on 2026-05-05*
