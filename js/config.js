/*
 * ============================================================
 *  JOURNEYA - SITE CONFIGURATION
 * ============================================================
 *  This is the ONLY file you need to edit to connect your
 *  Supabase project and lock the admin portal.
 *
 *  HOW TO SET UP SUPABASE:
 *  1. Create a free project at https://supabase.com
 *  2. Open the SQL editor and run the contents of
 *     `supabase/schema.sql` (this creates the tables).
 *  3. Go to Project Settings -> API.
 *  4. Copy your Project URL and anon/public key below.
 *
 *  HOW TO SET THE ADMIN PASSWORD:
 *  1. Choose a password you want for the admin portal.
 *  2. Generate its SHA-256 hash (see README.md for easy way).
 *  3. Paste the hash below as `ADMIN_PASSWORD_HASH`.
 *
 *  Until you paste your real values the site still works,
 *  using sample/demo data so you can preview the design.
 * ============================================================
 */
window.JOURNEYA_CONFIG = {
  /* ---- Supabase credentials (replace these) ---- */
  SUPABASE_URL: "", // e.g. "https://xxxxx.supabase.co"
  SUPABASE_ANON_KEY: "", // your anon/public key

  /* ---- Supabase table names (match schema.sql) ---- */
  TABLES: {
    trips: "trips",
    events: "events",
    bookings: "bookings",
  },

  /* ---- Admin portal password ---- */
  /* SHA-256 hash of the admin password. */
  /* Leave empty to bypass for local demo mode (NOT for production). */
  /* Once you set a hash, logins are checked against it. */
  ADMIN_PASSWORD_HASH: "",

  /* ---- Site contact details ---- */
  CONTACT: {
    email: "hello@journeya.com",
    phone: "+20 100 000 0000",
    whatsapp: "+201000000000", // digits only, for wa.me link
    instagram: "https://instagram.com/journeya",
    facebook: "https://facebook.com/journeya",
    tiktok: "https://tiktok.com/@journeya",
  },
};
