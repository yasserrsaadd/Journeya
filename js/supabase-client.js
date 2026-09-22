/*
 * ============================================================
 *  JOURNEYA - SUPABASE CLIENT + HELPERS
 * ============================================================
 *  Loads the Supabase JS client from CDN and exposes a small
 *  helper layer for CRUD on events/ticket tiers/bookings.
 *
 *  If Supabase is not configured, all helpers fall back to
 *  reading/writing a local JSON store (localStorage) so the
 *  site can be previewed with demo data.
 * ============================================================
 */

(function () {
  const CFG = window.JOURNEYA_CONFIG;

  let supabase = null;
  let demoMode = false;
  let backendError = "";

  const DEMO_STORAGE_KEY = "journeya_demo_db_v3";

  /* No sample data: the site starts empty until an admin adds items. */
  const DEMO_DATA = {
    events: [],
    ticket_tiers: [],
    bookings: [],
  };

  /* ---- Demo mode is a LOCAL-ONLY escape hatch -------------------
     It needs the explicit DEMO_MODE flag in js/config.js AND a local
     origin. On a deployed domain it can never be switched on, so a
     missing/failed Supabase connection fails closed instead of
     serving fake localStorage data or an unauthenticated admin UI. */
  function isLocalOrigin() {
    try {
      const h = String(window.location.hostname || "").toLowerCase();
      return (
        window.location.protocol === "file:" ||
        h === "" ||
        h === "localhost" ||
        h === "127.0.0.1" ||
        h === "[::1]"
      );
    } catch (e) {
      return false;
    }
  }
  function demoAllowed() {
    return CFG.DEMO_MODE === true && isLocalOrigin();
  }

  /* Throws when there is no backend and demo mode is not allowed.
     Every helper calls this before touching localStorage. */
  function requireBackend() {
    if (supabase || demoMode) return;
    throw new Error(
      backendError ||
        "The site backend is not available. Please try again later."
    );
  }

  /* ---- init ---- */
  function init() {
    backendError = "";

    if (
      CFG.SUPABASE_URL &&
      CFG.SUPABASE_ANON_KEY &&
      typeof window.supabase !== "undefined"
    ) {
      try {
        const { createClient } = window.supabase;
        supabase = createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
        demoMode = false;
        return;
      } catch (e) {
        backendError = "Supabase could not be initialized: " + (e && e.message ? e.message : e);
        console.error(backendError);
      }
    } else {
      backendError =
        "Supabase is not configured (missing URL/anon key in js/config.js, or the Supabase script did not load).";
      console.error(backendError);
    }

    /* No working client: only a local, explicitly flagged preview may
       continue without one. Everywhere else we fail closed. */
    if (demoAllowed()) {
      demoMode = true;
      seedDemoIfNeeded();
    } else {
      demoMode = false;
    }
  }

  function seedDemoIfNeeded() {
    try {
      if (!localStorage.getItem(DEMO_STORAGE_KEY)) {
        localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(DEMO_DATA));
      }
    } catch (e) {
      /* ignore storage errors */
    }
  }

  function readDemo(table) {
    try {
      const db = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || "{}");
      return db[table] || [];
    } catch (e) {
      return [];
    }
  }

  function writeDemo(table, rows) {
    try {
      const db = JSON.parse(localStorage.getItem(DEMO_STORAGE_KEY) || "{}");
      db[table] = rows;
      localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      /* ignore storage errors */
    }
  }

  function nextId(table) {
    return readDemo(table).reduce((m, r) => Math.max(m, Number(r.id) || 0), 0) + 1;
  }

  /* For supabase.schema.sql, the select policy already hides private
     items from the public while admins see everything. Demo mode emulates
     that here. */
  function publicRows(table, includePrivate) {
    let rows = readDemo(table);
    if (!includePrivate) rows = rows.filter((r) => !r.is_private);
    return rows;
  }

  /* ---- public API ---- */
  const api = {
    isDemoMode: () => demoMode,

    /* --- Events --- */
    async fetchEvents(includePrivate) {
      requireBackend();
      if (supabase) {
        /* The public site must never show private events, not even when
           the visitor happens to be signed in as an admin (RLS lets
           admins read everything). Filtering here as well as in the
           RLS policies keeps the two in sync. */
        let q = supabase.from(CFG.TABLES.events).select("*");
        if (!includePrivate) q = q.eq("is_private", false);
        const { data, error } = await q.order("date");
        if (error) throw error;
        return data || [];
      }
      return publicRows("events", includePrivate);
    },
    async getEvents() {
      return this.fetchEvents(true);
    },
    async addEvent(ev) {
      requireBackend();
      if (supabase) {
        const { data, error } = await supabase
          .from(CFG.TABLES.events)
          .insert([ev])
          .select();
        if (error) throw error;
        return data[0];
      }
      const rows = readDemo("events");
      ev.id = nextId("events");
      rows.push(ev);
      writeDemo("events", rows);
      return ev;
    },
    async updateEvent(id, ev) {
      requireBackend();
      if (supabase) {
        const { error } = await supabase
          .from(CFG.TABLES.events)
          .update(ev)
          .eq("id", id);
        if (error) throw error;
        return;
      }
      writeDemo(
        "events",
        readDemo("events").map((e) => (e.id == id ? { ...e, ...ev } : e))
      );
    },
    async deleteEvent(id) {
      requireBackend();
      if (supabase) {
        const { error } = await supabase
          .from(CFG.TABLES.events)
          .delete()
          .eq("id", id);
        if (error) throw error;
        return;
      }
      writeDemo("events", readDemo("events").filter((e) => e.id != id));
      writeDemo("ticket_tiers", readDemo("ticket_tiers").filter((t) => t.event_id != id));
      writeDemo(
        "bookings",
        readDemo("bookings").filter((b) => !(b.type === "event" && String(b.item_id) === String(id)))
      );
    },

    /* --- Ticket tiers (professional events) --- */
    async fetchTiers(eventId) {
      requireBackend();
      if (supabase) {
        const { data, error } = await supabase
          .from(CFG.TABLES.ticket_tiers)
          .select("*")
          .eq("event_id", eventId)
          .order("price");
        if (error) throw error;
        return data || [];
      }
      return readDemo("ticket_tiers").filter((t) => t.event_id == eventId);
    },
    async deleteTiersForEvent(eventId) {
      requireBackend();
      if (supabase) {
        const { error } = await supabase
          .from(CFG.TABLES.ticket_tiers)
          .delete()
          .eq("event_id", eventId);
        if (error) throw error;
        return;
      }
      writeDemo(
        "ticket_tiers",
        readDemo("ticket_tiers").filter((t) => t.event_id != eventId)
      );
    },
    async saveTiers(eventId, tiers) {
      requireBackend();
      await this.deleteTiersForEvent(eventId);
      const list = (tiers || []).filter((t) => t.name && t.price != "" && t.price != null);
      if (!list.length) return;
      const rows = list.map((t) => ({
        event_id: eventId,
        name: String(t.name).trim(),
        price: Number(t.price),
      }));
      if (supabase) {
        const { error } = await supabase
          .from(CFG.TABLES.ticket_tiers)
          .insert(rows);
        if (error) throw error;
        return;
      }
      const all = readDemo("ticket_tiers");
      let id = nextId("ticket_tiers");
      rows.forEach((t) => {
        t.id = id++;
        all.push(t);
      });
      writeDemo("ticket_tiers", all);
    },

    /* --- Payment proofs (InstaPay transfer screenshots) ---
       Guests upload to a PRIVATE bucket, so only admins can read the
       images (signed URLs are minted on demand in the admin page). */
    async uploadPaymentProof(file) {
      requireBackend();
      if (!file) throw new Error("No file selected.");
      if (!/^image\//.test(file.type || "")) {
        throw new Error("Please upload an image (JPG, PNG or WEBP).");
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("That screenshot is too large (max 5MB).");
      }

      const ext = ((file.name || "").split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
      const path =
        "proofs/" + Date.now() + "-" + Math.random().toString(36).slice(2, 8) + "." + ext;

      if (supabase) {
        const bucket = (CFG.STORAGE && CFG.STORAGE.paymentProofsBucket) || "payment-proofs";
        const { error } = await supabase.storage
          .from(bucket)
          .upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false });
        if (error) throw error;
        return path;
      }

      /* Demo mode: no bucket, so keep the image inline as a data URL.
         (localStorage is small, so very large shots are refused here -
         with Supabase connected they upload normally.) */
      if (file.size > 1.5 * 1024 * 1024) {
        throw new Error("Demo mode (no Supabase): please use a screenshot under 1.5MB.");
      }
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("Could not read that image."));
        reader.readAsDataURL(file);
      });
    },

    /* Turns a stored path (or demo data URL) into something viewable. */
    async getPaymentProofUrl(path) {
      requireBackend();
      if (!path) return null;
      if (/^data:/i.test(path) || /^https?:/i.test(path)) return path;
      if (supabase) {
        const bucket = (CFG.STORAGE && CFG.STORAGE.paymentProofsBucket) || "payment-proofs";
        const { data, error } = await supabase.storage.from(bucket).createSignedUrl(path, 3600);
        if (error) throw error;
        return (data && data.signedUrl) || null;
      }
      return path;
    },

    /* --- Bookings (instant guest checkout) ---
       Only the guest's own choices are sent. Title, tier name/price and
       the total are computed by the create_booking RPC from the database,
       so nothing financial can be forged from the browser. */
    async createBooking(booking) {
      requireBackend();
      const payload = {
        p_type: booking.type || "event",
        p_item_id: booking.item_id,
        p_name: booking.name,
        p_phone: booking.phone,
        p_email: booking.email,
        p_tier_id: booking.tier_id || null,
        p_custom_data: booking.custom_data || {},
        p_seats: Math.max(1, Number(booking.seats) || 1),
        p_payment_proof_url: booking.payment_proof_url || null,
        p_share_token: booking.share_token || null,
      };

      if (supabase) {
        const { data, error } = await supabase.rpc("create_booking", payload);
        if (error) throw error;
        return Array.isArray(data) ? data[0] : data;
      }

      /* Demo mode: mirror the server-side checks so the preview behaves
         the same way (event must exist, private needs its token, tier
         must belong to the event, price/total computed here). */
      const ev = readDemo("events").find((e) => String(e.id) === String(booking.item_id)) || null;
      if (!ev) throw new Error("This event is no longer available.");
      if (ev.is_private && (!booking.share_token || booking.share_token !== ev.share_token)) {
        throw new Error("This event is private - open it through its share link to book.");
      }

      const seats = Math.max(1, Number(booking.seats) || 1);
      let tierId = null;
      let tierName = null;
      let unit = ev.price != null ? Number(ev.price) : null;
      if (booking.tier_id) {
        const t = readDemo("ticket_tiers").find(
          (x) => String(x.id) === String(booking.tier_id) && String(x.event_id) === String(ev.id)
        );
        if (!t) throw new Error("That ticket tier does not belong to this event.");
        tierId = t.id;
        tierName = t.name;
        unit = Number(t.price);
      }
      const total = unit != null && !isNaN(unit) ? Math.round(unit * seats * 100) / 100 : null;

      const row = {
        type: "event",
        item_id: ev.id,
        item_title: ev.title,
        event_date: ev.date || null,
        name: String(booking.name || "").trim(),
        phone: String(booking.phone || "").trim(),
        email: String(booking.email || "").trim(),
        tier_id: tierId,
        tier_name: tierName,
        tier_price: tierId ? unit : null,
        custom_data:
          ev.event_type === "professional" && booking.custom_data ? booking.custom_data : {},
        seats: seats,
        total: total,
        payment_proof_url: booking.payment_proof_url || null,
      };

      const cap = ev.seats ? Number(ev.seats) : null;
      if (cap) {
        const used = [];
        readDemo("bookings").forEach((b) => {
          if (b.type === "event" && String(b.item_id) === String(ev.id) && Array.isArray(b.seat_numbers)) {
            used.push(...b.seat_numbers.map(Number));
          }
        });
        const free = [];
        for (let n = 1; n <= cap; n++) if (!used.includes(n)) free.push(n);
        if (free.length < seats) {
          throw new Error("Not enough seats available for this event (only " + free.length + " of " + cap + " left).");
        }
        row.seat_numbers = free.slice(0, seats);
      } else {
        row.seat_numbers = null;
      }

      const rows = readDemo("bookings");
      row.id = nextId("bookings");
      row.created_at = new Date().toISOString();
      rows.push(row);
      writeDemo("bookings", rows);
      return row;
    },
    async fetchBookings() {
      requireBackend();
      if (supabase) {
        const { data, error } = await supabase
          .from(CFG.TABLES.bookings)
          .select("*")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return data || [];
      }
      return readDemo("bookings");
    },

    /* --- Private share links --- */
    async getSharedEvent(token) {
      requireBackend();
      if (!token) return null;
      if (supabase) {
        const { data, error } = await supabase
          .rpc("get_shared_event", { p_token: token });
        if (error) throw error;
        return (data && data[0]) || null;
      }
      /* Mirrors the RPC: only PRIVATE events are reachable by token. */
      return (
        readDemo("events").find((e) => e.share_token === token && e.is_private === true) || null
      );
    },
    async getSharedTiers(token) {
      requireBackend();
      if (!token) return [];
      if (supabase) {
        const { data, error } = await supabase
          .rpc("get_shared_event_tiers", { p_token: token });
        if (error) throw error;
        return data || [];
      }
      const ev = readDemo("events").find((e) => e.share_token === token && e.is_private === true);
      if (!ev) return [];
      return readDemo("ticket_tiers").filter((t) => t.event_id === ev.id);
    },

    /* --- Storage for demo listener so admin updates reflect ----
       (Shared via event so pages can re-render after changes) */
    notifyChanged() {
      window.dispatchEvent(new CustomEvent("journeya:changed"));
    },

    /* --- Auth (Supabase) --- */
    async signIn(email, password) {
      /* Never fake a successful sign-in: without a backend (and outside
         an explicitly flagged local demo) this must fail. */
      requireBackend();
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        return data.user;
      }
      return { email: "demo@localhost", demo: true };
    },
    async signOut() {
      if (supabase) {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
      }
    },
    async getSession() {
      if (supabase) {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        return data.session;
      }
      return null;
    },
    currentUser() {
      if (supabase) {
        return supabase.auth.getUser().then(({ data, error }) => {
          if (error) throw error;
          return data.user;
        });
      }
      return Promise.resolve(null);
    },
    onAuthStateChange(cb) {
      if (supabase) {
        return supabase.auth.onAuthStateChange(cb).data.subscription;
      }
      return null;
    },
    async resetPasswordForEmail(email) {
      requireBackend();
      if (supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
      }
    },

    /* --- Health of the backend connection (used by the UI to fail
        closed with a clear message instead of showing fake data) --- */
    backendStatus() {
      return {
        ok: !!supabase || demoMode,
        demo: demoMode,
        message: backendError || "",
      };
    },
  };

  window.JourneyaAPI = api;
  init();
})();