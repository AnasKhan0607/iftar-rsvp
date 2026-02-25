# 🌙 Iftar RSVP Tool

Simple, beautiful RSVP tool for your Iftar gathering.

## Features
- Clean, mobile-friendly design
- Real-time guest list display
- Admin panel to manage responses
- Export to CSV
- Works offline (localStorage) or with Supabase backend

## Quick Start (Local Testing)

```bash
cd ~/.openclaw/workspace/iftar-rsvp
npx serve .
```

Then open http://localhost:3000

## Deploy to Vercel (Recommended)

1. Push to GitHub:
```bash
cd ~/.openclaw/workspace/iftar-rsvp
git init
git add .
git commit -m "Initial commit"
gh repo create iftar-rsvp --public --source=. --push
```

2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repo
4. Deploy (zero config needed!)

Your link will be: `https://iftar-rsvp.vercel.app` or similar

## Deploy to Netlify

1. Drag and drop the folder to [netlify.com/drop](https://app.netlify.com/drop)
2. Get your link instantly

## Adding Supabase Backend (Optional)

For persistent storage across devices:

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Go to SQL Editor and run:

```sql
create table rsvps (
  id serial primary key,
  name text not null,
  attending boolean not null,
  created_at timestamp with time zone default now()
);

-- Enable public access
alter table rsvps enable row level security;
create policy "Allow all" on rsvps for all using (true);
```

4. Get your project URL and anon key from Settings > API
5. Update `app.js`:
```js
const SUPABASE_URL = 'your-project-url';
const SUPABASE_ANON_KEY = 'your-anon-key';
const USE_LOCAL_STORAGE = false;
```

## Customization

Edit `index.html` to change:
- Event date/time
- Location
- Colors and styling

## Files
- `index.html` - Main RSVP page
- `admin.html` - Admin panel
- `app.js` - JavaScript logic
