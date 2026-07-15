/* Resort detail pages — resort.js (self-contained, safe if elements absent) */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Sticky header */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* Mobile nav */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        document.body.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Reveal on scroll */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && !reduced && "IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("visible"); obs.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { obs.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("visible"); });
  }

  /* Gallery lightbox */
  var items = Array.prototype.slice.call(document.querySelectorAll(".g-item"));
  var lightbox = document.getElementById("lightbox");
  if (items.length && lightbox) {
    var lbImg = document.getElementById("lbImg");
    var lbCaption = document.getElementById("lbCaption");
    var current = 0;
    var show = function (i) {
      current = (i + items.length) % items.length;
      var img = items[current].querySelector("img");
      var cap = items[current].querySelector("figcaption");
      lbImg.src = img.src; lbImg.alt = img.alt;
      lbCaption.textContent = cap ? cap.textContent : "";
      lightbox.hidden = false; document.body.style.overflow = "hidden";
    };
    var hide = function () { lightbox.hidden = true; document.body.style.overflow = ""; };
    items.forEach(function (item, i) { item.addEventListener("click", function () { show(i); }); });
    document.getElementById("lbClose").addEventListener("click", hide);
    document.getElementById("lbPrev").addEventListener("click", function () { show(current - 1); });
    document.getElementById("lbNext").addEventListener("click", function () { show(current + 1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) hide(); });
    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") hide();
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  }

  /* Footer year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
