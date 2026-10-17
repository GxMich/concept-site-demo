/* ==========================================================
   CONCEPT — gestione consenso cookie
   Replica il comportamento del banner CookieYes del sito originale:
   box in basso, Personalizza / Rifiuta tutto / Accetta tutto,
   centro preferenze per categoria, pulsante per riaprirlo.
   Salva la scelta nel cookie "cookieyes-consent" (1 anno) e, se i cookie
   non sono disponibili (es. file://), in localStorage.
   ========================================================== */
(() => {
  "use strict";
  const CFG = window.CONCEPT_SITE.consent;
  const KEY = "cookieyes-consent";
  const CATS = CFG.categories;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const parse = (str) => Object.fromEntries(str.split(",").map((p) => p.split(":")));
  function read() {
    try {
      const m = document.cookie.match(/(?:^|; )cookieyes-consent=([^;]*)/);
      if (m) return parse(decodeURIComponent(m[1]));
    } catch (e) { /* ignora */ }
    try {
      const v = localStorage.getItem(KEY);
      if (v) return parse(v);
    } catch (e) { /* ignora */ }
    return null;
  }
  function write(choice) {
    const id = (read() || {}).consentid || Math.random().toString(36).slice(2, 12);
    const parts = [`consentid:${id}`, "consent:yes", "action:yes"];
    CATS.forEach((c) => parts.push(`${c.id}:${c.locked || choice[c.id] ? "yes" : "no"}`));
    const value = parts.join(",");
    try {
      document.cookie = `${KEY}=${encodeURIComponent(value)}; max-age=31536000; path=/; SameSite=Lax`;
    } catch (e) { /* ignora */ }
    try { localStorage.setItem(KEY, value); } catch (e) { /* ignora */ }
    return parse(value);
  }
  const toState = (raw) => raw && Object.fromEntries(CATS.map((c) => [c.id, c.locked || raw[c.id] === "yes"]));

  let state = toState(read());
  const listeners = [];
  function emit() {
    listeners.forEach((fn) => fn(state));
    document.dispatchEvent(new CustomEvent("concept:consent", { detail: state }));
  }

  /* ---------- DOM ---------- */
  const root = document.createElement("div");
  root.className = "cc-root";
  root.innerHTML = `
    <section class="cc-banner" role="dialog" aria-live="polite" aria-label="${esc(CFG.title)}" hidden>
      <h2 class="cc-title">${esc(CFG.title)}</h2>
      <p class="cc-text">${esc(CFG.text)}</p>
      <div class="cc-actions">
        <button type="button" class="cc-btn cc-ghost" data-cc="customize">${esc(CFG.customize)}</button>
        <button type="button" class="cc-btn cc-ghost" data-cc="reject">${esc(CFG.rejectAll)}</button>
        <button type="button" class="cc-btn cc-solid" data-cc="accept">${esc(CFG.acceptAll)}</button>
      </div>
    </section>

    <dialog class="cc-modal" aria-labelledby="cc-pref-title">
      <div class="cc-modal-head">
        <h2 id="cc-pref-title">${esc(CFG.prefTitle)}</h2>
        <button type="button" class="cc-close" data-cc="close" aria-label="Chiudi">×</button>
      </div>
      <div class="cc-modal-body">
        <div class="cc-intro">
          <p>${esc(CFG.prefIntro[0])}</p>
          <p>${esc(CFG.prefIntro[1])}<span class="cc-more" hidden> ${esc(CFG.prefMore)}</span><span class="cc-dots">... </span>
            <button type="button" class="cc-link" data-cc="more" aria-expanded="false">${esc(CFG.showMore)}</button></p>
        </div>
        <div class="cc-cats">
          ${CATS.map((c, i) => `
            <div class="cc-cat">
              <div class="cc-cat-head">
                <button type="button" class="cc-cat-btn" aria-expanded="false" aria-controls="cc-body-${i}">
                  <i aria-hidden="true"></i><span>${esc(c.name)}</span>
                </button>
                ${c.locked
                  ? `<span class="cc-always">${esc(CFG.alwaysActive)}</span>`
                  : `<label class="cc-switch"><input type="checkbox" data-cat="${c.id}"><i aria-hidden="true"></i><span class="sr-only">${esc(c.name)}</span></label>`}
              </div>
              <div class="cc-cat-body" id="cc-body-${i}"><div>
                <p>${esc(c.desc)}</p>
                ${c.cookies.length
                  ? c.cookies.map(([n, d, t]) => `
                    <dl class="cc-cookie">
                      <div><dt>${esc(CFG.labels.cookie)}</dt><dd>${esc(n)}</dd></div>
                      <div><dt>${esc(CFG.labels.duration)}</dt><dd>${esc(d)}</dd></div>
                      <div><dt>${esc(CFG.labels.description)}</dt><dd>${esc(t)}</dd></div>
                    </dl>`).join("")
                  : `<p class="cc-none">${esc(CFG.noCookies)}</p>`}
              </div></div>
            </div>`).join("")}
        </div>
      </div>
      <div class="cc-modal-foot">
        <button type="button" class="cc-btn cc-ghost" data-cc="reject">${esc(CFG.rejectAll)}</button>
        <button type="button" class="cc-btn cc-ghost" data-cc="save">${esc(CFG.save)}</button>
        <button type="button" class="cc-btn cc-solid" data-cc="accept">${esc(CFG.acceptAll)}</button>
      </div>
    </dialog>

    <button type="button" class="cc-revisit" data-cc="customize-open" aria-label="Gestisci cookie" hidden>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5Z"/><circle cx="8.5" cy="11" r="1"/><circle cx="12" cy="16" r="1"/><circle cx="15.5" cy="12.5" r="1"/></svg>
    </button>`;
  document.body.appendChild(root);

  const banner = root.querySelector(".cc-banner");
  const modal = root.querySelector(".cc-modal");
  const revisit = root.querySelector(".cc-revisit");
  const switches = [...root.querySelectorAll("[data-cat]")];
  let lastFocus = null;

  const setSwitches = (src) => switches.forEach((s) => (s.checked = !!(src && src[s.dataset.cat])));
  const all = (v) => Object.fromEntries(CATS.map((c) => [c.id, c.locked || v]));

  function showBanner() { banner.hidden = false; revisit.hidden = true; }
  function hideBanner() { banner.hidden = true; revisit.hidden = false; }
  function openPrefs() {
    lastFocus = document.activeElement;
    setSwitches(state);
    if (typeof modal.showModal === "function") modal.showModal(); else modal.setAttribute("open", "");
    document.documentElement.classList.add("cc-lock");
  }
  function closePrefs() {
    if (typeof modal.close === "function") modal.close(); else modal.removeAttribute("open");
    document.documentElement.classList.remove("cc-lock");
    lastFocus && lastFocus.focus && lastFocus.focus();
  }
  function decide(choice) {
    state = toState(write(choice));
    hideBanner();
    if (modal.open) closePrefs();
    emit();
  }

  root.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cc]");
    if (b) {
      switch (b.dataset.cc) {
        case "customize": case "customize-open": openPrefs(); break;
        case "close": closePrefs(); break;
        case "accept": decide(all(true)); break;
        case "reject": decide(all(false)); break;
        case "save": decide(Object.fromEntries(switches.map((s) => [s.dataset.cat, s.checked]))); break;
        case "more": {
          const more = root.querySelector(".cc-more");
          const open = more.hidden;
          more.hidden = !open;
          root.querySelector(".cc-dots").hidden = open;
          b.textContent = open ? CFG.showLess : CFG.showMore;
          b.setAttribute("aria-expanded", String(open));
          break;
        }
      }
    }
    const cb = e.target.closest(".cc-cat-btn");
    if (cb) cb.setAttribute("aria-expanded", String(cb.getAttribute("aria-expanded") !== "true"));
  });
  modal.addEventListener("close", () => document.documentElement.classList.remove("cc-lock"));
  modal.addEventListener("click", (e) => { if (e.target === modal) closePrefs(); });

  // link "Gestisci cookie" ovunque nel sito
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-cookie-settings]");
    if (t) { e.preventDefault(); openPrefs(); }
  });

  if (state) hideBanner(); else showBanner();
  if (state) setTimeout(emit, 0);

  window.ConceptConsent = {
    get: () => state,
    open: openPrefs,
    onChange: (fn) => { listeners.push(fn); if (state) fn(state); }
  };
})();
