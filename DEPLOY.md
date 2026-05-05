# Aspivox cPanel Deployment Guide

This project is built with React + Vite and uses Supabase for the backend. It is designed to be deployed as static files on cPanel shared hosting.

## Steps to Deploy

### 1. Build the Project
Run the following command in your local terminal:
```bash
npm run build
```
This will generate a `dist/` folder containing all the static files.

### 2. Prepare for Upload
- Open your cPanel **File Manager**.
- Navigate to the `public_html` directory (or the subdirectory where you want to host the site).
- Ensure "Show Hidden Files" is enabled in the File Manager settings to see the `.htaccess` file.

### 3. Upload Files
- Upload all contents of the `dist/` folder directly into `public_html`.
- **Crucial:** Make sure the `.htaccess` file from the `dist/` folder (which was copied from `public/.htaccess`) is uploaded. This file handles React Router navigation on Apache servers.

### 4. Environment Variables
- Since this is a static build, your Supabase environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`) are "baked into" the JavaScript bundle during the `npm run build` process.
- You **do not** need to (and should not) upload the `.env` file to the server.
- The keys are already included in the minified JavaScript files.

### 5. Troubleshooting
- **404 on Refresh:** If you get a 404 error when refreshing a page other than the home page, ensure the `.htaccess` file is present in `public_html`.
- **API Errors:** If Supabase fails to connect, verify that your `.env` file had the correct credentials *before* you ran `npm run build`.

---
© 2026 Aspivox Edutech
