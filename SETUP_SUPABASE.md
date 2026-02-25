# Supabase Setup (2 minutes)

## 1. Create Project
1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click "New Project"
3. Name it `iftar-rsvp`, set a password, choose region
4. Wait ~2 min for it to spin up

## 2. Create Table
1. Go to **SQL Editor** (left sidebar)
2. Paste this and click **Run**:

```sql
-- Create the rsvps table
create table rsvps (
  id bigint primary key generated always as identity,
  name text not null,
  attending boolean not null,
  created_at timestamp with time zone default now()
);

-- Allow public access (for anonymous submissions)
alter table rsvps enable row level security;

create policy "Allow public read" on rsvps
  for select using (true);

create policy "Allow public insert" on rsvps
  for insert with check (true);

create policy "Allow public delete" on rsvps
  for delete using (true);
```

## 3. Get Your Keys
1. Go to **Settings** → **API** (left sidebar)
2. Copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (the long one)

## 4. Update Code
Edit these files and replace the placeholder values:

**app.js** (line 5-6):
```js
const SUPABASE_URL = 'https://your-actual-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-actual-anon-key';
```

**admin.html** (line ~70-71):
```js
const SUPABASE_URL = 'https://your-actual-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-actual-anon-key';
```

## 5. Push & Done!
```bash
git add . && git commit -m "Add Supabase config" && git push
```

Your RSVP tool now has a real backend! 🎉
