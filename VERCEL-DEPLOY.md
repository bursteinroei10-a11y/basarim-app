# Deploy to Vercel — Copy-Paste Guide

## Step 1: Go to Vercel

1. Open: **https://vercel.com**
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"** and approve access

---

## Step 2: Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Find **basarim-app** in the list
3. Click **"Import"**

---

## Step 3: Add Environment Variables

Before clicking Deploy, click **"Environment Variables"** and add these **one by one**:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Copy from your `.env` file (the long postgresql://... line) |
| `AUTH_SECRET` | Copy from your `.env` file (or run: `openssl rand -base64 32`) |
| `ADMIN_EMAIL` | Your email (e.g. the one you use for Gmail) |
| `ADMIN_PASSWORD` | A password you choose (min 8 characters, for logging into /admin) |

For each row: type the **Name**, paste the **Value**, then click **"Add"**.

---

## Step 4: Deploy

1. Click **"Deploy"**
2. Wait 1–2 minutes
3. When it’s done, click **"Visit"** to open your site

---

## Step 5: Set Your Live URL (Optional)

After the first deployment:

1. Go to **Project Settings** → **Environment Variables**
2. Add: `NEXT_PUBLIC_SITE_URL` = `https://your-project-name.vercel.app` (your actual URL)

---

Done. Your site is live.

---

**Tip:** Update your local `.env` with the same `ADMIN_EMAIL` and `ADMIN_PASSWORD` so you can test admin login locally too.
