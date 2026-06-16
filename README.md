# World Cup 2026 Predictor

A lightweight, mobile-friendly web app where friends predict World Cup match results and compete on a live leaderboard. No registration required.

**Stack:** React + Vite · Tailwind CSS · Supabase (PostgreSQL + Realtime) · Vercel

---

## Features

- Enter name to play — no passwords, no accounts
- Predict all 104 matches (group stage + full knockout bracket)
- Predictions lock automatically at kickoff
- Admin enters results → points calculated instantly
- Live leaderboard with real-time updates
- Tiebreakers: most exact scores → earliest registration

## Scoring

| Prediction | Actual | Points |
|---|---|---|
| 3–1 | 3–1 | **3** (exact) |
| 2–0 | 3–1 | **1** (correct winner) |
| 0–0 | 1–1 | **1** (correct draw) |
| 0–2 | 3–1 | **0** (wrong) |

---

## Setup

### Step 1 — Create a Supabase project (free)

1. Go to **[supabase.com](https://supabase.com)** → Sign up → **New project**
2. Choose a name, set a database password, pick the region closest to you
3. Wait ~2 minutes for the project to be ready

### Step 2 — Run the database schema

1. In your Supabase project, go to **SQL Editor**
2. Click **New query**
3. Copy the contents of **`supabase/schema.sql`** and paste it in
4. Click **Run** (green button)

This creates the `players`, `matches`, and `predictions` tables with the correct policies and realtime enabled.

### Step 3 — Get your API credentials

1. In Supabase, go to **Project Settings → API**
2. Copy:
   - **Project URL** (looks like `https://xxxxxxxxxxxx.supabase.co`)
   - **anon / public** key (the long `eyJ...` string)

### Step 4 — Create your `.env` file

In the `world-cup-predictor/` folder, create a file named `.env`:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

VITE_ADMIN_PASSWORD=your_secret_admin_password
```

### Step 5 — Run locally

```bash
npm install
npm run dev
```

Open **http://localhost:5173**

### Step 6 — Seed the matches (one-time)

1. Go to **http://localhost:5173/admin**
2. Enter your admin password
3. Click **"🌱 Seed All Matches"**
4. This inserts all 104 World Cup 2026 matches into Supabase

---

## Deploy to Vercel (free)

### Option A — Vercel CLI

```bash
npm install -g vercel
vercel
```

When prompted, set the **Root Directory** to `world-cup-predictor` (or run from inside it).

### Option B — Vercel dashboard (no CLI needed)

1. Push the project to a GitHub repository
2. Go to **[vercel.com](https://vercel.com)** → New Project → Import your repo
3. Vercel detects Vite automatically. No build settings needed.
4. **Add environment variables** under Settings → Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_PASSWORD`
5. Click **Deploy**

The `vercel.json` in the project root handles SPA routing so `/admin`, `/predictions`, etc. work correctly on refresh.

---

## Admin Panel

Navigate to `/admin` (hidden route — don't share this URL).

| Action | Description |
|---|---|
| **Seed Matches** | One-time setup — inserts all 104 matches |
| **Enter result** | For any match after kickoff, type the final score |
| **Auto-scoring** | All predictions for that match are scored immediately |
| **Edit result** | Click "Edit" on a finished match to correct a mistake |

The admin password is stored only in your `.env` / Vercel environment variables — never in the database.

---

## Project Structure

```
world-cup-predictor/
├── src/
│   ├── pages/
│   │   ├── Home.jsx          # Name entry / welcome back
│   │   ├── Predictions.jsx   # Match prediction UI
│   │   ├── Leaderboard.jsx   # Live rankings + history
│   │   └── Admin.jsx         # Result entry + seeding
│   ├── components/
│   │   └── Navbar.jsx
│   ├── context/
│   │   └── PlayerContext.jsx # Player session (localStorage)
│   ├── services/
│   │   └── supabase.js       # All database operations
│   └── data/
│       └── matches.js        # 104 WC2026 matches (generated)
├── supabase/
│   └── schema.sql            # Paste into Supabase SQL Editor
├── vercel.json               # SPA routing for Vercel
└── .env.example              # Copy to .env and fill in values
```

---

## Cost

| Service | Plan | Cost |
|---|---|---|
| Vercel | Hobby | Free |
| Supabase | Free tier (500MB DB, 2GB bandwidth, 50k monthly active users) | Free |

Both are free for a friends competition of 10–100 people.
