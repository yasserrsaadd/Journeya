/*
 * ============================================================
 *  JOURNEYA - SUPABASE CLIENT + HELPERS
 * ============================================================
 *  Loads the Supabase JS client from CDN and exposes a small
 *  helper layer for CRUD on trips/events/bookings.
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

  const DEMO_STORAGE_KEY = "journeya_demo_db";

  /* Sample/demo data used until real Supabase is configured. */
  const DEMO_DATA = {
    trips: [
      {
        id: 1,
        title: "El Sokhna Beach Weekend",
        destination: "Ain Sokhna, Red Sea",
        price: 2400,
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=60",
        itinerary: "Day 1: Check-in, beach, evening BBQ.\nDay 2: Snorkeling, boat trip, sunset bonfire.",
        inclusions: "Transport, accommodation, meals, activities & trip leader.",
        start_date: "2026-10-16",
        end_date: "2026-10-18",
        available: true,
      },
      {
        id: 2,
        title: "Nuweiba Desert Escape",
        destination: "Nuweiba, Sinai",
        price: 2800,
        image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=900&q=60",
        itinerary: "Day 1: Camp setup, Bedouin dinner, stargazing.\nDay 2: Colored Canyon hike, evening music.",
        inclusions: "Transport, tent/glamping, meals, hiking guide.",
        start_date: "2026-11-06",
        end_date: "2026-11-08",
        available: true,
      },
      {
        id: 3,
        title: "Coastal Drive to Alexandria",
        destination: "Alexandria, North Coast",
        price: 1600,
        image: "https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=60",
        itinerary: "Day trip: Qaitbay Citadel, library, seafood lunch, sunset walk.",
        inclusions: "Transport, lunch, tour guide.",
        start_date: "2026-10-30",
        end_date: "2026-10-30",
        available: true,
      },
    ],
    events: [
      {
        id: 1,
        title: "Friday Board Games Night",
        description: "Board games, cards, snacks & new friends. All levels welcome!",
        date: "2026-09-18",
        time: "19:00",
        location: "Journeya Hub - Downtown Cairo",
        image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=900&q=60",
        available: true,
      },
      {
        id: 2,
        title: "Quiz Night & Social Mixer",
        description: "Teams, trivia, prizes and great vibes over coffee.",
        date: "2026-09-25",
        time: "20:00",
        location: "Café Nakhil - Zamalek",
        image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=60",
        available: true,
      },
      {
        id: 3,
        title: "PS5 & Fighting Game Night",
        description: "Tournaments, casual matches and unbeatable competition.",
        date: "2026-10-02",
        time: "18:00",
        location: "Journeya Hub - Downtown Cairo",
        image: "https://images.unsplash.com/photo-1593118247619-e2d6f056869e?auto=format&fit=crop&w=900&q=60",
        available: true,
      },
    ],
    bookings: [
      {
        id: 999,
        type: "event",
        item_id: 1,
        name: "Demo Visitor",
        phone: "01000000000",
        email: "demo@example.com",
        created_at: new Date().toISOString(),
      },
    ],
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

    /* --- Trips --- */
    async getTrips() {
      if (supabase) {
        const { data, error } = await supabase
          .from(CFG.TABLES.trips)
          .select("*")
          .order("start_date", { ascending: true });
        if (error) throw error;
        return data || [];
      }
      return readDemo("trips");
    },
    async fetchTrips(active) {
      if (supabase) {
        let q = supabase.from(CFG.TABLES.trips).select("*").order("start_date");
        if (typeof active === "boolean") q = q.eq("available", active);
        const { data, error } = await q;
        if (error) throw error;
        return data || [];
      }
      let rows = readDemo("trips");
      if (typeof active === "boolean") rows = rows.filter((t) => t.available === active);
      return rows;
    },
    async addTrip(trip) {
      if (supabase) {
        const { data, error } = await supabase
          .from(CFG.TABLES.trips)
          .insert([trip])
          .select();
        if (error) throw error;
        return data[0];
      }
      const rows = readDemo("trips");
      trip.id = Date.now();
      rows.push(trip);
      writeDemo("trips", rows);
      return trip;
    },
    async updateTrip(id, trip) {
      if (supabase) {
        const { error } = await supabase
          .from(CFG.TABLES.trips)
          .update(trip)
          .eq("id", id);
        if (error) throw error;
        return;
      }
      const rows = readDemo("trips");
      writeDemo(
        "trips",
        rows.map((t) => (t.id == id ? { ...t, ...trip } : t))
      );
    },
    async deleteTrip(id) {
      if (supabase) {
        const { error } = await supabase.from(CFG.TABLES.trips).delete().eq("id", id);
        if (error) throw error;
        return;
      }
      writeDemo("trips", readDemo("trips").filter((t) => t.id != id));
    },

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
        const { data, error } = await supabase
          .from(CFG.TABLES.bookings)
          .insert([booking])
          .select();
        if (error) throw error;
        return data[0];
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
  };

  window.JourneyaAPI = api;
  window.addEventListener("DOMContentLoaded", init);
})();
