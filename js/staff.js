/* ============================================================
   Healing Mind — STAFF PORTAL (staff.html)
   Roles:  admin      → everything + career openings
           reception  → all appointments (patient remarks hidden)
           doctor     → only their own appointments, with remarks

   LIVE MODE (BASIC.liveDataUrl filled in content/1-basic-info.js):
     logins are checked by the clinic's Google Sheet connector and
     every device sees the same real appointments.
   NOT CONNECTED: works only inside this browser (for trying out).
   ============================================================ */

(function () {
  if (document.body.dataset.page !== "staff") return;

  const LIVE = HMApi.on();

  /* local-only fallback accounts (used ONLY when the Google Sheet is not connected) */
  const LOCAL_ACCOUNTS = {
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
  const iso = x => x.getFullYear() + "-" + String(x.getMonth() + 1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0");
  const today = () => iso(new Date());
  const addDays = (d, n) => { const x = new Date(d + "T00:00:00"); x.setDate(x.getDate() + n); return iso(x); };
  const fmtDate = d => d && /^\d{4}-\d{2}-\d{2}$/.test(d) ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : (d || "—");

  /* ---------- session ---------- */
  const ss = {
    get() { try { return JSON.parse(sessionStorage.getItem("hm_staff") || "null"); } catch (e) { return null; } },
    set(v) { try { sessionStorage.setItem("hm_staff", JSON.stringify(v)); } catch (e) {} },
    clear() { try { sessionStorage.removeItem("hm_staff"); } catch (e) {} }
  };
  // remove old demo entries left in this browser by earlier versions
  try {
    if (localStorage.getItem("hm_demo_seeded")) {
      HMStore.save(HMStore.all().filter(a => !a.demo));
      localStorage.removeItem("hm_demo_seeded");
    }
  } catch (e) {}

  /* ---------- data layer ---------- */
  let DATA = [], JOBS = [], loading = false, lastLoad = null;

  async function api(body) {
    const res = await HMApi.post(Object.assign({ token: user && user.token }, body));
    if (!res.ok && res.relogin) { ss.clear(); user = null; renderLogin("Your session ended — please log in again."); throw new Error("relogin"); }
    if (!res.ok) throw new Error(res.error || "Something went wrong");
    return res;
  }
  const Store = {
    async load() {
      if (LIVE) DATA = (await api({ action: "list" })).appointments;
      else DATA = HMStore.all();
      lastLoad = new Date();
    },
    async update(id, patch) { if (LIVE) await api({ action: "update", id, patch }); else HMStore.update(id, patch); },
    async create(d) { if (LIVE) await api({ action: "create", data: d }); else HMStore.add(d); },
    async remove(id) { if (LIVE) await api({ action: "delete", id }); else HMStore.remove(id); },
    async jobs() { JOBS = LIVE ? (await api({ action: "jobs" })).openings : []; },
    async jobSave(d) { await api({ action: "jobSave", data: d }); },
    async jobDelete(id) { await api({ action: "jobDelete", id }); }
  };
  const get = id => DATA.find(a => a.id === id);

  /* ---------- state ---------- */
  const app = document.getElementById("staff-app");
  let user = ss.get();
  let view = { section: "appts", tab: "today", doctor: "all", status: "all", q: "" };
  let refreshTimer = null;

  const myDoctor = () => user.doctor || doctorFullName(user.username);
  function visible(list) {
    if (user.role === "doctor") list = list.filter(a => a.doctor === myDoctor());
    return list;
  }
  const canSeeRemarks = a => !a.remarksHidden && (user.role === "admin" || (user.role === "doctor" && a.doctor === myDoctor()));
  const canManage = () => user.role === "admin" || user.role === "reception";

  function toast(msg, bad) {
    let t = document.getElementById("st-toast");
    if (!t) { t = document.createElement("div"); t.id = "st-toast"; document.body.appendChild(t); }
    t.className = "st-toast" + (bad ? " bad" : ""); t.textContent = msg; t.style.opacity = 1;
    clearTimeout(t._h); t._h = setTimeout(() => { t.style.opacity = 0; }, 2600);
  }
  async function act(fn, okMsg) {
    try { await fn(); await Store.load(); renderDash(); if (okMsg) toast(okMsg); return true; }
    catch (e) { if (e.message !== "relogin") toast("⚠️ " + e.message, true); return false; }
  }

  /* ---------- LOGIN ---------- */
  function renderLogin(err) {
    clearInterval(refreshTimer);
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
            <button class="btn" type="submit" style="width:100%;margin-top:6px" id="st-login-btn">🔐 Log in</button>
          </form>
          <p class="st-note">Authorised staff only. All usernames are in small letters.</p>
        </div>
        ${LIVE ? `<div class="st-live-banner">🟢 Connected to the clinic's secure Google Sheet</div>`
               : `<div class="st-demo-banner">⚪ <b>Not connected yet</b> — appointments are kept only in this browser until the Google Sheet is connected.</div>`}
      </div>`;
    document.getElementById("st-login-form").onsubmit = async e => {
      e.preventDefault();
      const u = e.target.u.value.trim().toLowerCase(), p = e.target.p.value;
      const btn = document.getElementById("st-login-btn"); btn.disabled = true; btn.textContent = "Checking…";
      if (LIVE) {
        try {
          const r = await HMApi.post({ action: "login", username: u, password: p });
          if (!r.ok) return renderLogin(r.error || "Incorrect username or password.");
          user = Object.assign({ token: r.token }, r.user);
        } catch (err) { return renderLogin("Could not reach the server. Check your internet and try again."); }
      } else {
        const acc = LOCAL_ACCOUNTS[u];
        if (!acc || cyrb53(u + ":" + p) !== acc.key) return renderLogin("Incorrect username or password.");
        user = { username: u, role: acc.role, label: acc.label };
      }
      ss.set(user); start();
    };
  }

  async function start() {
    app.innerHTML = `<div class="st-loading">Loading appointments…</div>`;
    try { await Store.load(); } catch (e) { if (e.message === "relogin") return; app.innerHTML = `<div class="st-loading">⚠️ ${esc(e.message)} <button class="btn btn-sm" onclick="location.reload()">Try again</button></div>`; return; }
    renderDash();
    clearInterval(refreshTimer);
    if (LIVE) refreshTimer = setInterval(async () => {
      if (document.getElementById("st-ov") || document.hidden) return;   // don't disturb an open form
      try { await Store.load(); if (view.section === "appts") renderDash(); } catch (e) {}
    }, 60000);
  }

  /* ---------- DASHBOARD ---------- */
  function renderDash() {
    const all = visible(DATA);
    const t = today(), weekEnd = addDays(t, 6);
    const stats = {
      today: all.filter(a => a.date === t && a.status !== "Cancelled").length,
      week: all.filter(a => a.date >= t && a.date <= weekEnd && a.status !== "Cancelled").length,
      pending: all.filter(a => a.status === "Requested").length,
      total: all.length
    };
    const days = [...Array(7)].map((_, i) => { const d = addDays(t, i); return { d, n: all.filter(a => a.date === d && a.status !== "Cancelled").length }; });
    const maxN = Math.max(1, ...days.map(x => x.n));
    const roleTitle = user.role === "doctor" ? esc(myDoctor()) : esc(user.label);

    app.innerHTML = `
      ${LIVE ? `<div class="st-live-banner">🟢 Live — shared with all staff devices · updated ${lastLoad ? lastLoad.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""} <button class="st-link" id="st-refresh">↻ Refresh</button></div>`
             : `<div class="st-demo-banner">⚪ <b>Not connected yet</b> — data is kept only in this browser. Connect the Google Sheet to share it with all staff.</div>`}
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

      ${user.role === "admin" ? `
      <div class="st-sections">
        <button data-sec="appts" class="${view.section === "appts" ? "on" : ""}">📅 Appointments</button>
        <button data-sec="jobs" class="${view.section === "jobs" ? "on" : ""}">💼 Career openings</button>
      </div>` : ""}

      <div id="st-body"></div>
      <div id="st-modal"></div>`;

    document.getElementById("st-logout").onclick = () => { ss.clear(); user = null; renderLogin(); };
    const nb = document.getElementById("st-new"); if (nb) nb.onclick = () => openForm();
    const cb = document.getElementById("st-csv"); if (cb) cb.onclick = exportCSV;
    const rf = document.getElementById("st-refresh"); if (rf) rf.onclick = () => act(async () => {}, "Updated");
    app.querySelectorAll("[data-sec]").forEach(b => b.onclick = () => { view.section = b.dataset.sec; renderDash(); });

    if (view.section === "jobs" && user.role === "admin") return renderJobs();

    document.getElementById("st-body").innerHTML = `
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
      </div>`;

    app.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { view.tab = b.dataset.tab; renderDash(); });
    const fd = document.getElementById("st-f-doc"); if (fd) fd.onchange = e => { view.doctor = e.target.value; renderList(); };
    document.getElementById("st-f-status").onchange = e => { view.status = e.target.value; renderList(); };
    document.getElementById("st-f-q").oninput = e => { view.q = e.target.value; renderList(); };
    renderList();
  }

  function filtered() {
    const t = today();
    let list = visible(DATA);
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
    if (!list.length) {
      box.innerHTML = `<div class="st-empty">${DATA.length ? "No appointments here." : "No appointments yet. New bookings from the website will appear here automatically."}</div>`;
      return;
    }
    box.innerHTML = `
      <div class="st-table">
        <div class="st-tr st-th"><div>Date & time</div><div>Patient</div><div>Service</div><div>Psychologist</div><div>Mode</div><div>Status</div></div>
        ${list.map(a => `
        <div class="st-tr" data-id="${esc(a.id)}" tabindex="0">
          <div><b>${fmtDate(a.date)}</b><small>${a.time ? esc(a.time) : esc(a.timeWindow || "")}</small></div>
          <div><b>${esc(a.name)}</b><small>${esc(a.phone)}</small></div>
          <div>${esc(a.service)}</div>
          <div>${a.doctor === "Any available psychologist" ? `<span class="st-unassigned">Not assigned</span>` : esc(a.doctor)}</div>
          <div>${esc(a.mode)}</div>
          <div><span class="st-badge s-${esc((a.status || "").toLowerCase())}">${esc(a.status)}</span></div>
        </div>`).join("")}
      </div>`;
    box.querySelectorAll(".st-tr[data-id]").forEach(r => {
      r.onclick = () => openDetail(r.dataset.id);
      r.onkeydown = e => { if (e.key === "Enter") openDetail(r.dataset.id); };
    });
  }

  /* ---------- DETAIL DRAWER ---------- */
  function openDetail(id) {
    const a = get(id); if (!a) return;
    const m = document.getElementById("st-modal");
    const waMsg = `Hello ${a.name}, your appointment at ${BASIC.siteName} is confirmed for ${fmtDate(a.date)}${a.time ? " at " + a.time : ""}${(a.mode || "").startsWith("Online") ? " (online)" : " at our " + (BRANCHES[0] ? BRANCHES[0].name : "centre")}. Please reply to confirm.`;
    const phoneDigits = (a.phone || "").replace(/[^\d]/g, "");
    m.innerHTML = `
      <div class="st-overlay" id="st-ov">
        <div class="st-drawer">
          <button class="st-x" id="st-close">✕</button>
          <div class="st-kicker">Appointment</div>
          <h3>${esc(a.name)}</h3>
          <span class="st-badge s-${esc((a.status || "").toLowerCase())}">${esc(a.status)}</span>
          <dl class="st-dl">
            <dt>Phone</dt><dd><a href="tel:${esc(a.phone)}">${esc(a.phone)}</a></dd>
            ${a.email ? `<dt>Email</dt><dd>${esc(a.email)}</dd>` : ""}
            <dt>Service</dt><dd>${esc(a.service)}</dd>
            <dt>Psychologist</dt><dd>${esc(a.doctor)}</dd>
            <dt>Mode</dt><dd>${esc(a.mode)}${a.branch ? " · " + esc(a.branch) : ""}</dd>
            <dt>Requested</dt><dd>${fmtDate(a.date)}${a.timeWindow ? " · " + esc(a.timeWindow) : ""}</dd>
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
    const busy = b => { if (b) { b.disabled = true; b.dataset.t = b.textContent; b.textContent = "Saving…"; } };
    document.getElementById("st-close").onclick = close;
    document.getElementById("st-ov").onclick = e => { if (e.target.id === "st-ov") close(); };
    m.querySelectorAll("[data-s]").forEach(b => b.onclick = async () => { busy(b); if (await act(() => Store.update(id, { status: b.dataset.s }), "Status updated")) openDetail(id); });
    const sv = document.getElementById("st-save");
    if (sv) sv.onclick = async () => {
      const patch = { date: document.getElementById("st-e-date").value, time: document.getElementById("st-e-time").value, doctor: document.getElementById("st-e-doc").value };
      busy(sv); if (await act(() => Store.update(id, patch), "Saved")) openDetail(id);
    };
    const del = document.getElementById("st-del");
    if (del) del.onclick = async () => {
      if (!del.dataset.sure) { del.dataset.sure = 1; del.textContent = "Tap again to delete"; return; }
      busy(del); await act(() => Store.remove(id), "Deleted");
    };
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
            <button class="btn" type="submit" style="width:100%" id="st-new-save">Save appointment</button>
          </form>
        </div>
      </div>`;
    const close = () => { m.innerHTML = ""; };
    document.getElementById("st-close").onclick = close;
    document.getElementById("st-ov").onclick = e => { if (e.target.id === "st-ov") close(); };
    document.getElementById("st-new-form").onsubmit = async e => {
      e.preventDefault(); const f = e.target;
      const b = document.getElementById("st-new-save"); b.disabled = true; b.textContent = "Saving…";
      const d = {
        name: f.name.value.trim(), phone: f.phone.value.trim(), service: f.service.value, doctor: f.doctor.value,
        date: f.date.value, time: f.time.value, timeWindow: "", mode: f.mode.value,
        branch: f.mode.value === "In-person" ? (BRANCHES[0] ? BRANCHES[0].name : "Centre") : "Online",
        message: f.message.value.trim(), source: f.source.value, status: f.time.value ? "Confirmed" : "Requested"
      };
      view.tab = "all";
      if (!(await act(() => Store.create(d), "Appointment added"))) { b.disabled = false; b.textContent = "Save appointment"; }
    };
  }

  /* ---------- CAREER OPENINGS (admin) ---------- */
  async function renderJobs() {
    const body = document.getElementById("st-body");
    if (!LIVE) {
      body.innerHTML = `<div class="st-panel"><h4>Career openings</h4><p class="st-sub">Connect the Google Sheet first — then openings you add here appear on the Careers page instantly. Until then, openings can be edited in <code>content/8-careers.js</code>.</p></div>`;
      return;
    }
    body.innerHTML = `<div class="st-loading">Loading openings…</div>`;
    try { await Store.jobs(); } catch (e) { if (e.message !== "relogin") body.innerHTML = `<div class="st-loading">⚠️ ${esc(e.message)}</div>`; return; }
    body.innerHTML = `
      <div class="st-panel">
        <div class="st-toolbar"><h4 style="margin:0">Career openings <small class="st-sub">(shown on the Careers page)</small></h4>
          <button class="btn btn-sm" id="st-job-new">＋ Add opening</button></div>
        ${JOBS.length ? `<div class="st-jobs">${JOBS.map(j => `
          <div class="st-job ${j.active ? "" : "off"}">
            <div><b>${esc(j.title)}</b> ${j.active ? `<span class="st-badge s-confirmed">Live</span>` : `<span class="st-badge s-cancelled">Hidden</span>`}
              <small>${esc(j.type)}</small><p>${esc(j.text)}</p></div>
            <div class="st-job-btns">
              <button class="btn btn-sm btn-outline" data-edit="${esc(j.id)}">✏️ Edit</button>
              <button class="btn btn-sm btn-outline" data-toggle="${esc(j.id)}">${j.active ? "🙈 Hide" : "👁 Show"}</button>
              <button class="btn btn-sm st-del" data-del="${esc(j.id)}">🗑 Remove</button>
            </div>
          </div>`).join("")}</div>`
          : `<div class="st-empty">No openings yet. The Careers page shows “No openings right now” with a general application form.</div>`}
      </div>`;
    document.getElementById("st-job-new").onclick = () => jobForm();
    body.querySelectorAll("[data-edit]").forEach(b => b.onclick = () => jobForm(JOBS.find(j => j.id === b.dataset.edit)));
    body.querySelectorAll("[data-toggle]").forEach(b => b.onclick = async () => {
      const j = JOBS.find(x => x.id === b.dataset.toggle); b.disabled = true;
      try { await Store.jobSave(Object.assign({}, j, { active: !j.active })); toast(j.active ? "Hidden from Careers page" : "Shown on Careers page"); renderJobs(); } catch (e) { toast("⚠️ " + e.message, true); b.disabled = false; }
    });
    body.querySelectorAll("[data-del]").forEach(b => b.onclick = async () => {
      if (!b.dataset.sure) { b.dataset.sure = 1; b.textContent = "Tap again"; return; }
      b.disabled = true;
      try { await Store.jobDelete(b.dataset.del); toast("Opening removed"); renderJobs(); } catch (e) { toast("⚠️ " + e.message, true); }
    });
  }

  function jobForm(j) {
    j = j || { title: "", type: "", text: "", active: true };
    const m = document.getElementById("st-modal");
    m.innerHTML = `
      <div class="st-overlay" id="st-ov">
        <div class="st-drawer">
          <button class="st-x" id="st-close">✕</button>
          <div class="st-kicker">Career opening</div>
          <h3>${j.id ? "Edit opening" : "Add a new opening"}</h3>
          <form id="st-job-form" class="st-form">
            <label>Job title *<input name="title" required value="${esc(j.title)}" placeholder="e.g. Counselling Psychologist"></label>
            <label>Type & location<input name="type" value="${esc(j.type)}" placeholder="e.g. Full-time · Chinchwad"></label>
            <label>Description<textarea name="text" rows="4" placeholder="Qualifications, responsibilities…">${esc(j.text)}</textarea></label>
            <label class="st-check"><input type="checkbox" name="active" ${j.active ? "checked" : ""}> Show on the Careers page</label>
            <button class="btn" type="submit" style="width:100%" id="st-job-save">Save opening</button>
          </form>
        </div>
      </div>`;
    const close = () => { m.innerHTML = ""; };
    document.getElementById("st-close").onclick = close;
    document.getElementById("st-ov").onclick = e => { if (e.target.id === "st-ov") close(); };
    document.getElementById("st-job-form").onsubmit = async e => {
      e.preventDefault(); const f = e.target, b = document.getElementById("st-job-save");
      b.disabled = true; b.textContent = "Saving…";
      try {
        await Store.jobSave({ id: j.id, title: f.title.value.trim(), type: f.type.value.trim(), text: f.text.value.trim(), active: f.active.checked });
        close(); toast("Opening saved — it's on the Careers page now"); renderJobs();
      } catch (err) { toast("⚠️ " + err.message, true); b.disabled = false; b.textContent = "Save opening"; }
    };
  }

  /* ---------- CSV export (admin) ---------- */
  function exportCSV() {
    const cols = ["date", "time", "timeWindow", "name", "phone", "email", "service", "doctor", "mode", "branch", "status", "source", "message", "created"];
    const rows = [cols.join(",")].concat(DATA.map(a => cols.map(c => `"${String(a[c] == null ? "" : a[c]).replace(/"/g, '""')}"`).join(",")));
    const blob = new Blob(["﻿" + rows.join("\n")], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob); link.download = "healing-mind-appointments-" + today() + ".csv";
    document.body.appendChild(link); link.click(); link.remove();
  }

  /* ---------- start ---------- */
  const validSession = user && (LIVE ? !!user.token : !!LOCAL_ACCOUNTS[user.username]);
  if (validSession) start(); else { ss.clear(); user = null; renderLogin(); }
})();
