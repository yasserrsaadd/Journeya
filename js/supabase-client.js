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

  const DEMO_STORAGE_KEY = "journeya_demo_db_v3";

  /* No sample data: the site starts empty until an admin adds items. */
  const DEMO_DATA = {
    events: [],
    ticket_tiers: [],
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
      if (supabase) {
        const { data, error } = await supabase
          .from(CFG.TABLES.events)
          .select("*")
          .order("date");
        if (error) throw error;
        return data || [];
      }
      return publicRows("events", includePrivate);
    },
    async getEvents() {
      return this.fetchEvents(true);
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
      ev.id = nextId("events");
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
      writeDemo(
        "events",
        readDemo("events").map((e) => (e.id == id ? { ...e, ...ev } : e))
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
      writeDemo("ticket_tiers", readDemo("ticket_tiers").filter((t) => t.event_id != id));
      writeDemo(
        "bookings",
        readDemo("bookings").filter((b) => !(b.type === "event" && String(b.item_id) === String(id)))
      );
    },

    /* --- Ticket tiers (professional events) --- */
    async fetchTiers(eventId) {
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

    /* --- Bookings (instant guest checkout) --- */
    async createBooking(booking) {
      if (supabase) {
        const { data, error } = await supabase.rpc("create_booking", {
          p_type: booking.type || "event",
          p_item_id: booking.item_id,
          p_item_title: booking.item_title || null,
          p_name: booking.name,
          p_phone: booking.phone,
          p_email: booking.email,
          p_tier_id: booking.tier_id || null,
          p_tier_name: booking.tier_name || null,
          p_tier_price: booking.tier_price != null ? Number(booking.tier_price) : null,
          p_custom_data: booking.custom_data || {},
          p_seats: Math.max(1, Number(booking.seats) || 1),
          p_total: booking.total != null ? Number(booking.total) : null,
        });
        if (error) throw error;
        return Array.isArray(data) ? data[0] : data;
      }
      /* Demo mode: replicate the seat-number logic locally. */
      const ev = readDemo("events").find((e) => String(e.id) === String(booking.item_id)) || null;
      const cap = ev && ev.seats ? Number(ev.seats) : null;
      if (cap) {
        const used = [];
        readDemo("bookings").forEach((b) => {
          if (
            b.type === "event" &&
            String(b.item_id) === String(booking.item_id) &&
            Array.isArray(b.seat_numbers)
          ) {
            used.push(...b.seat_numbers.map(Number));
          }
        });
        const free = [];
        for (let n = 1; n <= cap; n++) if (!used.includes(n)) free.push(n);
        const qty = Math.max(1, Number(booking.seats) || 1);
        if (free.length < qty) {
          throw new Error("Not enough seats available for this event (only " + free.length + " of " + cap + " left).");
        }
        booking.seat_numbers = free.slice(0, qty);
      } else {
        booking.seat_numbers = null;
      }
      const rows = readDemo("bookings");
      booking.id = nextId("bookings");
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

    /* --- Private share links --- */
    async getSharedEvent(token) {
      if (!token) return null;
      if (supabase) {
        const { data, error } = await supabase
          .rpc("get_shared_event", { p_token: token });
        if (error) throw error;
        return (data && data[0]) || null;
      }
      return (
        readDemo("events").find((e) => e.share_token === token) || null
      );
    },
    async getSharedTiers(token) {
      if (!token) return [];
      if (supabase) {
        const { data, error } = await supabase
          .rpc("get_shared_event_tiers", { p_token: token });
        if (error) throw error;
        return data || [];
      }
      const ev = readDemo("events").find((e) => e.share_token === token);
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