# Journeya - Community Website

A modern, vibrant, static website for **Journeya**, an agency that organizes social
events and game nights across Egypt.

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
   This creates the `events`, `ticket_tiers` and `bookings` tables with
   Row Level Security. The script is safe to re-run (it uses `if not exists` and
   `add column if not exists`), so re-run it whenever the schema changes.
3. Go to **Project Settings → API** and copy your **Project URL** and **anon/public key**.
4. Open `js/config.js` and paste them into `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

That's it - the site now reads/writes your real tables.

> Guests book **without logging in** - booking forms are public, no account required.
> There are no customer accounts or passwords on the public site.

### Data model

- **events** - game nights / social gatherings. Both **Regular** (flat price) and
  **Professional** (multi-tier tickets + custom booking fields) events.
  Fields: title, event type, category, summary, description, date, time, location,
  image (Cloudinary URL), video (optional Cloudinary preview), price, optional seats,
  refund policy, guidelines (one per line), private toggle + share token, custom fields.
- **ticket_tiers** - per professional event: name + price (e.g. Regular, Standard).
- **bookings** - instant guest checkout rows with name, phone, email, chosen tier,
  custom-field answers, number of seats, the assigned `seat_numbers` and the computed total.

### Seat numbers

When an event has a **capacity** (the optional *Seats* field the admin sets), the system
assigns each booking the next available seat numbers (1..capacity, lowest free first) and
shows them to the guest on the confirmation. Capacity is enforced in the database, so an
event can never be overbooked. Events without a capacity stay unlimited and get no seat
numbers.

All bookings are created through the `create_booking` database function (RPC), which
assigns the seat numbers and inserts the row in a single transaction. Direct inserts into
`bookings` are disabled, so availability cannot be bypassed.

### Public / Private events & unique share links

Private events never appear in the public catalog. Save (or edit) an event with
**Private** checked and Journeya auto-generates a unique share link
(e.g. `index.html#/event/aBcDeFgHiJkL`). Anyone with that link can view the event and
book directly; the link stops working if the event is flipped back to Public.
Copy the link from the admin dashboard (share icon in the item list, or the alert
after saving).

### Storing media (Cloudinary)

Event photos and optional video previews are hosted on **Cloudinary** (not
Supabase Storage), so media never counts against Supabase egress. The `image`/`video`
fields simply store the Cloudinary URLs.

Workflow when adding/editing an event in the admin dashboard:

1. Upload the photo/video at https://cloudinary.com → **Media Library** → **Upload**.
2. Open the uploaded asset and copy its **Secure URL** (e.g.
   `https://res.cloudinary.com/<cloud>/image/upload/...`).
3. Paste that URL into the **Image URL** / **Video preview** field in the admin form.

The card loads the media straight from Cloudinary's CDN. Nothing is uploaded from this
site's code - Cloudinary is used purely as media hosting and the URL is saved in Supabase.
(If you later want the in-form Cloudinary Upload Widget, uncomment the `CLOUDINARY`
section in `js/config.js`.)

## Managing content (adding/editing events)

Visit the **Admin** section (link in the footer) or open the site and go to
`index.html#/admin`, sign in with your Supabase Auth admin account, and use the
built-in forms to **Add / Edit / Delete** events. From there you can also:

- Create **Professional** events with multiple ticket tiers and custom booking fields
  (e.g. Instagram account, job title) collected at checkout.
- Toggle events **Public / Private** and copy their unique share links.
- View **Guest Lists** (names, phones, tier, seats &amp; seat numbers, totals).
- Open **Reports & Analytics**:
  - **Overview** - what is selling and what isn't (tickets / capacity, revenue, status).
  - **Day-of-the-Week Sales** breakdown per item (ticket volume by weekday).
  - **Customer Breakdown** - two lists separating **Frequent Customers** (2+ bookings)
    from **Non-Frequent Customers**, complete with names and phone numbers.

## Setting up admin auth (Supabase Auth)

The admin portal signs in with **Supabase Auth (email + password)**, and Row Level
Security only lets confirmed admins write content or view guest lists.

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
> enforced by RLS on the database, not by the client. Private events are read only
> through the share-link RPC function `get_shared_event`.
> Never put the service-role key in this repo - it stays server-side only.

## File Structure

```
.
├── index.html          # Single-file single-page site (Home, Events, FAQ,
│                       #   About, Contact, Admin + private share-link pages)
│                       #   Routing via URL hashes: #/home #/events #/about
│                       #   #/contact #/admin  and  #/event/:token
├── css/styles.css      # Journeya theme
├── js/
│   ├── config.js       # <-- Paste your Supabase URL/key & admin emails here
│   ├── supabase-client.js  # Supabase CDN client + auth helpers + demo-mode fallback
│   └── main.js         # SPA router + shared navbar/footer/booking modal
└── supabase/schema.sql # Database setup (events, ticket_tiers, bookings)
```

## Payments

The site showcases **flexible payments**: credit/debit cards, mobile wallets
(Instapay, Vodafone Cash) and **cash collection** on the day of the event.