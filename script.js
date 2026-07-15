/* Dandeli Resorts Booking — script.js */
(function () {
  "use strict";

  var WA_NUMBER = "918884113122";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header + scroll progress + hero parallax ---------- */
  var header = document.querySelector(".site-header");
  var progressBar = document.getElementById("progressBar");
  var heroContent = document.querySelector(".hero-content");
  var ticking = false;

  function paint() {
    ticking = false;
    var y = window.scrollY;
    header.classList.toggle("scrolled", y > 40);

    var max = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";

    if (!reducedMotion && heroContent && y < window.innerHeight) {
      heroContent.style.transform = "translateY(" + y * 0.16 + "px)";
      heroContent.style.opacity = String(Math.max(0, 1 - y / (window.innerHeight * 0.85)));
    }
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(paint); }
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  paint();

  /* ---------- Animated stat counters ---------- */
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var duration = 1700;
    var start = null;

    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  if (!reducedMotion) {
    setTimeout(function () {
      document.querySelectorAll("[data-count]").forEach(animateCounter);
    }, 700);
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");
  function closeNav() {
    document.body.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", function () {
    var open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("nav-open")) closeNav();
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeNav();
  });

  /* ---------- Scroll-spy for nav links ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var sections = navLinks
    .map(function (l) { return document.querySelector(l.getAttribute("href")); })
    .filter(Boolean);

  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      navLinks.forEach(function (l) {
        l.classList.toggle("active", l.getAttribute("href") === "#" + entry.target.id);
      });
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  sections.forEach(function (s) { spy.observe(s); });

  /* ---------- Reveal on scroll (with stagger) ---------- */
  document.querySelectorAll(".section-head").forEach(function (el) { el.classList.add("reveal"); });

  [".card-grid", ".include-grid", ".featured-grid", ".sight-grid", ".steps", ".gallery-grid"]
    .forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (parent) {
        Array.prototype.forEach.call(parent.children, function (child, i) {
          if (child.classList.contains("reveal")) {
            child.style.setProperty("--d", (i % 5) * 0.09 + "s");
          }
        });
      });
    });

  var revealer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { revealer.observe(el); });

  /* ---------- Enquiry form → WhatsApp ---------- */
  var form = document.getElementById("enquiryForm");
  var checkin = document.getElementById("checkin");
  var checkout = document.getElementById("checkout");

  // Don't allow past dates, and keep check-out on/after check-in.
  var todayISO = new Date().toISOString().split("T")[0];
  checkin.min = todayISO;
  checkout.min = todayISO;
  checkin.addEventListener("change", function () {
    checkout.min = checkin.value || todayISO;
    if (checkout.value && checkout.value < checkin.value) checkout.value = checkin.value;
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;

    var data = new FormData(form);
    var lines = [
      "Hi! I'd like to enquire about a Dandeli stay.",
      "",
      "Name: " + data.get("name"),
      "Mobile: " + data.get("mobile"),
      "Check-in: " + data.get("checkin"),
      "Check-out: " + data.get("checkout"),
      "People: " + data.get("people"),
      "Package: " + data.get("package")
    ];
    var msg = (data.get("message") || "").trim();
    if (msg) lines.push("Message: " + msg);

    var url = "https://wa.me/" + WA_NUMBER + "?text=" + encodeURIComponent(lines.join("\n"));
    window.open(url, "_blank", "noopener");
  });

  /* ---------- Gallery lightbox ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll(".g-item"));
  var lightbox = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCaption = document.getElementById("lbCaption");
  var current = 0;

  function showLightbox(index) {
    current = (index + items.length) % items.length;
    var img = items[current].querySelector("img");
    var cap = items[current].querySelector("figcaption");
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = cap ? cap.textContent : "";
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function hideLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  items.forEach(function (item, i) {
    item.addEventListener("click", function () { showLightbox(i); });
  });
  document.getElementById("lbClose").addEventListener("click", hideLightbox);
  document.getElementById("lbPrev").addEventListener("click", function () { showLightbox(current - 1); });
  document.getElementById("lbNext").addEventListener("click", function () { showLightbox(current + 1); });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) hideLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") hideLightbox();
    if (e.key === "ArrowLeft") showLightbox(current - 1);
    if (e.key === "ArrowRight") showLightbox(current + 1);
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
