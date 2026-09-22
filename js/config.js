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

  /* ---- Local preview ("demo") mode -------------------------------
     When true AND the page is opened locally (file://, localhost or
     127.0.0.1), the site runs without Supabase and keeps events and
     bookings in localStorage so you can design offline.

     On a real domain this flag is IGNORED: if Supabase is missing or
     unreachable the site fails closed (no fake data, no admin access)
     instead of silently falling back to the browser. */
  DEMO_MODE: false,

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
  /* Emails allowed to access the admin dashboard (Supabase Auth).
     >>> Add your own admin email here, otherwise nobody can sign in
     on the live site (the check fails closed). <<<
     Keep it in sync with the `admin_emails` table in supabase/schema.sql.
     In local demo mode login is bypassed, so this is not used there. */
  ADMIN_EMAILS: ["journeya006@gmail.com"],

  /* ---- Payment proofs (InstaPay transfer screenshots) ----
     Guests upload a screenshot of their transfer; admins view the
     images from the "Guest Bookings" tab in the admin dashboard. */
  STORAGE: {
    paymentProofsBucket: "payment-proofs", // private bucket, created by supabase/schema.sql
  },

  /* ---- Site contact details ---- */
  CONTACT: {
    email: "hello@journeya.com",
    phone: "+20 100 000 0000",
    whatsapp: "+201000000000", // digits only, for wa.me link
    instagram: "https://instagram.com/journeya",
    facebook: "https://facebook.com/journeya",
    tiktok: "https://tiktok.com/@journeya",

    /* >>> EDIT ME: your InstaPay address shown in the booking form. <<<
       Can be a username (journeya@instapay) or a phone number. */
    instapay: "journeya@instapay",
    instapay_name: "Journeya",
  },
};
