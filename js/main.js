/*
 * ============================================================
 *  JOURNEYA - Shared UI helpers (navbar, footer, booking modal)
 * ============================================================
 */

(function () {
  const CFG = window.JOURNEYA_CONFIG;

  /* ---- Single-page navigation: all sections scroll; admin is the only routed view ---- */
  const views = {};
  const routeMap = {
    home: "home-section",
    events: "events-section",
    trips: "trips-section",
    about: "about-section",
    contact: "contact-section",
  };
  const NAV_OFFSET = 76;

  window.JourneyaApp = {
    register(name, showFn) {
      views[name] = showFn;
    },
    setupReveal,
    navigate(name) {
      const s = String(name || "home");
      const isAdmin = s === "admin";

      document.querySelectorAll(".page-section").forEach((v) => (v.style.display = isAdmin ? "none" : ""));
      const adminView = document.getElementById("view-admin");
      if (adminView) adminView.style.display = isAdmin ? "" : "none";
      const foot = document.getElementById("footer-j");
      if (foot) foot.style.display = isAdmin ? "none" : "";

      if (isAdmin) {
        if (views.admin) views.admin();
        window.scrollTo(0, 0);
        setupReveal();
        return;
      }

      const targetId = routeMap[s] || s;
      const target = targetId && targetId !== "home-section" ? document.getElementById(targetId) : null;
      if (target) {
        const top = target.getBoundingClientRect().top + window.scrollY - NAV_OFFSET;
        window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setupReveal();
    },
    current() {
      return (window.location.hash || "").replace(/^#\/?/, "") || "home";
    },
  };

  /* ---- Scroll-reveal: fade elements in as they enter the viewport ---- */
  function setupReveal() {
    const els = document.querySelectorAll(".reveal:not(.observed)");
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("revealed"));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("revealed");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => {
      el.classList.add("observed");
      io.observe(el);
    });
  }

  /* ---- Render shared navbar & footer into placeholders ---- */
  function renderNavbar() {
    const host = document.getElementById("navbar-j");
    if (!host) return;
    const links = [
      { href: "#home-section", dataSection: "home-section", label: "Home" },
      { href: "#events-section", dataSection: "events-section", label: "Events" },
      { href: "#trips-section", dataSection: "trips-section", label: "Trips" },
      { href: "#about-section", dataSection: "about-section", label: "About" },
      { href: "#contact-section", dataSection: "contact-section", label: "Contact" },
    ];
    host.innerHTML =
      '<nav class="navbar navbar-expand-lg navbar-j fixed-top">' +
      '<div class="container">' +
      '<a class="navbar-brand" href="#home-section"><img src="images/logo-cropped.png" alt="Journeya" class="navbar-logo" /></a>' +
      '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain" aria-controls="navMain" aria-expanded="false" aria-label="Toggle navigation">' +
      '<span class="navbar-toggler-icon"></span></button>' +
      '<div class="collapse navbar-collapse" id="navMain">' +
      '<ul class="navbar-nav ms-auto align-items-lg-center">' +
      links
        .map(
          (l) =>
            '<li class="nav-item"><a class="nav-link" data-section="' +
            l.dataSection +
            '" href="' +
            l.href +
            '">' +
            l.label +
            "</a></li>"
        )
        .join("") +
      '<li class="nav-item ms-lg-3"><a class="btn btn-j btn-sm" href="#trips-section">Book a trip/event</a></li>' +
      "</ul></div></div></nav>";
  }

  function renderFooter() {
    const host = document.getElementById("footer-j");
    if (!host) return;
    const c = CFG.CONTACT;
    host.innerHTML =
      '<footer class="footer pt-5 pb-4 mt-5 reveal">' +
      '<div class="container">' +
      '<div class="row">' +
      '<div class="col-md-4 mb-4">' +
      '<h5 class="text-white fw-bold"><img src="images/logo-cropped.png" alt="Journeya" class="footer-logo" /></h5>' +
      '<p class="mb-2">Building a real-world community through games and travel.</p>' +
      "</div>" +
      '<div class="col-md-4 mb-4">' +
      "<h6 class=\"text-white fw-bold\">Quick Links</h6>" +
      '<ul class="list-unstyled">' +
      '<li><a href="#events-section">Events</a></li>' +
      '<li><a href="#trips-section">Trips</a></li>' +
      '<li><a href="#about-section">About Us</a></li>' +
      '<li><a href="#contact-section">Contact</a></li>' +
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

  /* ---- Scrollspy: highlight the nav link of the section in view ---- */
  function setupScrollSpy() {
    const links = Array.from(document.querySelectorAll(".nav-link[data-section]"));
    if (!links.length || !("IntersectionObserver" in window)) return;
    const map = {};
    links.forEach((l) => (map[l.dataset.section] = l));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            links.forEach((l) => l.classList.remove("active"));
            const link = map[en.target.id];
            if (link) link.classList.add("active");
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    document.querySelectorAll(".page-section[id]").forEach((s) => io.observe(s));
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderNavbar();
    renderFooter();
    setupScrollSpy();

    const navEl = document.querySelector(".navbar-j");
    let ticking = false;
    function onScroll() {
      if (!navEl) return;
      navEl.classList.toggle("scrolled", (window.scrollY || 0) > 50);
    }
    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            onScroll();
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
    onScroll();

    // Smooth-scroll in-page anchors and collapse the mobile menu on click
    document.addEventListener("click", (e) => {
      const el = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
      if (!el) return;
      const href = el.getAttribute("href");
      if (!href || href === "#" || href === "#top") return;
      e.preventDefault();
      if (window.location.hash === href) {
        window.JourneyaApp.navigate(href.slice(1));
      } else {
        window.location.hash = href;
      }
      const nav = document.getElementById("navMain");
      if (nav) nav.classList.remove("show");
    });

    window.addEventListener("hashchange", () => {
      window.JourneyaApp.navigate(window.JourneyaApp.current());
    });
    window.JourneyaApp.navigate(window.JourneyaApp.current());
  });
})();
