/*
 * ============================================================
 *  JOURNEYA - Shared UI helpers (navbar, footer, booking modal)
 * ============================================================
 */

(function () {
  const CFG = window.JOURNEYA_CONFIG;

  /* ---- Tiny SPA router: shows/hides .view sections by hash ---- */
  const views = {};
  window.JourneyaApp = {
    register(name, showFn) {
      views[name] = showFn;
    },
    navigate(name) {
      const target = document.getElementById("view-" + name);
      if (!target) name = "home";
      document.querySelectorAll(".view").forEach((v) => (v.style.display = "none"));
      document.getElementById("view-" + name).style.display = "";
      document.querySelectorAll(".nav-link[data-view]").forEach((a) => {
        a.classList.toggle("active", a.dataset.view === name);
      });
      const foot = document.getElementById("footer-j");
      if (foot) foot.style.display = name === "admin" ? "none" : "";
      if (views[name]) views[name]();
      window.scrollTo(0, 0);
    },
    current() {
      const h = (window.location.hash || "").replace(/^#\//, "");
      return h || "home";
    },
  };

  function currentViewName() {
    const h = (window.location.hash || "").replace(/^#\//, "");
    return h || "home";
  }

  /* ---- Render shared navbar & footer into placeholders ---- */
  function renderNavbar() {
    const host = document.getElementById("navbar-j");
    if (!host) return;
    const links = [
      { href: "#/home", dataView: "home", label: "Home" },
      { href: "#/events", dataView: "events", label: "Events" },
      { href: "#/trips", dataView: "trips", label: "Trips" },
      { href: "#/about", dataView: "about", label: "About" },
      { href: "#/contact", dataView: "contact", label: "Contact" },
    ];
    const current = currentViewName();
    host.innerHTML =
      '<nav class="navbar navbar-expand-lg navbar-j fixed-top">' +
      '<div class="container">' +
      '<a class="navbar-brand" href="#/home"><i class="fas fa-paper-plane me-2"></i>Journeya</a>' +
      '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain" aria-controls="navMain" aria-expanded="false" aria-label="Toggle navigation">' +
      '<span class="navbar-toggler-icon"></span></button>' +
      '<div class="collapse navbar-collapse" id="navMain">' +
      '<ul class="navbar-nav ms-auto align-items-lg-center">' +
      links
        .map(
          (l) =>
            '<li class="nav-item"><a class="nav-link ' +
            (current === l.dataView ? "active" : "") +
            '" data-view="' +
            l.dataView +
            '" href="' +
            l.href +
            '">' +
            l.label +
            "</a></li>"
        )
        .join("") +
      '<li class="nav-item ms-lg-3"><a class="btn btn-sun btn-sm" href="#/trips">Book a Trip</a></li>' +
      "</ul></div></div></nav>";
  }

  function renderFooter() {
    const host = document.getElementById("footer-j");
    if (!host) return;
    const c = CFG.CONTACT;
    host.innerHTML =
      '<footer class="footer pt-5 pb-4 mt-5">' +
      '<div class="container">' +
      '<div class="row">' +
      '<div class="col-md-4 mb-4">' +
      '<h5 class="text-white fw-bold"><i class="fas fa-paper-plane me-2"></i>Journeya</h5>' +
      '<p class="mb-2">Building a real-world community through games and travel.</p>' +
      "</div>" +
      '<div class="col-md-4 mb-4">' +
      "<h6 class=\"text-white fw-bold\">Quick Links</h6>" +
      '<ul class="list-unstyled">' +
      '<li><a href="#/events">Events</a></li>' +
      '<li><a href="#/trips">Trips</a></li>' +
      '<li><a href="#/about">About Us</a></li>' +
      '<li><a href="#/contact">Contact</a></li>' +
      '<li><a href="#/admin">Admin</a></li>' +
      "</ul></div>" +
      '<div class="col-md-4 mb-4">' +
      "<h6 class=\"text-white fw-bold\">Get in Touch</h6>" +
      '<p class="mb-1"><i class="fas fa-envelope me-2"></i><a href="mailto:' +
      c.email +
      '">' +
      c.email +
      "</a></p>" +
      '<p class="mb-1"><i class="fas fa-phone me-2"></i><a href="tel:' +
      c.phone +
      '">' +
      c.phone +
      "</a></p>" +
      '<p class="mb-3"><i class="fab fa-whatsapp me-2"></i><a href="https://wa.me/' +
      c.whatsapp +
      '" target="_blank" rel="noopener">WhatsApp us</a></p>' +
      '<div class="social">' +
      '<a href="' +
      c.instagram +
      '" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>' +
      '<a href="' +
      c.facebook +
      '" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>' +
      '<a href="' +
      c.tiktok +
      '" target="_blank" rel="noopener" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>' +
      "</div></div></div>" +
      '<hr class="border-secondary">' +
      '<p class="text-center small mb-0">&copy; ' +
      new Date().getFullYear() +
      " Journeya. All rights reserved.</p>" +
      "</div></footer>";
  }

  /* ---- Guest booking modal (shared across Events & Trips) ---- */
  window.JourneyaUI = {
    openBooking(type, item) {
      const host = document.getElementById("bookingModalHost");
      if (!host) return;

      const isTrip = type === "trip";
      const title = isTrip ? item.title : item.title;

      host.innerHTML =
        '<div class="modal fade" id="bookingModal" tabindex="-1" aria-hidden="true">' +
        '<div class="modal-dialog modal-dialog-centered">' +
        '<div class="modal-content rounded-4">' +
        '<div class="modal-header" style="background:linear-gradient(90deg,var(--j-primary),var(--j-accent));color:#fff;">' +
        "<h5 class=\"modal-title\"><i class=\"fas fa-ticket-alt me-2\"></i>Guest Booking</h5>" +
        '<button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>' +
        "</div>" +
        '<div class="modal-body">' +
        "<h6>Booking: " +
        title +
        "</h6>" +
        "<p class=\"text-muted small mb-3\">No account needed - just leave your details and you're booked.</p>" +
        '<form id="bookingForm" novalidate>' +
        '<div class="mb-3"><label class="form-label">Full Name *</label>' +
        '<input type="text" class="form-control" id="bkName" required placeholder="Your name"></div>' +
        '<div class="mb-3"><label class="form-label">Phone Number *</label>' +
        '<input type="tel" class="form-control" id="bkPhone" required placeholder="e.g. 0100 000 0000"></div>' +
        '<div class="mb-3"><label class="form-label">Email *</label>' +
        '<input type="email" class="form-control" id="bkEmail" required placeholder="you@example.com"></div>' +
        '<div class="mb-2 text-muted small"><i class="fas fa-credit-card me-1"></i>Pay by card, mobile wallet or cash on collection.</div>' +
        '<button type="submit" class="btn btn-j w-100">Confirm Booking</button>' +
        "</form></div></div></div></div>";

      host.innerHTML +=
        '<div class="modal fade" id="bookingSuccess" tabindex="-1" aria-hidden="true"><div class="modal-dialog modal-dialog-centered">' +
        '<div class="modal-content rounded-4 text-center p-4">' +
        '<i class="fas fa-check-circle text-success" style="font-size:3rem;"></i>' +
        "<h5 class=\"mt-3 fw-bold\">You're booked!</h5>" +
        "<p class=\"text-muted\">We'll contact you shortly to confirm your spot.</p>" +
        '<button type="button" class="btn btn-j" data-bs-dismiss="modal">Done</button>' +
        "</div></div></div>";

      const modal = new bootstrap.Modal(host.querySelector("#bookingModal"));
      modal.show();

      host.querySelector("#bookingForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        if (!form.checkValidity()) {
          form.classList.add("was-validated");
          return;
        }
        const booking = {
          type: isTrip ? "trip" : "event",
          item_id: item.id,
          name: host.querySelector("#bkName").value.trim(),
          phone: host.querySelector("#bkPhone").value.trim(),
          email: host.querySelector("#bkEmail").value.trim(),
          item_title: title,
        };
        try {
          await window.JourneyaAPI.createBooking(booking);
          modal.hide();
          new bootstrap.Modal(host.querySelector("#bookingSuccess")).show();
        } catch (err) {
          alert("Sorry, we couldn't complete your booking. Please try again.");
          console.error(err);
        }
      });
    },
  };

  const api = window.JourneyaAPI;
  if (api) {
    window.addEventListener("journeya:changed", () => {
      window.dispatchEvent(new CustomEvent("journeya:change"));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderNavbar();
    renderFooter();
    const go = () => window.JourneyaApp.navigate(window.JourneyaApp.current());
    window.addEventListener("hashchange", () => {
      const nav = document.getElementById("navMain");
      if (nav) nav.classList.remove("show");
      go();
    });
    go();
  });
})();
