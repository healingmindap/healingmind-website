/* ============================================================
   Healing Mind — page builder.
   ⚠️ You normally never need to edit this file.
   All text lives in the  content/  folder.
   All images live in the  images/  folder.
   ============================================================ */

function waLink(msg) {
  return "https://wa.me/" + BASIC.whatsapp + "?text=" + encodeURIComponent(msg);
}
/* ---------- Appointment store (DEMO: saved in this browser only) ---------- */
const HMStore = {
  KEY: "hm_appointments",
  all() { try { return JSON.parse(localStorage.getItem(this.KEY) || "[]"); } catch (e) { return []; } },
  save(list) { try { localStorage.setItem(this.KEY, JSON.stringify(list)); } catch (e) {} },
  add(a) { const list = this.all(); a.id = a.id || Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    a.created = a.created || new Date().toISOString(); list.push(a); this.save(list); return a; },
  get(id) { return this.all().find(a => a.id === id); },
  update(id, patch) { this.save(this.all().map(a => a.id === id ? Object.assign({}, a, patch) : a)); },
  remove(id) { this.save(this.all().filter(a => a.id !== id)); },
  clear() { try { localStorage.removeItem(this.KEY); } catch (e) {} }
};

/* ---------- Live data (Google Sheet) ---------- */
const HMApi = {
  on() { return typeof BASIC !== "undefined" && /^https:\/\/script\.google(usercontent)?\.com\//.test(BASIC.liveDataUrl || ""); },
  async post(body) {
    const r = await fetch(BASIC.liveDataUrl, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) });
    return r.json();
  },
  async openings() {
    const r = await fetch(BASIC.liveDataUrl + (BASIC.liveDataUrl.includes("?") ? "&" : "?") + "action=openings");
    const j = await r.json(); return j.ok ? j.openings : [];
  }
};

const ICON_IG = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.8.2 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.8-.2-2.2-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4C8.4 2.2 8.8 2.2 12 2.2zm0 4.9a4.9 4.9 0 1 0 0 9.8 4.9 4.9 0 0 0 0-9.8zm0 8.1a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zm5.1-9.4a1.1 1.1 0 1 0 0 2.3 1.1 1.1 0 0 0 0-2.3z"/></svg>`;
const ICON_YT = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1c.4-1.6.5-3.2.5-4.8s-.1-3.2-.5-4.8zM9.8 15.1V8.9l5.8 3.1-5.8 3.1z"/></svg>`;

/* "Watch & follow" section: latest YouTube videos (auto-updating) + Instagram card */
function socialSection(title, sub) {
  if (!BASIC.youtube && !BASIC.instagram) return "";
  const uploads = BASIC.youtubeChannelId ? "UU" + BASIC.youtubeChannelId.slice(2) : "";
  return `
  <section class="social-sec"><div class="container">
    <h2 class="section-title">${title}</h2>
    <p class="section-sub">${sub}</p>
    <div class="social-grid">
      ${uploads ? `<div class="yt-card">
        <div class="yt-frame"><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/videoseries?list=${uploads}" title="Latest videos from ${BASIC.siteName} on YouTube" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>
        <div class="yt-foot"><span>${ICON_YT} <b>${BASIC.youtubeHandle || "YouTube"}</b> · our latest videos</span>
          <a class="btn btn-sm" href="${BASIC.youtube}?sub_confirmation=1" target="_blank" rel="noopener">Subscribe</a></div>
      </div>` : ""}
      <div class="ig-card">
        <div class="ig-top"><img src="images/logo.png" alt=""><div><b>${BASIC.instagramHandle || "Instagram"}</b><small>Healing Mind · Mental wellness</small></div></div>
        <p>Daily tips on stress, anxiety, relationships and self-care — plus updates on our workshops and events.</p>
        <div class="ig-tiles"><span>🧘 Calm</span><span>💬 Talk</span><span>🌱 Grow</span><span>💚 Heal</span></div>
        <a class="btn ig-btn" href="${BASIC.instagram}" target="_blank" rel="noopener">${ICON_IG} Follow on Instagram</a>
        ${BASIC.youtube ? `<a class="btn btn-outline yt-btn2" href="${BASIC.youtube}" target="_blank" rel="noopener">${ICON_YT} Visit YouTube channel</a>` : ""}
      </div>
    </div>
  </div></section>`;
}

function qs(k) {
  return new URLSearchParams(location.search).get(k) || new URLSearchParams(location.hash.split("?")[1] || "").get(k);
}
function telLink(p) { return "tel:" + p.replace(/[^+\d]/g, ""); }
/* Google Maps links for a branch: exact place link if given, else an address search */
function mapsUrl(b) { return b.mapLink || "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(b.mapSearch || b.address); }
function directionsUrl(b) { return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(b.mapSearch || b.address); }

/* ---------- Shared: top bar, header, footer, floating buttons ---------- */
function sharedHTML() {
  const hasGallery = typeof GALLERY !== "undefined" && GALLERY.length > 0;
  document.getElementById("topbar").innerHTML = `
  <div class="topbar"><div class="container">
    <span class="tb-hours">🕐 ${BASIC.hours}</span>
    <span class="tb-links">
      <a href="${telLink(BASIC.phone1)}">📞 ${BASIC.phone1}</a>
      <a class="tb-wa" href="${waLink('Hello!')}" target="_blank" rel="noopener">💬 WhatsApp</a>
      <a class="tb-mail" href="mailto:${BASIC.email}">✉️ ${BASIC.email}</a>
      <a class="tb-staff" href="staff.html">🔐 Staff Login</a>
    </span>
  </div></div>`;

  document.getElementById("header").innerHTML = `
  <div class="nav-wrap">
    <a class="brand" href="index.html">
      <img src="images/logo.png" alt="${BASIC.siteName} ${BASIC.siteTagline} logo">
    </a>
    <button class="nav-toggle" onclick="document.querySelector('.main-nav').classList.toggle('open')" aria-label="Menu">☰</button>
    <nav class="main-nav"><ul>
      <li><a href="index.html">Home</a></li>
      <li class="has-sub"><a href="about.html">About <span class="caret">▾</span></a>
        <ul class="sub">
          <li><a href="about.html">About Us</a></li>
          <li><a href="team.html">Our Team</a></li>
          ${hasGallery ? '<li><a href="gallery.html">Gallery</a></li>' : ""}
          <li><a href="careers.html">Careers</a></li>
        </ul>
      </li>
      <li class="has-sub"><a href="services.html">Services <span class="caret">▾</span></a>
        <ul class="sub">
          <li><a href="services.html">Our Services</a></li>
          <li><a href="services.html?sec=conditions">Conditions We Treat</a></li>
          <li><a href="services.html?sec=therapies">Therapies We Offer</a></li>
        </ul>
      </li>
      <li><a href="selfhelp.html">Self-Help</a></li>
      <li><a href="workshops.html">Workshops</a></li>
      <li><a href="contact.html">Contact</a></li>
      <li><a href="staff.html" class="nav-login">🔐 Login</a></li>
      <li><a class="btn" href="appointment.html">Book Appointment</a></li>
    </ul></nav>
  </div>`;

  const branchLines = BRANCHES.map(b => `<li>📍 <a href="${mapsUrl(b)}" target="_blank" rel="noopener" title="Open in Google Maps">${b.name}: ${b.address}</a></li>`).join("");
  document.getElementById("footer").innerHTML = `
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-logo"><img src="images/logo.png" alt="${BASIC.siteName} logo"></div>
        <p>${BASIC.footerText}</p>
      </div>
      <div class="ft-col-links"><h4>Quick Links</h4><ul>
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About Us</a></li>
        <li><a href="team.html">Our Team</a></li>
        <li><a href="services.html">Services</a></li>
        <li><a href="selfhelp.html">Self-Help Corner</a></li>
        <li><a href="workshops.html">Workshops & Seminars</a></li>
        ${hasGallery ? '<li><a href="gallery.html">Gallery</a></li>' : ""}
        <li><a href="careers.html">Careers</a></li>
        <li><a href="appointment.html">Book Appointment</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="policy.html">Our Policies</a></li>
      </ul></div>
      <div class="ft-col-links"><h4>Services</h4><ul>
        ${SERVICES.slice(0, 6).map(s => `<li><a href="services.html">${s.name}</a></li>`).join("")}
        <li><a href="services.html?sec=conditions">Conditions We Treat</a></li>
        <li><a href="services.html?sec=therapies">Therapies We Offer</a></li>
      </ul></div>
      <div><h4>Contact</h4><ul>
        ${branchLines}
        <li>📞 <a href="${telLink(BASIC.phone1)}">${BASIC.phone1}</a> / <a href="${telLink(BASIC.phone2)}">${BASIC.phone2}</a></li>
        <li>✉️ <a href="mailto:${BASIC.email}">${BASIC.email}</a></li>
        <li class="ft-social">
          <a href="${BASIC.instagram}" target="_blank" rel="noopener" aria-label="Instagram">${ICON_IG} Instagram</a>
          <a href="${BASIC.youtube}" target="_blank" rel="noopener" aria-label="YouTube">${ICON_YT} YouTube</a>
        </li>
      </ul></div>
    </div>
    <div class="footer-mini-links">
      <a href="index.html">Home</a><a href="about.html">About</a><a href="team.html">Team</a><a href="services.html">Services</a><a href="selfhelp.html">Self-Help</a>
      <a href="workshops.html">Workshops</a>${hasGallery ? '<a href="gallery.html">Gallery</a>' : ""}<a href="careers.html">Careers</a>
      <a href="contact.html">Contact</a><a href="policy.html">Policies</a>
    </div>
  </div>
  <div class="footer-bottom"><a class="staff-link" href="staff.html">🔐 Staff Login</a> · © ${new Date().getFullYear()} ${BASIC.siteName} ${BASIC.siteTagline.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())}, Pune. All rights reserved.</div>`;

  document.getElementById("floats").innerHTML = `
  <a class="float-btn float-wa" href="${waLink('Hello, I would like to book a counselling session.')}" target="_blank" rel="noopener" aria-label="WhatsApp">💬</a>
  <a class="float-btn float-call" href="${telLink(BASIC.phone1)}" aria-label="Call">📞</a>
  <nav class="action-bar" aria-label="Quick actions">
    <a href="${telLink(BASIC.phone1)}"><span>📞</span>Call</a>
    <a href="${waLink('Hello, I would like to book a counselling session.')}" target="_blank" rel="noopener"><span>💬</span>WhatsApp</a>
    <a class="ab-book" href="appointment.html"><span>📅</span>Book Now</a>
  </nav>`;
  // round buttons appear only after the visitor scrolls past the first screen
  const toggleFloats = () => document.body.classList.toggle("scrolled", document.body.dataset.page !== "home" || window.scrollY > window.innerHeight * 0.6);
  window.addEventListener("scroll", toggleFloats, { passive: true }); toggleFloats();

  // highlight active menu link
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".main-nav a").forEach(a => {
    if (a.getAttribute("href") === page && !a.closest(".sub")) a.classList.add("active");
    if (a.getAttribute("href") === page && a.closest(".sub")) {
      a.classList.add("current");
      a.closest(".has-sub").querySelector(":scope > a").classList.add("active");
    }
  });
}

