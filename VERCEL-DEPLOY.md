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

---

## Troubleshooting: Order creation fails

If orders fail with "שגיאה ביצירת ההזמנה":

1. **See the real error:** Add env var `ORDER_DEBUG` = `1` in Vercel → Settings → Environment Variables, then redeploy. The checkout page will show the actual error message. Remove it after fixing.

2. **Connection pool (Supabase):** For serverless, append `&connection_limit=1` to your `DATABASE_URL` in Vercel (e.g. `...?sslmode=require&pgbouncer=true&connection_limit=1`).

---

## Troubleshooting: Can't log in to admin / "Server configuration" error

If you see "There is a problem with the server configuration" when logging in at `/admin/login`:

1. **Set all four env vars in Vercel** (Project → Settings → Environment Variables):
   - `DATABASE_URL` – your Supabase connection string
   - `AUTH_SECRET` – run `openssl rand -base64 32` and paste the result (required for login)
   - `ADMIN_EMAIL` – the email you use to log in (e.g. your Gmail)
   - `ADMIN_PASSWORD` – the password you use to log in

2. **Redeploy** after adding or changing env vars (Deployments → ⋮ → Redeploy).

3. **Use the exact same email and password** as in `ADMIN_EMAIL` and `ADMIN_PASSWORD` (same spelling, no extra spaces).

---

## Push Notifications (new order alerts on your phone)

To get a push notification on your phone whenever a new order comes in:

1. **Add two env vars in Vercel** (Project → Settings → Environment Variables):
   - `VAPID_PUBLIC_KEY` – copy from your `.env` (or run `npx web-push generate-vapid-keys` to create new ones)
   - `VAPID_PRIVATE_KEY` – copy from your `.env`

2. **Redeploy** (Deployments → ⋮ → Redeploy).

3. **Enable on your phone:**
   - Open **https://basarimapp.vercel.app/admin** in Chrome on your phone
   - Log in
   - Tap **"הפעל התראות"** (Enable notifications) and allow when the browser asks

You’ll get a push for every new order (customer name, total, item count).
