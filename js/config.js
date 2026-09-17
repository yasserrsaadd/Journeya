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
 *  HOW TO SET UP ADMIN AUTH (Supabase email + password):
 *  1. Open your Supabase project -> Authentication -> Users -> Add user.
 *  2. Create the admin user (email + password).
 *  3. Add that email to the `admin_emails` table (in the SQL editor):
 *     insert into public.admin_emails (email) values ('admin@example.com');
 *  4. Paste the email below in `ADMIN_EMAILS`.
 *
 *  Until you paste your real values the site still works,
 *  using sample/demo data so you can preview the design.
 * ============================================================
 */
window.JOURNEYA_CONFIG = {
  /* ---- Supabase credentials (replace these) ---- */
  SUPABASE_URL: "https://yzndxfzitoliixwrzfzm.supabase.co", // e.g. "https://xxxxx.supabase.co"
  SUPABASE_ANON_KEY: "sb_publishable_SQ8sexvH3dmUzt4Eo74LdQ_VjIEWDB1", // your anon/public key

  /* ---- Supabase table names (match schema.sql) ---- */
  TABLES: {
    events: "events",
    ticket_tiers: "ticket_tiers",
    bookings: "bookings",
  },

  /* ---- Cloudinary (optional) ----
     The site stores media URLs (photos / video previews) directly in the
     image/video fields. Paste the Cloudinary "Secure URL" of an uploaded
     asset into the admin form - nothing is uploaded from this site's code.

     If you later want the Cloudinary Upload Widget inside the admin form,
     add your cloud name + an unsigned upload preset below and the Upload
     button will open the widget instead of asking for a URL. */
  CLOUDINARY: {
    cloud_name: "",
    upload_preset: "", // must be an unsigned preset that accepts images+videos
  },

  /* ---- Admin portal sign-in ---- */
  /* Emails allowed to access the admin dashboard (Supabase Auth). */
  /* Leave empty to let the DB (admin_emails table) be the only gate. */
  /* In demo mode (Supabase not configured) login is always bypassed. */
  ADMIN_EMAILS: [],

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
