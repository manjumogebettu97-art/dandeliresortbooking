/* Resort detail pages — resort.js (self-contained, safe if elements absent) */
(function () {
  "use strict";
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Sticky header */
  var header = document.querySelector(".site-header");
  var progressBar = document.getElementById("progressBar");
  if (header) {
    var onScroll = function () {
      var y = window.scrollY;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      header.classList.toggle("scrolled", y > 40);
      if (progressBar) {
        progressBar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    requestAnimationFrame(onScroll);
  }

  /* Mobile nav */
  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("mainNav");
  var navScrim = document.getElementById("navScrim");
  if (toggle && nav) {
    var mobileNavQuery = window.matchMedia("(max-width: 860px)");
    var syncNavState = function () {
      var open = document.body.classList.contains("nav-open");
      var hidden = mobileNavQuery.matches && !open;
      nav.inert = hidden;
      nav.setAttribute("aria-hidden", String(hidden));
      if (!mobileNavQuery.matches) nav.removeAttribute("aria-hidden");
    };
    var closeNav = function (returnFocus) {
      document.body.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      syncNavState();
      if (returnFocus) toggle.focus();
    };
    toggle.addEventListener("click", function () {
      var open = document.body.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      syncNavState();
      if (open) {
        window.setTimeout(function () {
          var firstLink = nav.querySelector("a[href]");
          if (firstLink) firstLink.focus();
        }, 50);
      }
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) closeNav(false);
    });
    document.addEventListener("keydown", function (e) {
      if (!document.body.classList.contains("nav-open")) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeNav(true);
        return;
      }
      if (e.key === "Tab") {
        var links = Array.prototype.slice.call(nav.querySelectorAll("a[href]"));
        if (!links.length) return;
        var first = links[0];
        var last = links[links.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          toggle.focus();
        } else if (e.shiftKey && document.activeElement === toggle) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          toggle.focus();
        } else if (!e.shiftKey && document.activeElement === toggle) {
          e.preventDefault();
          first.focus();
        }
      }
    });
    if (navScrim) navScrim.addEventListener("click", function () { closeNav(true); });
    var handleNavModeChange = function () {
      if (!mobileNavQuery.matches) closeNav(false);
      else syncNavState();
    };
    if (typeof mobileNavQuery.addEventListener === "function") mobileNavQuery.addEventListener("change", handleNavModeChange);
    else mobileNavQuery.addListener(handleNavModeChange);
    syncNavState();
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
    var returnFocus = null;
    items.forEach(function (item) {
      var cap = item.querySelector("figcaption");
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");
      item.setAttribute("aria-label", "Open image: " + (cap ? cap.textContent : "gallery photo"));
    });
    var show = function (i) {
      if (lightbox.hidden) returnFocus = document.activeElement;
      current = (i + items.length) % items.length;
      var img = items[current].querySelector("img");
      var cap = items[current].querySelector("figcaption");
      lbImg.src = img.currentSrc || img.src; lbImg.alt = img.alt;
      lbCaption.textContent = cap ? cap.textContent : "";
      lightbox.hidden = false; document.body.style.overflow = "hidden";
      document.getElementById("lbClose").focus();
    };
    var hide = function () {
      lightbox.hidden = true;
      document.body.style.overflow = "";
      lbImg.removeAttribute("src");
      if (returnFocus && typeof returnFocus.focus === "function") returnFocus.focus();
    };
    items.forEach(function (item, i) {
      item.addEventListener("click", function () { show(i); });
      item.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          show(i);
        }
      });
    });
    document.getElementById("lbClose").addEventListener("click", hide);
    document.getElementById("lbPrev").addEventListener("click", function () { show(current - 1); });
    document.getElementById("lbNext").addEventListener("click", function () { show(current + 1); });
    lightbox.addEventListener("click", function (e) { if (e.target === lightbox) hide(); });
    document.addEventListener("keydown", function (e) {
      if (lightbox.hidden) return;
      if (e.key === "Escape") { e.preventDefault(); hide(); }
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
      if (e.key === "Tab") {
        var controls = [document.getElementById("lbClose"), document.getElementById("lbPrev"), document.getElementById("lbNext")];
        if (e.shiftKey && document.activeElement === controls[0]) {
          e.preventDefault(); controls[2].focus();
        } else if (!e.shiftKey && document.activeElement === controls[2]) {
          e.preventDefault(); controls[0].focus();
        }
      }
    });
  }

  /* Auto-moving carousels (About section) */
  document.querySelectorAll("[data-carousel]").forEach(function (car) {
    var slides = car.querySelectorAll(".sc-slide");
    var dots = car.querySelectorAll(".sc-dot");
    if (slides.length < 2) return;
    var idx = 0;
    var timer = null;
    var delay = 4000;
    function goTo(n) {
      slides[idx].classList.remove("is-active");
      if (dots[idx]) dots[idx].classList.remove("is-active");
      idx = (n + slides.length) % slides.length;
      slides[idx].classList.add("is-active");
      if (dots[idx]) dots[idx].classList.add("is-active");
    }
    function start() {
      if (reduced || timer) return;
      timer = setInterval(function () { goTo(idx + 1); }, delay);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    dots.forEach(function (dot, n) {
      dot.addEventListener("click", function () { goTo(n); stop(); start(); });
    });
    car.addEventListener("mouseenter", stop);
    car.addEventListener("mouseleave", start);
    if (document.hidden !== undefined) {
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) stop(); else start();
      });
    }
    start();
  });

  /* Footer year */
  var y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();
})();
