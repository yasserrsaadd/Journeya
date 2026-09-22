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
    faq: "faq-section",
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
      const sharedView = document.getElementById("view-shared");
      if (sharedView) sharedView.style.display = "none";

      if (isAdmin) {
        if (views.admin) views.admin();
        window.scrollTo(0, 0);
        setupReveal();
        window.dispatchEvent(new CustomEvent("journeya:view", { detail: { name: s } }));
        return;
      }

      /* Private share links: #/event/:token  (and legacy #/trip/:token,
         which now reliably shows a "Link not found" page) */
      const sharedMatch = s.match(/^(event|trip)\/(.+)$/i);
      if (sharedMatch) {
        document.querySelectorAll(".page-section").forEach((v) => (v.style.display = "none"));
        if (sharedView) sharedView.style.display = "";
        window.scrollTo(0, 0);
        setupReveal();
        const detail = { name: "shared", token: decodeURIComponent(sharedMatch[2]) };
        if (views.shared) views.shared(detail);
        window.dispatchEvent(new CustomEvent("journeya:view", { detail }));
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
      window.dispatchEvent(new CustomEvent("journeya:view", { detail: { name: s } }));
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

  /* ---- Hero background slider (photos are .hero-slide divs in the HTML) ---- */
  function initHeroSlider() {
    const slider = document.getElementById("heroSlider");
    if (!slider) return;

    const slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    if (!slides.length) return;

    const hero = slider.closest(".hero");
    const dotsHost = document.getElementById("heroDots");
    const INTERVAL = 6000;
    let index = Math.max(
      0,
      slides.findIndex(function (s) {
        return s.classList.contains("is-active");
      })
    );
    let timer = null;

    const dots = slides.map(function (slide, i) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "hero-dot";
      dot.setAttribute("aria-label", "Show background photo " + (i + 1));
      dot.addEventListener("click", function () {
        show(i);
        restart();
      });
      if (dotsHost) dotsHost.appendChild(dot);
      return dot;
    });

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        const active = i === index;
        dot.classList.toggle("is-active", active);
        if (active) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }

    function restart() {
      window.clearInterval(timer);
      if (slides.length > 1 && !document.hidden) {
        timer = window.setInterval(function () {
          show(index + 1);
        }, INTERVAL);
      }
    }

    const prev = hero && hero.querySelector(".hero-nav-prev");
    const next = hero && hero.querySelector(".hero-nav-next");
    if (prev)
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    if (next)
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) window.clearInterval(timer);
      else restart();
    });

    show(index);
    restart();
  }

  /* ---- Render shared navbar & footer into placeholders ---- */
  function renderNavbar() {
    const host = document.getElementById("navbar-j");
    if (!host) return;
    const links = [
      { href: "#home-section", dataSection: "home-section", label: "Home" },
      { href: "#events-section", dataSection: "events-section", label: "Events" },
      { href: "#faq-section", dataSection: "faq-section", label: "FAQ" },
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
      '<li class="nav-item ms-lg-3"><a class="btn btn-j btn-sm" href="#events-section">Book an event</a></li>' +
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
      '<p class="mb-2">Building a real-world community through games and good times.</p>' +
      "</div>" +
      '<div class="col-md-4 mb-4">' +
      "<h6 class=\"text-white fw-bold\">Quick Links</h6>" +
      '<ul class="list-unstyled">' +
      '<li><a href="#events-section">Events</a></li>' +
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

  /* ---- Small helpers ---- */
  function esc(s) {
    return String(s == null ? "" : s).replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function money(n) {
    if (n == null || n === "") return "";
    return "EGP " + Number(n).toLocaleString();
  }
  function copyToClipboard(txt) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(txt);
    }
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement("textarea");
        ta.value = txt;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error("copy failed"));
      } catch (e) {
        reject(e);
      }
    });
  }

  /* ---- Guest booking modal (events & professional events) ---- */
  window.JourneyaUI = {
    openBooking(type, item) {
      const host = document.getElementById("bookingModalHost");
      if (!host) return;

      if (typeof item === "string") {
        try { item = JSON.parse(item); } catch (e) { item = {}; }
      }
      const tiers = Array.isArray(item._tiers) ? item._tiers : [];
      delete item._tiers;

      const title = item.title || (item.location || "Journeya experience");
      const isProf = type === "event" && item.event_type === "professional";

      /* Multi-tier selection for professional events */
      const tiersHtml =
        isProf && tiers.length
          ? '<div class="mb-3"><label class="form-label">Ticket Tier *</label>' +
            tiers
              .map(
                (t, i) =>
                  '<div class="form-check tier-option"><input class="form-check-input tier-radio" type="radio" name="bkTier" value="' +
                  i +
                  '" id="tier' +
                  i +
                  '"' +
                  (i === 0 ? " checked" : "") +
                  '><label class="form-check-label" for="tier' +
                  i +
                  '">' +
                  esc(t.name) +
                  ' <span class="fw-bold" style="color:var(--j-primary);">' +
                  money(t.price) +
                  "</span></label></div>"
              )
              .join("") +
            "</div>"
          : '<input type="hidden" id="bkTierIdx" value="-1">';

      /* Custom fields for professional events (IG account, job title, ...) */
      const fields = isProf && Array.isArray(item.custom_fields) ? item.custom_fields.filter((f) => (f.label || "").trim()) : [];
      const fieldsHtml = fields
        .map(
          (f, i) =>
            '<div class="mb-3"><label class="form-label">' +
            esc(f.label) +
            (f.required ? " *" : "") +
            '</label><input type="text" class="form-control bk-custom" data-i="' +
            i +
            '" placeholder="' +
            esc(f.label) +
            '"' +
            (f.required ? " required" : "") +
            "></div>"
        )
        .join("");

      /* Optional seats (limited-capacity items) */
      const seatsCap = item.seats ? Number(item.seats) : 0;
      const seatsHtml = seatsCap
        ? '<div class="mb-3"><label class="form-label">Number of Seats *</label>' +
          '<input type="number" class="form-control" id="bkSeats" value="1" min="1" max="' +
          seatsCap +
          '" required></div>'
        : '<input type="hidden" id="bkSeats" value="1">';

      /* ---- Payment block: full price + InstaPay address + proof upload ---- */
      const instapay = (CFG.CONTACT && CFG.CONTACT.instapay) || "";
      const instapayName = (CFG.CONTACT && CFG.CONTACT.instapay_name) || "Journeya";
      const payHtml = instapay
        ? '<div class="pay-box mb-3">' +
          '<div class="d-flex justify-content-between align-items-center flex-wrap gap-2">' +
          '<span class="fw-bold small text-uppercase">Total to pay</span>' +
          '<span class="pay-total" id="bkTotal">&mdash;</span>' +
          "</div>" +
          '<div class="small text-muted" id="bkBreakdown"></div>' +
          '<hr class="my-3">' +
          '<div class="d-flex justify-content-between align-items-center flex-wrap gap-1 mb-2">' +
          '<span class="fw-semibold small"><i class="fas fa-mobile-screen-button me-1"></i>Send the total to our InstaPay</span>' +
          '<span class="text-muted small">' + esc(instapayName) + "</span>" +
          "</div>" +
          '<div class="pay-number-row mb-3">' +
          '<code class="pay-number" id="bkInstapay">' + esc(instapay) + "</code>" +
          '<button type="button" class="btn btn-sm btn-j-outline on-light" id="bkCopyInstapay" aria-label="Copy InstaPay address">' +
          '<i class="fas fa-copy me-1"></i>Copy</button>' +
          "</div>" +
          '<label class="form-label">Upload the transfer screenshot *</label>' +
          '<input type="file" class="form-control" id="bkProof" accept="image/*" required>' +
          '<div class="form-text">Transfer the total above, screenshot the receipt, then upload it here so we can confirm your spot.</div>' +
          '<div class="mt-2" id="bkProofPreview"></div>' +
          "</div>"
        : "";

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
        esc(title) +
        "</h6>" +
        '<form id="bookingForm" novalidate>' +
        '<div class="mb-3"><label class="form-label">Full Name *</label>' +
        '<input type="text" class="form-control" id="bkName" required placeholder="Your name"></div>' +
        '<div class="mb-3"><label class="form-label">Phone Number *</label>' +
        '<input type="tel" class="form-control" id="bkPhone" required placeholder="e.g. 0100 000 0000"></div>' +
        '<div class="mb-3"><label class="form-label">Email *</label>' +
        '<input type="email" class="form-control" id="bkEmail" required placeholder="you@example.com"></div>' +
        tiersHtml +
        fieldsHtml +
        seatsHtml +
        payHtml +
        '<div id="bkError"></div>' +
        '<button type="submit" class="btn btn-j w-100" id="bkSubmit">Confirm Booking</button>' +
        "</form></div></div></div></div>";

      host.innerHTML +=
        '<div class="modal fade" id="bookingSuccess" tabindex="-1" aria-hidden="true"><div class="modal-dialog modal-dialog-centered">' +
        '<div class="modal-content rounded-4 text-center p-4">' +
        '<i class="fas fa-check-circle text-success" style="font-size:3rem;"></i>' +
        "<h5 class=\"mt-3 fw-bold\">You're booked!</h5>" +
        "<p class=\"text-muted\">We'll verify your transfer and contact you to confirm your spot.</p>" +
        '<p class="fw-bold" id="bkPaidTotal" style="color:var(--j-primary);display:none;"></p>' +
        '<p class="fw-bold" id="bkSeatInfo" style="color:var(--j-primary);display:none;"></p>' +
        '<button type="button" class="btn btn-j" data-bs-dismiss="modal">Done</button>' +
        "</div></div></div>";

      const modal = new bootstrap.Modal(host.querySelector("#bookingModal"));
      modal.show();

      /* ---- Live total: unit price x seats (tier-aware) ---- */
      const form0 = host.querySelector("#bookingForm");
      const totalEl = host.querySelector("#bkTotal");
      const breakdownEl = host.querySelector("#bkBreakdown");

      function currentUnit() {
        const r = form0.querySelector(".tier-radio:checked");
        const tier = r ? tiers[Number(r.value)] : null;
        return {
          tier: tier,
          unit: tier ? Number(tier.price) : item.price != null ? Number(item.price) : null,
        };
      }
      function recalcTotal() {
        if (!totalEl) return;
        const seatsEl = form0.querySelector("#bkSeats");
        const seats = Math.max(1, Number(seatsEl ? seatsEl.value : 1) || 1);
        const { tier, unit } = currentUnit();
        if (unit == null || isNaN(unit)) {
          totalEl.textContent = "—";
          if (breakdownEl) breakdownEl.textContent = "Price for this event is confirmed by the team.";
          return;
        }
        const total = Math.round(unit * seats * 100) / 100;
        totalEl.textContent = money(total);
        if (breakdownEl) {
          breakdownEl.textContent =
            (tier ? tier.name + " — " : "") +
            money(unit) +
            (seats > 1 ? " x " + seats + " seats" : " x 1 seat");
        }
      }
      recalcTotal();
      form0.querySelectorAll(".tier-radio").forEach((r) => r.addEventListener("change", recalcTotal));
      const seatsEl0 = form0.querySelector("#bkSeats");
      if (seatsEl0) seatsEl0.addEventListener("input", recalcTotal);

      /* ---- Copy the InstaPay address ---- */
      const copyBtn = host.querySelector("#bkCopyInstapay");
      if (copyBtn) {
        copyBtn.addEventListener("click", () => {
          copyToClipboard(instapay)
            .then(() => {
              copyBtn.innerHTML = '<i class="fas fa-check me-1"></i>Copied';
              copyBtn.classList.add("btn-copied");
              window.setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy me-1"></i>Copy';
                copyBtn.classList.remove("btn-copied");
              }, 2000);
            })
            .catch(() => {
              window.prompt("Copy this InstaPay address:", instapay);
            });
        });
      }

      /* ---- Screenshot preview ---- */
      const proofInput = host.querySelector("#bkProof");
      const proofPreview = host.querySelector("#bkProofPreview");
      if (proofInput && proofPreview) {
        proofInput.addEventListener("change", () => {
          const f = proofInput.files && proofInput.files[0];
          if (!f) {
            proofPreview.innerHTML = "";
            return;
          }
          if (!/^image\//.test(f.type)) {
            proofPreview.innerHTML =
              '<div class="alert alert-warning py-2 small mb-0">Please choose an image file.</div>';
            return;
          }
          const url = URL.createObjectURL(f);
          proofPreview.innerHTML =
            '<img src="' + url + '" class="proof-thumb" alt="Selected transfer screenshot">';
        });
      }

      host.querySelector("#bookingForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const form = e.target;
        const errBox = host.querySelector("#bkError");
        const submitBtn = host.querySelector("#bkSubmit");
        const proofEl = form.querySelector("#bkProof");
        const file = proofEl && proofEl.files && proofEl.files[0];

        function fail(msg) {
          if (errBox)
            errBox.innerHTML = '<div class="alert alert-danger py-2 small mb-3">' + esc(msg) + "</div>";
        }

        if (errBox) errBox.innerHTML = "";

        if (!form.checkValidity()) {
          form.classList.add("was-validated");
          if (!file) fail("Please upload a screenshot of your InstaPay transfer.");
          return;
        }
        if (proofEl && !file) {
          fail("Please upload a screenshot of your InstaPay transfer.");
          proofEl.focus();
          return;
        }

        const tierRadio = form.querySelector(".tier-radio:checked");
        const tier = tierRadio ? tiers[Number(tierRadio.value)] : null;
        const seats = Math.max(1, Number(form.querySelector("#bkSeats").value) || 1);
        const unit = tier ? Number(tier.price) : item.price != null ? Number(item.price) : null;
        const total = unit != null && !isNaN(unit) ? Math.round(unit * seats * 100) / 100 : null;

        const customData = {};
        fields.forEach((f, i) => {
          const inp = form.querySelector('.bk-custom[data-i="' + i + '"]');
          customData[f.label] = inp ? inp.value.trim() : "";
        });

        const booking = {
          type: type,
          item_id: item.id,
          item_title: title,
          name: form.querySelector("#bkName").value.trim(),
          phone: form.querySelector("#bkPhone").value.trim(),
          email: form.querySelector("#bkEmail").value.trim(),
          tier_id: tier ? tier.id : null,
          tier_name: tier ? tier.name : null,
          tier_price: tier ? Number(tier.price) : null,
          custom_data: customData,
          seats: seats,
          total: total,
        };

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Uploading screenshot...';
        }
        try {
          /* Upload the screenshot first: guests cannot update their booking
             afterwards, so the URL is stored by create_booking itself. */
          if (file) {
            booking.payment_proof_url = await window.JourneyaAPI.uploadPaymentProof(file);
          }
          const created = await window.JourneyaAPI.createBooking(booking);
          const assigned =
            created && Array.isArray(created.seat_numbers) && created.seat_numbers.length
              ? created.seat_numbers.map(Number)
              : null;
          const paidTotal = host.querySelector("#bkPaidTotal");
          if (paidTotal) {
            if (total != null) {
              paidTotal.textContent = "Total transferred: " + money(total);
              paidTotal.style.display = "";
            } else {
              paidTotal.style.display = "none";
            }
          }
          const seatInfo = host.querySelector("#bkSeatInfo");
          if (seatInfo) {
            if (assigned && assigned.length) {
              seatInfo.textContent =
                assigned.length === 1
                  ? "Your seat number: " + assigned[0]
                  : "Your seat numbers: " + assigned.join(", ");
              seatInfo.style.display = "";
            } else {
              seatInfo.style.display = "none";
            }
          }
          modal.hide();
          new bootstrap.Modal(host.querySelector("#bookingSuccess")).show();
        } catch (err) {
          const serverMsg = err && err.message;
          if (/seat/i.test(serverMsg)) {
            alert(serverMsg);
          } else {
            fail(serverMsg || "Sorry, we couldn't complete your booking. Please try again.");
          }
          console.error(err);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Confirm Booking";
          }
        }
      });
    },

    /* Wire up every event-card photo slider inside `scope`. */
    initSliders,

    /* Open the full-screen photo viewer. */
    openLightbox,
  };

  /* ============================================================
     Event card photo sliders + lightbox
     Markup is produced by the card templates; this only adds the
     behaviour (arrows, dots, swipe, click-to-enlarge).
     ============================================================ */
  function sliderGo(slider, index) {
    const slides = slider.querySelectorAll(".card-slide");
    if (!slides.length) return;
    const i = (index + slides.length) % slides.length;
    slider.dataset.index = String(i);
    slides.forEach((s, n) => s.classList.toggle("is-active", n === i));
    slider.querySelectorAll(".card-slider-dot").forEach((d, n) => {
      const active = n === i;
      d.classList.toggle("is-active", active);
      if (active) d.setAttribute("aria-current", "true");
      else d.removeAttribute("aria-current");
    });
  }

  function initSliders(scope) {
    const root = scope || document;
    root.querySelectorAll(".card-slider").forEach((slider) => {
      if (slider.dataset.ready === "1") return;
      slider.dataset.ready = "1";

      const slides = slider.querySelectorAll(".card-slide");
      if (slides.length < 2) return;

      const dotsHost = slider.querySelector(".card-slider-dots");
      slides.forEach((slide, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "card-slider-dot";
        dot.setAttribute("aria-label", "Show photo " + (i + 1));
        dot.addEventListener("click", (e) => {
          e.stopPropagation();
          sliderGo(slider, i);
        });
        if (dotsHost) dotsHost.appendChild(dot);
      });

      const move = (step) => sliderGo(slider, Number(slider.dataset.index || 0) + step);
      const prev = slider.querySelector(".card-slider-prev");
      const next = slider.querySelector(".card-slider-next");
      if (prev)
        prev.addEventListener("click", (e) => {
          e.stopPropagation();
          move(-1);
        });
      if (next)
        next.addEventListener("click", (e) => {
          e.stopPropagation();
          move(1);
        });

      /* Swipe on touch devices (horizontal only, so page scroll still works) */
      let startX = 0;
      let startY = 0;
      let tracking = false;
      slider.addEventListener(
        "touchstart",
        (e) => {
          const t = e.touches && e.touches[0];
          if (!t) return;
          startX = t.clientX;
          startY = t.clientY;
          tracking = true;
        },
        { passive: true }
      );
      slider.addEventListener("touchend", (e) => {
        if (!tracking) return;
        tracking = false;
        const t = e.changedTouches && e.changedTouches[0];
        if (!t) return;
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
      });

      /* Click a photo (not the controls) to enlarge it */
      slider.addEventListener("click", (e) => {
        if (e.target && e.target.closest && e.target.closest(".card-slider-nav, .card-slider-dot")) return;
        let photos = [];
        try {
          photos = JSON.parse(slider.dataset.photos || "[]");
        } catch (err) {
          photos = [];
        }
        if (photos.length) openLightbox(photos, Number(slider.dataset.index || 0));
      });

      sliderGo(slider, 0);
    });
  }

  let lbPhotos = [];
  let lbIndex = 0;

  function ensureLightbox() {
    let host = document.getElementById("lightboxHost");
    if (!host) {
      host = document.createElement("div");
      host.id = "lightboxHost";
      document.body.appendChild(host);
    }
    let box = host.querySelector(".photo-lightbox");
    if (!box) {
      host.innerHTML =
        '<div class="photo-lightbox" hidden role="dialog" aria-modal="true" aria-label="Event photos">' +
        '<button type="button" class="photo-lightbox-close" aria-label="Close"><i class="fas fa-xmark"></i></button>' +
        '<button type="button" class="photo-lightbox-nav photo-lightbox-prev" aria-label="Previous photo"><i class="fas fa-chevron-left"></i></button>' +
        '<img class="photo-lightbox-img" alt="">' +
        '<button type="button" class="photo-lightbox-nav photo-lightbox-next" aria-label="Next photo"><i class="fas fa-chevron-right"></i></button>' +
        '<div class="photo-lightbox-count"></div>' +
        "</div>";
      box = host.querySelector(".photo-lightbox");

      box.addEventListener("click", (e) => {
        if (e.target === box || e.target === box.querySelector(".photo-lightbox-img")) return;
        if (e.target.closest(".photo-lightbox-close")) closeLightbox();
        else if (e.target.closest(".photo-lightbox-prev")) lbStep(-1);
        else if (e.target.closest(".photo-lightbox-next")) lbStep(1);
      });

      document.addEventListener("keydown", (e) => {
        if (!box || box.hidden) return;
        if (e.key === "Escape") closeLightbox();
        else if (e.key === "ArrowLeft") lbStep(-1);
        else if (e.key === "ArrowRight") lbStep(1);
      });
    }
    return box;
  }

  function lbStep(step) {
    if (!lbPhotos.length) return;
    lbIndex = (lbIndex + step + lbPhotos.length) % lbPhotos.length;
    renderLightbox();
  }

  function renderLightbox() {
    const host = document.getElementById("lightboxHost");
    const box = host && host.querySelector(".photo-lightbox");
    if (!box || !lbPhotos.length) return;
    lbIndex = (lbIndex + lbPhotos.length) % lbPhotos.length;
    const img = box.querySelector(".photo-lightbox-img");
    const count = box.querySelector(".photo-lightbox-count");
    img.src = lbPhotos[lbIndex];
    img.alt = "Photo " + (lbIndex + 1) + " of " + lbPhotos.length;
    count.textContent = lbIndex + 1 + " / " + lbPhotos.length;
    const multi = lbPhotos.length > 1 ? "" : "none";
    box.querySelector(".photo-lightbox-prev").style.display = multi;
    box.querySelector(".photo-lightbox-next").style.display = multi;
    count.style.display = multi;
  }

  function openLightbox(photos, index) {
    lbPhotos = Array.isArray(photos) ? photos.filter(Boolean) : [];
    if (!lbPhotos.length) return;
    lbIndex = Number(index) || 0;
    const box = ensureLightbox();
    box.hidden = false;
    document.body.classList.add("lb-open");
    renderLightbox();
  }

  function closeLightbox() {
    const host = document.getElementById("lightboxHost");
    const box = host && host.querySelector(".photo-lightbox");
    if (!box) return;
    box.hidden = true;
    document.body.classList.remove("lb-open");
  }

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
    initHeroSlider();

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
