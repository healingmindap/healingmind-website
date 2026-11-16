/* ============================================================
   Healing Mind — STAFF PORTAL (staff.html)
   Roles:  admin      → everything
           reception  → all appointments (patient remarks hidden)
           doctor     → only their own appointments, with remarks

   ⚠️ DEMO MODE: appointments are saved in THIS browser only
   (localStorage). Before real patient use, connect a secure
   database (e.g. Supabase) so data is shared across devices and
   protected by real logins. Passwords checked in the browser are
   NOT real security — anyone technical can bypass them.
   ============================================================ */

(function () {
  if (document.body.dataset.page !== "staff") return;

  /* ---------- accounts (username → role) ----------
     Passwords are stored only as fingerprints.
     Doctor usernames = the "bookAs" name in content/12-team.js, in small letters. */
  const ACCOUNTS = {
    admin:     { role: "admin",     label: "Admin",     key: "1147ee61b91d4c" },
    reception: { role: "reception", label: "Reception", key: "88f4bd84563fe" },
    pragya:    { role: "doctor",    label: "Pragya",    key: "520f63a5e5a48" },
    pooja:     { role: "doctor",    label: "Pooja",     key: "5af7a2ca265ec" }
  };
  const cyrb53 = (str, seed = 7) => { let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) { ch = str.charCodeAt(i); h1 = Math.imul(h1 ^ ch, 2654435761); h2 = Math.imul(h2 ^ ch, 1597334677); }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507); h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507); h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16); };

  const DOCTORS = TEAM.members.filter(m => !m.placeholder);
  const doctorFullName = short => (DOCTORS.find(d => (d.bookAs || "").toLowerCase() === short) || {}).name || short;
  const STATUSES = ["Requested", "Confirmed", "Completed", "Cancelled", "No-show"];
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // local dates (not UTC) — important for India, which is ahead of UTC
  const iso = x => x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
  const today = () => iso(new Date());
  const addDays = (d, n) => { const x = new Date(d + "T00:00:00"); x.setDate(x.getDate() + n); return iso(x); };
  const fmtDate = d => d ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "—";

  /* ---------- session ---------- */
  const ss = {
    get() { try { return JSON.parse(sessionStorage.getItem("hm_staff") || "null"); } catch (e) { return null; } },
    set(v) { try { sessionStorage.setItem("hm_staff", JSON.stringify(v)); } catch (e) {} },
    clear() { try { sessionStorage.removeItem("hm_staff"); } catch (e) {} }
  };

  /* ---------- demo data (only if nothing stored yet) ---------- */
  function seedIfEmpty() {
    let seeded = false;
    try { seeded = localStorage.getItem("hm_demo_seeded") === "1"; } catch (e) {}
    if (seeded) return;
    try { localStorage.setItem("hm_demo_seeded", "1"); } catch (e) {}
    const t = today();
    const P = DOCTORS[0] ? DOCTORS[0].name : "Pragya Rakesh Singh";
    const Q = DOCTORS[1] ? DOCTORS[1].name : "Pooja Gahlot";
    const demo = [
      [-6, "Ananya K. (demo)", "Anxiety", P, "In-person", "Morning (10 am – 1 pm)", "11:00", "Completed", "First visit. Panic attacks while travelling."],
      [-3, "Rahul M. (demo)", "Addiction Management", Q, "Online (video call)", "Evening (4 pm – 8 pm)", "18:00", "Completed", "Wants to reduce drinking. Prefers evening slots."],
      [-1, "Sneha P. (demo)", "Depression", P, "In-person", "Afternoon (1 pm – 4 pm)", "14:30", "No-show", ""],
      [0, "Vikram J. (demo)", "Anger Management", P, "In-person", "Morning (10 am – 1 pm)", "10:30", "Confirmed", "Referred by family doctor."],
      [0, "Meera D. (demo)", "BPD (Borderline Personality Disorder)", Q, "Online (video call)", "Afternoon (1 pm – 4 pm)", "15:00", "Confirmed", "Follow-up session; DBT skills practice."],
      [0, "Karan S. (demo)", "Phobia", "Any available psychologist", "In-person", "Evening (4 pm – 8 pm)", "", "Requested", "Fear of heights, needs help before a work trip."],
      [1, "Priya & Amit (demo)", "Marriage Counselling", P, "In-person", "Evening (4 pm – 8 pm)", "17:00", "Confirmed", "Pre-marriage counselling, wedding in March."],
      [1, "Farhan A. (demo)", "Trauma Healing", Q, "Online (video call)", "Morning (10 am – 1 pm)", "", "Requested", "Prefers a female therapist."],
      [2, "Neha R. (demo)", "Anxiety", "Any available psychologist", "Online (video call)", "Morning (10 am – 1 pm)", "", "Requested", "Exam stress, final year student."],
      [3, "Sanjay T. (demo)", "Addiction Management", Q, "Online (video call)", "Evening (4 pm – 8 pm)", "19:00", "Confirmed", "Gaming addiction, parent will join."],
      [5, "Isha V. (demo)", "Depression", P, "In-person", "Afternoon (1 pm – 4 pm)", "13:30", "Confirmed", ""],
      [6, "Rohit N. (demo)", "Not sure / Other", "Any available psychologist", "Phone call", "Morning (10 am – 1 pm)", "", "Cancelled", "Would like help with: Sleep Disorders"]
    ];
    demo.forEach((d, i) => HMStore.add({
      name: d[1], phone: "+91 90000 000" + String(10 + i), email: "", service: d[2], doctor: d[3],
      branch: d[4] === "In-person" ? (BRANCHES[0] ? BRANCHES[0].name : "Chinchwad Centre") : "Online",
      mode: d[4], date: addDays(t, d[0]), timeWindow: d[5], time: d[6], status: d[7], message: d[8],
      source: i % 4 === 3 ? "Phone" : "Website", demo: true
    }));
  }

  /* ---------- state ---------- */
  const app = document.getElementById("staff-app");
  let user = ss.get();
  let view = { tab: "today", doctor: "all", status: "all", q: "" };

  function visible(list) {
    if (user.role === "doctor") list = list.filter(a => a.doctor === doctorFullName(user.username));
    return list;
  }
  const canSeeRemarks = a => user.role === "admin" || (user.role === "doctor" && a.doctor === doctorFullName(user.username));
  const canManage = () => user.role === "admin" || user.role === "reception";

  /* ---------- LOGIN ---------- */
  function renderLogin(err) {
    app.innerHTML = `
      <div class="st-login">
        <div class="st-login-card">
          <img src="${typeof __src === "function" ? __src("logo.png") : "images/logo.png"}" alt="" class="st-logo">
          <h2>Staff Login</h2>
          <p class="st-sub">${esc(BASIC.siteName)} ${esc(BASIC.siteTagline.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()))}</p>
          <form id="st-login-form" autocomplete="off">
            <label>Username</label>
            <input name="u" required placeholder="e.g. reception" autocapitalize="none">
            <label>Password</label>
            <div class="st-pass"><input name="p" type="password" required placeholder="••••••••">
              <button type="button" class="st-eye" onclick="var i=this.previousElementSibling;i.type=i.type==='password'?'text':'password'">👁</button></div>
            ${err ? `<div class="st-err">${esc(err)}</div>` : ""}
            <button class="btn" type="submit" style="width:100%;margin-top:6px">🔐 Log in</button>
          </form>
          <p class="st-note">Authorised staff only. All usernames are in small letters.</p>
        </div>
        <div class="st-demo-banner">🧪 <b>Demo mode</b> — appointments are saved only in this browser. Connect the secure database before using with real patients.</div>
      </div>`;
    document.getElementById("st-login-form").onsubmit = e => {
      e.preventDefault();
      const u = e.target.u.value.trim().toLowerCase(), p = e.target.p.value;
      const acc = ACCOUNTS[u];
      if (!acc || cyrb53(u + ":" + p) !== acc.key) return renderLogin("Incorrect username or password.");
      user = { username: u, role: acc.role, label: acc.label };
      ss.set(user); seedIfEmpty(); renderDash();
    };
  }

  /* ---------- DASHBOARD ---------- */
  function renderDash() {
    const all = visible(HMStore.all());
    const t = today(), weekEnd = addDays(t, 6);
    const stats = {
      today: all.filter(a => a.date === t && a.status !== "Cancelled").length,
      week: all.filter(a => a.date >= t && a.date <= weekEnd && a.status !== "Cancelled").length,
      pending: all.filter(a => a.status === "Requested").length,
      total: all.length
    };
    const days = [...Array(7)].map((_, i) => { const d = addDays(t, i); return { d, n: all.filter(a => a.date === d && a.status !== "Cancelled").length }; });
    const maxN = Math.max(1, ...days.map(x => x.n));
    const roleTitle = user.role === "doctor" ? `${esc(doctorFullName(user.username))}` : user.label;

    app.innerHTML = `
      <div class="st-demo-banner">🧪 <b>Demo mode</b> — data is stored only in this browser. ${user.role === "admin" ? `<button class="st-link" id="st-reset">Reset demo data</button>` : ""}</div>
      <div class="st-head">
        <div>
          <div class="st-kicker">${user.role === "doctor" ? "Psychologist dashboard" : user.role === "admin" ? "Admin dashboard" : "Reception dashboard"}</div>
          <h2>Welcome, ${roleTitle}</h2>
          <p class="st-sub">${fmtDate(t)} · ${user.role === "doctor" ? "Showing only your appointments" : "Showing all appointments"}</p>
        </div>
        <div class="st-head-actions">
          ${canManage() ? `<button class="btn btn-sm" id="st-new">＋ New appointment</button>` : ""}
          ${user.role === "admin" ? `<button class="btn btn-sm btn-outline" id="st-csv">⬇ Export CSV</button>` : ""}
          <button class="btn btn-sm btn-outline" id="st-logout">Log out</button>
        </div>
      </div>

      <div class="st-stats">
        <div class="st-stat"><span>${stats.today}</span>Today</div>
        <div class="st-stat"><span>${stats.week}</span>Next 7 days</div>
        <div class="st-stat warn"><span>${stats.pending}</span>Awaiting confirmation</div>
        <div class="st-stat"><span>${stats.total}</span>Total (all time)</div>
      </div>

      <div class="st-panel">
        <h4>Appointments per day — next 7 days</h4>
        <div class="st-bars">${days.map(x => `
          <div class="st-bar" title="${x.n} appointment(s)">
            <div class="st-bar-n">${x.n}</div>
            <div class="st-bar-fill" style="height:${Math.round(x.n / maxN * 100)}%"></div>
            <div class="st-bar-d">${new Date(x.d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short" })}<br>${new Date(x.d + "T00:00:00").getDate()}</div>
          </div>`).join("")}</div>
      </div>

      <div class="st-panel">
        <div class="st-toolbar">
          <div class="st-tabs">
            ${[["today", "Today"], ["upcoming", "Upcoming"], ["past", "History"], ["all", "All"]].map(([k, l]) => `<button data-tab="${k}" class="${view.tab === k ? "on" : ""}">${l}</button>`).join("")}
          </div>
          <div class="st-filters">
            ${user.role !== "doctor" ? `<select id="st-f-doc"><option value="all">All psychologists</option>${DOCTORS.map(d => `<option ${view.doctor === d.name ? "selected" : ""}>${esc(d.name)}</option>`).join("")}<option ${view.doctor === "Any available psychologist" ? "selected" : ""} value="Any available psychologist">Not assigned yet</option></select>` : ""}
            <select id="st-f-status"><option value="all">All statuses</option>${STATUSES.map(s => `<option ${view.status === s ? "selected" : ""}>${s}</option>`).join("")}</select>
            <input id="st-f-q" placeholder="🔍 Search name or phone" value="${esc(view.q)}">
          </div>
        </div>
        <div id="st-list"></div>
      </div>
      <div id="st-modal"></div>`;

    document.getElementById("st-logout").onclick = () => { ss.clear(); user = null; renderLogin(); };
    const nb = document.getElementById("st-new"); if (nb) nb.onclick = () => openForm();
    const cb = document.getElementById("st-csv"); if (cb) cb.onclick = exportCSV;
    const rb = document.getElementById("st-reset"); if (rb) rb.onclick = () => { if (rb.dataset.sure) { HMStore.clear(); try { localStorage.removeItem("hm_demo_seeded"); } catch (e) {} seedIfEmpty(); renderDash(); } else { rb.dataset.sure = 1; rb.textContent = "Tap again to reset"; } };
    app.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { view.tab = b.dataset.tab; renderDash(); });
    const fd = document.getElementById("st-f-doc"); if (fd) fd.onchange = e => { view.doctor = e.target.value; renderList(); };
    document.getElementById("st-f-status").onchange = e => { view.status = e.target.value; renderList(); };
    document.getElementById("st-f-q").oninput = e => { view.q = e.target.value; renderList(); };
    renderList();
  }

  function filtered() {
    const t = today();
    let list = visible(HMStore.all());
    if (view.tab === "today") list = list.filter(a => a.date === t);
    if (view.tab === "upcoming") list = list.filter(a => a.date > t);
    if (view.tab === "past") list = list.filter(a => a.date < t);
    if (view.doctor !== "all" && user.role !== "doctor") list = list.filter(a => a.doctor === view.doctor);
    if (view.status !== "all") list = list.filter(a => a.status === view.status);
    if (view.q) { const q = view.q.toLowerCase(); list = list.filter(a => (a.name + " " + a.phone).toLowerCase().includes(q)); }
    const asc = view.tab !== "past";
    return list.sort((a, b) => ((a.date + (a.time || "99")) < (b.date + (b.time || "99")) ? -1 : 1) * (asc ? 1 : -1));
  }

  function renderList() {
    const list = filtered(), box = document.getElementById("st-list");
    if (!list.length) { box.innerHTML = `<div class="st-empty">No appointments here.</div>`; return; }
    box.innerHTML = `
      <div class="st-table">
        <div class="st-tr st-th"><div>Date & time</div><div>Patient</div><div>Service</div><div>Psychologist</div><div>Mode</div><div>Status</div></div>
        ${list.map(a => `
        <div class="st-tr" data-id="${a.id}" tabindex="0">
          <div><b>${fmtDate(a.date)}</b><small>${a.time ? esc(a.time) : esc(a.timeWindow || "")}</small></div>
          <div><b>${esc(a.name)}</b><small>${esc(a.phone)}</small></div>
          <div>${esc(a.service)}</div>
          <div>${a.doctor === "Any available psychologist" ? `<span class="st-unassigned">Not assigned</span>` : esc(a.doctor)}</div>
          <div>${esc(a.mode)}</div>
          <div><span class="st-badge s-${a.status.toLowerCase()}">${a.status}</span></div>
        </div>`).join("")}
      </div>`;
    box.querySelectorAll(".st-tr[data-id]").forEach(r => {
      r.onclick = () => openDetail(r.dataset.id);
      r.onkeydown = e => { if (e.key === "Enter") openDetail(r.dataset.id); };
    });
  }

  /* ---------- DETAIL DRAWER ---------- */
  function openDetail(id) {
    const a = HMStore.get(id); if (!a) return;
    const m = document.getElementById("st-modal");
    const waMsg = `Hello ${a.name.replace(/ \(demo\)$/, "")}, your appointment at ${BASIC.siteName} is confirmed for ${fmtDate(a.date)}${a.time ? " at " + a.time : ""}${a.mode.startsWith("Online") ? " (online)" : " at our " + (BRANCHES[0] ? BRANCHES[0].name : "centre")}. Please reply to confirm.`;
    const phoneDigits = (a.phone || "").replace(/[^\d]/g, "");
    m.innerHTML = `
      <div class="st-overlay" id="st-ov">
        <div class="st-drawer">
          <button class="st-x" id="st-close">✕</button>
          <div class="st-kicker">Appointment</div>
          <h3>${esc(a.name)}</h3>
          <span class="st-badge s-${a.status.toLowerCase()}">${a.status}</span>
          <dl class="st-dl">
            <dt>Phone</dt><dd><a href="tel:${esc(a.phone)}">${esc(a.phone)}</a></dd>
            ${a.email ? `<dt>Email</dt><dd>${esc(a.email)}</dd>` : ""}
            <dt>Service</dt><dd>${esc(a.service)}</dd>
            <dt>Psychologist</dt><dd>${esc(a.doctor)}</dd>
            <dt>Mode</dt><dd>${esc(a.mode)} · ${esc(a.branch)}</dd>
            <dt>Requested</dt><dd>${fmtDate(a.date)} · ${esc(a.timeWindow || "")}</dd>
            <dt>Exact time</dt><dd>${a.time ? esc(a.time) : "<i>Not set yet</i>"}</dd>
            <dt>Source</dt><dd>${esc(a.source || "Website")} · booked ${a.created ? new Date(a.created).toLocaleString("en-IN") : "—"}</dd>
          </dl>
          <div class="st-remarks">
            <h4>Patient remarks</h4>
            ${canSeeRemarks(a) ? (a.message ? `<p>${esc(a.message).replace(/\n/g, "<br>")}</p>` : `<p><i>No remarks written.</i></p>`)
              : `<p class="st-locked">🔒 Visible only to the assigned psychologist and admin.</p>`}
          </div>
          ${canManage() ? `
          <div class="st-edit">
            <h4>Schedule</h4>
            <div class="st-edit-row">
              <label>Date<input type="date" id="st-e-date" value="${esc(a.date)}"></label>
              <label>Exact time<input type="time" id="st-e-time" value="${esc(a.time || "")}"></label>
            </div>
            <label>Psychologist<select id="st-e-doc">
              <option ${a.doctor === "Any available psychologist" ? "selected" : ""} value="Any available psychologist">Not assigned</option>
              ${DOCTORS.map(d => `<option ${a.doctor === d.name ? "selected" : ""}>${esc(d.name)}</option>`).join("")}
            </select></label>
            <button class="btn btn-sm" id="st-save">💾 Save changes</button>
          </div>` : ""}
          <div class="st-actions">
            <h4>Status</h4>
            <div class="st-status-btns">
              ${(user.role === "doctor" ? ["Completed", "No-show"] : STATUSES).map(s => `<button class="st-sbtn ${a.status === s ? "on" : ""}" data-s="${s}">${s}</button>`).join("")}
            </div>
            <div class="st-contact">
              <a class="btn btn-sm btn-wa" target="_blank" rel="noopener" href="https://wa.me/${phoneDigits}?text=${encodeURIComponent(waMsg)}">💬 WhatsApp patient</a>
              <a class="btn btn-sm btn-outline" href="tel:${esc(a.phone)}">📞 Call</a>
              ${user.role === "admin" ? `<button class="btn btn-sm st-del" id="st-del">🗑 Delete</button>` : ""}
            </div>
          </div>
        </div>
      </div>`;
    const close = () => { m.innerHTML = ""; };
    document.getElementById("st-close").onclick = close;
    document.getElementById("st-ov").onclick = e => { if (e.target.id === "st-ov") close(); };
    m.querySelectorAll("[data-s]").forEach(b => b.onclick = () => { HMStore.update(id, { status: b.dataset.s }); renderDash(); openDetail(id); });
    const sv = document.getElementById("st-save");
    if (sv) sv.onclick = () => {
      HMStore.update(id, { date: document.getElementById("st-e-date").value, time: document.getElementById("st-e-time").value, doctor: document.getElementById("st-e-doc").value });
      renderDash(); openDetail(id);
    };
    const del = document.getElementById("st-del");
    if (del) del.onclick = () => { if (del.dataset.sure) { HMStore.remove(id); close(); renderDash(); } else { del.dataset.sure = 1; del.textContent = "Tap again to delete"; } };
  }

  /* ---------- NEW APPOINTMENT (phone / walk-in) ---------- */
  function openForm() {
    const m = document.getElementById("st-modal");
    m.innerHTML = `
      <div class="st-overlay" id="st-ov">
        <div class="st-drawer">
          <button class="st-x" id="st-close">✕</button>
          <div class="st-kicker">Add appointment</div>
          <h3>New phone / walk-in booking</h3>
          <form id="st-new-form" class="st-form">
            <label>Patient name *<input name="name" required></label>
            <label>Phone *<input name="phone" required placeholder="+91 …"></label>
            <label>Service *<select name="service">${SERVICES.map(s => `<option>${esc(s.name)}</option>`).join("")}<option>Not sure / Other</option></select></label>
            <label>Psychologist<select name="doctor"><option value="Any available psychologist">Not assigned</option>${DOCTORS.map(d => `<option>${esc(d.name)}</option>`).join("")}</select></label>
            <div class="st-edit-row">
              <label>Date *<input type="date" name="date" required value="${today()}"></label>
              <label>Time<input type="time" name="time"></label>
            </div>
            <label>Mode<select name="mode"><option>In-person</option><option>Online (video call)</option><option>Phone call</option></select></label>
            <label>Source<select name="source"><option>Phone</option><option>Walk-in</option><option>WhatsApp</option></select></label>
            <label>Remarks<textarea name="message" rows="3"></textarea></label>
            <button class="btn" type="submit" style="width:100%">Save appointment</button>
          </form>
        </div>
      </div>`;
    const close = () => { m.innerHTML = ""; };
    document.getElementById("st-close").onclick = close;
    document.getElementById("st-ov").onclick = e => { if (e.target.id === "st-ov") close(); };
    document.getElementById("st-new-form").onsubmit = e => {
      e.preventDefault(); const f = e.target;
      HMStore.add({
        name: f.name.value.trim(), phone: f.phone.value.trim(), service: f.service.value, doctor: f.doctor.value,
        date: f.date.value, time: f.time.value, timeWindow: "", mode: f.mode.value,
        branch: f.mode.value === "In-person" ? (BRANCHES[0] ? BRANCHES[0].name : "Centre") : "Online",
        message: f.message.value.trim(), source: f.source.value, status: f.time.value ? "Confirmed" : "Requested"
      });
      close(); view.tab = "all"; renderDash();
    };
  }

  /* ---------- CSV export (admin) ---------- */
  function exportCSV() {
    const cols = ["date", "time", "timeWindow", "name", "phone", "email", "service", "doctor", "mode", "branch", "status", "source", "message", "created"];
    const rows = [cols.join(",")].concat(HMStore.all().map(a => cols.map(c => `"${String(a[c] == null ? "" : a[c]).replace(/"/g, '""')}"`).join(",")));
    const blob = new Blob(["﻿" + rows.join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob); link.download = "healing-mind-appointments-" + today() + ".csv";
    document.body.appendChild(link); link.click(); link.remove();
  }

  /* ---------- start ---------- */
  if (user && ACCOUNTS[user.username]) { seedIfEmpty(); renderDash(); } else renderLogin();
})();
