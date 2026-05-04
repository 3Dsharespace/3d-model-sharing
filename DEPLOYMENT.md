# 🚀 ModelShare MVP Deployment Guide

## Overview

This guide will help you deploy your cleaned-up ModelShare MVP to Vercel with Supabase integration.

## Prerequisites

- ✅ Cleaned codebase (completed)
- ✅ Supabase project set up
- ✅ Database schema updated
- ✅ Environment variables ready

## Step 1: Database Cleanup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `database_cleanup.sql`
4. Execute all commands
5. Verify only these tables remain:
  - `profiles`
  - `models` 
  - `downloads`

## Step 2: Push to GitHub

```bash
# Create new branch for MVP
git checkout -b mvp-clean

# Add all changes
git add .

# Commit changes
git commit -m "Clean up codebase for MVP deployment"

# Push to GitHub
git push origin mvp-clean
```

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Select the `mvp-clean` branch
5. Configure build settings:
  - **Framework Preset**: Vite
  - **Build Command**: `npm run build`
  - **Output Directory**: `dist`
  - **Install Command**: `npm install`

## Step 4: Environment Variables

In Vercel project settings, add these environment variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**To find these values:**

1. Go to Supabase Dashboard → Settings → API
2. Copy "Project URL" → `VITE_SUPABASE_URL`
3. Copy "anon public" key → `VITE_SUPABASE_ANON_KEY`

## Step 5: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your app will be live at the provided URL

## Step 6: Test Core Features

Test these MVP features:

- ✅ User signup/login
- ✅ Upload 3D model
- ✅ Browse models on home page
- ✅ View model details
- ✅ Download model (check counter in DB)
- ✅ View user profiles

## Step 7: Custom Domain (Optional)

1. In Vercel project settings, go to "Domains"
2. Add your custom domain
3. Update DNS records as instructed

## Troubleshooting

### Build Errors

- Check that all dependencies are in `package.json`
- Verify Node.js version compatibility
- Check build logs for specific errors

### Environment Variables

- Ensure variables start with `VITE_`
- Check for typos in variable names
- Redeploy after adding variables

### Database Issues

- Verify Supabase connection
- Check RLS policies are correct
- Test with sample data

## File Structure After Cleanup

```
frontend/src/
├── components/
│   ├── Layout.jsx              # Main layout with navigation
│   └── ui/                     # UI components (ThemeToggle, UserMenu)
├── contexts/
│   ├── AuthContext.jsx         # Authentication state
│   └── ThemeContext.jsx        # Theme management
├── lib/
│   └── supabase.js             # Supabase client
├── pages/
│   ├── Home.jsx                # Landing page with recent models
│   ├── Login.jsx               # User login
│   ├── Signup.jsx              # User registration
│   ├── Upload.jsx              # Model upload form
│   ├── ProfileView.jsx         # User profile display
│   ├── ModelDetail.jsx         # Individual model view
│   └── ForgotPassword.jsx      # Password reset
└── App.jsx                     # Main routing
```

## What Was Removed

- ❌ Comments system
- ❌ Like/unlike functionality
- ❌ Follow creators
- ❌ Payment system
- ❌ Admin dashboard
- ❌ Advanced analytics
- ❌ Explore page with filters
- ❌ Model management pages

## What Remains (MVP Core)

- ✅ User authentication (signup/login)
- ✅ Model upload with drag & drop
- ✅ Home page with recent models
- ✅ Model detail pages
- ✅ User profiles
- ✅ Download tracking
- ✅ Light/dark mode
- ✅ Responsive design

## Next Steps After Deployment

1. Test all core functionality
2. Add sample models for testing
3. Customize branding/colors
4. Add analytics (optional)
5. Set up monitoring

## Support

If you encounter issues:

1. Check Vercel build logs
2. Verify Supabase connection
3. Test locally first
4. Check browser console for errors

---

**Your MVP is now ready for production! 🎉**