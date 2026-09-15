/*
 * ============================================================
 *  JOURNEYA - SUPABASE CLIENT + HELPERS
 * ============================================================
 *  Loads the Supabase JS client from CDN and exposes a small
 *  helper layer for CRUD on events/bookings.
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

  const DEMO_STORAGE_KEY = "journeya_demo_db_v2";

  /* No sample data: the site starts empty until an admin adds events. */
  const DEMO_DATA = {
    events: [],
    bookings: [],
  };

  /* ---- init ---- */
  function init() {
    if (
      CFG.SUPABASE_URL &&
      CFG.SUPABASE_ANON_KEY &&
      typeof window.supabase !== "undefined"
    ) {
      try {
        const { createClient } = window.supabase;
        supabase = createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY);
        demoMode = false;
      } catch (e) {
        console.warn("Supabase failed to initialize, using demo mode.", e);
        demoMode = true;
      }
    } else {
      demoMode = true;
    }
    if (demoMode) {
      seedDemoIfNeeded();
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

  /* ---- public API ---- */
  const api = {
    isDemoMode: () => demoMode,

    /* --- Events --- */
    async fetchEvents(active) {
      if (supabase) {
        let q = supabase.from(CFG.TABLES.events).select("*").order("date");
        if (typeof active === "boolean") q = q.eq("available", active);
        const { data, error } = await q;
        if (error) throw error;
        return data || [];
      }
      let rows = readDemo("events");
      if (typeof active === "boolean") rows = rows.filter((e) => e.available === active);
      return rows;
    },
    async getEvents() {
      if (supabase) {
        const { data, error } = await supabase
          .from(CFG.TABLES.events)
          .select("*")
          .order("date", { ascending: true });
        if (error) throw error;
        return data || [];
      }
      return readDemo("events");
    },
    async addEvent(ev) {
      if (supabase) {
        const { data, error } = await supabase
          .from(CFG.TABLES.events)
          .insert([ev])
          .select();
        if (error) throw error;
        return data[0];
      }
      const rows = readDemo("events");
      ev.id = Date.now();
      rows.push(ev);
      writeDemo("events", rows);
      return ev;
    },
    async updateEvent(id, ev) {
      if (supabase) {
        const { error } = await supabase
          .from(CFG.TABLES.events)
          .update(ev)
          .eq("id", id);
        if (error) throw error;
        return;
      }
      const rows = readDemo("events");
      writeDemo(
        "events",
        rows.map((e) => (e.id == id ? { ...e, ...ev } : e))
      );
    },
    async deleteEvent(id) {
      if (supabase) {
        const { error } = await supabase
          .from(CFG.TABLES.events)
          .delete()
          .eq("id", id);
        if (error) throw error;
        return;
      }
      writeDemo("events", readDemo("events").filter((e) => e.id != id));
    },

    /* --- Bookings --- */
    async createBooking(booking) {
      if (supabase) {
        const { error } = await supabase
          .from(CFG.TABLES.bookings)
          .insert([booking]);
        if (error) throw error;
        return;
      }
      const rows = readDemo("bookings");
      booking.id = Date.now();
      booking.created_at = new Date().toISOString();
      rows.push(booking);
      writeDemo("bookings", rows);
      return booking;
    },
    async fetchBookings() {
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

    /* --- Storage for demo listener so admin updates reflect ----
       (Shared via event so pages can re-render after changes) */
    notifyChanged() {
      window.dispatchEvent(new CustomEvent("journeya:changed"));
    },

    /* --- Auth (Supabase) --- */
    async signIn(email, password) {
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        return data.user;
      }
      return { email };
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
      if (supabase) {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
      }
    },
  };

  window.JourneyaAPI = api;
  init();
})();
