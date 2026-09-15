# Journeya - Community Website

A modern, vibrant, static website for **Journeya**, an agency that organizes social
events (game nights) across Egypt.

Built with plain HTML5/CSS3/JavaScript, **Bootstrap** and **Font Awesome** via CDN,
and **Supabase** (via its JS client CDN) for storage.

## Quick Start (preview with demo data)

Just open `index.html` in a browser. Until Supabase is configured, the site runs in
**demo mode** using sample data stored in `localStorage`, so you can preview the design,
make guest bookings, and try the admin portal immediately.

> Note: if you open the files directly via `file://`, everything works except the guest
> booking modal requires a local HTTP server in some browsers. Easiest way:
> `npx serve` (or any static server) inside this folder.

## Connecting your real Supabase backend

1. Create a free project at https://supabase.com
2. Open the **SQL Editor** and run the contents of `supabase/schema.sql`.
   This creates the `events` and `bookings` tables with Row Level Security.
   The script is safe to re-run (it uses `if not exists` and `add column if not exists`),
   so re-run it whenever the schema changes — e.g. to add new event fields.

Every event carries the following fields: **title, price, picture (image URL), location,
description, date, and guidelines** (one per line, rendered as a bullet list).
3. Go to **Project Settings → API** and copy your **Project URL** and **anon/public key**.
4. Open `js/config.js` and paste them into `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

That's it - the site now reads/writes your real tables. Guest bookings stored by type.

> Guests book **without logging in** - booking forms are public, no account required.

### Managing content (adding/editing events)
Visit the **Admin** section (link in the footer) or open the site and go to
`index.html#/admin`, sign in with your Supabase Auth admin account, and use the
built-in forms to **Add / Edit / Delete** events and view the **Guest Lists**
(names & phones). Only users whose email is in the `admin_emails` table can do this.

## Setting up admin auth (Supabase Auth)

The admin portal signs in with **Supabase Auth (email + password)**, and Row Level
Security only lets confirmed admins write events or view guest lists.

1. Open your Supabase project → **Authentication → Users → Add user**
   and create an admin account (email + password).
2. Run `supabase/schema.sql` again (it creates the `admin_emails` table and functions
   and is safe to re-run). Then add the admin's email to the allow list:
   ```sql
   insert into public.admin_emails (email)
   values ('admin@yourdomain.com')
   on conflict (email) do nothing;
   ```
3. (Optional but recommended) Paste the same email into `ADMIN_EMAILS` in
   `js/config.js`. This is only a UI gate so the wrong account is rejected up front;
   the real enforcement is the `admin_emails` table + RLS.

> **Demo mode:** until `SUPABASE_URL`/`SUPABASE_ANON_KEY` are configured, login is
> bypassed automatically so you can preview the admin portal locally. Real security
> only applies once a Supabase backend is connected.

> **Security note:** the anon key is embedded in this static site, so admin access is
> enforced by RLS on the database, not by the client. Never put the service-role key
> in this repo - it stays server-side only.

## File Structure

```
.
├── index.html          # Single-file single-page site (Home, Events, About, Contact, Admin)
│                       #   Views switch via URL hashes: #/home #/events #/about #/contact #/admin
├── css/styles.css      # Journeya theme
├── js/
│   ├── config.js       # <-- Paste your Supabase URL/key & admin emails here
│   ├── supabase-client.js  # Supabase CDN client + auth helpers + demo-mode fallback
│   └── main.js         # SPA router + shared navbar/footer/booking modal
└── supabase/schema.sql # Database setup
```

## Payments

The site showcases **flexible payments**: credit/debit cards, mobile wallets
(Instapay, Vodafone Cash) and **cash collection** on the day of the event.