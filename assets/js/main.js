/* Pink Flamingo Buzz — interactions. No dependencies. */
(function () {
  "use strict";
  var CFG = window.PFB_CONFIG || { reels: [], founders: [], contact: {}, liveStats: {} };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };
  var IG_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor"/></svg>';
  var EXT_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  document.documentElement.classList.remove("no-js");
  var yr = $("#year"); if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Header + mobile menu ---------- */
  var header = $(".site-header");
  var onScroll = function () { header.classList.toggle("scrolled", window.scrollY > 10); };
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  var toggle = $("#menu-toggle");
  var setMenu = function (open) {
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  toggle.addEventListener("click", function () { setMenu(!document.body.classList.contains("menu-open")); });
  document.querySelectorAll(".nav a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------- Reveal on scroll ---------- */
  var revealIO = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); revealIO.unobserve(en.target); } });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }) : null;
  var observeReveal = function (el) { if (revealIO) revealIO.observe(el); else el.classList.add("in"); };
  document.querySelectorAll(".reveal").forEach(function (el, i) {
    el.style.transitionDelay = (i % 4) * 70 + "ms";
    observeReveal(el);
  });

  /* ---------- Count-up stats ---------- */
  var countIO = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var el = en.target, end = +el.dataset.count, t0 = performance.now(), dur = 1400;
      (function tick(t) {
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * e);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
      countIO.unobserve(el);
    });
  }, { threshold: 0.5 }) : null;
  document.querySelectorAll("[data-count]").forEach(function (el) { if (countIO) countIO.observe(el); else el.textContent = el.dataset.count; });

  /* ---------- Reels carousel (seamless infinite loop) ---------- */
  var rail = $("#reel-rail");
  var reels = (CFG.reels || []).filter(Boolean);
  var N = reels.length;
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var SETS = N > 1 ? 3 : 1; // render the list 3x: [copy][main][copy] so both sides are always filled

  var cardHTML = function (code, i, isCopy) {
    var url = "https://www.instagram.com/reel/" + encodeURIComponent(code) + "/";
    return '<li class="reel-card" data-code="' + esc(code) + '" data-i="' + i + '"' + (isCopy ? ' aria-hidden="true"' : "") + '>' +
      '<div class="reel-poster" aria-hidden="true"><span class="reel-num">' + pad(i + 1) + '</span>' +
      '<span class="rp-play"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="#fff"/></svg></span>' +
      '<span class="rp-label">Loading reel…</span></div>' +
      '<a class="reel-open" href="' + url + '" target="_blank" rel="noopener"' + (isCopy ? ' tabindex="-1"' : "") + ' aria-label="Open reel ' + (i + 1) + ' on Instagram">' + EXT_ICON + 'Instagram</a>' +
      '</li>';
  };
  var html = "";
  for (var s = 0; s < SETS; s++) html += reels.map(function (code, i) { return cardHTML(code, i, SETS === 3 && s !== 1); }).join("");
  rail.innerHTML = html;
  var cards = Array.prototype.slice.call(rail.children);

  // Lazy-load the official Instagram embed for a card (and its copies, so the
  // invisible jump at the loop seam never shows an unloaded card).
  var loadOne = function (card) {
    if (!card || card.dataset.loaded) return;
    card.dataset.loaded = "1";
    var f = document.createElement("iframe");
    f.src = "https://www.instagram.com/reel/" + encodeURIComponent(card.dataset.code) + "/embed/";
    f.title = "Client reel " + (+card.dataset.i + 1);
    f.setAttribute("scrolling", "no");
    f.setAttribute("allowtransparency", "true");
    f.setAttribute("allow", "autoplay; encrypted-media; picture-in-picture; clipboard-write");
    f.setAttribute("loading", "lazy");
    if (card.getAttribute("aria-hidden")) f.tabIndex = -1;
    f.addEventListener("load", function () { card.classList.add("loaded"); });
    card.insertBefore(f, card.querySelector(".reel-open"));
  };
  var loadReel = function (card) {
    var k = cards.indexOf(card);
    loadOne(card);
    if (SETS === 3) { loadOne(cards[(k + N) % (3 * N)]); loadOne(cards[(k + 2 * N) % (3 * N)]); }
  };
  if ("IntersectionObserver" in window) {
    var reelIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { loadReel(en.target); reelIO.unobserve(en.target); } });
    }, { root: rail, rootMargin: "0px 700px 0px 700px" });
    var sectionIO = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { cards.forEach(function (c) { reelIO.observe(c); }); sectionIO.disconnect(); }
    }, { rootMargin: "600px 0px" });
    sectionIO.observe(rail);
  } else {
    cards.forEach(loadOne);
  }

  var prev = $("#reel-prev"), next = $("#reel-next"), counter = $("#reel-counter"), bar = $("#reel-progress"), pauseBtn = $("#reel-pause");
  var step = function () { return cards.length > 1 ? cards[1].getBoundingClientRect().left - cards[0].getBoundingClientRect().left : rail.clientWidth; };
  var base = function () { return cards[0].getBoundingClientRect().left - rail.getBoundingClientRect().left + rail.scrollLeft - (parseFloat(getComputedStyle(rail).paddingLeft) || 0); };
  var xOf = function (k) { return base() + k * step(); };
  var pos = function () { return Math.round((rail.scrollLeft - base()) / step()); };   // index of left-most card
  var jumping = false;
  var setPos = function (k) {
    jumping = true; rail.style.scrollSnapType = "none";
    rail.scrollTo({ left: xOf(k), behavior: "instant" });   // also cancels any running smooth scroll
    requestAnimationFrame(function () { requestAnimationFrame(function () { rail.style.scrollSnapType = ""; jumping = false; }); });
  };
  // Keep the view inside the middle copy; jumping by exactly N cards is invisible.
  var normalize = function () {
    if (SETS !== 3) return;
    var k = pos();
    if (k >= 2 * N) setPos(k - N);
    else if (k < N) setPos(k + N);
  };
  var goTo = function (k) {
    if (SETS === 3) {
      // if the target would run past the copies, recentre first (invisible), then animate
      var cur = pos();
      if (k >= 3 * N - 4 || k < 1) { var shift = k >= cur ? -N : N; setPos(cur + shift); k += shift; }
    }
    rail.scrollTo({ left: xOf(k), behavior: "smooth" });
  };
  var updateRail = function () {
    var i = ((pos() % N) + N) % N;
    counter.textContent = pad(i + 1) + " / " + pad(N);
    bar.style.width = ((i + 1) / N * 100) + "%";
  };
  var settle;
  rail.addEventListener("scroll", function () {
    requestAnimationFrame(updateRail);
    if (jumping) return;
    clearTimeout(settle); settle = setTimeout(normalize, 160);
  }, { passive: true });
  prev.addEventListener("click", function () { goTo(pos() - 1); kick(); });
  next.addEventListener("click", function () { goTo(pos() + 1); kick(); });
  window.addEventListener("resize", function () { setPos(pos()); });

  // Auto-scroll forward forever; pause on hover/touch, when a reel is being
  // watched, when the pause button is pressed, or when the section is off-screen.
  var AUTO_MS = 3500, timer = null, hold = false, userPaused = false, inView = false;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var tick = function () { if (!hold && !userPaused && inView && !document.hidden) goTo(pos() + 1); };
  var stop = function () { if (timer) clearInterval(timer); timer = null; };
  var start = function () { stop(); if (!reduce) timer = setInterval(tick, AUTO_MS); };
  var kick = function () { if (!userPaused) start(); };
  var syncPause = function () {
    pauseBtn.setAttribute("aria-pressed", String(userPaused));
    pauseBtn.setAttribute("aria-label", userPaused ? "Resume auto-scroll" : "Pause auto-scroll");
  };
  rail.addEventListener("mouseenter", function () { hold = true; });
  rail.addEventListener("mouseleave", function () { hold = false; });
  rail.addEventListener("touchstart", function () { hold = true; }, { passive: true });
  rail.addEventListener("touchend", function () { setTimeout(function () { hold = false; kick(); }, 4000); }, { passive: true });
  window.addEventListener("blur", function () { var a = document.activeElement; if (a && a.tagName === "IFRAME" && rail.contains(a)) { userPaused = true; syncPause(); } });
  pauseBtn.addEventListener("click", function () { userPaused = !userPaused; syncPause(); if (!userPaused) start(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (en) { inView = en[0].isIntersecting; }, { threshold: 0.35 }).observe(rail);
  } else { inView = true; }
  if (reduce) { userPaused = true; syncPause(); }
  requestAnimationFrame(function () { setPos(SETS === 3 ? N : 0); updateRail(); start(); });

  // Keyboard + mouse drag (touch uses native swipe)
  rail.tabIndex = 0;
  rail.setAttribute("role", "region");
  rail.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); next.click(); }
    if (e.key === "ArrowLeft") { e.preventDefault(); prev.click(); }
  });
  var drag = null;
  rail.addEventListener("pointerdown", function (e) {
    if (e.pointerType !== "mouse" || e.button !== 0 || e.target.closest("a")) return;
    drag = { x: e.clientX, left: rail.scrollLeft, moved: false };
  });
  window.addEventListener("pointermove", function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 5) { drag.moved = true; rail.classList.add("dragging"); }
    if (drag.moved) rail.scrollLeft = drag.left - dx;
  });
  window.addEventListener("pointerup", function () {
    if (!drag) return;
    var moved = drag.moved; drag = null;
    if (moved) { rail.classList.remove("dragging"); goTo(pos()); kick(); }
  });

  /* ---------- Founders ---------- */
  var grid = $("#founder-grid"), note = $("#founder-note");
  var fmt = function (n) {
    if (n == null || n === "" || isNaN(+n)) return null;
    n = +n;
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
    if (n >= 1e4) return (n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace(/\.0$/, "") + "K";
    return n.toLocaleString("en-IN");
  };
  var initials = function (name) { return (name || "?").split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase(); };

  var renderFounder = function (f, i) {
    var stats = [["Followers", fmt(f.followers)], ["Posts", fmt(f.posts)], ["Following", fmt(f.following)]].filter(function (s) { return s[1]; });
    var avatar = f.photo
      ? '<img src="' + esc(f.photo) + '" alt="' + esc(f.name) + '" loading="lazy" referrerpolicy="no-referrer" onerror="this.outerHTML=\'<span class=&quot;f-initials&quot;>' + esc(initials(f.name)) + '</span>\'">'
      : '<span class="f-initials" aria-hidden="true">' + esc(initials(f.name)) + '</span>';
    var url = "https://www.instagram.com/" + encodeURIComponent(f.handle) + "/";
    return '<article class="founder-card reveal' + (f._live ? " is-live" : "") + '" data-i="' + i + '">' +
      '<div class="f-avatar">' + avatar + '<span class="f-live" title="Live from Instagram"></span></div>' +
      '<div><h3 class="f-name">' + esc(f.name) + '</h3><p class="f-role">' + esc(f.role || "Co-founder") + '</p></div>' +
      '<a class="f-handle" href="' + url + '" target="_blank" rel="noopener">' + IG_ICON + '@' + esc(f.handle) + '</a>' +
      (f.bio ? '<p class="f-bio">' + esc(f.bio) + '</p>' : "") +
      (stats.length ? '<div class="f-stats">' + stats.map(function (s) { return '<div><b>' + s[1] + '</b><span>' + s[0] + '</span></div>'; }).join("") + '</div>' : "") +
      '<div class="f-actions">' +
        '<button class="btn btn-ghost" data-preview="' + esc(f.handle) + '">See live stats</button>' +
        '<a class="btn btn-primary" href="' + url + '" target="_blank" rel="noopener">Follow ' + IG_ICON + '</a>' +
      '</div></article>';
  };

  var founders = (CFG.founders || []).map(function (f) { return Object.assign({}, f); });
  var drawFounders = function () {
    grid.innerHTML = founders.map(renderFounder).join("");
    grid.querySelectorAll(".reveal").forEach(observeReveal);
  };
  drawFounders();

  // Live stats from your own serverless endpoint (Instagram Graph API). Refreshes every page load.
  var ep = CFG.liveStats && CFG.liveStats.endpoint;
  if (ep) {
    Promise.all(founders.map(function (f) {
      return fetch(ep + (ep.indexOf("?") > -1 ? "&" : "?") + "username=" + encodeURIComponent(f.handle), { cache: "no-store" })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) {
          if (d.followers_count != null) f.followers = d.followers_count;
          if (d.media_count != null) f.posts = d.media_count;
          if (d.follows_count != null) f.following = d.follows_count;
          if (d.profile_picture_url) f.photo = d.profile_picture_url;
          f._live = true;
        }).catch(function () { /* keep config fallback */ });
    })).then(function () {
      drawFounders();
      if (founders.some(function (f) { return f._live; })) note.textContent = "Follower counts update live from Instagram.";
    });
  }

  // "See live stats" opens Instagram's own profile embed in a modal.
  var modal = $("#profile-modal"), mBody = $("#modal-body"), mTitle = $("#modal-title");
  grid.addEventListener("click", function (e) {
    var b = e.target.closest("[data-preview]"); if (!b) return;
    var h = b.getAttribute("data-preview");
    mTitle.textContent = "@" + h;
    mBody.innerHTML = '<iframe src="https://www.instagram.com/' + encodeURIComponent(h) + '/embed/" title="Instagram profile @' + esc(h) + '" loading="lazy" allowtransparency="true"></iframe>';
    if (modal.showModal) modal.showModal(); else window.open("https://www.instagram.com/" + h + "/", "_blank", "noopener");
  });
  var closeModal = function () { modal.close(); mBody.innerHTML = ""; };
  $("#modal-close").addEventListener("click", closeModal);
  modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
  modal.addEventListener("cancel", function () { mBody.innerHTML = ""; });

  /* ---------- Contact ---------- */
  var c = CFG.contact || {};
  var links = [];
  if (c.email) links.push('<li><a href="mailto:' + esc(c.email) + '"><i><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 7l8 6 8-6" fill="none" stroke="currentColor" stroke-width="2"/></svg></i>' + esc(c.email) + '</a></li>');
  if (c.phone) links.push('<li><a href="tel:' + esc(c.phone.replace(/\s+/g, "")) + '"><i><svg viewBox="0 0 24 24"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></i>' + esc(c.phone) + '</a></li>');
  if (c.instagram) links.push('<li><a href="https://www.instagram.com/' + encodeURIComponent(c.instagram) + '/" target="_blank" rel="noopener"><i>' + IG_ICON + '</i>@' + esc(c.instagram) + '</a></li>');
  if (c.city) links.push('<li><span><i><svg viewBox="0 0 24 24"><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="2.5" fill="currentColor"/></svg></i>' + esc(c.city) + '</span></li>');
  $("#contact-links").innerHTML = links.join("");

  // Contact form: delivered to CFG.contact.email via FormSubmit (free, no backend).
  // The very first submission makes FormSubmit email an activation link to that
  // inbox; after it is clicked once, every enquiry arrives as an email.
  var form = $("#contact-form"), msg = $("#form-msg"), sendBtn = form.querySelector('button[type="submit"]');
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.name.value.trim(), email = form.email.value.trim();
    var bad = false;
    [[form.name, !!name], [form.email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)]].forEach(function (p) {
      p[0].setAttribute("aria-invalid", String(!p[1])); if (!p[1]) bad = true;
    });
    if (bad) { msg.className = "form-msg err"; msg.textContent = "Please add your name and a valid email."; return; }
    if (form._honey && form._honey.value) return; // bot trap
    var needs = Array.prototype.map.call(form.querySelectorAll('input[name="need"]:checked'), function (i) { return i.value; });
    var data = {
      Name: name, Brand: form.brand.value.trim() || "-", Email: email,
      "Interested in": needs.join(", ") || "-", Message: form.message.value.trim() || "-",
      _replyto: email, _subject: "New website enquiry from " + name, _template: "table", _captcha: "false"
    };
    sendBtn.disabled = true; sendBtn.textContent = "Sending…";
    msg.className = "form-msg"; msg.textContent = "";
    fetch("https://formsubmit.co/ajax/" + encodeURIComponent(c.email), {
      method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data)
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || String(j.success) === "false") throw new Error(j.message || r.status); }); })
      .then(function () { form.reset(); msg.className = "form-msg ok"; msg.textContent = "Thanks " + name + "! We've got your enquiry and will be in touch soon."; })
      .catch(function () {
        msg.className = "form-msg err";
        msg.innerHTML = 'Couldn\'t send right now. Please email us at <a href="mailto:' + esc(c.email) + '">' + esc(c.email) + "</a>.";
      })
      .then(function () { sendBtn.disabled = false; sendBtn.textContent = "Send enquiry"; });
  });
})();