/* ---------- Images ----------
   photo("name.jpg") makes an <img> from the images folder.
   If name.jpg is missing it also tries .jpeg / .png / .webp,
   and if nothing exists the image quietly disappears.        */
function photo(file, cls, alt) {
  if (!file) return "";
  return `<img src="images/${encodeURI(file)}" class="${cls || ""}" alt="${alt || ""}" loading="lazy" data-try="0" onerror="photoFallback(this)" onload="photoLoaded(this)">`;
}
function photoFallback(el) {
  const exts = [".jpg", ".jpeg", ".png", ".webp", ".JPG", ".PNG"];
  const base = el.getAttribute("src").replace(/\.[^.\/]+$/, "");  // works with encoded names too
  const n = +el.dataset.try;
  if (n < exts.length) { el.dataset.try = n + 1; el.src = base + exts[n]; return; }
  const holder = el.closest("[data-photo-holder]");
  if (holder) holder.classList.remove("has-photo");
  if (el.dataset.empty === "hide-parent" && el.parentElement) el.parentElement.remove();
  else el.remove();
}
function photoLoaded(el) {
  const holder = el.closest("[data-photo-holder]");
  if (holder) holder.classList.add("has-photo");
}

/* ---------- Building blocks ---------- */
const cardMedia = (img, icon, alt) => `
  <div class="card-media"><span class="cm-icon">${icon || "🌿"}</span>${img ? photo(img, "cm-img", alt) : ""}</div>`;

const serviceCard = s => `
  <div class="card svc-card">${cardMedia(s.image, s.icon, s.name)}<h3>${s.name}</h3><p>${s.text}</p>
  <a class="btn btn-sm" href="appointment.html?service=${encodeURIComponent(s.name)}">📅 Book Appointment</a></div>`;

const miniCard = it => `
  <div class="mini-card${it.icon !== undefined ? " has-media" : ""}">${it.icon !== undefined ? cardMedia(it.image, it.icon, it.name) : ""}<h4>${it.name}</h4><p>${it.text}</p>
  <a class="mini-book" href="appointment.html?concern=${encodeURIComponent(it.name)}">📅 Book Appointment</a></div>`;

const teamCard = (m, withBio) => m.placeholder ? `
  <div class="team-card team-placeholder">
    <div class="tc-photo tc-empty">🌱</div>
    <h3>${m.name}</h3>
    <div class="tc-role">${m.role}</div>
    <p>${m.text || ""}</p>
    <a class="card-link" href="careers.html">Want to join us? →</a>
  </div>` : `
  <div class="team-card">
    <div class="tc-photo">${photo(m.image, "", m.name)}</div>
    <h3>${m.name}</h3>
    <div class="tc-role">${m.role}</div>
    ${m.qualifications ? `<div class="tc-qual">🎓 ${m.qualifications}</div>` : ""}
    ${(m.specialities || []).length ? `<div class="chips">${m.specialities.map(s => `<span>${s}</span>`).join("")}</div>` : ""}
    ${withBio && m.bio ? `<p class="tc-bio">${m.bio}</p>` : ""}
    <ul class="tc-meta">
      ${m.mode ? `<li>${m.onlineOnly ? "💻" : "📍"} ${m.mode}</li>` : ""}
      ${m.languages ? `<li>🗣️ ${m.languages}</li>` : ""}
    </ul>
    <a class="btn" href="appointment.html?doctor=${encodeURIComponent(m.bookAs || m.name.split(" ")[0])}">📅 Book with ${m.bookAs || m.name.split(" ")[0]}</a>
  </div>`;

const psychologistsGrid = withBio => `
  <div class="grid team-grid">${TEAM.members.filter(m => !m.placeholder).map(m => teamCard(m, withBio)).join("")}</div>`;

const ctaBand = (title, text) => `
  <section style="padding-top:0"><div class="container"><div class="cta-band">
    <h2>${title}</h2><p>${text}</p>
    <a class="btn" href="appointment.html">📅 Book an Appointment</a>
  </div></div></section>`;

