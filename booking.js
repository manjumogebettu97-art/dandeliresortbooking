/* Booking enquiry modal — intercepts WhatsApp buttons and collects
   name / dates / guests before handing off to WhatsApp.
   Call (tel:) links are left untouched. Degrades gracefully: if this
   script fails to load, WhatsApp links work as normal direct links. */
(function () {
  "use strict";
  var DEFAULT_NUMBER = "918884113122";

  /* ---- Build the modal once ---- */
  var dlg = document.createElement("dialog");
  dlg.className = "booking-modal";
  dlg.id = "bookingModal";
  dlg.setAttribute("aria-label", "Booking enquiry");
  dlg.innerHTML =
    '<form class="bm-form" id="bmForm" novalidate>' +
      '<button type="button" class="bm-close" data-close aria-label="Close">&times;</button>' +
      '<h3 class="bm-title">Enquire &amp; Book</h3>' +
      '<p class="bm-sub">Share a few details — we’ll continue on WhatsApp.</p>' +
      '<label class="bm-field"><span>Name</span>' +
        '<input type="text" name="name" required autocomplete="name" placeholder="Your full name"></label>' +
      '<div class="bm-row">' +
        '<label class="bm-field"><span>Check-in</span><input type="date" name="checkin" required></label>' +
        '<label class="bm-field"><span>Check-out</span><input type="date" name="checkout" required></label>' +
      '</div>' +
      '<label class="bm-field"><span>Number of people</span>' +
        '<input type="number" name="people" min="1" inputmode="numeric" required placeholder="e.g. 4"></label>' +
      '<button type="submit" class="btn btn-primary btn-block bm-submit">Continue on WhatsApp</button>' +
      '<p class="bm-note">Opens WhatsApp with your details pre-filled — no spam.</p>' +
    '</form>';
  document.body.appendChild(dlg);

  var form = dlg.querySelector("#bmForm");
  var state = { number: DEFAULT_NUMBER, base: "" };

  function todayStr() { return new Date().toISOString().slice(0, 10); }

  function openModal(number, base) {
    state.number = number || DEFAULT_NUMBER;
    state.base = base || "";
    form.reset();
    var t = todayStr();
    form.checkin.min = t;
    form.checkout.min = t;
    // close the package "View Details" dialog if it happens to be open
    var pd = document.getElementById("packageDialog");
    if (pd && pd.open && typeof pd.close === "function") pd.close();
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "");
    window.setTimeout(function () { try { form.name.focus(); } catch (e) {} }, 40);
  }
  function closeModal() {
    if (dlg.open) { try { dlg.close(); } catch (e) { dlg.removeAttribute("open"); } }
    else dlg.removeAttribute("open");
  }

  /* backdrop / close button */
  dlg.addEventListener("click", function (e) {
    if (e.target === dlg || (e.target.closest && e.target.closest("[data-close]"))) closeModal();
  });

  /* keep checkout on/after check-in */
  form.checkin.addEventListener("change", function () {
    form.checkout.min = form.checkin.value;
    if (form.checkout.value && form.checkout.value < form.checkin.value) {
      form.checkout.value = form.checkin.value;
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (typeof form.reportValidity === "function" && !form.reportValidity()) return;
    var name = form.name.value.trim();
    var ci = form.checkin.value;
    var co = form.checkout.value;
    var ppl = form.people.value;
    var lines = [];
    lines.push(state.base ? state.base : "Hi! I'd like to enquire about a Dandeli stay.");
    lines.push("");
    lines.push("Name: " + name);
    lines.push("Check-in: " + ci);
    lines.push("Check-out: " + co);
    lines.push("Guests: " + ppl);
    var url = "https://wa.me/" + state.number + "?text=" + encodeURIComponent(lines.join("\n"));
    closeModal();
    window.open(url, "_blank", "noopener");
  });

  /* Intercept WhatsApp links anywhere on the page (tel: links untouched) */
  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    var a = e.target.closest('a[href*="wa.me/"]');
    if (!a) return;
    var href = a.getAttribute("href") || "";
    var m = href.match(/wa\.me\/(\d+)/);
    if (!m) return;
    e.preventDefault();
    var base = "";
    var qi = href.indexOf("?text=");
    if (qi !== -1) {
      try { base = decodeURIComponent(href.slice(qi + 6)); } catch (err) { base = ""; }
    }
    openModal(m[1], base);
  });
})();
