# Vercel Deployment Guide for TinyLink

This guide will walk you through deploying your TinyLink URL shortener to Vercel.

## Prerequisites

1. ✅ GitHub account (free)
2. ✅ Vercel account (free)
3. ✅ Neon PostgreSQL database (or any PostgreSQL database)
4. ✅ Your project code ready

## Step 1: Prepare Your Project

### 1.1 Ensure Your Code is Ready

Make sure your project has:
- ✅ All files committed
- ✅ `.env.example` file (for reference)
- ✅ `package.json` with all dependencies
- ✅ `next.config.js` configured
- ✅ `prisma/schema.prisma` set up

### 1.2 Create a `.vercelignore` file (Optional)

Create `.vercelignore` to exclude unnecessary files:
```
node_modules
.next
.env
.env.local
*.log
```

## Step 2: Push to GitHub

### 2.1 Initialize Git (if not already done)

```bash
git init
git add .
git commit -m "Initial commit - TinyLink URL Shortener"
```

### 2.2 Create GitHub Repository

1. Go to [GitHub](https://github.com)
2. Click **"New repository"** (or the **+** icon)
3. Name it: `tinylink` (or any name you prefer)
4. Choose **Public** or **Private**
5. **Don't** initialize with README, .gitignore, or license
6. Click **"Create repository"**

### 2.3 Push Your Code

```bash
# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/tinylink.git

# Push your code
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 3: Set Up Vercel Account

### 3.1 Sign Up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"** (recommended)
4. Authorize Vercel to access your GitHub account

## Step 4: Deploy to Vercel

### 4.1 Import Your Project

1. After logging in, click **"Add New..."** → **"Project"**
2. You'll see your GitHub repositories
3. Find and click **"Import"** next to your `tinylink` repository

### 4.2 Configure Project Settings

Vercel will auto-detect Next.js. Configure:

**Project Name:** `tinylink` (or your preferred name)

**Framework Preset:** Next.js (should be auto-detected)

**Root Directory:** `./` (leave as default)

**Build Command:** 
```
npm run build
```
(Should be auto-detected)

**Output Directory:** 
```
.next
```
(Should be auto-detected)

**Install Command:**
```
npm install
```
(Should be auto-detected)

### 4.3 Environment Variables

**IMPORTANT:** Add your environment variables before deploying!

Click **"Environment Variables"** and add:

1. **DATABASE_URL**
   - Name: `DATABASE_URL`
   - Value: Your PostgreSQL connection string
   - Example: `postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require`
   - Add to: Production, Preview, Development (all three)

2. **NEXT_PUBLIC_BASE_URL**
   - Name: `NEXT_PUBLIC_BASE_URL`
   - Value: `https://your-project-name.vercel.app` (you'll get this after first deploy)
   - Or use: `https://YOUR_CUSTOM_DOMAIN.com` if you have one
   - Add to: Production, Preview, Development (all three)

**Note:** After the first deployment, Vercel will give you a URL. Update `NEXT_PUBLIC_BASE_URL` with that URL.

### 4.4 Deploy!

1. Click **"Deploy"** button
2. Wait for the build to complete (2-5 minutes)
3. You'll see build logs in real-time

## Step 5: Post-Deployment Setup

### 5.1 Get Your Deployment URL

After deployment completes:
- You'll see: `https://your-project-name.vercel.app`
- Copy this URL

### 5.2 Update Environment Variables

1. Go to your project settings in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_BASE_URL` with your actual Vercel URL:
   ```
   https://your-project-name.vercel.app
   ```
4. Click **"Save"**

### 5.3 Run Database Migrations

You need to set up your database tables. You have two options:

**Option A: Using Vercel CLI (Recommended)**

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Link your project:
   ```bash
   vercel link
   ```

4. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

5. Run Prisma migrations:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

**Option B: Using Neon Console**

1. Go to your Neon dashboard
2. Open SQL Editor
3. Run the Prisma migration SQL manually (or use Neon's migration tool)

**Option C: Add Build Command (Easiest)**

Update your `package.json` build script to include Prisma:

```json
{
  "scripts": {
    "build": "prisma generate && next build",
    "postinstall": "prisma generate"
  }
}
```

Then redeploy on Vercel.

### 5.4 Redeploy (if needed)

If you updated environment variables or build commands:
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. Or push a new commit to trigger auto-deployment

## Step 6: Verify Deployment

### 6.1 Test Your Application

1. Visit: `https://your-project-name.vercel.app`
2. Test the dashboard
3. Create a test link
4. Test the redirect functionality
5. Check the health endpoint: `https://your-project-name.vercel.app/healthz`

### 6.2 Check Logs

If something doesn't work:
1. Go to **Deployments** tab
2. Click on your deployment
3. Check **"Build Logs"** and **"Function Logs"** for errors

## Step 7: Custom Domain (Optional)

### 7.1 Add Custom Domain

1. Go to **Settings** → **Domains**
2. Enter your domain name
3. Follow Vercel's DNS configuration instructions
4. Update `NEXT_PUBLIC_BASE_URL` with your custom domain

## Troubleshooting

### Issue: Build Fails

**Solution:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify `package.json` scripts are correct
- Check for TypeScript errors locally first

### Issue: Database Connection Error

**Solution:**
- Verify `DATABASE_URL` is set correctly in Vercel
- Check if your database allows connections from Vercel IPs
- For Neon: Ensure connection pooling is enabled
- Check database credentials

### Issue: Environment Variables Not Working

**Solution:**
- Ensure variables are added to all environments (Production, Preview, Development)
- Redeploy after adding new variables
- Check variable names match exactly (case-sensitive)

### Issue: Prisma Client Not Found

**Solution:**
- Add `"postinstall": "prisma generate"` to `package.json`
- Or add `prisma generate` to build command
- Redeploy

### Issue: 404 on Routes

**Solution:**
- Ensure you're using Next.js App Router correctly
- Check file structure matches route structure
- Verify `next.config.js` is correct

## Quick Reference Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] Can create new links
- [ ] Redirects work correctly
- [ ] Database connection working
- [ ] Environment variables set
- [ ] Health check endpoint works
- [ ] Custom domain configured (if applicable)
- [ ] Analytics/monitoring set up (optional)

## Support

- Vercel Docs: https://vercel.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Vercel Support: https://vercel.com/support

---

**Congratulations!** 🎉 Your TinyLink application is now live on Vercel!

