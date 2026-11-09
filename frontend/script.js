/* Mindcheck — app logic. Vanilla JS, hash routing, data kept in localStorage only. */
(() => {
  "use strict";

  /* ---------- storage ---------- */
  const KEY = "mindcheck:v1";
  const DEFAULTS = { lang: "mn", theme: "system", name: "", history: [], mood: [], progress: {}, reminder: "", reminderDismissed: "" };
  const load = () => {
    try { return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
    catch { return { ...DEFAULTS }; }
  };
  let S = load();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* storage blocked: stay in memory */ } };

  /* ---------- helpers ---------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const dk = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const L = (o) => o[S.lang] ?? o.mn;
  const t = (k, v) => {
    let s = (I18N[S.lang] && I18N[S.lang][k]) ?? I18N.mn[k] ?? k;
    if (v) for (const n in v) s = s.split("{" + n + "}").join(v[n]);
    return s;
  };
  const ic = (n, c = "") => `<svg class="ic ${c}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#i-${n}"/></svg>`;
  const fmtDate = (ts) => new Date(ts).toLocaleDateString(S.lang === "mn" ? "mn-MN" : "en-US", { year: "numeric", month: "short", day: "numeric" });
  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const homeView = $("#view-home");
  const dyn = $("#view-dyn");

  function hydrate(root = document) {
    $$("[data-ic]", root).forEach((el) => { if (!el.firstChild) el.innerHTML = ic(el.dataset.ic, el.dataset.grad ? "grad" : ""); });
  }

  let toastTimer;
  function toast(msg, type = "ok") {
    const el = $("#toast");
    el.innerHTML = `${ic(type === "ok" ? "success" : "error")}<span>${esc(msg)}</span>`;
    el.className = "toast show " + type;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }

  /* ---------- i18n + theme ---------- */
  function applyI18n() {
    document.documentElement.lang = S.lang;
    document.title = t("site_title");
    $$("[data-i18n]").forEach((e) => (e.textContent = t(e.dataset.i18n)));
    $$("[data-i18n-html]").forEach((e) => (e.innerHTML = t(e.dataset.i18nHtml)));
    $$("[data-i18n-aria]").forEach((e) => e.setAttribute("aria-label", t(e.dataset.i18nAria)));
    $("#langLabel").textContent = t("lang_btn");
    const open = $("#navLinks").classList.contains("open");
    $("#menuToggle").setAttribute("aria-label", t(open ? "menu_close" : "menu_open"));
    $("#moodRow").setAttribute("aria-label", t("ck_title"));
    $("#breatheToggleTxt").textContent = t(bRun ? "rx_stop" : "rx_btn");
    if (!bRun) { $("#breatheLabel").textContent = t("rx_ready"); }
  }

  const darkMQ = matchMedia("(prefers-color-scheme: dark)");
  function applyTheme() {
    const dark = S.theme === "dark" || (S.theme === "system" && darkMQ.matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }
  darkMQ.addEventListener?.("change", applyTheme);

  /* ---------- scoring ---------- */
  function scoreTest(id, ans) {
    const T = TESTS[id];
    if (id === "mental") {
      const main = T.questions.slice(0, 9);
      const raw = main.reduce((s, q, i) => s + (ans[i] || 0), 0);
      const max = 36;
      const band = raw <= 8 ? "good" : raw <= 17 ? "mild" : raw <= 26 ? "moderate" : "high";
      const acc = {};
      main.forEach((q, i) => { acc[q.cat] ??= { s: 0, n: 0 }; acc[q.cat].s += ans[i] || 0; acc[q.cat].n += 4; });
      const cats = {};
      for (const k in acc) cats[k] = Math.round((1 - acc[k].s / acc[k].n) * 100);
      return { raw, max, pct: Math.round((1 - raw / max) * 100), band, cats, safety: (ans[9] || 0) > 0 };
    }
    const acc = {};
    let raw = 0;
    T.questions.forEach((q, i) => {
      acc[q.cat] ??= { c: 0, n: 0 };
      acc[q.cat].n++;
      if (ans[i] === q.a) { raw++; acc[q.cat].c++; }
    });
    const cats = {};
    for (const k in acc) cats[k] = Math.round((acc[k].c / acc[k].n) * 100);
    const max = T.questions.length;
    const band = raw <= 3 ? "dev" : raw <= 6 ? "avg" : raw <= 9 ? "above" : "high";
    return { raw, max, pct: Math.round((raw / max) * 100), band, cats, safety: false };
  }
  const TONES = { mental: { good: "pos", mild: "mid", moderate: "warn", high: "bad" }, iq: { dev: "warn", avg: "mid", above: "pos", high: "pos" } };
  const tone = (r) => TONES[r.test][r.band];
  const scoreLine = (r) => (r.test === "mental" ? `${t("r_wellbeing")}: ${r.pct}%` : `${t("r_reasoning")}: ${r.raw}/${r.max}`);

  const NEXT_STEPS = {
    mental: {
      good: [["n_mental_relax", "relax", "breathe"], ["n_mental_walk", "wellness"], ["n_mental_retake", "calendar"]],
      mild: [["n_mental_relax", "relax", "breathe"], ["n_mental_sleep", "self-care"], ["n_mental_walk", "wellness"], ["n_mental_retake", "calendar"]],
      moderate: [["n_mental_talk", "support"], ["n_mental_pro", "heart"], ["n_mental_sleep", "self-care"], ["n_mental_relax", "relax", "breathe"]],
      high: [["n_mental_pro", "heart"], ["n_mental_talk", "support"], ["n_mental_relax", "relax", "breathe"], ["n_mental_sleep", "self-care"]]
    },
    iq: {
      dev: [["n_iq_practice", "growth"], ["n_iq_slow", "brain"], ["n_iq_retake", "calendar"]],
      avg: [["n_iq_practice", "growth"], ["n_iq_slow", "brain"], ["n_iq_retake", "calendar"]],
      above: [["n_iq_challenge", "growth"], ["n_iq_retake", "calendar"]],
      high: [["n_iq_challenge", "growth"], ["n_iq_retake", "calendar"]]
    }
  };

  /* ---------- router ---------- */
  let timer = null, keyH = null, cur = null;
  function cleanup() {
    clearInterval(timer); timer = null;
    if (keyH) { document.removeEventListener("keydown", keyH); keyH = null; }
    cur = null;
  }
  const go = (p) => { location.hash = "#" + p; };
  const setActive = (name) => $$("[data-route]").forEach((a) => a.classList.toggle("active", a.dataset.route === name));

  function route() {
    cleanup();
    closeMenu();
    const h = location.hash;
    if (!h.startsWith("#/")) return showHome(h.slice(1));
    const [name, arg] = h.slice(2).split("/").filter(Boolean);
    if (!name) return showHome();
    const views = { test: () => viewTest(arg), result: () => viewResult(arg), history: viewHistory, profile: viewProfile, settings: viewSettings, faq: viewFaq };
    homeView.hidden = true; dyn.hidden = false;
    (views[name] || view404)();
    hydrate(dyn);
    setActive(name);
    window.scrollTo(0, 0);
  }

  function showHome(anchor) {
    dyn.hidden = true; homeView.hidden = false;
    setActive("home");
    renderHome();
    requestAnimationFrame(() => {
      const el = anchor && document.getElementById(anchor);
      if (el) el.scrollIntoView(); else window.scrollTo(0, 0);
    });
  }

  function view404() {
    dyn.innerHTML = `<section class="page container narrow"><div class="card center"><h1>${t("nf_title")}</h1><p class="lead">${t("nf_text")}</p><a class="button button-primary" href="#/">${t("go_home")}</a></div></section>`;
  }

  /* ---------- home ---------- */
  const MOODS = [1, 2, 3, 4, 5];
  function renderHome() {
    const mp = S.progress.mental, ip = S.progress.iq;
    $("#mentalCta").textContent = t(mp ? "btn_resume" : "btn_start");
    $("#iqCta").textContent = t(ip ? "btn_resume" : "btn_start");

    const today = (S.mood.find((m) => m.d === dk()) || {}).v;
    $("#moodRow").innerHTML = MOODS.map((v) =>
      `<button type="button" role="radio" aria-checked="${today === v}" class="mood-btn m${v}${today === v ? " on" : ""}" data-mood="${v}"><span class="mood-num">${v}</span><span class="mood-lbl">${t("m" + v)}</span></button>`).join("");

    const days = [];
    for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
    const wd = t("weekdays").split(",");
    const bars = days.map((d) => {
      const e = S.mood.find((m) => m.d === dk(d));
      return `<div class="wk"><div class="wk-bar"><i class="m${e ? e.v : 0}" style="height:${e ? e.v * 20 : 6}%"></i></div><span>${wd[d.getDay()]}</span></div>`;
    }).join("");
    $("#moodWeek").innerHTML = `<div class="wk-title">${t("ck_last7")}</div><div class="wk-row">${bars}</div>`;

    const slot = $("#reminderSlot");
    if (S.reminder && S.reminder <= dk() && S.reminderDismissed !== S.reminder) {
      slot.innerHTML = `<div class="reminder container">${ic("notifications")}<span>${t("reminder_banner")}</span><a class="text-link" href="#assessments">${t("nav_tests")}</a><button class="icon-btn" type="button" id="remDismiss" aria-label="${t("reminder_dismiss")}">${ic("cancel")}</button></div>`;
    } else slot.innerHTML = "";
    hydrate(homeView);
  }

  $("#moodRow").addEventListener("click", (e) => {
    const b = e.target.closest("[data-mood]");
    if (!b) return;
    const v = +b.dataset.mood;
    S.mood = S.mood.filter((m) => m.d !== dk()).concat({ d: dk(), v }).sort((a, b2) => a.d.localeCompare(b2.d)).slice(-365);
    save(); renderHome();
    toast(t("ck_saved"));
    $("#moodRow .on")?.focus();
  });
  $("#reminderSlot").addEventListener("click", (e) => {
    if (e.target.closest("#remDismiss")) { S.reminderDismissed = S.reminder; save(); renderHome(); }
  });

  /* ---------- test runner ---------- */
  function viewTest(id) {
    const T = TESTS[id];
    if (!T) return view404();
    const saved = S.progress[id];
    const n = T.questions.length;
    dyn.innerHTML = `<section class="page container narrow">
      <a class="back-link" href="#/">${ic("back")} ${t("go_home")}</a>
      <div class="card intro">
        <span class="intro-icon">${ic(T.icon, "grad")}</span>
        <div class="eyebrow">${t("t_about")}</div>
        <h1>${t(id + "_title")}</h1>
        <p class="lead">${t(id + "_intro")}</p>
        <ul class="facts">
          <li>${ic("tests")} ${t("t_questions", { n })}</li>
          <li>${ic("history")} ${t("t_minutes", { n: T.minutes })}</li>
          <li>${ic("privacy")} ${t("t_private")}</li>
        </ul>
        ${saved ? `<div class="notice">${ic("info")} <span>${t("t_saved_progress", { a: saved.answers.filter((x) => x != null).length, b: n })}</span></div>` : ""}
        <div class="actions">
          ${saved
            ? `<button class="button button-primary" id="resumeBtn" type="button">${ic("play")} ${t("btn_resume")}</button><button class="button button-ghost" id="restartBtn" type="button">${ic("history")} ${t("t_restart")}</button>`
            : `<button class="button button-primary" id="startBtn" type="button">${ic("play")} ${t("btn_start")}</button>`}
        </div>
        <p class="fine">${t("r_disclaimer")}</p>
      </div></section>`;
    const run = (resume) => startRun(id, resume);
    $("#startBtn")?.addEventListener("click", () => run(false));
    $("#resumeBtn")?.addEventListener("click", () => run(true));
    $("#restartBtn")?.addEventListener("click", () => run(false));
  }

  function persist() {
    S.progress[cur.id] = { answers: cur.answers, idx: cur.idx, start: cur.start };
    save();
  }

  function startRun(id, resume) {
    const T = TESTS[id], n = T.questions.length;
    const p = S.progress[id];
    cur = resume && p ? { id, answers: p.answers, idx: Math.min(p.idx, n - 1), start: p.start } : { id, answers: Array(n).fill(null), idx: 0, start: Date.now() };
    cur.deadline = T.timeLimit ? cur.start + T.timeLimit * 1000 : null;
    persist();
    if (cur.deadline && Date.now() >= cur.deadline) return finish(true);
    if (cur.deadline) timer = setInterval(tick, 1000);
    keyH = onKey;
    document.addEventListener("keydown", keyH);
    renderQ();
  }

  function tick() {
    const left = Math.max(0, Math.round((cur.deadline - Date.now()) / 1000));
    const el = $("#timeLeft");
    if (el) { el.textContent = fmtTime(left); el.parentElement.classList.toggle("low", left <= 60); }
    if (left <= 0) finish(true);
  }

  function renderQ() {
    const T = TESTS[cur.id], n = T.questions.length, i = cur.idx, q = T.questions[i];
    const opts = T.scale ? [0, 1, 2, 3, 4].map((v) => t("sc" + v)) : L(q.o);
    const sel = cur.answers[i];
    const canNext = T.scale ? sel != null : true;
    const last = i === n - 1;
    const left = cur.deadline ? Math.max(0, Math.round((cur.deadline - Date.now()) / 1000)) : null;
    dyn.innerHTML = `<section class="page container narrow">
      <div class="card quiz">
        <div class="quiz-top">
          <span class="quiz-count">${t("t_progress", { a: i + 1, b: n })}</span>
          ${left != null ? `<span class="quiz-timer${left <= 60 ? " low" : ""}">${ic("history")} ${t("t_time_left")}: <b id="timeLeft">${fmtTime(left)}</b></span>` : ""}
        </div>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${n}" aria-valuenow="${i + 1}"><i style="width:${((i + 1) / n) * 100}%"></i></div>
        <h2 class="quiz-q">${T.scale ? `<small>${esc(t("mental_stem"))}</small>` : ""}${esc(L(q.q))}</h2>
        <div class="options${T.scale ? " scale" : ""}" role="radiogroup" aria-label="${esc(L(q.q))}">
          ${opts.map((o, k) => `<button type="button" role="radio" aria-checked="${sel === k}" class="option${sel === k ? " on" : ""}" data-opt="${k}"><span class="key">${k + 1}</span><span>${esc(o)}</span>${sel === k ? ic("confirm") : ""}</button>`).join("")}
        </div>
        <div class="quiz-nav">
          <button class="button button-ghost" id="qBack" type="button" ${i === 0 ? "disabled" : ""}>${ic("back")} ${t("t_back")}</button>
          <button class="button button-primary" id="qNext" type="button" ${canNext ? "" : "disabled"}>${last ? t("t_finish") : t("t_next")} ${ic(last ? "confirm" : "next")}</button>
        </div>
        <div class="quiz-foot"><a class="text-link" href="#/">${ic("cancel")} ${t("t_cancel")}</a><span class="fine">${t("t_hint_keys", { n: opts.length })}</span></div>
      </div></section>`;
    $(".options").addEventListener("click", (e) => { const b = e.target.closest("[data-opt]"); if (b) choose(+b.dataset.opt); });
    $("#qBack").addEventListener("click", back);
    $("#qNext").addEventListener("click", next);
  }

  function choose(k) {
    cur.answers[cur.idx] = k; persist(); renderQ();
    $(".option.on")?.focus();
  }
  function next() {
    const T = TESTS[cur.id];
    if (T.scale && cur.answers[cur.idx] == null) return;
    if (cur.idx === T.questions.length - 1) return finish(false);
    cur.idx++; persist(); renderQ(); window.scrollTo(0, 0);
  }
  function back() { if (cur.idx > 0) { cur.idx--; persist(); renderQ(); window.scrollTo(0, 0); } }
  function onKey(e) {
    if (!cur || e.target.closest("input,textarea,select")) return;
    const T = TESTS[cur.id], max = T.scale ? 5 : L(T.questions[cur.idx].o).length;
    if (/^[1-9]$/.test(e.key) && +e.key <= max) choose(+e.key - 1);
    else if (e.key === "ArrowRight") next();
    else if (e.key === "ArrowLeft") back();
  }

  function finish(timeUp) {
    const T = TESTS[cur.id];
    const res = scoreTest(cur.id, cur.answers);
    const rec = { id: uid(), test: cur.id, date: Date.now(), answers: cur.answers, lang: S.lang, fav: false, duration: Math.round((Date.now() - cur.start) / 1000), ...res };
    S.history.unshift(rec);
    delete S.progress[cur.id];
    save();
    cleanup();
    go("/result/" + rec.id);
    if (timeUp && T.timeLimit) toast(t("t_time_up"), "err");
  }

  /* ---------- result ---------- */
  function summaryText(r) {
    const lines = [`Mindcheck — ${t(r.test + "_title")}`, fmtDate(r.date), "", scoreLine(r), t(`b_${r.test}_${r.band}`), ""];
    lines.push(t("r_breakdown") + ":");
    for (const k in r.cats) lines.push(`• ${t("cat_" + k)}: ${r.cats[k]}%`);
    lines.push("", t(`d_${r.test}_${r.band}`), "", t("r_disclaimer"));
    return lines.join("\n");
  }

  function viewResult(id) {
    const r = S.history.find((x) => x.id === id);
    if (!r) {
      dyn.innerHTML = `<section class="page container narrow"><div class="card center"><h1>${t("r_not_found")}</h1><a class="button button-primary" href="#/history">${ic("history")} ${t("r_back_hist")}</a></div></section>`;
      return;
    }
    const tn = tone(r);
    const C = 2 * Math.PI * 52;
    const big = r.test === "mental" ? `${r.pct}<small>%</small>` : `${r.raw}<small>/${r.max}</small>`;
    const bars = Object.keys(r.cats).map((k) => `<div class="bar-row"><div class="bar-top"><span>${t("cat_" + k)}</span><b>${r.cats[k]}%</b></div><div class="bar"><i style="width:${r.cats[k]}%"></i></div></div>`).join("");
    const steps = (NEXT_STEPS[r.test][r.band] || []).map(([key, icon, act]) =>
      act ? `<li><button type="button" class="step-act" data-act="${act}">${ic(icon, "grad")}<span>${t(key)}</span>${ic("next")}</button></li>` : `<li><span class="step-act static">${ic(icon, "grad")}<span>${t(key)}</span></span></li>`).join("");
    const d = r.duration || 0;
    dyn.innerHTML = `<section class="page container">
      <a class="back-link" href="#/history">${ic("back")} ${t("nav_history")}</a>
      <div class="result-head">
        <div><div class="eyebrow">${t("r_title")} · ${fmtDate(r.date)}</div><h1>${t(r.test + "_title")}</h1></div>
        <div class="result-actions">
          <button class="icon-btn${r.fav ? " fav-on" : ""}" type="button" id="favBtn" aria-pressed="${!!r.fav}" aria-label="${t(r.fav ? "r_unfav" : "r_fav")}">${ic("favorite")}</button>
          <button class="icon-btn" type="button" id="copyBtn" aria-label="${t("r_copy")}">${ic("copy")}</button>
          <button class="icon-btn" type="button" id="dlBtn" aria-label="${t("r_download")}">${ic("download")}</button>
          <button class="icon-btn" type="button" id="shareBtn" aria-label="${t("r_share")}">${ic("share")}</button>
          <button class="icon-btn danger" type="button" id="delBtn" aria-label="${t("r_delete")}">${ic("delete")}</button>
        </div>
      </div>
      ${r.safety ? `<div class="crisis" role="alert">${ic("warning")}<div><h2>${t("crisis_title")}</h2><p>${t("crisis_text")}</p></div></div>` : ""}
      <div class="result-grid">
        <div class="card score-card tone-${tn}">
          <div class="ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle class="ring-bg" cx="60" cy="60" r="52"/><circle class="ring-fg" cx="60" cy="60" r="52" stroke-dasharray="${(C * r.pct) / 100} ${C}" transform="rotate(-90 60 60)"/></svg><div class="ring-num">${big}</div></div>
          <span class="badge">${t(`b_${r.test}_${r.band}`)}</span>
          <p>${t(`d_${r.test}_${r.band}`)}</p>
          ${d ? `<p class="fine">${t("r_time", { m: Math.floor(d / 60), s: d % 60 })}</p>` : ""}
          ${r.test === "iq" ? `<p class="fine">${t("iq_note")}</p>` : ""}
        </div>
        <div class="card"><h2 class="h3">${ic("results", "grad")} ${t("r_breakdown")}</h2>${bars}</div>
        <div class="card span2"><h2 class="h3">${ic("growth", "grad")} ${t("r_next")}</h2><ul class="steps-list">${steps}</ul></div>
      </div>
      <p class="fine center">${ic("info")} ${t("r_disclaimer")}</p>
      <div class="actions center"><a class="button button-primary" href="#/test/${r.test}">${ic("history")} ${t("r_retake")}</a><a class="button button-ghost" href="#/history">${ic("results")} ${t("nav_history")}</a></div>
    </section>`;

    $("#favBtn").addEventListener("click", () => { r.fav = !r.fav; save(); viewResult(id); hydrate(dyn); });
    $("#copyBtn").addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(summaryText(r)); toast(t("r_copied")); } catch { toast("—", "err"); }
    });
    $("#dlBtn").addEventListener("click", () => download(`mindcheck-${r.test}-${dk(new Date(r.date))}.txt`, summaryText(r), "text/plain"));
    $("#shareBtn").addEventListener("click", async () => {
      try {
        if (navigator.share) await navigator.share({ title: "Mindcheck", text: summaryText(r) });
        else { await navigator.clipboard.writeText(summaryText(r)); toast(t("r_copied")); }
      } catch { /* share dismissed */ }
    });
    $("#delBtn").addEventListener("click", () => {
      if (!confirm(t("r_confirm_delete"))) return;
      S.history = S.history.filter((x) => x.id !== id); save(); go("/history");
    });
    $$("[data-act=breathe]", dyn).forEach((b) => b.addEventListener("click", openBreathe));
  }

  function download(name, text, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: type + ";charset=utf-8" }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------- history ---------- */
  const hist = { q: "", filter: "all", sort: "new" };
  function viewHistory() {
    dyn.innerHTML = `<section class="page container">
      <div class="page-head"><div><h1>${t("h_title")}</h1><p class="lead">${t("h_text")}</p></div></div>
      <div class="toolbar">
        <label class="search">${ic("search")}<input type="search" id="hQ" placeholder="${t("h_search")}" value="${esc(hist.q)}" aria-label="${t("h_search")}"></label>
        <div class="seg" role="group">
          <button type="button" data-f="all" class="${hist.filter === "all" ? "on" : ""}">${t("h_all")}</button>
          <button type="button" data-f="mental" class="${hist.filter === "mental" ? "on" : ""}">${ic("brain")} ${t("mental_title")}</button>
          <button type="button" data-f="iq" class="${hist.filter === "iq" ? "on" : ""}">${ic("tests")} ${t("iq_title")}</button>
          <button type="button" data-f="fav" class="${hist.filter === "fav" ? "on" : ""}">${ic("favorite")} ${t("h_fav")}</button>
        </div>
        <label class="select">${ic("sort")}<select id="hSort" aria-label="${t("h_sort_new")}">
          <option value="new"${hist.sort === "new" ? " selected" : ""}>${t("h_sort_new")}</option>
          <option value="old"${hist.sort === "old" ? " selected" : ""}>${t("h_sort_old")}</option>
          <option value="high"${hist.sort === "high" ? " selected" : ""}>${t("h_sort_high")}</option></select></label>
      </div>
      <div id="hList"></div>
      <h2 class="h3 mt2">${ic("mood", "grad")} ${t("h_mood")}</h2>
      <div class="card" id="hMood"></div>
    </section>`;
    const draw = () => {
      let rows = S.history.filter((r) => (hist.filter === "all" ? true : hist.filter === "fav" ? r.fav : r.test === hist.filter));
      if (hist.q.trim()) { const q = hist.q.trim().toLowerCase(); rows = rows.filter((r) => t(r.test + "_title").toLowerCase().includes(q) || t(`b_${r.test}_${r.band}`).toLowerCase().includes(q)); }
      rows.sort((a, b) => hist.sort === "old" ? a.date - b.date : hist.sort === "high" ? b.pct - a.pct : b.date - a.date);
      $("#hList").innerHTML = rows.length ? `<div class="hist-list">${rows.map((r) => `
        <article class="hist-item tone-${tone(r)}">
          <span class="hist-ic">${ic(TESTS[r.test].icon, "grad")}</span>
          <div class="hist-main"><a class="hist-title" href="#/result/${r.id}">${t(r.test + "_title")}</a><div class="hist-sub">${ic("calendar")} ${fmtDate(r.date)} · <span class="badge sm">${t(`b_${r.test}_${r.band}`)}</span></div></div>
          <div class="hist-score">${r.test === "mental" ? r.pct + "%" : r.raw + "/" + r.max}</div>
          <button class="icon-btn${r.fav ? " fav-on" : ""}" type="button" data-fav="${r.id}" aria-pressed="${!!r.fav}" aria-label="${t(r.fav ? "r_unfav" : "r_fav")}">${ic("favorite")}</button>
          <button class="icon-btn danger" type="button" data-del="${r.id}" aria-label="${t("r_delete")}">${ic("delete")}</button>
        </article>`).join("")}</div>`
        : `<div class="card center empty">${ic("results", "grad big")}<p>${t(S.history.length ? "h_none_match" : "h_empty")}</p>${S.history.length ? "" : `<a class="button button-primary" href="#assessments">${t("nav_tests")}</a>`}</div>`;
    };
    draw();
    const entries = S.mood.slice(-14);
    $("#hMood").innerHTML = entries.length
      ? `<div class="wk-row long">${entries.map((e) => `<div class="wk" title="${e.d}: ${t("m" + e.v)}"><div class="wk-bar"><i class="m${e.v}" style="height:${e.v * 20}%"></i></div><span>${e.d.slice(5)}</span></div>`).join("")}</div>`
      : `<p class="fine">${t("h_mood_empty")}</p>`;

    $("#hQ").addEventListener("input", (e) => { hist.q = e.target.value; draw(); hydrate(dyn); });
    $("#hSort").addEventListener("change", (e) => { hist.sort = e.target.value; draw(); hydrate(dyn); });
    $$(".seg button", dyn).forEach((b) => b.addEventListener("click", () => { hist.filter = b.dataset.f; viewHistory(); hydrate(dyn); }));
    $("#hList").addEventListener("click", (e) => {
      const f = e.target.closest("[data-fav]"), d = e.target.closest("[data-del]");
      if (f) { const r = S.history.find((x) => x.id === f.dataset.fav); r.fav = !r.fav; save(); draw(); hydrate(dyn); }
      if (d && confirm(t("r_confirm_delete"))) { S.history = S.history.filter((x) => x.id !== d.dataset.del); save(); draw(); hydrate(dyn); }
    });
  }

  /* ---------- profile ---------- */
  function viewProfile() {
    const favs = S.history.filter((r) => r.fav).length;
    dyn.innerHTML = `<section class="page container narrow">
      <div class="page-head"><div><h1>${S.name ? t("p_hello", { n: esc(S.name) }) : t("p_hello_anon")}</h1><p class="lead">${t("p_title")}</p></div><span class="avatar">${ic("profile", "grad")}</span></div>
      <div class="stats">
        <div class="stat">${ic("tests", "grad")}<b>${S.history.length}</b><span>${t("p_tests_done")}</span></div>
        <div class="stat">${ic("mood", "grad")}<b>${S.mood.length}</b><span>${t("p_checkins")}</span></div>
        <div class="stat">${ic("favorite", "grad")}<b>${favs}</b><span>${t("p_favs")}</span></div>
      </div>
      <form class="card" id="nameForm">
        <label class="field"><span>${t("p_name")}</span><input type="text" id="nameIn" maxlength="40" value="${esc(S.name)}" placeholder="${t("p_name_ph")}" autocomplete="given-name"></label>
        <button class="button button-primary" type="submit">${ic("confirm")} ${t("p_save")}</button>
      </form>
      <div class="card">
        <h2 class="h3">${ic("security", "grad")} ${t("p_data")}</h2>
        <p class="fine">${t("priv_text")}</p>
        <div class="actions">
          <button class="button button-ghost" type="button" id="exportBtn">${ic("download")} ${t("p_export")}</button>
          <button class="button button-danger" type="button" id="wipeBtn">${ic("delete")} ${t("p_wipe")}</button>
        </div>
      </div></section>`;
    $("#nameForm").addEventListener("submit", (e) => { e.preventDefault(); S.name = $("#nameIn").value.trim(); save(); viewProfile(); hydrate(dyn); toast(t("p_saved")); });
    $("#exportBtn").addEventListener("click", () => download(`mindcheck-data-${dk()}.json`, JSON.stringify(S, null, 2), "application/json"));
    $("#wipeBtn").addEventListener("click", () => {
      if (!confirm(t("p_wipe_confirm"))) return;
      const keep = { lang: S.lang, theme: S.theme };
      S = { ...DEFAULTS, ...keep }; save(); viewProfile(); hydrate(dyn); toast(t("p_wiped"));
    });
  }

  /* ---------- settings ---------- */
  function viewSettings() {
    const chip = (grp, val, label, cur2, icon) => `<button type="button" class="chip${cur2 === val ? " on" : ""}" role="radio" aria-checked="${cur2 === val}" data-${grp}="${val}">${icon ? ic(icon) : ""} ${label}</button>`;
    dyn.innerHTML = `<section class="page container narrow">
      <div class="page-head"><div><h1>${t("s_title")}</h1></div></div>
      <div class="card"><h2 class="h3">${ic("language", "grad")} ${t("s_language")}</h2>
        <div class="chips" role="radiogroup">${chip("lang", "mn", "Монгол", S.lang)}${chip("lang", "en", "English", S.lang)}</div></div>
      <div class="card"><h2 class="h3">${ic("dark-mode", "grad")} ${t("s_theme")}</h2>
        <div class="chips" role="radiogroup">${chip("theme", "light", t("s_light"), S.theme)}${chip("theme", "dark", t("s_dark"), S.theme)}${chip("theme", "system", t("s_system"), S.theme)}</div></div>
      <div class="card"><h2 class="h3">${ic("notifications", "grad")} ${t("s_reminder")}</h2>
        <p class="fine">${t("s_reminder_text")}</p>
        <label class="field"><span class="sr">${t("s_reminder")}</span><span class="date-wrap">${ic("calendar")}<input type="date" id="remIn" value="${esc(S.reminder)}" min="${dk()}"></span></label>
        <button class="button button-ghost" type="button" id="remClear">${ic("cancel")} ${t("s_reminder_clear")}</button></div>
    </section>`;
    $$("[data-lang]", dyn).forEach((b) => b.addEventListener("click", () => { S.lang = b.dataset.lang; save(); applyI18n(); route(); }));
    $$("[data-theme]", dyn).forEach((b) => b.addEventListener("click", () => { S.theme = b.dataset.theme; save(); applyTheme(); viewSettings(); hydrate(dyn); }));
    $("#remIn").addEventListener("change", (e) => { S.reminder = e.target.value; S.reminderDismissed = ""; save(); toast(t("s_reminder_set")); });
    $("#remClear").addEventListener("click", () => { S.reminder = ""; save(); $("#remIn").value = ""; });
  }

  /* ---------- faq ---------- */
  function viewFaq() {
    dyn.innerHTML = `<section class="page container narrow">
      <div class="page-head"><div><h1>${t("faq_title")}</h1><p class="lead">${t("faq_text")}</p></div></div>
      <div class="faq">${[1, 2, 3, 4, 5, 6].map((n) => `<details><summary>${ic("faq", "grad")}<span>${t("faq" + n + "_q")}</span>${ic("add", "plus")}</summary><p>${t("faq" + n + "_a")}</p></details>`).join("")}</div>
    </section>`;
  }

  /* ---------- breathing dialog ---------- */
  const dlg = $("#breatheDlg"), circle = $("#breatheCircle");
  const PHASES = [{ k: "rx_in", s: 4, sc: 1 }, { k: "rx_hold", s: 4, sc: 1 }, { k: "rx_out", s: 6, sc: 0.55 }];
  let bRun = false, bTimer = null, bStep = 0, bCycles = 0;
  const calm = matchMedia("(prefers-reduced-motion: reduce)");

  function bPhase() {
    const p = PHASES[bStep];
    $("#breatheLabel").textContent = t(p.k);
    circle.style.transition = calm.matches ? "none" : `transform ${p.s}s ease-in-out`;
    circle.style.transform = `scale(${p.sc})`;
    bTimer = setTimeout(() => {
      bStep = (bStep + 1) % PHASES.length;
      if (bStep === 0) { bCycles++; $("#breatheMeta").textContent = t("rx_cycles", { n: bCycles }); }
      bPhase();
    }, p.s * 1000);
  }
  function bStart() {
    bRun = true; bStep = 0; bCycles = 0;
    $("#breatheMeta").textContent = "";
    $("#breatheToggleTxt").textContent = t("rx_stop");
    $("#breatheToggle").firstElementChild.innerHTML = ic("cancel");
    bPhase();
  }
  function bStop() {
    bRun = false; clearTimeout(bTimer);
    circle.style.transition = "transform .6s ease"; circle.style.transform = "scale(.55)";
    $("#breatheLabel").textContent = t("rx_ready");
    $("#breatheToggleTxt").textContent = t("rx_btn");
    $("#breatheToggle").firstElementChild.innerHTML = ic("play");
  }
  function openBreathe() {
    bStop();
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }
  $("#breatheOpen").addEventListener("click", openBreathe);
  $("#breatheToggle").addEventListener("click", () => (bRun ? bStop() : bStart()));
  $("#breatheClose").addEventListener("click", () => dlg.close());
  dlg.addEventListener("close", bStop);
  dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });

  /* ---------- header controls ---------- */
  const menuToggle = $("#menuToggle"), navLinks = $("#navLinks");
  function closeMenu() {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", t("menu_open"));
    menuToggle.textContent = "☰";
  }
  menuToggle.addEventListener("click", () => {
    const open = navLinks.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", t(open ? "menu_close" : "menu_open"));
    menuToggle.textContent = open ? "×" : "☰";
  });
  navLinks.addEventListener("click", (e) => { if (e.target.closest("a")) closeMenu(); });

  $("#langBtn").addEventListener("click", () => { S.lang = S.lang === "mn" ? "en" : "mn"; save(); applyI18n(); route(); });
  $("#themeBtn").addEventListener("click", () => {
    const dark = document.documentElement.dataset.theme === "dark";
    S.theme = dark ? "light" : "dark"; save(); applyTheme();
    if (location.hash === "#/settings") viewSettings(), hydrate(dyn);
  });

  /* ---------- boot ---------- */
  hydrate();
  applyTheme();
  applyI18n();
  window.addEventListener("hashchange", route);
  route();
})();
