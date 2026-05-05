# Performance & Efficiency Optimization Plan

This document outlines technical strategies to improve the loading speed, responsiveness, and overall efficiency of the Aspivox platform.

## 1. Code Splitting & Lazy Loading
- [ ] **Route-Level Lazy Loading:** Use `React.lazy()` and `Suspense` for all major pages (Courses, Internship, Admin, Dashboard). This ensures users only download the code for the page they are visiting.
- [ ] **Component-Level Lazy Loading:** Delay the loading of heavy components like the `Spline` 3D scene in the Hero section until the rest of the page is interactive.
- [ ] **Administrative Code Isolation:** Ensure all heavy libraries used only in the Admin panel (e.g., CSV exporters, complex charts) are not loaded for regular students.

## 2. Asset Optimization
- [ ] **Image Optimization:** 
    - Implement `loading="lazy"` for all non-critical images.
    - Convert manual assets to WebP format for smaller file sizes.
    - Use responsive image sizes (different versions for mobile vs desktop).
- [ ] **Spline 3D Scene Optimization:**
    - Implement a placeholder image/gradient while the 3D scene loads.
    - Pause the Spline animation when it's not in the user's viewport.
- [ ] **Font Loading:** Use `font-display: swap` to ensure text remains visible while custom fonts are loading.

## 3. Data Fetching & Caching
- [ ] **React Query Integration:**
    - Replace raw `useEffect` fetches with `@tanstack/react-query`.
    - Implement stale-while-revalidate (SWR) caching for courses and team data.
    - Avoid redundant database calls when switching between tabs.
- [ ] **Query Refinement:**
    - Update Supabase queries to select only required columns (e.g., `.select('title, slug')` instead of `*`).
    - Implement server-side pagination for student and enrollment lists.

## 4. UI/UX Perceived Speed
- [ ] **Skeleton Loaders:** Replace the generic "Loading..." text with animated skeleton pulse loaders that match the layout of the actual cards.
- [ ] **Optimistic Updates:** Immediately update the UI when an admin changes a status or a student enrolls, then sync with the database in the background.
- [ ] **Button State Management:** Implement disabled states and loading spinners inside buttons to prevent double-submissions.

## 5. Bundle Size Management
- [ ] **Tree Shaking:** Audit imports to ensure only necessary parts of heavy libraries (like `lucide-react`) are included in the bundle.
- [ ] **Dependency Audit:** Periodically check for unused packages in `package.json`.

---
*Created on 2026-05-05*
