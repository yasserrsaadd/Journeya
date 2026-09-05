# Journeya - Community Website

A modern, vibrant, static website for **Journeya**, an agency that organizes social
events (game nights) and weekend trips (El Sokhna, Nuweiba, etc.).

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
   This creates the `trips`, `events` and `bookings` tables with Row Level Security.
3. Go to **Project Settings → API** and copy your **Project URL** and **anon/public key**.
4. Open `js/config.js` and paste them into `SUPABASE_URL` and `SUPABASE_ANON_KEY`.

That's it - the site now reads/writes your real tables. Guest bookings stored by type.

### Managing content (adding/editing trips & events)
Visit the **Admin** section (link in the footer) or open the site and go to
`index.html#/admin`, log in with the admin password, and use the built-in forms to
**Add / Edit / Delete** trips and events and view the **Guest Lists** (names & phones).

## Setting the admin password

The admin portal checks a **SHA-256 hash** of the password stored in `js/config.js`
(`ADMIN_PASSWORD_HASH`). This keeps the plaintext password out of the source.

Generate the hash easily with your browser console:

```js
// paste in DevTools and press Enter
crypto.subtle.digest("SHA-256", new TextEncoder().encode("YOUR_PASSWORD"))
  .then(h => [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, "0")).join(""))
  .then(hash => console.log(hash));
```

Then paste the printed hash into `ADMIN_PASSWORD_HASH` in `js/config.js`.

> **Security note:** this is a client-side check, which is fine for controlling access
> to a static site, but it is NOT cryptographic security. Anyone with the source can
> edit the file. For a hardened setup, gate writes behind the service-role key instead.

## File Structure

```
.
├── index.html          # Single-file single-page site (Home, Events, Trips, About, Contact, Admin)
│                       #   Views switch via URL hashes: #/home #/events #/trips #/about #/contact #/admin
├── css/styles.css      # Journeya theme
├── js/
│   ├── config.js       # <-- Paste your Supabase URL/key & admin hash here
│   ├── supabase-client.js  # Supabase CDN client + demo-mode fallback
│   └── main.js         # SPA router + shared navbar/footer/booking modal
└── supabase/schema.sql # Database setup
```

## Payments

The site showcases **flexible payments**: credit/debit cards, mobile wallets
(Instapay, Vodafone Cash) and **cash collection** on the day of the event/trip.