/* ---------- Pages ---------- */
const PAGES = {

  home: () => `
  <section class="hero">
    ${photo("hero-background.jpg", "hero-photo", "")}
    <div class="orb orb1"></div><div class="orb orb2"></div><div class="orb orb3"></div>
    <canvas id="waves"></canvas>
    <div id="particles"></div>
    <div class="hero-inner">
      <div class="hero-text">
        <div class="tagline">${HOME.heroTagline}</div>
        <h1>${HOME.heroLine1}<br><em>${HOME.heroLine2}</em></h1>
        <p class="lead">${HOME.heroText}</p>
        <div class="hero-btns">
          <a class="btn" href="appointment.html">📅 Book an Appointment</a>
          <a class="btn btn-wa" href="${waLink('Hello, I would like to enquire about a counselling session.')}" target="_blank" rel="noopener">💬 WhatsApp Us</a>
          <a class="btn btn-outline" href="${telLink(BASIC.phone1)}">📞 Call Now</a>
        </div>
        <div class="trust-line">${HOME.trustLine.split("·").map(s => `<span class="trust-item">${s.trim()}</span>`).join("")}</div>
      </div>
      <div class="hero-visual">
        <div id="calm-words"></div>
        <div class="hero-portrait hero-emblem" aria-hidden="true">
          <svg viewBox="0 0 200 200" class="lotus">
            <defs>
              <linearGradient id="pA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3e3a6"/><stop offset="1" stop-color="#8aa797"/></linearGradient>
              <linearGradient id="pB" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3f6eb"/><stop offset="1" stop-color="#688876"/></linearGradient>
              <linearGradient id="pC" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#a9c2b4"/></linearGradient>
              <radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f6e7b0"/><stop offset="1" stop-color="#f6e7b0" stop-opacity="0"/></radialGradient>
            </defs>
            <circle cx="100" cy="78" r="46" fill="url(#sun)"/>
            <g class="lotus-petals">
              <path d="M100 138 C70 128 40 112 30 92 C56 92 82 108 100 138Z" fill="url(#pB)" opacity=".75"/>
              <path d="M100 138 C130 128 160 112 170 92 C144 92 118 108 100 138Z" fill="url(#pB)" opacity=".75"/>
              <path d="M100 138 C78 118 60 90 62 62 C84 76 98 104 100 138Z" fill="url(#pC)" opacity=".9"/>
              <path d="M100 138 C122 118 140 90 138 62 C116 76 102 104 100 138Z" fill="url(#pC)" opacity=".9"/>
              <path d="M100 138 C84 112 82 76 100 44 C118 76 116 112 100 138Z" fill="url(#pA)"/>
            </g>
            <path d="M44 150 Q72 140 100 150 T156 150" fill="none" stroke="#8aa797" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>
            <path d="M62 162 Q81 155 100 162 T138 162" fill="none" stroke="#c9a227" stroke-width="2" stroke-linecap="round" opacity=".55"/>
          </svg>
        </div>
        <div class="hero-badge">
          <strong>Safe · Confidential · Caring</strong>
          <span>In-person in Chinchwad · Online across India</span>
        </div>
      </div>
    </div>
  </section>

  <section><div class="container">
    <h2 class="section-title">How We Can Help You</h2>
    <p class="section-sub">Evidence-based counselling and therapy, tailored to your unique needs.</p>
    <div class="grid grid-4 swipe-row">${SERVICES.map(serviceCard).join("")}</div>
    <p style="text-align:center;margin-top:34px">
      <a class="btn btn-outline" href="services.html?sec=conditions">Conditions We Treat</a> &nbsp;
      <a class="btn btn-outline" href="services.html?sec=therapies">Therapies We Offer</a>
    </p>
  </div></section>

  <section style="padding-top:0"><div class="container">
    <div class="selfhelp-band">
      <div>
        <div class="sb-kicker">Free · Private · Anytime</div>
        <h2>Can't start therapy right now?</h2>
        <p>You can still take care of your mind today. Try our free self-check, a guided breathing exercise and simple daily practices.</p>
        <a class="btn" href="selfhelp.html">🌿 Visit the Self-Help Corner</a>
      </div>
      <ul class="sb-list">
        <li><span>📝</span><b>Mood & anxiety self-check</b><small>2-minute questionnaires</small></li>
        <li><span>🫁</span><b>Guided breathing</b><small>Calm your body in 1 minute</small></li>
        <li><span>🌱</span><b>Daily calm practices</b><small>Small steps that help</small></li>
        <li><span>📞</span><b>Free 24×7 helpline</b><small>Tele-MANAS 14416</small></li>
      </ul>
    </div>
  </div></section>

  <section class="breath-section">
    <div id="fireflies"></div>
    <div class="container" style="text-align:center;position:relative">
      <h2 class="section-title">Pause. Breathe. Begin.</h2>
      <p class="section-sub">Your journey to peace of mind can start right here — take one calm breath with us.</p>
      <div class="breath-wrap">
        ${[0,45,90,135,180,225,270,315].map(r => `<div class="petal" style="--rot:${r}deg"></div>`).join("")}
        <div class="breath-circle"><span id="breath-text">Breathe in…</span></div>
      </div>
      <div class="breath-hint">🧘 Follow the circle — in for 4, hold for 2, out for 4</div>
    </div>
  </section>

  <section class="stats"><div class="container grid grid-4 grid-2x2">
    ${HOME.stats.map(s => `<div><div class="num">${s.number}</div><div class="label">${s.label}</div></div>`).join("")}
  </div></section>

  <section><div class="container">
    <h2 class="section-title">How It Works</h2>
    <p class="section-sub">Taking the first step is simple — and completely confidential.</p>
    <div class="grid grid-4 grid-2x2">
      ${HOME.steps.map((s, i) => `<div class="step"><div class="circle">${i + 1}</div><h3>${s.title}</h3><p>${s.text}</p></div>`).join("")}
    </div>
  </div></section>

  <section style="background:var(--mint)"><div class="container">
    <h2 class="section-title">Meet Our Psychologists</h2>
    <p class="section-sub">Professional expertise with compassionate care — in person and online.</p>
    ${psychologistsGrid(true)}
    <p style="text-align:center;margin-top:30px"><a class="card-link" href="team.html">Meet the full team →</a></p>
  </div></section>

  <section><div class="container">
    <h2 class="section-title">What Our Clients Say</h2>
    <p class="section-sub">Rated by 100+ happy clients on Google.</p>
    <div class="grid grid-3 swipe-row" id="testimonial-grid">
      ${TESTIMONIALS.length ? TESTIMONIALS.map(t => `<div class="testimonial"><div class="stars">★★★★★</div><p>"${t.text}"</p><div class="who">— ${t.who}</div></div>`).join("") : `
      <div class="review-card">
        <div class="rc-g">G</div>
        <div class="rc-stars">★★★★★</div>
        <div class="rc-num">100+ reviews on Google</div>
        <p>Clients from our Chinchwad centre and online sessions share their experience on our Google profile.</p>
      </div>`}
    </div>
    <p style="text-align:center;margin-top:36px">
      <a class="btn btn-gold" href="${BASIC.googleReviewLink}" target="_blank" rel="noopener">⭐ Read all 100+ Reviews on Google</a>
      &nbsp; <a class="btn btn-outline" href="${BASIC.googleReviewLink}" target="_blank" rel="noopener">✍️ Write a Review</a>
    </p>
  </div></section>

  ${socialSection("Watch, Learn & Follow", "Short videos and everyday tips from our psychologists — free on YouTube and Instagram.")}

  ${ctaBand("Take the First Step Today", "You don't have to face it alone. Book a confidential session — in person or online.")}`,

  about: () => `
  <section class="page-hero"><h1>About Us</h1><p>Who we are and what we stand for</p></section>

  <section><div class="container grid grid-2">
    <div class="card"><div class="icon">🎯</div><h3>Our Mission</h3><p>${ABOUT.mission}</p></div>
    <div class="card"><div class="icon">🌱</div><h3>Our Vision</h3><p>${ABOUT.vision}</p></div>
  </div></section>

  <section style="padding-top:0"><div class="container"><div class="card about-split" data-photo-holder>
    ${ABOUT.centreImage ? `<div class="about-photo-wrap">${photo(ABOUT.centreImage, "about-photo", "Healing Mind Counselling Centre").replace('data-try="0"', 'data-try="0" data-empty="hide-parent"')}</div>` : ""}
    <div>
      <h3>About the Centre</h3>
      <p>${ABOUT.description1}</p>
      <p style="margin-top:12px">${ABOUT.description2}</p>
      <p style="margin-top:12px"><strong>Languages:</strong> ${ABOUT.languages} &nbsp;|&nbsp; <strong>Modes:</strong> ${ABOUT.modes}</p>
    </div>
  </div></div></section>

  <section style="background:var(--mint)"><div class="container">
    <h2 class="section-title">Our Psychologists</h2>
    <p class="section-sub">Meet the people who will walk with you on your journey.</p>
    ${psychologistsGrid(true)}
  </div></section>

  <section><div class="container">
    <h2 class="section-title">Why Choose ${BASIC.siteName}?</h2>
    <div class="grid grid-3">
      <div class="card"><div class="icon">🔒</div><h3>100% Confidential</h3><p>Everything you share stays between you and your therapist.</p></div>
      <div class="card"><div class="icon">🏢</div><h3>In-person & Online</h3><p>Visit our calm centre in Chinchwad, Pune — or join secure online sessions from anywhere in India.</p></div>
      <div class="card"><div class="icon">⭐</div><h3>Trusted by 1200+ Visitors</h3><p>6+ years of experience and 100+ five-star Google reviews.</p></div>
    </div>
  </div></section>`,

  services: () => `
  <section class="page-hero"><h1>Our Services</h1><p>Professional, confidential support — in person or online</p></section>
  <div class="svc-tabs-wrap"><div class="container svc-tabs">
    <button onclick="goSection('services')">🌿 Our Services</button>
    <button onclick="goSection('conditions')">🧠 Conditions We Treat</button>
    <button onclick="goSection('therapies')">💬 Therapies We Offer</button>
  </div></div>
  <section id="services"><div class="container">
    <div class="grid grid-4">${SERVICES.map(serviceCard).join("")}</div>
  </div></section>
  <section id="conditions" class="alt"><div class="container">
    <h2 class="section-title">Conditions We Treat</h2>
    <p class="section-sub">If you recognise yourself in any of these, you're not alone — and help is available.</p>
    <div class="mini-grid">${CONDITIONS.map(miniCard).join("")}</div>
  </div></section>
  <section id="therapies"><div class="container">
    <h2 class="section-title">Therapies We Offer</h2>
    <p class="section-sub">Proven, evidence-based approaches — your psychologist will choose what suits you best.</p>
    <div class="mini-grid">${THERAPIES.map(miniCard).join("")}</div>
  </div></section>
  ${ctaBand("Not sure which service you need?", "Message us on WhatsApp — we'll help you choose the right starting point.")}`,

  appointment: () => `
  <section class="page-hero"><h1>Book an Appointment</h1><p>Fill the form — your request is sent to us instantly on WhatsApp</p></section>

  <section><div class="container"><div class="form-card">
    ${BASIC.feesNote ? `<div class="fees-note">${BASIC.feesNote}</div>` : ""}
    <form onsubmit="return submitAppointment(event)">
      <div class="form-row">
        <div class="form-group"><label>Full Name <span class="req">*</span></label><input name="name" required placeholder="Your name"></div>
        <div class="form-group"><label>Phone / WhatsApp <span class="req">*</span></label><input name="phone" type="tel" required placeholder="+91 ..."></div>
      </div>
      <div class="form-group"><label>Email (optional)</label><input name="email" type="email" placeholder="you@example.com"></div>
      <div class="form-row">
        <div class="form-group"><label>Service <span class="req">*</span></label>
          <select name="service" required>
            ${SERVICES.map(s => `<option value="${s.name}">${s.name}</option>`).join("")}
            <option value="Not sure / Other">Not sure / Other</option>
          </select></div>
        <div class="form-group"><label>Psychologist <span class="req">*</span></label>
          <select name="doctor" required onchange="onDoctorChange(this)">
            <option value="Any available psychologist">Any available psychologist</option>
            ${TEAM.members.filter(m => !m.placeholder).map(m => `<option value="${m.name}" data-online="${m.onlineOnly ? 1 : 0}" data-short="${m.bookAs || ""}">${m.name}${m.onlineOnly ? " (online only)" : ""}</option>`).join("")}
          </select></div>
      </div>
      <div class="form-group"><label>Location <span class="req">*</span></label>
        <select name="branch" required>
          ${BRANCHES.map(b => `<option value="${b.name}">${b.name}</option>`).join("")}
          <option value="Online">Online session</option>
        </select></div>
      <div id="doctor-note" class="fees-note" style="display:none">💻 This psychologist sees clients through <b>online sessions only</b> — you'll receive a video-call link after confirmation.</div>
      <div class="form-row">
        <div class="form-group"><label>Preferred Date <span class="req">*</span></label><input name="date" type="date" required></div>
        <div class="form-group"><label>Preferred Time <span class="req">*</span></label>
          <select name="time" required>
            <option>Morning (10 am – 1 pm)</option><option>Afternoon (1 pm – 4 pm)</option><option>Evening (4 pm – 8 pm)</option>
          </select></div>
      </div>
      <div class="form-group"><label>Session Mode <span class="req">*</span></label>
        <select name="mode" required><option>In-person</option><option>Online (video call)</option><option>Phone call</option></select></div>
      <div class="form-group"><label>Remarks for your psychologist (optional)</label><textarea name="message" rows="4" placeholder="Share anything you'd like us to know before your session — what you're going through, any questions or preferences. Completely confidential."></textarea></div>
      <button class="btn btn-wa" type="submit" style="width:100%">💬 Send Booking Request on WhatsApp</button>
      <div id="form-success" style="display:none;background:var(--mint);border:1px solid var(--green-soft);border-radius:10px;padding:14px;margin-top:16px;color:var(--green-dark);font-weight:600">
        ✅ WhatsApp has opened with your request — just press <em>Send</em> there. We'll confirm your appointment shortly.
      </div>
      <p class="form-note">🔒 Your details are private. The form opens WhatsApp with your request pre-filled — nothing is stored on this website. Prefer to talk? Call <a href="${telLink(BASIC.phone1)}">${BASIC.phone1}</a>.</p>
    </form>
  </div></div></section>

  <section style="padding-top:0"><div class="container">
    <h2 class="section-title">Frequently Asked Questions</h2>
    <p class="section-sub">New to counselling? These answers may help.</p>
    ${FAQS.map(f => `<details class="faq-item"><summary>${f.q}</summary><div class="faq-body">${f.a}</div></details>`).join("")}
  </div></section>`,

  careers: () => `
  <section class="page-hero"><h1>Careers</h1><p>Grow with us — help people heal</p></section>

  <section><div class="container">
    <p class="section-sub" style="margin-bottom:40px">${CAREERS.intro}</p>
    <div id="openings-box">${openingsHTML(OPENINGS)}</div>
  </div></section>

  <section style="padding-top:0"><div class="container"><div class="form-card">
    <h3 style="margin-bottom:6px">Apply Now</h3>
    <p style="color:var(--text-soft);font-size:.93rem;margin-bottom:22px">Fill this form — your application reaches us instantly on WhatsApp. You can also email your resume to <a href="mailto:${CAREERS.applyEmail}"><strong>${CAREERS.applyEmail}</strong></a>.</p>
    <form onsubmit="return submitCareer(event)">
      <div class="form-row">
        <div class="form-group"><label>Full Name <span class="req">*</span></label><input name="name" required placeholder="Your name"></div>
        <div class="form-group"><label>Phone / WhatsApp <span class="req">*</span></label><input name="phone" type="tel" required placeholder="+91 ..."></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Position <span class="req">*</span></label>
          <select name="position" required id="position-select">${positionOptions(OPENINGS)}</select></div>
        <div class="form-group"><label>Qualification <span class="req">*</span></label><input name="qualification" required placeholder="e.g. MA Psychology"></div>
      </div>
      <div class="form-group"><label>Experience & why you'd like to join (optional)</label><textarea name="message" rows="3" placeholder="A few lines about yourself"></textarea></div>
      <button class="btn btn-wa" type="submit" style="width:100%">💬 Send Application on WhatsApp</button>
      <div id="form-success" style="display:none;background:var(--mint);border:1px solid var(--green-soft);border-radius:10px;padding:14px;margin-top:16px;color:var(--green-dark);font-weight:600">
        ✅ WhatsApp has opened with your application — press <em>Send</em> there, then email your resume to ${CAREERS.applyEmail}.
      </div>
    </form>
  </div></div></section>`,

  workshops: () => `
  <section class="page-hero"><h1>Workshops & Seminars</h1><p>For schools, colleges, corporates & communities</p></section>

  <section><div class="container">
    <p class="section-sub" style="margin-bottom:14px">${WORKSHOPS.intro}</p>
    <p style="text-align:center;color:var(--green-dark);font-weight:600;margin-bottom:44px">${WORKSHOPS.formats}</p>
    <div class="grid grid-3">
      ${WORKSHOPS.topics.map(t => `<div class="card svc-card" data-photo-holder>${photo(t.image, "card-img", t.name)}<div class="icon">${t.icon}</div><h3>${t.name}</h3><p>${t.text}</p>
        <button class="btn btn-sm" onclick="enquireTopic('${t.name.replace(/'/g, "\\'")}')">📩 Enquire / Book</button></div>`).join("")}
    </div>
  </div></section>

  <section style="padding-top:0"><div class="container"><div class="form-card">
    <h3 style="margin-bottom:6px">Workshop Enquiry</h3>
    <p style="color:var(--text-soft);font-size:.93rem;margin-bottom:22px">Tell us about your organisation and we'll get back with a plan and quote.</p>
    <form id="workshop-form" onsubmit="return submitWorkshop(event)">
      <div class="form-row">
        <div class="form-group"><label>Contact Person <span class="req">*</span></label><input name="name" required placeholder="Your name"></div>
        <div class="form-group"><label>Phone / WhatsApp <span class="req">*</span></label><input name="phone" type="tel" required placeholder="+91 ..."></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Organisation <span class="req">*</span></label><input name="org" required placeholder="School / College / Company name"></div>
        <div class="form-group"><label>Organisation Type <span class="req">*</span></label>
          <select name="orgtype" required>
            <option>School</option><option>College / University</option><option>Corporate / Office</option><option>NGO / Community group</option><option>Other</option>
          </select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Workshop Topic <span class="req">*</span></label>
          <select name="topic" required>
            ${WORKSHOPS.topics.map(t => `<option value="${t.name}">${t.name}</option>`).join("")}
            <option value="Custom topic">Custom topic (describe below)</option>
          </select></div>
        <div class="form-group"><label>Format <span class="req">*</span></label>
          <select name="format" required>
            <option>At our venue</option><option>At the centre</option><option>Online webinar</option>
          </select></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Approx. Participants <span class="req">*</span></label><input name="participants" required placeholder="e.g. 50"></div>
        <div class="form-group"><label>Preferred Date</label><input name="date" type="date"></div>
      </div>
      <div class="form-group"><label>Anything else? (optional)</label><textarea name="message" rows="3" placeholder="Age group, duration, budget, custom topic…"></textarea></div>
      <button class="btn btn-wa" type="submit" style="width:100%">💬 Send Enquiry on WhatsApp</button>
      <div id="form-success" style="display:none;background:var(--mint);border:1px solid var(--green-soft);border-radius:10px;padding:14px;margin-top:16px;color:var(--green-dark);font-weight:600">
        ✅ WhatsApp has opened with your enquiry — just press <em>Send</em> there. We'll reply with a plan shortly.
      </div>
    </form>
  </div></div></section>`,

  team: () => `
  <section class="page-hero"><h1>Our Team</h1><p>${TEAM.intro}</p></section>
  <section><div class="container">
    <div class="grid team-grid">
      ${TEAM.members.map(m => teamCard(m, true)).join("")}
    </div>
  </div></section>
  ${ctaBand("Not sure who to see?", "Tell us a little about what you're going through — we'll guide you to the right person.")}`,

  selfhelp: () => `
  <section class="page-hero"><h1>Self-Help Corner</h1><p>Free tools to understand and care for your mind — anytime, privately</p></section>

  <section style="padding:34px 0 0"><div class="container">
    <div class="helpline-strip">
      <div><b>Need to talk to someone right now?</b> Free, confidential support is available day and night.</div>
      <div class="hl-numbers">
        ${SELFHELP.helplines.map(h => `<a href="tel:${h.number}" title="${h.note}"><strong>${h.number}</strong><span>${h.name}</span></a>`).join("")}
      </div>
    </div>
  </div></section>

  <section style="padding-top:44px"><div class="container">
    <p class="section-sub" style="margin-bottom:40px">${SELFHELP.intro}</p>

    <h2 class="section-title">How have you been feeling?</h2>
    <p class="section-sub">Two short, widely used questionnaires. Your answers stay on your device — nothing is sent or saved.</p>
    <div class="quiz-card">
      <div class="quiz-tabs">
        <button class="qt active" onclick="showQuiz('phq9', this)">😔 Mood check <small>PHQ-9 · 9 questions</small></button>
        <button class="qt" onclick="showQuiz('gad7', this)">😟 Anxiety check <small>GAD-7 · 7 questions</small></button>
      </div>
      <div id="quiz-area">${renderQuiz("phq9")}</div>
    </div>
  </div></section>

  <section class="alt"><div class="container">
    <h2 class="section-title">Calm tools you can use now</h2>
    <p class="section-sub">Two simple techniques psychologists teach to settle a racing mind.</p>
    <div class="grid grid-2">
      <div class="card tool-card">
        <h3>🫁 Box breathing</h3>
        <p>Breathe in, hold, breathe out, hold — 4 seconds each. Follow the circle.</p>
        <div class="box-breath"><div class="bb-circle" id="bb-circle"><span id="bb-text">Ready?</span></div></div>
        <div class="bb-controls">
          <button class="btn" id="bb-btn" onclick="toggleBoxBreath()">▶ Start 1 minute</button>
          <span id="bb-timer"></span>
        </div>
      </div>
      <div class="card tool-card">
        <h3>🌿 5-4-3-2-1 grounding</h3>
        <p>When anxiety rises, gently bring your attention back to the present moment.</p>
        <div class="grounding" id="grounding">${groundingStep(0)}</div>
      </div>
    </div>
  </div></section>

  <section><div class="container">
    <h2 class="section-title">Small daily practices</h2>
    <p class="section-sub">Little habits that protect your mental health.</p>
    <div class="grid grid-3">
      ${SELFHELP.tips.map(tp => `<div class="card"><div class="icon">${tp.icon}</div><h3>${tp.title}</h3><p>${tp.text}</p></div>`).join("")}
    </div>
  </div></section>

  <section style="padding-top:0"><div class="container">
    <div class="seek-card">
      <h3>When is it time to talk to a professional?</h3>
      <ul>${SELFHELP.whenToSeek.map(w => `<li>${w}</li>`).join("")}</ul>
      <p>Reaching out early makes healing easier. A first conversation is confidential and there's no pressure.</p>
    </div>
    <p class="disclaimer">These self-checks are for awareness only and are not a diagnosis. Only a qualified mental health professional can assess your condition.
    PHQ-9 and GAD-7 were developed by Drs. Spitzer, Williams, Kroenke and colleagues, with an educational grant from Pfizer Inc.; no permission is required to reproduce them.</p>
  </div></section>

  ${ctaBand("Whenever you're ready, we're here", "Book a confidential session — in person in Chinchwad, or online from home.")}`,

  gallery: () => `
  <section class="page-hero"><h1>Gallery</h1><p>Moments from our centres, sessions and workshops</p></section>
  <section><div class="container">
    ${GALLERY.length ? "" : `<div class="card" style="text-align:center;max-width:620px;margin:0 auto"><div class="icon" style="margin:0 auto 14px">📷</div><h3>New photos coming soon</h3><p>We're updating our gallery with fresh photos of our centre, sessions and workshops.</p></div>`}
    <div class="gallery-grid">
      ${GALLERY.map((g, i) => `
      <figure class="gallery-item" onclick="openLightbox(this)">
        ${photo(g.image, "", g.caption).replace('data-try="0"', 'data-try="0" data-empty="hide-parent"')}
        <figcaption>${g.caption}</figcaption>
      </figure>`).join("")}
    </div>
  </div></section>
  <div id="lightbox" class="lightbox" onclick="if(event.target===this)closeLightbox()">
    <button class="lb-btn lb-close" onclick="closeLightbox()" aria-label="Close">✕</button>
    <button class="lb-btn lb-prev" onclick="stepLightbox(-1)" aria-label="Previous">‹</button>
    <img id="lb-img" alt="">
    <button class="lb-btn lb-next" onclick="stepLightbox(1)" aria-label="Next">›</button>
    <div id="lb-cap" class="lb-cap"></div>
  </div>
  ${ctaBand("Visit us in person", "Experience our calm, welcoming space — book your first session today.")}`,

  staff: () => `
  <section class="staff-wrap"><div class="container" id="staff-app"></div></section>`,

  policy: () => `
  <section class="page-hero"><h1>Our Policies</h1><p>Clear, fair and focused on your well-being</p></section>
  <section><div class="container" style="max-width:860px">
    ${POLICY.map(p => `<div class="card" style="margin-bottom:20px"><h3>${p.title}</h3><p style="margin-top:8px">${p.text}</p></div>`).join("")}
    <p style="text-align:center;color:var(--text-soft);font-size:.9rem;margin-top:30px">Questions about any policy? <a href="contact.html"><strong>Contact us</strong></a> — we're happy to explain.</p>
  </div></section>`,

  contact: () => `
  <section class="page-hero"><h1>Contact Us</h1><p>${BRANCHES.length > 1 ? BRANCHES.length + " branches in Pune" : "Our centre in Chinchwad, Pune"} — and always one message away</p></section>

  <section><div class="container ${BRANCHES.length > 1 ? "grid grid-2" : "single-branch"}">
    ${BRANCHES.map(b => `
    <div class="card branch-card" data-photo-holder>
      ${photo(b.image, "card-img", b.name)}
      <h3>📍 ${b.name}</h3>
      <p>${b.address}</p>
      <div class="contact-line">📞 <a href="${telLink(b.phone)}">${b.phone}</a></div>
      <a class="map-snap" href="${mapsUrl(b)}" target="_blank" rel="noopener" aria-label="Open ${b.name} in Google Maps">
        <iframe loading="lazy" tabindex="-1" aria-hidden="true" src="https://www.google.com/maps?q=${encodeURIComponent(b.mapSearch)}&output=embed" title="${b.name} map"></iframe>
        <span class="map-overlay">Open in Google Maps ↗</span>
      </a>
      <div class="branch-actions">
        <a class="btn" href="${directionsUrl(b)}" target="_blank" rel="noopener">🧭 Get Directions</a>
        <a class="btn btn-outline" href="${telLink(b.phone)}">📞 Call</a>
      </div>
    </div>`).join("")}
  </div></section>

  <section style="padding-top:0"><div class="container grid grid-3">
    <div class="card" style="text-align:center"><div class="icon" style="margin:0 auto 14px">📞</div><h3>Call Us</h3><p><a href="${telLink(BASIC.phone1)}">${BASIC.phone1}</a><br><a href="${telLink(BASIC.phone2)}">${BASIC.phone2}</a></p></div>
    <div class="card" style="text-align:center"><div class="icon" style="margin:0 auto 14px">💬</div><h3>WhatsApp</h3><p><a href="${waLink('Hello!')}" target="_blank" rel="noopener">Message us directly</a><br>Fastest response</p></div>
    <div class="card" style="text-align:center"><div class="icon" style="margin:0 auto 14px">✉️</div><h3>Email</h3><p><a href="mailto:${BASIC.email}">${BASIC.email}</a><br>We reply within a day</p></div>
  </div></section>

  ${socialSection("Follow Us", "Stay connected for mental-health tips, videos and workshop updates.")}

  ${ctaBand("Ready to begin?", "Book your confidential session in under a minute.")}`
};

/* ---------- Careers: openings (from content file, or live from the Google Sheet) ---------- */
function escH(t) { return String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function openingsHTML(list) {
  return list.length ? `
    <div class="grid grid-3">
      ${list.map(o => `<div class="card"><div class="icon">💼</div><h3>${escH(o.title)}</h3>
        <p style="color:var(--gold);font-weight:600;font-size:.85rem;margin-bottom:8px">${escH(o.type)}</p>
        <p>${escH(o.text).replace(/\n/g, "<br>")}</p>
        <button class="btn btn-sm" style="margin-top:12px" onclick="applyFor('${escH(o.title).replace(/'/g, "\\'")}')">Apply for this role</button></div>`).join("")}
    </div>` : `
    <div class="card" style="text-align:center;max-width:640px;margin:0 auto"><div class="icon" style="margin:0 auto 14px">🌱</div>
      <h3>No openings right now</h3><p>${CAREERS.noOpenings}</p></div>`;
}
function positionOptions(list) {
  return list.map(o => `<option value="${escH(o.title)}">${escH(o.title)}</option>`).join("") + `<option value="Other / General application">Other / General application</option>`;
}
function applyFor(title) {
  const sel = document.getElementById("position-select"); if (sel) sel.value = title;
  const f = sel && sel.form; if (f) f.scrollIntoView({ behavior: "smooth", block: "start" });
}
async function loadLiveOpenings() {
  const box = document.getElementById("openings-box"); if (!box || !HMApi.on()) return;
  try {
    const live = await HMApi.openings();
    const all = OPENINGS.concat(live || []);
    box.innerHTML = openingsHTML(all);
    const sel = document.getElementById("position-select"); if (sel) sel.innerHTML = positionOptions(all);
  } catch (e) { /* keep the content-file openings */ }
}

/* ---------- Booking form helpers ---------- */
function onDoctorChange(sel) {
  const opt = sel.options[sel.selectedIndex];
  const f = sel.form, online = opt && opt.dataset.online === "1";
  const branch = f.branch, mode = f.mode;
  [...branch.options].forEach(o => { o.disabled = online && o.value !== "Online"; });
  [...mode.options].forEach(o => { o.disabled = online && o.value === "In-person"; });
  if (online) { branch.value = "Online"; if (mode.value === "In-person") mode.value = "Online (video call)"; }
  const note = document.getElementById("doctor-note");
  if (note) note.style.display = online ? "block" : "none";
}
function goSection(id) {
  const el = document.getElementById(id); if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - 140;
  window.scrollTo({ top: y, behavior: "smooth" });
}
function enquireTopic(name) {
  const f = document.getElementById("workshop-form"); if (!f) return;
  if (f.topic) [...f.topic.options].forEach(o => { if (o.value === name) f.topic.value = name; });
  f.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- Appointment form → WhatsApp ---------- */
function submitAppointment(e) {
  e.preventDefault();
  const f = e.target, val = n => (f[n] ? f[n].value.trim() : "");
  const msg =
    "🟢 *New Appointment Request — " + BASIC.siteName + "*\n" +
    "----------------------------------\n" +
    "👤 Name: " + val("name") + "\n" +
    "📞 Phone: " + val("phone") + "\n" +
    (val("email") ? "✉️ Email: " + val("email") + "\n" : "") +
    "🧠 Service: " + val("service") + "\n" +
    "👩‍⚕️ Psychologist: " + val("doctor") + "\n" +
    "🏢 Location: " + val("branch") + "\n" +
    "💻 Mode: " + val("mode") + "\n" +
    "📅 Preferred date: " + val("date") + "\n" +
    "⏰ Preferred time: " + val("time") + "\n" +
    (val("message") ? "📝 Remarks: " + val("message") + "\n" : "") +
    "----------------------------------\nSent from the website appointment form.";
  const booking = {
    name: val("name"), phone: val("phone"), email: val("email"), service: val("service"), doctor: val("doctor"),
    branch: val("branch"), mode: val("mode"), date: val("date"), timeWindow: val("time"), time: "",
    message: val("message"), status: "Requested", source: "Website"
  };
  window.open(waLink(msg), "_blank");
  if (HMApi.on()) {
    // saved straight into the clinic's Google Sheet → shows in Staff Login on every device
    try { fetch(BASIC.liveDataUrl, { method: "POST", mode: "no-cors", keepalive: true, headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "book", data: booking }) }); } catch (err) {}
  } else {
    HMStore.add(booking);   // not connected yet: kept only in this browser
  }
  const ok = document.getElementById("form-success");
  if (ok) ok.style.display = "block";
  return false;
}

/* ---------- Live Google reviews (needs API key + Place ID in content/6-testimonials.js) ---------- */
function initLiveGoogleReviews() {
  if (typeof GOOGLE_PLACE === "undefined" || !GOOGLE_PLACE.apiKey || !GOOGLE_PLACE.placeId) return;
  const grid = document.getElementById("testimonial-grid");
  if (!grid) return;
  window.__gmapsReady = function () {
    try {
      const svc = new google.maps.places.PlacesService(document.createElement("div"));
      svc.getDetails(
        { placeId: GOOGLE_PLACE.placeId, fields: ["reviews", "rating", "user_ratings_total"] },
        (place, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !place || !place.reviews || !place.reviews.length) return;
          const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          grid.innerHTML = place.reviews.slice(0, 6).map(r => `
            <div class="testimonial">
              <div class="stars">${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}</div>
              <p>"${esc((r.text || "").length > 220 ? r.text.slice(0, 220) + "…" : (r.text || ""))}"</p>
              <div class="who">— ${esc(r.author_name)} · <span style="font-weight:400;color:var(--text-soft)">${esc(r.relative_time_description || "")} · Google</span></div>
            </div>`).join("");
          const sub = grid.closest("section").querySelector(".section-sub");
          if (sub && place.user_ratings_total) sub.textContent =
            "Live from Google — " + (place.rating || "") + "★ from " + place.user_ratings_total + " reviews.";
        });
    } catch (e) { /* keep manual reviews on any failure */ }
  };
  const s = document.createElement("script");
  s.src = "https://maps.googleapis.com/maps/api/js?key=" + encodeURIComponent(GOOGLE_PLACE.apiKey) + "&libraries=places&callback=__gmapsReady";
  s.async = true;
  s.onerror = function () { /* offline or bad key — manual reviews stay */ };
  document.head.appendChild(s);
}

/* ---------- Self-help: questionnaires (PHQ-9, GAD-7) ---------- */
const QUIZZES = {
  phq9: {
    title: "Mood check (PHQ-9)",
    ask: "Over the last 2 weeks, how often have you been bothered by any of the following problems?",
    q: [
      "Little interest or pleasure in doing things",
      "Feeling down, depressed, or hopeless",
      "Trouble falling or staying asleep, or sleeping too much",
      "Feeling tired or having little energy",
      "Poor appetite or overeating",
      "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
      "Trouble concentrating on things, such as reading the newspaper or watching television",
      "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
      "Thoughts that you would be better off dead or of hurting yourself in some way"
    ],
    bands: [
      [0, 4, "Minimal", "Your answers suggest minimal low-mood symptoms right now. Keep up the habits that help you feel well."],
      [5, 9, "Mild", "Your answers suggest mild low-mood symptoms. Self-care can help — and if it continues for a few weeks, talking to a counsellor is a good step."],
      [10, 14, "Moderate", "Your answers suggest moderate symptoms of low mood. Speaking with a psychologist could really help you feel better."],
      [15, 19, "Moderately severe", "Your answers suggest moderately severe symptoms. We'd gently encourage you to speak with a mental health professional soon."],
      [20, 27, "Severe", "Your answers suggest severe symptoms. Please reach out to a mental health professional as soon as possible — you don't have to go through this alone."]
    ]
  },
  gad7: {
    title: "Anxiety check (GAD-7)",
    ask: "Over the last 2 weeks, how often have you been bothered by the following problems?",
    q: [
      "Feeling nervous, anxious, or on edge",
      "Not being able to stop or control worrying",
      "Worrying too much about different things",
      "Trouble relaxing",
      "Being so restless that it is hard to sit still",
      "Becoming easily annoyed or irritable",
      "Feeling afraid, as if something awful might happen"
    ],
    bands: [
      [0, 4, "Minimal", "Your answers suggest minimal anxiety right now. Keep doing what helps you stay calm."],
      [5, 9, "Mild", "Your answers suggest mild anxiety. Breathing exercises and daily practices can help — and a counsellor can teach you more tools."],
      [10, 14, "Moderate", "Your answers suggest moderate anxiety. Talking with a psychologist can help you understand and manage it."],
      [15, 21, "Severe", "Your answers suggest severe anxiety. We'd encourage you to speak with a mental health professional soon — effective help is available."]
    ]
  }
};
const QOPTS = ["Not at all", "Several days", "More than half the days", "Nearly every day"];

function renderQuiz(id) {
  const Q = QUIZZES[id];
  return `
    <form class="quiz" onsubmit="return scoreQuiz(event, '${id}')">
      <p class="quiz-ask">${Q.ask}</p>
      ${Q.q.map((text, i) => `
        <fieldset class="qrow">
          <legend><span class="qn">${i + 1}</span>${text}</legend>
          <div class="qopts">
            ${QOPTS.map((o, v) => `<label><input type="radio" name="q${i}" value="${v}" required><span>${o}</span></label>`).join("")}
          </div>
        </fieldset>`).join("")}
      <button class="btn" type="submit" style="width:100%;margin-top:10px">See my result</button>
    </form>
    <div id="quiz-result"></div>`;
}
function showQuiz(id, btn) {
  document.querySelectorAll(".qt").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("quiz-area").innerHTML = renderQuiz(id);
}
function scoreQuiz(e, id) {
  e.preventDefault();
  const f = e.target, Q = QUIZZES[id];
  let score = 0;
  Q.q.forEach((_, i) => { score += +f["q" + i].value; });
  const band = Q.bands.find(b => score >= b[0] && score <= b[1]);
  const max = Q.q.length * 3;
  const urgent = id === "phq9" && +f.q8.value > 0;
  const hl = SELFHELP.helplines[0];
  const box = document.getElementById("quiz-result");
  box.innerHTML = `
    ${urgent ? `
    <div class="urgent-box">
      <h4>💚 Thank you for being honest about how you feel</h4>
      <p>You mentioned having thoughts of being better off dead or of hurting yourself. You deserve support right now — please talk to someone today.</p>
      <div class="ub-actions">
        <a class="btn" href="tel:${hl.number}">📞 Call ${hl.name.split(" (")[0]} ${hl.number} (free, 24×7)</a>
        <a class="btn btn-wa" href="${waLink("Hello, I'm not feeling okay and would like to talk to someone soon.")}" target="_blank" rel="noopener">💬 Message us on WhatsApp</a>
      </div>
      <p class="ub-small">If you are in immediate danger, call 112 or go to the nearest hospital emergency.</p>
    </div>` : ""}
    <div class="result-card">
      <div class="rc-score"><span>${score}</span>/ ${max}</div>
      <div>
        <div class="rc-band">${band[2]}</div>
        <p>${band[3]}</p>
        <div class="rc-actions">
          <a class="btn" href="appointment.html">📅 Book a session</a>
          <a class="btn btn-outline" href="${waLink("Hello, I just took the " + Q.title + " on your website and would like some guidance.")}" target="_blank" rel="noopener">💬 Ask us a question</a>
        </div>
        <p class="rc-note">This is a screening tool, not a diagnosis.</p>
      </div>
    </div>`;
  box.scrollIntoView({ behavior: "smooth", block: "center" });
  return false;
}

/* ---------- Self-help: box breathing ---------- */
let bbTimer = null, bbEnd = 0;
function toggleBoxBreath() {
  const btn = document.getElementById("bb-btn"), c = document.getElementById("bb-circle"), tx = document.getElementById("bb-text"), tm = document.getElementById("bb-timer");
  if (bbTimer) {
    clearInterval(bbTimer); bbTimer = null; c.className = "bb-circle"; tx.textContent = "Ready?"; tm.textContent = ""; btn.textContent = "▶ Start 1 minute"; return;
  }
  const phases = [["Breathe in", "grow"], ["Hold", "grow hold"], ["Breathe out", ""], ["Hold", "hold"]];
  let i = 0; bbEnd = Date.now() + 60000; btn.textContent = "■ Stop";
  const step = () => {
    const left = Math.max(0, Math.ceil((bbEnd - Date.now()) / 1000));
    if (left <= 0) { clearInterval(bbTimer); bbTimer = null; c.className = "bb-circle"; tx.textContent = "Well done 🌿"; tm.textContent = ""; btn.textContent = "▶ Again"; return; }
    const p = phases[i % 4]; c.className = "bb-circle " + p[1]; tx.textContent = p[0]; tm.textContent = left + "s left"; i++;
  };
  step(); bbTimer = setInterval(step, 4000);
}

/* ---------- Self-help: 5-4-3-2-1 grounding ---------- */
const GROUND = [
  ["5", "things you can SEE", "Look around slowly. Name five things — a colour, a shape, the light."],
  ["4", "things you can TOUCH", "Notice your feet on the floor, your clothes, the chair, your hands."],
  ["3", "things you can HEAR", "Traffic, a fan, birds, your own breath — just listen."],
  ["2", "things you can SMELL", "Tea, soap, fresh air… or recall two smells you like."],
  ["1", "thing you can TASTE", "Notice the taste in your mouth, or take a slow sip of water."]
];
function groundingStep(n) {
  if (n >= GROUND.length) return `<div class="gr-done"><div class="gr-num">🌿</div><p><b>You're here, in this moment.</b><br>Take one slow breath. Notice how you feel now.</p>
    <button class="btn btn-outline" onclick="document.getElementById('grounding').innerHTML=groundingStep(0)">Start again</button></div>`;
  const g = GROUND[n];
  return `<div class="gr-step"><div class="gr-num">${g[0]}</div><div><b>${g[1]}</b><p>${g[2]}</p></div></div>
    <div class="gr-progress">${GROUND.map((_, k) => `<span class="${k <= n ? "on" : ""}"></span>`).join("")}</div>
    <button class="btn" onclick="document.getElementById('grounding').innerHTML=groundingStep(${n + 1})">${n === GROUND.length - 1 ? "Finish" : "Next →"}</button>`;
}

/* ---------- Career application → WhatsApp ---------- */
function submitCareer(e) {
  e.preventDefault();
  const f = e.target, val = n => (f[n] ? f[n].value.trim() : "");
  const msg =
    "💼 *Job Application — " + BASIC.siteName + "*\n" +
    "----------------------------------\n" +
    "👤 Name: " + val("name") + "\n" +
    "📞 Phone: " + val("phone") + "\n" +
    "🧑‍💼 Position: " + val("position") + "\n" +
    "🎓 Qualification: " + val("qualification") + "\n" +
    (val("message") ? "📝 About: " + val("message") + "\n" : "") +
    "----------------------------------\nSent from the website careers page. Resume will follow by email.";
  window.open(waLink(msg), "_blank");
  const ok = document.getElementById("form-success");
  if (ok) ok.style.display = "block";
  return false;
}

/* ---------- Workshop enquiry → WhatsApp ---------- */
function submitWorkshop(e) {
  e.preventDefault();
  const f = e.target, val = n => (f[n] ? f[n].value.trim() : "");
  const msg =
    "🎓 *Workshop Enquiry — " + BASIC.siteName + "*\n" +
    "----------------------------------\n" +
    "👤 Contact: " + val("name") + "\n" +
    "📞 Phone: " + val("phone") + "\n" +
    "🏢 Organisation: " + val("org") + " (" + val("orgtype") + ")\n" +
    "🧠 Topic: " + val("topic") + "\n" +
    "📍 Format: " + val("format") + "\n" +
    "👥 Participants: " + val("participants") + "\n" +
    (val("date") ? "📅 Preferred date: " + val("date") + "\n" : "") +
    (val("message") ? "📝 Note: " + val("message") + "\n" : "") +
    "----------------------------------\nSent from the website workshops page.";
  window.open(waLink(msg), "_blank");
  const ok = document.getElementById("form-success");
  if (ok) ok.style.display = "block";
  return false;
}

/* ---------- Gallery lightbox ---------- */
let lbIndex = 0;
function lbItems() { return [...document.querySelectorAll(".gallery-item img")]; }
function showLightbox() {
  const items = lbItems(); if (!items.length) return;
  lbIndex = (lbIndex + items.length) % items.length;
  const img = items[lbIndex];
  document.getElementById("lb-img").src = img.src;
  document.getElementById("lb-cap").textContent = img.alt;
}
function openLightbox(fig) {
  const img = fig.querySelector("img"); if (!img) return;
  lbIndex = lbItems().indexOf(img);
  showLightbox();
  document.getElementById("lightbox").classList.add("open");
}
function closeLightbox() { document.getElementById("lightbox").classList.remove("open"); }
function stepLightbox(d) { event && event.stopPropagation(); lbIndex += d; showLightbox(); }
document.addEventListener("keydown", e => {
  const lb = document.getElementById("lightbox");
  if (!lb || !lb.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowRight") { lbIndex++; showLightbox(); }
  if (e.key === "ArrowLeft") { lbIndex--; showLightbox(); }
});

/* ---------- Build the page ---------- */
sharedHTML();
document.getElementById("main").innerHTML = PAGES[document.body.dataset.page]();
initLiveGoogleReviews();
loadLiveOpenings();

/* Post-render extras */
(function () {
  // animated stat counters
  const statsEl = document.querySelector(".stats");
  if (statsEl && "IntersectionObserver" in window) {
    const obs = new IntersectionObserver(en => {
      if (en[0].isIntersecting) {
        document.querySelectorAll(".stats .num").forEach(el => {
          const target = parseInt(el.textContent) || 0, suffix = el.textContent.replace(/[0-9]/g, "");
          let cur = 0; const step = Math.max(1, Math.ceil(target / 60));
          const t = setInterval(() => { cur += step; if (cur >= target) { cur = target; clearInterval(t); } el.textContent = cur + suffix; }, 22);
        });
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(statsEl);
  }
  // pre-fill the booking form from links: ?service=… ?concern=… ?doctor=…
  const sel = document.querySelector('select[name="service"]');
  const svc = qs("service"), concern = qs("concern"), doc = qs("doctor");
  if (svc && sel) [...sel.options].forEach(o => { if (o.value === svc) sel.value = svc; });
  if (concern && sel) {
    const match = [...sel.options].find(o => o.value === concern);
    if (match) sel.value = concern;
    else {
      sel.value = "Not sure / Other";
      const msgBox = document.querySelector('textarea[name="message"]');
      if (msgBox && !msgBox.value) msgBox.value = "I would like help with: " + concern + "\n";
    }
  }
  const docSel = document.querySelector('select[name="doctor"]');
  if (doc && docSel) {
    [...docSel.options].forEach(o => { if (o.dataset.short === doc || o.value === doc) docSel.value = o.value; });
    onDoctorChange(docSel);
  }
  // jump to a section: ?sec=conditions / ?sec=therapies
  const sec = qs("sec");
  if (sec) setTimeout(() => goSection(sec), 350);
  // min date today
  const d = document.querySelector('input[type="date"]');
  if (d) { const n = new Date(); d.min = n.getFullYear() + "-" + String(n.getMonth() + 1).padStart(2, "0") + "-" + String(n.getDate()).padStart(2, "0"); }

  // floating particles in the hero (live background)
  const pWrap = document.getElementById("particles");
  if (pWrap) {
    for (let i = 0; i < 16; i++) {
      const p = document.createElement("span");
      p.className = "particle" + (Math.random() > 0.5 ? " green" : "");
      const size = 5 + Math.random() * 9;
      p.style.width = p.style.height = size + "px";
      p.style.left = Math.random() * 100 + "%";
      p.style.setProperty("--sway", (Math.random() * 120 - 60) + "px");
      p.style.animationDuration = 9 + Math.random() * 12 + "s";
      p.style.animationDelay = -(Math.random() * 18) + "s";
      pWrap.appendChild(p);
    }
  }

  // scroll-reveal: sections fade up, cards stagger in
  document.querySelectorAll("main section").forEach(sec => {
    if (sec.classList.contains("hero")) return;
    sec.querySelectorAll(".card, .step, .testimonial, .faq-item, .profile-box, .form-card, .cta-band, .section-title, .section-sub")
      .forEach((el, i) => el.classList.add("reveal", "d" + Math.min(i % 6 + 1, 6)));
  });
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const ro = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add("visible"); ro.unobserve(en.target); } });
    }, { threshold: 0.12 });
    revealEls.forEach(el => ro.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add("visible"));
  }

  const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Calm flowing waves + touch ripples in the hero ---- */
  const canvas = document.getElementById("waves");
  const ctx2d = canvas && canvas.getContext ? canvas.getContext("2d") : null;
  if (canvas && ctx2d && !reducedMotion) {
    const hero = canvas.parentElement, ctx = ctx2d;
    let W, H, t = 0, ripples = [];
    const resize = () => { W = canvas.width = hero.offsetWidth; H = canvas.height = hero.offsetHeight; };
    resize(); window.addEventListener("resize", resize);
    hero.addEventListener("pointermove", e => {
      if (Math.random() < 0.18) {
        const r = hero.getBoundingClientRect();
        ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 4, a: 0.45 });
      }
    });
    const waves = [
      { amp: 16, len: 0.012, speed: 0.012, y: 0.82, color: "rgba(104,136,118,0.18)" },
      { amp: 22, len: 0.009, speed: 0.008, y: 0.88, color: "rgba(73,104,88,0.15)" },
      { amp: 12, len: 0.016, speed: 0.016, y: 0.94, color: "rgba(201,162,39,0.10)" }
    ];
    (function draw() {
      ctx.clearRect(0, 0, W, H);
      waves.forEach(w => {
        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 6) {
          const y = H * w.y + Math.sin(x * w.len + t * w.speed * 60) * w.amp
                            + Math.sin(x * w.len * 0.5 + t * w.speed * 36) * w.amp * 0.6;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H); ctx.closePath();
        ctx.fillStyle = w.color; ctx.fill();
      });
      ripples = ripples.filter(p => p.a > 0.01);
      ripples.forEach(p => {
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(73,104,88," + p.a + ")"; ctx.lineWidth = 1.6; ctx.stroke();
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 0.55, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(201,162,39," + p.a * 0.7 + ")"; ctx.lineWidth = 1; ctx.stroke();
        p.r += 1.6; p.a *= 0.955;
      });
      t += 0.016;
      requestAnimationFrame(draw);
    })();
  }

  /* ---- Softly drifting calm words ---- */
  const wordsWrap = document.getElementById("calm-words");
  if (wordsWrap && !reducedMotion) {
    const words = ["Peace", "Calm", "Hope", "Healing", "Balance", "शांति", "Strength", "Clarity"];
    words.forEach((wd, i) => {
      const s = document.createElement("span");
      s.className = "calm-word";
      s.textContent = wd;
      const spots = [[2, 4], [68, 0], [86, 34], [-4, 40], [6, 80], [70, 84], [36, -4], [40, 94]];
      s.style.left = spots[i % spots.length][0] + "%";
      s.style.top = spots[i % spots.length][1] + "%";
      s.style.fontSize = (0.9 + Math.random() * 0.7) + "rem";
      s.style.animationDuration = (12 + Math.random() * 10) + "s";
      s.style.animationDelay = -(Math.random() * 20) + "s";
      wordsWrap.appendChild(s);
    });
  }

  /* ---- Fireflies on the breathing band ---- */
  const ff = document.getElementById("fireflies");
  if (ff && !reducedMotion) {
    for (let i = 0; i < 22; i++) {
      const s = document.createElement("span");
      s.className = "firefly";
      const size = 3 + Math.random() * 5;
      s.style.width = s.style.height = size + "px";
      s.style.left = Math.random() * 100 + "%";
      s.style.top = Math.random() * 100 + "%";
      s.style.animationDuration = (2.5 + Math.random() * 4) + "s";
      s.style.animationDelay = -(Math.random() * 5) + "s";
      ff.appendChild(s);
    }
  }

  /* ---- Guided breathing text, synced with the 11s circle cycle ---- */
  const bt = document.getElementById("breath-text");
  if (bt && !reducedMotion) {
    // cycle: 0–4s in · 4–6s hold · 6–10s out · 10–11s rest
    const phases = [
      { at: 0,     label: "Breathe in…" },
      { at: 4000,  label: "Hold…" },
      { at: 6000,  label: "Breathe out…" },
      { at: 10000, label: "Relax" }
    ];
    const cycleStart = performance.now();
    setInterval(() => {
      const t = (performance.now() - cycleStart) % 11000;
      let label = phases[0].label;
      for (const p of phases) if (t >= p.at) label = p.label;
      if (bt.textContent !== label) {
        bt.style.opacity = 0;
        setTimeout(() => { bt.textContent = label; bt.style.opacity = 1; }, 250);
      }
    }, 200);
  }
})();

/* ---------- Google Ads conversion tracking ----------
   Counts clicks on Call / WhatsApp / the booking form.
   Sends no names, numbers, message text or page query data.
   Everything is wrapped in try/catch so it can never break the site. */
(function () {
  var SEND_TO = 'AW-18147736876/VcbKCIKr874dEKz6wc1D';
  var fired = {};
  function track(kind) {
    try {
      if (fired[kind]) return;
      fired[kind] = true;
      if (typeof gtag !== 'function') return;
      gtag('event', 'conversion', {
        send_to: SEND_TO,
        page_location: location.origin + location.pathname
      });
    } catch (e) {}
  }
  document.addEventListener('click', function (ev) {
    try {
      var a = ev.target && ev.target.closest ? ev.target.closest('a') : null;
      if (!a || !a.href) return;
      if (a.href.indexOf('tel:') === 0) track('call');
      else if (a.href.indexOf('wa.me') > -1) track('whatsapp');
    } catch (e) {}
  }, true);
  document.addEventListener('submit', function (ev) {
    try {
      if (ev.target && ev.target.tagName === 'FORM') track('form');
    } catch (e) {}
  }, true);
})();
